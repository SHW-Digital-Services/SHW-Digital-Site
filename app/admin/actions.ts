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
    throw new Error("Client name and service type are required.");
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
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function updateContractStatus(formData: FormData) {
  const id = optionalNumber(formData, "id");
  const status = textValue(formData, "status");
  const allowedStatuses = new Set(["draft", "sent", "signed", "closed"]);

  if (!id || !allowedStatuses.has(status)) {
    throw new Error("A valid contract and status are required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contracts").update({ status }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

