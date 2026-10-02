# PropPilot

Isolated AI agent service for real-estate workflows. **Milestone 1** foundation only:
gateways, feature flags (kill switch + shadow mode), tool-call audit hooks, health probes,
object-storage client, Postgres/pgvector migrations, Redis, MinIO (local).

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 15 (App Router) + TypeScript — **`apps/ai-agent`** |
| Deploy | **Vercel** (production). No AWS deploy targets. |
| DB | PostgreSQL + pgvector (Compose local; Neon/Supabase/etc. on Vercel) |
| Cache | Redis local / Upstash on Vercel |
| Object storage | MinIO local; Vercel Blob / R2 / Supabase Storage later — not AWS S3 deploy |
| Migrations | Drizzle SQL migrations (`apps/ai-agent/drizzle`) |

## Local run

```bash
# 1) Dependencies (requires Docker)
docker compose -f deploy/docker-compose.yml up -d postgres redis minio minio-init

# 2) App
cd apps/ai-agent
cp .env.example .env.local
npm install
npm run db:migrate
npm run dev
```

Open [http://127.0.0.1:13447](http://127.0.0.1:13447).

Health:

- `GET /api/health/live` — process liveness
- `GET /api/health/ready` — DB + Redis
- `GET /api/health/startup` — DB only
- `GET /api/health` — DB + Redis + LLM (LLM may be `not_configured`)
- `GET /api/ai/gate` — kill-switch / shadow evaluation

Optional full Compose (builds the Next image):

```bash
docker compose -f deploy/docker-compose.yml up --build
```

## Tests

```bash
cd apps/ai-agent
npm test
```

Integration tests against Postgres require Compose (or a reachable `DATABASE_URL`). Unit tests run without Docker.

## Vercel

1. Import the repo in Vercel; set **Root Directory** to `apps/ai-agent`.
2. Configure env: `DATABASE_URL` (hosted Postgres with pgvector if possible), `REDIS_PROVIDER=upstash` + Upstash REST credentials, `OBJECT_STORAGE_PROVIDER` (e.g. `vercel-blob` when wired), `GATEWAY_MODE=local`, `LLM_ENABLED=false`.
3. Run migrations against the hosted DB (`npm run db:migrate`) from CI or a one-off job.
4. Deploy. Do **not** point this project at AWS ECS/EKS/Lambda/RDS/S3.

## Layout

```text
apps/ai-agent/          Next.js PropPilot service (Vercel)
  src/lib/ai-agent/     Kill-switch boundary, gateways, flags, audit, storage, health
  drizzle/              Additive SQL migrations + notes
deploy/                 Local Docker Compose only
.github/workflows/ci.yml
```

## Out of scope (later milestones)

Agents, LLM tool loop, channels, embeddings search, presentations, n8n.
