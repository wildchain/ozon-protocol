import { OzonTokenName } from '@/common'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { OzonTokenAddressConfigContext } from '@/hooks/use-token-address-config'
import { notifications } from '@mantine/notifications'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useContext, useEffect, useState } from 'react'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'

export type UserTokenAccountsMap = Partial<Record<OzonTokenName, PublicKey>>

export type UserRestakingAccountData = {
  rewardDebt: number
  restakedMint: string
  restakedAmount: number
  depositedAmount: number
  cooldownEndSlot: number
  pendingUnstake: number
  lastClaimedSlot: number
  despositedMint: string
}

const defaultUserRestakingAccountData: UserRestakingAccountData = {
  rewardDebt: 0,
  restakedMint: '',
  restakedAmount: 0,
  depositedAmount: 0,
  cooldownEndSlot: 0,
  pendingUnstake: 0,
  lastClaimedSlot: 0,
  despositedMint: '',
}

export function useAccounts() {
  const { wallet } = useWallet()
  const { program } = useOzonProgram()
  const [tokenBalances, setTokenBalances] = useState<Partial<Record<OzonTokenName, number | string | bigint>>>({
    [OzonTokenName.RMSOL]: 0,
    [OzonTokenName.RJITOSOL]: 0,
    [OzonTokenName.MSOL]: 0,
    [OzonTokenName.JITOSOL]: 0,
  })
  const [isBalancesLoading, setIsBalancesLoading] = useState(false)
  const ozonTokenAddressConfig = useContext(OzonTokenAddressConfigContext)
  const [rmSolUserRestakingAccountData, setRmSolUserRestakingAccountData] = useState<UserRestakingAccountData>(
    defaultUserRestakingAccountData,
  )
  const [rjitoSolUserRestakingAccountData, setRjitoSolUserRestakingAccountData] = useState<UserRestakingAccountData>(
    defaultUserRestakingAccountData,
  )

  if (!program || !wallet?.adapter.publicKey) {
    return notifications.show({
      title: 'Error',
      message: 'Program or wallet not available. Please refresh the page.',
      color: 'red',
    })
  }
  if (!ozonTokenAddressConfig) {
    // throw new Error('Ozon token address config not initialized properly')
    return notifications.show({
      title: 'Error',
      message: 'Ozon token address config not initialized properly. Please refresh the page.',
      color: 'red',
    })
  }
  if (!ozonTokenAddressConfig.ozonTokenAddressConfig) {
    return notifications.show({
      title: 'Error',
      message: 'Ozon token address config not initialized properly. Please refresh the page.',
      color: 'red',
    })
  }
  const environment = import.meta.env.APPLICATION_ENVIRONMENT || 'development'
  const RM_SOL_PUBLIC_KEY = new PublicKey(
    ozonTokenAddressConfig.ozonTokenAddressConfig?.RMSOL?.[environment]?.publicKey,
  )
  const RJITO_SOL_PUBLIC_KEY = new PublicKey(
    ozonTokenAddressConfig.ozonTokenAddressConfig?.RJITOSOL?.[environment]?.publicKey,
  )
  const MSOL_PUBLIC_KEY = new PublicKey(ozonTokenAddressConfig.ozonTokenAddressConfig?.MSOL?.[environment]?.publicKey)
  const JITO_SOL_PUBLIC_KEY = new PublicKey(
    ozonTokenAddressConfig.ozonTokenAddressConfig?.JITOSOL?.[environment]?.publicKey,
  )
  const loadTokenBalances = async () => {
    setIsBalancesLoading(true)
    try {
      const user = wallet?.adapter.publicKey
      if (!user) return
      // Get associated token accounts for each token
      const tokenAccounts = await Promise.all([
        getAssociatedTokenAddress(MSOL_PUBLIC_KEY, user),
        getAssociatedTokenAddress(JITO_SOL_PUBLIC_KEY, user),
        getAssociatedTokenAddress(RM_SOL_PUBLIC_KEY, user),
        getAssociatedTokenAddress(RJITO_SOL_PUBLIC_KEY, user),
      ])
      // Fetch account info for each token account
      const accountInfos = await Promise.all(
        tokenAccounts.map((account) => getAccount(program.provider.connection, account).catch(() => null)),
      )
      setTokenBalances({
        [OzonTokenName.MSOL]: accountInfos[0]?.amount || 0,
        [OzonTokenName.JITOSOL]: accountInfos[1]?.amount || 0,
        [OzonTokenName.RMSOL]: accountInfos[2]?.amount || 0,
        [OzonTokenName.RJITOSOL]: accountInfos[3]?.amount || 0,
      })
    } catch (error) {
      console.error('Error loading token balances:', error)
    } finally {
      setIsBalancesLoading(false)
    }
  }
  const loadUserRestakingAccountData = async () => {
    try {
      const user = wallet?.adapter.publicKey
      if (!user) return
      const [RM_SOL_USER_RESTAKING_ACCOUNT] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_restaking'), user.toBytes(), RM_SOL_PUBLIC_KEY.toBytes()],
        program.programId,
      )
      const [RJITO_SOL_USER_RESTAKING_ACCOUNT] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_restaking'), user.toBytes(), RJITO_SOL_PUBLIC_KEY.toBytes()],
        program.programId,
      )
      try {
        const rmSolUserRestakingAccountData =
          await program.account['userRestakingAccount'].fetch(RM_SOL_USER_RESTAKING_ACCOUNT)

        setRmSolUserRestakingAccountData({
          rewardDebt: rmSolUserRestakingAccountData?.rewardDebt?.toNumber(),
          restakedMint: rmSolUserRestakingAccountData?.restakedMint.toString(),
          restakedAmount: rmSolUserRestakingAccountData?.restakedAmount?.toNumber(),
          depositedAmount: rmSolUserRestakingAccountData?.depositedAmount?.toNumber(),
          cooldownEndSlot: rmSolUserRestakingAccountData?.cooldownEndSlot?.toNumber(),
          pendingUnstake: rmSolUserRestakingAccountData?.pendingUnstake?.toNumber(),
          lastClaimedSlot: rmSolUserRestakingAccountData?.lastClaimedSlot?.toNumber(),
          despositedMint: rmSolUserRestakingAccountData?.despositedMint?.toString(),
        })
      } catch (error) {
        console.error('Error loading rm sol user restaking account data:', error)
      }
      try {
        const rjitoSolUserRestakingAccountData = await program.account['userRestakingAccount'].fetch(
          RJITO_SOL_USER_RESTAKING_ACCOUNT,
        )
        setRjitoSolUserRestakingAccountData({
          rewardDebt: rjitoSolUserRestakingAccountData.rewardDebt?.toNumber(),
          restakedMint: rjitoSolUserRestakingAccountData.restakedMint.toString(),
          restakedAmount: rjitoSolUserRestakingAccountData.restakedAmount?.toNumber(),
          depositedAmount: rjitoSolUserRestakingAccountData.depositedAmount?.toNumber(),
          cooldownEndSlot: rjitoSolUserRestakingAccountData.cooldownEndSlot?.toNumber(),
          pendingUnstake: rjitoSolUserRestakingAccountData.pendingUnstake?.toNumber(),
          lastClaimedSlot: rjitoSolUserRestakingAccountData.lastClaimedSlot?.toNumber(),
          despositedMint: rjitoSolUserRestakingAccountData.despositedMint?.toString(),
        })
      } catch (error) {
        console.error('Error loading rjito sol user restaking account data:', error)
      }
    } catch (error) {
      console.error('Error loading user restaking account data:', error)
    }
  }
  useEffect(() => {
    loadTokenBalances()
    loadUserRestakingAccountData()
  }, [])
  return {
    RM_SOL_PUBLIC_KEY,
    RJITO_SOL_PUBLIC_KEY,
    MSOL_PUBLIC_KEY,
    JITO_SOL_PUBLIC_KEY,
    tokenBalances,
    isBalancesLoading,
    loadTokenBalances,
    loadUserRestakingAccountData,
    rmSolUserRestakingAccountData,
    rjitoSolUserRestakingAccountData,
  }
}
