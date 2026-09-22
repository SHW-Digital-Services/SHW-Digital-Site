import { createHmac } from "node:crypto";
import { createHandler } from "@autonoma-ai/server-web";
import { autonomaFactories } from "@/lib/autonoma/factories";
import { createAutonomaSupabaseClient, throwIfError } from "@/lib/autonoma/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sharedSecret = process.env.AUTONOMA_SHARED_SECRET;
if (!sharedSecret) throw new Error("AUTONOMA_SHARED_SECRET is required.");

const signingSecret = process.env.AUTONOMA_SIGNING_SECRET ?? createHmac("sha256", sharedSecret).update("shw-autonoma-refs-signing-v1").digest("hex");

export const POST = createHandler({
  scopeField: "testRunId",
  sharedSecret,
  signingSecret,
  factories: autonomaFactories,
  auth: async (_user, context) => {
    const profile = context.refs.profiles?.[0];
    if (!profile || typeof profile.email !== "string" || typeof profile.password !== "string") {
      throw new Error("The recipe must create at least one profile with real login credentials.");
    }

    const supabase = createAutonomaSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: profile.email, password: profile.password });
    throwIfError(error, "verify seeded user login");
    if (!data.session) throw new Error("Supabase did not return a session for the seeded user.");

    return {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
      credentials: { email: profile.email, password: profile.password },
    };
  },
});
