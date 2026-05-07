export const exampleRoutes = [
  { path: "/", purpose: "Multiplayer raffle room for host control and audience registration" },
  { path: "/api/health", purpose: "JSON health endpoint for tooling and smoke tests" },
  { path: "/api/raffle/state", purpose: "Current raffle state" },
  { path: "/api/raffle/join", purpose: "Audience registration endpoint" },
  { path: "/api/raffle/claim-host", purpose: "Host control claim endpoint" },
  { path: "/api/raffle/draw", purpose: "Host-only winner draw endpoint" },
  { path: "/api/raffle/reset", purpose: "Host-only raffle reset endpoint" },
  { path: "/api/raffle/ws", purpose: "Live raffle state updates" },
];
