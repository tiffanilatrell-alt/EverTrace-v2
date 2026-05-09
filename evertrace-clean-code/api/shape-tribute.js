import { initializeApp, getApps } from "firebase/app";
import { doc, getFirestore, increment, runTransaction, serverTimestamp, updateDoc } from "firebase/firestore";

const MAX_NOTES_LENGTH = 1200;
const MAX_SUGGESTION_LENGTH = 280;
const MAX_STORY_LENGTH = 1800;
const AI_USE_LIMIT = 5;
const SESSION_ID_PATTERN = /^[a-zA-Z0-9_-]{12,80}$/;

function getDb() {
  const app =
    getApps()[0] ||
    initializeApp({
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    });

  return getFirestore(app);
}

function limitHeroMessage(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .split("\n")
    .slice(0, 4)
    .join("\n")
    .slice(0, MAX_SUGGESTION_LENGTH)
    .trim();
}

function limitStory(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .slice(0, MAX_STORY_LENGTH)
    .trim();
}

function extractResponseText(payload) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function reserveAiUse(sessionId) {
  const usageRef = doc(getDb(), "aiUsage", sessionId);

  return runTransaction(getDb(), async (transaction) => {
    const usageSnap = await transaction.get(usageRef);
    const currentCount = usageSnap.exists() ? usageSnap.data().count || 0 : 0;

    if (currentCount >= AI_USE_LIMIT) {
      return {
        allowed: false,
        count: currentCount,
        usesRemaining: 0,
      };
    }

    const nextCount = currentCount + 1;
    const payload = {
      count: nextCount,
      limit: AI_USE_LIMIT,
      updatedAt: serverTimestamp(),
    };

    if (usageSnap.exists()) {
      transaction.update(usageRef, payload);
    } else {
      transaction.set(usageRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }

    return {
      allowed: true,
      count: nextCount,
      usesRemaining: Math.max(AI_USE_LIMIT - nextCount, 0),
    };
  });
}

async function releaseAiUse(sessionId) {
  try {
    await updateDoc(doc(getDb(), "aiUsage", sessionId), {
      count: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("AI usage rollback failed:", error?.message || error);
  }
}

export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Only POST requests are supported." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(503).json({ error: "The tribute helper is not configured yet." });
    return;
  }

  if (!process.env.VITE_FIREBASE_API_KEY || !process.env.VITE_FIREBASE_PROJECT_ID || !process.env.VITE_FIREBASE_APP_ID) {
    response.status(503).json({ error: "The AI usage tracker is not configured yet." });
    return;
  }

  const { name = "their loved one", birthYear = "", passingYear = "", notes = "", mode = "intro", action = "shape", sessionId = "" } = request.body || {};
  const trimmedNotes = String(notes).trim().slice(0, MAX_NOTES_LENGTH);
  const isStoryMode = mode === "story";
  const cleanSessionId = String(sessionId).trim();

  if (!trimmedNotes) {
    response.status(400).json({ error: "Add a few words first so we have something to shape." });
    return;
  }

  if (!SESSION_ID_PATTERN.test(cleanSessionId)) {
    response.status(400).json({ error: "We could not identify this writing session yet. Please refresh and try again." });
    return;
  }

  let usage;

  try {
    usage = await reserveAiUse(cleanSessionId);

    if (!usage.allowed) {
      response.status(429).json({
        error: "You have used the AI writing helper 5 times for this tribute. You can keep editing the text by hand.",
        usesRemaining: 0,
        limit: AI_USE_LIMIT,
      });
      return;
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        max_output_tokens: isStoryMode ? 520 : 180,
        input: [
          {
            role: "system",
            content: isStoryMode
              ? "You help families write memorial tribute stories. Write warmly, calmly, and sincerely. Avoid cliches, religious assumptions, exaggeration, and overly formal language. Preserve the family member's voice. Return only the finished tribute text, no labels."
              : "You help families shape brief memorial tribute copy. Write warmly, simply, and sincerely. Avoid cliches, religious assumptions, and overly formal language. Return only the finished tribute text, no labels.",
          },
          {
            role: "user",
            content: `Loved one: ${name || "their loved one"}\nLife dates: ${birthYear || "unknown"} - ${
              passingYear || "unknown"
            }\nRequested revision: ${action}\nRaw words from family:\n${trimmedNotes}\n\n${
              isStoryMode
                ? "Shape this into a full tribute story for the main story section. Use 2 to 4 short paragraphs, keep it personal and editable, and stay under 1,800 characters."
                : "Shape this into a short banner tribute that fits in four lines and no more than 280 characters. Preserve the family member's voice when possible."
            }`,
          },
        ],
      }),
    });

    const payload = await openAiResponse.json();

    if (!openAiResponse.ok) {
      await releaseAiUse(cleanSessionId);
      response.status(openAiResponse.status).json({
        error: payload.error?.message || "The tribute helper could not respond yet.",
        usesRemaining: usage.usesRemaining + 1,
        limit: AI_USE_LIMIT,
      });
      return;
    }

    const suggestion = isStoryMode ? limitStory(extractResponseText(payload)) : limitHeroMessage(extractResponseText(payload));

    if (!suggestion) {
      await releaseAiUse(cleanSessionId);
      response.status(502).json({ error: "The tribute helper did not return a suggestion." });
      return;
    }

    response.status(200).json({ suggestion, usesRemaining: usage.usesRemaining, limit: AI_USE_LIMIT });
  } catch (error) {
    if (usage?.allowed) {
      await releaseAiUse(cleanSessionId);
    }
    console.error("Shape tribute error:", error?.message || error);
    response.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "The tribute helper could not respond yet."
          : `The tribute helper could not respond yet: ${error?.message || "Unknown error"}`,
    });
  }
}
