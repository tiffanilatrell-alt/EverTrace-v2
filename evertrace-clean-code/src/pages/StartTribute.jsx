import { ArrowLeft, ArrowRight, Camera, Check, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { bannerPresets, defaultBanner, getBannerById } from "../data/bannerPresets";
import { createTribute, uploadTributePhotos } from "../services/tributeService";

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
  bannerId: defaultBanner.id,
};

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
    title: "Ready to publish",
    body: "Create the tribute, then invite family to add their memories.",
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
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
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
      setAiError("");
      setAiSuggestion("");
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

  async function handleShapeTribute() {
    const notes = form.message.trim();

    if (!notes) {
      setAiError("Add a few words or memories first, then we can help shape them.");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiSuggestion("");

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
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : {};

      if (!response.ok) {
        throw new Error(payload.error || "We could not shape this yet. Please try again in a moment.");
      }

      const suggestion = limitHeroMessage(payload.suggestion || "");

      if (!suggestion) {
        throw new Error("We could not create a suggestion from those words yet.");
      }

      setAiSuggestion(suggestion);
    } catch (err) {
      setAiError(err.message || "We could not shape this yet. Please try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  function applyAiSuggestion() {
    if (!aiSuggestion) return;
    updateField("message", aiSuggestion);
    setAiSuggestion("");
  }

  function handlePhotoSelection(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!selectedFiles.length) return;

    setError("");

    setPhotos((currentPhotos) => {
      const availableSlots = Math.max(8 - currentPhotos.length, 0);
      const acceptedFiles = selectedFiles.slice(0, availableSlots);
      const nextPhotos = [
        ...currentPhotos,
        ...acceptedFiles.map((file) => ({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          name: file.name,
          file,
          caption: "",
          previewUrl: URL.createObjectURL(file),
        })),
      ];

      if (selectedFiles.length > availableSlots) {
        setError("You can add up to 8 photos for now.");
      }

      if (!primaryPhotoId && nextPhotos[0]) {
        setPrimaryPhotoId(nextPhotos[0].id);
      }

      return nextPhotos;
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
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    setSavingLabel("Creating tribute...");

    try {
      const cleanedForm = trimFormValues(form);
      const tributeId = await createTribute({
        ...cleanedForm,
        bannerUrl: getBannerById(cleanedForm.bannerId).imageUrl,
        visibility: "public",
      });

      if (photos.length) {
        setSavingLabel("Uploading photos...");
        await uploadTributePhotos(tributeId, photos, primaryPhotoId || photos[0].id);
      }

      navigate(`/published/${tributeId}`);
    } catch (err) {
      setError("We could not create the tribute yet. Please check your Firebase setup and storage rules, then try again.");
      setSaving(false);
      setSavingLabel("Creating...");
    }
  }

  const primaryPreviewPhoto = photos.find((photo) => photo.id === primaryPhotoId) || photos[0];
  const selectedBanner = getBannerById(form.bannerId);
  const previewYears = [form.birthYear, form.passingYear].filter(Boolean).join(" - ");
  const previewName = form.name.trim() || "Their Name";
  const previewMessage = form.message.trim() || "A few loving words will appear here as the tribute begins to take shape.";

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

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.8fr)] lg:items-start">

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
          {step === 1 && (
            <div>
              <p className="eyebrow">Photos</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Add photos of your loved one</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink/62">
                Choose a few favorite moments for the gallery. After you upload them, tap the photo you want to use as the primary image at the top of the tribute.
              </p>
              <div className="mt-5 rounded-2xl border border-rich-purple/10 bg-light-purple/35 px-4 py-3 text-sm leading-6 text-ink/68">
                Start with one clear portrait if you have it. You can add up to 8 photos now and caption each one with a short memory.
              </div>

              <label className="mt-7 grid cursor-pointer place-items-center rounded-[2rem] border border-dashed border-ink/20 bg-cream px-5 py-12 text-center transition hover:bg-stone">
                <Camera className="text-deep-purple" size={34} />
                <span className="mt-4 font-semibold text-ink">{photos.length ? "Add more photos to the gallery" : "Tap to add gallery photos"}</span>
                <span className="mt-2 max-w-sm text-sm leading-6 text-ink/55">
                  You can choose one as the primary photo after upload. Up to 8 photos for now.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {bannerPresets.map((banner) => {
                    const isSelected = form.bannerId === banner.id;

                    return (
                      <button
                        key={banner.id}
                        type="button"
                        onClick={() => updateField("bannerId", banner.id)}
                        className={`overflow-hidden rounded-2xl border text-left transition ${
                          isSelected ? "border-rich-purple ring-4 ring-rich-purple/15" : "border-ink/10 hover:border-rich-purple/40"
                        }`}
                      >
                        <img src={banner.imageUrl} alt={banner.name} className="h-28 w-full object-cover" />
                        <span className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink">
                          {banner.name}
                          {isSelected && <Check className="text-deep-purple" size={17} />}
                        </span>
                      </button>
                    );
                  })}
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

              <div className="-mt-2 rounded-2xl border border-rich-purple/10 bg-white px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-ink">Need help with the banner intro?</p>
                <p className="mt-1 text-sm leading-6 text-ink/60">
                  Add a few rough words above, and we can shape them into a short intro you can edit.
                </p>
                <button
                  type="button"
                  onClick={handleShapeTribute}
                  disabled={aiLoading}
                  className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full border border-rich-purple/25 bg-light-purple/45 px-4 text-sm font-semibold text-deep-purple transition hover:bg-light-purple disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {aiLoading ? "Shaping..." : "Shape Banner Intro"}
                </button>
                {aiError && <p className="mt-3 text-sm leading-6 text-red-700">{aiError}</p>}
                {aiSuggestion && (
                  <div className="mt-4 rounded-2xl border border-rich-purple/10 bg-light-purple/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-deep-purple/70">
                      Suggested wording
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink/75">{aiSuggestion}</p>
                    <button
                      type="button"
                      onClick={applyAiSuggestion}
                      className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-deep-purple px-4 text-sm font-semibold text-white transition hover:bg-rich-purple"
                    >
                      Use This Version
                    </button>
                  </div>
                )}
              </div>

              <label className="block rounded-3xl border-2 border-rich-purple/20 bg-light-purple/30 p-5 shadow-sm">
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
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="eyebrow">Review</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{form.name || "Your tribute"}</h2>
              <p className="mt-2 text-ink/60">
                {[form.birthYear, form.passingYear].filter(Boolean).join(" - ") || "Years can be added later"}
              </p>
              <div className="mt-5 rounded-3xl bg-cream p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Banner Intro</p>
                <p className="line-clamp-4 leading-8 text-ink/70">{form.message}</p>
              </div>
              {form.story.trim() && (
                <div className="mt-4 rounded-3xl border border-ink/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Full Story</p>
                  <p className="mt-3 line-clamp-6 whitespace-pre-line leading-8 text-ink/70">{form.story}</p>
                </div>
              )}
              {photos.length > 0 && (
                <div className="mt-5 rounded-3xl border border-ink/10 p-4">
                  <p className="text-sm font-semibold text-ink/60">Primary photo</p>
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={photos.find((photo) => photo.id === primaryPhotoId)?.previewUrl || photos[0].previewUrl}
                      alt="Selected primary"
                      className="size-16 rounded-2xl object-cover"
                    />
                    <p className="text-sm leading-6 text-ink/60">{photos.length} photo{photos.length === 1 ? "" : "s"} selected.</p>
                  </div>
                </div>
              )}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 text-sm text-ink/60">
                <Check className="shrink-0 text-deep-purple" size={18} />
                After publishing, you can share the link and invite family to add memories.
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
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-deep-purple px-5 py-3 font-semibold text-white transition hover:bg-rich-purple disabled:cursor-not-allowed disabled:bg-deep-purple/45"
              >
                {saving ? savingLabel : "Create Tribute"} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </form>

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
      </section>
    </main>
  );
}

function TributePreview({ name, years, message, primaryPhoto, banner, compact = false }) {
  return (
    <div className={compact ? "" : "rounded-[2rem] border border-rich-purple/10 bg-white p-4 shadow-soft"}>
      {!compact && <p className="eyebrow px-2 pb-3">Preview</p>}
      <div className="overflow-hidden rounded-[1.5rem] bg-deep-purple shadow-soft">
        <div className={`relative ${compact ? "min-h-[260px]" : "min-h-[420px]"}`}>
          <img src={banner.imageUrl} alt={banner.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-purple/90 via-deep-purple/35 to-deep-purple/10" />
          <div className={`relative flex flex-col justify-end p-5 text-white ${compact ? "min-h-[260px]" : "min-h-[420px]"}`}>
            <p className="eyebrow-light">In Loving Memory</p>
            <h2 className={`${compact ? "text-2xl" : "text-3xl"} mt-2 font-semibold tracking-tight`}>{name}</h2>
            <p className="mt-1 text-sm text-white/75">{years || "Years can be added later"}</p>
            <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/82">{message}</p>
            {primaryPhoto && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/12 p-3 backdrop-blur">
                <img src={primaryPhoto.previewUrl} alt="Primary portrait preview" className="size-12 rounded-full object-cover" />
                <p className="text-xs font-semibold text-white/75">Primary photo selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
