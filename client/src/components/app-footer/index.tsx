import { OzonLogo } from '@/components/ozon-logo'
import styles from './index.module.scss'
import { Link } from 'react-router'

export function AppFooter() {
  return (
    <footer className={styles.appFooter}>
      <div>
        <OzonLogo />
        <h4>Get product updates & early-access rewards</h4>
        <div className={styles.subscribeContainer}>
          <input placeholder="name@email.com" /> <button>Subscribe</button>
        </div>
      </div>
      <div className={styles.appFooterActionsContainer}>
        <Link to="/">Join As Restaker</Link>
        <Link to="/">Register As Operator</Link>
      </div>
    </footer>
  )
}
