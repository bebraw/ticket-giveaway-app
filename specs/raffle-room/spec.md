# Feature: Raffle Room

## Blueprint

### Context

The app supports a meetup host who needs to raffle one ticket to an in-room audience. The host opens the app, claims control, shares the page URL, and attendees register from their phones before the host draws a winner.

### Architecture

- **Entry points:** `GET /` renders the raffle UI, and `/api/raffle/*` handles room state.
- **State model:** A named Durable Object room stores host status, registration status, participants, and the winner. The default room is `future-frontend-may-2026`; a `room` URL parameter can isolate rehearsals or repeated runs.
- **Host control:** The first browser to claim control stores a random host key in local storage. Host-only actions must present that key.
- **Audience registration:** Participants scan the displayed join QR code or open the audience URL, then submit a local participant id and display name. Re-registering from the same browser updates that participant record.
- **Live updates:** The room accepts WebSocket clients at `/api/raffle/ws` and broadcasts public state after every change.
- **Dependencies:** The feature uses Cloudflare Workers and Durable Objects only; it does not add client or server package dependencies.

### Anti-Patterns

- Do not move raffle state into browser-only storage; phones and host displays must share server state.
- Do not add heavyweight realtime infrastructure for this single-room meetup use case without a new ADR.
- Do not treat the local-storage host key as strong identity or attendee authentication.
- Do not expose the stored host key in public state responses or WebSocket payloads.

## Contract

### Definition of Done

- [ ] The root page shows host controls, audience registration, participant count, entrant list, and winner state.
- [ ] The host surface shows a QR code for the current audience URL.
- [ ] Registration is closed until a host claims control.
- [ ] Host-only draw and reset actions require the host key.
- [ ] Drawing a winner locks registration and broadcasts the winner.
- [ ] Reset keeps host control, clears entrants and winner, and reopens registration.
- [ ] Automated tests cover the room state transitions and visible browser flow.

### Regression Guardrails

- `GET /api/raffle/state` must never include the host key.
- `POST /api/raffle/join` must reject entries before host control opens registration.
- `POST /api/raffle/draw` must reject non-host requests.
- `POST /api/raffle/draw` must reject empty raffles.
- `GET /api/raffle/ws` must publish public room state to connected clients.

### Verification

- **Automated tests:** `src/api/raffle-room.test.ts`, `src/views/home.test.ts`, `src/worker.test.ts`, and `src/worker.e2e.ts`.
- **Quality gate:** Run `npm run quality:gate` and `npm run ci:local` before treating the change as ready.

### Scenarios

**Scenario: Host opens registration**

- Given: no host has claimed the room
- When: the host clicks `Take control`
- Then: the room records host control and opens registration

**Scenario: Audience member joins**

- Given: registration is open
- When: an attendee submits a display name
- Then: the entrant appears in the public participant list

**Scenario: Host draws**

- Given: at least one participant is registered
- When: the host draws a ticket
- Then: the room selects one winner, closes registration, and broadcasts the winner
