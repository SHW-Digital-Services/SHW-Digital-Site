import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, CreditCard, LogOut, Mail, Plus, Send, Settings } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { ClientContractsZipButton, ContractPdfButton, type ContractForDownload } from "./ContractDownloads";
import { createContract, createPaymentRecord, markClientMessageRead, saveKnowledgeBaseItem, sendAdminMessage, signOutAdmin, updateContractStatus } from "./actions";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

type ContractRecord = ContractForDownload & {
  created_at: string;
};

type ClientMessage = {
  id: number;
  client_email: string;
  direction: string | null;
  message: string;
  status: string;
  subject: string;
  created_at: string;
};

type AuditLog = {
  id: number;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

type KnowledgeBaseItem = {
  id: number;
  category: string;
  content: string;
  published: boolean;
  title: string;
};

function groupByClient(contracts: ContractRecord[]) {
  return contracts.reduce<Record<string, ContractRecord[]>>((groups, contract) => {
    const key = contract.client_name;
    groups[key] = groups[key] ?? [];
    groups[key].push(contract);
    return groups;
  }, {});
}

function currency(value: number | null) {
  if (value === null) return "TBA";
  return new Intl.NumberFormat("en-GB", { currency: "GBP", style: "currency" }).format(value);
}

function dateValue(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function integrationStatus(keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]));
}

