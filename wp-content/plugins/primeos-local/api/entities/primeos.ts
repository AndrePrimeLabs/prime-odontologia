import { supabase } from "@/lib/supabase";
import { fromTenant } from "@/lib/tenantContext";

export interface ListOptions {
  filters?: { field: string; operator?: string; value: unknown }[];
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}

export function createEntity<T = Record<string, unknown>>(tableName: string) {
  return {
    async list(options: ListOptions = {}): Promise<T[]> {
      let query = fromTenant(tableName);
      if (options.filters) {
        options.filters.forEach(({ field, operator, value }) => {
          query = query.filter(field, operator || "eq", value as never);
        });
      }
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending ?? false,
        });
      }
      if (options.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      return (data as T[]) || [];
    },

    async get(id: string): Promise<T> {
      const { data, error } = await fromTenant(tableName)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as T;
    },

    async create(payload: Partial<T>): Promise<T> {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(tableName)
        .insert([{
          ...payload,
          created_date: now,
          updated_date: now,
        }])
        .select()
        .single();
      if (error) throw error;
      return data as T;
    },

    async update(id: string, payload: Partial<T>): Promise<T> {
      const { data, error } = await supabase
        .from(tableName)
        .update({ ...payload, updated_date: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as T;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return true;
    },
  };
}
