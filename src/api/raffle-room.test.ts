import { describe, expect, it } from "vitest";
import { RaffleRoom, hasRaffleRoom, routeRaffleRequest } from "./raffle-room";

type RaffleRoomState = ConstructorParameters<typeof RaffleRoom>[0];

function createRoom(): RaffleRoom {
  const storage = new Map<string, unknown>();
  const state = {
    storage: {
      async get<T>(key: string): Promise<T | undefined> {
        return storage.get(key) as T | undefined;
      },
      async put<T>(key: string, value: T): Promise<void> {
        storage.set(key, value);
      },
    },
  } satisfies RaffleRoomState;

  return new RaffleRoom(state);
}

function request(path: string, method = "GET", body?: unknown): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { "content-type": "application/json" };
  }

  return new Request(`http://example.com${path}`, init);
}

function malformedRequest(path: string): Request {
  return new Request(`http://example.com${path}`, {
    method: "POST",
    body: "{",
    headers: { "content-type": "application/json" },
  });
}

describe("RaffleRoom", () => {
  it("detects whether a raffle room binding is available", () => {
    expect(hasRaffleRoom(undefined)).toBe(false);
    expect(hasRaffleRoom({})).toBe(false);
    expect(hasRaffleRoom({ RAFFLE_ROOM: {} })).toBe(true);
  });

  it("routes Worker API requests to the named room object", async () => {
    const env = {
      RAFFLE_ROOM: {
        idFromName(name: string): string {
          return `id:${name}`;
        },
        get(id: string) {
          return {
            async fetch() {
              return Response.json({ id });
            },
          };
        },
      },
    };

    const response = await routeRaffleRequest(request("/api/raffle/state"), env);

    await expect(response.json()).resolves.toEqual({ id: "id:future-frontend-may-2026" });
  });

  it("routes requests to a normalized custom room", async () => {
    const env = {
      RAFFLE_ROOM: {
        idFromName(name: string): string {
          return `id:${name}`;
        },
        get(id: string) {
          return {
            async fetch() {
              return Response.json({ id });
            },
          };
        },
      },
    };

    const response = await routeRaffleRequest(request("/api/raffle/state?room=Demo Room!"), env);

    await expect(response.json()).resolves.toEqual({ id: "id:demo-room" });
  });

  it("keeps registration closed until a host claims the room", async () => {
    const room = createRoom();

    const response = await room.fetch(request("/api/raffle/state"));

    await expect(response.json()).resolves.toMatchObject({
      hostClaimed: false,
      registrationOpen: false,
      participants: [],
      winner: null,
    });
  });

  it("rejects unknown room routes", async () => {
    const room = createRoom();

    const response = await room.fetch(request("/api/raffle/unknown"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Not found" });
  });

  it("rejects malformed host claims", async () => {
    const room = createRoom();

    const response = await room.fetch(malformedRequest("/api/raffle/claim-host"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Host key is required" });
  });

  it("rejects short host keys", async () => {
    const room = createRoom();

    const response = await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey: "short" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Host key is required" });
  });

  it("rejects competing host claims", async () => {
    const room = createRoom();

    await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey: "1234567890abcdef" }));
    const response = await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey: "abcdef1234567890" }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "Host already claimed" });
  });

  it("rejects audience joins before registration opens", async () => {
    const room = createRoom();

    const response = await room.fetch(request("/api/raffle/join", "POST", { id: "phone-1", name: "Ada" }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "Registration is not open" });
  });

  it("rejects invalid audience names", async () => {
    const room = createRoom();

    const response = await room.fetch(request("/api/raffle/join", "POST", { id: "phone-1", name: "   " }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Name and participant id are required" });
  });

  it("lets the first host open registration and audience members join", async () => {
    const room = createRoom();
    const hostKey = "1234567890abcdef";

    const hostResponse = await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey }));
    const joinResponse = await room.fetch(request("/api/raffle/join", "POST", { id: "phone-1", name: " Ada   Lovelace " }));

    expect(hostResponse.status).toBe(200);
    expect(joinResponse.status).toBe(200);
    await expect(joinResponse.json()).resolves.toMatchObject({
      hostClaimed: true,
      registrationOpen: true,
      participants: [{ id: "phone-1", name: "Ada Lovelace" }],
    });
  });

  it("requires host control before drawing a winner", async () => {
    const room = createRoom();
    const hostKey = "1234567890abcdef";

    await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey }));
    await room.fetch(request("/api/raffle/join", "POST", { id: "phone-1", name: "Grace Hopper" }));

    const forbidden = await room.fetch(request("/api/raffle/draw", "POST", { hostKey: "not-the-host-key" }));
    const drawn = await room.fetch(request("/api/raffle/draw", "POST", { hostKey }));

    expect(forbidden.status).toBe(403);
    expect(drawn.status).toBe(200);
    await expect(drawn.json()).resolves.toMatchObject({
      registrationOpen: false,
      winner: { id: "phone-1", name: "Grace Hopper" },
    });
  });

  it("rejects empty draws", async () => {
    const room = createRoom();
    const hostKey = "1234567890abcdef";

    await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey }));
    const response = await room.fetch(request("/api/raffle/draw", "POST", { hostKey }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "No participants registered" });
  });

  it("resets entrants while keeping host control active", async () => {
    const room = createRoom();
    const hostKey = "1234567890abcdef";

    await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey }));
    await room.fetch(request("/api/raffle/join", "POST", { id: "phone-1", name: "Grace Hopper" }));
    await room.fetch(request("/api/raffle/draw", "POST", { hostKey }));

    const response = await room.fetch(request("/api/raffle/reset", "POST", { hostKey }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      hostClaimed: true,
      registrationOpen: true,
      participants: [],
      winner: null,
    });
  });

  it("updates an existing participant from the same browser", async () => {
    const room = createRoom();
    const hostKey = "1234567890abcdef";

    await room.fetch(request("/api/raffle/claim-host", "POST", { hostKey }));
    await room.fetch(request("/api/raffle/join", "POST", { id: "phone-1", name: "Ada" }));
    const response = await room.fetch(request("/api/raffle/join", "POST", { id: "phone-1", name: "Ada Lovelace" }));

    await expect(response.json()).resolves.toMatchObject({
      participants: [{ id: "phone-1", name: "Ada Lovelace" }],
    });
  });
});
