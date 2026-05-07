import { CalendarDays, Plus, X } from "lucide-react";

function buildTimelineItems({ name, birthYear, passingYear, events }) {
  const generatedItems = [
    birthYear && {
      id: "birth",
      year: birthYear,
      yearNumber: Number(birthYear) || 0,
      title: `${name} was born`,
      description: "The beginning of a life that would leave a lasting trace.",
      generated: true,
    },
    passingYear && {
      id: "passing",
      year: passingYear,
      yearNumber: Number(passingYear) || 9999,
      title: "A life remembered",
      description: "Their story continues through the people, memories, and love they left behind.",
      generated: true,
    },
  ].filter(Boolean);

  return [...generatedItems, ...events]
    .map((item) => ({ ...item, yearNumber: item.yearNumber || Number(item.year) || 0 }))
    .sort((a, b) => a.yearNumber - b.yearNumber);
}

export default function LifeTimeline({
  name,
  birthYear,
  passingYear,
  events = [],
  form,
  onFormChange,
  onSubmit,
  onCancel,
  isAdding = false,
  onStartAdding,
  saving = false,
}) {
  const items = buildTimelineItems({ name, birthYear, passingYear, events });

  if (!items.length) return null;

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-rich-purple/10 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 bg-light-purple/55 px-5 py-5 sm:px-6">
        <div>
          <p className="eyebrow">Life Timeline</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Important moments</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">
            Birth and passing dates appear automatically. Add meaningful chapters as the tribute grows.
          </p>
        </div>
        {onStartAdding && !isAdding && (
          <button
            type="button"
            onClick={onStartAdding}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-deep-purple text-white shadow-sm transition hover:bg-rich-purple"
            aria-label="Add an important date"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className="relative px-5 py-6 sm:px-6">
        <div className="absolute bottom-6 left-[2.05rem] top-6 w-px bg-rich-purple/18 sm:left-[2.3rem]" />
        <div className="space-y-5">
          {items.map((item) => (
            <article key={item.id} className="relative grid grid-cols-[2.6rem_1fr] gap-4">
              <div className="relative z-10 grid size-10 place-items-center rounded-full border border-rich-purple/15 bg-cream text-deep-purple shadow-sm">
                <CalendarDays size={17} />
              </div>
              <div className="rounded-2xl border border-ink/10 bg-cream/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-deep-purple shadow-sm">{item.year}</span>
                  {item.generated && <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/35">Auto</span>}
                </div>
                <h4 className="mt-3 text-lg font-semibold text-ink">{item.title}</h4>
                {item.description && <p className="mt-2 leading-7 text-ink/65">{item.description}</p>}
              </div>
            </article>
          ))}
        </div>

        {isAdding && (
          <form onSubmit={onSubmit} className="mt-6 rounded-3xl border border-rich-purple/15 bg-light-purple/45 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-deep-purple">Add an important date</p>
                <p className="mt-1 text-sm leading-6 text-ink/60">A wedding, move, milestone, favorite chapter, or family moment.</p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink/60 transition hover:bg-cream"
                aria-label="Cancel timeline entry"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[8rem_1fr]">
              <input
                value={form.year}
                onChange={(event) => onFormChange({ ...form, year: event.target.value })}
                placeholder="Year"
                inputMode="numeric"
                required
                className="min-h-12 rounded-full border border-ink/10 bg-white px-4 outline-none focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
              />
              <input
                value={form.title}
                onChange={(event) => onFormChange({ ...form, title: event.target.value })}
                placeholder="What happened?"
                required
                className="min-h-12 rounded-full border border-ink/10 bg-white px-4 outline-none focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
              />
            </div>
            <textarea
              value={form.description}
              onChange={(event) => onFormChange({ ...form, description: event.target.value })}
              placeholder="Add a few details, if you want."
              rows={3}
              className="mt-3 w-full resize-none rounded-3xl border border-ink/10 bg-white px-4 py-3 leading-7 outline-none focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
            />
            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple disabled:bg-deep-purple/45 sm:w-auto"
            >
              {saving ? "Adding..." : "Add to Timeline"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}