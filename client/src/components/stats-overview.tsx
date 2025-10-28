import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { Shield, Activity, DollarSign, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'

export function StatsOverview() {
  const { data: transactionsResponse, isPending } = useQuery<AxiosResponse<any>>({
    queryKey: ['transactions'],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL}/transactions`),
  })
  const totalRmSolStaked = transactionsResponse?.data?.totalRmSolStaked ?? 0
  const totalRjitoSolStaked = transactionsResponse?.data?.totalRjitoSolStaked ?? 0
  const stats = [
    {
      label: 'Active Operators',
      value: '2',
      change: '0%',
      trend: 'up',
      icon: Shield,
    },
    // {
    //   label: 'Total Validations',
    //   value: '45,892',
    //   change: '+8.2%',
    //   trend: 'up',
    //   icon: CheckCircle,
    // },
    {
      label: 'Total Value Locked',
      value: `${totalRmSolStaked} RSOL`,
      change: '0%',
      trend: 'up',
      icon: DollarSign,
    },
    // {
    //   label: 'Active Requests',
    //   value: '328',
    //   change: '-3.1%',
    //   trend: 'down',
    //   icon: Activity,
    // },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
        return (
          <Card key={stat.label} className="p-6 bg-card border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold mb-2">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-3 h-3 ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
