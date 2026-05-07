import { escapeHtml } from "./shared";

const appTitle = "Future Frontend Ticket Raffle";
const appDescription = "A live room for claiming host control, opening mobile registration, and drawing one ticket winner.";

export function renderHomePage(routes: Array<{ path: string; purpose: string }>): string {
  const routeList = routes
    .map(
      (route) =>
        `<li class="flex items-start justify-between gap-4 border-t border-sky-700/20 py-3">
          <div>
            <a class="font-mono text-xs font-semibold text-blue-800 underline-offset-4 hover:underline" href="${escapeHtml(route.path)}">${escapeHtml(route.path)}</a>
            <p class="mt-1 text-sm leading-6 text-zinc-700">${escapeHtml(route.purpose)}</p>
          </div>
        </li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(appTitle)}</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body class="min-h-screen bg-app-canvas text-app-text antialiased">
    <main class="min-h-screen overflow-hidden">
      <section class="mx-auto grid w-[min(76rem,calc(100vw-1.25rem))] gap-5 py-5 lg:grid-cols-[1.05fr_0.95fr] lg:py-8">
        <div class="relative overflow-hidden rounded-lg border border-slate-950/25 bg-[linear-gradient(135deg,#10131f,#0047ff_28%,#00a878_52%,#ff006e_76%,#ffd60a)] p-5 text-white shadow-panel sm:p-7">
          <div class="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#00d5ff,#7c3aed,#ff006e,#ffd60a,#00c853)]"></div>
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(255,255,255,0.22),transparent_18rem),linear-gradient(135deg,rgba(16,19,31,0.12),rgba(16,19,31,0.64))]"></div>
          <div class="relative grid gap-6 xl:grid-cols-[1fr_17rem]">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100">Meetabit May 2026</p>
              <h1 class="mt-4 max-w-[12ch] text-5xl font-black leading-[0.95] sm:text-7xl">${escapeHtml(appTitle)}</h1>
              <p class="mt-5 max-w-2xl text-lg leading-8 text-white/90">${escapeHtml(appDescription)}</p>
            </div>
            <div class="rounded-lg border border-white/30 bg-slate-950/24 p-4 backdrop-blur">
              <svg viewBox="0 0 220 220" class="mx-auto aspect-square w-full max-w-[15rem]" role="img" aria-label="Raffle pressure gauge">
                <circle cx="110" cy="110" r="96" fill="#10131f" stroke="#00d5ff" stroke-width="8"></circle>
                <circle cx="110" cy="110" r="76" fill="#fff7cc" stroke="#7c3aed" stroke-width="3"></circle>
                <path d="M47 132a68 68 0 0 1 126-52" fill="none" stroke="#ff006e" stroke-width="10" stroke-linecap="round"></path>
                <path d="M73 70l74 74" stroke="#008f5f" stroke-width="8" stroke-linecap="round"></path>
                <circle cx="110" cy="110" r="12" fill="#ffd60a" stroke="#10131f" stroke-width="4"></circle>
                <g fill="#10131f" font-family="Georgia,serif" font-size="13" font-weight="700">
                  <text x="42" y="157">JOIN</text>
                  <text x="88" y="46">STEAM</text>
                  <text x="145" y="157">DRAW</text>
                </g>
              </svg>
              <dl class="grid grid-cols-2 gap-3 text-center">
                <div class="rounded-md border border-cyan-100/30 bg-white/12 p-3">
                  <dt class="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cyan-100">Entrants</dt>
                  <dd id="participant-count" class="mt-1 text-3xl font-black">0</dd>
                </div>
                <div class="rounded-md border border-fuchsia-100/30 bg-white/12 p-3">
                  <dt class="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-fuchsia-100">Status</dt>
                  <dd id="room-status" class="mt-2 text-sm font-bold">Idle</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div class="grid gap-5">
          <section class="rounded-lg border border-blue-950/15 bg-white/86 p-4 shadow-panel sm:p-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-700">Host Bridge</p>
                <h2 class="mt-1 text-2xl font-black">Control the raffle</h2>
              </div>
              <span id="connection-state" class="rounded-full border border-blue-900/15 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-800">Connecting</span>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <button id="claim-host" class="rounded-md border border-fuchsia-950/20 bg-fuchsia-600 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-fuchsia-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500">Take control</button>
              <button id="draw-winner" class="rounded-md border border-emerald-950/20 bg-emerald-600 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" disabled>Draw ticket</button>
              <button id="reset-raffle" class="rounded-md border border-blue-950/20 bg-blue-700 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" disabled>Reset</button>
            </div>
            <div class="mt-5 grid gap-4 md:grid-cols-[1fr_12rem]">
              <div class="rounded-md border border-blue-950/15 bg-cyan-50/75 p-4">
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Audience URL</p>
                <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input id="join-url" class="min-w-0 flex-1 rounded-md border border-blue-900/15 bg-white px-3 py-2 font-mono text-sm text-slate-950" readonly value="/">
                  <button id="copy-url" class="rounded-md border border-blue-950/15 bg-white px-4 py-2 text-sm font-bold text-blue-900 transition hover:bg-cyan-100">Copy</button>
                </div>
              </div>
              <div id="qr-panel" class="rounded-md border border-fuchsia-900/18 bg-white p-3 text-center opacity-55 transition">
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700">Scan to join</p>
                <div id="qr-code" class="mx-auto mt-2 grid aspect-square w-36 place-items-center rounded-md border border-slate-900/10 bg-white p-2" role="img" aria-label="Audience join QR code"></div>
                <p id="qr-caption" class="mt-2 text-xs font-bold text-slate-600">Take control to open</p>
              </div>
            </div>
            <p id="host-message" class="mt-4 min-h-6 text-sm font-semibold text-zinc-700"></p>
          </section>

          <section class="rounded-lg border border-lime-950/15 bg-lime-50/90 p-4 shadow-panel sm:p-5">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Audience Valve</p>
            <h2 class="mt-1 text-2xl font-black">Enter the ticket draw</h2>
            <form id="join-form" class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <label class="sr-only" for="participant-name">Your name</label>
              <input id="participant-name" name="name" maxlength="60" autocomplete="name" class="rounded-md border border-emerald-950/15 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/25" placeholder="Your name" required>
              <button class="rounded-md border border-yellow-950/20 bg-yellow-300 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400" type="submit">Register</button>
            </form>
            <p id="join-message" class="mt-4 min-h-6 text-sm font-semibold text-zinc-700"></p>
          </section>
        </div>

        <section class="rounded-lg border border-blue-950/15 bg-white/86 p-4 shadow-panel sm:p-5 lg:col-span-2">
          <div class="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div class="rounded-lg border border-fuchsia-950/15 bg-fuchsia-50/70 p-4">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-700">Winner Chamber</p>
              <div id="winner-panel" class="mt-4 min-h-[8rem] rounded-md border border-dashed border-fuchsia-900/25 bg-white/80 p-5">
                <p class="text-3xl font-black text-slate-950">No ticket drawn yet</p>
                <p class="mt-2 text-sm leading-6 text-slate-700">The winning name will lock in here when the host pulls the lever.</p>
              </div>
            </div>
            <div>
              <div class="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Manifest</p>
                  <h2 class="mt-1 text-2xl font-black">Registered entrants</h2>
                </div>
                <span id="last-updated" class="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Waiting</span>
              </div>
              <ol id="participant-list" class="grid max-h-[22rem] gap-2 overflow-auto pr-1 sm:grid-cols-2 xl:grid-cols-3"></ol>
            </div>
          </div>
          <details class="mt-5 border-t border-blue-950/15 pt-4">
            <summary class="cursor-pointer text-sm font-bold text-zinc-700">Route index</summary>
            <ul class="mt-3">${routeList}</ul>
          </details>
        </section>
      </section>
    </main>
    <script>
      const state = {
        hostKey: localStorage.getItem("raffleHostKey") || "",
        participantId: localStorage.getItem("raffleParticipantId") || crypto.randomUUID(),
        isHost: false,
      };
      const roomParam = new URLSearchParams(location.search).get("room");
      const apiQuery = roomParam ? "?room=" + encodeURIComponent(roomParam) : "";
      localStorage.setItem("raffleParticipantId", state.participantId);

      const elements = {
        claimHost: document.querySelector("#claim-host"),
        drawWinner: document.querySelector("#draw-winner"),
        resetRaffle: document.querySelector("#reset-raffle"),
        connectionState: document.querySelector("#connection-state"),
        roomStatus: document.querySelector("#room-status"),
        participantCount: document.querySelector("#participant-count"),
        participantList: document.querySelector("#participant-list"),
        winnerPanel: document.querySelector("#winner-panel"),
        lastUpdated: document.querySelector("#last-updated"),
        hostMessage: document.querySelector("#host-message"),
        joinMessage: document.querySelector("#join-message"),
        joinForm: document.querySelector("#join-form"),
        participantName: document.querySelector("#participant-name"),
        joinUrl: document.querySelector("#join-url"),
        copyUrl: document.querySelector("#copy-url"),
        qrPanel: document.querySelector("#qr-panel"),
        qrCode: document.querySelector("#qr-code"),
        qrCaption: document.querySelector("#qr-caption"),
      };

      elements.joinUrl.value = location.href;
      renderQrCode(elements.joinUrl.value);

      function ensureHostKey() {
        if (!state.hostKey) {
          state.hostKey = crypto.randomUUID() + crypto.randomUUID();
          localStorage.setItem("raffleHostKey", state.hostKey);
        }
        return state.hostKey;
      }

      async function postJson(path, body) {
        const response = await fetch(path + apiQuery, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Request failed");
        }
        render(payload);
        return payload;
      }

      async function refresh() {
        const response = await fetch("/api/raffle/state" + apiQuery);
        if (response.ok) {
          render(await response.json());
        }
      }

      function connect() {
        const ws = new WebSocket(location.origin.replace(/^http/, "ws") + "/api/raffle/ws" + apiQuery);
        ws.addEventListener("open", () => {
          elements.connectionState.textContent = "Live";
        });
        ws.addEventListener("message", (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "state") {
            render(message.state);
          }
        });
        ws.addEventListener("close", () => {
          elements.connectionState.textContent = "Reconnecting";
          setTimeout(connect, 1200);
        });
        ws.addEventListener("error", () => {
          elements.connectionState.textContent = "Polling";
          void refresh();
        });
      }

      function render(room) {
        state.isHost = room.hostClaimed && state.hostKey.length >= 16;
        elements.participantCount.textContent = String(room.participants.length);
        elements.roomStatus.textContent = room.registrationOpen ? "Open" : room.hostClaimed ? "Locked" : "Idle";
        elements.drawWinner.disabled = !state.isHost || room.participants.length === 0;
        elements.resetRaffle.disabled = !state.isHost;
        elements.claimHost.textContent = state.isHost ? "Host claimed" : "Take control";
        elements.claimHost.disabled = state.isHost;
        elements.qrPanel.classList.toggle("opacity-55", !state.isHost);
        elements.qrCaption.textContent = state.isHost ? "Room open for phones" : "Take control to open";
        elements.lastUpdated.textContent = room.lastUpdatedAt.startsWith("1970") ? "Waiting" : new Date(room.lastUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        elements.participantList.innerHTML = room.participants.map((participant, index) => (
          '<li class="rounded-md border border-blue-950/12 bg-white/70 px-3 py-2">' +
            '<span class="font-mono text-xs text-blue-700">#' + String(index + 1).padStart(2, "0") + '</span>' +
            '<p class="truncate text-base font-black text-slate-950">' + escapeText(participant.name) + '</p>' +
          '</li>'
        )).join("") || '<li class="rounded-md border border-dashed border-blue-950/20 bg-white/50 px-3 py-4 text-sm font-semibold text-slate-600">No entrants yet</li>';

        if (room.winner) {
          elements.winnerPanel.innerHTML = '<p class="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700">Ticket goes to</p><p class="mt-2 break-words text-5xl font-black text-slate-950">' + escapeText(room.winner.name) + '</p>';
        } else {
          elements.winnerPanel.innerHTML = '<p class="text-3xl font-black text-slate-950">No ticket drawn yet</p><p class="mt-2 text-sm leading-6 text-slate-700">The winning name will lock in here when the host pulls the lever.</p>';
        }
      }

      function escapeText(value) {
        return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
      }

      function renderQrCode(text) {
        try {
          elements.qrCode.innerHTML = createQrSvg(text);
        } catch {
          elements.qrCode.innerHTML = '<span class="px-2 text-xs font-bold text-red-700">URL too long</span>';
        }
      }

      function createQrSvg(text) {
        const version = 6;
        const size = 41;
        const dataCodewords = 136;
        const blockSize = 68;
        const eccSize = 18;
        const bytes = Array.from(new TextEncoder().encode(text));
        if (bytes.length > 134) {
          throw new Error("QR input too long");
        }

        const data = makeQrData(bytes, dataCodewords);
        const codewords = interleaveBlocks([data.slice(0, blockSize), data.slice(blockSize)], eccSize);
        let best = null;

        for (let mask = 0; mask < 8; mask += 1) {
          const qr = makeBlankQr(size);
          drawFunctionPatterns(qr, version);
          drawCodewords(qr, codewords, mask);
          drawFormatBits(qr, mask);
          const score = scoreQr(qr.modules);
          if (!best || score < best.score) {
            best = { modules: qr.modules, score };
          }
        }

        const quiet = 4;
        const cell = 1;
        const viewSize = size + quiet * 2;
        const rects = [];
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            if (best.modules[y][x]) {
              rects.push('<rect x="' + (x + quiet) + '" y="' + (y + quiet) + '" width="' + cell + '" height="' + cell + '"/>');
            }
          }
        }
        return '<svg viewBox="0 0 ' + viewSize + " " + viewSize + '" class="h-full w-full" aria-hidden="true"><rect width="' + viewSize + '" height="' + viewSize + '" fill="#fff"/><g fill="#10131f">' + rects.join("") + "</g></svg>";
      }

      function makeQrData(bytes, dataCodewords) {
        const bits = [0, 1, 0, 0];
        appendBits(bits, bytes.length, 8);
        for (const byte of bytes) {
          appendBits(bits, byte, 8);
        }
        const capacity = dataCodewords * 8;
        appendBits(bits, 0, Math.min(4, capacity - bits.length));
        while (bits.length % 8 !== 0) {
          bits.push(0);
        }
        const data = [];
        for (let i = 0; i < bits.length; i += 8) {
          data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
        }
        for (let pad = 0; data.length < dataCodewords; pad += 1) {
          data.push(pad % 2 === 0 ? 0xec : 0x11);
        }
        return data;
      }

      function appendBits(bits, value, length) {
        for (let i = length - 1; i >= 0; i -= 1) {
          bits.push((value >>> i) & 1);
        }
      }

      function interleaveBlocks(blocks, eccSize) {
        const eccBlocks = blocks.map((block) => reedSolomonRemainder(block, eccSize));
        const result = [];
        for (let i = 0; i < blocks[0].length; i += 1) {
          for (const block of blocks) {
            result.push(block[i]);
          }
        }
        for (let i = 0; i < eccSize; i += 1) {
          for (const block of eccBlocks) {
            result.push(block[i]);
          }
        }
        return result;
      }

      function reedSolomonRemainder(data, degree) {
        const generator = reedSolomonGenerator(degree);
        const result = Array(degree).fill(0);
        for (const byte of data) {
          const factor = byte ^ result.shift();
          result.push(0);
          for (let i = 0; i < degree; i += 1) {
            result[i] ^= gfMultiply(generator[i], factor);
          }
        }
        return result;
      }

      function reedSolomonGenerator(degree) {
        let result = [1];
        for (let i = 0; i < degree; i += 1) {
          const next = Array(result.length + 1).fill(0);
          for (let j = 0; j < result.length; j += 1) {
            next[j] ^= gfMultiply(result[j], 1);
            next[j + 1] ^= gfMultiply(result[j], gfPow(2, i));
          }
          result = next;
        }
        return result.slice(1);
      }

      function gfPow(value, power) {
        let result = 1;
        for (let i = 0; i < power; i += 1) {
          result = gfMultiply(result, value);
        }
        return result;
      }

      function gfMultiply(left, right) {
        let result = 0;
        for (let i = 7; i >= 0; i -= 1) {
          result = (result << 1) ^ ((result >>> 7) * 0x11d);
          result ^= ((right >>> i) & 1) * left;
        }
        return result & 0xff;
      }

      function makeBlankQr(size) {
        return {
          modules: Array.from({ length: size }, () => Array(size).fill(false)),
          reserved: Array.from({ length: size }, () => Array(size).fill(false)),
        };
      }

      function setFunction(qr, x, y, dark) {
        if (x < 0 || y < 0 || y >= qr.modules.length || x >= qr.modules.length) {
          return;
        }
        qr.modules[y][x] = dark;
        qr.reserved[y][x] = true;
      }

      function drawFunctionPatterns(qr, version) {
        const size = qr.modules.length;
        drawFinder(qr, 3, 3);
        drawFinder(qr, size - 4, 3);
        drawFinder(qr, 3, size - 4);
        for (let i = 0; i < size; i += 1) {
          setFunction(qr, 6, i, i % 2 === 0);
          setFunction(qr, i, 6, i % 2 === 0);
        }
        drawAlignment(qr, size - 7, size - 7);
        setFunction(qr, 8, version * 4 + 9, true);
        for (let i = 0; i < 9; i += 1) {
          setFunction(qr, 8, i, false);
          setFunction(qr, i, 8, false);
        }
        for (let i = 0; i < 8; i += 1) {
          setFunction(qr, size - 1 - i, 8, false);
          setFunction(qr, 8, size - 1 - i, false);
        }
      }

      function drawFinder(qr, cx, cy) {
        for (let y = -4; y <= 4; y += 1) {
          for (let x = -4; x <= 4; x += 1) {
            const distance = Math.max(Math.abs(x), Math.abs(y));
            setFunction(qr, cx + x, cy + y, distance !== 4 && distance !== 2);
          }
        }
      }

      function drawAlignment(qr, cx, cy) {
        for (let y = -2; y <= 2; y += 1) {
          for (let x = -2; x <= 2; x += 1) {
            setFunction(qr, cx + x, cy + y, Math.max(Math.abs(x), Math.abs(y)) !== 1);
          }
        }
      }

      function drawCodewords(qr, codewords, mask) {
        const bits = [];
        for (const byte of codewords) {
          appendBits(bits, byte, 8);
        }
        let bitIndex = 0;
        let upward = true;
        const size = qr.modules.length;
        for (let right = size - 1; right >= 1; right -= 2) {
          if (right === 6) {
            right -= 1;
          }
          for (let vert = 0; vert < size; vert += 1) {
            const y = upward ? size - 1 - vert : vert;
            for (let dx = 0; dx < 2; dx += 1) {
              const x = right - dx;
              if (!qr.reserved[y][x] && bitIndex < bits.length) {
                qr.modules[y][x] = bits[bitIndex] === 1;
                if (maskApplies(mask, x, y)) {
                  qr.modules[y][x] = !qr.modules[y][x];
                }
                bitIndex += 1;
              }
            }
          }
          upward = !upward;
        }
      }

      function maskApplies(mask, x, y) {
        return [
          (x + y) % 2 === 0,
          y % 2 === 0,
          x % 3 === 0,
          (x + y) % 3 === 0,
          (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
          ((x * y) % 2) + ((x * y) % 3) === 0,
          (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
          (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
        ][mask];
      }

      function drawFormatBits(qr, mask) {
        const size = qr.modules.length;
        const bits = formatBits(mask);
        for (let i = 0; i <= 5; i += 1) setFunction(qr, 8, i, getBit(bits, i));
        setFunction(qr, 8, 7, getBit(bits, 6));
        setFunction(qr, 8, 8, getBit(bits, 7));
        setFunction(qr, 7, 8, getBit(bits, 8));
        for (let i = 9; i < 15; i += 1) setFunction(qr, 14 - i, 8, getBit(bits, i));
        for (let i = 0; i < 8; i += 1) setFunction(qr, size - 1 - i, 8, getBit(bits, i));
        for (let i = 8; i < 15; i += 1) setFunction(qr, 8, size - 15 + i, getBit(bits, i));
        setFunction(qr, 8, size - 8, true);
      }

      function formatBits(mask) {
        const data = (1 << 3) | mask;
        let remainder = data;
        for (let i = 0; i < 10; i += 1) {
          remainder = (remainder << 1) ^ (((remainder >>> 9) & 1) * 0x537);
        }
        return ((data << 10) | (remainder & 0x3ff)) ^ 0x5412;
      }

      function getBit(value, index) {
        return ((value >>> index) & 1) === 1;
      }

      function scoreQr(modules) {
        const size = modules.length;
        let penalty = 0;
        for (let y = 0; y < size; y += 1) penalty += scoreRun(modules[y]);
        for (let x = 0; x < size; x += 1) penalty += scoreRun(modules.map((row) => row[x]));
        for (let y = 0; y < size - 1; y += 1) {
          for (let x = 0; x < size - 1; x += 1) {
            const color = modules[y][x];
            if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) penalty += 3;
          }
        }
        const dark = modules.flat().filter(Boolean).length;
        penalty += Math.floor(Math.abs((dark * 20) / (size * size) - 10)) * 10;
        return penalty;
      }

      function scoreRun(line) {
        let penalty = 0;
        let runColor = line[0];
        let runLength = 1;
        for (let i = 1; i <= line.length; i += 1) {
          if (line[i] === runColor) {
            runLength += 1;
          } else {
            if (runLength >= 5) penalty += runLength - 2;
            runColor = line[i];
            runLength = 1;
          }
        }
        return penalty;
      }

      elements.claimHost.addEventListener("click", async () => {
        elements.hostMessage.textContent = "Claiming the host bridge...";
        try {
          await postJson("/api/raffle/claim-host", { hostKey: ensureHostKey() });
          elements.hostMessage.textContent = "Host control is active. Registration is open.";
        } catch (error) {
          elements.hostMessage.textContent = error.message;
        }
      });

      elements.drawWinner.addEventListener("click", async () => {
        elements.hostMessage.textContent = "Drawing...";
        try {
          await postJson("/api/raffle/draw", { hostKey: ensureHostKey() });
          elements.hostMessage.textContent = "Winner drawn. Registration is locked.";
        } catch (error) {
          elements.hostMessage.textContent = error.message;
        }
      });

      elements.resetRaffle.addEventListener("click", async () => {
        elements.hostMessage.textContent = "Resetting...";
        try {
          await postJson("/api/raffle/reset", { hostKey: ensureHostKey() });
          elements.hostMessage.textContent = "Fresh raffle ready.";
        } catch (error) {
          elements.hostMessage.textContent = error.message;
        }
      });

      elements.joinForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        elements.joinMessage.textContent = "Registering...";
        try {
          await postJson("/api/raffle/join", { id: state.participantId, name: elements.participantName.value });
          elements.joinMessage.textContent = "You are in the draw.";
        } catch (error) {
          elements.joinMessage.textContent = error.message;
        }
      });

      elements.copyUrl.addEventListener("click", async () => {
        await navigator.clipboard.writeText(elements.joinUrl.value);
        elements.hostMessage.textContent = "Audience URL copied.";
      });

      connect();
      void refresh();
    </script>
  </body>
</html>`;
}
