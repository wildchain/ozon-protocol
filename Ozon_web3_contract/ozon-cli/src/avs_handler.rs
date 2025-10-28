use anchor_client::solana_sdk::pubkey::Pubkey;
use anyhow::Result;
use async_trait::async_trait;

#[derive(Debug, Clone)]
pub struct GenericTask {
    pub task_pubkey: Pubkey,
    pub task_id: u64,
    pub avs_owner: Pubkey,
    pub deadline_slot: u64,
    pub task_data: Vec<u8>,
}

#[derive(Debug, Clone)]
pub struct GenericSubmission {
    pub task_pubkey: Pubkey,
    pub operator: Pubkey,
    pub submission_data: Vec<u8>,
}

#[async_trait]
pub trait AvsHandler: Send + Sync {
    fn avs_type(&self) -> &str;

    fn program_id(&self) -> Pubkey;

    async fn fetch_tasks(&self, avs_owner: &Pubkey) -> Result<Vec<GenericTask>>;

    async fn has_submitted(&self, task: &GenericTask, operator: &Pubkey) -> Result<bool>;

    async fn fetch_task_data(&self, task: &GenericTask) -> Result<Vec<u8>>;

    async fn submit_task(
        &self,
        task: &GenericTask,
        operator: &Pubkey,
        data: Vec<u8>,
    ) -> Result<String>;
}

//Something-to-look-at-later : This will be used to make the current AVS Management more modullar which will be compatible to all systems like oracle , bridges , DA etc
