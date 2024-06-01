import Link from 'next/link';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={`${styles.section} ${styles.section1}`}>
        <Link href="/create-wine-profile">
          {/* <p className={styles.link}> */}
            <h2 className={styles.title}>Creare Profil Vin</h2>
          {/* </p> */}
        </Link>
        <p className={styles.description}>Caută vinuri după diferite criterii.</p>
      </div>
      <div className={`${styles.section} ${styles.section2}`}>
        <Link href="/compare-wines">
          {/* <p className={styles.link}> */}
            <h2 className={styles.title}>Comparare Vinuri</h2>
          {/* </p> */}
        </Link>
        <p className={styles.description}>Compară vinurile în baza la diferite criterii.</p>
      </div>
      <div className={`${styles.section} ${styles.section3}`}>
        <Link href="/recommend-wine">
          {/* <p className={styles.link}> */}
            <h2 className={styles.title}>Recomandare Vin</h2>
          {/* </p> */}
        </Link>
        <p className={styles.description}>În baza unei descrieri găseste potrivite.</p>
      </div>
    </div>
  );
}
