import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const reactions = [
  { key: "candle", icon: "\u{1F56F}\uFE0F", label: "Light a candle" },
  { key: "love", icon: "\u{1F54A}\uFE0F", label: "Send your love" },
  { key: "flowers", icon: "\u{1F338}", label: "Give flowers" },
];

export default function PhotoGallery({ photos, onReact }) {
  const visiblePhotos = photos.slice(0, 8);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!visiblePhotos.length) return null;

  const activePhoto = visiblePhotos[Math.min(activeIndex, visiblePhotos.length - 1)];

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? visiblePhotos.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current === visiblePhotos.length - 1 ? 0 : current + 1));
  }

  return (
    <section className="mt-8 rounded-3xl bg-stone p-4 sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Photos</p>
          <h3 className="mt-2 text-xl font-semibold">Moments remembered</h3>
        </div>
        <p className="text-sm font-medium text-ink/45">{visiblePhotos.length} of 8</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.6rem] bg-white shadow-sm">
        <div className="relative">
          <img
            src={activePhoto.photoUrl}
            alt={activePhoto.alt || "Tribute memory"}
            className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
          />

          {visiblePhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Previous photo"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Next photo"
              >
                <ChevronRight size={19} />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 rounded-full bg-deep-purple/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {activeIndex + 1} / {visiblePhotos.length}
          </div>
        </div>

        <div className="border-t border-ink/10 bg-white p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-2">
            {reactions.map((reaction) => (
              <button
                key={reaction.key}
                type="button"
                onClick={() => onReact?.(activePhoto.id, reaction.key)}
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rich-purple/10 bg-cream px-3 text-sm font-semibold text-ink/70 transition hover:border-rich-purple/30 hover:bg-stone"
                aria-label={`${reaction.label} for photo`}
              >
                <span className="text-base transition group-hover:scale-110">{reaction.icon}</span>
                <span>{activePhoto.reactionCounts?.[reaction.key] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {visiblePhotos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {visiblePhotos.map((photo, index) => (
          <button
            key={photo.id || photo.photoUrl}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition sm:h-20 sm:w-24 ${
              activeIndex === index ? "border-deep-purple" : "border-white/70 opacity-70 hover:opacity-100"
            }`}
            aria-label={`Show photo ${index + 1}`}
          >
            <img
              src={photo.photoUrl}
              alt={photo.alt || "Tribute memory"}
              className="h-full w-full object-cover"
            />
          </button>
          ))}
        </div>
      )}
    </section>
  );
}
