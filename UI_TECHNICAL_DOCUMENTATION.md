# Emergent Intelligence - UI Technical Documentation

## Overview

This document provides comprehensive technical documentation for every UI element, button, control, and organizational structure within the Emergent Intelligence AI Task Manager. This serves as both user reference and diagnostic tool for troubleshooting UI issues.

## Screen Organization

### Global Layout Structure
```
┌─ Header (Fixed, 64px height) ─────────────────────────────┐
│ [Logo] [Title] [Voice Status] [Voice Button] [User Menu] │
├─ Three-Pane Desktop Layout ──────────────────────────────┤
│ ┌─ Left Pane ─┐ ┌─ Center Pane ─┐ ┌─ Right Pane ──┐    │
│ │ Chat (300px)│ │ Canvas (flex) │ │ Inspector(300)│    │
│ │             │ │               │ │               │    │
│ │             │ │               │ │               │    │
│ └─────────────┘ └───────────────┘ └───────────────┘    │
└───────────────────────────────────────────────────────────┘
```

## Header Components

### Logo and Branding
- **Element**: `<div>` with EI logo and title
- **Location**: Top-left corner of header
- **Content**: 
  - Gradient logo (40x40px) with "EI" text
  - "Emergent Intelligence" title
  - "AI Task Manager" subtitle
- **Purpose**: Brand identification and navigation home

### Voice Status Indicator
- **Element**: Status pill with green dot and text
- **Location**: Header center-left
- **States**:
  - `Voice Ready` - System ready for voice input
  - `Listening...` - Actively recording voice
- **Visual**: Green dot (animated pulse when active)
- **Purpose**: Real-time voice system status feedback

### Voice Control Button
- **Element**: `<Button>` with Mic/MicOff icon
- **Location**: Header center-right
- **States**:
  - **Ready State**: Blue background, Mic icon, "Voice" text
  - **Active State**: Red background, MicOff icon, "Stop" text
- **Interaction**: Click to toggle voice recording
- **Test ID**: `button-voice-toggle`
- **Purpose**: Primary voice interaction control

### User Menu
- **Element**: Circular button with user initials
- **Location**: Header far-right
- **Content**: Gradient background with "JD" initials
- **Purpose**: User account access (expandable)

## Left Pane - AI Assistant Chat

### Chat Header
- **Height**: Compact 32px
- **Content**: 
  - Bot icon with gradient background
  - "AI Assistant" title (12px text)
  - Message count badge
- **Purpose**: Chat context and status

### Message Area
- **Height**: Fixed 300px with scroll
- **Content**: 
  - Message bubbles (user/assistant)
  - Timestamps (HH:MM format)
  - Action badges when AI performs tasks
- **Interaction**: Auto-scrolls to latest message
- **Purpose**: Conversation history and AI responses

### Chat Input Area
- **Height**: Compact 40px total
- **Components**:
  - Text input field (height: 32px, small text)
  - Voice button (32x32px, red when active)
  - Send button (32x32px)
- **Purpose**: Message composition and sending

## Center Pane - Main Canvas

### Toolbar
- **Location**: Top of center pane
- **Height**: 64px
- **Components**:
  - Project title "My Task Board"
  - Collaborator status indicator
  - View switching buttons
  - Workflow mode toggle

### View Switching Buttons
- **Element**: Button group with border
- **Options**:
  1. **Mind Map Button**
     - Icon: Brain icon
     - Text: "Mind Map"
     - Test ID: `button-mindmap-view`
     - Purpose: Switch to network visualization
  
  2. **Calendar Button**
     - Icon: Calendar icon
     - Text: "Calendar"
     - Test ID: `button-calendar-view`
     - Purpose: Switch to calendar view
  
  3. **List Button**
     - Icon: CheckCircle icon
     - Text: "List"
     - Test ID: `button-list-view`
     - Purpose: Switch to list view (in development)

### Workflow Mode Toggle
- **Element**: Outline button
- **States**: "Tasks" ↔ "Workflows"
- **Purpose**: Switch between task management and workflow composer

### Canvas Content Areas

#### Mind Map View
- **Dimensions**: Fixed height 500px
- **Content**: D3.js force-directed graph
- **Elements**:
  - Central project node (large, gradient)
  - Task nodes (medium, priority-colored)
  - Connection lines between nodes
