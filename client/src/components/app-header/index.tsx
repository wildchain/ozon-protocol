import { OzonLogo } from '@/components/ozon-logo'
import styles from './index.module.scss'
import { WalletConnectButton } from '@/components/wallet-connect-button'
import { Link, useLocation, useNavigate } from 'react-router'
import { useWallet } from '@solana/wallet-adapter-react'
import { DashboardType, useDashboardContext } from '@/hooks/use-dashboard-context'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useContext } from 'react'
import { OzonTokenAddressConfigContext } from '@/hooks/use-token-address-config'
import { notifications } from '@mantine/notifications'
import { ReceiptTurkishLiraIcon } from 'lucide-react'

export function AppHeader() {
  const { pathname } = useLocation()
  const { wallet } = useWallet()
  const { dashboardType } = useDashboardContext()
  const navigate = useNavigate()
  const { ozonTokenAddressConfig } = useContext(OzonTokenAddressConfigContext)
  return (
    <header className={styles.appHeader}>
      <OzonLogo />
      <div className={styles.appHeaderActionsContainer}>
        <nav>
          <Link to="/" className={pathname === '/' ? styles.activeNavLink : ''}>
            Home
          </Link>
          <Link to="/account" className={pathname === '/account' ? styles.activeNavLink : ''}>
            Explorer
          </Link>
          {!!dashboardType && wallet?.adapter.connected && (
            <Link
              to={'/restaker-dashboard'}
              className={pathname === '/restaker-dashboard' ? styles.activeNavLink : ''}
              onClick={async (event) => {
                event.preventDefault()
                if (!ozonTokenAddressConfig) {
                  notifications.show({
                    title: 'Error',
                    message: 'Ozon token address config not initialized properly. Please refresh the page.',
                    color: 'red',
                  })
                  return
                }
                navigate(dashboardType === DashboardType.RESTAKER ? '/restaker-dashboard' : '/account')
              }}
            >
              Dashboard
            </Link>
          )}
        </nav>
        <WalletMultiButton />
      </div>
    </header>
  )
}
