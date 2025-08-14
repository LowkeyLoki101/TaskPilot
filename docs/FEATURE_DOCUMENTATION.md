# Emergent Intelligence - Complete Feature Documentation

## Overview
This document describes every feature, button, and functionality in the Emergent Intelligence AI Task Manager application, explaining their purpose, how they work, and how they interact with each other.

## Core Application Architecture

### Frontend Structure
- **Framework**: React with TypeScript using Vite
- **UI Components**: Shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Real-time**: WebSocket connections for live updates

### Backend Structure
- **Framework**: Express.js with TypeScript (Node.js)
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Google Cloud Storage for file attachments
- **AI Integration**: OpenAI API (GPT-4o and GPT-5)
- **Real-time**: WebSocket server for live collaboration

## Main Interface Layout

### Header Bar (Top)
**Purpose**: Primary navigation and core actions
**Components**:
1. **Logo/Brand**: Emergent Intelligence branding
2. **Voice Toggle Button**: 
   - Purpose: Activate/deactivate voice commands
   - How it works: Toggles speech recognition, shows visual indicator when listening
   - Integration: Connects to voice processing system and AI chat

### Toolbar (Below Header)
**Purpose**: Module navigation and workspace switching
**Components**:
1. **Mind Map Tab**: 
   - Purpose: Visual task organization and relationship mapping
   - How it works: D3.js-powered interactive node graph
   - Features: Drag nodes, create connections, zoom/pan

2. **Calendar Tab**: 
   - Purpose: Time-based task management and scheduling
   - How it works: Calendar view with task due dates
   - Features: Date selection, task filtering by time

3. **Tasks Tab**: 
   - Purpose: Traditional list-based task management
   - How it works: Hierarchical task list with completion tracking
   - Features: Create, edit, complete, delete tasks

4. **AI Activity Tab**: 
   - Purpose: Monitor AI actions and system activity
   - How it works: Real-time log of AI decisions and actions
   - Features: Activity filtering, performance metrics

5. **Feature Tab**: 
   - Purpose: Feature request management and suggestions
   - How it works: AI-powered feature recommendations
   - Features: Submit requests, vote on features, implementation tracking

6. **Browser Tab**: 
   - Purpose: AI-controlled web browser automation
   - How it works: Playwright-based browser control
   - Features: Navigate websites, extract data, perform actions

7. **Debug Tab**: 
   - Purpose: System diagnostics and troubleshooting
   - How it works: Real-time system monitoring
   - Features: Error logs, performance metrics, maintenance tools

8. **Agents Tab**: 
   - Purpose: Multi-agent AI system management
   - How it works: Orchestration of specialized AI agents
   - Features: Agent status, task delegation, coordination

9. **Tools Tab**: 
   - Purpose: Dynamic tool creation and management
   - How it works: AI-generated tools for specific tasks
   - Features: Tool registry, performance tracking, sandboxed execution

### Main Content Area (Center)
**Purpose**: Primary workspace that changes based on selected tab
**Behavior**: 
- Only this area scrolls, header and sidebar remain fixed
- Content adapts to selected module
- Responsive design for different screen sizes

### Inspector Pane (Right Sidebar)
**Purpose**: Contextual information and AI interaction
**Components**:
1. **AI Chat Interface**:
   - Purpose: Natural language interaction with AI assistant
   - How it works: Real-time chat with GPT-5, context-aware responses
   - Features: Voice input, command processing, autonomy mode control

2. **Task Details Panel**:
   - Purpose: Detailed view of selected tasks
   - How it works: Shows task metadata, comments, history
   - Features: Edit task properties, add comments, track changes

3. **Feature Requests Panel**:
   - Purpose: AI-suggested improvements and user requests
   - How it works: Machine learning analysis of usage patterns
   - Features: Approve/deny suggestions, implementation tracking

4. **Diagnostics Panel**:
   - Purpose: System health and performance monitoring
   - How it works: Real-time metrics and error tracking
   - Features: Maintenance controls, autonomy mode settings

## Task Management System

### Task Structure
Each task contains:
- **ID**: Unique identifier
- **Title**: Brief description (required)
- **Description**: Detailed information (optional)
- **Status**: todo, in_progress, completed
- **Priority**: low, medium, high
- **Due Date**: Optional deadline
- **Assignee**: Person responsible
- **Position**: X,Y coordinates for mind map
- **Created/Updated**: Timestamps
- **Comments**: Discussion thread
- **Metadata**: Additional properties

### Task Operations

#### 1. Task Creation
**Purpose**: Add new tasks to the project
**Trigger**: "Add Task" button or AI command
**Process**:
1. Click "Add Task" button
2. Modal opens with form fields
3. Fill in title (required), description, priority, due date
4. Submit creates task in database
5. Task appears in all relevant views (list, mind map, calendar)

#### 2. Task Completion
**Purpose**: Mark tasks as done/undone
**Trigger**: Checkbox click next to task
**Process**:
1. Click checkbox button (24x24 pixel area)
2. PATCH request to `/api/tasks/{id}` with completed status
3. Visual state updates (strikethrough, checkmark)
4. Task moves between pending/completed sections
5. Real-time updates via WebSocket

**Current Issue**: Checkboxes may not be properly clickable - needs investigation

#### 3. Task Deletion
**Purpose**: Remove individual tasks
**Trigger**: X button on task item
**Process**:
1. Click X button on task row
2. DELETE request to `/api/tasks/{id}`
3. Task removed from database
4. UI updates to remove task from all views

#### 4. Bulk Task Deletion
**Purpose**: Clear all tasks at once
**Trigger**: "Delete All" button
**Process**:
1. Click "Delete All" button
2. Confirmation dialog appears
3. If confirmed, DELETE request to `/api/projects/{id}/tasks`
4. All tasks removed from project

