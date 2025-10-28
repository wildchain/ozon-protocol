'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWallet } from '@solana/wallet-adapter-react'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { notifications } from '@mantine/notifications'
import { BN } from '@coral-xyz/anchor'
import { useAccounts } from '@/hooks/use-accounts'
import { OzonTokenName } from '@/common'
import { lamportsToSol } from 'gill'
import { useOzonTokenAddressConfig } from '@/hooks/use-token-address-config'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { connection } from '@/contracts'
import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { RequestUnstakeTransactionModel } from '@/common/models'

export function UnstakingInterface() {
  const [amount, setAmount] = useState('')
  const {
    //@ts-ignore
    tokenBalances,
    //@ts-ignore
    loadTokenBalances,
    //@ts-ignore
    loadUserRestakingAccountData,
    //@ts-ignore
    rmSolUserRestakingAccountData,
    //@ts-ignore
    rjitoSolUserRestakingAccountData,
    //@ts-ignore
  } = useAccounts()
  const [selectedToken, setSelectedToken] = useState<OzonTokenName>(OzonTokenName.RMSOL)
  const receiptTokenAddressConfig = useOzonTokenAddressConfig(selectedToken)
  const baseTokenAddressConfig = useOzonTokenAddressConfig(
    selectedToken === OzonTokenName.RMSOL ? OzonTokenName.MSOL : OzonTokenName.JITOSOL,
  )
  const { wallet } = useWallet()
  const { data: pendingUnstakesResponse, isPending } = useQuery<AxiosResponse<RequestUnstakeTransactionModel[]>>({
    queryKey: ['pending-unstakes'],
    queryFn: () =>
      axios.get(`${import.meta.env.VITE_API_URL}/transactions/unstaked-unclaimed/${wallet?.adapter.publicKey}`),
  })
  const restakedTokens = [
    {
      symbol: OzonTokenName.RMSOL,
      name: 'Restaked SOL',
      balance: lamportsToSol((tokenBalances[OzonTokenName.RMSOL] as any) ?? 0),
      cooldown: '3 days',
    },
    {
      symbol: OzonTokenName.RJITOSOL,
      name: 'Restaked jitoSOL',
      balance: lamportsToSol((tokenBalances[OzonTokenName.RJITOSOL] as any) ?? 0),
      cooldown: '3 days',
    },
  ]

  const pendingUnstakes = [
    // { token: 'rSOL', amount: '12.5', timeRemaining: '2d 14h', canClaim: false },
    // { token: 'rmSOL', amount: '5.2', timeRemaining: 'Ready', canClaim: true },
  ]
  const { program } = useOzonProgram()
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

  const unstakeSol = async () => {
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
          message: 'You must enter a valid amount to unstake',
          color: 'red',
        })
        return
      }
      if (
        (selectedToken === OzonTokenName.RMSOL ? rmSolUserRestakingAccountData : rjitoSolUserRestakingAccountData)
          ?.restakedAmount < Number.parseFloat(amount)
      ) {
        notifications.show({
          title: 'Invalid amount',
          message: 'You must enter a valid amount to unstake',
          color: 'red',
        })
        return
      }
      const accounts = await deriveAccounts()
      const tx = await program.methods
        .requestUnstake(new BN(Math.round(Number.parseFloat(amount) * 1_000_000_000)))
        .accounts({
          user: accounts.user,
          userRestakedToken: accounts.userRestakedToken,
          userRestakingAccount: accounts.userRestakingAccount,
          mintAccount: accounts.mintAccount,
          restakedMint: accounts.restakedMint,
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
        message: 'Tokens unstaked successfully!',
        color: 'green',
      })
      loadTokenBalances()
      loadUserRestakingAccountData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error unstaking tokens',
        color: 'red',
      })
      console.error('Unstaking error:', error)
    }
  }

  const claimUnstake = async (unstake: RequestUnstakeTransactionModel) => {
    try {
      if (!program || !wallet?.adapter.publicKey) {
        notifications.show({
          title: 'Error',
          message: 'Program or wallet not available',
          color: 'red',
        })
        return
      }
      const accounts = await deriveAccounts()
      const tx = await program.methods
        .claimUnstake()
        .accounts({
          user: accounts.user,
          userBaseToken: accounts.userBaseToken,
          userRestakingAccount: accounts.userRestakingAccount,
          vaultAccount: accounts.vaultAccount,
          vault: accounts.vault,
          mintAccount: accounts.mintAccount,
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
        message: 'Tokens claimed successfully!',
        color: 'green',
      })
      loadTokenBalances()
      loadUserRestakingAccountData()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error claiming unstake',
        color: 'red',
      })
      console.error('Claiming unstake error:', error)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Unstake Tokens</CardTitle>
        <CardDescription>Request unstake and claim after cooldown period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken as any}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {restakedTokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-sm text-muted-foreground ml-4">{token.balance}</span>
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

        <Alert className="bg-secondary/50 border-border">
          <Clock className="h-4 w-4" />
          <AlertDescription>Cooldown period: 30s. You can claim your tokens after this period.</AlertDescription>
        </Alert>

        <Button
          className="w-full bg-transparent"
          size="lg"
          variant="outline"
          disabled={!amount || Number.parseFloat(amount) <= 0}
          onClick={unstakeSol}
        >
          Request Unstake
        </Button>
        {/* @ts-ignore */}
        {pendingUnstakesResponse?.data?.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-semibold text-sm">Pending Unstakes</h4>
            {pendingUnstakesResponse?.data?.map((unstake, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">
                      {/* @ts-ignore */}
                      {lamportsToSol(Number(unstake.amount))} {unstake.token_name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <span className="text-success">Ready to claim</span>
                      <Clock className="w-3 h-3" />
                      0s
                    </p>
                  </div>
                  <Button onClick={() => claimUnstake(unstake)} size="sm" className="min-w-20">
                    Claim
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
