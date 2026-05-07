import { describe, expect, it } from "vitest";
import worker, { handleRequest } from "./worker";
import { ensureGeneratedStylesheet } from "./test-support";

ensureGeneratedStylesheet();

describe("worker", () => {
  it("renders the raffle home page", async () => {
    const response = await handleRequest(new Request("http://example.com/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");

    const body = await response.text();
    expect(body).toContain("Future Frontend Ticket Raffle");
    expect(body).toContain("Take control");
    expect(body).toContain("/api/health");
  });

  it("returns a JSON health response", async () => {
    const response = await handleRequest(new Request("http://example.com/api/health"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      ok: true,
      name: "vibe-template-worker",
      routes: [
        "/",
        "/api/health",
        "/api/raffle/state",
        "/api/raffle/join",
        "/api/raffle/claim-host",
        "/api/raffle/draw",
        "/api/raffle/reset",
        "/api/raffle/ws",
      ],
    });
  });

  it("returns unavailable when the raffle room binding is missing", async () => {
    const response = await handleRequest(new Request("http://example.com/api/raffle/state"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Raffle room binding is not configured" });
  });

  it("routes raffle API requests through the room binding", async () => {
    const env = {
      RAFFLE_ROOM: {
        idFromName(name: string): string {
          return name;
        },
        get() {
          return {
            async fetch() {
              return Response.json({ routed: true });
            },
          };
        },
      },
    };

    const response = await handleRequest(new Request("http://example.com/api/raffle/state"), env);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ routed: true });
  });

  it("returns a not found page for unknown routes", async () => {
    const response = await handleRequest(new Request("http://example.com/missing"));

    expect(response.status).toBe(404);

    const body = await response.text();
    expect(body).toContain("Not Found");
    expect(body).toContain("/missing");
  });

  it("exposes the same behavior through the worker fetch entrypoint", async () => {
    const response = await worker.fetch(new Request("http://example.com/api/health"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });

  it("serves generated styles", async () => {
    const response = await handleRequest(new Request("http://example.com/styles.css"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/css");
    await expect(response.text()).resolves.toContain("--color-app-canvas:#f7f5ff");
  });
});
