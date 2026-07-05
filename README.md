# Employee Dashboard

A modern, full-featured Employee Dashboard built with React and Tailwind CSS. This application provides employees with tools to manage attendance, leave requests, team directory, and company announcements — including an AI-powered announcement summarizer.

## Live Demo

> Deploy to Vercel/Netlify and add your URL here.

## Features

### Core Requirements
- **Attendance Dashboard** — View attendance logs, hours worked charts, and status breakdown
- **Leave Summary** — Track annual, sick, and personal leave balances with usage progress bars
- **Leave Request Form** — Submit requests with start/end dates, leave type, and reason (with validation)
- **Team Directory** — Search and filter colleagues by name, department, and status
- **Company Announcements** — Browse company-wide updates with priority and category tags

### AI Feature
- **AI Announcement Summarizer** — Intelligently extracts key points, action items, and priority from long announcements using NLP-based summarization

### Bonus Features
- Dark mode with system preference detection
- Fully responsive design (mobile, tablet, desktop)
- Interactive charts (bar chart, pie chart) via Recharts
- Profile page with employee details
- Loading states and skeleton loaders
- Toast notifications for user actions
- Smooth fade-in and slide-up animations
- Voice search in Team Directory (Web Speech API)

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 6 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| React Router 7 | Client-side routing |
| Recharts | Data visualization |
| Lucide React | Icon library |
| date-fns | Date formatting & calculations |
| Context API | Global state management |

## Project Structure

```
employee-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Layout wrapper
│   │   └── ui/              # Reusable UI (Card, Button, Input, Badge, etc.)
│   ├── context/
│   │   ├── AppContext.jsx   # Global app state & data fetching
│   │   └── ThemeContext.jsx # Dark mode state
│   ├── data/                # Mock JSON data files
│   ├── pages/               # Route-level page components
│   ├── services/
│   │   ├── api.js           # Mock API with simulated delays
│   │   └── aiService.js     # AI announcement summarizer
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
cd employee-dashboard
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Architecture

### State Management
The app uses React Context API with two providers:
- **ThemeContext** — Manages dark/light mode, persists preference to localStorage
- **AppContext** — Centralizes data fetching, leave submissions, and notifications

### Data Layer
Mock APIs in `src/services/api.js` simulate network latency (400–800ms) and return data from local JSON files. This makes it easy to swap in real API endpoints later.

### AI Summarizer
The AI feature (`src/services/aiService.js`) uses rule-based NLP extraction:
- Scores sentences by relevance keywords, dates, and action verbs
- Extracts action items via regex pattern matching
- Detects priority from urgency indicators
- Simulates processing delay for realistic UX

In production, this would integrate with an LLM API (OpenAI GPT, Anthropic Claude, etc.).

## AI Tools Used

| Tool | Usage |
|---|---|
| Cursor AI | Code generation, architecture design, component scaffolding |
| Rule-based NLP | Announcement summarization algorithm |

## Assumptions & Trade-offs

| Assumption | Rationale |
|---|---|
| Single logged-in user (Alex Morgan) | Simplifies auth; real app would use JWT/session |
| Mock data with simulated API delays | Demonstrates loading states without backend dependency |
| Rule-based AI vs. real LLM API | No API key required; works offline; easily swappable |
| Context API over Redux | Sufficient for app scope; avoids unnecessary complexity |
| Client-side voice search | Uses Web Speech API; browser-dependent support |
| Business days for leave calculation | Standard HR practice; excludes weekends |

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy the `dist` folder
```

## Interview Guide — How to Present This Project

Use this script when explaining the project to an interviewer:

### 1. Opening (30 seconds)
> "I built an Employee Dashboard in React and Tailwind CSS — a single-page app where employees can track attendance, manage leave, browse the team directory, and read company announcements. It includes an AI announcement summarizer and a floating AI chat assistant."

### 2. Architecture (1 minute)
> "I used **React 19 with Vite** for fast development, **React Router** for page navigation, and **Context API** for global state — one context for app data and notifications, another for dark mode. Data comes from mock JSON files through a service layer that simulates API delays, so loading states feel realistic. In production, I'd swap the mock API for real REST endpoints."

### 3. Key Features Demo Flow
Walk through in this order:
1. **Dashboard** — "This is the command center. It shows attendance rate, leave balance, team count, today's status, and a recent activity feed — all in one screen."
2. **Submit Leave** — "When I submit a leave request, you get a toast notification with dates and days, it appears in the bell icon history, and shows in the Dashboard activity feed."
3. **Attendance** — "Bar and pie charts built with Recharts for hours worked and status breakdown."
4. **Calendar** — "Monthly view combining attendance and leave events."
5. **Team** — "Search and filter by department; voice search using Web Speech API."
6. **Announcements + AI** — "Click AI Summarize to extract key points and action items."
7. **AI Chat** — "Floating assistant answers questions about leave, attendance, team, and announcements."
8. **Dark Mode** — Toggle in sidebar; preference saved to localStorage.

### 4. Technical Highlights to Mention
| Topic | What to Say |
|---|---|
| **Reusable components** | Card, Button, Input, Badge, Calendar — used across all pages |
| **Form validation** | Leave form validates dates, reason length; shows error notifications |
| **State management** | Context API with `addNotification`, `activityFeed`, `submitLeaveRequest` |
| **Responsive design** | Mobile sidebar, responsive grids, adaptive chat panel |
| **AI feature** | Rule-based NLP for summarization; keyword-matching chat bot (swappable with OpenAI API) |
| **UX polish** | Loading spinners, toast notifications, staggered animations, notification bell |

### 5. Trade-offs (shows maturity)
> "I used Context API instead of Redux because the app scope doesn't need it. AI is rule-based so it works without API keys — in production I'd integrate OpenAI. Auth is mocked with a single user — real app would use JWT."

### 6. Closing
> "The project covers all assignment requirements plus bonus features like dark mode, charts, calendar, AI chat, voice search, and notifications. The code is modular and ready to connect to a real backend."

---

## License

MIT
