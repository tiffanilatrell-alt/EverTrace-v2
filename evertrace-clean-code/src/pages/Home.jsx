import { ArrowRight, BookOpen, HelpCircle, Leaf, Newspaper, QrCode, Share2 } from "lucide-react";
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

const teaserCards = [
  {
    icon: Leaf,
    title: "About EverTrace",
    body: "Learn why EverTrace begins with digital tribute pages and grows into lasting memorial connections.",
    to: "/about",
  },
  {
    icon: HelpCircle,
    title: "FAQs",
    body: "Get quick answers about tributes, privacy, sharing, photos, and optional QR plaques.",
    to: "/faq",
  },
  {
    icon: Newspaper,
    title: "Related Articles",
    body: "Read gentle guidance for writing tributes, inviting family stories, and preserving memories.",
    to: "/resources",
  },
];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/home-hero.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-purple/78 via-deep-purple/58 to-rich-purple/72" />
        <div className="absolute inset-0 bg-ink/20" />
        <div className="relative mx-auto flex min-h-[calc(100svh-7.25rem)] max-w-5xl flex-col items-center justify-center px-3 py-16 text-center text-white sm:min-h-[calc(100vh-4rem)] sm:px-6 sm:py-20">
          <div className="grid size-14 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
            <Leaf size={26} />
          </div>
          <p className="eyebrow-light mt-8">EverTrace Memorials</p>
          <h1 className="mt-5 max-w-4xl text-[2.65rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
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

      <section className="mx-auto max-w-6xl px-3 py-12 sm:px-6 sm:py-16">
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

      <section className="mx-auto max-w-6xl px-3 pb-14 sm:px-6 sm:pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {teaserCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group rounded-2xl border border-rich-purple/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-rich-purple/25 hover:shadow-soft"
            >
              <card.icon className="text-deep-purple" size={24} />
              <h3 className="mt-5 text-xl font-semibold text-ink">{card.title}</h3>
              <p className="mt-3 leading-7 text-ink/65">{card.body}</p>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-deep-purple transition group-hover:text-rich-purple">
                Learn more <ArrowRight size={17} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-3 pb-14 sm:px-6 sm:pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
          <div className="relative min-h-[340px] overflow-hidden rounded-2xl bg-deep-purple p-4 text-white sm:min-h-[420px] sm:p-5">
            <img src="/peace-banner.png" alt="Peaceful tribute banner" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(45,27,78,0.75),rgba(45,27,78,0.55))]" />
            <div className="relative flex min-h-[308px] flex-col justify-end sm:min-h-[380px]">
              <p className="eyebrow-light">Example Tribute</p>
              <div className="mt-4 flex items-end gap-3 sm:mt-5 sm:gap-4">
                <img
                  src="/example-primary.png"
                  alt="Jean E. White"
                  className="h-28 w-20 shrink-0 rounded-[1.25rem] border border-white/25 object-cover object-[center_30%] p-1 sm:h-32 sm:w-24"
                />
                <div>
                  <p className="eyebrow-light">In Loving Memory</p>
                  <h3 className="mt-2 text-3xl font-semibold sm:text-4xl">Jean E. White</h3>
                  <p className="mt-2 text-white/82">1950 - 2005</p>
                </div>
              </div>
              <p className="mt-5 line-clamp-3 max-w-xl leading-7 text-white/88">
                To know Jean was to feel remembered. She had a quiet confidence and a thoughtful way of speaking, and somehow she always made you believe in yourself.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ["\u{1F56F}\uFE0F", "Light a candle", "42"],
                  ["\u{1F54A}\uFE0F", "Send your love", "86"],
                  ["\u{1F338}", "Give flowers", "31"],
                ].map(([icon, label, count]) => (
                  <div key={label} className="rounded-2xl border border-white/28 bg-white/18 px-3 py-3 text-center text-white shadow-sm backdrop-blur">
                    <p className="text-xl leading-none">{icon}</p>
                    <p className="mt-2 truncate text-xs font-semibold text-white/82">{label}</p>
                    <p className="mt-1 text-lg font-semibold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-3 pb-16 sm:px-6 sm:pb-20">
        <div className="grid gap-6 rounded-2xl border border-rich-purple/10 bg-light-purple p-6 shadow-soft sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Memorial Plaques</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">A physical doorway to the stories they left behind</h2>
            <p className="mt-4 max-w-2xl leading-8 text-ink/68">
              A stainless steel QR plaque can connect a gravesite, urn space, memorial garden, or family keepsake directly to the tribute.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm lg:w-72">
            <img
              src="/qrCodeInBox.jpg"
              alt="QR memorial plaque displayed in a keepsake box"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
