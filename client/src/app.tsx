import { AppProviders } from '@/components/app-providers.tsx'
import { AppLayout } from '@/components/app-layout.tsx'
import { AppRoutes } from '@/app-routes.tsx'
import { Notifications } from '@mantine/notifications'
import '@solana/wallet-adapter-react-ui/styles.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import styles from '@/index.module.scss'

const links: { label: string; path: string }[] = [
  //
  { label: 'Home', path: '/' },
  { label: 'Account', path: '/account' },
]

export function App() {
  return (
    <AppProviders>
      <AppLayout links={links}>
        <AppRoutes />
        <Notifications
          classNames={{
            notification: styles.mantineNotification,
          }}
        />
      </AppLayout>
    </AppProviders>
  )
}
