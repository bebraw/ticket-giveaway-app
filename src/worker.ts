import { createHealthResponse } from "./api/health";
import { RaffleRoom, hasRaffleRoom, routeRaffleRequest } from "./api/raffle-room";
import { exampleRoutes } from "./app-routes";
import { renderHomePage } from "./views/home";
import { renderNotFoundPage } from "./views/not-found";
import { cssResponse, htmlResponse } from "./views/shared";

export { RaffleRoom };

export default {
  async fetch(request: Request, env?: unknown): Promise<Response> {
    return await handleRequest(request, env);
  },
};

export async function handleRequest(request: Request, env?: unknown): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/styles.css") {
    return cssResponse(await loadStylesheet());
  }

  if (url.pathname === "/") {
    return htmlResponse(renderHomePage(exampleRoutes));
  }

  if (url.pathname === "/api/health") {
    return createHealthResponse(exampleRoutes.map((route) => route.path));
  }

  if (url.pathname.startsWith("/api/raffle/")) {
    if (!hasRaffleRoom(env)) {
      return Response.json({ error: "Raffle room binding is not configured" }, { status: 503 });
    }

    return await routeRaffleRequest(request, env);
  }

  return htmlResponse(renderNotFoundPage(url.pathname), 404);
}

async function loadStylesheet(): Promise<string> {
  if (typeof process !== "undefined" && process.release?.name === "node") {
    const { readFile } = await import("node:fs/promises");
    return await readFile(new URL("../.generated/styles.css", import.meta.url), "utf8");
  }

  /* v8 ignore next 2 */
  const styles = await import("../.generated/styles.css");
  return styles.default;
}
