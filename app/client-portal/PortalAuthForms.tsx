"use client";

import { useActionState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { createClientAccount, signInClient, type PortalActionState } from "./actions";
import styles from "./portal.module.css";

const initialState: PortalActionState = { message: "", ok: false };

export default function PortalAuthForms() {
  const [signInState, signInAction, signInPending] = useActionState(signInClient, initialState);
  const [createState, createAction, createPending] = useActionState(createClientAccount, initialState);

  return (
    <div className={styles.authGrid}>
      <form action={signInAction} className={styles.panel}>
        <h2>Sign in</h2>
        <label className={styles.field}>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {signInState.message ? <p className={signInState.ok ? styles.success : styles.error}>{signInState.message}</p> : null}
        <button className={styles.primaryButton} disabled={signInPending} type="submit">
          <LogIn size={18} aria-hidden="true" />
          {signInPending ? "Signing in" : "Sign in"}
        </button>
      </form>

      <form action={createAction} className={styles.panel}>
        <h2>Create account</h2>
        <label className={styles.field}>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        {createState.message ? <p className={createState.ok ? styles.success : styles.error}>{createState.message}</p> : null}
        <button className={styles.primaryButton} disabled={createPending} type="submit">
          <UserPlus size={18} aria-hidden="true" />
          {createPending ? "Creating" : "Create account"}
        </button>
      </form>
    </div>
  );
}
