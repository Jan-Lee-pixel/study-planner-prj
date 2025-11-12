# Study Planner Project

A modern React-based study planner application that helps students organize their academic tasks, track progress, and leverage AI-powered study tools.

## Features

- **Task Management**: Create, organize, and track assignments, exams, and projects
- **Priority System**: Categorize tasks by priority (High, Medium, Low)
- **Progress Tracking**: Monitor completion rates and identify overdue items
- **AI Study Assistant**: Generate quizzes, summarize notes, and structure lessons
- **Smart Shortcuts**: Global quick-search palette, deadline notifications, and task detail pages
- **Dashboard**: Visual overview of study progress and upcoming deadlines
- **Modern UI**: Clean, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 19.1.1 with Vite
- **Styling**: Tailwind CSS 4.1.16
- **Icons**: Lucide React
- **Build Tool**: Vite 7.1.7
- **Linting**: ESLint with React plugins

## Project Structure

```
study-planner-prj/
├── front-end/
│   ├── src/
│   │   ├── components/
│   │   │   └── Home.jsx          # Main dashboard component
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

1. Navigate to the front-end directory:
   ```bash
   cd front-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Configure Gemini AI

To enable the AI assistant and floating chatbot, add your Gemini API key to `front-end/.env`:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Restart the dev server after updating environment variables.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Components

- **Dashboard**: Main interface showing task overview and statistics
- **Task Management**: Add, edit, and complete study tasks
- **AI Assistant**: Tools for quiz generation, note summarization, and lesson planning
- **Progress Tracking**: Visual indicators of study progress and deadlines
