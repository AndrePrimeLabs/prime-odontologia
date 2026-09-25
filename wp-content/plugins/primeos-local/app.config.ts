import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface AppConfig {
  name: string;
  version: string;
  env: "development" | "production" | "test";
}

// Mirrors scripts/deploy.mjs: process.env wins, then .env, then .env.local fill any gaps.
function loadEnvFiles(): void {
  for (const filename of [".env", ".env.local"]) {
    const filePath = resolve(process.cwd(), filename);
    if (!existsSync(filePath)) continue;
    for (const line of readFileSync(filePath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      const name = key?.trim();
      if (name && !(name in process.env)) {
        process.env[name] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

export function loadConfig(): AppConfig {
  loadEnvFiles();
  return {
    name: process.env.APP_NAME ?? "PrimeOS",
    version: process.env.APP_VERSION ?? "1.0.0",
    env: (process.env.NODE_ENV as AppConfig["env"]) ?? "development",
  };
}
