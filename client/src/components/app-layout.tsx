import React from 'react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { WalletDropdown } from '@/components/wallet-dropdown'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div
        style={{
          backgroundColor: '#0b0a2d',
          width: '100%',
          backgroundImage: 'url(/ozon_background.png)',
          backgroundSize: '100% 120vh',
          backgroundRepeat: 'no-repeat',
        }}
        className="flex flex-col min-h-screen"
      >
        <AppHeader />
        <main
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '100%',
          }}
          className="flex-grow container"
        >
          {/* <ClusterUiChecker>
            <AccountUiChecker />
          </ClusterUiChecker> */}
          {children}
        </main>
        <AppFooter />
      </div>
      <Toaster closeButton />
    </ThemeProvider>
  )
}
