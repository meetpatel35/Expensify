# ExpenseTracker

A responsive, mobile-first web application for tracking household expenses with batch entry, category management, and visual analytics.

## Tech Stack

* **Frontend:** React 18, Vite, React Router
* **Styling:** Tailwind CSS v3, shadcn/ui components (if added)
* **Charts:** Recharts
* **Backend:** Express.js, Node.js
* **Database:** MongoDB Atlas (Mongoose)
* **Auth:** JWT (JSON Web Tokens)

## Prerequisites

* Node.js (v20.13+)
* MongoDB Atlas cluster (or local MongoDB)

## Environment Variables

Create a `.env` file in the root of your project with the following:

```env
MONGODB_URI=your_mongodb_connection_string_with_database_name
JWT_SECRET=your_super_secret_string
PORT=5000
```

*Note: Ensure your `MONGODB_URI` includes the database name (e.g., `...mongodb.net/expensetracker?...`).*

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application (Frontend + Backend):**
   ```bash
   npm run dev:all
   ```
   This will use `concurrently` to run both the Vite development server (port 5173) and the Express backend server (port 5000).

3. **Open in Browser:**
   Navigate to `http://localhost:5173`

## Scripts

* `npm run dev` - Starts only the Vite frontend.
* `npm run server` - Starts only the Express backend using nodemon.
* `npm run dev:all` - Starts BOTH frontend and backend concurrently.
* `npm run build` - Builds the frontend for production.

## Project Structure

* `/src` - React frontend code (pages, components, context, etc.)
* `/server` - Express backend code (models, routes, auth middleware)
