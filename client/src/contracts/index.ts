import { clusterApiUrl, Connection, Cluster, Keypair } from '@solana/web3.js'
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { AnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider, Program } from '@coral-xyz/anchor'

export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

export class AdminWalletContractCalls {
  private keyPair = [
    21, 113, 29, 185, 225, 230, 59, 216, 29, 14, 214, 114, 27, 13, 218, 149, 195, 20, 122, 99, 11, 166, 211, 49, 70,
    235, 245, 39, 228, 44, 149, 206, 168, 137, 181, 145, 93, 40, 20, 116, 185, 118, 115, 190, 38, 70, 144, 65, 160, 95,
    254, 166, 155, 67, 160, 98, 40, 213, 182, 239, 69, 44, 122, 1,
  ]
  private initializeAdminWallet() {
    const adminWallet = Keypair.fromSecretKey(new Uint8Array(this.keyPair))
    return adminWallet
  }
  // async initializeStateAccount(
  //   msolMint: PublicKey,
  //   jitosolMint: PublicKey,
  //   rmSolMint: PublicKey,
  //   rjitoSolMint: PublicKey,
  // ) {
  //   const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  //   const provider = new AnchorProvider(connection, adminWallet, {
  //     commitment: 'confirmed',
  //   })
  //   const adminWallet = this.initializeAdminWallet()
  //   const adminAnchorWallet: AnchorWallet = {
  //     publicKey: adminWallet.publicKey,
  //     signTransaction: async (tx) => {
  //       tx.sign(adminWallet);
  //       return tx;
  //     }
  //   }
  //   const [vaultAccount] = PublicKey.findProgramAddressSync(
  //     [Buffer.from('vault_account'), msolMint.toBytes()],
  //     program.programId,
  //   )
  //   const [mintAccount] = PublicKey.findProgramAddressSync(
  //     [Buffer.from('mint_account'), msolMint.toBytes()],
  //     program.programId,
  //   )
  //   program.methods
  //     .initializeStateAccount(msolMint, jitosolMint, rmSolMint, rjitoSolMint)
  //     .accounts({})
  //     .signers([adminWallet])
  //     .rpc()
  //   program.methods
  //     .initializeVaultAccount(msolMint)
  //     .accounts({
  //       authority: adminWallet.publicKey,
  //       vaultAccount: vaultAccount,
  //       vault: vaultAccount,
  //       tokenMint: msolMint,
  //       systemProgram: SystemProgram.programId,
  //       rent: SYSVAR_RENT_PUBKEY,
  //     })
  //     .signers([adminWallet])
  //     .rpc()
  //   program.methods
  //     .initializeMintAccount(msolMint, jitosolMint)
  //     .accounts({
  //       authority: adminWallet.publicKey,
  //       mintAccount: mintAccount,
  //       vaultAccount: vaultAccount,
  //       systemProgram: SystemProgram.programId,
  //       rent: SYSVAR_RENT_PUBKEY,
  //     })
  //     .signers([adminWallet])
  //     .rpc()
  // }
}

// // Add this function to initialize the required accounts before restaking
// const initializeRestakingAccounts = async (program: any, user: PublicKey, baseMint: PublicKey) => {
//   try {
//     // Step 1: Get state account
//     const [stateAccount] = PublicKey.findProgramAddressSync([Buffer.from('state')], program.programId)
//     console.log('stateAccount', stateAccount.toString())
//     const stateData = await program.account.stateAccount.fetch(stateAccount)

//     // Step 2: Determine restaked mint
//     let restakedMint: PublicKey
//     if (baseMint.equals(new PublicKey('So11111111111111111111111111111111111111112'))) {
//       restakedMint = stateData.rmSolMint
//     } else if (baseMint.equals(stateData.msolMint)) {
//       restakedMint = stateData.rmSolMint
//     } else if (baseMint.equals(stateData.jitosolMint)) {
//       restakedMint = stateData.rjitoSolMint
//     } else {
//       throw new Error('Unsupported base mint')
//     }

//     // Step 3: Initialize mint account if it doesn't exist
//     const [mintAccount] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from([109, 105, 110, 116, 95, 97, 99, 99, 111, 117, 110, 116]), // "mint_account"
//         baseMint.toBytes(),
//       ],
//       program.programId,
//     )

//     try {
//       await program.account.mintAccount.fetch(mintAccount)
//       console.log('Mint account already exists')
//     } catch (error) {
//       console.log('Initializing mint account...')

