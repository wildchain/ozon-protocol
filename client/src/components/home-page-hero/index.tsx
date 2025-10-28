import { Link, useNavigate } from 'react-router'
import styles from './index.module.scss'
import { DashboardType, useDashboardContext } from '@/hooks/use-dashboard-context'
import { Loader, Modal } from '@mantine/core'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { notifications } from '@mantine/notifications'
import { useOzonProgram } from '@/hooks/use-ozon-program'
import { AdminWalletContractCalls } from '@/contracts'
import { PublicKey } from '@solana/web3.js'
import { Idl, Program } from '@coral-xyz/anchor'

export function HomePageHero() {
  const { setDashboardType } = useDashboardContext()
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [currentLoadingType, setCurrentLoadingType] = useState<DashboardType | null>(null)
  const wallet = useWallet()
  const navigate = useNavigate()
  const handlejoinAsRestaker = async () => {
    if (!wallet.connected) {
      notifications.show({
        title: 'Error',
        message: 'Please connect your wallet to join as a restaker',
        color: 'red',
      })
      return
    }
    setCurrentLoadingType(DashboardType.RESTAKER)
    setShowLoadingModal(true)
    setTimeout(() => {
      setShowLoadingModal(false)
      setDashboardType(DashboardType.RESTAKER)
      navigate('/restaker-dashboard')
    }, 2000)
    setShowLoadingModal(false)
    setDashboardType(DashboardType.RESTAKER)
    navigate('/restaker-dashboard')
  }
  const joinAsOperator = () => {
    if (!wallet.connected) {
      notifications.show({
        title: 'Error',
        message: 'Please connect your wallet to join as an operator',
        color: 'red',
      })
      return
    }
    setCurrentLoadingType(DashboardType.OPERATOR)
    setDashboardType(DashboardType.OPERATOR)
    navigate('/account')
  }
  return (
    <div className={styles.homePageHero}>
      <h1>
        Where Your Yield Meets <br /> <span className="purple-gradient-text">Real Impact.</span>
      </h1>
      <p>
        Restake your staked tokens to help secure bridges, oracles, and data services, while earning rewards and funding
        conservation. Put your capital to work twice, for the network's security and for the planet.
      </p>
      <div className={styles.homePageHeroActionsContainer}>
        <button onClick={handlejoinAsRestaker}>Join As Restaker</button>
        <a href="https://crates.io/crates/ozon-cli" target="_blank" rel="noopener noreferrer">
          Register As Operator
        </a>
      </div>
      <Modal
        styles={{
          root: {
            background: '#171717',
          },
          body: {
            background: '#171717',
          },
          header: {
            background: '#171717',
          },
        }}
        opened={showLoadingModal}
        onClose={() => {}}
        centered
      >
        <div className={styles.loadingModal}>
          <Loader size="lg" />
          <h5>Joining as {currentLoadingType}</h5>
        </div>
      </Modal>
    </div>
  )
}
