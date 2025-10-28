import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Database, Cloud, Thermometer, DollarSign } from 'lucide-react'

const requests = [
  {
    id: 'REQ-4521',
    source: 'Weather API',
    type: 'Weather Data',
    requester: 'InsureChain',
    operators: 3,
    status: 'validating',
    reward: '250',
    icon: Thermometer,
  },
  {
    id: 'REQ-4520',
    source: 'CoinGecko',
    type: 'Price Feed',
    requester: 'DeFi Protocol',
    operators: 5,
    status: 'completed',
    reward: '500',
    icon: DollarSign,
  },
  {
    id: 'REQ-4519',
    source: 'NASA API',
    type: 'Scientific Data',
    requester: 'Research DAO',
    operators: 2,
    status: 'validating',
    reward: '350',
    icon: Database,
  },
  {
    id: 'REQ-4518',
    source: 'IoT Network',
    type: 'Sensor Data',
    requester: 'Supply Chain',
    operators: 4,
    status: 'completed',
    reward: '400',
    icon: Cloud,
  },
]

export function DataRequests() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Active Data Requests</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
          View All
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
      <div className="space-y-3">
        {requests.map((request) => {
          const Icon = request.icon
          return (
            <div
              key={request.id}
              className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold">{request.type}</h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            request.status === 'completed'
                              ? 'bg-success/10 text-success border-success/20'
                              : 'bg-warning/10 text-warning border-warning/20'
                          }`}
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Source: <span className="text-foreground">{request.source}</span>
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{request.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{request.reward} OZON</p>
                      <p className="text-xs text-muted-foreground">Reward</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Requester: </span>
                        <span className="text-foreground font-medium">{request.requester}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Operators: </span>
                        <span className="text-primary font-medium">{request.operators}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
