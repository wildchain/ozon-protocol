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

    // Optional filter: by base mint (pass as arg to filter by token_mint)
    const maybeBaseMint = process.argv[2];
    let filters: any[] = [];
    if (maybeBaseMint) {
      const baseMintPk = new PublicKey(maybeBaseMint);
      filters = [
        {
          memcmp: {
            // Account layout: 8 discriminator + token_mint(32) starts at offset 8
            offset: 8,
            bytes: baseMintPk.toBase58(),
          },
        },
      ];
    }

    const vaultAccounts = await acct["vaultAccount"].all(filters);

    const result = await Promise.all(
      vaultAccounts.map(async (va: any) => {
        const tokenMint: string = va.account.tokenMint.toBase58();
        const vaultPda: string = va.account.vault.toBase58();
        let vaultTokenBalance: string | null = null;
        try {
          const bal = await connection.getTokenAccountBalance(new PublicKey(vaultPda));
          vaultTokenBalance = bal.value.amount;
        } catch (_) {
          vaultTokenBalance = null;
        }
        return {
          pda: va.publicKey.toBase58(),
          tokenMint,
          vault: vaultPda,
          bump: va.account.bump,
          totalDeposited: va.account.totalDeposited?.toString?.() ?? String(va.account.totalDeposited),
          vaultTokenBalance,
        };
      })
    );

    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("error:", e);
    process.exit(1);
  }
})();
