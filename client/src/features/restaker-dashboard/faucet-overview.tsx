'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import styles from './index.module.scss'


export function FaucetOverview() {

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold mb-2 mt-2">Ozon Faucet</CardTitle>
            <CardDescription className="text-base">
              We are currently in devnet mode , so get some test tokens from our faucet to test out staking for mSOL.
            </CardDescription>
          </div>
          <div className="w-48"></div>
        </div>
      </CardHeader>
      <div className={styles.homePageHeroActionsContainer}>
        <button onClick={() => window.open('https://ozon-faucets.netlify.app/', '_blank')}>
          Visit mSOL Faucet
        </button>
      </div>
    </Card>
  )
}
