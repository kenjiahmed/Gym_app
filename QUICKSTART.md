# Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 1. Start PostgreSQL
```bash
# Windows (if using chocolatey)
net start postgresql

# Or start PostgreSQL service from Services app
```

## 2. Create Database
```bash
psql -U postgres
CREATE DATABASE gym_training_db;
\q
```

## 3. Backend Setup (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://postgres:password@localhost:5432/gym_training_db"

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

✅ Backend running on http://localhost:3001

## 4. Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

✅ Frontend running on http://localhost:3000

## 5. First Login
1. Open http://localhost:3000
2. Click "Sign up"
3. Create an account
4. Start creating workout plans!

## Common Issues

**Port 3001 already in use:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Database connection error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists

**Frontend can't connect:**
- Verify backend is running on port 3001
- Check NEXT_PUBLIC_API_URL in frontend/.env.local

## Default Data
The seed script creates 19 exercises across muscle groups:
- Chest (3 exercises)
- Back (4 exercises)
- Shoulders (3 exercises)
- Arms (4 exercises)
- Legs (5 exercises)

## What's Next?
1. **Create a Workout Plan**: Dashboard → New Workout
2. **Add Exercises**: Select from the library
3. **Start Workout**: Click "Start" on any plan
4. **Track Progress**: Complete sets and view history

Enjoy your training! 💪
