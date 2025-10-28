import styles from './index.module.scss'
import DatabaseIcon from '@/assets/images/database-icon.png'
import ShieldIcon from '@/assets/images/shield-icon.png'
import DollarSignIcon from '@/assets/images/dollar-circle-icon.png'

export function HowItWorksSection() {
  return (
    <section className={styles.howItWorksSection}>
      <h2>HOW IT WORKS</h2>
      <span className={styles.dataBadge}>For Data Providers, Operators & Builders</span>
      <div className={styles.featureBoxContainer}>
        {HOW_IT_WORKS_ITEMS.map((item) => (
          <div key={item.title} className={styles.featureBox}>
            <img src={item.iconUrl} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const HOW_IT_WORKS_ITEMS: {
  title: string
  description: string
  iconUrl: string
}[] = [
  {
    title: 'Submit Your Off-Chain Data',
    description:
      'Companies or projects list the off-chain data they need verified (e.g., prices, weather, scientific data).',
    iconUrl: DatabaseIcon,
  },
  {
    title: 'Stakers Verify the Data',
    description: "Independent validators stake tokens and confirm each update's accuracy",
    iconUrl: ShieldIcon,
  },
  {
    title: 'Earn Rewards or Risk Your Stake',
    description:
      'Our incentive model ensures only accurate data passes through. Honest validators get rewarded; bad actors lose their collateral. Slashed funds go into an Impact Treasury.',
    iconUrl: DollarSignIcon,
  },
]
