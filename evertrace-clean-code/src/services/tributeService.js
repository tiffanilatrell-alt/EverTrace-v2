import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../lib/firebaseClient";

const TRIBUTES_COLLECTION = "tributes";
const MEMORIES_COLLECTION = "memories";
const PHOTOS_COLLECTION = "photos";
const TIMELINE_COLLECTION = "timeline";
const ACCESS_COLLECTION = "tributeAccess";

function createManageToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now()}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

async function hashManageToken(token) {
  const encodedToken = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", encodedToken);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createTribute({
  name,
  birthDate = "",
  passingDate = "",
  birthYear,
  passingYear,
  message,
  story = "",
  creatorName,
  email,
  favoriteSong = null,
  bannerId = "spring-path",
  bannerUrl = "/home-hero.jpg",
  visibility = "public",
}) {
  const manageToken = createManageToken();
  const manageTokenHash = await hashManageToken(manageToken);
  const tributeRef = await addDoc(collection(db, TRIBUTES_COLLECTION), {
    name,
    birthDate,
    passingDate,
    birthYear,
    passingYear,
    message,
    story,
    creatorName,
    email,
    ...(favoriteSong ? { favoriteSong } : {}),
    bannerId,
    bannerUrl,
    visibility,
    updatedAt: serverTimestamp(),
    primaryPhotoUrl: "",
    photoCount: 0,
    reactionCounts: {
      candle: 0,
      love: 0,
      flowers: 0,
    },
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, ACCESS_COLLECTION, tributeRef.id), {
    tributeId: tributeRef.id,
    manageTokenHash,
    creatorEmail: email,
    creatorName,
    createdAt: serverTimestamp(),
    lastAccessedAt: serverTimestamp(),
  });

  return {
    id: tributeRef.id,
    manageToken,
  };
}

export async function uploadTributePhotos(tributeId, photos, primaryPhotoId) {
  if (!photos.length) return [];

  const uploadedPhotos = await Promise.all(
    photos.map(async (photo, index) => {
      const safeName = photo.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storagePath = `${TRIBUTES_COLLECTION}/${tributeId}/${PHOTOS_COLLECTION}/${Date.now()}-${index}-${safeName}`;
      const photoRef = ref(storage, storagePath);

      await uploadBytes(photoRef, photo.file, {
        contentType: photo.file.type,
      });

      const photoUrl = await getDownloadURL(photoRef);
      const isPrimary = photo.id === primaryPhotoId;

      const photoDoc = await addDoc(collection(db, TRIBUTES_COLLECTION, tributeId, PHOTOS_COLLECTION), {
        tributeId,
        photoUrl,
        caption: photo.caption?.trim() || "",
        storagePath,
        isPrimary,
        reactionCounts: {
          candle: 0,
          love: 0,
          flowers: 0,
        },
        createdAt: serverTimestamp(),
      });

      return {
        id: photoDoc.id,
        tributeId,
        photoUrl,
        caption: photo.caption?.trim() || "",
        storagePath,
        isPrimary,
      };
    }),
  );

  const primaryPhoto = uploadedPhotos.find((photo) => photo.isPrimary) || uploadedPhotos[0];

  await updateDoc(doc(db, TRIBUTES_COLLECTION, tributeId), {
    primaryPhotoUrl: primaryPhoto.photoUrl,
    photoCount: uploadedPhotos.length,
  });

  return uploadedPhotos;
}

export async function getTribute(tributeId) {
  const tributeSnap = await getDoc(doc(db, TRIBUTES_COLLECTION, tributeId));

  if (!tributeSnap.exists()) {
    return null;
  }

  return {
    id: tributeSnap.id,
    ...tributeSnap.data(),
  };
}

export async function getManagedTribute(tributeId, manageToken) {
  if (!manageToken) return null;

  const accessSnap = await getDoc(doc(db, ACCESS_COLLECTION, tributeId));
  const manageTokenHash = await hashManageToken(manageToken);

  if (!accessSnap.exists() || accessSnap.data().manageTokenHash !== manageTokenHash) {
    return null;
  }

  const tribute = await getTribute(tributeId);

  if (!tribute) {
    return null;
  }

  await updateDoc(doc(db, ACCESS_COLLECTION, tributeId), {
    lastAccessedAt: serverTimestamp(),
  });

  return tribute;
}

