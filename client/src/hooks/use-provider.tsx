import { AnchorProvider } from '@coral-xyz/anchor'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection } from '@solana/web3.js'
import { useWalletUi } from '@wallet-ui/react'

export function useProvider() {
  const wallet = useAnchorWallet()
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  if (!wallet) {
    return null
  }
  return new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  })
}
