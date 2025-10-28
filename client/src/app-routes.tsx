import { useRoutes } from 'react-router'
import { lazy } from 'react'
import { Home } from '@/features/home'
import RestakerDashboard from '@/features/restaker-dashboard'
import { OzonProgramProvider } from '@/hooks/use-ozon-program'
import { WalletGuard } from '@/components/wallet-guard'

const DashboardFeature = lazy(() => import('@/features/dashboard/dashboard-feature.tsx'))
const AccountIndexFeature = lazy(() => import('@/features/account/account-feature-index.tsx'))

export function AppRoutes() {
  return useRoutes([
    { index: true, element: <Home /> },
    {
      path: 'account',
      children: [
        {
          index: true,
          element: (
            <WalletGuard>
              <OzonProgramProvider>
                <AccountIndexFeature />
              </OzonProgramProvider>
            </WalletGuard>
          ),
        },
      ],
    },
    {
      path: 'restaker-dashboard',
      element: (
        <WalletGuard>
          <OzonProgramProvider>
            <RestakerDashboard />
          </OzonProgramProvider>
        </WalletGuard>
      ),
    },
  ])
}
