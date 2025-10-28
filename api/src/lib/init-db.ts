import {
  REQUEST_UNSTAKE_TRANSACTION_TABLE_INIT_SQL,
  STAKE_TRANSACTION_TABLE_INIT_SQL,
} from 'src/restaking/repositories/transaction.repository';
import { db } from './db';
import { RESTAKER_TABLE_INIT_SQL } from 'src/restaker/restaker.repository';
import { promisify } from 'util';

// Promisify the db.run method
const dbRun = promisify(db.run.bind(db));

export async function initializeDatabase() {
  try {
    // Initialize transaction table
    await dbRun(STAKE_TRANSACTION_TABLE_INIT_SQL);
    console.log('Transaction table initialized successfully');

    // Initialize restaker table
    await dbRun(RESTAKER_TABLE_INIT_SQL);
    console.log('Restaker table initialized successfully');

    // Initialize request unstake transaction table
    await dbRun(REQUEST_UNSTAKE_TRANSACTION_TABLE_INIT_SQL);
    console.log('Request unstake transaction table initialized successfully');

    // TODO: Initialize operator table when implemented
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