- **Controls**: 
  - Zoom in/out buttons (bottom-right)
  - Center view button
  - Drag and drop positioning
- **Purpose**: Visual task relationships and spatial organization

#### Calendar View
- **Dimensions**: Full pane height
- **Structure**:
  - Month navigation header
  - Day name headers (Sun-Sat)
  - Calendar grid (7x5 minimum)
  - Task indicators on dates
- **Task Display**:
  - Up to 3 tasks shown per day
  - Priority color coding (red/yellow/green)
  - "+X more" indicator for additional tasks
- **Interaction**: Click dates or tasks to select
- **Purpose**: Temporal task organization and deadline tracking

## Right Pane - Inspector Panel

### Inspector Header
- **Content**: "Inspector" title with description
- **Purpose**: Context identification

### Tab System
- **Elements**: Three-tab interface
- **Tabs**:
  1. **AI Tab**
     - AI control input field
     - "Execute" button
     - Purpose: AI command interface
  
  2. **Task Tab**
     - Selected task details
     - Edit button (functional)
     - Purpose: Task inspection and modification
  
  3. **Activity Tab**
     - Project activity feed
     - Purpose: Change history and collaboration

### Quick Actions Panel
- **Location**: Below tabs
- **Title**: "Quick Actions"
- **Actions**:
  - Switch to Dark Theme
  - Reorganize Layout
  - Create Sample Tasks
  - Send Status Email
  - Search Project Ideas
  - Customize Interface
- **Purpose**: One-click AI automation features

## Diagnostic Information

### React Key Warnings
- **Issue**: Calendar view generating duplicate key warnings
- **Affected Component**: `CalendarView.tsx`
- **Cause**: Non-unique keys in calendar day mapping
- **Status**: Requires fixing with unique date-based keys

### Performance Metrics
- **Chat Polling**: 5-second intervals
- **Task Updates**: Real-time via React Query
- **Memory Usage**: Monitored via browser dev tools
- **Bundle Size**: Optimized via Vite

### Browser Compatibility
- **Supported**: Chrome 90+, Firefox 85+, Safari 14+
- **WebSocket**: Required for real-time features
- **Speech Recognition**: Chrome/Edge only
- **Local Storage**: Used for user preferences

## Responsive Behavior

### Desktop (1024px+)
- Three-pane layout visible
- All controls accessible
- Full feature set enabled

### Tablet (768px-1023px)
- Two-pane layout (center + right)
- Chat pane hidden, accessible via modal
- Condensed toolbar

### Mobile (320px-767px)
- Single-pane layout
- Bottom tab navigation
- Touch-optimized controls
- Voice modal interface

## Accessibility Features

### Keyboard Navigation
- Tab order: Header → Left pane → Center pane → Right pane
- Arrow keys for calendar navigation
- Space/Enter for button activation

### Screen Reader Support
- ARIA labels on all interactive elements
- Role attributes for complex widgets
- Alt text for icons and images

### Color Accessibility
- High contrast mode support
- Color-blind friendly priority indicators
- Focus indicators on all interactive elements

## Test IDs Reference

### Primary Actions
- `button-voice-toggle` - Main voice control
- `button-mindmap-view` - Mind map view switcher
- `button-calendar-view` - Calendar view switcher
- `button-list-view` - List view switcher
- `button-edit-task` - Task editing button

### Input Elements
- `input-chat-message` - Chat message input
- `button-voice-chat` - Chat voice button
- `button-send-message` - Send message button

### Display Elements
- `indicator-voice-status` - Voice status indicator
- `mindmap-canvas` - D3.js mind map SVG
- `chat-pane` - Chat container element

## Error Handling

### Common Issues
1. **Voice not working**: Check browser permissions
2. **Tasks not loading**: Verify API connectivity
3. **Calendar errors**: Check date formatting
4. **Chat disconnected**: WebSocket reconnection logic

### Debug Commands
- `localStorage.getItem('debug')` - Get debug mode
- `console.log(window.diagnostics)` - View system status
- Network tab → Filter by `/api/` - Monitor API calls

## Version Information
- **UI Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: TanStack React Query
- **Build Tool**: Vite
- **Last Updated**: August 13, 2025

---

This documentation should be updated whenever UI elements are modified, added, or removed to maintain accuracy and debugging capability.