export interface RaffleParticipant {
  readonly id: string;
  readonly name: string;
  readonly joinedAt: string;
}

export interface PublicRaffleState {
  readonly hostClaimed: boolean;
  readonly registrationOpen: boolean;
  readonly participants: readonly RaffleParticipant[];
  readonly winner: RaffleParticipant | null;
  readonly lastUpdatedAt: string;
}

interface StoredRaffleState extends PublicRaffleState {
  readonly hostKey: string | null;
}

interface HostRequest {
  readonly hostKey: string;
}

interface JoinRequest {
  readonly id: string;
  readonly name: string;
}

interface EnvWithRaffleRoom {
  readonly RAFFLE_ROOM: DurableObjectNamespace;
}

interface DurableObjectNamespace {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): DurableObjectStub;
}

interface DurableObjectId {}

interface DurableObjectStub {
  fetch(request: Request): Promise<Response>;
}

interface DurableObjectState {
  readonly storage: DurableObjectStorage;
}

interface DurableObjectStorage {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
}

interface DurableObjectWebSocket extends WebSocket {
  accept(): void;
}

declare const WebSocketPair: {
  new (): {
    readonly 0: WebSocket;
    readonly 1: DurableObjectWebSocket;
  };
};

const defaultRoomName = "future-frontend-may-2026";
const storageKey = "raffle-state";
const jsonHeaders = { "content-type": "application/json; charset=utf-8" };
const maxNameLength = 60;

export function hasRaffleRoom(env: unknown): env is EnvWithRaffleRoom {
  return (
    typeof env === "object" && env !== null && "RAFFLE_ROOM" in env && typeof (env as { RAFFLE_ROOM?: unknown }).RAFFLE_ROOM === "object"
  );
}

export async function routeRaffleRequest(request: Request, env: EnvWithRaffleRoom): Promise<Response> {
  const url = new URL(request.url);
  const roomName = normalizeRoomName(url.searchParams.get("room") ?? defaultRoomName);
  const roomId = env.RAFFLE_ROOM.idFromName(roomName);
  return await env.RAFFLE_ROOM.get(roomId).fetch(request);
}

