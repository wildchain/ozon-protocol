import { OperatorManagement } from '@/features/restaker-dashboard/operator-management'
import { PortfolioOverview } from '@/features/restaker-dashboard/portfolio-overview'
import { FaucetOverview } from '@/features/restaker-dashboard/faucet-overview'
import { RestakingHeader } from '@/features/restaker-dashboard/restaking-header'
import { RewardsSection } from '@/features/restaker-dashboard/rewards-section'
import { StakingInterface } from '@/features/restaker-dashboard/staking-interface'
import { UnstakingInterface } from '@/features/restaker-dashboard/unstaking-interface'
import { useAccounts } from '@/hooks/use-accounts'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, Shield, Zap } from 'lucide-react'
import styles from './index.module.scss'
import clsx from 'clsx'

export default function RestakerDashboard() {
  const { wallet } = useWallet()
  const { program } = useOzonProgram()
  useEffect(() => {
    const checkRewards = async () => {
      if (!wallet?.adapter.publicKey || !program) return
      try {
      } catch (error) {
        console.error('Error checking rewards:', error)
      }
    }

    checkRewards()
  }, [wallet?.adapter.publicKey, program])
  return (
    <div className={clsx(styles.restakerDashboard, 'min-h-screen  from-background via-background to-secondary/20')}>
      <main className="container mx-auto px-4 py-8 space-y-8">
        <PortfolioOverview />
        <FaucetOverview />

        {/* Staking & Unstaking Section */}
        <div className="space-y-6">
          <Card className="bg-card/100 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Restaking Hub
                </CardTitle>
              </div>
              <CardDescription className="text-lg max-w-3xl">
                <span className="text-foreground font-medium">Stake your tokens</span> to earn rewards through our
                secure restaking protocol, or <span className="text-foreground font-medium">unstake anytime</span> with
                a simple cooldown period. Your assets are protected by advanced validator networks and smart contract
                security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-success/20 rounded-full animate-pulse"></div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-success rounded-full"></div>
                  <StakingInterface />
                </div>
                <div className="relative">
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-warning/20 rounded-full animate-pulse"></div>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-warning rounded-full"></div>
                  <UnstakingInterface />
                </div>
              </div>

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/20">
                  <ArrowUpCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Instant Staking</p>
                    <p className="text-xs text-muted-foreground">Start earning immediately</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <ArrowDownCircle className="w-5 h-5 text-warning flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Flexible Unstaking</p>
                    <p className="text-xs text-muted-foreground">30 seconds cooldown period</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Secure Protocol</p>
                    <p className="text-xs text-muted-foreground">Audited smart contracts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OperatorManagement />
          </div>
          <RewardsSection />
        </div>
      </main>
    </div>
  )
}
