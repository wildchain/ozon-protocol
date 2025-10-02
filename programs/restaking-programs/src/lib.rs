use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("Ba85dhVQP6y63iw2A892iEmyfbY4eaEwiMd8UkKCMgEQ");

#[program]
pub mod staking {
    use super::*;

    pub fn initialize_state_account(
        ctx: Context<InitializeStateAccount>,
        msol_mint: Pubkey,
        jitoSol_mint: Pubkey,
        rm_sol_mint: Pubkey,
        rjito_sol_mint: Pubkey,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.msol_mint = msol_mint;
        state.jitosol_mint = jitoSol_mint;
        state.rm_sol_mint = rm_sol_mint;
        state.rjito_sol_mint = rjito_sol_mint;
        state.bump = ctx.bumps.state;
        Ok(())
    }

    pub fn initialize_vault_account(
        ctx: Context<InitializeVault>,
        token_mint: Pubkey,
    ) -> Result<()> {
        let vault_account = &mut ctx.accounts.vault_account;
        vault_account.token_mint = token_mint;
        vault_account.vault = ctx.accounts.vault.key();
        // Fix: Access bump directly as a field
        vault_account.bump = ctx.bumps.vault_account;
        vault_account.total_deposited = 0;
        Ok(())
    }

    pub fn initialize_mint_account(
        ctx: Context<InitializeMintAccount>,
        base_mint: Pubkey,
        restaked_mint: Pubkey,
    ) -> Result<()> {
        let mint_account = &mut ctx.accounts.mint_account;
        let vault_account = &ctx.accounts.vault_account;

        mint_account.base_mint = base_mint;
        mint_account.restaked_mint = restaked_mint;
        mint_account.vault = vault_account.key();
        // Fix: Access bump directly as a field
        mint_account.bump = ctx.bumps.mint_account;
        mint_account.total_minted = 0;
        mint_account.exchange_rate = 1_000_000_000;
        mint_account.last_update_slot = Clock::get()?.slot;

        Ok(())
    }

    pub fn restake(ctx: Context<Restake>, amount: u64) -> Result<()> {
        let vault_account = &mut ctx.accounts.vault_account;
        let mint_account = &mut ctx.accounts.mint_account;
        let user_account = &mut ctx.accounts.user_restaking_account;

        user_account.bump = ctx.bumps.user_restaking_account;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_base_token.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        let restaked_amount = amount
            .checked_mul(1_000_000_000) // scale factor
            .unwrap()
            .checked_div(mint_account.exchange_rate)
            .unwrap();

        let seeds = &[
            b"mint_account",
            mint_account.base_mint.as_ref(),
            &[mint_account.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx_mint = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.restaked_mint.to_account_info(),
                to: ctx.accounts.user_restaked_token.to_account_info(),
                authority: mint_account.to_account_info(),
            },
            signer,
        );
        token::mint_to(cpi_ctx_mint, restaked_amount)?;

        vault_account.total_deposited = vault_account.total_deposited.checked_add(amount).unwrap();

        mint_account.total_minted = mint_account
            .total_minted
            .checked_add(restaked_amount)
            .unwrap();

        user_account.user = ctx.accounts.user.key();
        user_account.deposited_mint = mint_account.base_mint;
        user_account.restaked_mint = mint_account.restaked_mint;

        user_account.deposited_amount = user_account.deposited_amount.checked_add(amount).unwrap();

        user_account.restaked_amount = user_account
            .restaked_amount
            .checked_add(restaked_amount)
            .unwrap();

        Ok(())
    }

    pub fn request_unstake(ctx: Context<RequestUnstake>, restaked_amount: u64) -> Result<()> {
        let user_account = &mut ctx.accounts.user_restaking_account;
        let _mint_account = &ctx.accounts.mint_account;

        let cpi_ctx_burn = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.restaked_mint.to_account_info(),
                from: ctx.accounts.user_restaked_token.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::burn(cpi_ctx_burn, restaked_amount)?;

        user_account.pending_unstake = restaked_amount;
        user_account.cooldown_end_slot = Clock::get()?.slot + 500; // e.g. 500 slots (30 secs for demo)

        Ok(())
    }

