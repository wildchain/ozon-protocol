import { connection } from '@/contracts'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'
import bs58 from 'bs58'

export interface Operator {
  owner: string
  bondAmount: number
  metadata: string
  active: boolean
  avsCount: number
  bump: number
  vaultBump: number
}

export function useOperators() {
  const { program } = useOzonProgram()
  const [operators, setOperators] = useState<Operator[]>([])
  const loadOperators = async () => {
    // this comes from your IDL "accountDiscriminators" section or you can compute it
    const OPERATOR_ACCOUNT_DISCRIMINATOR = bs58.encode(Buffer.from([65, 8, 134, 32, 87, 254, 91, 212]))

    // fetch all operator accounts
    const operatorAccounts = await connection.getProgramAccounts(program!!.programId as any, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: OPERATOR_ACCOUNT_DISCRIMINATOR,
          },
        },
      ],
    })

    console.log(`Found ${operatorAccounts.length} operator accounts`)

    for (const acc of operatorAccounts) {
      console.log(program?.coder.accounts.decode('operatorAccount', acc.account.data))
    }
    setOperators(
      operatorAccounts.map((acc) => ({
        ...(program?.coder.accounts.decode('operatorAccount', acc.account.data) as Operator),
        owner: acc.pubkey.toString(),
      })),
    )
  }
  useEffect(() => {
    loadOperators()
  }, [])

  return {
    operators,
    loadOperators,
  }
}
