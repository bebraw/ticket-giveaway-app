# ADR-020: Use a Durable Object for the Raffle Room

## Status

Accepted

## Context

The meetup raffle needs shared state across the host display and attendee phones. Browser-only state would not synchronize devices, and adding a separate realtime service would make the template heavier than this single-room app requires.

## Decision

Use a named Cloudflare Durable Object, `RaffleRoom`, as the authoritative raffle room. The Worker routes `/api/raffle/*` requests to that object, using `future-frontend-may-2026` as the default room name and a normalized `room` URL parameter for rehearsals or repeated runs. The object stores public room state plus the private host key in Durable Object storage.

The object also owns WebSocket fanout for public state updates so connected host and audience browsers see changes without polling.

## Consequences

- The app now requires the `RAFFLE_ROOM` Durable Object binding configured in `wrangler.jsonc`.
- Local and deployed Worker behavior can share the same source-level implementation without extra dependencies.
- Host control is a lightweight first-claim mechanism backed by a local-storage key, not a full authentication system.
- Future multi-room raffles or stronger access control should update this ADR or create a superseding one.
