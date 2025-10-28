import { useContext } from 'react'
import { useState, createContext } from 'react'

export enum DashboardType {
  RESTAKER = 'restaker',
  OPERATOR = 'operator',
}

type DashboardContextProps = {
  dashboardType: DashboardType
  setDashboardType: (dashboardType: DashboardType) => void
}

export const DashboardContext = createContext<DashboardContextProps | null>(null)

export function DashboardContextProvider({ children }: { children: React.ReactNode }) {
  const [dashboardType, setDashboardType] = useState<DashboardType>(DashboardType.RESTAKER)
  return <DashboardContext.Provider value={{ dashboardType, setDashboardType }}>{children}</DashboardContext.Provider>
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardContextProvider')
  }
  return context
}
