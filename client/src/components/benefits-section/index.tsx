import styles from './index.module.scss'
import BenefitsImage from '../../assets/images/security-visual.png'

export function BenefitsSection() {
  return (
    <section className={styles.benefitsSection}>
      <div className={styles.benefitsSectionImageContainer}>
        <img src={BenefitsImage} alt="Benefits" />
        <div className={styles.benefitsSectionImageUnderlay} />
      </div>
      <div>
        <h2>
          Security <br /> Meets <br /> <span className="purple-gradient-text">Sustainability</span>
        </h2>
        <p>
          Ozon transforms idle staking capital into a living defense layer for Solana. Together, we protect billions in
          value and give back to the world that sustains it.
        </p>
      </div>
    </section>
  )
}
