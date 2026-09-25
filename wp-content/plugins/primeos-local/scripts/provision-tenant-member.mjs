import { createClient } from "@supabase/supabase-js";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROLES = new Set(["owner", "admin", "member"]);

function getOption(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function printUsage() {
  console.error(
    "Usage: npm run tenant:provision -- --user-id <uuid> [--tenant-id <uuid>] [--role owner|admin|member]",
  );
}

const userId = getOption("--user-id");
const tenantId = getOption("--tenant-id") || DEFAULT_TENANT_ID;
const role = getOption("--role") || "member";

if (!userId || !UUID_PATTERN.test(userId) || !UUID_PATTERN.test(tenantId)) {
  printUsage();
  process.exitCode = 2;
} else if (!ROLES.has(role)) {
  console.error("Invalid role. Use owner, admin, or member.");
  process.exitCode = 2;
} else {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided via the process environment.",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("tenant_memberships").upsert(
    {
      tenant_id: tenantId,
      user_id: userId,
      role,
    },
    { onConflict: "tenant_id,user_id" },
  );

  if (error) {
    throw new Error(`Failed to provision tenant membership: ${error.message}`);
  }

  console.log(`Provisioned ${role} membership for user ${userId} in tenant ${tenantId}.`);
}