export default async function AdminDashboard() {
  if (!hasSupabaseEnv()) {
    return (
      <main className={styles.screen}>
        <section className={styles.shell}>
          <p className={styles.kicker}>Setup required</p>
          <h1 className={styles.title}>Supabase is not configured.</h1>
          <p className={styles.intro}>Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before using the admin dashboard.</p>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

  if (!profile?.is_admin) {
    redirect("/admin/unauthorised");
  }

  const [{ data, error }, { data: messages }, { data: auditLogs }, { data: knowledgeBase }] = await Promise.all([
    supabase
      .from("contracts")
      .select("id, service_type, client_name, client_business, client_email, contract_value, deposit_percent, status, contract_payload, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("client_messages").select("id, client_email, subject, message, status, direction, created_at").order("created_at", { ascending: false }).limit(12),
    supabase.from("audit_logs").select("id, action, details, created_at").order("created_at", { ascending: false }).limit(16),
    supabase.from("knowledge_base").select("id, category, title, content, published").order("updated_at", { ascending: false }),
  ]);

  const contracts = (data ?? []).map((contract) => ({
    ...contract,
    contract_payload: typeof contract.contract_payload === "object" && contract.contract_payload !== null ? contract.contract_payload : {},
  })) as ContractRecord[];
  const groupedContracts = groupByClient(contracts);
  const unreadMessages = ((messages ?? []) as ClientMessage[]).filter((message) => message.status === "new" && message.direction !== "admin_to_client").length;
  const integrations = [
    { name: "Mailchimp", connected: integrationStatus(["MAILCHIMP_API_KEY", "MAILCHIMP_SERVER_PREFIX", "MAILCHIMP_AUDIENCE_ID"]), detail: "Audience and campaign automation settings." },
    { name: "Stripe", connected: integrationStatus(["STRIPE_SECRET_KEY"]), detail: "Payment links or Checkout can power client portal payments." },
    { name: "Bitrix", connected: integrationStatus(["BITRIX_WEBHOOK_URL"]), detail: "CRM lead, contact, and deal synchronisation." },
  ];

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.brand} href="/">
            SHW Digital Services
          </Link>
          <form action={signOutAdmin}>
            <button className={styles.secondaryButton} type="submit">
              <LogOut size={17} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>

        <p className={styles.kicker}>Admin dashboard</p>
        <h1 className={styles.title}>Contract centre.</h1>
        <p className={styles.intro}>Produce contracts, create Stripe payment records, track messages from the client portal, and review the audit log.</p>

        <div className={styles.grid}>
          <div className={styles.stack}>
            <form action={createContract} className={styles.panel}>
              <h2>Produce contract</h2>
              <div className={styles.formGrid}>
                <div className={styles.row}>
                  <label className={styles.field}>
                    <span>Client name</span>
                    <input name="clientName" required />
                  </label>
                  <label className={styles.field}>
                    <span>Business</span>
                    <input name="clientBusiness" />
                  </label>
                </div>
                <div className={styles.row}>
                  <label className={styles.field}>
                    <span>Email</span>
                    <input name="clientEmail" type="email" />
                  </label>
                  <label className={styles.field}>
                    <span>Service type</span>
                    <input name="serviceType" required />
                  </label>
                </div>
                <div className={styles.row}>
                  <label className={styles.field}>
                    <span>Contract value</span>
                    <input name="contractValue" inputMode="decimal" placeholder="1200" />
                  </label>
                  <label className={styles.field}>
                    <span>Deposit percent</span>
                    <input name="depositPercent" inputMode="decimal" defaultValue="25" />
                  </label>
                </div>
                <label className={styles.field}>
                  <span>Scope</span>
                  <textarea name="scope" />
                </label>
                <label className={styles.field}>
                  <span>Deliverables</span>
                  <textarea name="deliverables" />
                </label>
                <label className={styles.field}>
                  <span>Timeline</span>
                  <textarea name="timeline" />
                </label>
                <label className={styles.field}>
                  <span>Payment terms</span>
                  <textarea name="paymentTerms" defaultValue="25% deposit, remaining balance due on client approval before closure." />
                </label>
                <button className={styles.primaryButton} type="submit">
                  <Plus size={18} aria-hidden="true" />
                  Produce contract
                </button>
              </div>
            </form>

            <form action={createPaymentRecord} className={styles.panel}>
              <h2>Stripe payment record</h2>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Client email</span>
                  <input name="clientEmail" type="email" required />
                </label>
                <div className={styles.row}>
                  <label className={styles.field}>
                    <span>Amount</span>
                    <input name="amount" inputMode="decimal" required />
                  </label>
                  <label className={styles.field}>
                    <span>Due date</span>
                    <input name="dueDate" type="date" />
                  </label>
                </div>
                <label className={styles.field}>
                  <span>Payment type</span>
                  <input name="paymentType" defaultValue="Contract payment" />
                </label>
                <label className={styles.field}>
                  <span>Stripe payment link</span>
                  <input name="paymentUrl" type="url" placeholder="https://buy.stripe.com/..." />
                </label>
                <button className={styles.primaryButton} type="submit">
                  <CreditCard size={18} aria-hidden="true" />
                  Add payment
                </button>
              </div>
            </form>
          </div>

          <div className={styles.stack}>
            <div className={styles.panel}>
              <h2>Client contract packages</h2>
              {error ? <p className={styles.error}>{error.message}</p> : null}
              {!contracts.length && !error ? <p className={styles.empty}>No contracts have been produced yet.</p> : null}
              {Object.entries(groupedContracts).map(([clientName, clientContracts]) => (
                <section className={styles.clientGroup} key={clientName}>
                  <div className={styles.clientHeader}>
                    <h3>{clientName}</h3>
                    <ClientContractsZipButton clientName={clientName} contracts={clientContracts} />
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Contract</th>
                          <th>Value</th>
                          <th>Status</th>
                          <th>Produced</th>
                          <th>Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientContracts.map((contract) => (
                          <tr key={contract.id}>
                            <td>{contract.service_type}</td>
                            <td>{currency(contract.contract_value)}</td>
                            <td>
                              <form action={updateContractStatus} className={styles.statusForm}>
                                <input name="id" type="hidden" value={contract.id} />
                                <select name="status" defaultValue={contract.status} aria-label="Contract status">
                                  <option value="draft">Draft</option>
                                  <option value="sent">Sent</option>
                                  <option value="signed">Signed</option>
                                  <option value="closed">Closed</option>
                                </select>
                                <button className={styles.iconButton} type="submit" title="Save status" aria-label="Save status">
                                  <Check size={16} aria-hidden="true" />
                                </button>
                              </form>
                            </td>
                            <td>{dateValue(contract.created_at)}</td>
                            <td>
                              <ContractPdfButton contract={contract} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>

            <section className={styles.panel}>
              <div className={styles.clientHeader}>
                <h2>Message notifications</h2>
                <span className={styles.badge}>{unreadMessages} new</span>
              </div>

              <form action={sendAdminMessage} className={styles.panelNested}>
                <h3>Create message</h3>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Client email</span>
                    <input name="clientEmail" type="email" required />
                  </label>
                  <label className={styles.field}>
                    <span>Subject</span>
                    <input name="subject" required />
                  </label>
                  <label className={styles.field}>
                    <span>Message</span>
                    <textarea name="message" required />
                  </label>
                  <button className={styles.primaryButton} type="submit">
                    <Send size={17} aria-hidden="true" />
                    Send to client
                  </button>
                </div>
              </form>
              <div className={styles.list}>
                {((messages ?? []) as ClientMessage[]).map((message) => (
                  <article className={styles.item} key={message.id}>
                    <div className={styles.clientHeader}>
                      <h3>{message.subject}</h3>
                      <span className={styles.badge}>{message.direction === "admin_to_client" ? "admin" : message.status}</span>
                    </div>
                    <p>{message.client_email}</p>
                    <p>{message.direction === "admin_to_client" ? "Sent to client" : "From client"}</p>
                    <p>{message.message}</p>
                    <p className={styles.meta}>{dateValue(message.created_at)}</p>
                    {message.status === "new" && message.direction !== "admin_to_client" ? (
                      <form action={markClientMessageRead}>
                        <input name="id" type="hidden" value={message.id} />
                        <button className={styles.secondaryButton} type="submit">
                          <Mail size={17} aria-hidden="true" />
                          Mark read
                        </button>
                      </form>
                    ) : null}
                    <form action={sendAdminMessage} className={styles.replyForm}>
                      <input name="clientEmail" type="hidden" value={message.client_email} />
                      <input name="parentMessageId" type="hidden" value={message.id} />
                      <input name="subject" type="hidden" value={message.subject.startsWith("Re:") ? message.subject : `Re: ${message.subject}`} />
                      <label className={styles.field}>
                        <span>Reply</span>
                        <textarea name="message" required />
                      </label>
                      <button className={styles.secondaryButton} type="submit">
                        <Send size={17} aria-hidden="true" />
                        Reply
                      </button>
                    </form>
                  </article>
                ))}
                {!(messages ?? []).length ? <p className={styles.empty}>No client messages yet.</p> : null}
              </div>
            </section>

            <section className={styles.panel}>
              <h2>Integrations</h2>
              <div className={styles.integrationGrid}>
                {integrations.map((integration) => (
                  <article className={styles.integrationCard} key={integration.name}>
                    <Settings size={20} aria-hidden="true" />
                    <h3>{integration.name}</h3>
                    <span className={integration.connected ? styles.connected : styles.notConnected}>{integration.connected ? "Configured" : "Not configured"}</span>
                    <p>{integration.detail}</p>
                  </article>
                ))}
              </div>
            </section>


            <section className={styles.panel}>
              <h2>Knowledge base</h2>
              <form action={saveKnowledgeBaseItem} className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Title</span>
                  <input name="title" required />
                </label>
                <label className={styles.field}>
                  <span>Category</span>
                  <input name="category" defaultValue="General" />
                </label>
                <label className={styles.field}>
                  <span>Content</span>
                  <textarea name="content" required />
                </label>
                <label className={styles.checkboxRow}>
                  <input name="published" type="checkbox" defaultChecked />
                  Published
                </label>
                <button className={styles.primaryButton} type="submit">
                  <Plus size={18} aria-hidden="true" />
                  Add article
                </button>
              </form>
              <div className={styles.list} style={{ marginTop: 18 }}>
                {((knowledgeBase ?? []) as KnowledgeBaseItem[]).map((item) => (
                  <form action={saveKnowledgeBaseItem} className={styles.item} key={item.id}>
                    <input name="id" type="hidden" value={item.id} />
                    <div className={styles.formGrid}>
                      <label className={styles.field}>
                        <span>Title</span>
                        <input name="title" defaultValue={item.title} required />
                      </label>
                      <label className={styles.field}>
                        <span>Category</span>
                        <input name="category" defaultValue={item.category} />
                      </label>
                      <label className={styles.field}>
                        <span>Content</span>
                        <textarea name="content" defaultValue={item.content} required />
                      </label>
                      <label className={styles.checkboxRow}>
                        <input name="published" type="checkbox" defaultChecked={item.published} />
                        Published
                      </label>
                      <button className={styles.secondaryButton} type="submit">Update article</button>
                    </div>
                  </form>
                ))}
              </div>
            </section>
            <section className={styles.panel}>
              <h2>Audit log</h2>

              <div className={styles.list}>
                {((auditLogs ?? []) as AuditLog[]).map((log) => (
                  <article className={styles.item} key={log.id}>
                    <div className={styles.clientHeader}>
                      <h3>{log.action}</h3>
                      <span className={styles.meta}>{dateValue(log.created_at)}</span>
                    </div>
                    <p>{JSON.stringify(log.details)}</p>
                  </article>
                ))}
                {!(auditLogs ?? []).length ? <p className={styles.empty}>No audit log entries yet.</p> : null}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}