  pub fn claim_unstake(ctx: Context<ClaimUnstake>) -> Result<()> {
        let vault_account = &mut ctx.accounts.vault_account;
        let mint_account = &mut ctx.accounts.mint_account;
        let user_account = &mut ctx.accounts.user_restaking_account;

        let current_slot = Clock::get()?.slot;
        require!(
            current_slot >= user_account.cooldown_end_slot,
            CustomError::CooldownNotFinished
        );

        let restaked_amount = user_account.pending_unstake;
        require!(restaked_amount > 0, CustomError::NothingToClaim);

        let base_amount = restaked_amount
            .checked_mul(mint_account.exchange_rate)
            .unwrap()
            .checked_div(1_000_000_000)
            .unwrap();

        let fee = base_amount / 1000;
        let withdraw_amount = base_amount.checked_sub(fee).unwrap();

        let seeds = &[
            b"vault_account",
            mint_account.base_mint.as_ref(),
            &[vault_account.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx_transfer = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user_base_token.to_account_info(),
                authority: vault_account.to_account_info(),
            },
            signer,
        );
        anchor_spl::token::transfer(cpi_ctx_transfer, withdraw_amount)?;

        vault_account.total_deposited = vault_account
            .total_deposited
            .checked_sub(base_amount)
            .unwrap();
        mint_account.total_minted = mint_account
            .total_minted
            .checked_sub(restaked_amount)
            .unwrap();
        user_account.pending_unstake = 0;

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
            let user_account = &mut ctx.accounts.user_restaking_account;
            let treasury = &mut ctx.accounts.treasury;

            let current_slot = Clock::get()?.slot;

           
            let elapsed_slots = current_slot
                .checked_sub(user_account.last_claimed_slot)
                .unwrap();

            require!(elapsed_slots > 0, CustomError::NothingToClaim);

            // Simple reward model: 1 lamport per slot per staked token
            let reward_rate: u64 = 1; // can adjust for demo
            let rewards = elapsed_slots
                .checked_mul(user_account.restaked_amount)
                .unwrap()
                .checked_mul(reward_rate)
                .unwrap();

            require!(
                **treasury.to_account_info().lamports.borrow() >= rewards,
                CustomError::InsufficientTreasuryBalance
            );

            **treasury.to_account_info().try_borrow_mut_lamports()? -= rewards;
            **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += rewards;

      
            user_account.last_claimed_slot = current_slot;

            Ok(())
         }



    pub fn initialize_operator(ctx: Context<RegisterOperator>, bond_amount:u64 , metadata:String)->Result<()>{
        let operator_account = &mut ctx.accounts.operator_account;

        require!(bond_amount >= 20000000000, CustomError::NotEnoughToken);

        operator_account.owner = ctx.accounts.operator_key.key();
        operator_account.bond_amount = bond_amount;
        operator_account.metadata = metadata;
        operator_account.active = true ;
        operator_account.avs_count = 0;
        operator_account.bump = ctx.bumps.operator_account;

        **ctx.accounts.operator_key.to_account_info().try_borrow_mut_lamports()? -= bond_amount;
        **ctx.accounts.operator_account.to_account_info().try_borrow_mut_lamports()?+= bond_amount;
        Ok(())
    }

    pub fn update_operator_metadata( ctx: Context<UpdateOperatorMetadata>, metadata : String)->Result<()>{

        let operator_account = &mut ctx.accounts.operator_account;
        require!(operator_account.owner== ctx.accounts.owner.key(), CustomError::Unauthorized);

        operator_account.metadata = metadata;

        Ok(())
    }

    pub fn de_register_operator(ctx: Context<DeRegisterOperator>)->Result<()>{
        let operator_account = &mut ctx.accounts.operator_account;
        require!(operator_account.owner == ctx.accounts.operator_key.key(), CustomError::Unauthorized);

        let bond_amount = operator_account.bond_amount;
        operator_account.active = false;
        **ctx.accounts.operator_key.to_account_info().try_borrow_mut_lamports()? += operator_account.bond_amount;
        **ctx.accounts.operator_account.to_account_info().try_borrow_mut_lamports()? -= operator_account.bond_amount;
      
        Ok(())
    }

