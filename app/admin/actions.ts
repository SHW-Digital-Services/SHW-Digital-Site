"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = {
  message: string;
  ok: boolean;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function redirectWithNotice(type: "success" | "error", message: string): never {
  const params = new URLSearchParams({ notice: message, noticeType: type });
  redirect(`/admin?${params.toString()}`);
}

async function writeAudit(action: string, details: Record<string, unknown> = {}) {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert({ action, details });
  if (error) {
    console.error(error.message);
  }
}

function optionalNumber(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function signInAdmin(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = textValue(formData, "email");
  const password = textValue(formData, "password");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase.from("profiles").select("is_admin").eq("id", user?.id).maybeSingle();

  if (profileError || !profile?.is_admin) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account is not marked as an admin." };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createContract(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const clientName = textValue(formData, "clientName");
  const serviceType = textValue(formData, "serviceType");

  if (!clientName || !serviceType) {
    redirectWithNotice("error", "Client name and service type are required.");
  }

  const scope = textValue(formData, "scope");
  const deliverables = textValue(formData, "deliverables");
  const timeline = textValue(formData, "timeline");
  const paymentTerms = textValue(formData, "paymentTerms") || "25% deposit, remaining balance due on client approval before closure.";

  const { error } = await supabase.from("contracts").insert({
    client_business: textValue(formData, "clientBusiness") || null,
    client_email: textValue(formData, "clientEmail") || null,
    client_name: clientName,
    contract_payload: {
      deliverables,
      paymentTerms,
      producedBy: "SHW Digital Services Contract Centre",
      scope,
      timeline,
    },
    contract_value: optionalNumber(formData, "contractValue"),
    deposit_percent: optionalNumber(formData, "depositPercent") ?? 25,
    generated_by: user.id,
    service_type: serviceType,
    status: "draft",
  });

  if (error) {
    redirectWithNotice("error", error.message);
  }

  await writeAudit("contract.created", { clientName, serviceType });
  revalidatePath("/admin");
  redirectWithNotice("success", "Contract created.");
}

export async function updateContractStatus(formData: FormData) {
  const id = optionalNumber(formData, "id");
  const status = textValue(formData, "status");
  const allowedStatuses = new Set(["draft", "sent", "signed", "closed"]);

  if (!id || !allowedStatuses.has(status)) {
    redirectWithNotice("error", "A valid contract and status are required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("contracts").update({ status }).eq("id", id).select("id, status").single();

  if (error) {
    redirectWithNotice("error", error.message);
  }

  if (data.status !== status) {
    redirectWithNotice("error", "The contract status was not saved.");
  }

  await writeAudit("contract.status_updated", { id, status });
  revalidatePath("/admin");
  redirectWithNotice("success", "Contract status updated.");
}


export async function createPaymentRecord(formData: FormData) {
  const clientEmail = textValue(formData, "clientEmail");
  const amount = optionalNumber(formData, "amount");
  const paymentType = textValue(formData, "paymentType") || "Contract payment";
  const paymentUrl = textValue(formData, "paymentUrl");

  if (!clientEmail || amount === null) {
    redirectWithNotice("error", "Client email and amount are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contract_payments").insert({
    amount,
    client_email: clientEmail,
    due_date: textValue(formData, "dueDate") || null,
    payment_status: "due",
    payment_type: paymentType,
    payment_url: paymentUrl || null,
  });

  if (error) {
    redirectWithNotice("error", error.message);
  }

  await writeAudit("payment.created", { amount, clientEmail, paymentType });
  revalidatePath("/admin");
  redirectWithNotice("success", "Payment record created.");
}

export async function markClientMessageRead(formData: FormData) {
  const id = optionalNumber(formData, "id");

  if (!id) {
    redirectWithNotice("error", "A valid message is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("client_messages").update({ status: "read" }).eq("id", id);

  if (error) {
    redirectWithNotice("error", error.message);
  }

  await writeAudit("client_message.read", { id });
  revalidatePath("/admin");
  redirectWithNotice("success", "Message marked as read.");
}





export async function sendAdminMessage(formData: FormData) {
  const clientEmail = textValue(formData, "clientEmail");
  const subject = textValue(formData, "subject");
  const message = textValue(formData, "message");
  const parentMessageId = optionalNumber(formData, "parentMessageId");

  if (!clientEmail || !subject || !message) {
    redirectWithNotice("error", "Client email, subject, and message are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("client_messages").insert({
    client_email: clientEmail,
    direction: "admin_to_client",
    message,
    parent_message_id: parentMessageId,
    status: "sent",
    subject,
  });

  if (error) {
    redirectWithNotice("error", error.message);
  }

  await writeAudit("client_message.sent_by_admin", { clientEmail, parentMessageId, subject });
  revalidatePath("/admin");
  revalidatePath("/client-portal");
  redirectWithNotice("success", "Message sent to client.");
}


export async function signShwContract(formData: FormData) {
  const contractId = Number(textValue(formData, "contractId"));
  const signerName = textValue(formData, "signerName");
  const signatureDataUrl = textValue(formData, "signatureDataUrl");

  if (!Number.isFinite(contractId) || !signerName || !signatureDataUrl.startsWith("data:image/")) {
    redirectWithNotice("error", "A valid contract, signer name, and signature are required.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

  if (!profile?.is_admin) {
    redirect("/admin/unauthorised");
  }

  const { error } = await supabase.from("contract_signatures").upsert(
    {
      contract_id: contractId,
      role: "shw",
      signature_data_url: signatureDataUrl,
      signed_at: new Date().toISOString(),
      signer_email: user.email,
      signer_name: signerName,
      user_id: user.id,
    },
    { onConflict: "contract_id,role" },
  );

  if (error) {
    redirectWithNotice("error", error.message);
  }

  const { data: signatures } = await supabase.from("contract_signatures").select("role").eq("contract_id", contractId);
  const roles = new Set((signatures ?? []).map((signature) => signature.role));

  if (roles.has("client") && roles.has("shw")) {
    await supabase.from("contracts").update({ status: "signed" }).eq("id", contractId);
  }

  await writeAudit("contract.signed_by_shw", { id: contractId, signerName });
  revalidatePath("/admin");
  revalidatePath("/client-portal");
  redirectWithNotice("success", "SHW signature saved.");
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();

  if (!profile?.is_admin) {
    redirect("/admin/unauthorised");
  }

  return { supabase, user };
}

export async function createProjectMilestone(formData: FormData) {
  const contractId = optionalNumber(formData, "contractId");
  const title = textValue(formData, "title");
  const dueDate = textValue(formData, "dueDate");

  if (!contractId || !title) {
    redirectWithNotice("error", "Contract and milestone title are required.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("project_milestones").insert({
    contract_id: contractId,
    due_date: dueDate || null,
    status: "pending",
    title,
  });

  if (error) {
    redirectWithNotice("error", error.message);
  }

  await writeAudit("project_milestone.created", { contractId, title });
  revalidatePath("/admin");
  revalidatePath("/client-portal");
  redirectWithNotice("success", "Milestone created.");
}

export async function updateProjectMilestoneStatus(formData: FormData) {
  const id = optionalNumber(formData, "id");
  const status = textValue(formData, "status");
  const allowedStatuses = new Set(["pending", "active", "complete"]);

  if (!id || !allowedStatuses.has(status)) {
    redirectWithNotice("error", "A valid milestone and status are required.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("project_milestones").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

  if (error) {
    redirectWithNotice("error", error.message);
  }

  await writeAudit("project_milestone.status_updated", { id, status });
  revalidatePath("/admin");
  revalidatePath("/client-portal");
  redirectWithNotice("success", "Milestone status updated.");
}

export async function updateSupportTicketStatus(formData: FormData) {
  const id = optionalNumber(formData, "id");
  const status = textValue(formData, "status");
  const allowedStatuses = new Set(["new", "in_progress", "waiting_client", "resolved"]);

  if (!id || !allowedStatuses.has(status)) {
    redirectWithNotice("error", "A valid ticket and status are required.");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", id);

  if (error) {
    redirectWithNotice("error", error.message);
  }

  await writeAudit("support_ticket.status_updated", { id, status });
  revalidatePath("/admin");
  revalidatePath("/client-portal");
  redirectWithNotice("success", "Support ticket status updated.");
}
