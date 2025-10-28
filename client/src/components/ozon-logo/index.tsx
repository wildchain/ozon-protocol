import styles from './index.module.scss'
import OzonPng from '@/assets/images/Ozon Logo_Configuration_Logo_White.png'

export function OzonLogo() {
  return (
    <div className={styles.ozonLogo}>
      <img src={OzonPng} alt="Ozon Logo" />
    </div>
  )
}
