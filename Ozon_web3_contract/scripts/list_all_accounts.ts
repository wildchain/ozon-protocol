import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import fs from "fs";
import idl from "../target/idl/restaking_programs.json";

const PROGRAM_ID = new PublicKey("2Wvo8b4oF63csMU45z6qHCN9EZ1qV2ifBb3dwnWow6Ub");

(async () => {
  try {
    const RPC_URL = "https://api.devnet.solana.com";
    const KEYPAIR_PATH = `${process.env.HOME}/.config/solana/id.json`;

    const connection = new Connection(RPC_URL, "confirmed");
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8")));
    const keypair = Keypair.fromSecretKey(secretKey);
    const wallet = new anchor.Wallet(keypair);
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
    anchor.setProvider(provider);

    const idlWithAddress = { ...(idl as any), address: PROGRAM_ID.toBase58() } as anchor.Idl;
    const program = new anchor.Program(idlWithAddress, provider);

    const acct: any = program.account as any;

    // Fetch all vaultAccount accounts
    const vaultAccounts = await acct["vaultAccount"].all();

    const rows = await Promise.all(
      vaultAccounts.map(async (va: any) => {
        const tokenMint: PublicKey = va.account.tokenMint;
        const vaultPda: PublicKey = va.account.vault;
        const vaultAccountPda: PublicKey = va.publicKey;

        // Derive corresponding mint_account PDA by base mint (tokenMint)
        const [mintAccountPda] = PublicKey.findProgramAddressSync([
          Buffer.from("mint_account"),
          tokenMint.toBuffer(),
        ], PROGRAM_ID);

        // Try fetching mintAccount; it may or may not exist
        let mintAccountData: any = null;
        try {
          mintAccountData = await acct["mintAccount"].fetchNullable(mintAccountPda);
        } catch (_) {
          mintAccountData = null;
        }

        // Vault token balance (SPL token account)
        let vaultTokenBalance: string | null = null;
        try {
          const bal = await connection.getTokenAccountBalance(vaultPda);
          vaultTokenBalance = bal.value.amount;
        } catch (_) {
          vaultTokenBalance = null;
        }

        return {
          baseMint: tokenMint.toBase58(),
          vaultAccount: {
            pda: vaultAccountPda.toBase58(),
            bump: va.account.bump,
            totalDeposited: va.account.totalDeposited?.toString?.() ?? String(va.account.totalDeposited),
            vaultToken: vaultPda.toBase58(),
            vaultTokenBalance,
          },
          mintAccount: mintAccountData
            ? {
                pda: mintAccountPda.toBase58(),
                baseMint: mintAccountData.baseMint?.toBase58?.() ?? String(mintAccountData.baseMint),
                restakedMint: mintAccountData.restakedMint?.toBase58?.() ?? String(mintAccountData.restakedMint),
                vault: mintAccountData.vault?.toBase58?.() ?? String(mintAccountData.vault),
                bump: mintAccountData.bump,
                totalMinted: mintAccountData.totalMinted?.toString?.() ?? String(mintAccountData.totalMinted),
                exchangeRate: mintAccountData.exchangeRate?.toString?.() ?? String(mintAccountData.exchangeRate),
                lastUpdateSlot: mintAccountData.lastUpdateSlot?.toString?.() ?? String(mintAccountData.lastUpdateSlot),
              }
            : null,
        };
      })
    );

    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error("error:", e);
    process.exit(1);
  }
})();
