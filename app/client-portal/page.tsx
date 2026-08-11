import { CheckCircle2, FileUp, LogOut, Save, Send, UserPlus } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import PortalAuthForms from "./PortalAuthForms";
import { addScopeComment, approveProjectScope, createSupportTicket, requestTeamMemberAccess, sendClientMessage, signOutClient, updateClientProfile, uploadClientFile } from "./actions";
import BillingPdfButton from "./BillingPdfButton";
import ClientContractTools from "./ClientContractTools";
import BrandLogo from "../BrandLogo";
import styles from "./portal.module.css";

export const dynamic = "force-dynamic";

type ContractRecord = {
  client_business: string | null;
  client_email: string | null;
  client_name: string;
  contract_payload: {
    deliverables?: string;
    paymentTerms?: string;
    producedBy?: string;
    scope?: string;
    timeline?: string;
  };
  contract_signatures?: {
    role: "client" | "shw";
    signer_email: string | null;
    signer_name: string;
    signature_data_url: string;
    signed_at: string;
  }[];
  contract_value: number | null;
  created_at: string;
  deposit_percent: number;
  id: number;
  service_type: string;
  status: string;
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
  client_email: string;
  direction: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

type SupportTicket = {
  created_at: string;
  details: string;
  id: number;
  priority: string;
  status: string;
  subject: string;
  ticket_type: string;
};

type ClientFile = {
  created_at: string;
  file_name: string;
  file_size: number;
  id: number;
  note: string | null;
};

type ScopeComment = {
  comment: string;
  contract_id: number;
  created_at: string;
  id: number;
};

type Milestone = {
  contract_id: number;
  due_date: string | null;
  id: number;
  status: string;
  title: string;
};

type ScopeApproval = {
  approved_at: string;
  contract_id: number;
};

function currency(value: number | null) {
  if (value === null) return "TBA";
  return new Intl.NumberFormat("en-GB", { currency: "GBP", style: "currency" }).format(value);
}

function dateValue(value: string | null) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function fileSize(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
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
            <BrandLogo tone="dark" />
          </div>
          <p className={styles.kicker}>Client portal</p>
          <h1 className={styles.title}>Create an account or sign in.</h1>
          <p className={styles.intro}>View contracts, payment records, profile details, and send secure messages to SHW Digital Services.</p>
          <PortalAuthForms />
        </section>
      </main>
    );
  }

  const userEmail = user.email;

  const [{ data: profile }, { data: contracts }, { data: payments }, { data: messages }, { data: tickets }, { data: files }, { data: comments }, { data: approvals }] = await Promise.all([
    supabase.from("profiles").select("contact_name, business_name, phone, address_line_1, address_line_2, city, postcode, notification_project_updates, notification_billing, notification_marketing").eq("id", user.id).maybeSingle(),
    supabase.from("contracts").select("id, service_type, client_name, client_business, client_email, contract_value, deposit_percent, status, contract_payload, created_at, contract_signatures(role, signer_name, signer_email, signature_data_url, signed_at)").eq("client_email", userEmail).order("created_at", { ascending: false }),
    supabase.from("contract_payments").select("id, amount, due_date, paid_at, payment_status, payment_type, payment_url").eq("client_email", userEmail).order("created_at", { ascending: false }),
    supabase.from("client_messages").select("id, client_email, direction, subject, message, status, created_at").eq("client_email", userEmail).order("created_at", { ascending: false }),
    supabase.from("support_tickets").select("id, subject, details, priority, status, ticket_type, created_at").eq("client_email", userEmail).order("created_at", { ascending: false }),
    supabase.from("client_files").select("id, file_name, file_size, note, created_at").eq("client_email", userEmail).order("created_at", { ascending: false }),
    supabase.from("scope_comments").select("id, contract_id, comment, created_at").eq("client_email", userEmail).order("created_at", { ascending: false }),
    supabase.from("scope_approvals").select("contract_id, approved_at").eq("client_email", userEmail),
  ]);
  const contractIds = ((contracts ?? []) as ContractRecord[]).map((contract) => contract.id);
  const { data: milestones } = contractIds.length
    ? await supabase.from("project_milestones").select("id, contract_id, title, status, due_date").in("contract_id", contractIds).order("created_at", { ascending: true })
    : { data: [] };

  return (
    <main className={styles.screen}>
      <section className={styles.shell}>
        <div className={styles.topbar}>
          <BrandLogo tone="dark" />
          <form action={signOutClient}>
            <button className={styles.secondaryButton} type="submit">
              <LogOut size={17} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>

        <p className={styles.kicker}>Client portal</p>
        <h1 className={styles.title}>Your business workspace.</h1>
        <p className={styles.intro}>Signed in as {userEmail}. Review contracts and payment records, keep your business profile current, and send messages to the admin portal.</p>

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
                <div className={styles.checkboxGroup}>
                  <label>
                    <input name="projectUpdates" type="checkbox" defaultChecked={profile?.notification_project_updates ?? true} />
                    Project update emails
                  </label>
                  <label>
                    <input name="billingEmails" type="checkbox" defaultChecked={profile?.notification_billing ?? true} />
                    Billing emails
                  </label>
                  <label>
                    <input name="marketingEmails" type="checkbox" defaultChecked={profile?.notification_marketing ?? false} />
                    General updates
                  </label>
                </div>
                <button className={styles.primaryButton} type="submit">
                  <Save size={18} aria-hidden="true" />
                  Save profile
                </button>
              </div>
            </form>

            <form action={requestTeamMemberAccess} className={styles.panel}>
              <h2>Team access</h2>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Colleague name</span>
                  <input name="colleagueName" required />
                </label>
                <label className={styles.field}>
                  <span>Colleague email</span>
                  <input name="colleagueEmail" type="email" required />
                </label>
                <label className={styles.field}>
                  <span>Role</span>
                  <select name="requestedRole" defaultValue="Full Access">
                    <option>Billing Only</option>
                    <option>Support Only</option>
                    <option>Full Access</option>
                  </select>
                </label>
                <button className={styles.primaryButton} type="submit">
                  <UserPlus size={18} aria-hidden="true" />
                  Request access
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
                    <div className={styles.scopePanel}>
                      <div className={styles.cardHeader}>
                        <h4>Project scope</h4>
                        <span className={styles.meta}>{((approvals ?? []) as ScopeApproval[]).some((approval) => approval.contract_id === contract.id) ? "Approved" : "Pending approval"}</span>
                      </div>
                      <form action={approveProjectScope}>
                        <input name="contractId" type="hidden" value={contract.id} />
                        <button className={styles.secondaryButton} type="submit">
                          <CheckCircle2 size={17} aria-hidden="true" />
                          Approve scope
                        </button>
                      </form>
                      <form action={addScopeComment} className={styles.inlineForm}>
                        <input name="contractId" type="hidden" value={contract.id} />
                        <label className={styles.field}>
                          <span>Scope comment</span>
                          <textarea name="comment" placeholder="Request a change or add a note before approving." required />
                        </label>
                        <button className={styles.secondaryButton} type="submit">Add comment</button>
                      </form>
                      <div className={styles.list}>
                        {((comments ?? []) as ScopeComment[]).filter((comment) => comment.contract_id === contract.id).map((comment) => (
                          <p className={styles.noteLine} key={comment.id}>{comment.comment} · {dateValue(comment.created_at)}</p>
                        ))}
                      </div>
                    </div>
                    <div className={styles.scopePanel}>
                      <h4>Milestones</h4>
                      <div className={styles.milestoneList}>
                        {((milestones ?? []) as Milestone[]).filter((milestone) => milestone.contract_id === contract.id).map((milestone) => (
                          <div className={styles.milestone} key={milestone.id}>
                            <span className={milestone.status === "complete" ? styles.signedBadge : styles.pendingBadge}>{milestone.status}</span>
                            <strong>{milestone.title}</strong>
                            <span>{dateValue(milestone.due_date)}</span>
                          </div>
                        ))}
                        {!((milestones ?? []) as Milestone[]).some((milestone) => milestone.contract_id === contract.id) ? <p className={styles.empty}>No milestones have been published for this project yet.</p> : null}
                      </div>
                    </div>
                    <ClientContractTools contract={contract} signerName={profile?.contact_name ?? contract.client_name} />
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
                    <BillingPdfButton clientEmail={userEmail} payment={payment} />
                    {payment.payment_url && payment.payment_status !== "paid" ? (
                      <a className={styles.primaryButton} href={payment.payment_url} target="_blank" rel="noreferrer">Pay with Stripe</a>
                    ) : null}
                  </article>
                ))}
                {!(payments ?? []).length ? <p className={styles.empty}>No payment records are available yet.</p> : null}
              </div>
            </section>

            <section className={styles.panel}>
              <h2>Support</h2>
              <form action={createSupportTicket} className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Subject</span>
                  <input name="subject" required />
                </label>
                <label className={styles.field}>
                  <span>Priority</span>
                  <select name="priority" defaultValue="normal">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span>Details</span>
                  <textarea name="details" required />
                </label>
                <button className={styles.primaryButton} type="submit">
                  <Send size={18} aria-hidden="true" />
                  New ticket
                </button>
              </form>
              <div className={styles.list}>
                {((tickets ?? []) as SupportTicket[]).map((ticket) => (
                  <article className={styles.item} key={ticket.id}>
                    <div className={styles.cardHeader}>
                      <h3>{ticket.subject}</h3>
                      <span className={styles.meta}>{ticket.status} · {ticket.priority}</span>
                    </div>
                    <p>{ticket.details}</p>
                    <p>{dateValue(ticket.created_at)}</p>
                  </article>
                ))}
                {!(tickets ?? []).length ? <p className={styles.empty}>No support tickets have been created yet.</p> : null}
              </div>
            </section>

            <section className={styles.panel}>
              <h2>Files</h2>
              <form action={uploadClientFile} className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Project</span>
                  <select name="contractId" defaultValue="">
                    <option value="">General upload</option>
                    {((contracts ?? []) as ContractRecord[]).map((contract) => (
                      <option key={contract.id} value={contract.id}>{contract.service_type}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>File</span>
                  <input name="file" type="file" required />
                </label>
                <label className={styles.field}>
                  <span>Note</span>
                  <input name="note" placeholder="Logo, CSV test data, screenshot..." />
                </label>
                <button className={styles.primaryButton} type="submit">
                  <FileUp size={18} aria-hidden="true" />
                  Upload file
                </button>
              </form>
              <div className={styles.list}>
                {((files ?? []) as ClientFile[]).map((file) => (
                  <article className={styles.item} key={file.id}>
                    <div className={styles.cardHeader}>
                      <h3>{file.file_name}</h3>
                      <span className={styles.meta}>{fileSize(file.file_size)}</span>
                    </div>
                    {file.note ? <p>{file.note}</p> : null}
                    <p>{dateValue(file.created_at)}</p>
                  </article>
                ))}
                {!(files ?? []).length ? <p className={styles.empty}>No files have been uploaded yet.</p> : null}
              </div>
            </section>

            <section className={styles.panel}>
              <h2>Messages</h2>
              <div className={styles.list}>
                {((messages ?? []) as MessageRecord[]).map((message) => (
                  <article className={styles.item} key={message.id}>
                    <div className={styles.cardHeader}>
                      <h3>{message.subject}</h3>
                      <span className={styles.meta}>{message.direction === "admin_to_client" ? "From admin" : message.status}</span>
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








