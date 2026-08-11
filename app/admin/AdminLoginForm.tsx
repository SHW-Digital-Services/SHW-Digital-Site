"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { signInAdmin, type ActionState } from "./actions";
import styles from "./admin.module.css";

const initialState: ActionState = {
  message: "",
  ok: false,
};

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(signInAdmin, initialState);

  return (
    <form action={formAction} className={styles.panel}>
      <label className={styles.field}>
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label className={styles.field}>
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.message ? (
        <p className={state.ok ? styles.success : styles.error} aria-live="polite">
          {state.message}
        </p>
      ) : null}
      <button className={styles.primaryButton} disabled={pending} type="submit">
        <KeyRound size={18} aria-hidden="true" />
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