    pub fn slash_operator(ctx: Context<SlashOperator>, amount: u64)->Result<()>{

        let operator_account = &mut ctx.accounts.operator_account;

        require!(operator_account.bond_amount>= amount, CustomError::InsufficientBond);

        operator_account.bond_amount-= amount;

        **ctx.accounts.operator_account.to_account_info().try_borrow_mut_lamports()?-= amount;
        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? += amount;
        Ok(())
    }

    pub fn initialize_reward_treasury(ctx: Context<InitializeRewardTreasury>) -> Result<()> {
       let treasury = &mut ctx.accounts.treasury;
       treasury.authority = ctx.accounts.authority.key();
       treasury.bump = ctx.bumps.treasury;
       treasury.total_rewards_distributed = 0;
       Ok(())
   }
}

#[derive(Accounts)]
pub struct InitializeStateAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + StateAccount::INIT_SPACE,
        seeds = [b"state"],
        bump
    )]
    pub state: Account<'info, StateAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(token_mint: Pubkey)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + VaultAccount::INIT_SPACE,
        seeds = [b"vault_account", token_mint.key().as_ref()],
        bump
    )]
    pub vault_account: Account<'info, VaultAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = token_mint,
        token::authority = vault_account,
        seeds = [b"vault_token", token_mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(base_mint: Pubkey, restaked_mint: Pubkey)]
pub struct InitializeMintAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + MintAccount::INIT_SPACE,
        seeds = [b"mint_account", base_mint.key().as_ref()],
        bump
    )]
    pub mint_account: Account<'info, MintAccount>,

    #[account(mut)]
    pub vault_account: Account<'info, VaultAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Restake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_base_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault_account", mint_account.base_mint.as_ref()],
        bump = vault_account.bump
    )]
    pub vault_account: Account<'info, VaultAccount>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"mint_account", mint_account.base_mint.as_ref()],
        bump = mint_account.bump
    )]
    pub mint_account: Account<'info, MintAccount>,

    #[account(mut)]
    pub restaked_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user_restaked_token: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserRestakingAccount::INIT_SPACE,
        seeds = [b"user_restaking", user.key().as_ref(), mint_account.restaked_mint.as_ref()],
        bump
    )]
    pub user_restaking_account: Account<'info, UserRestakingAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct Unstake<'info>{

//     #[account(mut)]
//     pub user : Singer<'info>,

//     #[account(mut)]
//     pub user_restaked_token: InterfaceAccount<'info, TokenAccount>,

//     #[account(mut)]
//     pub restaked_mint: InterfaceAccount<'info, Mint>,

//     #[account(mut)]
//     pub user_base_token: InterfaceAccount<'info, TokenAccount>,

//     #[account(mut)]
//     pub vault_account : Account<'info , VaultAccount>,

//     #[account(mut)]
//     pub vault : InterfaceAccount<'info , TokenAccount>,

//     #[account(mut)]
//     pub mint_account: Account<'info, MintAccount>,

//     pub token_program: Program<'info, Token>,

// }

#[derive(Accounts)]
pub struct RequestUnstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_restaked_token.owner == user.key(),
        constraint = user_restaked_token.mint == mint_account.restaked_mint
    )]
    pub user_restaked_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_restaking_account.user == user.key(),
        constraint = user_restaking_account.restaked_mint == mint_account.restaked_mint
    )]
    pub user_restaking_account: Account<'info, UserRestakingAccount>,

    #[account(mut)]
    pub restaked_mint: Account<'info, Mint>,

    #[account(mut)]
    pub mint_account: Account<'info, MintAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimUnstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_base_token.owner == user.key(),
        constraint = user_base_token.mint == mint_account.base_mint
    )]
    pub user_base_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_restaking_account.user == user.key(),
        constraint = user_restaking_account.restaked_mint == mint_account.restaked_mint
    )]
    pub user_restaking_account: Account<'info, UserRestakingAccount>,

    #[account(mut)]
    pub vault_account: Account<'info, VaultAccount>,

    #[account(
        mut,
        constraint = vault.mint == mint_account.base_mint
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub mint_account: Account<'info, MintAccount>,

    pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]
