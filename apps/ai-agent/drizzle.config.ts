import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://proppilot:proppilot@127.0.0.1:15432/proppilot",
  },
  schemaFilter: ["proppilot"],
});
