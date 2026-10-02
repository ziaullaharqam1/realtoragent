# PropPilot

Isolated AI agent service for real-estate workflows. Demo-first slice (M1–M15 foundations)
runs on Vercel **without** Postgres/Redis/LLM by default.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 15 (App Router) + TypeScript — **`apps/ai-agent`** |
| Deploy | **Vercel** (production). No AWS deploy targets. |
| Demo | In-memory store when `DEMO_MODE=true` or `DATABASE_URL` unset |
| DB | PostgreSQL + pgvector (optional Compose / Neon / Supabase) |
| Cache | Redis local / Upstash on Vercel (optional in demo) |
| Object storage | Memory / MinIO local; Vercel Blob later — not AWS S3 |
| Migrations | Drizzle SQL migrations (`apps/ai-agent/drizzle`) |

## Local run (demo — no Docker)

```bash
cd apps/ai-agent
cp .env.example .env.local   # DEMO_MODE=true by default
npm install
npm run dev
```

Open [http://127.0.0.1:13447](http://127.0.0.1:13447) → **Chat** or **Admin**.

## Local run (with Postgres)

```bash
docker compose -f deploy/docker-compose.yml up -d postgres redis minio minio-init
cd apps/ai-agent
# set DATABASE_URL, DEMO_MODE=false, GATEWAY_MODE=local in .env.local
npm run db:migrate
npm run dev
```

## Product surfaces

| Path | Purpose |
| --- | --- |
| `/chat` | Web chat → orchestrator |
| `/admin` | Leads, shadow approvals, flags, health |
| `/presentations/[id]` | Fact-based presentation viewer |
| `POST /api/chat` | Inbound web message |
| `GET /api/properties/search` | Hybrid search |
| `GET /api/health` | Live / ready / LLM probes (demo-aware) |

## Tests

```bash
cd apps/ai-agent
npm test
npm run build
```

## Vercel

1. Root Directory: `apps/ai-agent`
2. Leave `DATABASE_URL` unset **or** set `DEMO_MODE=true` for zero-infra demo
3. Optional: Neon/Supabase `DATABASE_URL`, Upstash Redis, `LLM_ENABLED=true` + OpenAI-compatible keys
4. No AWS ECS/EKS/Lambda/RDS/S3

## Layout

```text
apps/ai-agent/src/lib/ai-agent/
  demo/           In-memory seeded store
  agents/         Qualification, Matching, Scheduling, Presentation, Handoff, Nurture
  orchestrator/   processInboundMessage + shadow/outbox
  llm/            Mock + OpenAI-compatible client
  embeddings/     Deterministic mock vectors + refresh
  search/         Hybrid hard filters + cosine
  channels/       Web + WhatsApp/Telegram/Email stubs
  shadow/         Approvals
  n8n/            Signed webhook bridge stubs
  presentations/  PresentationSpec builder
```
