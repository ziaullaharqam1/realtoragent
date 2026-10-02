import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const url =
    process.env.DATABASE_URL ??
    "postgresql://proppilot:proppilot@127.0.0.1:15432/proppilot";
  const sql = postgres(url, { max: 1 });

  await sql`
    CREATE TABLE IF NOT EXISTS proppilot_schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const dir = path.join(process.cwd(), "drizzle");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count FROM proppilot_schema_migrations WHERE id = ${file}
    `;
    if (count > 0) {
      console.log(`skip ${file}`);
      continue;
    }
    const body = readFileSync(path.join(dir, file), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`INSERT INTO proppilot_schema_migrations (id) VALUES (${file})`;
    });
    console.log(`applied ${file}`);
  }

  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
