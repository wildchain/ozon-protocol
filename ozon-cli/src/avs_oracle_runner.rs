use anchor_client::{
    solana_sdk::{
        instruction::AccountMeta, pubkey::Pubkey, signature::Keypair, signer::Signer,
        system_program,
    },
    Client,
};
use anchor_lang::prelude::*;
use anyhow::Result;
use sha2::{Digest, Sha256};
use std::rc::Rc;

pub const AVS_ORACLE_PROGRAM_ID: &str = "CZ7rZR4r4G5DZZmLyPzzehrNY9SwvX9xQzFW8ffFQoak";

pub struct AvsOracleRunner {
    client: Client<Rc<Keypair>>,
    operator: Rc<Keypair>,
    avs_oracle_program_id: Pubkey,
}

impl AvsOracleRunner {
    pub fn new(client: Client<Rc<Keypair>>, operator: Rc<Keypair>) -> Self {
        Self {
            client,
            operator,
            avs_oracle_program_id: AVS_ORACLE_PROGRAM_ID.parse().unwrap(),
        }
    }

    pub fn create_task(
        &self,
        avs_owner: Pubkey,
        task_id: u64,
        pyth_feed_id: [u8; 32],
        submission_deadline_slots: u64,
        threshold_bps: u64,
    ) -> Result<()> {
        let program = self.client.program(self.avs_oracle_program_id)?;
        let (task_account, _) = Pubkey::find_program_address(
            &[b"task", avs_owner.as_ref(), &task_id.to_le_bytes()],
            &self.avs_oracle_program_id,
        );

        let sig = program
            .request()
            .accounts(avss_oracle::accounts::CreateTask {
                avs_owner,
                task_account,
                system_program: system_program::ID,
            })
            .args(avs_oracle::instruction::CreateTask {
                task_id,
                pyth_price_feed_id: pyth_feed_id,
                submission_deadline_slots,
                verification_threshold_bps: threshold_bps,
            })
            .signer(&*self.operator)
            .send()?;

        println!("✅ Task {} created: {}", task_id, sig);
        Ok(())
    }

    pub fn verify_task(
        &self,
        avs_authority: Pubkey,
        operator_owner: Pubkey,
        task_pubkey: Pubkey,
    ) -> Result<()> {
        let program = self.client.program(self.avs_oracle_program_id)?;

        // TODO: fetch the submission and pyth price account dynamically
        println!("🔍 Verifying task: {}", task_pubkey);

        // here you’d wire up the same logic as your on-chain verify_and_slash_if_wrong
        // passing in submission, price_update, operator account PDAs etc.

        Ok(())
    }
}
