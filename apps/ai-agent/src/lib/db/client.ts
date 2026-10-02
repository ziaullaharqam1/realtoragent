import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  __proppilotSql?: ReturnType<typeof postgres>;
};

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function createSqlClient(url = getDatabaseUrl()) {
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

export function getDb() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!globalForDb.__proppilotSql) {
    globalForDb.__proppilotSql = createSqlClient(url);
  }
  return drizzle(globalForDb.__proppilotSql, { schema });
}

export type AppDb = ReturnType<typeof getDb>;