export function subscribeToTribute(tributeId, onChange, onError) {
  return onSnapshot(
    doc(db, TRIBUTES_COLLECTION, tributeId),
    (tributeSnap) => {
      onChange(
        tributeSnap.exists()
          ? {
              id: tributeSnap.id,
              ...tributeSnap.data(),
            }
          : null,
      );
    },
    onError,
  );
}

export async function addMemory(tributeId, { contributorName, text }) {
  const memoryRef = await addDoc(
    collection(db, TRIBUTES_COLLECTION, tributeId, MEMORIES_COLLECTION),
    {
      tributeId,
      contributorName,
      text,
      createdAt: serverTimestamp(),
      reactionCounts: {
        candle: 0,
        love: 0,
        flowers: 0,
      },
    },
  );

  return memoryRef.id;
}

export async function getMemories(tributeId) {
  const memoriesQuery = query(
    collection(db, TRIBUTES_COLLECTION, tributeId, MEMORIES_COLLECTION),
    orderBy("createdAt", "desc"),
  );

  const memoriesSnap = await getDocs(memoriesQuery);

  return memoriesSnap.docs.map((memoryDoc) => ({
    id: memoryDoc.id,
    ...memoryDoc.data(),
  }));
}

export function subscribeToMemories(tributeId, onChange, onError) {
  const memoriesQuery = query(
    collection(db, TRIBUTES_COLLECTION, tributeId, MEMORIES_COLLECTION),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    memoriesQuery,
    (memoriesSnap) => {
      onChange(
        memoriesSnap.docs.map((memoryDoc) => ({
          id: memoryDoc.id,
          ...memoryDoc.data(),
        })),
      );
    },
    onError,
  );
}

export function subscribeToPhotos(tributeId, onChange, onError) {
  const photosQuery = query(
    collection(db, TRIBUTES_COLLECTION, tributeId, PHOTOS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(8),
  );

  return onSnapshot(
    photosQuery,
    (photosSnap) => {
      onChange(
        photosSnap.docs.map((photoDoc) => ({
          id: photoDoc.id,
          ...photoDoc.data(),
        })),
      );
    },
    onError,
  );
}

export function subscribeToTimelineEvents(tributeId, onChange, onError) {
  const timelineQuery = query(
    collection(db, TRIBUTES_COLLECTION, tributeId, TIMELINE_COLLECTION),
    orderBy("yearNumber", "asc"),
  );

  return onSnapshot(
    timelineQuery,
    (timelineSnap) => {
      onChange(
        timelineSnap.docs.map((timelineDoc) => ({
          id: timelineDoc.id,
          ...timelineDoc.data(),
        })),
      );
    },
    onError,
  );
}

export async function addTimelineEvent(tributeId, { year, title, description }) {
  const cleanYear = year.trim();
  const yearNumber = Number(cleanYear.match(/\d{4}/)?.[0]) || Number(cleanYear) || 0;

  const timelineRef = await addDoc(collection(db, TRIBUTES_COLLECTION, tributeId, TIMELINE_COLLECTION), {
    tributeId,
    year: cleanYear,
    yearNumber,
    title: title.trim(),
    description: description.trim(),
    createdAt: serverTimestamp(),
  });

  return timelineRef.id;
}

export async function addTributeReaction(tributeId, reaction) {
  await updateDoc(doc(db, TRIBUTES_COLLECTION, tributeId), {
    [`reactionCounts.${reaction}`]: increment(1),
  });
}

export async function addMemoryReaction(tributeId, memoryId, reaction) {
  await updateDoc(doc(db, TRIBUTES_COLLECTION, tributeId, MEMORIES_COLLECTION, memoryId), {
    [`reactionCounts.${reaction}`]: increment(1),
  });
}

export async function addPhotoReaction(tributeId, photoId, reaction) {
  await updateDoc(doc(db, TRIBUTES_COLLECTION, tributeId, PHOTOS_COLLECTION, photoId), {
    [`reactionCounts.${reaction}`]: increment(1),
  });
}

export const firestoreCollections = {
  tributes: TRIBUTES_COLLECTION,
  memories: `${TRIBUTES_COLLECTION}/{tributeId}/${MEMORIES_COLLECTION}`,
  photos: `${TRIBUTES_COLLECTION}/{tributeId}/${PHOTOS_COLLECTION}`,
  timeline: `${TRIBUTES_COLLECTION}/{tributeId}/${TIMELINE_COLLECTION}`,
  access: ACCESS_COLLECTION,
};