//       // Initialize mint account
//       const [vaultAccount] = PublicKey.findProgramAddressSync(
//         [
//           Buffer.from([118, 97, 117, 108, 116, 95, 97, 99, 99, 111, 117, 110, 116]), // "vault_account"
//           baseMint.toBytes(),
//         ],
//         program.programId,
//       )

//       await program.methods
//         .initializeMintAccount(baseMint, restakedMint)
//         .accounts({
//           authority: user,
//           mintAccount: mintAccount,
//           vaultAccount: vaultAccount,
//           systemProgram: SystemProgram.programId,
//         })
//         .signers([])
//         .rpc()
//     }

//     // Step 4: Initialize vault account if it doesn't exist
//     const [vaultAccount] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from([118, 97, 117, 108, 116, 95, 97, 99, 99, 111, 117, 110, 116]), // "vault_account"
//         baseMint.toBytes(),
//       ],
//       program.programId,
//     )

//     try {
//       await program.account.vaultAccount.fetch(vaultAccount)
//       console.log('Vault account already exists')
//     } catch (error) {
//       console.log('Initializing vault account...')

//       // Initialize vault account
//       await program.methods
//         .initializeVaultAccount(baseMint)
//         .accounts({
//           authority: user,
//           vaultAccount: vaultAccount,
//           vault: new PublicKey('11111111111111111111111111111111'), // This might need to be derived
//           tokenMint: baseMint,
//           systemProgram: SystemProgram.programId,
//           tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
//           rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
//         })
//         .signers([])
//         .rpc()
//     }

//     return { mintAccount, vaultAccount }
//   } catch (error) {
//     console.error('Error initializing accounts:', error)
//     throw error
//   }
// }

// // Updated joinAsRestaker function
// export const joinAsRestaker = async (program: any, user: PublicKey, baseMint: PublicKey, amount: number) => {
//   try {
//     // Step 1: Initialize required accounts first
//     const { mintAccount, vaultAccount } = await initializeRestakingAccounts(program, user, baseMint)

//     // Step 2: Get state account
//     const [stateAccount] = PublicKey.findProgramAddressSync([Buffer.from('state')], program.programId)

//     const stateData = await program.account.stateAccount.fetch(stateAccount)

//     // Step 3: Determine restaked mint
//     let restakedMint: PublicKey
//     if (baseMint.equals(new PublicKey('So11111111111111111111111111111111111111112'))) {
//       restakedMint = stateData.rmSolMint
//     } else if (baseMint.equals(stateData.msolMint)) {
//       restakedMint = stateData.rmSolMint
//     } else if (baseMint.equals(stateData.jitosolMint)) {
//       restakedMint = stateData.rjitoSolMint
//     } else {
//       throw new Error('Unsupported base mint')
//     }

//     // Step 4: Get vault address from mint account
//     const mintAccountData = await program.account.mintAccount.fetch(mintAccount)
//     const vault = mintAccountData.vault

//     // Step 5: Derive user restaking account
//     const [userRestakingAccount] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from([117, 115, 101, 114, 95, 114, 101, 115, 116, 97, 107, 105, 110, 103]), // "user_restaking"
//         user.toBytes(),
//         restakedMint.toBytes(),
//       ],
//       program.programId,
//     )

//     // Step 6: Get or create user token accounts
//     const userBaseToken = await getOrCreateAssociatedTokenAccount(program.provider.connection, user, baseMint, user)

//     const userRestakedToken = await getOrCreateAssociatedTokenAccount(
//       program.provider.connection,
//       user,
//       restakedMint,
//       user,
//     )

//     // Step 7: Create the restake transaction
//     return {
//       success: true,
//       userRestakingAccount: userRestakingAccount,
//       restakedMint: restakedMint,
//     }
//   } catch (error) {
//     console.error('Error joining as restaker:', error)
//     throw error
//   }
// }

// // Helper function to get or create token accounts
// const getOrCreateAssociatedTokenAccount = async (
//   connection: any,
//   payer: PublicKey,
//   mint: PublicKey,
//   owner: PublicKey,
// ) => {
//   // This is a simplified version - you'll need to implement proper token account creation
//   // using @solana/spl-token or similar library

//   const [tokenAccount] = PublicKey.findProgramAddressSync(
//     [owner.toBytes(), new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBytes(), mint.toBytes()],
//     new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
//   )

//   return { address: tokenAccount }
// }
