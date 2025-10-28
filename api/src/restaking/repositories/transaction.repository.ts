import { DateTime } from 'luxon';
import { OzonTokenName } from 'src/common/constants';
import { PaginationDto } from 'src/common/dto';
import { lamportsToSol } from 'src/common/util';
import { db } from 'src/lib/db';
import { TransactionType } from 'src/restaking/models';
import {
  RequestUnstakeTransactionModel,
  StakeTransactionModel,
} from 'src/restaking/models/transaction.model';

export const STAKE_TRANSACTION_TABLE_INIT_SQL = `
  CREATE TABLE IF NOT EXISTS stake_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hash TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    token_mint_address TEXT NOT NULL,
    token_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export const REQUEST_UNSTAKE_TRANSACTION_TABLE_INIT_SQL = `
  CREATE TABLE IF NOT EXISTS request_unstake_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    hash TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    token_mint_address TEXT NOT NULL,
    token_name TEXT NOT NULL,
    claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

export function saveStakeTransaction(transaction: StakeTransactionModel) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO stake_transactions (hash, type, amount, status, wallet_address, created_at, updated_at, token_mint_address, token_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        transaction.hash,
        transaction.type,
        transaction.amount,
        transaction.status,
        transaction.wallet_address,
        transaction?.created_at || DateTime.utc().toJSDate(),
        transaction?.updated_at || DateTime.utc().toJSDate(),
        transaction.token_mint_address,
        transaction.token_name,
      ],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(transaction);
        }
      },
    );
  });
}

export function saveRequestUnstakeTransaction(
  transaction: RequestUnstakeTransactionModel,
) {
  return db.run(
    'INSERT INTO request_unstake_transactions (hash, type, amount, status, wallet_address, token_mint_address, token_name, claimed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      transaction.hash,
      transaction.type,
      transaction.amount,
      transaction.status,
      transaction.wallet_address,
      transaction.token_mint_address,
      transaction.token_name,
      transaction.claimed,
      transaction?.created_at || DateTime.utc().toJSDate(),
      transaction?.updated_at || DateTime.utc().toJSDate(),
    ],
  );
}

export function updateRequestTokenClaimedStatus(hash: string) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE request_unstake_transactions SET claimed = TRUE WHERE hash = ?',
      [hash],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      },
    );
  });
}

export function getUnstakedUnclaimedTransactions(
  address: string,
  dto?: PaginationDto,
) {
  if (Object.keys(dto || {}).length === 0) {
    dto = new PaginationDto();
  }
  address = address.toLowerCase();
  return new Promise<RequestUnstakeTransactionModel[]>((resolve, reject) => {
    db.all(
      'SELECT * FROM request_unstake_transactions WHERE claimed = FALSE AND wallet_address = ? ORDER BY created_at DESC LIMIT 1',
      [address],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as RequestUnstakeTransactionModel[]);
        }
      },
    );
  });
}

export async function getTransactions(dto: PaginationDto) {
  if (Object.keys(dto || {}).length === 0) {
    dto = new PaginationDto();
  }
  const stakeTransactions = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM stake_transactions ', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as StakeTransactionModel[]);
      }
    });
  });
  const requestUnstakeTransactions = await new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM request_unstake_transactions ORDER BY created_at DESC',
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as RequestUnstakeTransactionModel[]);
        }
      },
    );
  });
  const transactions = [
    ...(stakeTransactions as any),
    ...(requestUnstakeTransactions as any),
  ];
  let totalRmSolStaked: number = 0;
  let totalRJitoSolStaked: number = 0;
  for (const transaction of stakeTransactions as any) {
    const amountToAdd = lamportsToSol(Number(transaction.amount));
    console.log('transaction.token_name:', transaction.token_name);
    if (
      transaction.token_name === OzonTokenName.MSOL ||
      transaction.token_name === OzonTokenName.RMSOL
    ) {
      totalRmSolStaked += amountToAdd;
    } else if (transaction.token_name === OzonTokenName.RJITOSOL) {
      totalRJitoSolStaked += amountToAdd;
    }
  }

  const transactionHourMap: Record<
    string,
    {
      unstakedCount: number;
      stakedCount: number;
    }
  > = {};

  for (const transaction of transactions) {
    const transactionDateTime = DateTime.fromMillis(transaction.created_at);
    const transactionTimestampString = transactionDateTime.toLocaleString(
      DateTime.DATE_SHORT,
    );
    if (!transactionHourMap[transactionTimestampString]) {
      transactionHourMap[transactionTimestampString] = {
        unstakedCount: 0,
        stakedCount: 0,
      };
    }
    if (transaction.type === TransactionType.STAKE) {
      transactionHourMap[transactionTimestampString].stakedCount++;
    } else {
      transactionHourMap[transactionTimestampString].unstakedCount++;
    }
  }

  return {
    transactions,
    transactionHourMap,
    totalRmSolStaked,
    totalRJitoSolStaked,
  };
}

export async function setAllUnclaimedRequestUnstakeTransactionsToClaimed(
  wallet_address: string,
) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE request_unstake_transactions SET claimed = TRUE WHERE claimed = FALSE AND wallet_address = ?',
      [wallet_address],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      },
    );
  });
}
