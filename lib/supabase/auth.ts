import "server-only";
import type { AdminSession } from "../types";
import { createServerSupabaseClient } from "./server";

export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user || user.app_metadata?.role !== "admin") {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? ""
  };
}

export async function requireAdminClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("SUPABASE_NOT_CONFIGURED");

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user || user.app_metadata?.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }

  return { supabase, user };
}
