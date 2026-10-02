import Link from "next/link";
import { getDemoStore } from "@/lib/ai-agent/demo/store";
import type { PresentationSpec, PresentationSlide } from "@/lib/ai-agent/presentations/spec";

type Params = { params: Promise<{ id: string }> };

function SlideView({ slide }: { slide: PresentationSlide }) {
  if (slide.type === "cover") {
    return (
      <section className="space-y-3 border-b border-white/10 pb-8">
        <h2 className="text-3xl font-semibold text-white">{slide.title}</h2>
        <p className="text-xl text-[color:var(--accent-2)]">{slide.subtitle}</p>
        <p className="text-sm text-white/60">{slide.location}</p>
      </section>
    );
  }
  if (slide.type === "facts") {
    return (
      <section className="space-y-3 border-b border-white/10 py-8">
        <h3 className="text-lg font-medium text-white">{slide.title}</h3>
        <dl className="grid gap-2 sm:grid-cols-2">
          {slide.rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3 border-b border-white/5 py-1 text-sm">
              <dt className="capitalize text-white/50">{row.label}</dt>
              <dd className="text-white/85">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }
  if (slide.type === "amenities") {
    return (
      <section className="space-y-3 border-b border-white/10 py-8">
        <h3 className="text-lg font-medium text-white">{slide.title}</h3>
        <ul className="flex flex-wrap gap-2">
          {slide.items.map((item) => (
            <li key={item} className="rounded-md bg-white/8 px-3 py-1 text-sm text-white/80">
              {item}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section className="space-y-3 py-8">
      <h3 className="text-lg font-medium text-white">{slide.title}</h3>
      <p className="text-sm leading-relaxed text-white/70">{slide.body}</p>
    </section>
  );
}

export default async function PresentationViewerPage({ params }: Params) {
  const { id } = await params;
  const presentation = getDemoStore().presentations.find((p) => p.id === id);

  if (!presentation) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl text-white">Presentation not found</h1>
        <p className="mt-2 text-sm text-white/60">
          Create one via chat (&quot;build a presentation for Marina&quot;) or POST /api/presentations.
        </p>
        <Link href="/admin" className="mt-6 inline-block text-sm text-white/50 hover:text-white">
          ← Admin
        </Link>
      </main>
    );
  }

  const spec = presentation.spec as unknown as PresentationSpec;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm tracking-[0.35em] uppercase text-[color:var(--accent-2)]">PropPilot</p>
        <h1 className="text-3xl font-semibold text-white">Presentation</h1>
        <p className="text-sm text-white/55">
          Fact-based deck · {spec.priceLabel} · generated {new Date(spec.generatedAt).toLocaleString()}
        </p>
        <Link href="/chat" className="text-sm text-white/50 hover:text-white">
          ← Chat
        </Link>
      </header>
      <article className="rounded-lg border border-white/10 bg-black/25 px-6 py-2">
        {spec.slides.map((slide, idx) => (
          <SlideView key={`${slide.type}-${idx}`} slide={slide} />
        ))}
      </article>
    </main>
  );
}
