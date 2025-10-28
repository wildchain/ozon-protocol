import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { useOperators } from '@/hooks/use-operators'

export function TopOperators() {
  const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`
  const { operators } = useOperators()
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Top Operators</h3>
        <TrendingUp className="w-4 h-4 text-success" />
      </div>
      <div className="space-y-4">
        {operators.map((operator, index) => (
          <div key={operator.owner} className="flex items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{index + 1}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{operator.metadata}</p>
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                    {operator.avsCount}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{formatAddress(operator.owner)}</p>
              </div>
            </div>
            <div className="text-right">
              {/* <p className="text-sm font-semibold text-primary">${operator.bondAmount}</p> */}
              {/* <p className="text-xs text-muted-foreground">rSol</p> */}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
