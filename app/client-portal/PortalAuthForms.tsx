"use client";

import { useActionState } from "react";
import { KeyRound, LogIn, UserPlus } from "lucide-react";
import { createClientAccount, requestPasswordReset, signInClient, type PortalActionState } from "./actions";
import styles from "./portal.module.css";

const initialState: PortalActionState = { message: "", ok: false };

export default function PortalAuthForms() {
  const [signInState, signInAction, signInPending] = useActionState(signInClient, initialState);
  const [createState, createAction, createPending] = useActionState(createClientAccount, initialState);
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, initialState);

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

      <form action={resetAction} className={styles.panel}>
        <h2>Reset password</h2>
        <label className={styles.field}>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        {resetState.message ? <p className={resetState.ok ? styles.success : styles.error}>{resetState.message}</p> : null}
        <button className={styles.primaryButton} disabled={resetPending} type="submit">
          <KeyRound size={18} aria-hidden="true" />
          {resetPending ? "Sending" : "Forgot password?"}
        </button>
      </form>
    </div>
  );
}
