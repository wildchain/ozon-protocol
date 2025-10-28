'use client'

import { Card } from '@/components/ui/card'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import axios, { AxiosResponse } from 'axios'
import { useQuery } from '@tanstack/react-query'

const data = [
  { date: '12h ago', stakes: 12, unstakes: 8 },
  { date: '11h ago', stakes: 15, unstakes: 7 },
  { date: '10h ago', stakes: 9, unstakes: 11 },
  { date: '9h ago', stakes: 18, unstakes: 10 },
  { date: '8h ago', stakes: 13, unstakes: 6 },
  { date: '7h ago', stakes: 19, unstakes: 12 },
  { date: '6h ago', stakes: 8, unstakes: 14 },
  { date: '5h ago', stakes: 14, unstakes: 9 },
  { date: '4h ago', stakes: 11, unstakes: 10 },
  { date: '3h ago', stakes: 10, unstakes: 8 },
  { date: '2h ago', stakes: 16, unstakes: 7 },
  { date: '1h ago', stakes: 12, unstakes: 11 },
  { date: 'Now', stakes: 17, unstakes: 9 },
]

const chartConfig = {
  stakes: {
    label: 'Stakes',
    color: '#22c55e', // green
  },
  unstakes: {
    label: 'Unstakes',
    color: '#ef4444', // red
  },
}

export function ActivityChart() {
  const { data: transactionsResponse, isPending } = useQuery<AxiosResponse<any>>({
    queryKey: ['transactions'],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL}/transactions`),
  })
  const transactions = transactionsResponse?.data?.transactionHourMap ?? {}
  const data = Object.entries(transactions).map(([hour, count]) => ({
    date: hour,
    //@ts-ignore
    stakes: count?.stakedCount || 0,
    //@ts-ignore
    unstakes: count?.unstakedCount || 0,
  }))
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Staking Activity</h3>
          <p className="text-sm text-muted-foreground">Last 12 hours</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-sm text-muted-foreground">Stakes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-sm text-muted-foreground">Unstakes</span>
          </div>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="stakes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="unstakes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="stakes" stroke="#22c55e" fill="url(#stakes)" strokeWidth={2} />
          <Area type="monotone" dataKey="unstakes" stroke="#ef4444" fill="url(#unstakes)" strokeWidth={2} />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}
