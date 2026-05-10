import { Copy, Mail, MessageCircle, Music, Share2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getBannerById } from "../data/bannerPresets";
import LifeTimeline from "../shared/LifeTimeline";
import PhotoGallery from "../shared/PhotoGallery";

const reactions = [
  { key: "candle", icon: "\u{1F56F}\uFE0F", label: "Light a candle" },
  { key: "love", icon: "\u{1F54A}\uFE0F", label: "Send your love" },
  { key: "flowers", icon: "\u{1F338}", label: "Give flowers" },
];

const memories = [
  {
    id: "elena",
    name: "Elena",
    text: "Jean remembered every birthday, every favorite dessert, and every small worry before anyone had to say it out loud.",
    reactionCounts: { candle: 2, love: 4, flowers: 3 },
  },
  {
    id: "marcus",
    name: "Marcus",
    text: "She taught me that kindness could be practical: a ride to the store, a warm meal, a phone call at exactly the right time.",
    reactionCounts: { candle: 3, love: 5, flowers: 2 },
  },
  {
    id: "nora",
    name: "Nora",
    text: "I still hear her laugh when the kitchen got too crowded. She made ordinary Sundays feel like a family holiday.",
    reactionCounts: { candle: 4, love: 6, flowers: 3 },
  },
];

const favorites = ["Garden roses", "Sunday dinners", "Old hymns", "Handwritten notes"];
const initialTimelineForm = { year: "", title: "", description: "" };
const timelineMoments = [
  {
    id: "family-home",
    year: "1978",
    yearNumber: 1978,
    title: "Built a home full of family",
    description: "Jean made space for Sunday dinners, long talks, and anyone who needed a soft place to land.",
  },
  {
    id: "roses",
    year: "1992",
    yearNumber: 1992,
    title: "Filled the yard with roses",
    description: "Her garden became one of the places people remember most: quiet, cared for, and full of color.",
  },
];

const samplePhotos = [
  {
    id: "mom-dad-halloween",
    photoUrl: "/mom-dad-halloween.jpg",
    alt: "Jean with family at Halloween",
    caption: "A playful Halloween night, full of laughter and closeness.",
    reactionCounts: { candle: 5, love: 12, flowers: 6 },
  },
  {
    id: "mom-larron",
    photoUrl: "/mom-larron.jpg",
    alt: "Jean with Larron",
    caption: "Jean and Larron, dressed up and smiling through the noise of a family gathering.",
    reactionCounts: { candle: 3, love: 10, flowers: 4 },
  },
  {
    id: "mom-combing-hair",
    photoUrl: "/mom-combing-hair.jpg",
    alt: "Jean combing hair",
    caption: "One of those ordinary moments that says everything about care.",
    reactionCounts: { candle: 8, love: 14, flowers: 5 },
  },
  {
    id: "mom-flowers",
    photoUrl: "/mom-flowers.jpg",
    alt: "Jean holding flowers",
    caption: "Jean with flowers, looking soft, proud, and beautiful.",
    reactionCounts: { candle: 6, love: 16, flowers: 9 },
  },
];

