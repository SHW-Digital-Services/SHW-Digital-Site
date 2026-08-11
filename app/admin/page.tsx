import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, LogOut, Plus } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { ClientContractsZipButton, ContractPdfButton, type ContractForDownload } from "./ContractDownloads";
import { createContract, signOutAdmin, updateContractStatus } from "./actions";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

type ContractRecord = ContractForDownload & {
  created_at: string;
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

  const { data, error } = await supabase
    .from("contracts")
    .select("id, service_type, client_name, client_business, client_email, contract_value, deposit_percent, status, contract_payload, created_at")
    .order("created_at", { ascending: false });

  const contracts = (data ?? []).map((contract) => ({
    ...contract,
    contract_payload: typeof contract.contract_payload === "object" && contract.contract_payload !== null ? contract.contract_payload : {},
  })) as ContractRecord[];
  const groupedContracts = groupByClient(contracts);

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
        <p className={styles.intro}>Produce client contracts, track their status, download individual PDFs, or package every contract for a client into a single ZIP file.</p>

        <div className={styles.grid}>
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
                          <td>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(contract.created_at))}</td>
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
        </div>
      </section>
    </main>
  );
}

