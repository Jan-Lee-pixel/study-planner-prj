# Study Planner Frontend Structure

## 📁 Project Organization

```
src/
├── components/           # Reusable UI components
│   ├── Sidebar.jsx      # Navigation sidebar
│   ├── Header.jsx       # Top navigation bar
│   ├── TaskItem.jsx     # Individual task display
│   ├── TaskModal.jsx    # Task creation/editing modal
│   ├── StatCard.jsx     # Statistics display card
│   └── AICard.jsx       # AI assistant feature card
├── pages/               # Main page components
│   ├── Dashboard.jsx    # Main dashboard view
│   ├── TasksPage.jsx    # All tasks management
│   ├── CalendarPage.jsx # Calendar view
│   ├── ProgressPage.jsx # Progress tracking
│   └── AIAssistant.jsx  # AI tools interface
├── useTasks.js          # Custom hook for task management
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
└── index.css            # Global styles
```

## 🧩 Component Architecture

### Core Components

**App.jsx** - Main application container
- Manages global state and routing
- Handles view switching between pages
- Integrates task management hook

**Sidebar.jsx** - Navigation sidebar
- Dynamic navigation with active states
- Organized sections: Main, AI Assistant, Quick Access
- Responsive design with hover effects

**Header.jsx** - Top navigation bar
- Dynamic page titles
- User profile and notifications
- Search functionality

### Page Components

**Dashboard.jsx** - Main overview page
- Statistics cards showing task metrics
- Recent tasks list
- AI assistant quick access
- Recent activity feed

**TasksPage.jsx** - Complete task management
- Advanced filtering and search
- Sort by date, priority, or title
- Full CRUD operations for tasks

**CalendarPage.jsx** - Calendar view
- Monthly calendar with task visualization
- Task color coding by type
- Upcoming deadlines sidebar

**ProgressPage.jsx** - Analytics and progress tracking
- Completion rate statistics
- Progress by task type and priority
- Recent achievements display

**AIAssistant.jsx** - AI-powered study tools
- Quiz generation from topics
- Note summarization
- Lesson plan creation
- Copy and download functionality

### Utility Components

**TaskItem.jsx** - Individual task display
- Checkbox for completion toggle
- Priority and type indicators
- Due date formatting
- Hover interactions

**TaskModal.jsx** - Task creation/editing
- Form validation
- Type and priority selection
- Date picker integration
- Responsive modal design

**StatCard.jsx** - Statistics display
- Animated hover effects
- Icon integration
- Color-coded metrics

**AICard.jsx** - AI feature cards
- Interactive hover animations
- Color-themed by function
- Click handlers for actions

## 🔧 State Management

**useTasks.js** - Custom hook for task operations
- Local storage persistence
- CRUD operations (Create, Read, Update, Delete)
- Task filtering and sorting utilities
- State synchronization

## 🎨 Design System

### Color Scheme
- Primary: Stone/Gray palette for clean, professional look
- Accent: Blue for primary actions and active states
- Status: Red (high priority), Orange (medium), Green (low/completed)
- Type: Blue (assignments), Pink (exams), Purple (projects)

### Typography
- Headings: Bold, clear hierarchy
- Body: Clean, readable font sizes
- Labels: Uppercase, tracked spacing for categories

### Layout
- Fixed sidebar navigation (240px width)
- Main content area with consistent padding
- Responsive grid systems for cards and lists
- Consistent spacing using Tailwind CSS classes

## 🚀 Key Features

### Task Management
- Create, edit, delete tasks
- Mark tasks as complete/incomplete
- Priority levels (High, Medium, Low)
- Task types (Assignment, Exam, Project)
- Due date tracking with overdue detection

### Dashboard Analytics
- Total tasks count
- Completion rate percentage
- In-progress and overdue tracking
- Recent activity timeline

### Calendar Integration
- Monthly view with task visualization
- Color-coded task types
- Upcoming deadlines sidebar
- Navigation between months

### Progress Tracking
- Completion rate by task type
- Priority-based progress analysis
- Achievement history
- Visual progress bars

### AI Study Assistant
- **Quiz Generation**: Create practice quizzes from topics
- **Note Summarization**: Condense lengthy study materials
- **Lesson Planning**: Structure learning objectives and content
- Export functionality (copy/download)

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Flexible grid layouts
- Collapsible sidebar for smaller screens
- Touch-friendly interactive elements
- Optimized for desktop, tablet, and mobile

## 🔄 Data Flow

1. **App.jsx** manages global state using `useTasks` hook
2. **Tasks** are stored in localStorage for persistence
3. **Page components** receive tasks and handlers as props
4. **UI components** emit events back to parent components
5. **State updates** trigger re-renders across the application

## 🛠 Development Guidelines

### Component Structure
- Functional components with hooks
- Props destructuring for clean interfaces
- Consistent naming conventions
- Modular, reusable design

### State Management
- Custom hooks for complex logic
- Local storage for data persistence
- Minimal prop drilling
- Clear separation of concerns

### Styling
- Tailwind CSS utility classes
- Consistent spacing and sizing
- Hover and focus states
- Accessible color contrasts

This structure provides a scalable, maintainable foundation for the study planner application with clear separation of concerns and reusable components.