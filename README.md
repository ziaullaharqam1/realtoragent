# PropPilot Pro — AI Real Estate Sales Command Center

Luxury broker portal with AI lead qualification, inventory matching, shadow approvals, PPTX presentation studio, and immersive 3D property walkthroughs.

## Vercel root directory (do not change)

| Setting | Value |
| --- | --- |
| **Root Directory** | `apps/ai-agent` |
| Framework | Vite |
| Build | `npm run build` |
| Output | `dist` |
| Production | https://realtoragent-seven.vercel.app/ |

This matches the existing `realtoragent` Vercel project. Repo-root `vercel.json` also sets `"rootDirectory": "apps/ai-agent"`.

## Backup

- Prior Next.js stack: git branch `cursor/backup-pre-proppilot-pro-2e6b`

## Local run

```bash
cd apps/ai-agent
cp .env.example .env.local   # optional GEMINI_API_KEY
npm install
npm run dev                  # http://127.0.0.1:13448
```

Or from the repo root: `npm run dev`.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + Vite 8 + TypeScript — **`apps/ai-agent`** |
| Styling | Tailwind CSS 4 |
| 3D | Three.js |
| Presentations | pptxgenjs |
| AI | Google Gemini (`GEMINI_API_KEY`) |
| Deploy | Vercel |
