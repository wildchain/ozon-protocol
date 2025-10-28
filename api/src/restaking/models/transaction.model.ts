import { TransactionStatus, TransactionType } from 'src/restaking/models';
import { DateTime } from 'luxon';

export interface TransactionInitArgs {
  wallet_address: string;
  hash: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  token_mint_address: string;
  token_name: string;
}

export class StakeTransactionModel {
  hash: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  created_at: Date;
  updated_at: Date;
  id: number;
  wallet_address: string;
  token_mint_address: string;
  token_name: string;

  constructor({
    wallet_address,
    hash,
    type,
    amount,
    status,
    token_mint_address,
    token_name,
  }: TransactionInitArgs) {
    this.hash = hash;
    this.type = type;
    this.amount = amount;
    this.status = status;
    this.created_at = DateTime.utc().toJSDate();
    this.updated_at = DateTime.utc().toJSDate();
    this.wallet_address = wallet_address;
    this.token_mint_address = token_mint_address;
    this.token_name = token_name;
  }
}

export class RequestUnstakeTransactionModel {
  hash: string;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  created_at: Date;
  updated_at: Date;
  id: number;
  wallet_address: string;
  claimed: boolean;
  token_mint_address: string;
  token_name: string;

  constructor({
    wallet_address,
    hash,
    type,
    amount,
    status,
    token_mint_address,
    token_name,
  }: TransactionInitArgs) {
    this.hash = hash;
    this.type = type;
    this.amount = amount;
    this.status = status;
    this.created_at = DateTime.utc().toJSDate();
    this.updated_at = DateTime.utc().toJSDate();
    this.wallet_address = wallet_address;
    this.claimed = false;
    this.token_mint_address = token_mint_address;
    this.token_name = token_name;
  }
}
