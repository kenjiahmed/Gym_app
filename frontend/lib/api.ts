import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  restTime: number;
  order: number;
  exercise: Exercise;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  userId: string;
  workoutExercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface CompletedSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  startTime: string;
  endTime?: string;
  completed: boolean;
  notes?: string;
  workoutPlan: WorkoutPlan;
  completedSets: CompletedSet[];
}

export interface Stats {
  totalSessions: number;
  weeklyWorkouts: number;
  lastWorkout: WorkoutSession | null;
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getStats: () => api.get<Stats>('/users/stats'),
  updateProfile: (data: { name?: string; fitnessGoal?: string }) =>
    api.patch<User & { fitnessGoal?: string }>('/users/profile', data),
};

// Exercises API
export const exercisesApi = {
  getAll: () => api.get<Exercise[]>('/exercises'),
  getById: (id: string) => api.get<Exercise>(`/exercises/${id}`),
  create: (data: Omit<Exercise, 'id'>) => api.post<Exercise>('/exercises', data),
  update: (id: string, data: Partial<Exercise>) =>
    api.patch<Exercise>(`/exercises/${id}`, data),
  delete: (id: string) => api.delete(`/exercises/${id}`),
};

// Workout Plans API
export const workoutPlansApi = {
  getAll: () => api.get<WorkoutPlan[]>('/workout-plans'),
  getById: (id: string) => api.get<WorkoutPlan>(`/workout-plans/${id}`),
  create: (data: {
    name: string;
    description?: string;
    exercises: {
      exerciseId: string;
      sets: number;
      reps: number;
      restTime: number;
      order: number;
    }[];
  }) => api.post<WorkoutPlan>('/workout-plans', data),
  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      exercises?: {
        exerciseId: string;
        sets: number;
        reps: number;
        restTime: number;
        order: number;
      }[];
    }
  ) => api.patch<WorkoutPlan>(`/workout-plans/${id}`, data),
  delete: (id: string) => api.delete(`/workout-plans/${id}`),
};

// Workout Sessions API
export const workoutSessionsApi = {
  start: (workoutPlanId: string) =>
    api.post<WorkoutSession>('/workout-sessions/start', { workoutPlanId }),
  complete: (
    id: string,
    data: {
      completedSets: {
        exerciseId: string;
        setNumber: number;
        reps: number;
        weight?: number;
      }[];
      notes?: string;
    }
  ) => api.patch<WorkoutSession>(`/workout-sessions/${id}/complete`, data),
  getActive: () => api.get<WorkoutSession | null>('/workout-sessions/active'),
  getHistory: () => api.get<WorkoutSession[]>('/workout-sessions/history'),
  getById: (id: string) => api.get<WorkoutSession>(`/workout-sessions/${id}`),
  cancel: (id: string) => api.delete(`/workout-sessions/${id}`),
};
