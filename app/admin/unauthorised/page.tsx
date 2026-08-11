import Link from "next/link";
import BrandLogo from "../../BrandLogo";
import styles from "../admin.module.css";

export default function UnauthorisedPage() {
  return (
    <main className={styles.screen}>
      <section className={styles.shell} style={{ maxWidth: 640 }}>
        <div className={styles.topbar}>
          <BrandLogo tone="dark" />
        </div>
        <p className={styles.kicker}>Access restricted</p>
        <h1 className={styles.title}>This account is not authorised.</h1>
        <p className={styles.intro}>Ask an existing administrator to mark your Supabase profile as an admin before using the dashboard.</p>
        <div style={{ marginTop: 26 }}>
          <Link className={styles.secondaryButton} href="/admin/login">
            Return to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}

