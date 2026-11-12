import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !email || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, or ADMIN_PASSWORD.");
  process.exit(1);
}

if (password.length < 8 || password.length > 72) {
  console.error("ADMIN_PASSWORD must contain 8 to 72 characters.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) return match;
    if (data.users.length < 1000) return null;
    page += 1;
  }
  return null;
}

try {
  const existing = await findUserByEmail(email);
  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: "admin" }
    });
    if (error) throw error;
    console.log(`Updated administrator: ${email}`);
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" }
    });
    if (error) throw error;
    console.log(`Created administrator: ${email}`);
  }
  console.log("The account now has app_metadata.role = admin. Keep ADMIN_PASSWORD out of client bundles.");
} catch (error) {
  console.error("Could not create the administrator:", error.message ?? error);
  process.exit(1);
}
