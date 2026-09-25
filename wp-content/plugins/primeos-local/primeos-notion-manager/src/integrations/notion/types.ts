/** Minimal structural types — avoids depending on SDK internal paths. */
export type NotionPropertyValue = { type: string } & Record<string, unknown>

export type NotionPage = {
	id: string
	url?: string
	created_time?: string
	last_edited_time?: string
	archived?: boolean
	properties: Record<string, NotionPropertyValue>
}

export type SyncRow = {
	notion_page_id: string
	title: string | null
	notion_url: string | null
	notion_created_time: string | null
	notion_last_edited_time: string | null
	archived: boolean
	raw: Record<string, unknown>
	synced_at: string
}

export type SyncResult = {
	module: string
	databaseId: string
	table: string
	fetched: number
	upserted: number
	durationMs: number
}