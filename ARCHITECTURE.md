# Emergent Intelligence - System Architecture

## High-Level Architecture Overview

The Emergent Intelligence system is a production-ready autonomous AI workstation that connects front-end UI components with back-end AI agents and workflow execution engines.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client (React/TypeScript)                 │
├─────────────────────────────────────────────────────────────────────┤
│  UI Components           │  Hooks & State        │  Shared Types    │
│  - WorkflowMindMap      │  - useWorkflow        │  - workflowTypes │
│  - ChatPane             │  - useWorkflowApi     │  - agentTypes    │
│  - AIBrowser            │  - useBrowserSession  │  - Tool          │
│  - DiagnosticsPanel     │  - useWebSocket       │  - WorkflowStep  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                            HTTP/WebSocket
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                         Server (Express/Node.js)                    │
├─────────────────────────────────────────────────────────────────────┤
│  API Routes              │  Services             │  Agent System    │
│  - /api/projects/*/     │  - WorkflowExecutor   │  - AgentRegistry │
│    workflow              │  - AgentBrowser       │  - Orchestrator  │
│  - /api/agent-browser/*  │  - MemoryService      │  - Task Manager  │
│  - /api/workflow/        │  - ToolRegistry       │  - API Tester    │
│    executions/*          │  - ObjectStorage      │  - Browser Agent │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                              PostgreSQL/Storage
```

## Data Flow & Workflow Execution

### 1. Workflow Definition (UI → API)
```
User creates workflow in Mind Map UI
    ↓
WorkflowMindMap component
    ↓
useWorkflow hook
    ↓
POST /api/projects/:id/workflow
    ↓
Workflow saved to memory/database
```

### 2. Workflow Execution (API → Agents)
```
User clicks "Begin" button
    ↓
POST /api/projects/:id/workflow/execute
    ↓
WorkflowExecutor service
    ↓
For each WorkflowStep:
    ↓
    For each Tool in step:
        ↓
        Execute tool action:
        - API Call → fetch()
        - AI Prompt → AgentOrchestrator
        - Browser Action → AgentBrowser
        - File Operation → FileSystem
        ↓
        Store results in variables
    ↓
Update execution logs
    ↓
Return execution results
```

### 3. Real-time Updates (WebSocket)
```
Server execution events
    ↓
WebSocket broadcast
    ↓
Client WebSocket listener
    ↓
Update UI state
```

## Key Components

### Frontend Components

#### WorkflowMindMap (`client/src/components/WorkflowMindMap.tsx`)
- Visual workflow designer with drag-and-drop tools
- Step sequencing and configuration
- Real-time execution monitoring
- Connects to workflow API endpoints

#### AIBrowser (`client/src/components/AIBrowser.tsx`)
- Browser automation interface
- Screenshot display
- Action controls (navigate, click, type)
- Uses agent-browser API endpoints

#### ChatPane (`client/src/components/ChatPane.tsx`)
- AI conversation interface
- Voice input/output
- File attachments
- Real-time message updates

### Backend Services

#### WorkflowRoutes (`server/workflowRoutes.ts`)
**Endpoints:**
- `GET /api/projects/:projectId/workflow` - Get workflow configuration
- `POST /api/projects/:projectId/workflow` - Save workflow
- `POST /api/projects/:projectId/workflow/execute` - Execute workflow
- `GET /api/workflow/executions/:id` - Get execution status
- `GET /api/workflow/executions/:id/logs` - Get execution logs

#### AgentBrowserRoutes (`server/agentBrowserRoutes.ts`)
**Endpoints:**
- `POST /api/agent-browser/sessions` - Create browser session
- `POST /api/agent-browser/:id/actions` - Execute browser action
- `DELETE /api/agent-browser/:id` - Close session
- `GET /api/agent-browser/:id/screenshot` - Get screenshot

#### Agent System (`server/agentOrchestrator.ts`)
- Routes tasks to specialized agents
- Manages agent lifecycle
- Handles inter-agent communication
- Provides AI capabilities

### Shared Types (`shared/workflowTypes.ts`)

#### Core Types:
- **Tool**: Defines executable actions (API, AI, Browser, File, etc.)
- **WorkflowStep**: Groups tools with execution order
- **Workflow**: Complete workflow configuration
- **WorkflowExecution**: Runtime execution state
- **ToolConfig**: Action-specific configuration

## Tool System

### Tool Types & Actions

1. **API Call** (`api_call`)
   - Makes HTTP requests to external APIs
   - Configurable method, headers, body
   - Returns JSON response

2. **AI Prompt** (`ai_prompt`)
   - Generates content using AI models
   - Uses AgentOrchestrator for processing
   - Configurable model and temperature

3. **Browser Action** (`browser_action`)
   - Automates web browsing via Playwright
   - Navigate, click, type, screenshot
   - Returns action results or screenshots

4. **File Operation** (`file_operation`)
   - Read, write, append, delete files
   - Handles local file system operations
   - Returns file content or operation status

5. **Data Transform** (`data_transform`)
   - Converts between data formats
   - JSON, CSV, XML transformations
   - Returns transformed data

6. **Notification** (`notification`)
   - Sends alerts and notifications
   - Email, Slack, webhook support
   - Returns send confirmation

## State Management

### Client State
- **Workflow Configuration**: Stored in React state, synced with API
- **Execution Status**: Polled via React Query
- **Real-time Updates**: WebSocket subscription

### Server State
- **In-Memory Storage**: Workflows and executions (development)
- **PostgreSQL**: Persistent storage (production)
- **Session Management**: Browser sessions in memory

## Security & Access Control

- Cookie-based sessions for authentication
- ACL system for object storage
- Environment variables for secrets
- CORS configured for development

## Development Workflow

1. **Frontend Development**
   - Components in `client/src/components`
   - Hooks in `client/src/hooks`
   - Pages in `client/src/pages`

2. **Backend Development**
   - Routes in `server/routes.ts` and specific route files
   - Services in individual service files
   - Shared types in `shared/` directory

3. **Testing Workflow**
   - Use the UI to create workflows
   - Monitor execution in browser console
   - Check server logs for debugging

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection
- `OPENAI_API_KEY`: OpenAI API access
- `SENDGRID_API_KEY`: Email service
- Object storage variables (auto-configured)

## Deployment

- Platform: Replit
- Build: Vite (frontend), tsx (backend)
- Database: Neon PostgreSQL
- Storage: Google Cloud Storage
- Runtime: Node.js 20+

## Future Enhancements

1. **Persistence Layer**: Move from in-memory to database storage for workflows
2. **Advanced Tool Registry**: Dynamic tool creation and management
3. **Workflow Templates**: Pre-built workflow patterns
4. **Collaborative Editing**: Real-time multi-user workflow design
5. **Execution History**: Detailed audit logs and replay capability
6. **Custom Tool Development**: User-defined tool creation interface