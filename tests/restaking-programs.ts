import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RestakingPrograms } from "../target/types/restaking_programs";

// describe("restaking-programs", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   const program = anchor.workspace.restakingPrograms as Program<RestakingPrograms>;

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });

console.log("Testing get_cooldown_end_slot Instruction");

const Restaked_MINT = new web3.PublicKey("877VXr8XkaMHXhRQF251kiTzRHk9Jog9m4GD2kuejGGC");

console.log("\n Deriving pdf");

const [userRestakingAccountPDA, bump] = web3.PublicKey.findProgramAddressSync(
  [
    Buffer.from("user_restaking"),
    pg.wallet.publicKey.toBuffer(),
    Restaked_MINT.toBuffer()
  ],
  pg.program.programId
)


console.log("User Restaking Account PDA:", userRestakingAccountPDA.toString());

console.log("\n Checking if account exists...");

try {
  const accountInfo = await pg.connection.getAccountInfo(userRestakingAccountPDA)

  if (accountInfo) {
    console.log("Account EXISTS!");
    console.log("   - Owner:", accountInfo.owner.toString());
    console.log("   - Data length:", accountInfo.data.length, "bytes");
    console.log("   - Lamports:", accountInfo.lamports);
  } else {
    console.log("Account DOES NOT EXIST");
    console.log(" You need to call restake() first to create this account!");
    throw new Error("Account not found. Run restake() first.");
  }
} catch (error) {
  console.error("Error:", error.message);
  console.log("\n STOPPING TEST - Account must exist first\n");
  throw error;
}

console.log("\nTesting with .view() method...");

try {
  const cooldownEndSlot = await pg.program.methods.getCooldownEndSlot().accounts({
    user: pg.wallet.publicKey,
    userRestakingAccount: userRestakingAccountPDA;
    restakedMint: Restaked_MINT,
  }).view();

  console.log("SUCCESS!");
  console.log("Cooldown End Slot:", cooldownEndSlot.toString());
} catch (error) {
  throw error
}
