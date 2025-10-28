'use client'

import { Card } from '@/components/ui/card'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
// import { ChartContainer,  } from "@/components/ui/chart"

const data = [
  { date: '12h ago', validations: 2400, requests: 1800 },
  { date: '11h ago', validations: 2210, requests: 1900 },
  { date: '10h ago', validations: 2290, requests: 2100 },
  { date: '9h ago', validations: 2000, requests: 1950 },
  { date: '8h ago', validations: 2181, requests: 2200 },
  { date: '7h ago', validations: 2500, requests: 2300 },
  { date: '6h ago', validations: 2100, requests: 2000 },
  { date: '5h ago', validations: 2400, requests: 2150 },
  { date: '4h ago', validations: 2210, requests: 2050 },
  { date: '3h ago', validations: 2290, requests: 2100 },
  { date: '2h ago', validations: 2000, requests: 1900 },
  { date: '1h ago', validations: 2400, requests: 2200 },
  { date: 'Now', validations: 2600, requests: 2400 },
]

const chartConfig = {
  validations: {
    label: 'Validations',
    color: 'hsl(var(--chart-1))',
  },
  requests: {
    label: 'Requests',
    color: 'hsl(var(--chart-2))',
  },
}

export function ActivityChart() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Platform Activity</h3>
          <p className="text-sm text-muted-foreground">Last 12 hours</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Validations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Requests</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="validations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="requests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          {/* <ChartTooltip content={<ChartTooltipContent />} /> */}
          <Area
            type="monotone"
            dataKey="validations"
            stroke="hsl(var(--chart-1))"
            fill="url(#validations)"
            strokeWidth={2}
          />
          <Area type="monotone" dataKey="requests" stroke="hsl(var(--chart-2))" fill="url(#requests)" strokeWidth={2} />
        </AreaChart>
      </div>
    </Card>
  )
}
