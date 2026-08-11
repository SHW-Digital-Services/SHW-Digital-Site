import Link from "next/link";
import { LogOut, Send, Save } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import PortalAuthForms from "./PortalAuthForms";
import { sendClientMessage, signOutClient, updateClientProfile } from "./actions";
import styles from "./portal.module.css";

export const dynamic = "force-dynamic";

type ContractRecord = {
  id: number;
  service_type: string;
  client_name: string;
  contract_value: number | null;
  deposit_percent: number;
  status: string;
  created_at: string;
};

type PaymentRecord = {
  id: number;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  payment_status: string;
  payment_type: string;
  payment_url: string | null;
};

type MessageRecord = {
  id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

function currency(value: number | null) {
  if (value === null) return "TBA";
  return new Intl.NumberFormat("en-GB", { currency: "GBP", style: "currency" }).format(value);
}

function dateValue(value: string | null) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

export default async function ClientPortalPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className={styles.screen}>
        <section className={styles.shell}>
          <p className={styles.kicker}>Setup required</p>
          <h1 className={styles.title}>Supabase is not configured.</h1>
          <p className={styles.intro}>Add the Supabase environment variables before using the client portal.</p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return (
      <main className={styles.screen}>
        <section className={styles.shell}>
          <div className={styles.topbar}>
            <Link className={styles.brand} href="/">
              SHW Digital Services
            </Link>
          </div>
          <p className={styles.kicker}>Client portal</p>
          <h1 className={styles.title}>Create an account or sign in.</h1>
          <p className={styles.intro}>View contracts, payment records, profile details, and send secure messages to SHW Digital Services.</p>
          <PortalAuthForms />
        </section>
      </main>
    );
  }

  const [{ data: profile }, { data: contracts }, { data: payments }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("contact_name, business_name, phone, address_line_1, address_line_2, city, postcode").eq("id", user.id).maybeSingle(),
    supabase.from("contracts").select("id, service_type, client_name, contract_value, deposit_percent, status, created_at").eq("client_email", user.email).order("created_at", { ascending: false }),
    supabase.from("contract_payments").select("id, amount, due_date, paid_at, payment_status, payment_type, payment_url").eq("client_email", user.email).order("created_at", { ascending: false }),
    supabase.from("client_messages").select("id, subject, message, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.brand} href="/">
            SHW Digital Services
          </Link>
          <form action={signOutClient}>
            <button className={styles.secondaryButton} type="submit">
              <LogOut size={17} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>

        <p className={styles.kicker}>Client portal</p>
        <h1 className={styles.title}>Your business workspace.</h1>
        <p className={styles.intro}>Signed in as {user.email}. Review contracts and payment records, keep your business profile current, and send messages to the admin portal.</p>

        <div className={styles.dashboardGrid}>
          <div className={styles.stack}>
            <form action={updateClientProfile} className={styles.panel}>
              <h2>Business profile</h2>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Contact name</span>
                  <input name="contactName" defaultValue={profile?.contact_name ?? ""} />
                </label>
                <label className={styles.field}>
                  <span>Business name</span>
                  <input name="businessName" defaultValue={profile?.business_name ?? ""} />
                </label>
                <label className={styles.field}>
                  <span>Phone</span>
                  <input name="phone" defaultValue={profile?.phone ?? ""} />
                </label>
                <label className={styles.field}>
                  <span>Address line 1</span>
                  <input name="addressLine1" defaultValue={profile?.address_line_1 ?? ""} />
                </label>
                <label className={styles.field}>
                  <span>Address line 2</span>
                  <input name="addressLine2" defaultValue={profile?.address_line_2 ?? ""} />
                </label>
                <div className={styles.row}>
                  <label className={styles.field}>
                    <span>City</span>
                    <input name="city" defaultValue={profile?.city ?? ""} />
                  </label>
                  <label className={styles.field}>
                    <span>Postcode</span>
                    <input name="postcode" defaultValue={profile?.postcode ?? ""} />
                  </label>
                </div>
                <button className={styles.primaryButton} type="submit">
                  <Save size={18} aria-hidden="true" />
                  Save profile
                </button>
              </div>
            </form>

            <form action={sendClientMessage} className={styles.panel}>
              <h2>Send message</h2>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Subject</span>
                  <input name="subject" required />
                </label>
                <label className={styles.field}>
                  <span>Message</span>
                  <textarea name="message" required />
                </label>
                <button className={styles.primaryButton} type="submit">
                  <Send size={18} aria-hidden="true" />
                  Send to admin
                </button>
              </div>
            </form>
          </div>

          <div className={styles.stack}>
            <section className={styles.panel}>
              <h2>Contracts</h2>
              <div className={styles.list}>
                {((contracts ?? []) as ContractRecord[]).map((contract) => (
                  <article className={styles.item} key={contract.id}>
                    <div className={styles.cardHeader}>
                      <h3>{contract.service_type}</h3>
                      <span className={styles.meta}>{contract.status}</span>
                    </div>
                    <p>{contract.client_name} · {currency(contract.contract_value)} · {contract.deposit_percent}% deposit</p>
                    <p>Created {dateValue(contract.created_at)}</p>
                  </article>
                ))}
                {!(contracts ?? []).length ? <p className={styles.empty}>No contracts are attached to this email yet.</p> : null}
              </div>
            </section>

            <section className={styles.panel}>
              <h2>Payments</h2>
              <div className={styles.list}>
                {((payments ?? []) as PaymentRecord[]).map((payment) => (
                  <article className={styles.item} key={payment.id}>
                    <div className={styles.cardHeader}>
                      <h3>{payment.payment_type}</h3>
                      <span className={styles.meta}>{payment.payment_status}</span>
                    </div>
                    <p>{currency(payment.amount)} · Due {dateValue(payment.due_date)}</p>
                    <p>Paid {dateValue(payment.paid_at)}</p>
                    {payment.payment_url && payment.payment_status !== "paid" ? (
                      <a className={styles.primaryButton} href={payment.payment_url} target="_blank" rel="noreferrer">Pay with Stripe</a>
                    ) : null}
                  </article>
                ))}
                {!(payments ?? []).length ? <p className={styles.empty}>No payment records are available yet.</p> : null}
              </div>
            </section>

            <section className={styles.panel}>
              <h2>Messages</h2>
              <div className={styles.list}>
                {((messages ?? []) as MessageRecord[]).map((message) => (
                  <article className={styles.item} key={message.id}>
                    <div className={styles.cardHeader}>
                      <h3>{message.subject}</h3>
                      <span className={styles.meta}>{message.status}</span>
                    </div>
                    <p>{message.message}</p>
                    <p>{dateValue(message.created_at)}</p>
                  </article>
                ))}
                {!(messages ?? []).length ? <p className={styles.empty}>No messages have been sent yet.</p> : null}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}



