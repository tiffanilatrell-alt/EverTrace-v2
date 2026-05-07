import { Check, Copy, ExternalLink, QrCode, Share2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const shareText = "Invite family and friends to add their memories.";

export default function PublishSuccess() {
  const { tributeId } = useParams();
  const [copied, setCopied] = useState(false);
  const tributePath = `/tribute/${tributeId}`;
  const tributeUrl = typeof window === "undefined" ? tributePath : `${window.location.origin}${tributePath}`;

  function showCopied() {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(tributeUrl);
      showCopied();
    } catch (err) {
      setCopied(false);
    }
  }

  async function shareTribute() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "EverTrace tribute",
          text: shareText,
          url: tributeUrl,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    await copyLink();
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-8">
        <div className="grid size-14 place-items-center rounded-full bg-deep-purple text-white">
          <Check size={26} />
        </div>

        <p className="eyebrow mt-8">Published</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Your tribute is live.</h1>
        <p className="mt-4 max-w-xl leading-8 text-ink/65">{shareText}</p>

        <div className="mt-7 rounded-3xl bg-cream p-4">
          <p className="text-sm font-semibold text-ink/55">Tribute link</p>
          <p className="mt-2 break-all rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-ink/70">{tributeUrl}</p>
          {copied && <p className="mt-3 text-sm font-semibold text-deep-purple">Link copied. {shareText}</p>}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={shareTribute}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple"
          >
            <Share2 size={18} /> Share with Family
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone"
          >
            <Copy size={18} /> Copy Link
          </button>
        </div>

        <Link
          to={tributePath}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone"
        >
          <ExternalLink size={18} /> View Tribute
        </Link>

        <div className="mt-7 rounded-3xl border border-ink/10 p-5">
          <QrCode className="text-deep-purple" size={24} />
          <p className="mt-3 font-semibold">Preserve it later</p>
          <p className="mt-2 leading-7 text-ink/65">
            When this tribute is ready, you can preserve it with a lasting QR memorial plaque.
          </p>
        </div>
      </section>
    </main>
  );
}
