import { HomePageHero } from '@/components/home-page-hero'
import styles from './index.module.scss'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { BenefitsSection } from '@/components/benefits-section'
import { JoinTheCommunitySection } from '@/components/join-the-community-section'

export function Home() {
  return (
    <div className={styles.home}>
      <HomePageHero />
      <HowItWorksSection />
      <BenefitsSection />
      <JoinTheCommunitySection />
    </div>
  )
}
