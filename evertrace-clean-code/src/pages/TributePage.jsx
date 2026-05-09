import { Copy, Leaf, Mail, MessageCircle, Music, QrCode, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { defaultBanner, getBannerById } from "../data/bannerPresets";
import LifeTimeline from "../shared/LifeTimeline";
import PhotoGallery from "../shared/PhotoGallery";
import {
  addMemory,
  addTimelineEvent,
  addMemoryReaction,
  addPhotoReaction,
  addTributeReaction,
  getTribute,
  subscribeToMemories,
  subscribeToPhotos,
  subscribeToTimelineEvents,
  subscribeToTribute,
} from "../services/tributeService";

const reactions = [
  { key: "candle", label: "Candle", icon: "\u{1F56F}\uFE0F" },
  { key: "love", label: "Love", icon: "\u{1F54A}\uFE0F" },
  { key: "flowers", label: "Flowers", icon: "\u{1F338}" },
];

const emptyMemoryForm = { contributorName: "", text: "" };
const emptyTimelineForm = { year: "", title: "", description: "" };
const shareInviteText = "Invite family and friends to add their memories.";

export default function TributePage() {
  const { tributeId } = useParams();
  const [tribute, setTribute] = useState(null);
  const [memories, setMemories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [memoryForm, setMemoryForm] = useState(emptyMemoryForm);
  const [timelineForm, setTimelineForm] = useState(emptyTimelineForm);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTimelineFormOpen, setIsTimelineFormOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingMemory, setSavingMemory] = useState(false);
  const [savingTimelineEvent, setSavingTimelineEvent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTribute() {
      setLoading(true);
      setError("");

      try {
        const tributeData = await getTribute(tributeId);
        if (isMounted) setTribute(tributeData);
      } catch (err) {
        if (isMounted) setError("We could not load this tribute right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTribute();

    return () => {
      isMounted = false;
    };
  }, [tributeId]);

  useEffect(() => {
    const unsubscribeTribute = subscribeToTribute(
      tributeId,
      (nextTribute) => {
        setTribute(nextTribute);
        setLoading(false);
      },
      () => setError("We could not keep this tribute updated in real time."),
    );

    const unsubscribeMemories = subscribeToMemories(
      tributeId,
      setMemories,
      () => setError("We could not keep memories updated in real time."),
    );

    const unsubscribePhotos = subscribeToPhotos(
      tributeId,
      setPhotos,
      () => setError("We could not keep photos updated in real time."),
    );

    const unsubscribeTimelineEvents = subscribeToTimelineEvents(
      tributeId,
      setTimelineEvents,
      () => setError("We could not keep the timeline updated in real time."),
    );

    return () => {
      unsubscribeTribute();
      unsubscribeMemories();
      unsubscribePhotos();
      unsubscribeTimelineEvents();
    };
  }, [tributeId]);

  function openMemoryModal() {
    setError("");
    setIsMemoryModalOpen(true);
  }

  function closeMemoryModal() {
    if (!savingMemory) setIsMemoryModalOpen(false);
  }

  function getTributeUrl() {
    return typeof window === "undefined" ? "" : window.location.href;
  }

  function showCopiedState() {
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2400);
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(getTributeUrl());
      showCopiedState();
    } catch (err) {
      setError("We could not copy the link. Please copy it from your browser address bar.");
    }
  }

  function openShareModal() {
    setError("");
    setIsShareModalOpen(true);
  }

  async function shareNativeOrCopy() {
    const url = getTributeUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tribute.name} on EverTrace`,
          text: shareInviteText,
          url,
        });
        return;
      } catch (err) {
        if (err?.name === "AbortError") return;
      }
    }

    await copyShareLink();
  }

  function shareToFacebook() {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getTributeUrl())}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  async function shareToInstagram() {
    await copyShareLink();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  function shareByEmail() {
    const subject = encodeURIComponent(`${tribute.name} on EverTrace`);
    const body = encodeURIComponent(`${shareInviteText}\n\n${getTributeUrl()}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  async function handleTributeReaction(reaction) {
    if (!tribute) return;

    setTribute((current) => ({
      ...current,
      reactionCounts: {
        candle: current?.reactionCounts?.candle || 0,
        love: current?.reactionCounts?.love || 0,
        flowers: current?.reactionCounts?.flowers || 0,
        [reaction]: (current?.reactionCounts?.[reaction] || 0) + 1,
      },
    }));

    try {
      await addTributeReaction(tribute.id, reaction);
    } catch (err) {
      setError("We could not add that reaction yet. Please try again.");
    }
  }

  async function handleMemoryReaction(memoryId, reaction) {
    setMemories((currentMemories) =>
      currentMemories.map((memory) =>
        memory.id === memoryId
          ? {
              ...memory,
              reactionCounts: {
                candle: memory.reactionCounts?.candle || 0,
                love: memory.reactionCounts?.love || 0,
                flowers: memory.reactionCounts?.flowers || 0,
                [reaction]: (memory.reactionCounts?.[reaction] || 0) + 1,
              },
            }
          : memory,
      ),
    );

    try {
      await addMemoryReaction(tribute.id, memoryId, reaction);
    } catch (err) {
      setError("We could not add that reaction yet. Please try again.");
    }
  }

  async function handlePhotoReaction(photoId, reaction) {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              reactionCounts: {
                candle: photo.reactionCounts?.candle || 0,
                love: photo.reactionCounts?.love || 0,
                flowers: photo.reactionCounts?.flowers || 0,
                [reaction]: (photo.reactionCounts?.[reaction] || 0) + 1,
              },
            }
          : photo,
      ),
    );

    try {
      await addPhotoReaction(tribute.id, photoId, reaction);
    } catch (err) {
      setError("We could not add that reaction yet. Please try again.");
    }
  }

  async function handleAddMemory(event) {
    event.preventDefault();
    setSavingMemory(true);
    setError("");

    try {
      await addMemory(tribute.id, memoryForm);
      setMemoryForm(emptyMemoryForm);
      setIsMemoryModalOpen(false);
    } catch (err) {
      setError("We could not add that memory yet. Please try again.");
    } finally {
      setSavingMemory(false);
    }
  }

  async function handleAddTimelineEvent(event) {
    event.preventDefault();
    setSavingTimelineEvent(true);
    setError("");

    try {
      await addTimelineEvent(tribute.id, timelineForm);
      setTimelineForm(emptyTimelineForm);
      setIsTimelineFormOpen(false);
    } catch (err) {
      setError("We could not add that timeline moment yet. Please try again.");
    } finally {
      setSavingTimelineEvent(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-[2rem] border border-ink/10 bg-white p-8 text-center shadow-soft">
          <p className="eyebrow">Loading Tribute</p>
          <p className="mt-4 text-ink/65">Gathering the page.</p>
        </div>
      </main>
    );
  }

  if (!tribute) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <div className="rounded-[2rem] border border-ink/10 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-semibold">Tribute not found</h1>
          <p className="mt-4 leading-7 text-ink/65">{error || "This tribute may have been moved or removed."}</p>
          <Link to="/start" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-deep-purple px-5 font-semibold text-white">
            Create a Tribute
          </Link>
        </div>
      </main>
    );
  }

  const years = [tribute.birthYear, tribute.passingYear].filter(Boolean).join(" - ");
  const storyText = tribute.story || tribute.message;
  const hasContent = Boolean(tribute.message || tribute.story || memories.length > 0);
  const banner = tribute.bannerUrl ? { imageUrl: tribute.bannerUrl, name: "Tribute banner" } : getBannerById(tribute.bannerId || defaultBanner.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-soft">
        <div className="relative min-h-[420px] overflow-hidden bg-deep-purple p-5 text-white sm:p-7">
          <img src={banner.imageUrl} alt={banner.name} className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(45,27,78,0.75),rgba(45,27,78,0.55))]" />
          <div
            className={`relative grid min-h-[376px] gap-6 pt-10 ${
              tribute.primaryPhotoUrl ? "sm:grid-cols-[15rem_1fr] sm:items-end lg:grid-cols-[17rem_1fr]" : ""
            }`}
          >
            {tribute.primaryPhotoUrl && (
              <div className="mx-auto w-44 overflow-hidden rounded-[1.5rem] border border-white/25 bg-white/14 p-1.5 shadow-soft backdrop-blur sm:mx-0 sm:w-full">
                <img src={tribute.primaryPhotoUrl} alt={tribute.name} className="aspect-[4/5] w-full rounded-[1.1rem] object-cover object-[center_30%]" />
              </div>
            )}
            <div className="flex flex-col justify-end">
              <p className="eyebrow-light">In Loving Memory</p>
              <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">{tribute.name}</h1>
              {years && <p className="mt-3 text-lg text-white/80">{years}</p>}
              <p className="mt-6 line-clamp-4 max-w-2xl text-lg leading-8 text-white/85">{tribute.message}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-ink/10 bg-cream p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="grid grid-cols-3 gap-2">
              {reactions.map((reaction) => (
                <button
                  key={reaction.key}
                  type="button"
                  onClick={() => handleTributeReaction(reaction.key)}
                  className="rounded-2xl border border-ink/10 bg-white px-3 py-3 text-center transition hover:border-rich-purple/30 hover:bg-stone"
                >
                  <span className="block text-2xl">{reaction.icon}</span>
                  <span className="mt-1 block text-xs font-semibold text-ink/60">{reaction.label}</span>
                  <span className="mt-1 block text-sm font-semibold text-ink">{tribute.reactionCounts?.[reaction.key] || 0}</span>
                </button>
              ))}
            </div>

            <div className="grid gap-2 sm:min-w-56">
              <button
                type="button"
                onClick={openShareModal}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple"
              >
                <Share2 size={18} /> Share with Family
              </button>
              <button
                type="button"
                onClick={openMemoryModal}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone"
              >
                <MessageCircle size={18} /> Add Memory
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-sm leading-6 text-ink/60 sm:text-right">
            {shareCopied ? "Link copied." : shareInviteText}
          </p>
        </div>

        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_18rem]">
          <section>
            <p className="eyebrow">Their Story</p>
            <h2 className="mt-3 text-3xl font-semibold">A life remembered together</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-ink/70">{storyText}</p>

            {tribute.favoriteSong && (
              <section className="mt-8 rounded-3xl border border-rich-purple/10 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-light-purple text-deep-purple">
                    <Music size={19} />
                  </span>
                  <div>
                    <p className="eyebrow">A Song They Loved</p>
                    {tribute.favoriteSong.title && (
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{tribute.favoriteSong.title}</h3>
                    )}
                    {tribute.favoriteSong.artist && <p className="mt-1 text-sm text-ink/60">by {tribute.favoriteSong.artist}</p>}
                    <p className="mt-3 text-sm leading-6 text-ink/65">
                      Press play to remember {tribute.name || "them"} with a song chosen in their honor.
                    </p>
                      {tribute.favoriteSong.url && (
                        <button
                          type="button"
                          onClick={() =>
                            window.open(tribute.favoriteSong.url, "_blank", "noopener,noreferrer")
                          }
                          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-deep-purple px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-rich-purple"
                        >
                          Play this song
                        </button>
                      )}
                  </div>
                </div>
              </section>
            )}

            <LifeTimeline
              name={tribute.name}
              birthYear={tribute.birthYear}
              passingYear={tribute.passingYear}
              events={timelineEvents}
              form={timelineForm}
              onFormChange={setTimelineForm}
              onSubmit={handleAddTimelineEvent}
              onCancel={() => setIsTimelineFormOpen(false)}
              isAdding={isTimelineFormOpen}
              onStartAdding={() => setIsTimelineFormOpen(true)}
              saving={savingTimelineEvent}
            />

            <PhotoGallery photos={photos} onReact={handlePhotoReaction} />

            <div className="mt-8 rounded-3xl bg-stone p-5">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-deep-purple" size={22} />
                <h3 className="text-xl font-semibold">Memories</h3>
              </div>

              {memories.length === 0 ? (
                <p className="mt-3 leading-7 text-ink/65">No memories have been added yet. Be the first to leave one.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {memories.map((memory) => (
                    <article key={memory.id} className="rounded-2xl bg-white p-4">
                      <p className="font-semibold">{memory.contributorName}</p>
                      <p className="mt-2 leading-7 text-ink/70">{memory.text}</p>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {reactions.map((reaction) => (
                          <button
                            key={reaction.key}
                            type="button"
                            onClick={() => handleMemoryReaction(memory.id, reaction.key)}
                            className="rounded-full border border-ink/10 bg-cream px-3 py-2 text-sm font-semibold text-ink/70 transition hover:border-rich-purple/30 hover:bg-stone"
                            aria-label={`${reaction.label} reaction`}
                          >
                            <span>{reaction.icon}</span> <span>{memory.reactionCounts?.[reaction.key] || 0}</span>
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={openMemoryModal}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-cream sm:w-auto"
              >
                Add a Memory
              </button>
              <button
                type="button"
                onClick={openShareModal}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple sm:ml-3 sm:mt-5 sm:w-auto"
              >
                <Share2 size={17} /> Share with Family
              </button>
              {shareCopied && <p className="mt-3 text-sm font-medium text-deep-purple">Link copied. {shareInviteText}</p>}
            </div>
          </section>

          <aside className="space-y-3">
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold transition hover:bg-stone"
            >
              <Share2 size={18} /> Copy Link
            </button>
            <button
              type="button"
              onClick={openMemoryModal}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-rich-purple/35 bg-white px-5 font-semibold transition hover:bg-stone"
            >
              <Leaf size={18} /> Add Memory
            </button>
            {hasContent && (
              <div className="rounded-3xl border border-ink/10 p-5">
                <QrCode className="text-deep-purple" size={22} />
                <p className="mt-3 font-semibold">Preserve this tribute in the real world</p>
                <p className="mt-2 text-sm leading-6 text-ink/60">
                  A weatherproof stainless steel QR plaque can connect this story to a gravesite, urn space, memorial garden, or family keepsake.
                </p>
                <Link
                  to={`/plaques/${tribute.id}`}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-deep-purple px-4 text-sm font-semibold text-white transition hover:bg-rich-purple"
                >
                  Learn About Memorial Plaques
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      <div className="mt-6 text-center">
        <Link to="/start" className="text-sm font-medium text-deep-purple">
          Create another tribute
        </Link>
      </div>

      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-deep-purple/45 px-3 py-3 sm:place-items-center sm:p-6">
          <form onSubmit={handleAddMemory} className="w-full max-w-lg rounded-[2rem] bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Add Memory</p>
                <h3 className="mt-2 text-2xl font-semibold">Share something you remember.</h3>
                <p className="mt-2 text-sm leading-6 text-ink/60">A sentence is enough. This page grows one memory at a time.</p>
              </div>
              <button
                type="button"
                onClick={closeMemoryModal}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/60 transition hover:bg-cream"
                aria-label="Close memory form"
              >
                <X size={18} />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-ink/70">Your name</span>
              <input
                value={memoryForm.contributorName}
                onChange={(event) => setMemoryForm((current) => ({ ...current, contributorName: event.target.value }))}
                required
                className="mt-2 min-h-12 w-full rounded-full border border-ink/10 bg-cream px-4 outline-none focus:border-rich-purple focus:bg-white focus:ring-4 focus:ring-rich-purple/10"
                placeholder="Aunt Lena"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-ink/70">Memory</span>
              <textarea
                value={memoryForm.text}
                onChange={(event) => setMemoryForm((current) => ({ ...current, text: event.target.value }))}
                required
                rows={5}
                className="mt-2 w-full resize-none rounded-3xl border border-ink/10 bg-cream px-4 py-4 leading-7 outline-none focus:border-rich-purple focus:bg-white focus:ring-4 focus:ring-rich-purple/10"
                placeholder={`What do you remember about ${tribute.name}?`}
              />
            </label>

            {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={savingMemory}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple disabled:bg-deep-purple/45"
            >
              {savingMemory ? "Adding..." : "Add Memory"}
            </button>
          </form>
        </div>
      )}

      {isShareModalOpen && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-deep-purple/45 px-3 py-3 sm:place-items-center sm:p-6">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Share Tribute</p>
                <h2 className="mt-2 text-2xl font-semibold">Invite family in</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">{shareInviteText}</p>
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
              <ShareOption icon={<span className="font-bold">f</span>} label="Facebook" onClick={shareToFacebook} />
              <ShareOption icon={<span className="text-lg">◎</span>} label="Instagram" onClick={shareToInstagram} />
              <ShareOption icon={<Mail size={18} />} label="Email" onClick={shareByEmail} />
              <ShareOption icon={<Copy size={18} />} label="Copy Link" onClick={copyShareLink} />
              {navigator.share && <ShareOption icon={<Share2 size={18} />} label="More share options" onClick={shareNativeOrCopy} />}
            </div>

            {shareCopied && <p className="mt-4 rounded-2xl bg-light-purple px-4 py-3 text-sm font-semibold text-deep-purple">Link copied.</p>}
          </div>
        </div>
      )}
    </main>
  );
}

function ShareOption({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center gap-3 rounded-2xl border border-ink/10 bg-cream px-4 text-left font-semibold text-ink transition hover:border-rich-purple/30 hover:bg-stone"
    >
      <span className="grid size-9 place-items-center rounded-full bg-white text-deep-purple">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
