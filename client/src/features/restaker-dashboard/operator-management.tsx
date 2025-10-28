'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, TrendingUp, Users, CheckCircle2 } from 'lucide-react'
import { useOperators } from '@/hooks/use-operators'
import { lamportsToSol } from 'gill'

export function OperatorManagement() {
  const {} = useOperators()
  const { operators } = useOperators()

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Operators
            </CardTitle>
            <CardDescription>Active validators providing restaking services</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {operators.map((operator, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{operator.metadata}</h4>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {operator.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Bond: {lamportsToSol(operator.bondAmount)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Performance</p>
                  <p className="text-sm font-semibold text-success">{operator.avsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Delegators
                  </p>
                  <p className="text-sm font-semibold">{operator.avsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    APY
                  </p>
                  <p className="text-sm font-semibold text-success">{lamportsToSol(operator.bondAmount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
