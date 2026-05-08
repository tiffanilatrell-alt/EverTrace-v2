const MAX_NOTES_LENGTH = 1200;
const MAX_SUGGESTION_LENGTH = 280;

function limitHeroMessage(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .split("\n")
    .slice(0, 4)
    .join("\n")
    .slice(0, MAX_SUGGESTION_LENGTH)
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

  const { name = "their loved one", birthYear = "", passingYear = "", notes = "" } = request.body || {};
  const trimmedNotes = String(notes).trim().slice(0, MAX_NOTES_LENGTH);

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
        max_output_tokens: 180,
        input: [
          {
            role: "system",
            content:
              "You help families shape brief memorial tribute copy. Write warmly, simply, and sincerely. Avoid cliches, religious assumptions, and overly formal language. Return only the finished tribute text, no labels.",
          },
          {
            role: "user",
            content: `Loved one: ${name || "their loved one"}\nLife dates: ${birthYear || "unknown"} - ${
              passingYear || "unknown"
            }\nRaw words from family:\n${trimmedNotes}\n\nShape this into a short banner tribute that fits in four lines and no more than 280 characters. Preserve the family member's voice when possible.`,
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

    const suggestion = limitHeroMessage(extractResponseText(payload));

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
