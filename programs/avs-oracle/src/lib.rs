use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;
use restaking_programs::cpi::accounts::SlashOperator;
use restaking_programs::program::RestakingPrograms;
use restaking_programs::{OperatorAccount, OperatorVault, RewardTreasury};

declare_id!("HaTaUi4UhuLt9MzjW2Avss9WdxKJjsoFU6MX7BoiAdAa");

#[program]
pub mod avs_oracle {
    use super::*;

    pub fn create_task(
        ctx: Context<CreateTask>,
        task_id: u64,
        pyth_price_feed_id: [u8; 32],
        submission_deadline_slots: u64,
        verification_threshold_bps: u64,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task_account;
        let current_slot = Clock::get()?.slot;

        task.avs = ctx.accounts.avs_owner.key();
        task.task_id = task_id;
        task.pyth_feed_id = pyth_price_feed_id;
        task.submission_deadline = current_slot + submission_deadline_slots;
        task.verification_threshold_bps = verification_threshold_bps;
        task.created_slot = current_slot;
        task.total_submissions = 0;
        task.verified_submissions = 0;
        task.active = true;
        task.bump = ctx.bumps.task_account;

        emit!(TaskCreatedEvent {
            task_id,
            avs: task.avs,
            pyth_feed_id: task.pyth_feed_id,
            deadline: task.submission_deadline,
            threshold_bps: verification_threshold_bps,
        });

        msg!(
            "TASK CREATED WITH VALUES: Task {} created by AVS {}",
            task_id,
            task.avs
        );

        Ok(())
    }

    pub fn submit_task_result(
        ctx: Context<SubmitTaskResult>,
        submitted_price: i64,
        confidence: u64,
        publish_time: i64,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task_account;
        let submission = &mut ctx.accounts.task_submission;
        let operator_account = &ctx.accounts.operator_account;
        let operator_avs_reg = &ctx.accounts.operator_avs_registration;

        let current_slot = Clock::get()?.slot;
        require!(
            current_slot <= task.submission_deadline,
            ErrorCode::TaskExpired
        );

        require!(task.active, ErrorCode::TaskNotActive);
        require!(operator_account.active, ErrorCode::OperatorNotActive);
        require!(operator_avs_reg.active, ErrorCode::OperatorNotOptedIn);
        require!(
            operator_account.bond_amount >= 1_000_000_000,
            ErrorCode::InsufficientBond
        );
        require!(
            operator_avs_reg.tasks_failed < 5,
            ErrorCode::TooManyFailures
        );

        submission.task = task.key();
        submission.operator = ctx.accounts.operator.key();
        submission.submitted_price = submitted_price;
        submission.confidence = confidence;
        submission.publish_time = publish_time;
        submission.submitted_slot = current_slot;
        submission.verified = false;
        submission.is_correct = false;
        submission.bump = ctx.bumps.task_submission;

        task.total_submissions = task.total_submissions.checked_add(1).unwrap();

        emit!(TaskSubmittedEvent {
            task_id: task.task_id,
            operator: submission.operator,
            submitted_price,
            submitted_slot: current_slot
        });

        msg!(
            "SUBMISSION OF TASK DONE: Operator {} submitted result for task {}",
            submission.operator,
            task.task_id
        );

        Ok(())
    }

    pub fn verify_and_slash_if_wrong(
        ctx: Context<VerifyAndSlashIfWrong>,
        operator_owner: Pubkey,
        maximum_age: u64,
    ) -> Result<()> {
        let task = &mut ctx.accounts.task_account;
        let submission = &mut ctx.accounts.task_submission;

        require!(!submission.verified, ErrorCode::AlreadyVerified);

        let price_update = &ctx.accounts.price_update;
        let clock = Clock::get()?;

        let price_data =
            price_update.get_price_no_older_than(&clock, maximum_age, &task.pyth_feed_id)?;

        let pyth_price = price_data.price;
        let pyth_conf = price_data.conf;
        let submitted_price = submission.submitted_price;

        let diff = (pyth_price - submitted_price).abs();
        let threshold = (pyth_price.abs() as u64)
            .checked_mul(task.verification_threshold_bps)
            .unwrap()
            .checked_div(10000)
            .unwrap() as i64;

        let is_correct = diff <= threshold;

        submission.verified = true;
        submission.is_correct = is_correct;
        submission.actual_pyth_price = pyth_price;
        submission.actual_pyth_conf = pyth_conf;

        task.verified_submissions = task.verified_submissions.checked_add(1).unwrap();

        if !is_correct {
            msg!("Operator wrong! Slashing via CPI...");

            let operator_account = &ctx.accounts.operator_account;
            let slash_amount = operator_account.bond_amount / 10;

            let cpi_program = ctx.accounts.restaking_program.to_account_info();
            let cpi_accounts = SlashOperator {
                authority: ctx.accounts.avs_authority.to_account_info(),
                operator_account: ctx.accounts.operator_account.to_account_info(),
                vault: ctx.accounts.operator_vault.to_account_info(),
                treasury: ctx.accounts.treasury.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };

            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

            restaking_programs::cpi::slash_operator(cpi_ctx, operator_owner, slash_amount)?;

            msg!(
                "Operator slashed {} lamports and rewards channeled to impact treasury",
                slash_amount
            );
        } else {
            msg!("Operator correct!");
        }

        emit!(SubmissionVerifiedEvent {
            task_id: task.task_id,
            operator: submission.operator,
            is_correct,
            submitted_price,
            actual_price: pyth_price,
            difference: diff,
        });

        Ok(())
    }

