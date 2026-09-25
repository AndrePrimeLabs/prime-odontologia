import { loadConfig } from "./app.config";

function main(): void {
  const app = loadConfig();
  console.log(`${app.name} v${app.version} is running in ${app.env} mode.`);
}

main();