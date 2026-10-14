# PropPilot Pro — AI Real Estate Sales Command Center

Luxury broker portal with AI lead qualification, inventory matching, shadow approvals, PPTX presentation studio, and immersive 3D property walkthroughs.

> **Backup of prior Next.js PropPilot:** git branch `cursor/backup-pre-proppilot-pro-2e6b` and artifact tarball under Cloud Agent backups.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + Vite 8 + TypeScript |
| Styling | Tailwind CSS 4 |
| 3D | Three.js |
| Motion | Motion (Framer) |
| Presentations | pptxgenjs |
| AI | Google Gemini (`@google/genai`) — set `GEMINI_API_KEY` |
| Deploy | Vercel (static Vite build → `dist`) |

## Local run

```bash
cp .env.example .env.local
# Optional: set GEMINI_API_KEY in .env.local
npm install
npm run dev
```

Open [http://127.0.0.1:13448](http://127.0.0.1:13448).

## Build

```bash
npm run build
npm run preview
```

## Vercel

- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- Env (optional): `GEMINI_API_KEY`

Production target: https://realtoragent-seven.vercel.app/
