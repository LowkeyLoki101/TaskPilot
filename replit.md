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
- **Enhanced AI Assistant**: Complete website control, automation, function calling
- **Context Awareness**: Project-specific AI assistance
- **Proactive Suggestions**: Based on user behavior
- **Workflow Generation**: Natural language to FlowScript conversion
- **AI Workflow Engine**: Automated execution with debugging
- **Autonomous AI Workstation**: Three-tier autonomy system (Manual, Semi, Full) with modular center pane and self-maintenance loops.

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