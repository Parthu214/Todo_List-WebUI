# To-Do Dashboard

A modern To-Do List web application with subtasks, reminders, dark mode, and animated task cards.

## Features

- Add, edit, and delete tasks
- Create subtasks inside each task
- Mark tasks and subtasks as completed
- Set reminders/notifications for tasks before the deadline
- View pending and completed tasks separately
- Animated progress bars per task based on completed subtasks
- Dark mode / light mode toggle
- Responsive dashboard layout with smooth animations

## Tech Stack

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Node.js + Express
- Database: MongoDB (via Mongoose)

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Install & run MongoDB**

This project requires MongoDB running locally (or a remote MongoDB URI).

- If you don’t have MongoDB installed, install the Community Server from https://www.mongodb.com/try/download/community.
- Start MongoDB (e.g., `mongod` on the command line, or via the MongoDB Windows service).

3. **Configure environment**

Copy the example env file:

```bash
cp .env.example .env
```

Edit `.env` to point at your MongoDB instance (the default is `mongodb://localhost:27017/todo-dashboard`).

4. **Run the server**

```bash
npm run dev
```

> If `npm` is not recognized in VS Code, run these instead (you can paste them directly into the terminal):
>
> ```powershell
> cd "C:\Users\goran\OneDrive\Documents\project"
> $env:Path += ";C:\Program Files\nodejs"
> & "C:\Program Files\nodejs\npm.cmd" install
> & "C:\Program Files\nodejs\npm.cmd" run dev
> ```

5. **Open the app**

Visit: http://localhost:4000

## Database Schema

A `Task` document contains:

- `title` (String) - required
- `description` (String)
- `dueDate` (Date)
- `reminder` (Date)
- `status` (String) - `pending` or `completed`
- `subtasks` (Array)
  - `title` (String)
  - `completed` (Boolean)

## Notes

- Browser notifications require permission. Accept the prompt to get reminder popups.
- The reminder checks run in the browser and fire a notification at the reminder time if the task is not completed.
