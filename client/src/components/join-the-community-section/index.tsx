import styles from './index.module.scss'

interface IndexProps {}

export function JoinTheCommunitySection() {
  return (
    <section className={styles.joinTheCommunitySection}>
      <h1>Join the Ozon community!</h1>
      <p>Be first to hear about new launches and earn early adopter rewards</p>
      <button>Get Early Access</button>
    </section>
  )
}
