# Notes Tracker

A complete, production-ready, and security-hardened Notes Tracker application built using the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS, JWT authentication, categories, and file uploads.

## Features

- **Authentication & User Management**: Register, login, logout, edit profile, change password, and delete account. Passwords are encrypted using `bcrypt`, and sessions are verified using JWTs.
- **Notes CRUD**: Complete CRUD operations for notes. Support for archiving, favouriting, pinning, and restoring notes.
- **Categorization**: Users can create, update, delete, and assign categories to notes.
- **Search & Filter**: Keyword search, filters for categories, tags, priority, and sorting options, plus paginated results.
- **File Uploads**: Support for uploading local images to note content using `multer`.
- **Dashboard Stats**: Displays total notes, pinned notes, archived notes, favourite notes, category distribution, and recent notes.
- **UI/UX**: Responsive layouts, modern premium typography, Dark Mode toggle, fast page transitions, and styling with Tailwind CSS.
- **Security**: Hardened via `helmet` headers, API rate limiting, cookie parsed tokens, and input validation.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, Vite, Tailwind CSS, React Router, Native Fetch API (no Axios)
- **Deployment**: Docker, Docker Compose

---

## Directory Structure

```text
Notes Tracker/
├── backend/
│   ├── src/
│   │   ├── config/       # DB configuration
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, uploads, and error middlewares
│   │   ├── models/       # Mongoose schemas
│   │   └── routes/       # API endpoints
│   ├── uploads/          # Local storage for images
│   ├── server.js         # Express app entrypoint
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared UI elements
│   │   ├── context/      # Authentication & Theme Context
│   │   ├── layouts/      # Dashboard and Page Layouts
│   │   ├── pages/        # Route page views
│   │   ├── services/     # Native Fetch API client
│   │   ├── App.jsx       # Routing entrypoint
│   │   └── main.jsx      # React setup
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or via docker)
- [Docker](https://www.docker.com/) (optional, for containerised execution)

### 1. Configure Environment Variables

Copy the `.env.example` file to `backend/.env` (and optionally create one in the root folder):

```bash
cp .env.example backend/.env
```

Open `backend/.env` and update the values (e.g. `MONGODB_URI`, `JWT_SECRET`).

### 2. Local Setup (Without Docker)

From the root directory, install all dependencies:

```bash
npm run install-all
```

Start the backend:

```bash
npm run backend
```

Start the frontend:

```bash
npm run frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Docker Deployment (With Docker Compose)

You can launch the entire ecosystem (MongoDB, Backend, and Frontend) in one command:

```bash
docker-compose up --build
```

- Backend API: [http://localhost:5000](http://localhost:5000)
- Frontend client: [http://localhost](http://localhost)
- MongoDB instance: `localhost:27017`

---

## Git Workflow Guidelines

After every small feature or bug fix:

1. `git add .`
2. `git commit -m "<type>(<scope>): <description>"` (e.g. `feat(auth): add login endpoint`)
3. `git push origin <branch-name>`
