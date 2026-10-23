# Gym Training Frontend - Next.js 14

Modern web application for tracking gym workouts.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Start development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

## Features

- **Authentication**: JWT-based login/register
- **Dashboard**: Real-time stats and workout overview
- **Workout Builder**: Drag-and-drop exercise selection
- **Live Workout**: Timer, rest periods, set tracking
- **History**: Complete workout history with details
- **Admin**: Manage exercises and plans

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query for data fetching
- Framer Motion for animations
- Zustand for state management

## Project Structure

```
app/
├── (auth)/
│   ├── login/           # Login page
│   └── register/        # Registration page
├── dashboard/
│   ├── layout.tsx       # Protected layout with sidebar
│   ├── page.tsx         # Dashboard home
│   ├── workouts/
│   │   └── new/         # Create workout plan
│   ├── workout/
│   │   └── start/[id]/  # Active workout session
│   ├── history/         # Workout history
│   └── admin/           # Admin panel
├── layout.tsx           # Root layout
└── globals.css          # Global styles

components/
├── ui/                  # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
└── providers.tsx        # React Query provider

lib/
├── api.ts              # API client & types
├── store.ts            # Zustand auth store
└── utils.ts            # Utility functions
```

## Pages

### Public Routes
- `/` - Redirects to login or dashboard
- `/login` - User login
- `/register` - User registration

### Protected Routes (requires authentication)
- `/dashboard` - Main dashboard with stats
- `/dashboard/workouts/new` - Create workout plan
- `/dashboard/workout/start/[id]` - Active workout session
- `/dashboard/history` - Workout history
- `/dashboard/admin` - Exercise management

## Components

### UI Components (shadcn/ui)
- `Button` - Customizable button with variants
- `Card` - Content container
- `Input` - Form input field
- `Label` - Form label
- `Textarea` - Multi-line text input

### Custom Components
- `Providers` - React Query setup
- Dashboard Layout - Sidebar navigation

## State Management

### Zustand Store
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  setAuth: (user, token) => void,
  clearAuth: () => void
}
```

### React Query Queries
- `stats` - User statistics
- `workout-plans` - User's workout plans
- `exercises` - Exercise library
- `active-session` - Current workout session
- `workout-history` - Completed workouts

## API Integration

All API calls go through the `lib/api.ts` module:

```typescript
// Example usage
import { authApi, workoutPlansApi } from '@/lib/api';

// Login
const response = await authApi.login({ email, password });

// Get workout plans
const plans = await workoutPlansApi.getAll();
```

Authentication token is automatically attached to requests via axios interceptor.

## Styling

### Tailwind Classes
- Dark mode by default (`dark` class on `<html>`)
- CSS variables for theming
- Utility-first approach

### Color Scheme
```css
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--primary: 0 0% 98%;
--secondary: 240 3.7% 15.9%;
--accent: 240 3.7% 15.9%;
--muted: 240 3.7% 15.9%;
```

## Development

### Commands
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Adding New Pages
1. Create page in `app/` directory
2. Add route to sidebar if needed
3. Implement UI with shadcn components
4. Connect to API using React Query

### Adding New Components
```bash
# shadcn/ui components are already included
# For custom components, create in components/
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
vercel --prod
```

### Environment Variables (Production)
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## License

MIT
