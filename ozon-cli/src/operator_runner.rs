use anchor_client::{
    solana_sdk::{pubkey::Pubkey, signature::Keypair, signer::Signer, system_program},
    Client,
};
use anyhow::Result;
use std::rc::Rc;
use std::collections::HashSet;
use std::thread;
use std::time::Duration;

use anchor_lang::prelude::*;
use avs_oracle::TaskAccount;
use std::time::{SystemTime, UNIX_EPOCH};
use std::convert::TryInto;

const AVS_ORACLE_PROGRAM_ID: &str = "CmusrUV5ChdfHdTFqHuCHQW8hzqjoawd5YbDQ7km7BS7";
const RESTAKING_PROGRAM_ID: &str = "2Wvo8b4oF63csMU45z6qHCN9EZ1qV2ifBb3dwnWow6Ub";

pub struct OperatorRunner {
    client: Client<Rc<Keypair>>,
    operator: Rc<Keypair>,
    avs_oracle_program_id: Pubkey,
    restaking_program_id: Pubkey,
    ignored_expired_tasks: HashSet<Pubkey>,
}

impl OperatorRunner {
    pub fn new(client: Client<Rc<Keypair>>, operator: Rc<Keypair>) -> Self {
        Self {
            client,
            operator,
            avs_oracle_program_id: AVS_ORACLE_PROGRAM_ID.parse().unwrap(),
            restaking_program_id: RESTAKING_PROGRAM_ID.parse().unwrap(),
            ignored_expired_tasks: HashSet::new(),
        }
    }

    pub fn run(&mut self, poll_interval_seconds: u64) -> Result<()> {
        println!("🚀 Starting Ozon Operator Node");
        println!("   Operator: {}", self.operator.pubkey());
        println!("   Poll Interval: {}s", poll_interval_seconds);
        println!("   Press Ctrl+C to stop (Ctrl+C to quit)\n");

        loop {
            if let Err(e) = self.process_tasks() {
                eprintln!("❌ Error processing tasks: {}", e);
            }
            thread::sleep(Duration::from_secs(poll_interval_seconds));
        }
    }

    fn process_tasks(&mut self) -> Result<()> {
        println!("🔍 Checking for active tasks...");

        let opted_avs = self.get_opted_in_avs()?;

        if opted_avs.is_empty() {
            println!("   ℹ️  No AVS services opted in. Use 'opt-in-avs' command first.");
            return Ok(());
        }

        println!("   ✓ Opted into {} AVS service(s)", opted_avs.len());

        for avs_owner in opted_avs {
            match self.process_avs_tasks(&avs_owner) {
                Ok(count) => {
                    if count > 0 {
                        println!("   ✓ Processed {} task(s) for AVS {}", count, avs_owner);
                    }
                }
                Err(e) => {
                    eprintln!("   ❌ Error processing AVS {}: {}", avs_owner, e);
                }
            }
        }

        Ok(())
    }

    fn get_opted_in_avs(&self) -> Result<Vec<Pubkey>> {
        let restaking_program = self.client.program(self.restaking_program_id)?;

        let avs_accounts = self.get_all_avs_accounts()?;

        let mut opted_avs = Vec::new();

        for avs_owner in avs_accounts {
            let (operator_avs_reg, _) = Pubkey::find_program_address(
                &[
                    b"operator_avs",
                    self.operator.pubkey().as_ref(),
                    avs_owner.as_ref(),
                ],
                &self.restaking_program_id,
            );

            if let Ok(account_data) = restaking_program.rpc().get_account_data(&operator_avs_reg) {
                if !account_data.is_empty() {
                    opted_avs.push(avs_owner);
                }
            }
        }

        Ok(opted_avs)
    }

    fn get_all_avs_accounts(&self) -> Result<Vec<Pubkey>> {
        let restaking_program = self.client.program(self.restaking_program_id)?;
        let accounts = restaking_program
            .rpc()
            .get_program_accounts(&self.restaking_program_id)?;

        let mut avs_owners = Vec::new();

        for (_pubkey, account) in accounts {
            if account.data.len() > 40 {
                let owner_bytes = &account.data[8..40];
                if let Ok(owner) = Pubkey::try_from(owner_bytes) {
                    avs_owners.push(owner);
                }
            }
        }

        Ok(avs_owners)
    }

