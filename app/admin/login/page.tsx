import AdminLoginForm from "../AdminLoginForm";
import BrandLogo from "../../BrandLogo";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  return (
    <main className={styles.screen}>
      <section className={styles.shell} style={{ maxWidth: 520 }}>
        <div className={styles.topbar}>
          <BrandLogo tone="dark" />
        </div>
        <p className={styles.kicker}>Admin access</p>
        <h1 className={styles.title}>Sign in to the contract centre.</h1>
        <p className={styles.intro}>Admin accounts can create, review, package, and download client contract documents.</p>
        <div style={{ marginTop: 28 }}>
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}

