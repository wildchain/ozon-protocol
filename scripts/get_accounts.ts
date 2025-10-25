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

    // Args
    const baseMint = new PublicKey(process.argv[2]);

    // PDAs (match on-chain seeds)
    const [vaultAccount] = PublicKey.findProgramAddressSync([
      Buffer.from("vault_account"),
      baseMint.toBuffer(),
    ], PROGRAM_ID);

    const [vaultToken] = PublicKey.findProgramAddressSync([
      Buffer.from("vault_token"),
      baseMint.toBuffer(),
    ], PROGRAM_ID);

    const [mintAccount] = PublicKey.findProgramAddressSync([
      Buffer.from("mint_account"),
      baseMint.toBuffer(),
    ], PROGRAM_ID);

    const acct: any = program.account as any;
    const vaultAccData = await acct["vaultAccount"].fetchNullable(vaultAccount);
    const mintAccData = await acct["mintAccount"].fetchNullable(mintAccount);

    // Fetch SPL token account balance for the vault token account (if exists)
    let vaultTokenBalance: string | null = null;
    try {
      const bal = await connection.getTokenAccountBalance(vaultToken);
      vaultTokenBalance = bal.value.amount; // raw amount in base units
    } catch (_) {
      vaultTokenBalance = null; // not initialized yet
    }

    const out = {
      baseMint: baseMint.toBase58(),
      pdaAddresses: {
        vaultAccount: vaultAccount.toBase58(),
        vaultToken: vaultToken.toBase58(),
        mintAccount: mintAccount.toBase58(),
      },
      vaultAccount: vaultAccData ?? null,
      mintAccount: mintAccData ?? null,
      vaultTokenBalance,
    };

    console.log(JSON.stringify(out, null, 2));
  } catch (e) {
    console.error("error:", e);
    process.exit(1);
  }
})();
