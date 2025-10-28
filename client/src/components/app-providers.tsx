import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import React from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { DashboardContextProvider } from '@/hooks/use-dashboard-context'
import { MantineProvider } from '@mantine/core'
import { OzonTokenAddressConfigProvider } from '@/hooks/use-token-address-config'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const endpoint = clusterApiUrl('devnet')
  const wallets = [new PhantomWalletAdapter()]
  return (
    <MantineProvider>
      <DashboardContextProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets}>
            <ReactQueryProvider>
              <OzonTokenAddressConfigProvider>
                <WalletModalProvider>
                  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                  </ThemeProvider>
                </WalletModalProvider>
              </OzonTokenAddressConfigProvider>
            </ReactQueryProvider>
          </WalletProvider>
        </ConnectionProvider>
      </DashboardContextProvider>
    </MantineProvider>
  )
}
