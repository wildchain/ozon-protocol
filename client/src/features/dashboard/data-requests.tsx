import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle } from 'lucide-react'

const transactions = [
  {
    id: 'TXN-4521',
    type: 'Stake',
    requester: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    value: '12.5',
    status: 'pending',
    timestamp: '2m ago',
    icon: ArrowUpCircle,
  },
  {
    id: 'TXN-4520',
    type: 'Unstake',
    requester: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    value: '8.3',
    status: 'completed',
    timestamp: '5m ago',
    icon: ArrowDownCircle,
  },
  {
    id: 'TXN-4519',
    type: 'Stake',
    requester: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    value: '25.7',
    status: 'processing',
    timestamp: '8m ago',
    icon: ArrowUpCircle,
  },
  {
    id: 'TXN-4518',
    type: 'Unstake',
    requester: '3xJ3L4vXmWnF5dK7vB8qR2tY9uE6wA1sC4mN8pL5hG7j',
    value: '15.2',
    status: 'completed',
    timestamp: '12m ago',
    icon: ArrowDownCircle,
  },
  {
    id: 'TXN-4517',
    type: 'Stake',
    requester: '8F7v2K9mN3qR5tY1uE6wA4sC7mN9pL2hG5jK8vB6qR3',
    value: '6.8',
    status: 'pending',
    timestamp: '15m ago',
    icon: ArrowUpCircle,
  },
]

export function DataRequests() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'processing':
        return <Clock className="w-4 h-4 text-warning" />
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20'
      case 'processing':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'pending':
        return 'bg-muted/10 text-muted-foreground border-muted/20'
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20'
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
          View All
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const Icon = transaction.icon
          return (
            <div
              key={transaction.id}
              className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'Stake' ? 'bg-success/10' : 'bg-destructive/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${transaction.type === 'Stake' ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold">{transaction.type}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(transaction.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize">{transaction.status}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Address:{' '}
                        <span className="text-foreground font-mono">{formatAddress(transaction.requester)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{transaction.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{transaction.value} rSOL</p>
                      <p className="text-xs text-muted-foreground">Value</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Requester: </span>
                        <span className="text-foreground font-mono">{formatAddress(transaction.requester)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Time: </span>
                        <span className="text-primary font-medium">{transaction.timestamp}</span>
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
