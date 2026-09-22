import "server-only";

import { defineFactory } from "@autonoma-ai/sdk";
import { z } from "zod";
import { createAutonomaSupabaseClient, throwIfError } from "./supabase-admin";

const numericIdRef = z.object({ id: z.number(), auditLogId: z.number().optional(), storagePath: z.string().optional() });
const profileRef = z.object({ id: z.string(), email: z.string(), password: z.string() });

function isoFromMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function dateFromDays(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function deleteById(table: string, id: number) {
  const supabase = createAutonomaSupabaseClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  throwIfError(error, `delete ${table}`);
}

async function writeAudit(action: string, actorId: string | null, details: Record<string, unknown>) {
  const supabase = createAutonomaSupabaseClient();
  const { data, error } = await supabase.from("audit_logs").insert({ action, actor_id: actorId, details }).select("id").single();
  throwIfError(error, "create audit log side effect");
  return data.id as number;
}

export const profiles = defineFactory({
  inputSchema: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    isAdmin: z.boolean().default(false),
    contactName: z.string(),
    businessName: z.string(),
    phone: z.string(),
    city: z.string(),
    postcode: z.string(),
  }),
  refSchema: profileRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    throwIfError(authError, "create Supabase auth user");

    const { error } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      email: data.email,
      is_admin: data.isAdmin,
      contact_name: data.contactName,
      business_name: data.businessName,
      phone: data.phone,
      city: data.city,
      postcode: data.postcode,
      notification_project_updates: true,
      notification_billing: true,
      notification_marketing: false,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throwIfError(error, "create profile");
    }
    return { id: authData.user.id, email: data.email, password: data.password };
  },
  teardown: async (record) => {
    const supabase = createAutonomaSupabaseClient();
    const { error } = await supabase.auth.admin.deleteUser(record.id);
    if (error && !error.message.toLowerCase().includes("not found")) throwIfError(error, "delete Supabase auth user");
  },
});

export const audit_logs = defineFactory({
  inputSchema: z.object({ actorId: z.string().nullable(), action: z.string(), details: z.record(z.string(), z.unknown()).default({}) }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("audit_logs").insert({ actor_id: data.actorId, action: data.action, details: data.details }).select("id").single();
    throwIfError(error, "create audit log");
    return { id: row.id as number };
  },
  teardown: (record) => deleteById("audit_logs", record.id),
});

export const website_metrics = defineFactory({
  inputSchema: z.object({ metricName: z.string(), metricValue: z.number(), periodStartDays: z.number().int(), periodEndDays: z.number().int(), source: z.string() }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("website_metrics").insert({ metric_name: data.metricName, metric_value: data.metricValue, period_start: dateFromDays(data.periodStartDays), period_end: dateFromDays(data.periodEndDays), source: data.source }).select("id").single();
    throwIfError(error, "create website metric");
    return { id: row.id as number };
  },
  teardown: (record) => deleteById("website_metrics", record.id),
});

export const contracts = defineFactory({
  inputSchema: z.object({ generatedBy: z.string(), serviceType: z.string(), clientName: z.string(), clientBusiness: z.string(), clientEmail: z.string().email(), contractValue: z.number(), depositPercent: z.number().default(25), status: z.enum(["draft", "sent", "signed", "closed"]), scope: z.string(), deliverables: z.string(), timeline: z.string(), paymentTerms: z.string() }),
  refSchema: numericIdRef,
  create: async (data, ctx) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("contracts").insert({ generated_by: data.generatedBy, service_type: data.serviceType, client_name: data.clientName, client_business: data.clientBusiness, client_email: data.clientEmail, contract_value: data.contractValue, deposit_percent: data.depositPercent, status: data.status, contract_payload: { scope: data.scope, deliverables: data.deliverables, timeline: data.timeline, paymentTerms: data.paymentTerms, producedBy: "SHW Digital Services Contract Centre" } }).select("id").single();
    throwIfError(error, "create contract");
    const auditLogId = await writeAudit("contract.created", data.generatedBy, { clientName: data.clientName, serviceType: data.serviceType, testRunId: ctx.testRunId });
    return { id: row.id as number, auditLogId };
  },
  teardown: async (record) => { await deleteById("contracts", record.id); if (record.auditLogId) await deleteById("audit_logs", record.auditLogId); },
});

