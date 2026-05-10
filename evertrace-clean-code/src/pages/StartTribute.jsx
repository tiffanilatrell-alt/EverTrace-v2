import { ArrowLeft, ArrowRight, CalendarDays, Camera, Check, ChevronLeft, ChevronRight, Plus, Sparkles, Star, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { bannerPresets, defaultBanner, getBannerById } from "../data/bannerPresets";
import { addTimelineEvent, createTribute, uploadTributePhotos } from "../services/tributeService";

const initialForm = {
  name: "",
  birthDate: "",
  passingDate: "",
  birthYear: "",
  passingYear: "",
  message: "",
  story: "",
  creatorName: "",
  email: "",
  songTitle: "",
  songArtist: "",
  songUrl: "",
  bannerId: defaultBanner.id,
  visibility: "private",
};

const AI_USE_LIMIT = 5;
const PHOTO_LIMIT = 8;
const AI_USE_STORAGE_KEY = "evertrace-tribute-builder-ai-uses";
const AI_SESSION_STORAGE_KEY = "evertrace-tribute-builder-ai-session";
const initialTimelineForm = {
  year: "",
  title: "",
  description: "",
};

function getOrCreateAiSessionId() {
  if (typeof window === "undefined") return "";

  const existingSessionId = window.localStorage.getItem(AI_SESSION_STORAGE_KEY);
  if (existingSessionId) return existingSessionId;

  const nextSessionId = `tribute_${crypto.randomUUID()}`;
  window.localStorage.setItem(AI_SESSION_STORAGE_KEY, nextSessionId);

  return nextSessionId;
}

function limitHeroMessage(value) {
  return value.replace(/\r/g, "").split("\n").slice(0, 4).join("\n").slice(0, 280);
}

function formatDateInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function getYearFromDate(value) {
  const match = value.match(/^\d{2}\/\d{2}\/(\d{4})$/);
  return match?.[1] || "";
}

function detectSongPlatform(url = "") {
  const lower = url.toLowerCase();

  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("music.apple.com")) return "apple";

  return "other";
}

function normalizeSongUrl(url = "") {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) return "";
  if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;

  return `https://${trimmedUrl}`;
}

function buildFavoriteSong(form) {
  const title = form.songTitle.trim();
  const artist = form.songArtist.trim();
  const url = normalizeSongUrl(form.songUrl);

  if (!title && !artist && !url) return null;

  return {
    title,
    artist,
    url,
    platform: detectSongPlatform(url),
  };
}

