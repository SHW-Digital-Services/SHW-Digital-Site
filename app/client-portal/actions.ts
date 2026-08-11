"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PortalActionState = {
  message: string;
  ok: boolean;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signInClient(_state: PortalActionState, formData: FormData): Promise<PortalActionState> {
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

  redirect("/client-portal");
}

export async function createClientAccount(_state: PortalActionState, formData: FormData): Promise<PortalActionState> {
  const email = textValue(formData, "email");
  const password = textValue(formData, "password");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Account created. Check your email if Supabase asks you to confirm the account, then sign in." };
}

export async function requestPasswordReset(_state: PortalActionState, formData: FormData): Promise<PortalActionState> {
  const email = textValue(formData, "email");

  if (!email) {
    return { ok: false, message: "Email is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "/client-portal",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Password reset email sent. Check your inbox for the secure reset link." };
}

export async function signOutClient() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/client-portal");
}

export async function sendClientMessage(formData: FormData) {
  const subject = textValue(formData, "subject");
  const message = textValue(formData, "message");

  if (!subject || !message) {
    throw new Error("Subject and message are required.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/client-portal");
  }

  const { error } = await supabase.from("client_messages").insert({
    client_email: user.email,
    direction: "client_to_admin",
    message,
    subject,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
}

export async function updateClientProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/client-portal");
  }

  const { error } = await supabase.from("profiles").upsert({
    address_line_1: textValue(formData, "addressLine1") || null,
    address_line_2: textValue(formData, "addressLine2") || null,
    business_name: textValue(formData, "businessName") || null,
    city: textValue(formData, "city") || null,
    contact_name: textValue(formData, "contactName") || null,
    email: user.email,
    id: user.id,
    phone: textValue(formData, "phone") || null,
    postcode: textValue(formData, "postcode") || null,
    notification_project_updates: formData.get("projectUpdates") === "on",
    notification_billing: formData.get("billingEmails") === "on",
    notification_marketing: formData.get("marketingEmails") === "on",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
}


export async function signClientContract(formData: FormData) {
  const contractId = Number(textValue(formData, "contractId"));
  const signerName = textValue(formData, "signerName");
  const signatureDataUrl = textValue(formData, "signatureDataUrl");

  if (!Number.isFinite(contractId) || !signerName || !signatureDataUrl.startsWith("data:image/")) {
    throw new Error("A valid contract, signer name, and signature are required.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/client-portal");
  }

  const { data: contract, error: contractError } = await supabase.from("contracts").select("id, client_email").eq("id", contractId).maybeSingle();

  if (contractError) {
    throw new Error(contractError.message);
  }

  if (!contract || contract.client_email?.toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("This contract is not available to this account.");
  }

  const { error } = await supabase.from("contract_signatures").upsert(
    {
      contract_id: contractId,
      role: "client",
      signature_data_url: signatureDataUrl,
      signed_at: new Date().toISOString(),
      signer_email: user.email,
      signer_name: signerName,
      user_id: user.id,
    },
    { onConflict: "contract_id,role" },
  );

  if (error) {
    throw new Error(error.message);
  }

  const { data: signatures } = await supabase.from("contract_signatures").select("role").eq("contract_id", contractId);
  const roles = new Set((signatures ?? []).map((signature) => signature.role));

  if (roles.has("client") && roles.has("shw")) {
    await supabase.from("contracts").update({ status: "signed" }).eq("id", contractId);
  }

  revalidatePath("/client-portal");
  revalidatePath("/admin");
}

async function requirePortalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/client-portal");
  }

  return { email: user.email, supabase, user };
}

export async function createSupportTicket(formData: FormData) {
  const subject = textValue(formData, "subject");
  const details = textValue(formData, "details");
  const priority = textValue(formData, "priority") || "normal";

  if (!subject || !details) {
    throw new Error("Subject and details are required.");
  }

  const { email, supabase, user } = await requirePortalUser();
  const { error } = await supabase.from("support_tickets").insert({
    client_email: email,
    details,
    priority,
    status: "new",
    subject,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
  revalidatePath("/admin");
}

export async function requestTeamMemberAccess(formData: FormData) {
  const colleagueName = textValue(formData, "colleagueName");
  const colleagueEmail = textValue(formData, "colleagueEmail");
  const requestedRole = textValue(formData, "requestedRole");

  if (!colleagueName || !colleagueEmail || !requestedRole) {
    throw new Error("Colleague name, email, and role are required.");
  }

  const { email, supabase, user } = await requirePortalUser();
  const { error } = await supabase.from("support_tickets").insert({
    client_email: email,
    details: `Please provision portal access for ${colleagueName} (${colleagueEmail}) with role: ${requestedRole}.`,
    priority: "normal",
    status: "new",
    subject: "Team member access request",
    ticket_type: "team_access",
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
  revalidatePath("/admin");
}

export async function addScopeComment(formData: FormData) {
  const contractId = Number(textValue(formData, "contractId"));
  const comment = textValue(formData, "comment");

  if (!Number.isFinite(contractId) || !comment) {
    throw new Error("A valid contract and comment are required.");
  }

  const { email, supabase, user } = await requirePortalUser();
  const { error } = await supabase.from("scope_comments").insert({
    client_email: email,
    comment,
    contract_id: contractId,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
  revalidatePath("/admin");
}

export async function approveProjectScope(formData: FormData) {
  const contractId = Number(textValue(formData, "contractId"));

  if (!Number.isFinite(contractId)) {
    throw new Error("A valid contract is required.");
  }

  const { email, supabase, user } = await requirePortalUser();
  const { data: contract, error: contractError } = await supabase.from("contracts").select("id, client_email").eq("id", contractId).maybeSingle();

  if (contractError) {
    throw new Error(contractError.message);
  }

  if (!contract || contract.client_email?.toLowerCase() !== email.toLowerCase()) {
    throw new Error("This scope is not available to this account.");
  }

  const { error } = await supabase.from("scope_approvals").upsert(
    {
      approved_at: new Date().toISOString(),
      client_email: email,
      contract_id: contractId,
      user_id: user.id,
    },
    { onConflict: "contract_id,user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
  revalidatePath("/admin");
}

export async function uploadClientFile(formData: FormData) {
  const file = formData.get("file");
  const contractIdValue = textValue(formData, "contractId");
  const contractId = contractIdValue ? Number(contractIdValue) : null;
  const note = textValue(formData, "note");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a file to upload.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Files must be 8MB or smaller.");
  }

  const { email, supabase, user } = await requirePortalUser();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const path = `${user.id}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("client-files").upload(path, file, { upsert: false });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error } = await supabase.from("client_files").insert({
    client_email: email,
    contract_id: Number.isFinite(contractId) ? contractId : null,
    file_name: file.name,
    file_path: path,
    file_size: file.size,
    mime_type: file.type || "application/octet-stream",
    note: note || null,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
  revalidatePath("/admin");
}
