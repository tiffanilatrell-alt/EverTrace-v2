import { ArrowLeft, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getPlaqueByCode } from "../services/tributeService";

export default function PlaqueRedirect() {
  const { plaqueCode = "" } = useParams();
  const [status, setStatus] = useState("loading");
  const [tributeId, setTributeId] = useState("");

  const isPlaqueCode = /^\d{3}$/.test(plaqueCode);

  useEffect(() => {
    let isMounted = true;

    async function loadPlaque() {
      if (!isPlaqueCode) {
        setStatus("invalid");
        return;
      }

      try {
        const plaque = await getPlaqueByCode(plaqueCode);

        if (!isMounted) return;

        if (!plaque?.tributeId) {
          setStatus("unassigned");
          return;
        }

        setTributeId(plaque.tributeId);
        setStatus("found");
      } catch (err) {
        if (isMounted) setStatus("error");
      }
    }

    loadPlaque();

    return () => {
      isMounted = false;
    };
  }, [isPlaqueCode, plaqueCode]);

  if (!isPlaqueCode) {
    return <Navigate to="/" replace />;
  }

  if (status === "found" && tributeId) {
    return <Navigate to={`/tribute/${tributeId}`} replace />;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col justify-center px-4 py-8 sm:px-6">
      <section className="rounded-[2rem] border border-ink/10 bg-white p-6 text-center shadow-soft sm:p-8">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-light-purple text-deep-purple">
          {status === "loading" ? <Loader2 className="animate-spin" size={28} /> : <QrCode size={28} />}
        </div>

        <p className="eyebrow mt-8">EverTrace Plaque {plaqueCode}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {status === "loading" ? "Opening this tribute..." : "This plaque has not been activated yet"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg leading-8 text-ink/65">
          {status === "loading"
            ? "We are looking up the tribute connected to this QR plaque."
            : "This EverTrace plaque exists, but it is not linked to a tribute page yet."}
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone"
        >
          <ArrowLeft size={18} /> Go to EverTrace
        </Link>
      </section>
    </main>
  );
}
