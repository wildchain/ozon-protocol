import { ActivityChart } from '@/components/activity-chart'
import { DataRequests } from '@/components/data-requests'
import { Header } from '@/components/header'
import { StatsOverview } from '@/components/stats-overview'
import { TopOperators } from '@/components/top-operators'
import RestakerDashboard from '@/features/restaker-dashboard'
import { Navigate } from 'react-router'

export default function AccountFeatureIndex() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-6 space-y-6">
        <StatsOverview />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ActivityChart />
            <DataRequests />
          </div>
          <div className="space-y-6">
            <TopOperators />
          </div>
        </div>
      </main>
    </div>
  )
}
