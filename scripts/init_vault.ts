import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import fs from "fs";
// import IDL and program id:
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

    const tokenMint = new PublicKey(process.argv[2]); // pass as arg
    const [vaultAccount] = PublicKey.findProgramAddressSync([Buffer.from("vault_account"), tokenMint.toBuffer()], PROGRAM_ID);
    const [vault] = PublicKey.findProgramAddressSync([Buffer.from("vault_token"), tokenMint.toBuffer()], PROGRAM_ID);

    const sig = await program.methods.initializeVaultAccount(tokenMint).accounts({
        authority: provider.wallet.publicKey,
        vaultAccount,
        vault,
        tokenMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    }).rpc();
    console.log("tx:", sig);
})();