// primeos-main/entities/db/generate-schema.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "primeos-main", "entities");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function extractTableName(tsContent) {
  const m = tsContent.match(/createEntity\(\s*['"]([^'"]+)['"]\s*\)/);
  if (!m) throw new Error("createEntity(table) not found");
  return m[1];
}

function extractJsonSchema(tsContent) {
  // assumes the file ends with a JSON object literal (as in your AppVersion/AppReview/MobileApp)
  const start = tsContent.indexOf("{");
  const end = tsContent.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("JSON schema block not found");
  const jsonStr = tsContent.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

function pgTypeFor(prop) {
  if (!prop || typeof prop !== "object") return "jsonb";
  if (prop.type === "string") return "text";
  if (prop.type === "number" || prop.type === "integer") return "numeric";
  if (prop.type === "boolean") return "boolean";
  if (prop.type === "object") return "jsonb";
  if (prop.type === "array") {
    // if array of strings, you *can* use text[]; otherwise jsonb is safer
    const itemsType = prop.items?.type;
    if (itemsType === "string") return "text[]";
    return "jsonb";
  }
  return "jsonb";
}

function toColumnName(name) {
  // keep simple: convert to snake_case-ish, strip spaces/slashes
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function generateCreateTable(tableName, schema) {
  const props = schema?.properties || {};
  const required = new Set(schema?.required || []);

  const cols = [];
  cols.push(`  id uuid primary key default gen_random_uuid()`);
  cols.push(`  created_date timestamptz not null default now()`);
  cols.push(`  updated_date timestamptz not null default now()`);

  for (const [propName, propSchema] of Object.entries(props)) {
    const col = toColumnName(propName);
    if (!col || ["id", "created_date", "updated_date"].includes(col)) continue;

    const pgType = pgTypeFor(propSchema);
    const notNull = required.has(propName) ? " not null" : "";
    cols.push(`  ${col} ${pgType}${notNull}`);
  }

  return `create table if not exists ${tableName} (\n${cols.join(",\n")}\n);\n`;
}

function main() {
  const indexJs = read(path.join(ROOT, "index.js"));

  const entityNames = [...indexJs.matchAll(/export\s+\{\s+(\w+)\s+\}\s+from\s+['"]\.\/(\w+)['"]/g)]
    .map(m => m[2]); // file basename

  const header = `-- Generated from primeos-main/entities/*.ts JSON schemas\ncreate extension if not exists pgcrypto;\n\n`;
  const out = [header];

  for (const entityFileBase of entityNames) {
    const filePath = path.join(ROOT, `${entityFileBase}.ts`);
    if (!fs.existsSync(filePath)) continue;

    const ts = read(filePath);
    const tableName = extractTableName(ts);
    const schema = extractJsonSchema(ts);

    out.push(`-- ${schema.name || entityFileBase}\n`);
    out.push(generateCreateTable(tableName, schema));
    out.push("\n");
  }

  const outPath = path.resolve(process.cwd(), "primeos-main", "entities", "db", "schema.generated.sql");
  fs.writeFileSync(outPath, out.join(""), "utf8");
  console.log(`Wrote: ${outPath}`);
}

main();