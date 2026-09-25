import { Client, iteratePaginatedAPI } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: "2026-03-11",
});

// Option 1: iterate one page of results at a time (async iterator)
for await (const page of iteratePaginatedAPI(
  notion.dataSources.query,
  { data_source_id: "<data_source_id>" }
)) {
  // Process each page result as it arrives
  console.log(page);
}

// Option 2: collect all results into an array
import { collectPaginatedAPI } from "@notionhq/client";

const allPages = await collectPaginatedAPI(
  notion.dataSources.query,
  { data_source_id: "<data_source_id>" }
);