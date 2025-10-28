'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, TrendingUp } from 'lucide-react'
import { useAccounts } from '@/hooks/use-accounts'
import { lamportsToSol } from 'gill'

export function RewardsSection() {
  //@ts-ignore
  const { rmSolUserRestakingAccountData } = useAccounts()
  const rewards = [
    { token: 'SOL', amount: '3.42', usdValue: '$623.45' },
    { token: 'mSOL', amount: '2.18', usdValue: '$398.12' },
    { token: 'jitoSOL', amount: '2.82', usdValue: '$514.88' },
  ]

  // const totalUsdValue = rewards.reduce((sum, r) => sum + Number.parseFloat(r.usdValue.replace(/[$,]/g, '')), 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Rewards
        </CardTitle>
        <CardDescription>Claim your accumulated staking rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-success/20 border border-primary/30">
          <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
          <p className="text-3xl font-bold mb-1">
            {lamportsToSol(rmSolUserRestakingAccountData?.rewardDebt || 0)} RMSOL
          </p>
          <div className="flex items-center gap-1 text-sm text-success">
            <TrendingUp className="w-4 h-4" />
            <span>+2.3% this week</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Available to Claim</h4>
          {/* {rewards.map((reward) => ( */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
            <div>
              <p className="font-medium">{lamportsToSol(rmSolUserRestakingAccountData?.rewardDebt || 0)} RMSOL</p>
              {/* <p className="text-sm text-muted-foreground">{reward.usdValue}</p> */}
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg">
          Claim All Rewards
        </Button>

        <div className="pt-4 border-t border-border space-y-2">
          <h4 className="font-semibold text-sm">Reward History</h4>
          <div className="space-y-2">
            {[
              { date: '2 days ago', amount: '0.42 SOL', usdValue: '$76.50' },
              { date: '5 days ago', amount: '0.38 SOL', usdValue: '$69.20' },
              { date: '1 week ago', amount: '0.45 SOL', usdValue: '$82.00' },
            ].map((history, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{history.date}</span>
                <div className="text-right">
                  <p className="font-medium">{history.amount}</p>
                  <p className="text-xs text-muted-foreground">{history.usdValue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
