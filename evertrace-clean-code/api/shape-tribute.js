const MAX_NOTES_LENGTH = 1200;
const MAX_SUGGESTION_LENGTH = 280;
const MAX_STORY_LENGTH = 1800;

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

  const { name = "their loved one", birthYear = "", passingYear = "", notes = "", mode = "intro", action = "shape" } = request.body || {};
  const trimmedNotes = String(notes).trim().slice(0, MAX_NOTES_LENGTH);
  const isStoryMode = mode === "story";

  if (!trimmedNotes) {
    response.status(400).json({ error: "Add a few words first so we have something to shape." });
    return;
  }

  try {
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
      response.status(openAiResponse.status).json({
        error: payload.error?.message || "The tribute helper could not respond yet.",
      });
      return;
    }

    const suggestion = isStoryMode ? limitStory(extractResponseText(payload)) : limitHeroMessage(extractResponseText(payload));

    if (!suggestion) {
      response.status(502).json({ error: "The tribute helper did not return a suggestion." });
      return;
    }

    response.status(200).json({ suggestion });
  } catch (error) {
    console.error("Shape tribute error:", error?.message || error);
    response.status(500).json({
      error:
        process.env.NODE_ENV === "production"
          ? "The tribute helper could not respond yet."
          : `The tribute helper could not respond yet: ${error?.message || "Unknown error"}`,
    });
  }
}
