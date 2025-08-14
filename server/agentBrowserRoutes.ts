import { Express, Request, Response } from 'express';
import { agentBrowserManager } from './agentBrowser';

export function registerAgentBrowserRoutes(app: Express) {
  // Create a new browser session
  app.post('/api/agent-browser/sessions', async (req: Request, res: Response) => {
    try {
      const sessionId = await agentBrowserManager.createSession();
      res.json({ 
        success: true, 
        id: sessionId,
        message: 'Browser session created successfully'
      });
    } catch (error) {
      console.error('Error creating browser session:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create browser session' 
      });
    }
  });

  // Destroy a browser session
  app.delete('/api/agent-browser/sessions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await agentBrowserManager.destroySession(id);
      res.json({ 
        success: true, 
        message: 'Browser session destroyed successfully' 
      });
    } catch (error) {
      console.error('Error destroying browser session:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to destroy browser session' 
      });
    }
  });

  // Perform actions on a browser session
  app.post('/api/agent-browser/:id/actions', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { type, url, selector, text } = req.body;

      const session = agentBrowserManager.getSession(id);
      if (!session) {
        return res.status(404).json({ 
          success: false, 
          error: 'Session not found' 
        });
      }

      let result: any = { success: true };

      switch (type) {
        case 'navigate':
          if (!url) {
            return res.status(400).json({ 
              success: false, 
              error: 'URL is required for navigate action' 
            });
          }
          await agentBrowserManager.navigate(id, url);
          result.message = `Navigated to ${url}`;
          result.url = await agentBrowserManager.getPageUrl(id);
          result.title = await agentBrowserManager.getPageTitle(id);
          break;

        case 'click':
          if (!selector) {
            return res.status(400).json({ 
              success: false, 
              error: 'Selector is required for click action' 
            });
          }
          await agentBrowserManager.click(id, selector);
          result.message = `Clicked element: ${selector}`;
          break;

        case 'type':
          if (!selector || text === undefined) {
            return res.status(400).json({ 
              success: false, 
              error: 'Selector and text are required for type action' 
            });
          }
          await agentBrowserManager.type(id, selector, text);
          result.message = `Typed text into element: ${selector}`;
          break;

        case 'screenshot':
          const imageBase64 = await agentBrowserManager.screenshot(id);
          result.imageBase64 = imageBase64;
          result.message = 'Screenshot captured';
          break;

        case 'getContent':
          const content = await agentBrowserManager.getPageContent(id);
          result.content = content;
          result.message = 'Page content retrieved';
          break;

        case 'getInfo':
          result.url = await agentBrowserManager.getPageUrl(id);
          result.title = await agentBrowserManager.getPageTitle(id);
          result.message = 'Page info retrieved';
          break;

        default:
          return res.status(400).json({ 
            success: false, 
            error: `Unknown action type: ${type}` 
          });
      }

      res.json(result);
    } catch (error) {
      console.error('Error performing browser action:', error);
      res.status(500).json({ 
        success: false, 
        error: `Failed to perform action: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });

  // Get session info
  app.get('/api/agent-browser/sessions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const session = agentBrowserManager.getSession(id);
      
      if (!session) {
        return res.status(404).json({ 
          success: false, 
          error: 'Session not found' 
        });
      }

      const url = await agentBrowserManager.getPageUrl(id);
      const title = await agentBrowserManager.getPageTitle(id);

      res.json({
        success: true,
        session: {
          id: session.id,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          currentPage: {
            url,
            title
          }
        }
      });
    } catch (error) {
      console.error('Error getting session info:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get session info' 
      });
    }
  });

  console.log('Agent Browser routes registered');
}