import { ArrowRight, BookOpen, Leaf, QrCode, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: BookOpen,
    title: "Create the tribute",
    body: "Begin with photos, a name, dates, and a few words that feel true.",
  },
  {
    icon: Share2,
    title: "Invite family in",
    body: "Share a private-feeling link so loved ones can add memories in their own time.",
  },
  {
    icon: QrCode,
    title: "Preserve it later",
    body: "When the tribute feels ready, connect it to a lasting QR memorial plaque.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/home-hero.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-purple/78 via-deep-purple/58 to-rich-purple/72" />
        <div className="absolute inset-0 bg-ink/20" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center text-white sm:px-6">
          <div className="grid size-14 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
            <Leaf size={26} />
          </div>
          <p className="eyebrow-light mt-8">EverTrace Memorials</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Every life leaves trace, we help you preserve it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
            Create a living tribute, invite family to share memories, and preserve it with a lasting memorial plaque.
          </p>
          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/start"
              className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-deep-purple shadow-soft transition hover:bg-light-purple sm:w-auto"
            >
              Start a Tribute <ArrowRight size={18} />
            </Link>
            <Link
              to="/example"
              className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/18 sm:w-auto"
            >
              View Example
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">How it Works</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink">A gentle path from memory to legacy</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-rich-purple/10 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <step.icon className="text-deep-purple" size={24} />
                <span className="text-sm font-semibold text-accent-gold">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-deep-purple">{step.title}</h3>
              <p className="mt-3 leading-7 text-ink/65">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow">Example Tribute</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ink">See how a finished tribute can feel</h2>
          <p className="mt-4 leading-8 text-ink/68">
            A premium tribute page brings together identity, stories, reactions, family memories, and a soft path toward a physical plaque.
          </p>
          <Link
            to="/example"
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-rich-purple transition hover:bg-stone sm:w-auto"
          >
            View Example Tribute <ArrowRight size={18} />
          </Link>
        </div>

        <div className="rounded-2xl border border-rich-purple/10 bg-white p-4 shadow-soft">
          <div className="overflow-hidden rounded-2xl bg-[linear-gradient(150deg,#2D1B4E,#5A3E8C_55%,#E9E3F5)] p-5 text-white">
            <div className="flex min-h-[420px] flex-col justify-end">
              <p className="eyebrow-light">In Loving Memory</p>
              <h3 className="mt-3 text-4xl font-semibold">Maya Bennett</h3>
              <p className="mt-2 text-white/80">1948 - 2025</p>
              <p className="mt-5 max-w-md leading-7 text-white/85">
                A warm, steady presence remembered through stories, small rituals, and the people who loved her.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {["Candle", "Love", "Flowers"].map((label) => (
                  <div key={label} className="rounded-2xl bg-white/12 px-3 py-3 text-center backdrop-blur">
                    <p className="text-xs font-semibold text-white/70">{label}</p>
                    <p className="mt-1 text-lg font-semibold">24</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 rounded-2xl border border-rich-purple/10 bg-light-purple p-6 shadow-soft sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Memorial Plaques</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">A physical doorway to the stories they left behind</h2>
            <p className="mt-4 max-w-2xl leading-8 text-ink/68">
              A stainless steel QR plaque can connect a gravesite, urn space, memorial garden, or family keepsake directly to the tribute.
            </p>
          </div>
          <div className="grid size-32 place-items-center rounded-2xl bg-white text-deep-purple shadow-sm">
            <QrCode size={58} />
          </div>
        </div>
      </section>
    </main>
  );
}
