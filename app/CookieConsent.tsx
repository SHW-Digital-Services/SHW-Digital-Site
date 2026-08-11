"use client";

import { useState, useSyncExternalStore } from "react";

type Consent = { analytics: boolean; marketing: boolean; embeds: boolean };
const STORAGE_KEY = "shw-cookie-consent";
const EMPTY_SNAPSHOT = "";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("shw-cookie-consent", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("shw-cookie-consent", callback);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

function parseConsent(snapshot: string) {
  if (!snapshot) return null;

  try {
    return JSON.parse(snapshot) as Consent;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [editing, setEditing] = useState(false);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const consent = parseConsent(snapshot);

  function save(next: Consent) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("shw-cookie-consent", { detail: next }));
    } catch {
      // Consent still applies for this session if storage is unavailable.
    }

    setEditing(false);
  }

  if (consent && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        style={{ position: "fixed", bottom: 20, right: 70, zIndex: 300, background: "rgba(26, 16, 56, 0.9)", border: "1px solid rgba(192, 132, 252, 0.5)", borderRadius: 999, color: "#D8B4FE", cursor: "pointer", fontSize: 12, padding: "9px 13px" }}
      >
        Cookie settings
      </button>
    );
  }

  return (
    <aside role="dialog" aria-label="Cookie preferences" style={{ position: "fixed", bottom: 20, left: 20, right: 70, zIndex: 300, background: "rgba(14, 7, 32, 0.97)", border: "1px solid #6D28D9", borderRadius: 18, boxShadow: "0 0 35px rgba(76, 29, 149, 0.45)", color: "#F5EFFF", padding: "22px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>Your cookie choices</h2>
        <p style={{ color: "#C7B7DD", fontSize: 14, lineHeight: 1.55, margin: "0 0 18px", maxWidth: 760 }}>SHW Digital Services uses essential cookies to operate this website. With your permission, SHW Digital Services may also use analytics, marketing, and embedded third-party content. You can change your choice at any time.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button type="button" onClick={() => save({ analytics: true, marketing: true, embeds: true })} style={{ background: "#A855F7", border: 0, borderRadius: 999, color: "white", cursor: "pointer", fontWeight: 700, padding: "11px 17px" }}>Accept all</button>
          <button type="button" onClick={() => save({ analytics: false, marketing: false, embeds: false })} style={{ background: "transparent", border: "1px solid #C084FC", borderRadius: 999, color: "#F5EFFF", cursor: "pointer", padding: "10px 17px" }}>Reject non-essential</button>
          <a href="/legal#cookies" style={{ alignItems: "center", color: "#D8B4FE", display: "inline-flex", padding: "10px 4px" }}>Read the cookie policy</a>
        </div>
      </div>
    </aside>
  );
}
