# Invisible Break

> A checkout page that looks perfect — but Kane CLI catches what screenshots miss.

Built for the **Kane CLI Online Hackathon**. This project demonstrates a **Closed Loop** interaction between an AI coding agent and Kane CLI: the agent writes code, Kane verifies it with DevTools assertions (console errors, 5xx network errors), and the watcher feeds failures back to the agent for fixing.

## The Problem

Visual regression tests (screenshots) catch what users *see*. They miss what users *experience*: silent console errors, failed background API calls, and degraded features that look fine but are broken underneath. These are **invisible breaks** — bugs that ship to production because they don't affect the screenshot.

## The Solution

**Invisible Break** seeds two such breaks in a store checkout page:

1. **Console error**: The checkout page tries to read `window.__APP_CONFIG__.featureFlags` which is undefined. The page renders fine (graceful degradation), but the console fills with errors.
2. **Silent 500**: The checkout page fetches `/api/shipping-rates` which returns 500 (misconfigured shipping service URL). The page falls back to a default rate, so the user never notices. But the network tab shows a 500.

A screenshot test passes. Kane CLI catches both.

## The Closed Loop

```
📝 Code change
  → 👁️ Watcher detects (file save)
  → 🧪 Kane runs flows (DevTools assertions)
  → 📋 failure.md generated (agent-ready report)
  → 🤖 Agent reads + fixes
  → 💾 Save triggers re-run
  → ✅ Green
```

1. The **watcher** monitors `src/` for file changes.
2. On save, it runs `kane-cli testmd run` against the local app.
3. Kane executes the test flow with DevTools assertions — checking for console errors and 5xx responses.
4. If breaks are found, the watcher generates `watcher-output/failure.md` — a structured report with evidence (console error excerpts, HTTP status codes, step numbers).
5. The agent reads `failure.md`, patches the code, and saves.
6. The save triggers another Kane run. If the fix works, the dashboard goes green.

## Demo

### Live URLs

- **Store**: https://invisible-break.vercel.app
- **Dashboard**: https://invisible-break.vercel.app/dashboard

### Demo Script (90 seconds)

1. **Open the store** (https://invisible-break.vercel.app) — browse products, add to cart, go to checkout. Everything looks perfect. A screenshot test would pass.

2. **Open the dashboard** (https://invisible-break.vercel.app/dashboard) — the dashboard shows the red state from the last Kane run. Two invisible breaks are detected:
   - `http_error_response`: GET /api/shipping-rates → 500
   - `console_error`: [Checkout] Failed to load feature flags

3. **See both states** — the dashboard has links to:
   - 🔴 **Broken store** (`/?breaks=true`) — invisible breaks active
   - 🟢 **Fixed store** (`/`) — breaks resolved by the agent
   
   Both pages look identical. The difference is invisible — only Kane CLI catches it.

4. **Read the failure report** — `watcher-output/failure.md` contains the structured evidence the agent needs to fix the code.

5. **Agent fixes the code** — the agent reads the failure report, patches `LandingClient.tsx` (handles missing config safely) and `shipping-rates/route.ts` (returns a valid response), and saves.

6. **Watcher re-runs Kane** — the save triggers a new run. The dashboard goes green. Both breaks are fixed.

## Architecture

```
invisible-break/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Store homepage
│   │   ├── cart/page.tsx             # Cart page
│   │   ├── checkout/
│   │   │   ├── page.tsx              # Checkout page (server)
│   │   │   └── CheckoutForm.tsx      # Checkout form (client, has invisible breaks)
│   │   ├── confirmation/page.tsx     # Order confirmation
│   │   ├── dashboard/page.tsx        # Verification dashboard UI
│   │   └── api/
│   │       ├── shipping-rates/route.ts  # Returns 500 (invisible break #2)
│   │       └── watcher/
│   │           ├── run/route.ts      # POST: trigger Kane run
│   │           └── status/route.ts   # GET: current watcher state
│   └── lib/
│       ├── products.ts               # Product data
│       ├── cart.ts                   # Cart state (cookie-based)
│       ├── actions.ts                # Server actions
│       └── watcher/
│           ├── kane-watcher.ts       # Runs Kane, parses NDJSON, generates failure.md
│           ├── file-watcher.ts       # Monitors src/ for changes
│           ├── state-store.ts        # File-based state (survives Next.js dev reloads)
│           └── index.ts              # CLI entry point
├── kane-tests/
│   ├── checkout_flow_test.md         # Kane test flow with DevTools assertions
│   └── output-checkout_flow/         # Committed recordings (replayable at zero cost)
├── watcher-output/                   # Runtime output (failure.md, state.json)
└── .testmuai/evidence/               # Kane evidence packs
```

## Running Locally

### Prerequisites

- Node.js 22+
- Kane CLI (`npm install -g @testmuai/kane-cli`)
- Kane CLI account (login with `kane-cli login`)

### Setup

```bash
npm install
npm run dev          # Start the store on http://localhost:3000
```

### Run the watcher

```bash
# Run Kane verification once (replay mode — free, uses committed recordings)
npm run watch:run

# Run with fresh authoring (costs credits, but catches live breaks)
npm run watch:fresh

# Watch mode — re-runs Kane on every file save
npm run watch
```

### The closed loop

1. Start the dev server: `npm run dev`
2. Start the watcher: `npm run watch`
3. Open the dashboard: http://localhost:3000/dashboard
4. Edit any file in `src/` — the watcher detects the change and re-runs Kane
5. If breaks are found, `watcher-output/failure.md` is generated
6. The agent reads the report, fixes the code, saves — and the loop continues

## Kane Test Flow

The test flow (`kane-tests/checkout_flow_test.md`) has 4 steps:

1. **Open the store** — assert "QuantumStore" is visible, no console errors
2. **Add to cart** — assert cart page loads with items, no console errors
3. **Open checkout** — assert form is visible, **no console errors**, **no 5xx API calls** ← catches both breaks
4. **Submit checkout** — assert "Order Confirmed" appears

Steps 1-2 pass. Step 3 fails — Kane's DevTools assertions catch the console error and the 500. Step 4 is skipped.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Kane CLI** (DevTools assertions: console errors, network 5xx)
- **Tailwind CSS** (styling)
- **Vercel** (deployment)

## Credits

Built with [Devin](https://devin.ai) — an AI coding agent from Cognition.

Verified with [Kane CLI](https://kane.ai) — DevTools-aware test automation.