pub struct RegisterOperator<'info>{

    #[account(mut)]
    pub operator_key: Signer<'info>,

    #[account(
        init , 
        payer = operator_key,
        space = 8 + OperatorAccount::INIT_SPACE,
        seeds = [b"operator", operator_key.key().as_ref()],
        bump
    )]
    pub operator_account: Account<'info, OperatorAccount>,

    pub system_program: Program<'info , System>,
}

#[derive(Accounts)]
pub struct UpdateOperatorMetadata<'info>{
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut ,
        seeds = [b"operator", owner.key().as_ref()],
        bump = operator_account.bump,
        has_one = owner @ CustomError::Unauthorized
    )]
    pub operator_account: Account<'info , OperatorAccount>
}

#[derive(Accounts)]
pub struct DeRegisterOperator<'info>{

    #[account(mut)]
    pub operator_key: Signer<'info>,

    #[account(
        mut ,
        seeds = [b"operator", operator_key.key().as_ref()],
        bump = operator_account.bump,
        close = operator_key
    )]
    pub operator_account: Account<'info , OperatorAccount>

}

#[derive(Accounts)]
pub struct SlashOperator<'info>{

    #[account(mut)]
    pub operator_account : Account<'info , OperatorAccount>,

    #[account(
        mut,
        seeds = [b"reward_treasury"],
        bump = treasury.bump
    )]
    pub treasury : Account<'info, RewardTreasury>
}

#[derive(Accounts)]
pub struct InitializeRewardTreasury<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + RewardTreasury::INIT_SPACE,
        seeds = [b"reward_treasury"],
        bump
    )]
    pub treasury: Account<'info, RewardTreasury>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = user_restaking_account.user == user.key()
    )]
    pub user_restaking_account: Account<'info, UserRestakingAccount>,

    #[account(
        mut,
        seeds = [b"reward_treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, RewardTreasury>,
}


#[account]
#[derive(InitSpace, Debug)]
pub struct StateAccount {
    pub authority: Pubkey,
    pub msol_mint: Pubkey,
    pub jitosol_mint: Pubkey,
    pub rm_sol_mint: Pubkey,
    pub rjito_sol_mint: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct VaultAccount {
    pub token_mint: Pubkey,
    pub vault: Pubkey,
    pub bump: u8,
    pub total_deposited: u64,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct MintAccount {
    pub base_mint: Pubkey,
    pub restaked_mint: Pubkey,
    pub vault: Pubkey,
    pub bump: u8,
    pub total_minted: u64,
    pub exchange_rate: u64,
    pub last_update_slot: u64,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct UserRestakingAccount {
    pub user: Pubkey,
    pub deposited_mint: Pubkey,
    pub restaked_mint: Pubkey,
    pub deposited_amount: u64,
    pub restaked_amount: u64,
    pub bump: u8,
    pub cooldown_end_slot: u64,
    pub pending_unstake: u64,
    pub reward_debt: u64,
    pub last_claimed_slot: u64,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct OperatorAccount{
    pub owner: Pubkey,
    pub bond_amount : u64,
    #[max_len(100)]
    pub metadata: String ,
    pub active : bool,
    pub avs_count: u32,
    pub bump:u8
}


#[account]
#[derive(InitSpace, Debug)]
pub struct RewardTreasury {
    pub authority: Pubkey,
    pub bump: u8,
    pub total_rewards_distributed: u64,
}


#[error_code]
pub enum CustomError {
    #[msg("Cooldown not finished yet")]
    CooldownNotFinished,
    #[msg("No pending unstake to claim")]
    NothingToClaim,
    #[msg("Not enough tokens supplied")]
    NotEnoughToken,
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Insufficient bond to slash")]
    InsufficientBond,
    #[msg("Not enough lamports in treasury")]
    InsufficientTreasuryBalance,
}
