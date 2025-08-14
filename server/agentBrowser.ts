import { chromium, Browser, Page, BrowserContext } from 'playwright';

interface BrowserSession {
  id: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  createdAt: Date;
  lastActivity: Date;
}

class AgentBrowserManager {
  private sessions: Map<string, BrowserSession> = new Map();
  private inactivityTimeout = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Clean up inactive sessions periodically
    setInterval(() => this.cleanupInactiveSessions(), 60000);
  }

  async createSession(id?: string): Promise<string> {
    const sessionId = id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      const page = await context.newPage();
      
      this.sessions.set(sessionId, {
        id: sessionId,
        browser,
        context,
        page,
        createdAt: new Date(),
        lastActivity: new Date()
      });
      
      console.log(`Created browser session: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error('Failed to create browser session:', error);
      throw error;
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        await session.browser.close();
        this.sessions.delete(sessionId);
        console.log(`Destroyed browser session: ${sessionId}`);
      } catch (error) {
        console.error(`Error destroying session ${sessionId}:`, error);
      }
    }
  }

  getSession(sessionId: string): BrowserSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
    return session;
  }

  async navigate(sessionId: string, url: string): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    await session.page.goto(url, { waitUntil: 'networkidle' });
  }

  async click(sessionId: string, selector: string): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    await session.page.click(selector);
  }

  async type(sessionId: string, selector: string, text: string): Promise<void> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    await session.page.fill(selector, text);
  }

  async screenshot(sessionId: string): Promise<string> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    const screenshot = await session.page.screenshot({ type: 'png' });
    return screenshot.toString('base64');
  }

  async getPageContent(sessionId: string): Promise<string> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    return await session.page.content();
  }

  async getPageTitle(sessionId: string): Promise<string> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    return await session.page.title();
  }

  async getPageUrl(sessionId: string): Promise<string> {
    const session = this.getSession(sessionId);
    if (!session) throw new Error('Session not found');
    
    return session.page.url();
  }

  private async cleanupInactiveSessions(): Promise<void> {
    const now = new Date();
    for (const [sessionId, session] of this.sessions) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime();
      if (inactiveTime > this.inactivityTimeout) {
        console.log(`Cleaning up inactive session: ${sessionId}`);
        await this.destroySession(sessionId);
      }
    }
  }

  async destroyAllSessions(): Promise<void> {
    for (const sessionId of this.sessions.keys()) {
      await this.destroySession(sessionId);
    }
  }
}

export const agentBrowserManager = new AgentBrowserManager();

// Cleanup on process exit
process.on('SIGINT', async () => {
  console.log('Cleaning up browser sessions...');
  await agentBrowserManager.destroyAllSessions();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cleaning up browser sessions...');
  await agentBrowserManager.destroyAllSessions();
  process.exit(0);
});