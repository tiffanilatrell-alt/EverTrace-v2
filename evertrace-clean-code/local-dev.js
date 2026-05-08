import { existsSync, readFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import shapeTribute from "./api/shape-tribute.js";

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

function loadLocalEnv() {
  if (!existsSync(".env")) return;

  const lines = readFileSync(".env", "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function createApiResponse(response) {
  let statusCode = 200;

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      response.statusCode = statusCode;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify(payload));
    },
    end() {
      response.statusCode = statusCode;
      response.end();
    },
  };
}

loadLocalEnv();

const vite = await createViteServer({
  server: {
    middlewareMode: true,
  },
});

const server = createHttpServer(async (request, response) => {
  if (request.url?.startsWith("/api/shape-tribute")) {
    try {
      request.body = await readJsonBody(request);
      await shapeTribute(request, createApiResponse(response));
    } catch (error) {
      response.statusCode = 400;
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ error: "We could not read that tribute note yet." }));
    }

    return;
  }

  vite.middlewares(request, response);
});

server.listen(5173, "127.0.0.1", () => {
  console.log("Local: http://127.0.0.1:5173/");
});

/*
const server = await createViteServer({
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});

server.middlewares.use("/api/shape-tribute", async (request, response) => {
  try {
    request.body = await readJsonBody(request);
    await shapeTribute(request, createApiResponse(response));
  } catch (error) {
    response.statusCode = 400;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: "We could not read that tribute note yet." }));
  }
});

await server.listen();
server.printUrls();
*/

await new Promise(() => {});
