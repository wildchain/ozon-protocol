export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TransactionType {
  STAKE = 'restake',
  REQUEST_UNSTAKE = 'request_unstake',
  CLAIM_REWARDS = 'claim_rewards',
  CLAIM_UNSTAKE = 'claim_unstake',
}

export class TokenExchangeDto {
  recipientAddress: string;
  tokenMintAddress: string;
  amount: string;
  senderAddress: string;
  type: 'mint' | 'transfer' | 'burn';
}
