use anchor_client::{
    solana_sdk::{pubkey::Pubkey, signature::Keypair, signer::Signer, system_program},
    Client,
};
use anyhow::Result;
use std::rc::Rc;
use std::time::Duration;
use tokio::time;

use anchor_lang::prelude::*;
use anchor_lang::InstructionData;

const AVS_ORACLE_PROGRAM_ID: &str = "6NLkSfQvmRgsbW8ywJLCbnnVh1nYTg5xfjSeM5E7YhcU";
const RESTAKING_PROGRAM_ID: &str = "G9HUZQDnpJsFHST2KG56CkmcLWHrMrBB7XNRyZ9vR51a";

pub struct OperatorRunner {
    client: Client<Rc<Keypair>>,
    operator: Rc<Keypair>,
    avs_oracle_program_id: Pubkey,
    restaking_program_id: Pubkey,
}

impl OperatorRunner {
    pub fn new(client: Client<Rc<Keypair>>, operator: Rc<Keypair>) -> Self {
        Self {
            client,
            operator,
            avs_oracle_program_id: AVS_ORACLE_PROGRAM_ID.parse().unwrap(),
            restaking_program_id: RESTAKING_PROGRAM_ID.parse().unwrap(),
        }
    }

    pub async fn run(&self, poll_interval_seconds: u64) -> Result<()> {
        println!("🚀 Starting Ozon Operator Node");
        println!("   Operator: {}", self.operator.pubkey());
        println!("   Poll Interval: {}s", poll_interval_seconds);
        println!("   Press Ctrl+C to stop\n");

        let mut interval = time::interval(Duration::from_secs(poll_interval_seconds));

        loop {
            tokio::select! {
                _ = tokio::signal::ctrl_c() => {
                    println!("\n🛑 Shutting down operator node...");
                    break;
                }
                _ = interval.tick() => {
                    if let Err(e) = self.process_tasks().await {
                        eprintln!("❌ Error processing tasks: {}", e);
                    }
                }
            }
        }

        Ok(())
    }

    async fn process_tasks(&self) -> Result<()> {
        println!("🔍 Checking for active tasks...");

        let opted_avs = self.get_opted_in_avs().await?;

        if opted_avs.is_empty() {
            println!("   ℹ️  No AVS services opted in. Use 'opt-in-avs' command first.");
            return Ok(());
        }

        println!("   ✓ Opted into {} AVS service(s)", opted_avs.len());

        for avs_owner in opted_avs {
            match self.process_avs_tasks(&avs_owner).await {
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

    async fn get_opted_in_avs(&self) -> Result<Vec<Pubkey>> {
        let restaking_program = self.client.program(self.restaking_program_id)?;

        let avs_accounts = self.get_all_avs_accounts().await?;

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

    async fn get_all_avs_accounts(&self) -> Result<Vec<Pubkey>> {
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

    async fn process_avs_tasks(&self, avs_owner: &Pubkey) -> Result<u32> {
        let oracle_program = self.client.program(self.avs_oracle_program_id)?;

        let accounts = oracle_program
            .rpc()
            .get_program_accounts(&self.avs_oracle_program_id)?;

        let mut processed = 0;

        for (task_pubkey, account) in accounts {
            if account.data.len() < 100 {
                continue;
            }

            let task_avs_bytes = &account.data[8..40];
            let task_avs = Pubkey::try_from(task_avs_bytes)?;

            let (avs_account_pda, _) = Pubkey::find_program_address(
                &[b"avs", avs_owner.as_ref()],
                &self.restaking_program_id,
            );

            if task_avs != avs_account_pda {
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
            let mut pyth_feed_id = [0u8; 32];
            pyth_feed_id.copy_from_slice(&account.data[48..80]);

            println!("   📋 Found task {} for AVS {}", task_id, avs_owner);

            match self
                .submit_task(&task_pubkey, task_id, &pyth_feed_id, avs_owner)
                .await
            {
                Ok(_) => {
                    println!("   ✅ Submitted result for task {}", task_id);
                    processed += 1;
                }
                Err(e) => {
                    eprintln!("   ❌ Failed to submit task {}: {}", task_id, e);
                }
            }
        }

        Ok(processed)
    }

    async fn submit_task(
        &self,
        task_pubkey: &Pubkey,
        _task_id: u64,
        pyth_feed_id: &[u8; 32],
        avs_owner: &Pubkey,
    ) -> Result<()> {
        let (price, confidence, publish_time) = self.fetch_pyth_price(pyth_feed_id).await?;

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

        let (task_submission, _) = Pubkey::find_program_address(
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

        let accounts = vec![
            anchor_lang::prelude::AccountMeta::new(self.operator.pubkey(), true),
            anchor_lang::prelude::AccountMeta::new(*task_pubkey, false),
            anchor_lang::prelude::AccountMeta::new(task_submission, false),
            anchor_lang::prelude::AccountMeta::new_readonly(operator_account, false),
            anchor_lang::prelude::AccountMeta::new_readonly(operator_avs_registration, false),
            anchor_lang::prelude::AccountMeta::new_readonly(restaking_program_id, false),
            anchor_lang::prelude::AccountMeta::new_readonly(system_program::ID, false),
        ];

        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.avs_oracle_program_id,
            accounts,
            data,
        };

        let sig = oracle_program
            .request()
            .instruction(ix)
            .signer(&*self.operator)
            .send()?;

        println!("      📝 Transaction: {}", sig);
        Ok(())
    }

    async fn fetch_pyth_price(&self, feed_id: &[u8; 32]) -> Result<(i64, u64, i64)> {
        let feed_id_hex = feed_id
            .iter()
            .map(|b| format!("{:02x}", b))
            .collect::<String>();

        let url = format!(
            "https://hermes.pyth.network/api/latest_price_feeds?ids[]=0x{}",
            feed_id_hex
        );

        let response: serde_json::Value = reqwest::get(&url).await?.json().await?;

        if let Some(price_feed) = response.as_array().and_then(|arr| arr.first()) {
            if let Some(price_data) = price_feed.get("price") {
                let price = price_data["price"]
                    .as_str()
                    .and_then(|s| s.parse::<i64>().ok())
                    .unwrap_or(0);
                let conf = price_data["conf"]
                    .as_str()
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0);
                let publish_time = price_data["publish_time"].as_i64().unwrap_or(0);

                return Ok((price, conf, publish_time));
            }
        }

        anyhow::bail!("Failed to parse Pyth price data")
    }
}
