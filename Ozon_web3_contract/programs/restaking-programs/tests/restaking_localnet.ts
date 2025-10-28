// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { PublicKey, SystemProgram, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
// import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
// import { assert } from "chai";

// describe("restaking_programs localnet", () => {
//     const provider = anchor.AnchorProvider.env();
//     anchor.setProvider(provider);

//     const program = anchor.workspace.restakingPrograms as Program;

//     const payer = provider.wallet as anchor.Wallet;

//     let msolMint: PublicKey;
//     let rMsolMint: PublicKey;
//     let user = Keypair.generate();
//     let userBaseToken: PublicKey;
//     let userRestakedToken: PublicKey;

//     before(async () => {
//         await provider.connection.confirmTransaction(
//             await provider.connection.requestAirdrop(user.publicKey, 5 * LAMPORTS_PER_SOL)
//         );
//         msolMint = await createMint(provider.connection, payer.payer, payer.publicKey, null, 9);
//         rMsolMint = await createMint(provider.connection, payer.payer, payer.publicKey, null, 9);
//         userBaseToken = (await getOrCreateAssociatedTokenAccount(provider.connection, payer.payer, msolMint, user.publicKey)).address;
//         userRestakedToken = (await getOrCreateAssociatedTokenAccount(provider.connection, payer.payer, rMsolMint, user.publicKey)).address;
//         await mintTo(provider.connection, payer.payer, msolMint, userBaseToken, payer.payer, 1_000_000_000n);
//     });

//     it("initialize_state_account", async () => {
//         const [statePda] = PublicKey.findProgramAddressSync([Buffer.from("state")], program.programId);
//         await program.methods.initializeStateAccount(msolMint, msolMint, msolMint, msolMint)
//             .accounts({ authority: payer.publicKey, state: statePda, systemProgram: SystemProgram.programId })
//             .rpc();
//         const state = await program.account.stateAccount.fetch(statePda);
//         assert.ok(state.authority.equals(payer.publicKey));
//     });
// });
