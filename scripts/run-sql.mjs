// Executa um arquivo .sql no banco apontado por SUPABASE_DB_URL.
// Uso: node --env-file=.env.local scripts/run-sql.mjs <arquivo.sql>
import { readFile } from "node:fs/promises";
import pg from "pg";

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/run-sql.mjs <arquivo.sql>");
  process.exit(1);
}
if (!process.env.SUPABASE_DB_URL) {
  console.error("SUPABASE_DB_URL não definida (veja .env.example).");
  process.exit(1);
}

const sql = await readFile(file, "utf8");
const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
client.on("notice", (n) => console.log(`NOTICE: ${n.message}`));

await client.connect();
try {
  await client.query(sql);
  console.log(`OK: ${file}`);
} catch (err) {
  console.error(`ERRO em ${file}: ${err.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
