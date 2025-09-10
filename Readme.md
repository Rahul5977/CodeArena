# 🧠 CodeArena - Online Coding Platform

CodeArena is a full-stack coding platform designed to provide a comprehensive environment for practicing problems, hosting contests, AI-based code reviews, and more.

---

## Features

- 🧩 Problems: Solve coding problems and track your progress.
- 🏆 Contests: Participate in coding contests and view leaderboards.
- 📚 DSA Sheets: Practice curated DSA sheets.
- 🧠 AI Code Review: Get instant feedback on your code.
- 👥 Playlists: Organize problems into playlists.
- 🛡️ Role-Based Access Control: Admin and Superadmin features.
- ⚡ Real-time: Live updates via Socket.IO.
- 🎨 Modern UI: Built with React, Vite, Tailwind CSS, DaisyUI.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, DaisyUI, React Icons, Monaco Editor
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Real-time:** Socket.IO
- **Authentication:** JWT, Cookies
- **AI Review:** Judge0 API (or custom AI service)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rahul5977/CodeArena
cd CodeArena
```

### 2. Install dependencies

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd ../backend
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="your_postgres_url"
SECRET="your_jwt_secret"
PORT=8080
NODE_ENV=development
JUDGE0_API_URL="your_judge0_url"
```

### 4. Set up the database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the backend server

```bash
npm run dev
```

### 6. Start the frontend dev server

```bash
cd ../frontend
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)  
Backend runs on [http://localhost:8080](http://localhost:8080)

---

## Folder Structure

```
CodeArena/
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   ├── contexts/
  │   │   ├── pages/
  │   │   ├── utils/
  │   │   └── index.css
  │   ├── vite.config.js
  │   └── tailwind.config.js
  ├── backend/
  │   ├── src/
  │   │   ├── controllers/
  │   │   ├── routes/
  │   │   ├── libs/
  │   │   ├── utils/
  │   │   └── index.js
  │   ├── prisma/
  │   │   └── schema.prisma
  │   └── .env
  └── README.md
```

---

## Scripts

### Frontend

- `npm run dev` – Start Vite dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

### Backend

- `npm run dev` – Start backend with nodemon
- `npx prisma migrate dev` – Run migrations
- `npx prisma generate` – Generate Prisma client

---

## Troubleshooting

- **500 Internal Server Error:**  
  Check backend logs and ensure your database is migrated and `.env` is set up.

- **Prisma errors (missing columns):**  
  Run `npx prisma migrate dev` or `npx prisma db push` to sync your database.

- **React Icons import errors:**  
  Run `npm install react-icons@latest` in frontend.

- **CORS issues:**  
  Make sure backend CORS origin matches your frontend URL.

---

## Contributing

Pull requests are welcome!  
Please open issues for bugs and feature requests.

---

## License

MIT

---

## Credits

- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Prisma](https://www.prisma.io/)
- [Judge0](https://judge0.com/)
- [React](https://react.dev/)
