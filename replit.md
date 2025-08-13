# Emergent Intelligence - AI Task Manager

## Overview

This is a sophisticated AI-powered task management application that combines voice interaction with visual mind-mapping capabilities. The system enables users to manage projects and tasks through both traditional interfaces and natural voice commands, while providing intelligent task generation and organization features through OpenAI integration.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, featuring real-time collaboration through WebSockets, file management with object storage, and comprehensive task organization capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
AI Model: GPT-5 (requested by user, updated from GPT-4o)
Logo Design: Neural network theme with gradient colors (Neural Blue #6366f1, Cyber Purple #8b5cf6, Electric Cyan #06b6d4)
AI Assistant Role: Complete website liaison with full control capabilities to edit and manage everything

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: TailwindCSS with CSS variables for theming and dark mode support
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket integration for live project collaboration

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints with additional WebSocket support for real-time features
- **Development Setup**: tsx for TypeScript execution in development
- **Production Build**: esbuild for server bundling with ESM format
- **Middleware**: Custom logging, JSON parsing, and error handling

### Database and Storage
- **Primary Database**: PostgreSQL using Neon Database for serverless deployment
- **ORM**: Drizzle ORM with schema-first approach and type safety
- **Migration Management**: Drizzle Kit for database schema migrations
- **Object Storage**: Google Cloud Storage integration for file attachments
- **Access Control**: Custom ACL system for object-level permissions

### Authentication and Security
- **User Management**: Custom user schema with username/email authentication
- **Session Handling**: Cookie-based sessions with secure defaults
- **Object Security**: ACL-based access control for uploaded files
- **Environment Variables**: Secure configuration management for API keys and credentials

### AI Integration
- **Dual-Model Architecture**: GPT-4o for real-time voice interactions, GPT-5 for logic/management tasks
- **Voice Processing**: GPT-4o optimized for real-time speech recognition and immediate response
- **Management & Logic**: GPT-5 for advanced reasoning, task generation, and complex workflow creation
- **Enhanced AI Assistant**: Complete website control system with full automation capabilities
- **Function Calling**: Structured AI responses for task creation and management
- **Website Control**: AI can modify any UI element, create/manage tasks, send notifications, search web, customize themes
- **Context Awareness**: Project-specific AI assistance with conversation history
- **Proactive Suggestions**: Intelligent recommendations based on user behavior patterns
- **Workflow Generation**: Natural language to FlowScript conversion with intelligent tool selection
- **AI Workflow Engine**: Automated execution with error handling and step-by-step debugging

### Data Models
- **Users**: Authentication and profile management
- **Projects**: Top-level organization units with ownership
- **Tasks**: Hierarchical task structure with mind-map positioning
- **Comments**: Task-level discussion and collaboration
- **Chat Messages**: Project-level AI conversation history

### Real-time Features
- **WebSocket Server**: Live updates for task changes and collaboration
- **Voice Interface**: Real-time speech recognition and processing
- **Mind Map Updates**: Live positioning updates for collaborative editing
- **Notification System**: Toast notifications for user feedback

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4o model for intelligent task generation and natural language processing
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Google Cloud Storage**: Object storage for file attachments with ACL support

### Email and Communication
- **SendGrid**: Email service integration for notifications and user communications
- **Uppy**: File upload interface with progress tracking and S3-compatible storage

### Development and Deployment
- **Replit Platform**: Cloud development environment with integrated deployment
- **Vite**: Frontend build tool with HMR and optimized production builds
- **Replit Cartographer**: Development tooling for Replit environment integration

### UI and Accessibility
- **Radix UI**: Accessible component primitives for form controls and overlays
- **Lucide Icons**: Comprehensive icon library for UI elements
- **React Hook Form**: Form validation and management with Zod schema validation
- **D3.js**: Data visualization for interactive mind-map rendering

### File Processing
- **Multiple Uppy Plugins**: Comprehensive file upload handling including dashboard, drag-drop, progress tracking, and AWS S3 integration
- **MIME Type Detection**: Automatic file type recognition and validation

## Recent Updates (August 2025)

### GPT-5 Integration
- Updated all OpenAI API calls from GPT-4o to GPT-5 (released August 7, 2025)
- Enhanced reasoning capabilities and reduced hallucinations
- Improved multimodal processing and extended context windows

### Enhanced AI Assistant System
- Created AdvancedAIAssistant class with complete website control capabilities
- AI can now modify any UI element, layout, theme, or functionality
- Added comprehensive function calling system for automated actions
- Integrated proactive suggestion system based on user behavior

### Brand Design Implementation (COMPLETED August 2025)
- **FINALIZED**: Integrated actual Emergent Intelligence logo with distinctive "EE" design across all interfaces
- **COMPLETED**: Professional branding implementation in Dashboard header and mobile Header component
- **INTEGRATED**: Real logo assets replacing all placeholder Brain icons and temporary branding
- Implemented cohesive color scheme: Neural Blue, Cyber Purple, Electric Cyan
- Updated CSS variables for consistent brand application
- Added gradient effects and modern visual elements

### AI Control Panel
- Built comprehensive AI control interface with tabs for Control, Suggestions, and Quick Actions
- Real-time execution feedback and status indicators
- One-click demonstration actions showcasing AI capabilities
- Integrated seamlessly into dashboard layout with dedicated right panel

### Conversational Workflow Composer (August 2025)
- **COMPLETED**: Full dual-interface architecture with "same brain, different bodies" concept
- **Voice-to-Workflow**: Natural language processing converts spoken commands to executable graphs
- **FlowScript DSL**: Human-readable JSON format for workflow definition and validation
- **Visual Designer**: React Flow-based TraceCanvas for desktop workflow visualization
- **Mobile Execution**: Step-by-step WorkflowStepRunner for mobile workflow execution
- **Tool Registry**: Comprehensive tool system supporting Dropbox, email, Slack, calendar integrations
- **Sample Workflows**: Pre-built demonstrations for file analysis, customer support, social media automation
- **Dual-Mode Dashboard**: Seamless switching between task management and workflow composer
- **Inspector Panel**: Real-time workflow debugging, execution control, and export capabilities
- **Aviation-Themed UI**: Three-pane layout optimized for both planning and execution workflows

### Autonomous AI Workstation Transformation (August 2025)
- **COMPLETED**: Three-tier autonomy system (Manual/Grey, Semi/Yellow, Full/Green) with color-coded status indicators
- **IMPLEMENTED**: Modular center pane architecture with complete module selector for Mind Map, Calendar, Tasks, Browser, and Debug modules
- **ENHANCED**: Professional header with "Emergent Intelligence" branding, GPT-5 badge, AI status monitoring, and activity pulse indicators
- **ADDED**: Autonomous maintenance loops with automatic system checks every 30s (full mode) and 60s (semi mode)
- **UPGRADED**: DiagnosticsPanel with AI Autonomous System monitoring, activity logs, maintenance tracking, and autonomous-only controls
- **IMPLEMENTED**: Context-sensitive Inspector panel with module-aware content and enhanced debugging capabilities
- **CREATED**: AI activity logging system that categorizes maintenance, enhancement, bug fixes, and task creation activities
- **TRANSFORMED**: From reactive task management to proactive autonomous AI operation with self-maintenance loops

### UI Control and Diagnostics System (August 2025)
- **COMPLETED**: Comprehensive technical documentation explaining every button and UI element
- **FIXED**: React key warnings in CalendarView component with unique date-based keys
- **CREATED**: Built-in DiagnosticsPanel for real-time system monitoring and troubleshooting
- **INTEGRATED**: Diagnostics tab in Inspector panel for comprehensive UI control
- **OPTIMIZED**: Compact interface with reduced heights (chat 50vh, mind map 500px, panels 300px)
- **DOCUMENTED**: Complete UI technical reference in UI_TECHNICAL_DOCUMENTATION.md

### External Services Integration (August 2025)
- **IMPLEMENTED**: YouTube API integration with video search, details, and channel browsing
- **CREATED**: Real-time activity logging system that tracks actual user interactions and system events
- **REPLACED**: Fake maintenance activities with genuine system monitoring and health checks
- **ADDED**: Activity Logger service that categorizes tasks, AI responses, system events, and maintenance actions
- **INTEGRATED**: YouTube endpoints in browser module with search and video detail functionality
- **ENHANCED**: Health check endpoint for autonomous maintenance system verification
- **CONNECTED**: Real activity data flowing from server to diagnostics panels for authentic monitoring

### Workflow Mind Map Redesign (August 2025)
- **CREATED**: New WorkflowMindMap component as requested - project-centered workflow orchestration hub
- **IMPLEMENTED**: "Tools" toggle system with configurable sub-categories (YouTube videos, product manuals, files, art generator, web search, etc.)
- **ADDED**: Sequential "Steps" system with drag-drop reordering, (+) add steps, and multi-step tool assignment
- **BUILT**: "Begin" execution button that opens only required tools for each step sequentially  
- **INTEGRATED**: GPT-5 control system for tool creation, modification, and deletion
- **ENHANCED**: AI utility belt with web search, image creation, file handling, and knowledge base access
- **FIXED**: Task deletion functionality with bulk delete endpoint and UI button for clearing all tasks

### Final Branding Integration (August 2025)
- **COMPLETED**: Integrated actual Emergent Intelligence logo (IMG_3516_1755107002245.jpg) throughout application
- **REPLACED**: All placeholder Brain icons and temporary branding with authentic logo assets
- **FINALIZED**: Professional header branding in both desktop Dashboard and mobile Header components  
- **ACHIEVED**: Complete visual brand consistency across all user interfaces and touchpoints

### Inspector-Centric AI Architecture (August 2025)
- **ARCHITECTURAL OVERHAUL**: Moved chat functionality from separate left pane into Inspector's AI tab, creating unified "body of the AI"
- **TWO-PANE LAYOUT**: Transformed from 3-pane (Chat | Workspace | Inspector) to 2-pane (Workspace | AI Inspector) design
- **AI TAB INTEGRATION**: Combined chat interface with real-time AI activity feed in single cohesive AI experience  
- **TAB RESTRUCTURE**: Reorganized to AI (chat + activity), Task (traditional todos), Feature (AI suggestions with approve/deny), Debug (diagnostics)
- **WORKSPACE LIBERATION**: Freed up significant workspace area by consolidating AI functionality into unified right panel
- **FEATURE REQUEST WORKFLOW**: Enhanced approve/deny/edit system with Replit agent integration for automatic implementation
- **AUTHENTIC DATA FLOW**: Connected real AI activity logging system replacing mock data with genuine maintenance and system activities