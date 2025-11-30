# 🧠 Poke-Brain

An automated assistant brain extension with ADHD-friendly tools, task tracking and knowledge management. Poke-Brain helps you stay organized with intelligent reminders, task management, and a brain-dump friendly interface designed for neurodivergent thinking patterns.

## ✨ Features

- 📝 **Task Tracking**: Capture thoughts and tasks quickly without friction
- ⏰ **ADHD-Friendly Reminders**: Smart, gentle nudges that actually work
- 🧩 **Brain Dump Mode**: Get everything out of your head and organize later
- 🎯 **Priority Management**: Automatically surface what matters most
- 🚨 **Never Forget**: Critical task tracking with persistent reminders and escalation
- 💾 **Simple Data Storage**: Lightweight in-memory database (easily extensible)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dpdpdpdp0987/poke-brain.git
   cd poke-brain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
poke-brain/
├── pages/
│   ├── api/
│   │   ├── tasks.js         # Task management API
│   │   ├── reminders.js     # Reminder system API
│   │   └── never-forget.js  # Never Forget critical task API
│   └── index.js             # Main application page
├── lib/
│   ├── db.js                # In-memory database
│   └── never-forget.js      # Never Forget core logic
├── components/              # React components (to be added)
├── styles/                  # CSS/styling files (to be added)
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Tasks API (`/api/tasks`)

- **GET** `/api/tasks` - Retrieve all tasks
- **POST** `/api/tasks` - Create a new task
  ```json
  {
    "title": "Task title",
    "description": "Task description",
    "priority": "high" | "medium" | "low"
  }
  ```
- **PUT** `/api/tasks` - Update a task
  ```json
  {
    "id": "task-id",
    "completed": true
  }
  ```
- **DELETE** `/api/tasks?id=task-id` - Delete a task

### Reminders API (`/api/reminders`)

- **GET** `/api/reminders` - Retrieve all reminders
- **POST** `/api/reminders` - Create a new reminder
  ```json
  {
    "title": "Reminder title",
    "message": "Reminder message",
    "remindAt": "2025-11-30T15:00:00Z",
    "type": "gentle" | "persistent" | "urgent"
  }
  ```
- **DELETE** `/api/reminders?id=reminder-id` - Delete a reminder

### 🚨 Never Forget API (`/api/never-forget`)

The Never Forget system is designed for critical tasks that you absolutely cannot miss. It features intelligent priority scoring, automatic escalation for overdue tasks, and ADHD-friendly micro-step breakdowns.

#### Get Critical Tasks

- **GET** `/api/never-forget` - Get all critical tasks (sorted by priority)
- **GET** `/api/never-forget?top=3` - Get top 3 priority tasks
- **GET** `/api/never-forget?alerts=true` - Get only urgent alerts
- **GET** `/api/never-forget?stats=true` - Get statistics
- **GET** `/api/never-forget?includeCompleted=true` - Include completed tasks
- **GET** `/api/never-forget?escalationStage=urgent` - Filter by escalation stage

**Response includes:**
- Priority score (calculated from deadline, importance, and recency)
- Escalation stage (normal → attention → urgent → critical → emergency)
- Visual indicators (emoji, color, urgency bar, animations)
- Micro-steps for breaking down tasks
- Snooze tracking and history

#### Create Critical Task

- **POST** `/api/never-forget`
  ```json
  {
    "title": "Submit project report",
    "description": "Q4 financial analysis report",
    "importance": "critical" | "high" | "medium" | "low",
    "deadline": "2025-12-01T17:00:00Z",
    "tags": ["work", "urgent"]
  }
  ```

**Importance Levels:**
- `critical` - Cannot be missed under any circumstances
- `high` - Very important (default)
- `medium` - Important but flexible
- `low` - Good to do but not urgent

#### Update Critical Task

- **PUT** `/api/never-forget`

**Complete a task:**
```json
{
  "action": "complete",
  "taskId": "task-id"
}
```