### Task Views

#### List View (Tasks Tab)
**Purpose**: Traditional to-do list interface
**Features**:
- Grouped by status (Pending/Completed)
- Priority badges (low/medium/high)
- Due date indicators
- Assignee information
- Individual checkboxes for completion
- Delete buttons (X) for each task
- Search and filtering capabilities

#### Mind Map View (Mind Map Tab)
**Purpose**: Visual relationship mapping
**Features**:
- Drag-and-drop node positioning
- Connection lines between related tasks
- Zoom and pan controls
- Visual priority indicators
- Click to select/edit tasks

#### Calendar View (Calendar Tab)
**Purpose**: Time-based task organization
**Features**:
- Monthly/weekly/daily views
- Due date visualization
- Drag-and-drop scheduling
- Overdue task highlighting

## AI Integration System

### Autonomy Modes
**Purpose**: Control AI behavior and decision-making

#### 1. Manual Mode
- AI provides suggestions only
- User confirms all actions
- Traditional assistant behavior

#### 2. Semi-Autonomous Mode
- AI can perform safe actions automatically
- Asks permission for significant changes
- Balanced approach

#### 3. Full Autonomous Mode
- AI acts independently
- Creates and completes tasks automatically
- Minimal user intervention required

**Note**: Currently disabled automatic task creation to prevent spam

### AI Chat Interface
**Purpose**: Natural language interaction with AI assistant
**Features**:
- Real-time conversation
- Context awareness of current project state
- Voice input support
- Command processing
- Multi-turn conversations

### AI Agents System
**Purpose**: Specialized AI workers for different tasks
**Agents**:
1. **Research Agent**: Information gathering and analysis
2. **Planning Agent**: Project structure and timeline creation
3. **Coding Agent**: Software development tasks
4. **Testing Agent**: Quality assurance and validation
5. **Documentation Agent**: Content creation and organization

## Voice Interface

### Voice Commands
**Purpose**: Hands-free interaction with the system
**Features**:
- Speech-to-text conversion
- Natural language processing
- Command interpretation
- Real-time feedback

### Voice Workflow
1. Click voice button or use hotkey
2. Visual indicator shows listening state
3. Speak command naturally
4. AI processes speech and intent
5. Action executed or clarification requested

## Browser Automation

### AI Browser
**Purpose**: Automated web interactions
**Technology**: Playwright browser automation
**Features**:
- Navigate websites automatically
- Extract data from web pages
- Fill forms and click buttons
- Screenshot capture
- Multi-tab management

### Use Cases
- Research and data collection
- Form automation
- Website testing
- Content extraction
- Social media automation

## Real-time Features

### WebSocket Connections
**Purpose**: Live collaboration and updates
**Features**:
- Task updates broadcast to all users
- Real-time status changes
- Live cursor positions
- Instant notifications

### Live Updates
- Task completions appear immediately
- New tasks show up without refresh
- Comments and edits sync across users
- System status changes reflected instantly

## File Management

### Object Storage
**Technology**: Google Cloud Storage
**Purpose**: Persistent file attachments
**Features**:
- File upload and download
- Image preview
- Version control
- Access control lists (ACL)

### File Operations
- Drag-and-drop upload
- Multiple file selection
- Progress indicators
- Error handling

## Data Persistence

### Database Schema
**Technology**: PostgreSQL with Drizzle ORM
**Tables**:
- Users (authentication, profiles)
- Projects (top-level organization)
- Tasks (work items with hierarchy)
- Comments (task-level discussions)
- Chat Messages (AI conversation history)
- Memory (AI learning and context)
- Tools (dynamic tool registry)
- Feature Requests (improvement tracking)

### Data Flow
1. User actions trigger API calls
2. Express routes validate requests
3. Drizzle ORM handles database operations
4. WebSocket broadcasts changes
5. React Query updates UI state

## System Architecture Integration

### Frontend-Backend Communication
- REST API for CRUD operations
- WebSocket for real-time updates
- File uploads via multipart forms
- Authentication via session cookies

### Error Handling
- API error responses with status codes
- Frontend error boundaries
- User-friendly error messages
- Automatic retry mechanisms

### Performance Optimization
- React Query caching
- Lazy loading of components
- Image optimization
- Bundle splitting

## Current Issues and Limitations

### Task Checkbox Problem
**Issue**: Checkboxes not responding to clicks
**Possible Causes**:
- Event handler not properly attached
- CSS styling blocking clicks
- JavaScript errors preventing execution
- Race conditions in state updates

**Investigation Needed**:
- Check browser developer tools for errors
- Verify event handlers in React DevTools
- Test API endpoints directly
- Review CSS for pointer-events or z-index issues

### Missing Subtask Functionality
**Current State**: Tasks are flat, no hierarchical structure
**User Expectation**: Nested subtasks with individual checkboxes
**Implementation Needed**:
- Database schema update for parent-child relationships
- UI components for nested task display
- Drag-and-drop for task reorganization
- Completion logic for parent tasks based on subtasks

## Recommended Next Steps

1. **Fix Task Checkbox Functionality**
   - Debug click event handling
   - Ensure proper API integration
   - Test completion state changes

2. **Implement Subtask System**
   - Add parent_id field to tasks table
   - Create nested task UI components
   - Implement drag-and-drop hierarchy management

3. **Improve Task Management**
   - Add task editing capabilities
   - Implement task assignment workflow
   - Create task templates and quick actions

4. **Enhance AI Integration**
   - Refine autonomy mode controls
   - Improve context awareness
   - Add AI-powered task suggestions

This documentation serves as a complete reference for understanding and improving the Emergent Intelligence task management system.