export class RaffleRoom {
  private readonly state: DurableObjectState;
  private readonly sockets = new Set<WebSocket>();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/raffle/state") {
      return jsonResponse(await this.publicState());
    }

    if (request.method === "GET" && url.pathname === "/api/raffle/ws") {
      return this.handleSocket();
    }

    if (request.method === "POST" && url.pathname === "/api/raffle/claim-host") {
      return await this.claimHost(request);
    }

    if (request.method === "POST" && url.pathname === "/api/raffle/join") {
      return await this.join(request);
    }

    if (request.method === "POST" && url.pathname === "/api/raffle/draw") {
      return await this.draw(request);
    }

    if (request.method === "POST" && url.pathname === "/api/raffle/reset") {
      return await this.reset(request);
    }

    return jsonResponse({ error: "Not found" }, 404);
  }

  /* v8 ignore start */
  private handleSocket(): Response {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();
    this.sockets.add(server);
    server.addEventListener("close", () => this.sockets.delete(server));
    server.addEventListener("error", () => this.sockets.delete(server));
    void this.publicState().then((state) => this.send(server, state));

    return new Response(null, {
      status: 101,
      webSocket: client,
    } as ResponseInit & { webSocket: WebSocket });
  }

  private async claimHost(request: Request): Promise<Response> {
    const body = await readJson<HostRequest>(request);
    if (!isHostRequest(body)) {
      return jsonResponse({ error: "Host key is required" }, 400);
    }

    const state = await this.storedState();
    if (state.hostKey !== null && state.hostKey !== body.hostKey) {
      return jsonResponse({ error: "Host already claimed" }, 409);
    }

    const next = {
      ...state,
      hostClaimed: true,
      registrationOpen: true,
      hostKey: body.hostKey,
      lastUpdatedAt: new Date().toISOString(),
    };

    await this.saveAndBroadcast(next);
    return jsonResponse(publicFromStored(next));
  }

  private async join(request: Request): Promise<Response> {
    const body = await readJson<JoinRequest>(request);
    if (!isJoinRequest(body)) {
      return jsonResponse({ error: "Name and participant id are required" }, 400);
    }

    const state = await this.storedState();
    if (!state.hostClaimed || !state.registrationOpen) {
      return jsonResponse({ error: "Registration is not open" }, 409);
    }

    const participant: RaffleParticipant = {
      id: body.id,
      name: normalizeName(body.name),
      joinedAt: new Date().toISOString(),
    };
    const participants = state.participants.some((entry) => entry.id === participant.id)
      ? state.participants.map((entry) => (entry.id === participant.id ? participant : entry))
      : [...state.participants, participant];

    const next = {
      ...state,
      participants,
      winner: state.winner?.id === participant.id ? participant : state.winner,
      lastUpdatedAt: new Date().toISOString(),
    };

    await this.saveAndBroadcast(next);
    return jsonResponse(publicFromStored(next));
  }

  private async draw(request: Request): Promise<Response> {
    const state = await this.requireHost(request);
    if (state instanceof Response) {
      return state;
    }

    if (state.participants.length === 0) {
      return jsonResponse({ error: "No participants registered" }, 409);
    }

    const winner = state.participants[Math.floor(Math.random() * state.participants.length)] as RaffleParticipant;

    const next = {
      ...state,
      registrationOpen: false,
      winner,
      lastUpdatedAt: new Date().toISOString(),
    };

    await this.saveAndBroadcast(next);
    return jsonResponse(publicFromStored(next));
  }

  private async reset(request: Request): Promise<Response> {
    const state = await this.requireHost(request);
    if (state instanceof Response) {
      return state;
    }

    const next = {
      ...emptyState(),
      hostClaimed: true,
      registrationOpen: true,
      hostKey: state.hostKey,
      lastUpdatedAt: new Date().toISOString(),
    };

    await this.saveAndBroadcast(next);
    return jsonResponse(publicFromStored(next));
  }

  private async requireHost(request: Request): Promise<StoredRaffleState | Response> {
    const body = await readJson<HostRequest>(request);
    if (!isHostRequest(body)) {
      return jsonResponse({ error: "Host key is required" }, 400);
    }

    const state = await this.storedState();
    if (state.hostKey !== body.hostKey) {
      return jsonResponse({ error: "Host control is required" }, 403);
    }

    return state;
  }

  private async publicState(): Promise<PublicRaffleState> {
    return publicFromStored(await this.storedState());
  }

  private async storedState(): Promise<StoredRaffleState> {
    return (await this.state.storage.get<StoredRaffleState>(storageKey)) ?? emptyState();
  }

  private async saveAndBroadcast(state: StoredRaffleState): Promise<void> {
    await this.state.storage.put(storageKey, state);
    const publicState = publicFromStored(state);
    for (const socket of this.sockets) {
      this.send(socket, publicState);
    }
  }

  private send(socket: WebSocket, state: PublicRaffleState): void {
    try {
      socket.send(JSON.stringify({ type: "state", state }));
    } catch {
      this.sockets.delete(socket);
    }
  }
  /* v8 ignore stop */
}

function emptyState(): StoredRaffleState {
  return {
    hostClaimed: false,
    registrationOpen: false,
    participants: [],
    winner: null,
    hostKey: null,
    lastUpdatedAt: new Date(0).toISOString(),
  };
}

function publicFromStored(state: StoredRaffleState): PublicRaffleState {
  return {
    hostClaimed: state.hostClaimed,
    registrationOpen: state.registrationOpen,
    participants: state.participants,
    winner: state.winner,
    lastUpdatedAt: state.lastUpdatedAt,
  };
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function isHostRequest(value: unknown): value is HostRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as HostRequest).hostKey === "string" &&
    (value as HostRequest).hostKey.length >= 16
  );
}

function isJoinRequest(value: unknown): value is JoinRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as JoinRequest).id === "string" &&
    typeof (value as JoinRequest).name === "string" &&
    normalizeName((value as JoinRequest).name) !== ""
  );
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, maxNameLength);
}

function normalizeRoomName(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || defaultRoomName;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}