export const contract_payments = defineFactory({
  inputSchema: z.object({ contractId: z.number(), clientEmail: z.string().email(), amount: z.number(), paymentType: z.string(), paymentStatus: z.enum(["due", "paid", "overdue"]), paymentUrl: z.string().url().nullable().default(null), dueInDays: z.number().int(), paidMinutesAgo: z.number().int().nullable().default(null), actorId: z.string() }),
  refSchema: numericIdRef,
  create: async (data, ctx) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("contract_payments").insert({ contract_id: data.contractId, client_email: data.clientEmail, amount: data.amount, payment_type: data.paymentType, payment_status: data.paymentStatus, payment_url: data.paymentUrl, due_date: dateFromDays(data.dueInDays), paid_at: data.paidMinutesAgo === null ? null : isoFromMinutes(-data.paidMinutesAgo) }).select("id").single();
    throwIfError(error, "create payment record");
    const auditLogId = await writeAudit("payment.created", data.actorId, { amount: data.amount, clientEmail: data.clientEmail, paymentType: data.paymentType, testRunId: ctx.testRunId });
    return { id: row.id as number, auditLogId };
  },
  teardown: async (record) => { await deleteById("contract_payments", record.id); if (record.auditLogId) await deleteById("audit_logs", record.auditLogId); },
});

export const client_messages = defineFactory({
  inputSchema: z.object({ userId: z.string().nullable(), clientEmail: z.string().email(), subject: z.string(), message: z.string(), status: z.enum(["new", "sent", "read"]), direction: z.enum(["client_to_admin", "admin_to_client"]), parentMessageId: z.number().nullable().default(null) }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("client_messages").insert({ user_id: data.userId, client_email: data.clientEmail, subject: data.subject, message: data.message, status: data.status, direction: data.direction, parent_message_id: data.parentMessageId }).select("id").single();
    throwIfError(error, "create client message");
    return { id: row.id as number };
  },
  teardown: (record) => deleteById("client_messages", record.id),
});

export const knowledge_base = defineFactory({
  inputSchema: z.object({ title: z.string(), category: z.string(), content: z.string(), published: z.boolean().default(true) }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("knowledge_base").insert({ title: data.title, category: data.category, content: data.content, published: data.published }).select("id").single();
    throwIfError(error, "create knowledge-base article");
    return { id: row.id as number };
  },
  teardown: (record) => deleteById("knowledge_base", record.id),
});

export const contract_signatures = defineFactory({
  inputSchema: z.object({ contractId: z.number(), userId: z.string(), role: z.enum(["client", "shw"]), signerName: z.string(), signerEmail: z.string().email(), signatureDataUrl: z.string().startsWith("data:image/"), signedMinutesAgo: z.number().int() }),
  refSchema: numericIdRef,
  create: async (data, ctx) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("contract_signatures").upsert({ contract_id: data.contractId, user_id: data.userId, role: data.role, signer_name: data.signerName, signer_email: data.signerEmail, signature_data_url: data.signatureDataUrl, signed_at: isoFromMinutes(-data.signedMinutesAgo) }, { onConflict: "contract_id,role" }).select("id").single();
    throwIfError(error, "create contract signature");
    const { data: signatures, error: signaturesError } = await supabase.from("contract_signatures").select("role").eq("contract_id", data.contractId);
    throwIfError(signaturesError, "read contract signatures");
    if (new Set((signatures ?? []).map((signature) => signature.role)).size === 2) {
      const { error: updateError } = await supabase.from("contracts").update({ status: "signed" }).eq("id", data.contractId);
      throwIfError(updateError, "mark contract signed");
    }
    const auditLogId = data.role === "shw" ? await writeAudit("contract.signed_by_shw", data.userId, { id: data.contractId, signerName: data.signerName, testRunId: ctx.testRunId }) : undefined;
    return { id: row.id as number, auditLogId };
  },
  teardown: async (record) => { await deleteById("contract_signatures", record.id); if (record.auditLogId) await deleteById("audit_logs", record.auditLogId); },
});

