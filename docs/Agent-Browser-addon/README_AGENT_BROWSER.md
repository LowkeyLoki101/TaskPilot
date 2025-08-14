# Agent Browser Add-on (Playwright)
This adds a server-driven browser so your UI can truly navigate, click, type, and extract like an OpenAI Agent.

## 1) Install dependencies
```bash
pnpm add playwright ws
# install Chromium with system deps (works on Replit/Nix)
npx playwright install --with-deps chromium
```

> No paid subscription is required for Playwright. Replit may need "Boost" or "Always On" for long sessions, but it's optional.

## 2) Add files
Place these in your repo:
```
server/agentBrowser.ts
server/agentBrowserRoutes.ts
```

## 3) Wire routes
In `server/routes.ts` (or wherever you register routes):
```ts
import { registerAgentBrowserRoutes } from "./agentBrowserRoutes";
export function registerRoutes(app: Express) {
  // ... your existing routes
  registerAgentBrowserRoutes(app);
}
```

## 4) Package scripts (optional)
In `package.json` ensure you have:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

## 5) Client wiring (example)
Create a session on mount:
```ts
const [sessionId, setSessionId] = useState<string>();
useEffect(() => {
  fetch("/api/agent-browser/sessions", { method: "POST" })
    .then(r => r.json()).then(d => setSessionId(d.id));
}, []);
```

Navigate + screenshot:
```ts
async function agent(action: any) {
  if (!sessionId) throw new Error("No session");
  const r = await fetch(`/api/agent-browser/${sessionId}/actions`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action)
  });
  return r.json();
}

async function navigate(url: string) {
  await agent({ type: "navigate", url });
  const shot = await agent({ type: "screenshot" });
  setTabs(t => t.map(tab => tab.id === activeTabId ? { ...tab, content: shot.imageBase64, isLoading: false } : tab));
}
```

"AI Assist" example flow:
```ts
await agent({ type: "navigate", url: "https://www.google.com" });
await agent({ type: "waitFor", selector: "input[name='q']" });
await agent({ type: "type", selector: "input[name='q']", text: "Starlight Solar Houston" });
await agent({ type: "press", key: "Enter" });
await agent({ type: "waitFor", selector: "a h3" });
await agent({ type: "click", selector: "a h3", nth: 0 });
const shot = await agent({ type: "screenshot" });
```

## 6) Safe Mode
Default deny list blocks banking/checkout and Facebook. Modify `allow/deny` in `createSession()`.

## 7) Replit Notes
- After `pnpm add playwright`, run `npx playwright install --with-deps chromium`.
- If storage is limited, install only chromium (as above).
- Long-running sessions may sleep on free tiers; resume by creating a new session.

## 8) Test locally
```bash
pnpm dev
# POST http://localhost:3000/api/agent-browser/sessions
# POST http://localhost:3000/api/agent-browser/:id/actions  body: { "type": "navigate", "url": "example.com" }
```

## 9) Minimal health check
Add a simple test later with Vitest + Supertest if desired.
```ts
// server/agentBrowser.smoke.test.ts
// (pseudo) assert 200 on creating session and navigating
```
