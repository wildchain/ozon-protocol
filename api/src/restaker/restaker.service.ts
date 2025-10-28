import { Injectable } from '@nestjs/common';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import {} from 'src/common/constants';
import { getAdminWallet } from 'src/common/util';
import { getOzonProgram } from 'src/lib/@solana/web3.js';

@Injectable()
export class RestakerService {
  // async initializeAccounts(address: string) {
  //   const { anchorWallet } = getAdminWallet();
  //   console.log('anchorWallet:', anchorWallet);
  //   const ozonProgram = getOzonProgram(anchorWallet);
  //   const addressPublicKey = new PublicKey(address);
  //   const
  //   const [derivedVaultAccount] = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from('vault_account'),
  //       DEVNET_BASE_MINT_ADDRESS_PUBLIC_KEY.toBytes(),
  //     ],
  //     ozonProgram.programId,
  //   );
  //   const [derivedVault] = PublicKey.findProgramAddressSync(
  //     [Buffer.from('vault'), DEVNET_BASE_MINT_ADDRESS_PUBLIC_KEY.toBytes()],
  //     ozonProgram.programId,
  //   );
  //   const [userRestakingAccount] = PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from('user_restaking'),
  //       addressPublicKey.toBytes(), // Changed from toBuffer() to toBytes()
  //       new PublicKey(process.env.RESTAKED_TOKEN_MINT_ADDRESS).toBytes(), // Changed from toBuffer() to toBytes()
  //     ],
  //     ozonProgram.programId,
  //   );
  //   console.log('userRestakingAccount:', userRestakingAccount.toString());
  //   const vaultAccountTx = await ozonProgram.methods
  //     .initializeVaultAccount(DEVNET_BASE_MINT_ADDRESS)
  //     .accounts({
  //       vault: derivedVault,
  //       vaultAccount: derivedVaultAccount,
  //       tokenMint: DEVNET_BASE_MINT_ADDRESS,
  //       authority: anchorWallet.publicKey,
  //       systemProgram: SystemProgram.programId,
  //       tokenProgram: new PublicKey(
  //         'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  //       ),
  //       rent: SYSVAR_RENT_PUBKEY,
  //     })
  //     .signers([])
  //     .rpc();
  //   console.log('initializeVaultAccount tx:', vaultAccountTx);
  //   const tx = await ozonProgram.methods
  //     .initializeMintAccount(
  //       DEVNET_BASE_MINT_ADDRESS,
  //       process.env.RESTAKED_TOKEN_MINT_ADDRESS,
  //     )
  //     .accounts({})
  //     .signers([])
  //     .rpc();
  //   console.log('initializeMintAccount tx:', tx);
  //   return {
  //     message: 'Accounts initialized successfully',
  //     tx: {
  //       initializeMintAccount: tx,
  //       initializeVaultAccount: vaultAccountTx,
  //     },
  //   };
  // }
}
