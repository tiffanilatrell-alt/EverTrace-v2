import { ArrowLeft, Copy, ExternalLink, LockKeyhole, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getManagedTribute } from "../services/tributeService";

export default function ManageTribute() {
  const { tributeId } = useParams();
  const [searchParams] = useSearchParams();
  const manageToken = searchParams.get("token") || "";
  const [tribute, setTribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const tributePath = `/tribute/${tributeId}`;
  const managePath = manageToken ? `/manage/${tributeId}?token=${manageToken}` : "";
  const manageUrl = typeof window === "undefined" ? managePath : `${window.location.origin}${managePath}`;

  useEffect(() => {
    let isMounted = true;

    async function loadManagedTribute() {
      setLoading(true);
      setError("");

      try {
        const managedTribute = await getManagedTribute(tributeId, manageToken);

        if (!isMounted) return;

        if (!managedTribute) {
          setError("This creator link is missing or no longer matches the tribute.");
          setTribute(null);
          return;
        }

        setTribute(managedTribute);
      } catch (err) {
        if (isMounted) {
          setError("We could not open creator access right now. Please try again soon.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadManagedTribute();

    return () => {
      isMounted = false;
    };
  }, [manageToken, tributeId]);

  async function copyManageLink() {
    try {
      await navigator.clipboard.writeText(manageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center px-4 py-8 sm:px-6">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink/60">
        <ArrowLeft size={16} /> Home
      </Link>

      <section className="rounded-[2rem] border border-ink/10 bg-white p-5 shadow-soft sm:p-8">
        <div className="grid size-14 place-items-center rounded-full bg-deep-purple text-white">
          <LockKeyhole size={25} />
        </div>

        <p className="eyebrow mt-8">Creator Access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {tribute?.name ? `Manage ${tribute.name}'s tribute` : "Open your tribute"}
        </h1>

        {loading && <p className="mt-5 leading-8 text-ink/65">Checking your private creator link...</p>}

        {!loading && error && (
          <div className="mt-6 rounded-3xl bg-cream p-5">
            <p className="font-semibold text-ink">Creator access was not found</p>
            <p className="mt-2 leading-7 text-ink/65">{error}</p>
          </div>
        )}

        {!loading && tribute && (
          <>
            <p className="mt-5 leading-8 text-ink/65">
              Keep this page bookmarked. It is the private place to return to this tribute as EverTrace adds editing,
              photo updates, and plaque setup.
            </p>

            <div className="mt-7 rounded-3xl bg-cream p-4">
              <p className="text-sm font-semibold text-ink/55">Private creator link</p>
              <p className="mt-2 break-all rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-ink/70">{manageUrl}</p>
              {copied && <p className="mt-3 text-sm font-semibold text-deep-purple">Private creator link copied.</p>}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                to={tributePath}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple"
              >
                <ExternalLink size={18} /> View Tribute
              </Link>
              <button
                type="button"
                onClick={copyManageLink}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone"
              >
                <Copy size={18} /> Copy Private Link
              </button>
            </div>

            <div className="mt-7 rounded-3xl border border-rich-purple/15 bg-light-purple/30 p-5">
              <div className="flex items-start gap-3">
                <QrCode className="mt-1 shrink-0 text-deep-purple" size={22} />
                <div>
                  <p className="font-semibold text-ink">Order Memorial Plaque</p>
                  <p className="mt-2 leading-7 text-ink/65">
                    Turn this tribute into a permanent doorway to the family memory archive.
                  </p>
                </div>
              </div>
              <Link
                to={`/plaques/${tributeId}/order?token=${manageToken}`}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple sm:w-auto"
              >
                <QrCode size={18} /> Continue to Plaque Order
              </Link>
            </div>

            <div className="mt-7 rounded-3xl border border-rich-purple/15 bg-light-purple/30 p-5">
              <p className="font-semibold text-ink">Editing is coming next</p>
              <p className="mt-2 leading-7 text-ink/65">
                For V2, this private access link protects the path back to the tribute. The next layer can add direct
                editing without forcing families into accounts too early.
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
