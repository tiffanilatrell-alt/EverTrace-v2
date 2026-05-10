import { ArrowLeft, CreditCard, QrCode, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getManagedTribute } from "../services/tributeService";

const placements = ["Gravesite", "Urn space", "Memorial garden", "Family keepsake", "Other"];

const initialForm = {
  customerName: "",
  email: "",
  placement: "Family keepsake",
  shippingStreet: "",
  shippingStreet2: "",
  shippingCity: "",
  shippingState: "",
  shippingZip: "",
  notes: "",
};

export default function PlaqueOrder() {
  const { tributeId } = useParams();
  const [searchParams] = useSearchParams();
  const manageToken = searchParams.get("token") || "";
  const [tribute, setTribute] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [accessState, setAccessState] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadTribute() {
      try {
        if (!manageToken) {
          setAccessState("blocked");
          return;
        }

        const tributeRecord = await getManagedTribute(tributeId, manageToken);

        if (!tributeRecord) {
          setAccessState("blocked");
          return;
        }

        if (isMounted) {
          setTribute(tributeRecord);
          setAccessState("allowed");
          setForm((current) => ({
            ...current,
            customerName: tributeRecord?.creatorName || "",
            email: tributeRecord?.email || "",
          }));
        }
      } catch (err) {
        if (isMounted) {
          setAccessState("error");
          setError("We could not open plaque ordering right now.");
        }
      }
    }

    loadTribute();

    return () => {
      isMounted = false;
    };
  }, [manageToken, tributeId]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <Link to={`/plaques/${tributeId}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-ink/60 sm:mb-8">
        <ArrowLeft size={16} /> Back to plaque details
      </Link>

      {accessState !== "allowed" && (
        <section className="mx-auto max-w-2xl rounded-[2rem] border border-ink/10 bg-white p-6 text-center shadow-soft sm:p-8">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-light-purple text-deep-purple">
            <QrCode size={28} />
          </div>
          <p className="eyebrow mt-8">Memorial Plaque</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {accessState === "loading" ? "Opening plaque order..." : "This page isn't available from here."}
          </h1>
          <p className="mx-auto mt-4 max-w-lg leading-8 text-ink/65">
            {accessState === "loading"
              ? "One moment while we check this tribute."
              : "To order a plaque, open the tribute from the creator access page."}
          </p>
          <Link
            to={`/tribute/${tributeId}`}
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple"
          >
            Back to Tribute
          </Link>
        </section>
      )}

      {accessState === "allowed" && (
      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.7fr)] lg:items-start">
        <form onSubmit={(event) => event.preventDefault()} className="min-w-0 rounded-[1.5rem] border border-ink/10 bg-white p-4 shadow-soft sm:rounded-[2rem] sm:p-8">
          <p className="eyebrow">Plaque Setup</p>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-tight sm:text-5xl">Order a memorial plaque</h1>
          <p className="mt-4 max-w-2xl leading-8 text-ink/65">
            The tribute stays digital-first. When Stripe checkout is connected, this page will send the tribute details
            to checkout so EverTrace can assign and link a physical QR plaque after payment.
          </p>

          <div className="mt-7 rounded-3xl border border-rich-purple/10 bg-cream p-5">
            <p className="text-sm font-semibold text-ink">Tribute</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{tribute?.name || "This tribute"}</p>
            <p className="mt-1 text-sm text-ink/55">
              A plaque becomes a permanent doorway back to this tribute and its family memories.
            </p>
          </div>

          <div className="mt-7 grid gap-4">
            <TextField
              label="Your name"
              value={form.customerName}
              onChange={(value) => updateField("customerName", value)}
              placeholder="Name for the order"
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
              placeholder="you@example.com"
              required
            />

            <label className="block">
              <span className="text-sm font-semibold text-ink/72">Where will this plaque live?</span>
              <select
                value={form.placement}
                onChange={(event) => updateField("placement", event.target.value)}
                className="mt-2 min-h-12 w-full rounded-full border border-ink/10 bg-cream px-4 outline-none transition focus:border-rich-purple focus:bg-white focus:ring-4 focus:ring-rich-purple/10"
              >
                {placements.map((placement) => (
                  <option key={placement} value={placement}>
                    {placement}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <p className="text-sm font-semibold text-ink/72">Shipping address</p>
              <div className="mt-2 grid gap-3">
                <TextField
                  label="Street"
                  value={form.shippingStreet}
                  onChange={(value) => updateField("shippingStreet", value)}
                  placeholder="Street address"
                  required
                />
                <TextField
                  label="Street 2"
                  value={form.shippingStreet2}
                  onChange={(value) => updateField("shippingStreet2", value)}
                  placeholder="Apt, suite, unit, etc."
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem_8rem]">
                  <TextField
                    label="City"
                    value={form.shippingCity}
                    onChange={(value) => updateField("shippingCity", value)}
                    placeholder="City"
                    required
                  />
                  <TextField
                    label="State"
                    value={form.shippingState}
                    onChange={(value) => updateField("shippingState", value)}
                    placeholder="State"
                    maxLength={2}
                    required
                  />
                  <TextField
                    label="ZIP"
                    value={form.shippingZip}
                    onChange={(value) => updateField("shippingZip", value)}
                    placeholder="ZIP"
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-ink/72">Order notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Anything we should know before checkout?"
                rows={3}
                className="mt-2 w-full resize-none rounded-3xl border border-ink/10 bg-cream px-4 py-4 leading-7 outline-none transition placeholder:text-ink/35 focus:border-rich-purple focus:bg-white focus:ring-4 focus:ring-rich-purple/10"
              />
            </label>
          </div>

          {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={!tribute}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep-purple/45 px-5 font-semibold text-white"
            >
              <CreditCard size={18} /> Continue to Stripe Checkout
            </button>
            <Link
              to={`/tribute/${tributeId}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone"
            >
              Return to Tribute
            </Link>
          </div>
          <p className="mt-3 text-sm font-medium text-ink/50">Checkout is not connected yet.</p>
        </form>

        <aside className="min-w-0 rounded-[1.5rem] border border-rich-purple/10 bg-white p-4 shadow-soft sm:rounded-[2rem] sm:p-5 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[1.5rem] bg-ink text-white">
            <img
              src="/qrCodeInBox.jpg"
              alt="QR memorial plaque displayed in a keepsake box"
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="p-5">
              <p className="eyebrow-light">EverTrace Plaque</p>
              <p className="mt-3 text-2xl font-semibold">A permanent doorway to their story</p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-cream p-4">
            <p className="text-sm font-semibold text-ink/55">Checkout connection</p>
            <p className="mt-2 text-sm leading-6 text-ink/65">
              Stripe will receive the tribute, loved one name, owner email, and plaque product type. After payment,
              fulfillment assigns the short code and links the plaque to this tribute.
            </p>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-3xl border border-ink/10 p-4">
            <Shield className="mt-0.5 shrink-0 text-deep-purple" size={20} />
            <p className="text-sm leading-6 text-ink/62">
              After successful checkout, the backend should create or update a plaque record, assign a shortCode, link it
              to this tribute, and update the tribute with plaqueId.
            </p>
          </div>
        </aside>
      </section>
      )}
    </main>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  inputMode,
  maxLength,
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink/72">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        className="mt-2 min-h-12 w-full rounded-full border border-ink/10 bg-cream px-4 outline-none transition placeholder:text-ink/35 focus:border-rich-purple focus:bg-white focus:ring-4 focus:ring-rich-purple/10"
      />
    </label>
  );
}
