import "dotenv/config"
import { z } from "zod"

const schema = z.object({
	NOTION_TOKEN: z.string().min(1, "NOTION_TOKEN is required"),

	NOTION_DB_CONTROL_PANEL: z.string().optional(),
	NOTION_DB_TASKS: z.string().optional(),
	NOTION_DB_SOPS: z.string().optional(),
	NOTION_DB_CRM: z.string().optional(),
	NOTION_DB_AUTOMATIONS: z.string().optional(),

	SUPABASE_URL: z.string().url(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

	PORT: z.coerce.number().int().positive().default(8787),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace"])
		.default("info"),
	PRIMEOS_API_KEY: z.string().min(16, "PRIMEOS_API_KEY must be >= 16 chars"),

	SYNC_INTERVAL_MINUTES: z.coerce.number().int().positive().default(15),
	SYNC_ON_BOOT: z
		.enum(["true", "false"])
		.default("false")
		.transform((v) => v === "true"),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
	console.error("Invalid environment:")
	for (const issue of parsed.error.issues) {
		console.error(`  ${issue.path.join(".")}: ${issue.message}`)
	}
	process.exit(1)
}

export const config = parsed.data

/** Normalize a Notion ID to dashless lowercase hex. */
export function normalizeNotionId(id: string): string {
	return id.replace(/-/g, "").toLowerCase()
}

export type ModuleKey =
	| "controlPanel"
	| "tasks"
	| "sops"
	| "crm"
	| "automations"

export const databaseIds: Record<ModuleKey, string | undefined> = {
	controlPanel: config.NOTION_DB_CONTROL_PANEL,
	tasks: config.NOTION_DB_TASKS,
	sops: config.NOTION_DB_SOPS,
	crm: config.NOTION_DB_CRM,
	automations: config.NOTION_DB_AUTOMATIONS,
}

export const supabaseTables: Record<ModuleKey, string> = {
	controlPanel: "notion_control_panel",
	tasks: "notion_tasks",
	sops: "notion_sops",
	crm: "notion_crm",
	automations: "notion_automations",
}