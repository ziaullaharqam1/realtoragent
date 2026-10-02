# PropPilot M1 migrations — expand/contract notes

| File | Expand | Contract / rollback (dev only) |
| --- | --- | --- |
| `0000_proppilot_m1.sql` | Creates `proppilot` schema, enables `pgcrypto` + `vector`, domain tables, feature flags, audit, stored_object, seed rows | `DROP SCHEMA IF EXISTS proppilot CASCADE;` — never in prod; do not drop shared `vector` extension |

**Rules**
- Additive only in shared/prod environments.
- Disable feature flags via `is_enabled=false` instead of deleting rows.
- Soft-delete stored objects via `deleted_at`; physical blob delete is a separate lifecycle job.
- Production target: **Vercel** + hosted Postgres (Neon/Supabase/etc.). No AWS RDS.
