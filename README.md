# 🏙️ Civic Issue Tracker

A full-stack civic-tech platform that lets citizens report local infrastructure problems — potholes, broken street lights, garbage collection issues, and waterlogging — pin them on a map, and track their resolution status. Built with Next.js 16 (App Router), TypeScript, and PostgreSQL.

**Live Demo:** [civic-issue-tracker-ojjpf3jj5-chhaya-shahs-projects.vercel.app](https://civic-issue-tracker-ojjpf3jj5-chhaya-shahs-projects.vercel.app)

---

## ✨ Features

### For Citizens
- **Authentication** — Secure signup/login with hashed passwords (NextAuth v5 + bcrypt)
- **Report Issues** — Submit issues with a title, description, category, photo, and exact map location
- **Duplicate Detection** — Warns users of similar issues already reported nearby (within 200m) before they submit a new one
- **Browse & Search** — View all issues on an interactive map or as a list, filter by category, and search by keyword
- **Upvoting** — Upvote existing issues to signal priority (toggleable, race-condition safe)
- **Comments** — Discuss issues with other citizens
- **Edit / Delete** — Manage your own reported issues
- **Profile Page** — View your personal stats: issues reported, resolved count, upvotes received
- **Public Profiles** — View any contributor's public activity from the leaderboard
- **Leaderboard** — Top contributors ranked by issues reported and community upvotes
- **Notifications** — In-app bell notifications when your issue receives a comment or status update
- **Dark Mode** — Full light/dark theme toggle across the app

### For Admins
- **Role-Based Access Control** — Admin routes and actions are protected both client-side and server-side
- **Status Management** — Move issues through Pending → In Review → Resolved
- **Analytics Dashboard** — Visual breakdown of issues by category and status, plus a monthly reporting trend chart (Recharts)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (hosted on [Neon](https://neon.tech)) |
| ORM | Prisma 7 (with driver adapters) |
| Authentication | NextAuth.js v5 (Credentials provider + bcrypt) |
| Image Storage | Cloudinary |
| Maps | Leaflet + React-Leaflet (OpenStreetMap tiles) |
| Charts | Recharts |
| Theming | next-themes |

---

## 📐 Architecture Highlights

- **Server + Client Component split** — The home page fetches live stats directly from the database in a Server Component for fast, SEO-friendly initial load, then hands off to a Client Component for the interactive map.
- **Ownership-based authorization** — Every mutation (edit, delete, upvote, comment) checks both that a user is authenticated *and* that they own the resource (or are an admin) — enforced server-side in the API routes, not just hidden in the UI.
- **Geospatial duplicate detection** — Uses the Haversine formula to calculate real-world distance between GPS coordinates and flag potential duplicate reports within a 200-meter radius.
- **Debounced API calls** — The duplicate-check and search features debounce user input to avoid firing a request on every keystroke or map click.
- **Optimistic-safe upvoting** — Upvote toggling is guarded against double-submission race conditions using client-side request tracking.

---

## 🗄️ Data Model

User
├── Issue[] (issues they reported)
├── Upvote[] (issues they've upvoted)
├── Comment[] (comments they've made)
└── Notification[] (alerts for their activity)

Issue
├── belongs to User (creator)
├── Upvote[]
└── Comment[]


Enums: `Role` (CITIZEN, ADMIN) · `Category` (POTHOLE, STREETLIGHT, GARBAGE, WATERLOGGING, OTHER) · `Status` (PENDING, IN_REVIEW, RESOLVED)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) (or any PostgreSQL) database
- A [Cloudinary](https://cloudinary.com) account for image uploads

### Setup

1. **Clone the repo**
```bash
   git clone <https://github.com/chhayashah/civic-issue-tracker>
   cd civic-issue-tracker
   npm install
```

2. **Environment variables** — create a `.env` file:
```env
   DATABASE_URL="your-neon-direct-connection-string"
   DATABASE_URL_POOLED="your-neon-pooled-connection-string"

   AUTH_SECRET="a-random-secret-string"

   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
```

3. **Set up the database**
```bash
   npx prisma migrate dev
   npx prisma generate
```

4. **Run the dev server**
```bash
   npm run dev
```
   Open [http://localhost:3000](http://localhost:3000).

5. **Create an admin account** (optional) — sign up normally, then open Prisma Studio and manually change that user's `role` to `ADMIN`:
```bash
   npx prisma studio
```


## 🔑 Demo Credentials

For quick testing without creating your own account:

| Role | Email | Password |
|---|---|---|
| Admin | `test@example.com` | `test123` |
---

## 📁 Project Structure
app/
├── api/ # API routes (issues, auth, upload, notifications, etc.)
├── admin/ # Admin dashboard
├── issues/ # Browse + issue detail pages
├── login/, signup/ # Auth pages
├── profile/ # Logged-in user's profile
├── users/[id]/ # Public profile pages
├── leaderboard/ # Top contributors
└── report/ # Report a new issue

components/ # Shared React components (Navbar, maps, charts, etc.)
prisma/
└── schema.prisma # Database schema


