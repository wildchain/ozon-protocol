import { db } from 'src/lib/db';
import { RestakerModel } from 'src/restaker/restaker.model';

export const RESTAKER_TABLE_INIT_SQL = `
  CREATE TABLE IF NOT EXISTS restakers (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    wallet_address TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

export function getRestakerByWalletAddress(
  walletAddress: string,
): Promise<RestakerModel | null> {
  return new Promise((resolve, reject) => {
    db.get(
      `
        SELECT * FROM restakers WHERE wallet_address = ?
      `,
      [walletAddress],
      (error, row) => {
        if (error) {
          reject(error);
        } else {
          resolve(row as RestakerModel);
        }
      },
    );
  });
}
