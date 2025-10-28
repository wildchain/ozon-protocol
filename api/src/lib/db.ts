import * as sqlite3 from 'sqlite3';

export const DATABASE_FILE_NAME = 'ozon.db';

export function connect() {
  try {
    return new sqlite3.Database(DATABASE_FILE_NAME);
  } catch (error) {
    console.log(`Error connecting to database: ${error}`);
    process.exit(1);
  }
}

export const db = connect();
