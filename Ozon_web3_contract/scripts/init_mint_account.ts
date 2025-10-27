import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection, Keypair } from "@solana/web3.js";
import fs from "fs";
import idl from "../target/idl/restaking_programs.json";

const PROGRAM_ID = new PublicKey("2Wvo8b4oF63csMU45z6qHCN9EZ1qV2ifBb3dwnWow6Ub");

(async () => {
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

  // Args: baseMint and restakedMint
  const baseMint = new PublicKey(process.argv[2]);
  const restakedMint = new PublicKey(process.argv[3]);

  // PDAs matching program seeds
  const [mintAccount] = PublicKey.findProgramAddressSync([
    Buffer.from("mint_account"),
    baseMint.toBuffer(),
  ], PROGRAM_ID);

  const [vaultAccount] = PublicKey.findProgramAddressSync([
    Buffer.from("vault_account"),
    baseMint.toBuffer(),
  ], PROGRAM_ID);

  const sig = await program.methods.initializeMintAccount(baseMint, restakedMint).accounts({
    authority: provider.wallet.publicKey,
    mintAccount,
    vaultAccount,
    systemProgram: SystemProgram.programId,
  }).rpc();

  console.log("tx:", sig);
})();
