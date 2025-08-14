# Agent Browser Documentation

## Overview
The Agent Browser provides server-side web automation capabilities using Playwright. It allows AI agents to interact with real web pages through actions like navigation, clicking, typing, and taking screenshots.

## Features
- **Browser Sessions**: Create and manage isolated browser sessions
- **Web Navigation**: Navigate to any URL
- **Element Interaction**: Click elements and type text
- **Screenshots**: Capture page screenshots as base64 images
- **Content Extraction**: Get page HTML content
- **Session Management**: Automatic cleanup of inactive sessions

## API Endpoints

### Create Session
```
POST /api/agent-browser/sessions
```
Creates a new browser session and returns a session ID.

**Response:**
```json
{
  "success": true,
  "id": "session-1234567890-abc123",
  "message": "Browser session created successfully"
}
```

### Destroy Session
```
DELETE /api/agent-browser/sessions/:id
```
Destroys a specific browser session.

### Perform Actions
```
POST /api/agent-browser/:id/actions
```
Performs actions on a browser session.

**Action Types:**

1. **Navigate**
```json
{
  "type": "navigate",
  "url": "https://example.com"
}
```

2. **Click**
```json
{
  "type": "click",
  "selector": "#button-id"
}
```

3. **Type**
```json
{
  "type": "type",
  "selector": "#input-field",
  "text": "Hello, World!"
}
```

4. **Screenshot**
```json
{
  "type": "screenshot"
}
```
Returns base64-encoded PNG image.

5. **Get Content**
```json
{
  "type": "getContent"
}
```
Returns the full HTML content of the page.

6. **Get Info**
```json
{
  "type": "getInfo"
}
```
Returns current URL and page title.

### Get Session Info
```
GET /api/agent-browser/sessions/:id
```
Gets information about a specific session.

## Usage Examples

### Create a session and navigate
```javascript
// Create session
const createRes = await fetch('/api/agent-browser/sessions', {
  method: 'POST'
});
const { id } = await createRes.json();

// Navigate to a website
await fetch(`/api/agent-browser/${id}/actions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'navigate',
    url: 'https://www.google.com'
  })
});

// Take a screenshot
const screenshotRes = await fetch(`/api/agent-browser/${id}/actions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'screenshot'
  })
});
const { imageBase64 } = await screenshotRes.json();
```

### Search on Google
```javascript
// Navigate to Google
await fetch(`/api/agent-browser/${id}/actions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'navigate',
    url: 'https://www.google.com'
  })
});

// Type in search box
await fetch(`/api/agent-browser/${id}/actions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'type',
    selector: 'input[name="q"]',
    text: 'OpenAI GPT-5'
  })
});

// Click search button
await fetch(`/api/agent-browser/${id}/actions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'click',
    selector: 'input[type="submit"]'
  })
});
```

## Security Considerations

1. **Authentication**: Add authentication middleware to protect endpoints
2. **URL Filtering**: Implement allow/deny lists for URLs
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Logging**: Log all actions for audit purposes
5. **Session Limits**: Limit the number of concurrent sessions per user

## Configuration

The agent browser can be configured through environment variables:

- `AGENT_BROWSER_TIMEOUT`: Session inactivity timeout (default: 10 minutes)
- `AGENT_BROWSER_HEADLESS`: Run browser in headless mode (default: true)
- `AGENT_BROWSER_MAX_SESSIONS`: Maximum concurrent sessions (default: 10)

## Troubleshooting

### Session not found
- Session may have expired due to inactivity
- Create a new session

### Element not found
- Ensure the selector is correct
- Add wait conditions for dynamic content
- Check if the page has loaded completely

### Screenshot is blank
- Page may not have finished loading
- Try adding a delay or wait for specific elements

### Browser launch fails
- Ensure Playwright dependencies are installed
- Run: `npx playwright install --with-deps chromium`
- Check system requirements for Chromium

## Integration with AI Agents

The Agent Browser can be integrated with AI agents to:
1. Research information from websites
2. Fill out forms automatically
3. Monitor web pages for changes
4. Extract structured data from websites
5. Automate web-based workflows

Example AI agent integration:
```javascript
class WebResearchAgent {
  async research(topic) {
    const sessionId = await this.createBrowserSession();
    
    // Navigate to search engine
    await this.browserAction(sessionId, {
      type: 'navigate',
      url: 'https://www.google.com'
    });
    
    // Search for topic
    await this.browserAction(sessionId, {
      type: 'type',
      selector: 'input[name="q"]',
      text: topic
    });
    
    // Get results
    const content = await this.browserAction(sessionId, {
      type: 'getContent'
    });
    
    // Process and return results
    return this.extractSearchResults(content);
  }
}
```