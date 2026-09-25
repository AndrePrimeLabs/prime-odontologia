import { Database } from "../database.types";

export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type TenantUser = Database["public"]["Tables"]["tenant_users"]["Row"];
export type Canvas = Database["public"]["Tables"]["canvases"]["Row"];
export type CanvasBlockItem = Database["public"]["Tables"]["canvas_block_items"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type FinancialTransaction = Database["public"]["Tables"]["financial_transactions"]["Row"];
export type OperationalTask = Database["public"]["Tables"]["operational_tasks"]["Row"];

export type CanvasBlockType =
  | "key_partners"
  | "key_activities"
  | "key_resources"
  | "value_propositions"
  | "customer_relationships"
  | "channels"
  | "customer_segments"
  | "cost_structure"
  | "revenue_streams";

export interface BusinessModelCanvasView {
  id: string;
  name: string;
  blocks: Record<CanvasBlockType, CanvasBlockItem[]>;
}