    fn process_avs_tasks(&mut self, avs_owner: &Pubkey) -> Result<u32> {
        let oracle_program = self.client.program(self.avs_oracle_program_id)?;

        let accounts = oracle_program
            .rpc()
            .get_program_accounts(&self.avs_oracle_program_id)?;

        let mut processed = 0;

        // Anchor discriminator for TaskAccount
        let task_disc = TaskAccount::DISCRIMINATOR;

        for (task_pubkey, account) in accounts {
            // Skip tasks we've already marked as expired
            if self.ignored_expired_tasks.contains(&task_pubkey) {
                continue;
            }
            // Ensure it's a TaskAccount by discriminator
            if account.data.len() < 8 {
                continue;
            }
            let disc: [u8; 8] = account.data[0..8].try_into()?;
            if disc != task_disc {
                continue;
            }

            let task_avs_bytes = &account.data[8..40];
            let task_avs = Pubkey::try_from(task_avs_bytes)?;

            // Task stores the AVS OWNER pubkey, not the AVS PDA
            if task_avs != *avs_owner {
                continue;
            }

            let (submission_pda, _) = Pubkey::find_program_address(
                &[
                    b"submission",
                    task_pubkey.as_ref(),
                    self.operator.pubkey().as_ref(),
                ],
                &self.avs_oracle_program_id,
            );

            if oracle_program
                .rpc()
                .get_account_data(&submission_pda)
                .is_ok()
            {
                continue;
            }

            let task_id = u64::from_le_bytes(account.data[40..48].try_into()?);

            println!("   📋 Found task {} for AVS {}", task_id, avs_owner);

            match self.submit_task(&task_pubkey, task_id, avs_owner) {
                Ok(_) => {
                    println!("   ✅ Submitted result for task {}", task_id);
                    processed += 1;
                }
                Err(e) => {
                    let err_str = format!("{}", e);
                    if err_str.contains("TaskExpired") || err_str.contains("0x1770") {
                        println!("   ⏭️  Task {} expired; ignoring future attempts for {}", task_id, task_pubkey);
                        // Remember to ignore this task in future iterations
                        self.ignored_expired_tasks.insert(task_pubkey);
                    } else {
                        eprintln!("   ❌ Failed to submit task {}: {}", task_id, err_str);
                    }
                }
            }
        }

        Ok(processed)
    }

    fn submit_task(
        &self,
        task_pubkey: &Pubkey,
        _task_id: u64,
        avs_owner: &Pubkey,
    ) -> Result<()> {
        let (price, confidence, publish_time) = self.fetch_demo_price()?;

        println!("      💰 Price: {}, Confidence: {}", price, confidence);

        let oracle_program = self.client.program(self.avs_oracle_program_id)?;
        let restaking_program_id = self.restaking_program_id;

        let (operator_account, _) = Pubkey::find_program_address(
            &[b"operator", self.operator.pubkey().as_ref()],
            &restaking_program_id,
        );

        let (operator_avs_registration, _) = Pubkey::find_program_address(
            &[
                b"operator_avs",
                self.operator.pubkey().as_ref(),
                avs_owner.as_ref(),
            ],
            &restaking_program_id,
        );

        // Debug: print operator account PDA and owner on chain
        if let Ok(op_acc) = oracle_program.rpc().get_account(&operator_account) {
            println!(
                "      🔎 Operator PDA: {} | Owner on-chain: {} | Expected owner (restaking): {}",
                operator_account,
                op_acc.owner,
                restaking_program_id
            );
        } else {
            println!(
                "      🔎 Operator PDA: {} | Owner on-chain: <missing> | Expected owner (restaking): {}",
                operator_account,
                restaking_program_id
            );
        }

        let (submission_pda, _) = Pubkey::find_program_address(
            &[
                b"submission",
                task_pubkey.as_ref(),
                self.operator.pubkey().as_ref(),
            ],
            &self.avs_oracle_program_id,
        );

        #[derive(AnchorSerialize)]
        struct SubmitTaskResultArgs {
            submitted_price: i64,
            confidence: u64,
            publish_time: i64,
        }

        let args = SubmitTaskResultArgs {
            submitted_price: price,
            confidence,
            publish_time,
        };

        let discriminator = {
            use anchor_lang::Discriminator;
            avs_oracle::instruction::SubmitTaskResult::DISCRIMINATOR
        };

        let mut data = discriminator.to_vec();
        data.extend_from_slice(&args.try_to_vec()?);

        // Accounts must match SubmitTaskResult<'info> ordering:
        // operator (signer), task_account (mut), task_submission (init, mut),
        // operator_account, operator_avs_registration, restaking_program, system_program
        let accounts = vec![
            anchor_lang::prelude::AccountMeta::new_readonly(self.operator.pubkey(), true),
            anchor_lang::prelude::AccountMeta::new(*task_pubkey, false),
            anchor_lang::prelude::AccountMeta::new(submission_pda, false),
            anchor_lang::prelude::AccountMeta::new(operator_account, false),
            anchor_lang::prelude::AccountMeta::new(operator_avs_registration, false),
            anchor_lang::prelude::AccountMeta::new_readonly(self.restaking_program_id, false),
            anchor_lang::prelude::AccountMeta::new_readonly(system_program::id(), false),
        ];

        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.avs_oracle_program_id,
            accounts,
            data,
        };

        let sig = oracle_program
            .request()
            .payer(self.operator.clone())
            .instruction(ix)
            .signer(&*self.operator)
            .send()?;

        println!("      📝 Transaction: {}", sig);
        Ok(())
    }

    fn fetch_demo_price(&self) -> Result<(i64, u64, i64)> {
        // Simple demo fetch from Binance BTCUSDT ticker
        // You can change the symbol or source as needed
        let url = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";
        let resp: serde_json::Value = reqwest::blocking::get(url)?.json()?;
        let price_str = resp["price"].as_str().ok_or_else(|| anyhow::anyhow!("bad price"))?;
        let price_f: f64 = price_str.parse()?;
        let price_i64: i64 = (price_f * 1e8).round() as i64; // 8-decimal fixed-point
        let conf: u64 = 0;
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs() as i64;
        Ok((price_i64, conf, now))
    }
}
