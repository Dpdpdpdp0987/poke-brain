# 🧠 Poke-Brain

An automated assistant brain extension with ADHD-friendly tools, task tracking and knowledge management. Poke-Brain helps you stay organized with intelligent reminders, task management, and a brain-dump friendly interface designed for neurodivergent thinking patterns.

## ✨ Features

- 📝 **Task Tracking**: Capture thoughts and tasks quickly without friction
- ⏰ **ADHD-Friendly Reminders**: Smart, gentle nudges that actually work
- 🧩 **Brain Dump Mode**: Get everything out of your head and organize later
- 🎯 **Priority Management**: Automatically surface what matters most
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
│   │   ├── tasks.js       # Task management API
│   │   └── reminders.js   # Reminder system API
│   └── index.js           # Main application page
├── lib/
│   └── db.js              # In-memory database
├── components/            # React components (to be added)
├── styles/                # CSS/styling files (to be added)
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

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Runtime**: Node.js
- **Styling**: CSS Modules (ready for Tailwind CSS)
- **Database**: In-memory (easily replaceable with PostgreSQL, MongoDB, etc.)

## 🎯 Roadmap

- [ ] Frontend UI components
- [ ] User authentication
- [ ] Persistent database integration
- [ ] Calendar integration
- [ ] Voice input for brain dumps
- [ ] Mobile app (React Native)
- [ ] AI-powered task prioritization
- [ ] Pomodoro timer integration

## 🤝 Contributing

Contributions are welcome! This is a personal project built with neurodivergent needs in mind, so if you have ideas for ADHD-friendly features, please share them.

## 📄 License

MIT License - see LICENSE file for details

## 💡 Why "Poke-Brain"?

Because sometimes our brains need a gentle poke to remember things, and this app does exactly that - it's your external brain that keeps track of everything so you don't have to!

---

**Built with 💙 for better executive function**