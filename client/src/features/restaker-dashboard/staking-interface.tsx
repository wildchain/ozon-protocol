'use client'

import { useContext, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowDown } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBalance } from '@gillsdk/react'
import { lamportsToSol } from 'gill'
import { toast } from '@/hooks/use-toast'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { notifications } from '@mantine/notifications'
import { useAccounts } from '@/hooks/use-accounts'
import { OzonTokenName } from '@/common'
import { connection } from '@/contracts'
import { OzonTokenAddressConfigContext, useOzonTokenAddressConfig } from '@/hooks/use-token-address-config'
import { getAssociatedTokenAddress } from '@solana/spl-token'

export function StakingInterface() {
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<OzonTokenName>(OzonTokenName.MSOL)
  const { ozonTokenAddressConfig } = useContext(OzonTokenAddressConfigContext)
  const { wallet } = useWallet()
  const { program } = useOzonProgram()
  //@ts-ignore
  const { tokenBalances, loadTokenBalances, loadUserRestakingAccountData } = useAccounts()
  const receiptTokenAddressConfig = useOzonTokenAddressConfig(
    selectedToken === OzonTokenName.MSOL ? OzonTokenName.RMSOL : OzonTokenName.RJITOSOL,
  )
  const baseTokenAddressConfig = useOzonTokenAddressConfig(selectedToken)
  const tokens = [
    {
      symbol: OzonTokenName.MSOL,
      name: 'Marinade SOL',
      balance: lamportsToSol((tokenBalances[OzonTokenName.MSOL] as any) ?? 0),
      apy: '0.0%',
    },
    {
      symbol: OzonTokenName.JITOSOL,
      name: 'Jito SOL',
      balance: lamportsToSol((tokenBalances[OzonTokenName.JITOSOL] as any) ?? 0),
      apy: '0.0%',
    },
  ]

  // Helper function to derive PDA accounts
  const deriveAccounts = async () => {
    if (!program || !wallet?.adapter.publicKey) {
      throw new Error('Program or wallet not available')
    }

    const user = wallet.adapter.publicKey

    const RESTAKED_SOL_MINT = new PublicKey(receiptTokenAddressConfig.mintAddress)

    // Derive user restaking account PDA
    const [userRestakingAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_restaking'),
        user.toBytes(), // Changed from toBuffer() to toBytes()
        RESTAKED_SOL_MINT.toBytes(), // Changed from toBuffer() to toBytes()
      ],
      program.programId,
    )

    // Get user token accounts (these would need to be created if they don't exist)
    // For now, we'll use placeholder addresses - you'll need to implement proper token account handling
    const userBaseToken = await getAssociatedTokenAddress(new PublicKey(baseTokenAddressConfig.mintAddress), user)
    const userRestakedToken = await getAssociatedTokenAddress(
      new PublicKey(receiptTokenAddressConfig.mintAddress),
      user,
    )

    return {
      user,
      userBaseToken,
      vaultAccount: new PublicKey('FZCEm1VPBxX94AJtLr4qTuKDgnrEYPAMNEfg5RvgWHW9'),
      mintAccount: new PublicKey('HnqqowGqJdKz3jNsdvvjsWXAQDsJitNsdvGUhFD9Lx6T'),
      restakedMint: RESTAKED_SOL_MINT,
      userRestakedToken,
      userRestakingAccount,
      vault: new PublicKey('7uqHN7rbLEWf2tfgKtpaKU7i2snzgWRqepj3r1Zr4t6K'),
    }
  }

  const stakeSol = async () => {
    try {
      if (!program || !wallet?.adapter.publicKey) {
        notifications.show({
          title: 'Error',
          message: 'Program or wallet not available',
          color: 'red',
        })
        return
      }

      if (!amount || Number.parseFloat(amount) <= 0) {
        notifications.show({
          title: 'Invalid amount',
          message: 'You must enter a valid amount to stake',
          color: 'red',
        })
        return
      }

      const accounts = await deriveAccounts()
      const tx = await program.methods
        .restake(new BN(Math.round(Number.parseFloat(amount) * 1_000_000_000)))
        .accounts({
          userBaseToken: accounts.userBaseToken,
          vaultAccount: accounts.vaultAccount,
          vault: accounts.vault,
          mintAccount: accounts.mintAccount,
          restakedMint: accounts.restakedMint,
          userRestakedToken: accounts.userRestakedToken,
          userRestakingAccount: accounts.userRestakingAccount,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          systemProgram: SystemProgram.programId,
        })
        .transaction()

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed')
      tx.recentBlockhash = blockhash
      tx.feePayer = wallet?.adapter.publicKey
      const txId = await wallet.adapter.sendTransaction(tx, connection)
      await connection.confirmTransaction(
        {
          signature: txId,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        },
        'confirmed',
      )
      notifications.show({
        title: 'Success',
        message: 'Tokens staked successfully!',
        color: 'green',
      })
      loadTokenBalances()
      loadUserRestakingAccountData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error staking tokens',
        color: 'red',
      })
      console.error('Staking error:', error)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Stake Tokens</CardTitle>
        <CardDescription>Restake your tokens to earn rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken as any}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-muted-foreground ml-4">
                      {token.balance} • APY {token.apy}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Amount</Label>
            <span className="text-sm text-muted-foreground">
              Balance: {lamportsToSol((tokenBalances[selectedToken] as any) ?? 0)} {selectedToken}
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-20"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
              onClick={() => setAmount(lamportsToSol((tokenBalances[selectedToken] as any) ?? 0) || '')}
            >
              MAX
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center py-2">
          <div
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            style={{
              background: '#171717',
              border: '1px solid #5b5b5b',
            }}
          >
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>You will receive</Label>
          <div
            className="p-4 rounded-lg bg-secondary border border-border"
            style={{
              background: '#171717',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{amount || '0.00'}</span>
              <span className="text-lg font-medium text-muted-foreground">r{selectedToken}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="font-medium">
              1 {selectedToken} = 1 r{selectedToken}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">APY</span>
            <span className="font-medium text-success">{tokens.find((t) => t.symbol === selectedToken)?.apy}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Transaction Fee</span>
            <span className="font-medium">~0.000005 SOL</span>
          </div>
        </div>

        <Button onClick={stakeSol} className="w-full" size="lg" disabled={!amount || Number.parseFloat(amount) <= 0}>
          Stake {selectedToken}
        </Button>
      </CardContent>
    </Card>
  )
}
