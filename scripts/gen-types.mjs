// Gera src/types/database.ts a partir do schema do projeto remoto.
// Requer `npx supabase login` feito uma vez e SUPABASE_PROJECT_REF no .env.local.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const ref = process.env.SUPABASE_PROJECT_REF;
if (!ref) {
  console.error("SUPABASE_PROJECT_REF não definida (veja .env.example).");
  process.exit(1);
}

const types = execSync(
  `npx supabase gen types typescript --project-id ${ref} --schema public`,
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);
writeFileSync("src/types/database.ts", types);
console.log("OK: src/types/database.ts");