function parseDateInput(value) {
  if (!value.trim()) return null;

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function buildTimelinePreviewItems({ name, birthYear, passingYear, events }) {
  const generatedItems = [
    birthYear && {
      id: "birth",
      year: birthYear,
      title: `${name || "They"} was born`,
      description: "The beginning of a life that would leave a lasting trace.",
      generated: true,
      yearNumber: Number(birthYear) || 0,
    },
    passingYear && {
      id: "passing",
      year: passingYear,
      title: "A life remembered",
      description: "Their story continues through the people, memories, and love they left behind.",
      generated: true,
      yearNumber: Number(passingYear) || 9999,
    },
  ].filter(Boolean);

  return [...generatedItems, ...events]
    .map((item) => ({
      ...item,
      yearNumber: item.yearNumber || Number(String(item.year).match(/\d{4}/)?.[0]) || Number(item.year) || 0,
    }))
    .sort((a, b) => a.yearNumber - b.yearNumber);
}

function trimFormValues(form) {
  return {
    ...form,
    name: form.name.trim(),
    birthDate: form.birthDate.trim(),
    passingDate: form.passingDate.trim(),
    birthYear: form.birthYear.trim(),
    passingYear: form.passingYear.trim(),
    message: form.message.trim(),
    story: form.story.trim(),
    creatorName: form.creatorName.trim(),
    email: form.email.trim(),
    songTitle: form.songTitle.trim(),
    songArtist: form.songArtist.trim(),
    songUrl: form.songUrl.trim(),
    visibility: form.visibility,
  };
}

const stepCopy = {
  1: {
    title: "Start with photos",
    body: "Add a few photos of your loved one, then choose one as their primary image.",
  },
  2: {
    title: "Add one loving note",
    body: "Add the essentials. Sharing, family memories, and plaques can come later.",
  },
  3: {
    title: "Review before publishing",
    body: "Look everything over, choose privacy, and publish only when it feels ready.",
  },
};

export default function StartTribute() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [primaryPhotoId, setPrimaryPhotoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState("Creating...");
  const [error, setError] = useState("");
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineForm, setTimelineForm] = useState(initialTimelineForm);
  const [isTimelineFormOpen, setIsTimelineFormOpen] = useState(false);
  const [introAiLoading, setIntroAiLoading] = useState(false);
  const [storyAiLoading, setStoryAiLoading] = useState(false);
  const [introAiMessage, setIntroAiMessage] = useState("");
  const [storyAiMessage, setStoryAiMessage] = useState("");
  const [aiUseCount, setAiUseCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(window.sessionStorage.getItem(AI_USE_STORAGE_KEY) || 0);
  });
  const [aiSessionId] = useState(getOrCreateAiSessionId);
  const [aiHistory, setAiHistory] = useState({
    message: [],
    story: [],
  });
  const photosRef = useRef([]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [step]);

  function updateField(field, value) {
    if (field === "message") {
      setIntroAiMessage("");
    }

    if (field === "story") {
      setStoryAiMessage("");
    }

    setForm((current) => ({
      ...current,
      ...(field === "birthDate"
        ? {
            birthDate: formatDateInput(value),
            birthYear: getYearFromDate(formatDateInput(value)),
          }
        : {}),
      ...(field === "passingDate"
        ? {
            passingDate: formatDateInput(value),
            passingYear: getYearFromDate(formatDateInput(value)),
          }
        : {}),
      ...(!["birthDate", "passingDate"].includes(field)
        ? {
            [field]: field === "message" ? limitHeroMessage(value) : value,
          }
        : {}),
    }));
  }

  async function handleAiHelp(field, action = "shape") {
    const isIntro = field === "message";
    const notes = (isIntro ? form.message : form.story).trim();
    const setLoading = isIntro ? setIntroAiLoading : setStoryAiLoading;
    const setMessage = isIntro ? setIntroAiMessage : setStoryAiMessage;
    const aiUsesRemaining = Math.max(AI_USE_LIMIT - aiUseCount, 0);
    const emptyMessage = isIntro
      ? "Add a few words or memories first, then we can help shape them."
      : "Add a few memories, traits, or moments first, then we can help shape them.";

    if (!notes) {
      setMessage(emptyMessage);
      return;
    }

    if (aiUsesRemaining <= 0) {
      setMessage("You have used the AI writing helper 5 times for this tribute. You can keep editing the text by hand.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/shape-tribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          birthYear: form.birthYear,
          passingYear: form.passingYear,
          notes,
          mode: isIntro ? "intro" : "story",
          action,
          sessionId: aiSessionId,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : {};

      if (!response.ok) {
        if (typeof payload.usesRemaining === "number") {
          const nextUseCount = AI_USE_LIMIT - payload.usesRemaining;
          setAiUseCount(nextUseCount);
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(AI_USE_STORAGE_KEY, String(nextUseCount));
          }
        }
        throw new Error(payload.error || "We could not shape this yet. Please try again in a moment.");
      }

      const suggestion = isIntro ? limitHeroMessage(payload.suggestion || "") : payload.suggestion || "";

      if (!suggestion) {
        throw new Error("We could not create a suggestion from those words yet.");
      }

      setAiHistory((current) => ({
        ...current,
        [field]: [...current[field], isIntro ? form.message : form.story].slice(-5),
      }));
      const nextUseCount =
        typeof payload.usesRemaining === "number" ? AI_USE_LIMIT - payload.usesRemaining : aiUseCount + 1;
      setAiUseCount(nextUseCount);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(AI_USE_STORAGE_KEY, String(nextUseCount));
      }
      updateField(field, suggestion);
      setMessage(isIntro ? "A shaped intro has been placed above. You can edit it before publishing." : "A shaped story has been placed above. You can edit it before publishing.");
    } catch (err) {
      setMessage(err.message || "We could not shape this yet. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function undoAiSuggestion(field) {
    const isIntro = field === "message";
    const previousValues = aiHistory[field];
    const previousValue = previousValues[previousValues.length - 1];

    if (previousValue === undefined) return;

    setAiHistory((current) => ({
      ...current,
      [field]: current[field].slice(0, -1),
    }));
    updateField(field, previousValue);

    if (isIntro) {
      setIntroAiMessage("Restored the previous banner intro.");
    } else {
      setStoryAiMessage("Restored the previous tribute story.");
    }
  }

  function handlePhotoSelection(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selectedFiles.length) return;

    setError("");

    setPhotos((currentPhotos) => {
      const limitedCurrentPhotos = currentPhotos.slice(0, PHOTO_LIMIT);
      const availableSlots = Math.max(PHOTO_LIMIT - limitedCurrentPhotos.length, 0);
      const acceptedFiles = selectedFiles.slice(0, availableSlots);
      const nextPhotos = [
        ...limitedCurrentPhotos,
        ...acceptedFiles.map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          name: file.name,
          file,
          caption: "",
          previewUrl: URL.createObjectURL(file),
        })),
      ];

      if (currentPhotos.length > PHOTO_LIMIT || selectedFiles.length > availableSlots) {
        setError(`You can add up to ${PHOTO_LIMIT} photos for now.`);
      }

      if (!primaryPhotoId && nextPhotos[0]) {
        setPrimaryPhotoId(nextPhotos[0].id);
      }

      return nextPhotos.slice(0, PHOTO_LIMIT);
    });
  }

  function removePhoto(photoId) {
    setPhotos((currentPhotos) => {
      const photoToRemove = currentPhotos.find((photo) => photo.id === photoId);
      if (photoToRemove) URL.revokeObjectURL(photoToRemove.previewUrl);

      const nextPhotos = currentPhotos.filter((photo) => photo.id !== photoId);

      if (primaryPhotoId === photoId) {
        setPrimaryPhotoId(nextPhotos[0]?.id || "");
      }

      return nextPhotos;
    });
  }

  function updatePhotoCaption(photoId, caption) {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              caption: caption.slice(0, 120),
            }
          : photo,
      ),
    );
  }

  function addDraftTimelineEvent() {
    const year = timelineForm.year.trim();
    const title = timelineForm.title.trim();
    const description = timelineForm.description.trim();

    if (!year || !title) return;

    setTimelineEvents((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        year,
        title,
        description,
        yearNumber: Number(year.match(/\d{4}/)?.[0]) || Number(year) || 0,
      },
    ]);
    setTimelineForm(initialTimelineForm);
    setIsTimelineFormOpen(false);
  }

  function removeDraftTimelineEvent(eventId) {
    setTimelineEvents((current) => current.filter((event) => event.id !== eventId));
  }

  function choosePreviousBanner() {
    const currentIndex = bannerPresets.findIndex((banner) => banner.id === form.bannerId);
    const previousIndex = (currentIndex - 1 + bannerPresets.length) % bannerPresets.length;
    updateField("bannerId", bannerPresets[previousIndex].id);
  }

  function chooseNextBanner() {
    const currentIndex = bannerPresets.findIndex((banner) => banner.id === form.bannerId);
    const nextIndex = (currentIndex + 1) % bannerPresets.length;
    updateField("bannerId", bannerPresets[nextIndex].id);
  }

  function canContinueFromDetails() {
    return form.name.trim() && form.message.trim() && form.story.trim() && form.creatorName.trim() && form.email.trim();
  }

  function getDateValidationError() {
    const birthDate = parseDateInput(form.birthDate);
    const passingDate = parseDateInput(form.passingDate);

    if (form.birthDate.trim() && !birthDate) return "Enter the birth date as MM/DD/YYYY.";
    if (form.passingDate.trim() && !passingDate) return "Enter the passing date as MM/DD/YYYY.";
    if (birthDate && passingDate && passingDate < birthDate) return "Passing date should be after the birth date.";

    return "";
  }

  function goToNextStep() {
    setError("");
    setShowPublishConfirm(false);

    if (step === 2 && !canContinueFromDetails()) {
      setError("Add their name, banner intro, full story, your name, and your email to continue.");
      return;
    }

    const dateError = step === 2 ? getDateValidationError() : "";
    if (dateError) {
      setError(dateError);
      return;
    }

    setStep((current) => Math.min(current + 1, 3));
  }

  function goBackStep() {
    setError("");
    setShowPublishConfirm(false);
    setStep((current) => Math.max(current - 1, 1));
  }

  async function publishTribute() {
    setError("");
    setSaving(true);
    setSavingLabel("Creating tribute...");

    try {
      const cleanedForm = trimFormValues(form);
      const favoriteSong = buildFavoriteSong(cleanedForm);
      const tribute = await createTribute({
        ...cleanedForm,
        favoriteSong,
        bannerUrl: getBannerById(cleanedForm.bannerId).imageUrl,
        visibility: cleanedForm.visibility,
      });

      if (photos.length) {
        setSavingLabel("Uploading photos...");
        await uploadTributePhotos(tribute.id, photos.slice(0, PHOTO_LIMIT), primaryPhotoId || photos[0].id);
      }

      if (timelineEvents.length) {
        setSavingLabel("Saving timeline...");
        await Promise.all(
          timelineEvents.map((event) =>
            addTimelineEvent(tribute.id, {
              year: event.year,
              title: event.title,
              description: event.description,
            }),
          ),
        );
      }

      navigate(`/published/${tribute.id}?manageToken=${tribute.manageToken}&visibility=${cleanedForm.visibility}`);
    } catch (err) {
      setError("We could not create the tribute yet. Please check your Firebase setup and storage rules, then try again.");
      setSaving(false);
      setSavingLabel("Creating...");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (step < 3) {
      goToNextStep();
    }
  }

  const primaryPreviewPhoto = photos.find((photo) => photo.id === primaryPhotoId) || photos[0];
  const selectedBanner = getBannerById(form.bannerId);
  const previewYears = [form.birthYear, form.passingYear].filter(Boolean).join(" - ");
  const previewName = form.name.trim() || "Their Name";
  const previewMessage = form.message.trim() || "A few loving words will appear here as the tribute begins to take shape.";
  const aiUsesRemaining = Math.max(AI_USE_LIMIT - aiUseCount, 0);
  const aiLimitReached = aiUsesRemaining <= 0;
  const timelinePreviewItems = buildTimelinePreviewItems({
    name: form.name.trim(),
    birthYear: form.birthYear,
    passingYear: form.passingYear,
    events: timelineEvents,
  });

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col justify-center px-4 py-8 sm:px-6">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink/60">
        <ArrowLeft size={16} /> Home
      </Link>

      <section className="mb-6 rounded-2xl border border-rich-purple/10 bg-white/85 px-5 py-4 shadow-sm sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Step {step} of 3</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{stepCopy[step].title}</h1>
          </div>
          <span className="hidden rounded-full bg-light-purple px-3 py-1 text-xs font-semibold text-deep-purple sm:inline-flex">
            {Math.round((step / 3) * 100)}%
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((item) => (
            <div key={item} className={`h-1.5 rounded-full ${item <= step ? "bg-rich-purple" : "bg-light-purple"}`} />
          ))}
        </div>

      </section>

      <section
        className={`grid gap-5 lg:items-start ${
          step < 3 ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.8fr)]" : "lg:grid-cols-1"
        }`}
      >

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
          {step === 1 && (
            <div>
              <p className="eyebrow">Photos</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Add photos of your loved one</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink/62">
                A few meaningful photos can help bring their story to life.
              </p>

              <label
                className={`mt-7 grid place-items-center rounded-[2rem] border border-dashed px-5 py-12 text-center transition ${
                  photos.length >= PHOTO_LIMIT
                    ? "cursor-not-allowed border-ink/10 bg-stone text-ink/45"
                    : "cursor-pointer border-ink/20 bg-cream hover:bg-stone"
                }`}
              >
                <Camera className="text-deep-purple" size={34} />
                <span className="mt-4 font-semibold text-ink">
                  {photos.length >= PHOTO_LIMIT
                    ? "Photo limit reached"
                    : photos.length
                      ? "Add more photos"
                      : "Add photos"}
                </span>
                <span className="mt-2 max-w-sm text-sm leading-6 text-ink/55">
                  Up to {PHOTO_LIMIT} images
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={photos.length >= PHOTO_LIMIT}
                  className="sr-only"
                  onChange={handlePhotoSelection}
                />
              </label>

              {photos.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo) => {
                    const isPrimary = photo.id === primaryPhotoId;

                    return (
                      <div key={photo.id} className="rounded-2xl border border-ink/10 bg-cream p-2">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setPrimaryPhotoId(photo.id)}
                            className={`group block aspect-square w-full overflow-hidden rounded-2xl border text-left transition ${
                              isPrimary ? "border-rich-purple ring-4 ring-rich-purple/15" : "border-ink/10 hover:border-rich-purple/40"
                            }`}
                          >
                            <img src={photo.previewUrl} alt={photo.name} className="h-full w-full object-cover" />
                            <span className="absolute inset-x-2 bottom-2 inline-flex items-center justify-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-ink shadow-sm">
                              <Star size={12} fill={isPrimary ? "currentColor" : "none"} />
                              {isPrimary ? "Primary" : "Make primary"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-cream"
                            aria-label={`Remove ${photo.name}`}
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <input
                          value={photo.caption}
                          onChange={(event) => updatePhotoCaption(photo.id, event.target.value)}
                          placeholder="Add a caption"
                          className="mt-2 min-h-10 w-full rounded-full border border-ink/10 bg-white px-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-7">
                <p className="text-sm font-semibold text-ink/72">Choose a peaceful banner</p>
                <p className="mt-2 text-sm leading-6 text-ink/55">This image sits behind the name and tribute message.</p>
                <div className="mt-3 overflow-hidden rounded-3xl border border-rich-purple/10 bg-cream shadow-sm">
                  <div className="relative">
                    <img src={selectedBanner.imageUrl} alt={selectedBanner.name} className="h-44 w-full object-cover sm:h-56" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-deep-purple/80 to-transparent p-4 text-white">
                      <button
                        type="button"
                        onClick={choosePreviousBanner}
                        className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/15 backdrop-blur transition hover:bg-white/25"
                        aria-label="Previous banner"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className="text-center">
                        <p className="text-sm font-semibold">{selectedBanner.name}</p>
                        <p className="mt-1 text-xs text-white/72">
                          {bannerPresets.findIndex((banner) => banner.id === form.bannerId) + 1} of {bannerPresets.length}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={chooseNextBanner}
                        className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/15 backdrop-blur transition hover:bg-white/25"
                        aria-label="Next banner"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-3">
                    {bannerPresets.map((banner) => (
                      <button
                        key={banner.id}
                        type="button"
                        onClick={() => updateField("bannerId", banner.id)}
                        className={`size-2.5 rounded-full transition ${
                          form.bannerId === banner.id ? "bg-deep-purple" : "bg-rich-purple/20 hover:bg-rich-purple/40"
                        }`}
                        aria-label={`Choose ${banner.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5">
              <TextField
                label="Loved one's name"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Maya Bennett"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Birth date"
                  value={form.birthDate}
                  onChange={(value) => updateField("birthDate", value)}
                  placeholder="MM/DD/YYYY"
                  inputMode="numeric"
                  maxLength={10}
                />
                <TextField
                  label="Passing date"
                  value={form.passingDate}
                  onChange={(value) => updateField("passingDate", value)}
                  placeholder="MM/DD/YYYY"
                  inputMode="numeric"
                  maxLength={10}
                />
              </div>
              <p className="-mt-3 text-sm leading-6 text-ink/50">
                Full dates are saved privately for timeline accuracy. The public profile shows only the years.
              </p>

              <label className="block">
                <span className="text-sm font-semibold text-ink/72">Banner Intro</span>
                <textarea
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  placeholder="This appears in the banner. Keep it to four lines so it fits beautifully."
                  rows={4}
                  maxLength={280}
                  className="mt-2 w-full resize-none rounded-3xl border border-ink/10 bg-cream px-4 py-4 leading-7 outline-none transition placeholder:text-ink/35 focus:border-rich-purple focus:bg-white focus:ring-4 focus:ring-rich-purple/10"
                  required
                />
              </label>

              <div className="-mt-2 rounded-2xl border border-rich-purple/10 bg-white/95 px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-ink">Need help with the banner intro?</p>
                <p className="mt-1 text-sm leading-6 text-ink/60">
                  Add a few rough words or memories, and we'll shape them into a short intro you can edit.
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-deep-purple/55">
                  {aiUsesRemaining} of {AI_USE_LIMIT} AI uses left
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAiHelp("message")}
                    disabled={introAiLoading || aiLimitReached}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rich-purple/30 bg-white px-4 text-sm font-semibold text-deep-purple transition hover:bg-light-purple disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Sparkles size={15} /> {introAiLoading ? "Shaping..." : "Shape Banner Intro"}
                  </button>
                  {aiHistory.message.length > 0 && (
                    <button
                      type="button"
                      onClick={() => undoAiSuggestion("message")}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rich-purple/15 bg-white px-3 text-xs font-semibold text-deep-purple transition hover:bg-light-purple"
                    >
                      <Undo2 size={14} /> Back
                    </button>
                  )}
                  {["Make it shorter", "Make it warmer", "Make it more polished"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleAiHelp("message", action)}
                      disabled={introAiLoading || aiLimitReached}
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-rich-purple/15 bg-light-purple/35 px-3 text-xs font-semibold text-deep-purple transition hover:bg-light-purple disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {action}
                    </button>
                  ))}
                </div>
                {introAiMessage && <p className="mt-3 text-sm leading-6 text-deep-purple/75">{introAiMessage}</p>}
              </div>

              <div className="rounded-3xl border-2 border-rich-purple/20 bg-light-purple/30 p-5 shadow-sm">
                <label className="block">
                <span className="text-sm font-semibold text-ink/72">Full Tribute Story</span>
                <span className="mt-1 block text-sm leading-6 text-ink/55">
                  This is the heart of the tribute and appears in the main story section. Add the fuller version of their life, personality, and what you want people to remember.
                </span>
                <textarea
                  value={form.story}
                  onChange={(event) => updateField("story", event.target.value)}
                  placeholder="Tell the story in your own words. You can write a few sentences now and add more later..."
                  rows={7}
                  className="mt-3 w-full resize-none rounded-3xl border border-ink/10 bg-white px-4 py-4 leading-7 outline-none transition placeholder:text-ink/35 focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
                  required
                />
                </label>

                <div className="mt-4 rounded-2xl border border-rich-purple/10 bg-white/90 px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-ink">Need help telling the story?</p>
                  <p className="mt-1 text-sm leading-6 text-ink/60">
                    Start with a few memories, traits, or moments. We'll help turn them into a tribute you can edit.
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-deep-purple/55">
                    {aiUsesRemaining} of {AI_USE_LIMIT} AI uses left
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAiHelp("story")}
                      disabled={storyAiLoading || aiLimitReached}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rich-purple/30 bg-white px-4 text-sm font-semibold text-deep-purple transition hover:bg-light-purple disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Sparkles size={15} /> {storyAiLoading ? "Writing..." : "Help Write Tribute Story"}
                    </button>
                    {aiHistory.story.length > 0 && (
                      <button
                        type="button"
                        onClick={() => undoAiSuggestion("story")}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rich-purple/15 bg-white px-3 text-xs font-semibold text-deep-purple transition hover:bg-light-purple"
                      >
                        <Undo2 size={14} /> Back
                      </button>
                    )}
                    {["Start from memories", "Make it more heartfelt", "Make it simpler"].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => handleAiHelp("story", action)}
                        disabled={storyAiLoading || aiLimitReached}
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-rich-purple/15 bg-light-purple/35 px-3 text-xs font-semibold text-deep-purple transition hover:bg-light-purple disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                  {storyAiMessage && <p className="mt-3 text-sm leading-6 text-deep-purple/75">{storyAiMessage}</p>}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Creator name"
                  value={form.creatorName}
                  onChange={(value) => updateField("creatorName", value)}
                  placeholder="Your name"
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
              </div>

              <div className="rounded-3xl border border-rich-purple/10 bg-cream p-5">
                <p className="text-sm font-semibold text-ink/72">A song that reminds you of them</p>
                <p className="mt-2 text-sm leading-6 text-ink/55">
                  Add a song family and friends can play while remembering them.
                </p>
                <div className="mt-4 grid gap-3">
                  <TextField
                    label="Song title"
                    value={form.songTitle}
                    onChange={(value) => updateField("songTitle", value)}
                    placeholder="A favorite song or hymn"
                  />
                  <TextField
                    label="Artist"
                    value={form.songArtist}
                    onChange={(value) => updateField("songArtist", value)}
                    placeholder="Artist or performer"
                  />
                  <TextField
                    label="Song link"
                    type="url"
                    value={form.songUrl}
                    onChange={(value) => updateField("songUrl", value)}
                    placeholder="Spotify, YouTube, Apple Music, or another link"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="eyebrow">Verification</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Review before going live</h2>
              <p className="mt-3 max-w-2xl leading-7 text-ink/62">
                Take a quiet moment to check the tribute. Nothing is published until you choose the visibility and press
                publish.
              </p>

              <FullTributeReview
                name={previewName}
                years={previewYears}
                message={previewMessage}
                story={form.story}
                primaryPhoto={primaryPreviewPhoto}
                photos={photos}
                banner={selectedBanner}
                favoriteSong={{
                  title: form.songTitle,
                  artist: form.songArtist,
                  url: form.songUrl,
                }}
                timelineItems={timelinePreviewItems}
              />

              <div className="mt-5 rounded-3xl border border-rich-purple/10 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-ink">Choose visibility before publishing</p>
                <p className="mt-2 text-sm leading-6 text-ink/58">
                  Private is safest while you review with family. Public is for tributes you feel ready to share more
                  openly.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: "private",
                      title: "Private",
                      body: "Only people with the link can view this tribute.",
                    },
                    {
                      value: "public",
                      title: "Public",
                      body: "This tribute can be shared more openly and may be discoverable later.",
                    },
                  ].map((option) => {
                    const isSelected = form.visibility === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField("visibility", option.value)}
                        className={`rounded-3xl border p-4 text-left transition ${
                          isSelected
                            ? "border-rich-purple bg-light-purple/45 ring-4 ring-rich-purple/10"
                            : "border-ink/10 bg-white hover:border-rich-purple/35"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-ink">{option.title}</span>
                          {isSelected && <Check className="text-deep-purple" size={18} />}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-ink/58">{option.body}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-3xl border border-rich-purple/10 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-4 bg-light-purple/45 px-5 py-5">
                  <div>
                    <p className="eyebrow">Life Timeline</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Important dates</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/60">
                      Birth and passing dates are added automatically. You can add another meaningful date now, or skip
                      this for later.
                    </p>
                  </div>
                  {!isTimelineFormOpen && (
                    <button
                      type="button"
                      onClick={() => setIsTimelineFormOpen(true)}
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-deep-purple text-white shadow-sm transition hover:bg-rich-purple"
                      aria-label="Add an important date"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>

                <div className="px-5 py-5">
                  {timelinePreviewItems.length > 0 ? (
                    <div className="relative">
                      <div className="absolute bottom-3 left-5 top-3 w-px bg-rich-purple/18" />
                      <div className="space-y-4">
                        {timelinePreviewItems.map((item) => (
                          <article key={item.id} className="relative grid grid-cols-[2.5rem_1fr] gap-3">
                            <div className="relative z-10 grid size-10 place-items-center rounded-full border border-rich-purple/15 bg-cream text-deep-purple shadow-sm">
                              <CalendarDays size={16} />
                            </div>
                            <div className="rounded-2xl border border-ink/10 bg-cream/70 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-deep-purple shadow-sm">
                                    {item.year}
                                  </span>
                                  {item.generated && (
                                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/35">
                                      Auto
                                    </span>
                                  )}
                                </div>
                                {!item.generated && (
                                  <button
                                    type="button"
                                    onClick={() => removeDraftTimelineEvent(item.id)}
                                    className="grid size-8 place-items-center rounded-full bg-white text-ink/50 transition hover:bg-stone"
                                    aria-label={`Remove ${item.title}`}
                                  >
                                    <X size={15} />
                                  </button>
                                )}
                              </div>
                              <h4 className="mt-3 font-semibold text-ink">{item.title}</h4>
                              {item.description && <p className="mt-2 text-sm leading-6 text-ink/62">{item.description}</p>}
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-rich-purple/20 bg-cream p-4 text-sm leading-6 text-ink/60">
                      Add birth and passing dates, or add an important date below, to begin the timeline.
                    </div>
                  )}

                  {isTimelineFormOpen ? (
                    <div className="mt-5 rounded-3xl border border-rich-purple/15 bg-light-purple/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-deep-purple">Add an important date</p>
                          <p className="mt-1 text-sm leading-6 text-ink/60">
                            A wedding, move, milestone, favorite chapter, or family moment.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTimelineForm(initialTimelineForm);
                            setIsTimelineFormOpen(false);
                          }}
                          className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink/60 transition hover:bg-cream"
                          aria-label="Cancel timeline entry"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[9rem_1fr]">
                        <input
                          value={timelineForm.year}
                          onChange={(event) => setTimelineForm((current) => ({ ...current, year: event.target.value }))}
                          placeholder="Year or date"
                          inputMode="numeric"
                          className="min-h-12 rounded-full border border-ink/10 bg-white px-4 outline-none focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
                        />
                        <input
                          value={timelineForm.title}
                          onChange={(event) => setTimelineForm((current) => ({ ...current, title: event.target.value }))}
                          placeholder="What happened?"
                          className="min-h-12 rounded-full border border-ink/10 bg-white px-4 outline-none focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
                        />
                      </div>
                      <textarea
                        value={timelineForm.description}
                        onChange={(event) => setTimelineForm((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Add a few details, if you want."
                        rows={3}
                        className="mt-3 w-full resize-none rounded-3xl border border-ink/10 bg-white px-4 py-3 leading-7 outline-none focus:border-rich-purple focus:ring-4 focus:ring-rich-purple/10"
                      />
                      <button
                        type="button"
                        onClick={addDraftTimelineEvent}
                        disabled={!timelineForm.year.trim() || !timelineForm.title.trim()}
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple disabled:cursor-not-allowed disabled:bg-deep-purple/40 sm:w-auto"
                      >
                        Add to Timeline
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsTimelineFormOpen(true)}
                      className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-rich-purple/25 bg-white px-5 text-sm font-semibold text-deep-purple transition hover:bg-light-purple sm:w-auto"
                    >
                      <Plus size={16} /> Add an important date
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink/60">
                <Check className="shrink-0 text-deep-purple" size={18} />
                When you publish, EverTrace will create the tribute page and then show you the share link.
              </div>
            </div>
          )}

          {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{error}</p>}

          <div className="mt-7 grid gap-3 sm:grid-cols-[auto_1fr]">
            {step > 1 && (
              <button
                type="button"
                onClick={goBackStep}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-purple px-5 py-3 font-semibold text-white transition hover:bg-rich-purple"
              >
                {step === 1 && photos.length === 0 ? "Continue without photos" : "Continue"} <ArrowRight size={18} />
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowPublishConfirm(true)}
                  disabled={saving}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-purple px-5 py-3 font-semibold text-white transition hover:bg-rich-purple disabled:cursor-not-allowed disabled:bg-deep-purple/45"
                >
                  {saving ? savingLabel : "Publish Tribute"} <ArrowRight size={18} />
                </button>
                <p className="mt-3 text-center text-sm leading-6 text-ink/55">
                  You can order the QR plaque on the next page.
                </p>
              </div>
            )}
          </div>
        </form>

        {step < 3 && (
          <>
            <div className="lg:hidden">
              <details className="rounded-[2rem] border border-rich-purple/10 bg-white p-4 shadow-soft">
                <summary className="eyebrow cursor-pointer list-none">
                  Show preview
                </summary>
                <div className="mt-4">
                  <TributePreview
                    name={previewName}
                    years={previewYears}
                    message={previewMessage}
                    primaryPhoto={primaryPreviewPhoto}
                    banner={selectedBanner}
                    compact
                  />
                </div>
              </details>
            </div>

            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <TributePreview
                name={previewName}
                years={previewYears}
                message={previewMessage}
                primaryPhoto={primaryPreviewPhoto}
                banner={selectedBanner}
              />
            </aside>
          </>
        )}
      </section>

      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-purple/45 px-4 py-5 backdrop-blur-sm sm:items-center">
          <section className="w-full max-w-lg rounded-[2rem] border border-white/50 bg-white p-5 shadow-soft sm:p-7">
            <p className="eyebrow">Final Check</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Ready to publish?</h2>
            <p className="mt-3 leading-7 text-ink/65">
              This will create the tribute page for {form.name || "your loved one"}. You will still get a private
              creator link after publishing so you can return to it later.
            </p>

            <div className="mt-5 rounded-3xl bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Visibility</p>
              <p className="mt-2 font-semibold text-ink">
                {form.visibility === "private" ? "Private" : "Public"}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink/58">
                {form.visibility === "private"
                  ? "Only people with the link can view this tribute."
                  : "This tribute can be shared more openly and may be discoverable later."}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowPublishConfirm(false)}
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-rich-purple/35 bg-white px-5 font-semibold text-ink transition hover:bg-stone disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={publishTribute}
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-deep-purple px-5 font-semibold text-white transition hover:bg-rich-purple disabled:cursor-not-allowed disabled:bg-deep-purple/45"
              >
                {saving ? savingLabel : "Yes, Publish Now"} <ArrowRight size={18} />
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function TributePreview({ name, years, message, primaryPhoto, banner, compact = false, label = "Preview" }) {
  return (
    <div className={compact ? "" : "rounded-[2rem] border border-rich-purple/10 bg-white p-4 shadow-soft"}>
      {!compact && label && <p className="eyebrow px-2 pb-3">{label}</p>}
      <div className="overflow-hidden rounded-[1.5rem] bg-deep-purple shadow-soft">
        <div className={`relative ${compact ? "min-h-[260px]" : "min-h-[420px]"}`}>
          <img src={banner.imageUrl} alt={banner.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-purple/90 via-deep-purple/35 to-deep-purple/10" />
          <div
            className={`relative grid gap-4 p-5 text-white ${
              compact
                ? "min-h-[260px]"
                : primaryPhoto
                  ? "min-h-[420px] sm:grid-cols-[9rem_1fr] sm:items-end"
                  : "min-h-[420px]"
            }`}
          >
            {primaryPhoto && (
              <div className={`${compact ? "hidden" : "mx-auto w-32 overflow-hidden rounded-[1.25rem] border border-white/25 bg-white/14 p-1.5 shadow-soft backdrop-blur sm:mx-0 sm:w-full"}`}>
                <img src={primaryPhoto.previewUrl} alt="Primary portrait preview" className="aspect-[4/5] w-full rounded-[0.9rem] object-cover object-[center_30%]" />
              </div>
            )}
            <div className="flex flex-col justify-end">
              <p className="eyebrow-light">In Loving Memory</p>
              <h2 className={`${compact ? "text-2xl" : "text-3xl"} mt-2 font-semibold tracking-tight`}>{name}</h2>
              <p className="mt-1 text-sm text-white/75">{years || "Years can be added later"}</p>
              <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/82">{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FullTributeReview({ name, years, message, story, primaryPhoto, photos, banner, favoriteSong, timelineItems }) {
  const hasSong = favoriteSong?.title || favoriteSong?.artist || favoriteSong?.url;

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-rich-purple/10 bg-white shadow-soft">
      <div className="p-4 sm:p-5">
        <TributePreview name={name} years={years} message={message} primaryPhoto={primaryPhoto} banner={banner} label="" />

        {story?.trim() && (
          <section className="mt-5 rounded-3xl border border-ink/10 bg-cream p-5">
            <p className="eyebrow">Their Story</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">A life remembered together</h3>
            <p className="mt-4 whitespace-pre-line leading-8 text-ink/70">{story}</p>
          </section>
        )}

        {hasSong && (
          <section className="mt-5 rounded-3xl border border-rich-purple/10 bg-white p-5 shadow-sm">
            <p className="eyebrow">A Song They Loved</p>
            {favoriteSong.title && <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{favoriteSong.title}</h3>}
            {favoriteSong.artist && <p className="mt-1 text-sm text-ink/60">by {favoriteSong.artist}</p>}
            <p className="mt-3 text-sm leading-6 text-ink/65">
              Press play to remember {name || "them"} with a song chosen in their honor.
            </p>
          </section>
        )}

        {timelineItems.length > 0 && (
          <section className="mt-5 rounded-3xl border border-rich-purple/10 bg-white p-5 shadow-sm">
            <p className="eyebrow">Life Timeline</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Important moments</h3>
            <div className="relative mt-5">
              <div className="absolute bottom-3 left-5 top-3 w-px bg-rich-purple/18" />
              <div className="space-y-4">
                {timelineItems.map((item) => (
                  <article key={item.id} className="relative grid grid-cols-[2.5rem_1fr] gap-3">
                    <div className="relative z-10 grid size-10 place-items-center rounded-full border border-rich-purple/15 bg-cream text-deep-purple shadow-sm">
                      <CalendarDays size={16} />
                    </div>
                    <div className="rounded-2xl border border-ink/10 bg-cream/70 p-4">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-deep-purple shadow-sm">{item.year}</span>
                      <h4 className="mt-3 font-semibold text-ink">{item.title}</h4>
                      {item.description && <p className="mt-2 text-sm leading-6 text-ink/62">{item.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section className="mt-5 rounded-3xl border border-ink/10 bg-white p-5 shadow-sm">
            <p className="eyebrow">Photo Gallery</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.slice(0, 8).map((photo) => (
                <figure key={photo.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-cream">
                  <img src={photo.previewUrl} alt={photo.caption || photo.name} className="aspect-square w-full object-cover" />
                  {photo.caption && <figcaption className="px-3 py-2 text-xs leading-5 text-ink/62">{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text", required = false, inputMode, maxLength }) {
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
