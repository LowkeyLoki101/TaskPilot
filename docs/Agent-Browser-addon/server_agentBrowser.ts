// server/agentBrowser.ts
import { chromium, Browser, Page } from "playwright";
import crypto from "crypto";

type Session = {
  id: string;
  page: Page;
  createdAt: number;
  lastAction: number;
  allow: RegExp[];
  deny: RegExp[];
};

export type Action =
  | { type: "navigate"; url: string }
  | { type: "click"; selector: string; nth?: number }
  | { type: "type"; selector: string; text: string; delayMs?: number }
  | { type: "press"; selector?: string; key: string }
  | { type: "waitFor"; selector?: string; timeoutMs?: number }
  | { type: "extract"; selector?: string }
  | { type: "scroll"; to: "top" | "bottom" }
  | { type: "screenshot"; fullPage?: boolean };

const sessions = new Map<string, Session>();
let browser: Browser | null = null;

export async function initAgentBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

function normalizeUrl(u: string) {
  if (!/^https?:\/\//i.test(u)) return "https://" + u;
  return u;
}

function urlAllowed(s: Session, url: string) {
  const u = new URL(url);
  if (s.deny.some((r) => r.test(u.hostname + u.pathname))) return false;
  return s.allow.some((r) => r.test(u.hostname + u.pathname));
}

export async function createSession() {
  const b = await initAgentBrowser();
  const ctx = await b!.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    page,
    createdAt: Date.now(),
    lastAction: Date.now(),
    allow: [/.*/i],
    deny: [/facebook\.com/i, /bank|paypal|stripe|checkout/i],
  };
  sessions.set(id, session);
  return { id };
}

export async function destroySession(id: string) {
  const s = sessions.get(id);
  if (s) {
    await s.page.context().close();
    sessions.delete(id);
  }
  return { ok: true };
}

export async function runAction(id: string, action: Action) {
  const s = sessions.get(id);
  if (!s) throw new Error("Invalid session id");
  s.lastAction = Date.now();
  const p = s.page;

  switch (action.type) {
    case "navigate": {
      const url = normalizeUrl(action.url);
      if (!urlAllowed(s, url)) throw new Error("URL blocked by Safe Mode");
      const resp = await p.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      return { ok: true, url: p.url(), status: resp?.status() ?? null };
    }
    case "click": {
      const locator = p.locator(action.selector);
      const target = action.nth != null ? locator.nth(action.nth) : locator.first();
      await target.click({ timeout: 15000 });
      return { ok: true };
    }
    case "type": {
      const locator = p.locator(action.selector).first();
      await locator.fill("");
      await locator.type(action.text, { delay: action.delayMs ?? 20 });
      return { ok: true };
    }
    case "press": {
      if (action.selector) {
        await p.locator(action.selector).first().press(action.key);
      } else {
        await p.keyboard.press(action.key);
      }
      return { ok: true };
    }
    case "waitFor": {
      if (action.selector) {
        await p.locator(action.selector).first().waitFor({
          timeout: action.timeoutMs ?? 15000,
        });
      } else {
        await p.waitForTimeout(action.timeoutMs ?? 500);
      }
      return { ok: true };
    }
    case "extract": {
      if (action.selector) {
        const txt = await p.locator(action.selector).first().innerText().catch(() => "");
        return { ok: true, text: txt };
      } else {
        const html = await p.content();
        return { ok: true, html };
      }
    }
    case "scroll": {
      if (action.to === "top") {
        await p.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" as any }));
      } else {
        await p.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" as any }));
      }
      return { ok: true };
    }
    case "screenshot": {
      const buf = await p.screenshot({ fullPage: !!action.fullPage });
      return { ok: true, imageBase64: buf.toString("base64") };
    }
  }
}
