import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExternalLink, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, Search, Filter } from 'lucide-react'
import { useState } from 'react'
import { TransactionInitArgs } from '@/common/models'
import axios, { AxiosResponse } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { lamportsToSol } from 'gill'
import { DateTime } from 'luxon'

// const allTransactions = [
//   {
//     id: 'TXN-4521',
//     type: 'Stake',
//     requester: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
//     value: '12.5',
//     status: 'pending',
//     timestamp: '2m ago',
//     icon: ArrowUpCircle,
//   },
//   {
//     id: 'TXN-4520',
//     type: 'Unstake',
//     requester: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
//     value: '8.3',
//     status: 'completed',
//     timestamp: '5m ago',
//     icon: ArrowDownCircle,
//   },
//   {
//     id: 'TXN-4519',
//     type: 'Stake',
//     requester: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
//     value: '25.7',
//     status: 'processing',
//     timestamp: '8m ago',
//     icon: ArrowUpCircle,
//   },
//   {
//     id: 'TXN-4518',
//     type: 'Unstake',
//     requester: '3xJ3L4vXmWnF5dK7vB8qR2tY9uE6wA1sC4mN8pL5hG7j',
//     value: '15.2',
//     status: 'completed',
//     timestamp: '12m ago',
//     icon: ArrowDownCircle,
//   },
//   {
//     id: 'TXN-4517',
//     type: 'Stake',
//     requester: '8F7v2K9mN3qR5tY1uE6wA4sC7mN9pL2hG5jK8vB6qR3',
//     value: '6.8',
//     status: 'pending',
//     timestamp: '15m ago',
//     icon: ArrowUpCircle,
//   },
//   {
//     id: 'TXN-4516',
//     type: 'Unstake',
//     requester: '2K9mN3qR5tY1uE6wA4sC7mN9pL2hG5jK8vB6qR3xJ3L',
//     value: '33.1',
//     status: 'completed',
//     timestamp: '18m ago',
//     icon: ArrowDownCircle,
//   },
//   {
//     id: 'TXN-4515',
//     type: 'Stake',
//     requester: '4vXmWnF5dK7vB8qR2tY9uE6wA1sC4mN8pL5hG7j3xJ3',
//     value: '19.4',
//     status: 'processing',
//     timestamp: '22m ago',
//     icon: ArrowUpCircle,
//   },
//   {
//     id: 'TXN-4514',
//     type: 'Stake',
//     requester: '6wA1sC4mN8pL5hG7j3xJ3L4vXmWnF5dK7vB8qR2tY9',
//     value: '7.2',
//     status: 'completed',
//     timestamp: '25m ago',
//     icon: ArrowUpCircle,
//   },
//   {
//     id: 'TXN-4513',
//     type: 'Unstake',
//     requester: '8pL5hG7j3xJ3L4vXmWnF5dK7vB8qR2tY9uE6wA1sC4',
//     value: '14.6',
//     status: 'pending',
//     timestamp: '28m ago',
//     icon: ArrowDownCircle,
//   },
//   {
//     id: 'TXN-4512',
//     type: 'Stake',
//     requester: '1sC4mN8pL5hG7j3xJ3L4vXmWnF5dK7vB8qR2tY9uE6',
//     value: '41.8',
//     status: 'completed',
//     timestamp: '32m ago',
//     icon: ArrowUpCircle,
//   },
// ]

export function DataRequests() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { data: transactionsResponse, isPending } = useQuery<AxiosResponse<any>>({
    queryKey: ['transactions'],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL}/transactions`),
  })
  const transactions = transactionsResponse?.data?.transactions ?? []

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

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.wallet_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesType = typeFilter === 'all' || transaction.type.toLowerCase() === typeFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesType
  })

  const TransactionItem = ({ transaction }: { transaction: any }) => {
    const Icon = transaction.icon
    return (
      <div className="p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              transaction.type === 'Stake' ? 'bg-success/10' : 'bg-destructive/10'
            }`}
          >
            {/* <Icon className={`w-5 h-5 ${transaction.type === 'Stake' ? 'text-success' : 'text-destructive'}`} /> */}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">{transaction.type}</h4>
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(transaction.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(transaction.status)}
                      <span className="capitalize">{transaction.status}</span>
                    </div>
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  Address:{' '}
                  <span className="text-foreground font-mono">{formatAddress(transaction.wallet_address)}</span>
                </p>
                <p className="text-xs text-muted-foreground font-mono">{transaction.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">
                  {lamportsToSol(transaction.amount)} {transaction.token_name}
                </p>
                <p className="text-xs text-muted-foreground">Value</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="text-xs">
                  <span className="text-muted-foreground">Requester: </span>
                  <span className="text-foreground font-mono">{formatAddress(transaction.wallet_address)}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Time: </span>
                  <span className="text-primary font-medium">
                    {DateTime.fromMillis(transaction.created_at).toLocaleString(DateTime.DATETIME_MED)}
                  </span>
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
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90">
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>All Transactions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by ID, address, or value..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="stake">Stake</SelectItem>
                      <SelectItem value="unstake">Unstake</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>

              {/* Transactions List */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TransactionItem key={transaction.hash} transaction={transaction} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found matching your criteria
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.hash} transaction={transaction} />
        ))}
      </div>
    </Card>
  )
}
