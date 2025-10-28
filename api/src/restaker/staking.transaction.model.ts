export enum StakingTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum StakingTransactionType {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  CLAIM_REWARDS = 'claim_rewards',
}

export class StakingTransactionModel {
  id: string;
  wallet_address: string;
  amount: string;
  status: StakingTransactionStatus;
  type: StakingTransactionType;
  hash: string;
}