export const support_tickets = defineFactory({
  inputSchema: z.object({ userId: z.string(), clientEmail: z.string().email(), subject: z.string(), details: z.string(), priority: z.enum(["low", "normal", "high", "urgent"]), status: z.enum(["new", "open", "in_progress", "resolved", "waiting_client"]), ticketType: z.string() }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("support_tickets").insert({ user_id: data.userId, client_email: data.clientEmail, subject: data.subject, details: data.details, priority: data.priority, status: data.status, ticket_type: data.ticketType }).select("id").single();
    throwIfError(error, "create support ticket");
    return { id: row.id as number };
  },
  teardown: (record) => deleteById("support_tickets", record.id),
});

export const client_files = defineFactory({
  inputSchema: z.object({ userId: z.string(), contractId: z.number(), clientEmail: z.string().email(), fileName: z.string(), filePath: z.string(), fileSize: z.number().int().positive(), mimeType: z.string(), note: z.string().nullable().default(null), content: z.string() }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const bytes = new TextEncoder().encode(data.content);
    const { error: uploadError } = await supabase.storage.from("client-files").upload(data.filePath, bytes, { contentType: data.mimeType, upsert: false });
    throwIfError(uploadError, "upload client file");
    const { data: row, error } = await supabase.from("client_files").insert({ user_id: data.userId, contract_id: data.contractId, client_email: data.clientEmail, file_name: data.fileName, file_path: data.filePath, file_size: data.fileSize, mime_type: data.mimeType, note: data.note }).select("id").single();
    if (error) { await supabase.storage.from("client-files").remove([data.filePath]); throwIfError(error, "create client file record"); }
    return { id: row.id as number, storagePath: data.filePath };
  },
  teardown: async (record) => {
    await deleteById("client_files", record.id);
    if (record.storagePath) {
      const supabase = createAutonomaSupabaseClient();
      const { error } = await supabase.storage.from("client-files").remove([record.storagePath]);
      throwIfError(error, "delete client file object");
    }
  },
});

export const scope_comments = defineFactory({
  inputSchema: z.object({ userId: z.string(), contractId: z.number(), clientEmail: z.string().email(), comment: z.string() }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("scope_comments").insert({ user_id: data.userId, contract_id: data.contractId, client_email: data.clientEmail, comment: data.comment }).select("id").single();
    throwIfError(error, "create scope comment");
    return { id: row.id as number };
  },
  teardown: (record) => deleteById("scope_comments", record.id),
});

export const scope_approvals = defineFactory({
  inputSchema: z.object({ userId: z.string(), contractId: z.number(), clientEmail: z.string().email(), approvedMinutesAgo: z.number().int() }),
  refSchema: numericIdRef,
  create: async (data) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("scope_approvals").upsert({ user_id: data.userId, contract_id: data.contractId, client_email: data.clientEmail, approved_at: isoFromMinutes(-data.approvedMinutesAgo) }, { onConflict: "contract_id,user_id" }).select("id").single();
    throwIfError(error, "create scope approval");
    return { id: row.id as number };
  },
  teardown: (record) => deleteById("scope_approvals", record.id),
});

export const project_milestones = defineFactory({
  inputSchema: z.object({ contractId: z.number(), title: z.string(), status: z.enum(["pending", "active", "complete"]), dueInDays: z.number().int(), actorId: z.string() }),
  refSchema: numericIdRef,
  create: async (data, ctx) => {
    const supabase = createAutonomaSupabaseClient();
    const { data: row, error } = await supabase.from("project_milestones").insert({ contract_id: data.contractId, title: data.title, status: data.status, due_date: dateFromDays(data.dueInDays) }).select("id").single();
    throwIfError(error, "create project milestone");
    const auditLogId = await writeAudit("project_milestone.created", data.actorId, { contractId: data.contractId, title: data.title, testRunId: ctx.testRunId });
    return { id: row.id as number, auditLogId };
  },
  teardown: async (record) => { await deleteById("project_milestones", record.id); if (record.auditLogId) await deleteById("audit_logs", record.auditLogId); },
});

export const autonomaFactories = { profiles, audit_logs, website_metrics, contracts, contract_payments, client_messages, knowledge_base, contract_signatures, support_tickets, client_files, scope_comments, scope_approvals, project_milestones };