    pub fn close_task(ctx: Context<CloseTask>) -> Result<()> {
        let task = &mut ctx.accounts.task_account;

        let current_slot = Clock::get()?.slot;
        require!(
            current_slot > task.submission_deadline,
            ErrorCode::TaskStillActive
        );

        task.active = false;

        msg!(
            "Task {} closed. Submissions: {}, Verified: {}",
            task.task_id,
            task.total_submissions,
            task.verified_submissions
        );

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(task_id: u64)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub avs_owner: Signer<'info>,

    #[account(
        init,
        payer = avs_owner,
        space = 8 + TaskAccount::INIT_SPACE,
        seeds = [b"task", avs_owner.key().as_ref(), task_id.to_le_bytes().as_ref()], 
        bump
    )]
    pub task_account: Account<'info, TaskAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitTaskResult<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,

    #[account(mut)]
    pub task_account: Account<'info, TaskAccount>,

    #[account(
        init,
        payer = operator,
        space = 8 + TaskSubmission::INIT_SPACE,
        seeds = [b"submission", task_account.key().as_ref(), operator.key().as_ref()],  
        bump
    )]
    pub task_submission: Account<'info, TaskSubmission>,

    #[account(
        seeds = [b"operator", operator.key().as_ref()],
        bump = operator_account.bump,
        seeds::program = restaking_program.key(),
        constraint = operator_account.active @ ErrorCode::OperatorNotActive,
        constraint = operator_account.owner == operator.key() @ ErrorCode::Unauthorized
    )]
    pub operator_account: Account<'info, restaking_programs::OperatorAccount>,

    #[account(
        seeds = [
            b"operator_avs",
            operator.key().as_ref(),
            task_account.avs.as_ref()
        ],
        bump = operator_avs_registration.bump,
        seeds::program = restaking_program.key(),
        constraint = operator_avs_registration.active @ ErrorCode::OperatorNotOptedIn
    )]
    pub operator_avs_registration: Account<'info, restaking_programs::OperatorAvsRegistration>,

    pub restaking_program: Program<'info, restaking_programs::program::RestakingPrograms>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(operator_owner: Pubkey)]
pub struct VerifyAndSlashIfWrong<'info> {
    #[account(mut)]
    pub avs_authority: Signer<'info>,

    pub task_account: Account<'info, TaskAccount>,

    #[account(
        mut,
        seeds = [b"submission", task_account.key().as_ref(), task_submission.operator.as_ref()],
        bump = task_submission.bump
    )]
    pub task_submission: Account<'info, TaskSubmission>,

    pub price_update: Account<'info, PriceUpdateV2>,

    pub restaking_program: Program<'info, RestakingPrograms>,

    #[account(
        mut,
        seeds = [b"operator", operator_owner.as_ref()],
        bump = operator_account.bump,
        seeds::program = restaking_program.key()
    )]
    pub operator_account: Account<'info, OperatorAccount>,

    #[account(
        mut,
        seeds = [b"vault", operator_owner.as_ref()],
        bump = operator_account.vault_bump,
        seeds::program = restaking_program.key()
    )]
    pub operator_vault: Account<'info, OperatorVault>,

    #[account(
        mut,
        seeds = [b"reward_treasury"],
        bump = treasury.bump,
        seeds::program = restaking_program.key()
    )]
    pub treasury: Account<'info, RewardTreasury>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseTask<'info> {
    #[account(mut)]
    pub avs_owner: Signer<'info>,

    #[account(
        mut,
        constraint = task_account.avs == avs_owner.key() @ ErrorCode::Unauthorized
    )]
    pub task_account: Account<'info, TaskAccount>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct TaskAccount {
    pub avs: Pubkey,
    pub task_id: u64,
    pub pyth_feed_id: [u8; 32],
    pub submission_deadline: u64,
    pub verification_threshold_bps: u64,
    pub created_slot: u64,
    pub total_submissions: u32,
    pub verified_submissions: u32,
    pub active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct TaskSubmission {
    pub task: Pubkey,
    pub operator: Pubkey,
    pub submitted_price: i64,
    pub confidence: u64,
    pub publish_time: i64,
    pub submitted_slot: u64,
    pub verified: bool,
    pub is_correct: bool,
    pub actual_pyth_price: i64,
    pub actual_pyth_conf: u64,
    pub bump: u8,
}

#[event]
pub struct TaskCreatedEvent {
    pub task_id: u64,
    pub avs: Pubkey,
    pub pyth_feed_id: [u8; 32],
    pub deadline: u64,
    pub threshold_bps: u64,
}

#[event]
pub struct TaskSubmittedEvent {
    pub task_id: u64,
    pub operator: Pubkey,
    pub submitted_price: i64,
    pub submitted_slot: u64,
}

#[event]
pub struct SubmissionVerifiedEvent {
    pub task_id: u64,
    pub operator: Pubkey,
    pub is_correct: bool,
    pub submitted_price: i64,
    pub actual_price: i64,
    pub difference: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Task submission deadline has passed")]
    TaskExpired,

    #[msg("Task is not active")]
    TaskNotActive,

    #[msg("Submission already verified")]
    AlreadyVerified,

    #[msg("Task is still active, cannot close yet")]
    TaskStillActive,

    #[msg("Unauthorized action")]
    Unauthorized,

    #[msg("Invalid Pyth price data")]
    InvalidPythPrice,

    #[msg("Operator is not active")]
    OperatorNotActive,

    #[msg("Operator has not opted into this AVS")]
    OperatorNotOptedIn,

    #[msg("Operator has insufficient bond")]
    InsufficientBond,

    #[msg("Operator has too many failed tasks")]
    TooManyFailures,
}
