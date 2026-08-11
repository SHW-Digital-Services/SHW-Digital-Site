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
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client-portal");
}
