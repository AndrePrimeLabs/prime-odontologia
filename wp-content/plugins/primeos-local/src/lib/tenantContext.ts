import { supabase } from "./supabase";

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001"; // Default Prime Odontologia tenant

/**
 * Return the legacy default used only for local Firestore namespacing.
 * Supabase authorization must come from the authenticated session and RLS.
 */
export function getActiveTenantId(): string {
  return DEFAULT_TENANT_ID;
}

/**
 * Tenant selection cannot be authorized by the browser.
 */
export function setActiveTenantId(_tenantId: string): never {
  throw new Error("Tenant selection must be managed by server-issued membership claims");
}

/**
 * Supabase RLS applies the authenticated tenant boundary.
 */
export function fromTenant(tableName: string) {
  return supabase.from(tableName).select("*");
}

/**
 * Tenant ID is assigned by the database trigger from the authenticated context.
 */
export async function insertTenantRow(tableName: string, data: Record<string, any>) {
  return supabase.from(tableName).insert(data);
}
