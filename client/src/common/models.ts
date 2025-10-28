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
  recipientAddress: string
  tokenMintAddress: string
  amount: string
  senderAddress: string
  type: 'mint' | 'transfer' | 'burn'

  constructor({ recipientAddress, tokenMintAddress, amount, senderAddress, type }: TokenExchangeDto) {
    this.recipientAddress = recipientAddress
    this.tokenMintAddress = tokenMintAddress
    this.amount = amount
    this.senderAddress = senderAddress
    this.type = type
  }
}

export interface TransactionInitArgs {
  wallet_address: string
  hash: string
  type: TransactionType
  amount: string
  status: TransactionStatus
  token_mint_address: string
  token_name: string
  id
}

export class StakeTransactionModel {
  hash: string
  type: TransactionType
  amount: string
  status: TransactionStatus
  created_at: Date
  updated_at: Date
  id: number
  wallet_address: string
  token_mint_address: string
  token_name: string

  constructor({ wallet_address, hash, type, amount, status, token_mint_address, token_name, id }: TransactionInitArgs) {
    this.hash = hash
    this.type = type
    this.amount = amount
    this.status = status
    this.created_at = new Date()
    this.updated_at = new Date()
    this.wallet_address = wallet_address
    this.token_mint_address = token_mint_address
    this.token_name = token_name
    this.id = id
  }
}

export class RequestUnstakeTransactionModel {
  hash: string
  type: TransactionType
  amount: string
  status: TransactionStatus
  created_at: Date
  updated_at: Date
  id: number
  wallet_address: string
  claimed: boolean
  token_mint_address: string
  token_name: string

  constructor({ wallet_address, hash, type, amount, status, token_mint_address, token_name, id }: TransactionInitArgs) {
    this.hash = hash
    this.type = type
    this.amount = amount
    this.status = status
    this.created_at = new Date()
    this.updated_at = new Date()
    this.wallet_address = wallet_address
    this.claimed = false
    this.token_mint_address = token_mint_address
    this.token_name = token_name
    this.id = id
  }
}