export default function ExampleTribute() {
  const banner = getBannerById("peace-garden");
  const [tributeReactions, setTributeReactions] = useState({ candle: 42, love: 86, flowers: 31 });
  const [sampleMemories, setSampleMemories] = useState(memories);
  const [galleryPhotos, setGalleryPhotos] = useState(samplePhotos);
  const [timelineEvents, setTimelineEvents] = useState(timelineMoments);
  const [timelineForm, setTimelineForm] = useState(initialTimelineForm);
  const [isTimelineFormOpen, setIsTimelineFormOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  function addTributeReaction(reactionKey) {
    setTributeReactions((current) => ({
      ...current,
      [reactionKey]: current[reactionKey] + 1,
    }));
  }

  function addMemoryReaction(memoryId, reactionKey) {
    setSampleMemories((currentMemories) =>
      currentMemories.map((memory) =>
        memory.id === memoryId
          ? {
              ...memory,
              reactionCounts: {
                ...memory.reactionCounts,
                [reactionKey]: memory.reactionCounts[reactionKey] + 1,
              },
            }
          : memory,
      ),
    );
  }

  function addPhotoReaction(photoId, reactionKey) {
    setGalleryPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              reactionCounts: {
                candle: photo.reactionCounts?.candle || 0,
                love: photo.reactionCounts?.love || 0,
                flowers: photo.reactionCounts?.flowers || 0,
                [reactionKey]: (photo.reactionCounts?.[reactionKey] || 0) + 1,
              },
            }
          : photo,
      ),
    );
  }

  function addTimelineEvent(event) {
    event.preventDefault();
    setTimelineEvents((currentEvents) => [
      ...currentEvents,
      {
        id: `${timelineForm.year}-${timelineForm.title}`,
        year: timelineForm.year,
        yearNumber: Number(timelineForm.year) || 0,
        title: timelineForm.title,
        description: timelineForm.description,
      },
    ]);
    setTimelineForm(initialTimelineForm);
    setIsTimelineFormOpen(false);
  }

  return (
    <main className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-soft">
        <div className="relative min-h-[360px] overflow-hidden bg-deep-purple p-4 text-white sm:min-h-[420px] sm:p-7">
          <img src={banner.imageUrl} alt={banner.name} className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(45,27,78,0.75),rgba(45,27,78,0.55))]" />
          <p className="eyebrow-light absolute right-4 top-4 z-10 sm:right-8 sm:top-8">Example Tribute</p>
          <div className="relative grid min-h-[328px] gap-5 pt-12 sm:min-h-[376px] sm:grid-cols-[15rem_1fr] sm:items-end sm:gap-6 sm:pt-10 lg:grid-cols-[17rem_1fr]">
            <div className="mx-auto w-36 overflow-hidden rounded-[1.5rem] border border-white/25 bg-white/14 p-1.5 shadow-soft backdrop-blur sm:mx-0 sm:w-full">
              <img src="/example-primary.png" alt="Jean E. White" className="aspect-[4/5] w-full rounded-[1.1rem] object-cover object-[center_30%]" />
            </div>
            <div className="flex flex-col justify-end">
              <p className="eyebrow-light">In Loving Memory</p>
              <h1 className="mt-4 text-[2.35rem] font-semibold tracking-tight sm:text-6xl">Jean E. White</h1>
              <p className="mt-3 text-lg text-white/80">1950 - 2005</p>
              <p className="mt-5 line-clamp-4 max-w-2xl text-base leading-7 text-white/85 sm:mt-6 sm:text-lg sm:leading-8">
                To know Jean was to feel remembered. She had a quiet confidence and a thoughtful way of speaking, and somehow she always made you believe in yourself. She was my mom. ~Tiffani Latrell
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-ink/10 bg-cream p-4 sm:p-5">
          <div className="mx-auto max-w-3xl">
            <div className="grid gap-2 sm:grid-cols-3">
              {reactions.map((reaction) => (
                <button
                  key={reaction.key}
                  type="button"
                  onClick={() => addTributeReaction(reaction.key)}
                  className="group flex min-h-14 items-center gap-3 rounded-full border border-rich-purple/15 bg-white px-3.5 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-rich-purple/35 hover:bg-white hover:shadow-md"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-light-purple text-lg transition group-hover:bg-rich-purple/15">
                    {reaction.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold leading-5 text-ink">{reaction.label}</span>
                    <span className="block text-xs font-medium leading-5 text-ink/52">{tributeReactions[reaction.key]} shared</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-deep-purple px-6 py-3 text-white sm:w-auto"
              >
                <Share2 size={18} />
                <span className="text-sm font-semibold leading-5">Invite Shared Memories</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-6 p-4 sm:p-8 lg:grid-cols-[1fr_18rem]">
          <section>
            <p className="eyebrow">Their Story</p>
            <h2 className="mt-3 text-3xl font-semibold">A life remembered together</h2>
            <p className="mt-4 leading-8 text-ink/70">
              She had a way of making everyone feel expected, as if the table had been waiting for them all along. This tribute gathers the stories, phrases, and everyday details that still carry her presence.
            </p>

            <section className="mt-8 rounded-3xl border border-rich-purple/10 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-light-purple text-deep-purple">
                  <Music size={19} />
                </span>
                <div>
                  <p className="eyebrow">A Song They Loved</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Lovely Day</h3>
                  <p className="mt-1 text-sm text-ink/60">by Bill Withers</p>
                  <p className="mt-3 text-sm leading-6 text-ink/65">
                    Press play to remember Jean with a song chosen in her honor.
                  </p>
                  <a
                    href="https://www.youtube.com/results?search_query=Bill+Withers+Lovely+Day"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-deep-purple px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rich-purple"
                  >
                    Play this song
                  </a>
                </div>
              </div>
            </section>

            <LifeTimeline
              name="Jean E. White"
              birthYear="1950"
              passingYear="2005"
              events={timelineEvents}
              form={timelineForm}
              onFormChange={setTimelineForm}
              onSubmit={addTimelineEvent}
              onCancel={() => setIsTimelineFormOpen(false)}
              isAdding={isTimelineFormOpen}
              onStartAdding={() => setIsTimelineFormOpen(true)}
            />

            <PhotoGallery photos={galleryPhotos} onReact={addPhotoReaction} />

            <div className="mt-8 rounded-3xl bg-stone p-5">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-deep-purple" size={22} />
                <h3 className="text-xl font-semibold">Memories</h3>
              </div>
              <div className="mt-5 space-y-4">
                {sampleMemories.map((memory) => (
                  <article key={memory.id} className="rounded-2xl bg-white p-4">
                    <p className="font-semibold">{memory.name}</p>
                    <p className="mt-2 leading-7 text-ink/70">{memory.text}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {reactions.map((reaction) => (
                        <button
                          key={reaction.key}
                          type="button"
                          onClick={() => addMemoryReaction(memory.id, reaction.key)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-rich-purple/10 bg-cream px-3 text-sm font-semibold text-ink/70 transition hover:border-rich-purple/30 hover:bg-stone"
                          aria-label={`${reaction.label} reaction`}
                        >
                          <span>{reaction.icon}</span>
                          <span>{memory.reactionCounts[reaction.key]}</span>
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-ink/10 p-5">
              <Sparkles className="text-deep-purple" size={22} />
              <p className="mt-3 font-semibold">A Few Things They Loved</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {favorites.map((favorite) => (
                  <span key={favorite} className="rounded-full bg-stone px-3 py-2 text-sm font-medium text-ink/70">
                    {favorite}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-ink/10 p-5">
              <img
                src="/qrCodeInBox.jpg"
                alt="QR memorial plaque displayed in a keepsake box"
                className="h-20 w-20 rounded-2xl object-cover shadow-sm"
              />
              <p className="mt-3 font-semibold">Preserve this tribute in the real world</p>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                A weatherproof stainless steel QR plaque can connect this story to a gravesite, urn space, memorial garden, or family keepsake.
              </p>
              <Link
                to="/start"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-deep-purple px-4 text-sm font-semibold text-white transition hover:bg-rich-purple"
              >
                Start a Tribute Like This
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {isShareModalOpen && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-deep-purple/45 px-3 py-3 sm:place-items-center sm:p-6">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Share Tribute</p>
                <h2 className="mt-2 text-2xl font-semibold">Invite family in</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">Example only. Real tribute pages make these share options active.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/60 transition hover:bg-cream"
                aria-label="Close share options"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <PreviewShareOption icon={<span className="font-bold">f</span>} label="Facebook" />
              <PreviewShareOption icon={<span className="text-lg">◎</span>} label="Instagram" />
              <PreviewShareOption icon={<Mail size={18} />} label="Email" />
              <PreviewShareOption icon={<Copy size={18} />} label="Copy Link" />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function PreviewShareOption({ icon, label }) {
  return (
    <button
      type="button"
      disabled
      className="flex min-h-12 items-center gap-3 rounded-2xl border border-ink/10 bg-cream px-4 text-left font-semibold text-ink/55"
    >
      <span className="grid size-9 place-items-center rounded-full bg-white text-deep-purple">{icon}</span>
      <span>{label}</span>
      <span className="ml-auto text-xs font-semibold uppercase tracking-[0.14em] text-ink/35">Preview</span>
    </button>
  );
}
