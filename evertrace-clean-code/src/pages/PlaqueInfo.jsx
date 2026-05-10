import { ArrowLeft, Check, QrCode, Shield, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const features = [
  "Stainless steel QR plaque",
  "Laser engraved for a permanent finish",
  "Weatherproof for outdoor placement",
  "Strong adhesive backing",
  "Connects directly to the tribute page",
];

const placements = ["Gravesites", "Urn spaces", "Memorial gardens", "Family keepsakes"];

export default function PlaqueInfo() {
  const { tributeId } = useParams();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to={`/tribute/${tributeId}`} className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink/60">
        <ArrowLeft size={16} /> Back to tribute
      </Link>

      <section className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-soft">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[1.75rem] bg-[linear-gradient(150deg,#2D1B4E,#5A3E8C_55%,#E9E3F5)] p-6 text-white">
            <div className="grid aspect-[4/5] place-items-center rounded-[1.35rem] border border-white/20 bg-white/10 p-8 text-center shadow-soft">
              <div>
                <div className="mx-auto grid size-24 place-items-center rounded-3xl bg-white text-ink">
                  <QrCode size={48} />
                </div>
                <p className="eyebrow-light mt-8">EverTrace Memorial</p>
                <h1 className="mt-3 text-3xl font-semibold">A lasting doorway to their story</h1>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Memorial Plaques</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Preserve this tribute in the real world</h2>
            <p className="mt-5 text-lg leading-8 text-ink/68">
              A premium stainless steel QR plaque gives family and visitors a simple way to open the tribute page, read memories, and add their own.
            </p>

            <div className="mt-7 grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-3">
                  <Check className="shrink-0 text-deep-purple" size={18} />
                  <p className="font-medium text-ink/78">{feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-3xl border border-ink/10 p-5">
              <div className="flex items-center gap-3">
                <Shield className="text-deep-purple" size={22} />
                <p className="font-semibold">Designed for meaningful places</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {placements.map((placement) => (
                  <span key={placement} className="rounded-full bg-stone px-4 py-2 text-sm font-medium text-ink/70">
                    {placement}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-purple/45 px-5 font-semibold text-white sm:w-auto"
            >
              <Sparkles size={18} /> Order from Creator Access
            </button>
            <p className="mt-3 text-sm font-medium text-ink/50">
              Plaque ordering is available from the private creator link for this tribute.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