**Snooze a task:**
```json
{
  "action": "snooze",
  "taskId": "task-id",
  "until": "2025-12-01T09:00:00Z",
  "reason": "Waiting for client feedback"
}
```
*Note: Multiple snoozes will trigger escalation alerts*

**Add a note:**
```json
{
  "action": "note",
  "taskId": "task-id",
  "note": "Spoke with manager, deadline extended to Friday"
}
```

**Update micro-step:**
```json
{
  "action": "step",
  "taskId": "task-id",
  "stepId": "step-id",
  "completed": true
}
```

#### Delete Task

- **DELETE** `/api/never-forget?id=task-id` - Delete specific task
- **DELETE** `/api/never-forget?clearCompleted=true` - Clear all completed tasks

*Recommendation: Mark tasks as complete instead of deleting for better tracking*

### 🎯 Never Forget Features

#### Priority Scoring System
Tasks are automatically scored based on:
- **Importance level** (critical/high/medium/low)
- **Deadline urgency** (exponential increase as deadline approaches)
- **Recency boost** (newly added tasks get temporary visibility)
- **Snooze penalty** (active snoozes reduce priority)
- **Consecutive snooze escalation** (multiple snoozes increase priority)

#### Escalation Stages
1. **Normal** 🟢 - Task is on track
2. **Attention** 🔵 - Task needs attention soon (< 3 days to deadline)
3. **Urgent** 🟡 - Task is becoming urgent (< 24 hours or multiple snoozes)
4. **Critical** 🟠 - Task is overdue or extremely urgent (< 6 hours)
5. **Emergency** 🔴 - Task is dangerously overdue (> 3 days overdue)

#### ADHD-Friendly Features
- **Visual Indicators**: Color coding, emojis, and urgency bars
- **Micro-Steps**: Tasks are automatically broken down into smaller, manageable steps
- **Snooze Intelligence**: Tracks snooze patterns and provides gentle warnings
- **Persistent Tracking**: Tasks don't disappear until explicitly completed
- **Momentum Encouragement**: Positive reinforcement messages

#### Example Usage

**Create a critical task with a deadline:**
```bash
curl -X POST http://localhost:3000/api/never-forget \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Submit tax documents",
    "importance": "critical",
    "deadline": "2025-12-15T23:59:59Z"
  }'
```

**Get top 5 priority tasks:**
```bash
curl http://localhost:3000/api/never-forget?top=5
```

**Check for urgent alerts:**
```bash
curl http://localhost:3000/api/never-forget?alerts=true
```

**Snooze a task:**
```bash
curl -X PUT http://localhost:3000/api/never-forget \
  -H "Content-Type: application/json" \
  -d '{
    "action": "snooze",
    "taskId": "abc-123",
    "until": "2025-12-01T14:00:00Z",
    "reason": "Waiting for documents"
  }'
```

**Mark task as complete:**
```bash
curl -X PUT http://localhost:3000/api/never-forget \
  -H "Content-Type: application/json" \
  -d '{
    "action": "complete",
    "taskId": "abc-123"
  }'
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Runtime**: Node.js
- **Styling**: CSS Modules (ready for Tailwind CSS)
- **Database**: In-memory (easily replaceable with PostgreSQL, MongoDB, etc.)

## 🎯 Roadmap

- [x] Never Forget critical task tracking
- [ ] Frontend UI components for Never Forget
- [ ] Frontend UI components for tasks and reminders
- [ ] User authentication
- [ ] Persistent database integration
- [ ] Calendar integration
- [ ] Voice input for brain dumps
- [ ] Mobile app (React Native)
- [ ] AI-powered task prioritization
- [ ] Pomodoro timer integration
- [ ] Browser extension for quick task capture

## 🤝 Contributing

Contributions are welcome! This is a personal project built with neurodivergent needs in mind, so if you have ideas for ADHD-friendly features, please share them.

## 📄 License

MIT License - see LICENSE file for details

## 💡 Why "Poke-Brain"?

Because sometimes our brains need a gentle poke to remember things, and this app does exactly that - it's your external brain that keeps track of everything so you don't have to!

---

**Built with 💙 for better executive function**