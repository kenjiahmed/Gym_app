# Gym Training Web Application

A modern, full-stack gym training application built with Next.js 14, NestJS, PostgreSQL, and Prisma. Track your workouts, build custom training plans, and monitor your fitness progress.

## 🎯 Features

- **Authentication**: Secure JWT-based registration and login
- **Dashboard**: Weekly stats, total sessions, and workout overview
- **Workout Plans**: Create custom workout plans with exercises
- **Workout Sessions**: Real-time workout tracking with timer and rest intervals
- **Progress Tracking**: Complete workout history with detailed analytics
- **Admin Panel**: Manage exercises and workout plans
- **Responsive Design**: Mobile-friendly dark mode interface

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **React Query** (TanStack Query)
- **Framer Motion** animations
- **Lucide Icons**
- **Zustand** state management

### Backend
- **NestJS**
- **PostgreSQL**
- **Prisma ORM**
- **JWT Authentication**
- **bcrypt** password hashing
- **REST API**

## 📁 Project Structure

```
gym-training-app/
├── backend/                 # NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   └── src/
│       ├── modules/
│       │   ├── auth/       # Authentication module
│       │   ├── users/      # User management
│       │   ├── exercises/  # Exercise CRUD
│       │   ├── workout-plans/
│       │   └── workout-sessions/
│       └── prisma/         # Prisma service
│
└── frontend/               # Next.js frontend
    ├── app/
    │   ├── login/         # Login page
    │   ├── register/      # Registration page
    │   └── dashboard/     # Protected routes
    │       ├── page.tsx   # Dashboard home
    │       ├── workouts/  # Workout management
    │       ├── history/   # Workout history
    │       └── admin/     # Admin panel
    ├── components/
    │   └── ui/           # shadcn/ui components
    └── lib/
        ├── api.ts        # API client
        └── store.ts      # Zustand store
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **PostgreSQL** 14+
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gym-training-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/gym_training_db"
# JWT_SECRET="your-super-secret-key"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample exercises
npm run prisma:seed

# Start the backend server
npm run start:dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Verify API URL in .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start the frontend development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Database Setup (PostgreSQL)

If you don't have PostgreSQL installed:

**On Windows:**
```bash
# Using chocolatey
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

**Create Database:**
```bash
psql -U postgres
CREATE DATABASE gym_training_db;
\q
```

## 📖 Usage Guide

### First Time Setup

1. **Register an Account**
   - Navigate to `http://localhost:3000`
   - Click "Sign up"
   - Enter your name, email, and password (min 6 characters)

2. **Create a Workout Plan**
   - Go to Dashboard → "New Workout"
   - Enter plan name (e.g., "Push Day")
   - Add exercises from the library
   - Configure sets, reps, and rest time for each exercise
   - Save the plan

3. **Start a Workout**
   - From the Dashboard, click "Start" on any workout plan
   - Complete sets by entering reps and weight
   - Use the rest timer between sets
   - Add notes about your workout
   - Click "Complete Workout" when done

4. **Track Progress**
   - View workout history in the "History" section
   - Check weekly stats on the Dashboard
   - Monitor total sessions and progress

5. **Manage Exercises (Admin)**
   - Go to "Admin" panel
   - Add custom exercises
   - Delete unused exercises or workout plans

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiration
- Protected routes on both frontend and backend
- CORS configured for localhost development
- Input validation with class-validator
- SQL injection prevention via Prisma

## 🗄️ Database Models

- **User**: Authentication and profile
- **Exercise**: Exercise library with muscle groups
- **WorkoutPlan**: Custom workout templates
- **WorkoutExercise**: Exercises within a plan
- **WorkoutSession**: Active/completed workouts
- **CompletedSet**: Individual set tracking

## 🎨 Design Philosophy

- **Dark Mode First**: Premium gym aesthetic
- **Minimal & Clean**: No visual clutter
- **Smooth Animations**: Subtle Framer Motion transitions
- **Mobile Responsive**: Desktop-first, mobile-friendly
- **Consistent UI**: shadcn/ui component library

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Exercises
- `GET /exercises` - List all exercises
- `POST /exercises` - Create exercise (admin)
- `PATCH /exercises/:id` - Update exercise
- `DELETE /exercises/:id` - Delete exercise

### Workout Plans
- `GET /workout-plans` - List user's plans
- `POST /workout-plans` - Create new plan
- `GET /workout-plans/:id` - Get plan details
- `PATCH /workout-plans/:id` - Update plan
- `DELETE /workout-plans/:id` - Delete plan

### Workout Sessions
- `POST /workout-sessions/start` - Start workout
- `GET /workout-sessions/active` - Get active session
- `PATCH /workout-sessions/:id/complete` - Complete workout
- `GET /workout-sessions/history` - Get workout history
- `DELETE /workout-sessions/:id` - Cancel session

### Users
- `GET /users/stats` - Get user statistics

## 🧪 Development Commands

### Backend
```bash
npm run start:dev       # Start dev server with hot reload
npm run build           # Build for production
npm run start:prod      # Run production build
npm run prisma:studio   # Open Prisma Studio
npm run lint            # Run ESLint
```

### Frontend
```bash
npm run dev            # Start Next.js dev server
npm run build          # Build for production
npm run start          # Run production build
npm run lint           # Run ESLint
```

## 🐛 Troubleshooting

**Backend won't start:**
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env
- Run `npm run prisma:generate`

**Frontend can't connect to backend:**
- Ensure backend is running on port 3001
- Check NEXT_PUBLIC_API_URL in .env.local
- Clear browser localStorage and refresh

**Database migration errors:**
- Drop the database and recreate: `DROP DATABASE gym_training_db; CREATE DATABASE gym_training_db;`
- Run migrations again: `npm run prisma:migrate`

## 🚢 Production Deployment

### Backend (Railway/Render/Heroku)
1. Set environment variables (DATABASE_URL, JWT_SECRET)
2. Run `npm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Seed database: `npm run prisma:seed`
5. Start: `npm run start:prod`

### Frontend (Vercel/Netlify)
1. Set NEXT_PUBLIC_API_URL to your backend URL
2. Run `npm run build`
3. Deploy the `.next` folder

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

This is a production-ready template. Feel free to fork and customize for your needs!

---

**Built with ❤️ for fitness enthusiasts**
