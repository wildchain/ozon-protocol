import { useProvider } from '@/hooks/use-provider'
import { Program } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { createContext, useContext, useEffect, useState } from 'react'
import idl from 'restaking_programs.json'

const RESTAKED_SOL_MINT_PUBLIC_KEY = new PublicKey('Dnc6QpqsSfrte1jB8beiGAByzY1N4yXsHZwjECm5ncJF')

export const OzonProgramContext = createContext<{
  program: Program | null
  idl: any
  loading: boolean
} | null>(null)

export function OzonProgramProvider({ children }: { children: React.ReactNode }) {
  const provider = useProvider()
  const [loading, setLoading] = useState(false)

  const program = new Program(idl, provider as any)
  const loadUserRestakingAccountData = async () => {
    setLoading(true)
    if (!provider) {
      return
    }

    setLoading(false)
  }
  useEffect(() => {
    loadUserRestakingAccountData()
  }, [])
  if (!provider) {
    return <OzonProgramContext.Provider value={{ program: null, idl, loading }}>{children}</OzonProgramContext.Provider>
  }

  return <OzonProgramContext.Provider value={{ program, idl, loading }}>{children}</OzonProgramContext.Provider>
}

export function useOzonProgram() {
  const context = useContext(OzonProgramContext)
  if (!context) {
    throw new Error('useOzonProgram must be used within an OzonProgramProvider')
  }
  return context
}
