'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useBalance } from '@gillsdk/react'
import { useWallet } from '@solana/wallet-adapter-react'
import { lamportsToSol } from 'gill'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { useAccounts } from '@/hooks/use-accounts'
import { OzonTokenName } from '@/common'
import { useState } from 'react'
import { Flex, Loader } from '@mantine/core'

export function PortfolioOverview() {
  const { wallet } = useWallet()

  //@ts-ignore
  const { tokenBalances, isBalancesLoading, rmSolUserRestakingAccountData } = useAccounts()
  console.log(rmSolUserRestakingAccountData, 'rmSolUserRestakingAccountData')
  const [selectedToken, setSelectedToken] = useState<OzonTokenName>(OzonTokenName.MSOL)

  const tokenOptions = [
    { value: OzonTokenName.MSOL, label: 'mSOL', description: 'Marinade SOL' },
    { value: OzonTokenName.JITOSOL, label: 'JitoSOL', description: 'Jito SOL' },
  ]
  const stats = [
    {
      label: 'Total Restaked Value',
      value: `${lamportsToSol(tokenBalances[OzonTokenName.RMSOL] as any)} ${selectedToken}`,
      change: '+12.5%',
      trend: 'up' as 'up' | 'down' | 'neutral',
    },
    {
      label: 'Available to Stake',
      value: `${lamportsToSol((tokenBalances[selectedToken] as any) ?? 0)} ${selectedToken}`,
      change: '$8,234.12',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
    },
    {
      label: 'Pending Unstake',
      value: `${lamportsToSol(rmSolUserRestakingAccountData?.pendingUnstake ?? 0)} R${selectedToken}`,
      change: '0d remaining',
      trend: 'neutral' as 'up' | 'down' | 'neutral',
    },
    {
      label: 'Total Rewards Earned',
      value: `${lamportsToSol(rmSolUserRestakingAccountData?.rewardDebt ?? 0)} R${selectedToken}`,
      change: '+2.3%',
      trend: 'up' as 'up' | 'down' | 'neutral',
    },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold mb-2 mt-2">Portfolio Overview</CardTitle>
            <CardDescription className="text-base">
              Choose a token below to view your staking performance and manage your restaked assets
            </CardDescription>
          </div>
          <div className="w-48"></div>
        </div>
      </CardHeader>
      <CardContent>
        <Flex>
          <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value as OzonTokenName)}>
            <SelectTrigger className="mr-4">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {tokenOptions.map((token) => (
                <SelectItem key={token.value} value={token.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{token.label}</span>
                    {selectedToken !== token.value && (
                      <span className="text-xs text-muted-foreground">{token.description}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isBalancesLoading && <Loader color="#818181" />}
        </Flex>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-secondary/30 border-border">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' && (
                      <>
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">{stat.change}</span>
                      </>
                    )}
                    {stat.trend === 'down' && (
                      <>
                        <TrendingDown className="w-4 h-4 text-destructive" />
                        <span className="text-sm text-destructive">{stat.change}</span>
                      </>
                    )}
                    {stat.trend === 'neutral' && <span className="text-sm text-muted-foreground">{stat.change}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
