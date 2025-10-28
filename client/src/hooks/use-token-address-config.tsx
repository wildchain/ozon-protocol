import { PublicKey } from '@solana/web3.js'
import { EnvironmentName, OzonTokenName } from '@/common'
import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export class OzonTokenAddressConfigModel {
  mintAddress: string
  publicKey: PublicKey
  name: string

  constructor({ mintAddress, name }: { mintAddress: string; name: string }) {
    this.mintAddress = mintAddress
    this.publicKey = new PublicKey(mintAddress)
    this.name = name
  }
  toJSON() {
    return {
      mintAddress: this.mintAddress,
      name: this.name,
      publicKey: this.mintAddress,
    }
  }
}

export type OzonTokenAddressConfigMap = Partial<
  Record<OzonTokenName, Partial<Record<EnvironmentName, OzonTokenAddressConfigModel>>>
>

export type OzonTokenAddressConfigContextType = {
  ozonTokenAddressConfig: OzonTokenAddressConfigMap | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export const OzonTokenAddressConfigContext = createContext<OzonTokenAddressConfigContextType>({
  ozonTokenAddressConfig: null,
  isLoading: false,
  isError: false,
  error: null,
  refetch: () => {},
})

export function OzonTokenAddressConfigProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ozon-token-address-config'],
    queryFn: () => axios.get(`${import.meta.env.VITE_API_URL}/token-address-config-map`),
  })
  return (
    <OzonTokenAddressConfigContext.Provider
      value={{
        isLoading,
        isError,
        error,
        refetch,
        ozonTokenAddressConfig: data?.data,
      }}
    >
      {children}
    </OzonTokenAddressConfigContext.Provider>
  )
}

export function useOzonTokenAddressConfig(name: OzonTokenName, environment?: EnvironmentName) {
  const contextData = useContext(OzonTokenAddressConfigContext)
  if (!contextData) {
    throw new Error('useOzonTokenAddressConfig must be used within an OzonTokenAddressConfigProvider')
  }
  if (!contextData.ozonTokenAddressConfig) {
    throw new Error('Ozon token address config not initialized properly')
  }
  const config = contextData.ozonTokenAddressConfig?.[name]
  if (!config) {
    throw new Error(`Token address config not found for ${name}`)
  }
  let environmentToGet = environment || process.env.APPLICATION_ENVIRONMENT
  if (environmentToGet === 'staging' || !environmentToGet) {
    environmentToGet = EnvironmentName.DEVELOPMENT
  }
  return config[environmentToGet] as OzonTokenAddressConfigModel
}
