# Emergent Intelligence - AI Task Manager

## Overview
Emergent Intelligence is an AI-powered task management application that integrates voice interaction with visual mind-mapping. It enables users to manage projects and tasks through traditional interfaces and natural voice commands, featuring intelligent task generation and organization via OpenAI integration. The system supports real-time collaboration, file management, and comprehensive task organization. Its vision is to provide a sophisticated platform for intelligent task management, leveraging advanced AI to enhance productivity and organization.

## User Preferences
Preferred communication style: Simple, everyday language.
AI Model: GPT-5
Logo Design: Neural network theme with gradient colors (Neural Blue #6366f1, Cyber Purple #8b5cf6, Electric Cyan #06b6d4)
AI Assistant Role: Complete website liaison with full control capabilities to edit and manage everything

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite)
- **UI Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: TailwindCSS (CSS variables for theming)
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Real-time Updates**: WebSocket integration

### Backend Architecture
- **Framework**: Express.js with TypeScript (Node.js)
- **API Design**: RESTful with WebSocket support
- **Development**: tsx
- **Production**: esbuild
- **Middleware**: Custom logging, JSON parsing, error handling

### Database and Storage
- **Primary Database**: PostgreSQL (Neon Database)
- **ORM**: Drizzle ORM (schema-first, type-safe)
- **Migrations**: Drizzle Kit
- **Object Storage**: Google Cloud Storage
- **Access Control**: Custom ACL system

### Authentication and Security
- **User Management**: Custom username/email authentication
- **Session Handling**: Cookie-based sessions
- **Object Security**: ACL-based file access
- **Environment Variables**: Secure configuration management

### AI Integration
- **Dual-Model Architecture**: GPT-4o for real-time voice, GPT-5 for logic/management
- **Enhanced AI Assistant**: Complete system control with ability to actually build tools, not just describe them
- **Context Awareness**: Fully aware of Emergent Intelligence environment, capabilities, and available systems
- **Tool Creation**: Can dynamically create and deploy real tools through Tool Registry
- **Agent Orchestration**: Direct control of 5 specialized agents (Research, Planning, Coding, Testing, Documentation)
- **Workflow Generation**: Natural language to executable workflows with real-time execution
- **AI Workflow Engine**: Automated execution with debugging
- **Autonomous AI Workstation**: Three-tier autonomy system (Manual, Semi, Full) with modular center pane and self-maintenance loops.
- **Advanced Memory System**: 
  - Short-Term Memory (STM) with decay mechanisms and automatic archival
  - Long-Term Memory (LTM) with knowledge graph relationships
  - Pattern recognition and learning from user interactions
- **Tool Registry**: 
  - Dynamic tool management with performance tracking
  - Sandboxed execution with retry logic
  - External API integration support
- **Feature Proposal System**: 
  - AI-generated improvement suggestions
  - User approval/denial workflow with feedback learning
  - Code generation and technical specifications
- **Dynamic Tool Creation** (Canvas LMS-inspired):
  - GPT-5 can create temporary tools in containerized environments
  - Test and validate tools before permanent deployment
  - Auto-cleanup for temporary tools after session
  - Container-based isolation for safe execution

### Data Models
- **Users**: Authentication, profiles
- **Projects**: Top-level organization
- **Tasks**: Hierarchical, mind-map positioning
- **Comments**: Task-level collaboration
- **Chat Messages**: Project-level AI conversation history

### Real-time Features
- **WebSocket Server**: Live updates for tasks, collaboration
- **Voice Interface**: Real-time speech processing
- **Mind Map Updates**: Collaborative editing
- **Notification System**: Toast notifications

### UI/UX Decisions
- **Branding**: Emergent Intelligence logo with "EE" design, Neural Blue, Cyber Purple, Electric Cyan color scheme, gradient effects.
- **Layouts**: Aviation-themed three-pane layout for workflow composer, two-pane (Workspace | AI Inspector) for main interface.
- **UI Control**: Comprehensive DiagnosticsPanel for system monitoring, UI control, and autonomous system management.
- **Workflow Mind Map**: Project-centered orchestration hub with "Tools" toggle and sequential "Steps" system.

## Recent Architectural Changes (August 2025)

### Autonomy Mode Implementation (August 14, 2025)
- **Full Autonomy Mode**: AI now creates visible tasks when working, providing transparency
- **Task Creation**: Autonomous actions create real tasks in the database that appear in Tasks view
- **Action-First Execution**: In full mode, AI executes commands immediately without confirmations
- **Autonomy Mode Persistence**: Backend stores and uses autonomy mode for all AI interactions
- **Frontend Integration**: ChatPane passes autonomy mode with all messages to control AI behavior
- **Task Lifecycle**: AI tasks auto-complete after execution with proper status updates

### API Integration (August 14, 2025)
- **Workflow API**: Created complete REST endpoints for workflow management at `/api/projects/:id/workflow`
- **Shared Types**: Established `shared/workflowTypes.ts` for type contracts between client and server
- **Real Execution**: Connected WorkflowMindMap UI to actual backend APIs instead of mocks
- **Agent Browser Integration**: Wired up Playwright-based browser automation with proper API endpoints
- **Workflow Execution Engine**: Implemented async workflow executor with tool orchestration
- **Architecture Documentation**: Created comprehensive ARCHITECTURE.md file

## Recent Architectural Changes (August 2025)

### Production-Ready Advanced Features
- **Memory Management Service**: Implemented multi-tier memory architecture with STM/LTM, decay mechanisms, and automatic archival
- **Tool Registry Service**: Created comprehensive tool management system with performance tracking, retry logic, and sandboxed execution
- **Feature Proposal System**: Built AI-driven feature suggestion system with approval workflows and feedback learning
- **Database Extensions**: Added tables for long-term memory, memory relationships, tool registry, tool executions, and feature proposals
- **UI Components**: Developed MemoryStats and FeatureProposals components for system monitoring and feature management
- **Dynamic Tool Creator**: Canvas LMS-inspired container-based tool development system allowing GPT-5 to create, test, and deploy tools dynamically
- **Mobile Split View**: 60/40 split between module and chat for mobile experience
- **Voice Transcription**: Complete voice handling with speaker identification and batch editing
- **Workstation Tools**: Interactive workspace where AI agents can actively cycle through different tools

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4o and GPT-5 models for NLP and task generation.
- **Neon Database**: Serverless PostgreSQL hosting.
- **Google Cloud Storage**: Object storage for file attachments.

### Email and Communication
- **SendGrid**: Email service for notifications.
- **Uppy**: File upload interface.

### Development and Deployment
- **Replit Platform**: Cloud development and deployment.
- **Vite**: Frontend build tool.
- **Replit Cartographer**: Development tooling for Replit environment.

### UI and Accessibility
- **Radix UI**: Accessible component primitives.
- **Lucide Icons**: Icon library.
- **React Hook Form**: Form validation with Zod.
- **D3.js**: Data visualization for mind-map rendering.

### File Processing
- **Multiple Uppy Plugins**: Comprehensive file upload handling.
- **MIME Type Detection**: Automatic file type recognition.

### Other Integrations
- **YouTube API**: Video search and details.