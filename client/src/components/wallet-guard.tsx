'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { notifications } from '@mantine/notifications'

interface WalletGuardProps {
  children: React.ReactNode
  fallbackPath?: string
}

export function WalletGuard({ children, fallbackPath = '/' }: WalletGuardProps) {
  const { connected, connecting, connect } = useWallet()

  // Show loading state while connecting
  if (connecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <CardTitle>Connecting Wallet</CardTitle>
            <CardDescription>Please wait while we connect to your wallet...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      console.error('Error connecting wallet:', error)
      notifications.show({
        title: 'Error',
        message: `
         We couldn't reconnect your wallet. Please try again via your wallet provider.
        `,
        color: 'red',
      })
    }
  }

  // Redirect if not connected
  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Wallet Required</CardTitle>
            <CardDescription>Please connect your wallet to access this page</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleConnect} className="w-full">
              Connect Wallet
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()} className="w-full mt-2">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render protected content if connected
  return <>{children}</>
}
