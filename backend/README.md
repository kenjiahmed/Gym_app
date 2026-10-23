# Gym Training Backend - NestJS

REST API backend for the Gym Training application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/gym_training_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
```

3. Setup database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with exercises
npm run prisma:seed

# (Optional) Open Prisma Studio
npm run prisma:studio
```

4. Start the server:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

### Protected Endpoints

All endpoints below require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

### Exercises

```http
# List all exercises
GET /exercises

# Get exercise by ID
GET /exercises/:id

# Create exercise
POST /exercises
{
  "name": "Bench Press",
  "muscleGroup": "Chest",
  "description": "Compound chest exercise"
}

# Update exercise
PATCH /exercises/:id
{
  "name": "Updated Name"
}

# Delete exercise
DELETE /exercises/:id
```

### Workout Plans

```http
# List user's workout plans
GET /workout-plans

# Get specific plan
GET /workout-plans/:id

# Create workout plan
POST /workout-plans
{
  "name": "Push Day",
  "description": "Upper body push workout",
  "exercises": [
    {
      "exerciseId": "uuid",
      "sets": 3,
      "reps": 10,
      "restTime": 60,
      "order": 0
    }
  ]
}

# Update workout plan
PATCH /workout-plans/:id
{
  "name": "Updated Push Day"
}

# Delete workout plan
DELETE /workout-plans/:id
```

### Workout Sessions

```http
# Start workout
POST /workout-sessions/start
{
  "workoutPlanId": "uuid"
}

# Get active session
GET /workout-sessions/active

# Complete workout
PATCH /workout-sessions/:id/complete
{
  "completedSets": [
    {
      "exerciseId": "uuid",
      "setNumber": 1,
      "reps": 10,
      "weight": 60.5
    }
  ],
  "notes": "Great workout!"
}

# Get workout history
GET /workout-sessions/history

# Get session by ID
GET /workout-sessions/:id

# Cancel session
DELETE /workout-sessions/:id
```

### User Stats

```http
GET /users/stats
```

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

## Development

### Project Structure
```
src/
├── modules/
│   ├── auth/              # JWT authentication
│   ├── users/             # User management
│   ├── exercises/         # Exercise CRUD
│   ├── workout-plans/     # Workout plan management
│   └── workout-sessions/  # Workout tracking
├── prisma/               # Prisma service
├── app.module.ts         # Root module
└── main.ts              # Application entry
```

### Common Commands
```bash
npm run start:dev         # Start with hot reload
npm run build             # Build for production
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open database GUI
npm run prisma:seed       # Seed database
```

## Technologies

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

## License

MIT
