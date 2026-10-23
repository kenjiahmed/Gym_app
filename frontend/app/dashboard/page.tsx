'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, workoutPlansApi, workoutSessionsApi, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Dumbbell, 
  Plus, 
  Zap, 
  Flame, 
  Target, 
  Calendar,
  TrendingUp,
  Activity,
  Gauge,
  Heart,
  ArrowRight,
  Play,
  BarChart3,
  Crown,
  MapPin,
  Star,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/fitness/StatCard';
import { WorkoutCard } from '@/components/fitness/WorkoutCard';
import { CategoryCard } from '@/components/fitness/CategoryCard';
import { EmptyState } from '@/components/fitness/EmptyState';
import { LoadingSkeleton } from '@/components/fitness/LoadingSkeleton';
import AdaptiveTrainingPanel from '@/components/fitness/AdaptiveTrainingPanel';
import { useAuthStore } from '@/lib/store';
import { PublicHeader } from '@/components/PublicHeader';
import { PublicFooter } from '@/components/PublicFooter';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await usersApi.getStats();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: workoutPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['workout-plans'],
    queryFn: async () => {
      const response = await workoutPlansApi.getAll();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: activeSession } = useQuery({
    queryKey: ['active-session'],
    queryFn: async () => {
      const response = await workoutSessionsApi.getActive();
      return response.data;
    },
    refetchInterval: 5000,
    enabled: isAuthenticated,
  });

  const { data: activePrograms } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const response = await api.get('/programs/enrollments/my');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: todaysWorkout } = useQuery({
    queryKey: ['todays-workout'],
    queryFn: async () => {
      const response = await api.get('/programs/today/workout');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const queryClient = useQueryClient();

  const markWorkoutCompleteMutation = useMutation({
    mutationFn: async ({ programId, weekNumber, dayNumber }: { programId: string; weekNumber: number; dayNumber: number }) => {
      const response = await api.put(`/programs/enrollments/${programId}/progress`, {
        weekNumber,
        dayNumber,
        completed: true,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Workout marked as complete!');
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['todays-workout'] });
    },
    onError: () => {
      toast.error('Failed to mark workout as complete');
    },
  });

  const categories = [
    { 
      title: 'Push', 
      icon: Gauge, 
      exerciseCount: 8, 
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-500',
      sampleExercises: ['Bench Press', 'Shoulder Press', 'Chest Fly', 'Tricep Dips'],
      popularity: 'Most Popular'
    },
    { 
      title: 'Pull', 
      icon: Target, 
      exerciseCount: 6, 
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-500',
      sampleExercises: ['Pull-ups', 'Bent Over Rows', 'Lat Pulldown', 'Face Pulls'],
      popularity: 'Trending'
    },
    { 
      title: 'Legs', 
      icon: Zap, 
      exerciseCount: 10, 
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      sampleExercises: ['Squats', 'Deadlifts', 'Leg Press', 'Lunges'],
      popularity: 'Hot'
    },
    { 
      title: 'Cardio', 
      icon: Heart, 
      exerciseCount: 5, 
      gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
      sampleExercises: ['Running', 'Cycling', 'Jump Rope', 'HIIT Intervals'],
      popularity: 'Popular'
    },
    { 
      title: 'Core', 
      icon: Activity, 
      exerciseCount: 7, 
      gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
      sampleExercises: ['Planks', 'Russian Twists', 'Leg Raises', 'Ab Wheel'],
      popularity: 'Rising'
    },
    { 
      title: 'Lower Body Focused', 
      icon: Sparkles, 
      exerciseCount: 21, 
      gradient: 'bg-gradient-to-br from-pink-400 via-fuchsia-400 to-purple-400',
      sampleExercises: ['Hip Thrusts', 'Lower Body Bridges', 'Bulgarian Squats', 'Core Sculpt'],
      popularity: 'Hot',
      href: '/dashboard/women-training'
    },
  ];

  // Show public homepage for unauthenticated users
  if (!isAuthenticated) {
    return (
      <>
        <PublicHeader />
        <div className="pt-20">
          <div className="space-y-12 pb-12">
        {/* Public Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl h-[600px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/90 via-purple-600/90 to-cyan-600/90">
            <div className="absolute inset-0 opacity-30" 
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
          
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

          <div className="relative h-full flex flex-col justify-center items-center text-center p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400 text-black font-bold text-sm mb-6"
            >
              <Zap className="h-4 w-4" />
              <span>TRANSFORM YOUR BODY</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight"
            >
              Your Fitness<br />Journey Starts Here
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 font-medium mb-12 max-w-2xl"
            >
              Track workouts, monitor progress, and achieve your fitness goals with our modern training app
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <Button className="bg-white hover:bg-white/90 text-black font-bold text-lg px-12 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                  Get Started Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-12 py-7 rounded-2xl backdrop-blur-sm">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-white/60">
              Powerful features to help you reach your fitness goals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={category.title} {...category} index={index} />
            ))}
          </div>
        </div>

        {/* Premium Features Section */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Premium Features
            </h2>
            <p className="text-xl text-white/60">
              Unlock advanced tools to supercharge your fitness journey
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="space-y-6">
            {/* Analytics Feature */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-card border-white/10 rounded-3xl overflow-hidden hover:border-pink-500/30 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 mb-4">
                    <BarChart3 className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-bold text-white">PRO FEATURE</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                    Advanced Analytics
                  </h3>
                  <p className="text-lg text-white/70 mb-6">
                    Track your progress with detailed charts, muscle group distribution, training hours, and performance trends. See exactly how you're improving over time.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                      <span>Interactive workout charts</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                      <span>Muscle group distribution analysis</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                      <span>Performance trend tracking</span>
                    </li>
                  </ul>
                </div>
                <div className="order-1 md:order-2 relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 className="w-32 h-32 text-pink-500/40" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Calendar Feature */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="glass-card border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar className="w-32 h-32 text-cyan-500/40" />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-bold text-white">PRO FEATURE</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                    Smart Scheduling
                  </h3>
                  <p className="text-lg text-white/70 mb-6">
                    Plan your workouts in advance with our intelligent calendar. Never miss a session and stay consistent with your fitness goals.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                      <span>Monthly workout planning</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                      <span>Automatic reminders</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                      <span>Track completed sessions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Elite Feature */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="glass-card border-white/10 rounded-3xl overflow-hidden hover:border-yellow-500/30 transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-white">ELITE FEATURE</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                    Outdoor Tracking
                  </h3>
                  <p className="text-lg text-white/70 mb-6">
                    Take your workouts outside! Track running routes, cycling paths, and outdoor activities with GPS integration and detailed route analytics.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      <span>GPS route tracking</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      <span>Distance & pace monitoring</span>
                    </li>
                    <li className="flex items-center gap-3 text-white/80">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      <span>Route visualization & history</span>
                    </li>
                  </ul>
                </div>
                <div className="order-1 md:order-2 relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-32 h-32 text-yellow-500/40" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-white/60">
              Join thousands of satisfied fitness enthusiasts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="glass-card border-white/10 rounded-2xl p-8 hover:border-pink-500/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                "This app completely transformed my fitness routine! The analytics feature helped me identify my weak points and improve consistently."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-black text-lg">SA</span>
                </div>
                <div>
                  <p className="text-white font-bold">Sarah Anderson</p>
                  <p className="text-white/60 text-sm">Pro Member</p>
                </div>
              </div>
            </motion.div>

            {/* Review 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="glass-card border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                "The calendar scheduling feature keeps me accountable. I've never been this consistent with my workouts before!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-black text-lg">MJ</span>
                </div>
                <div>
                  <p className="text-white font-bold">Marcus Johnson</p>
                  <p className="text-white/60 text-sm">Elite Member</p>
                </div>
              </div>
            </motion.div>

            {/* Review 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="glass-card border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                "Best fitness app I've ever used. Clean interface, powerful features, and it actually helps me reach my goals!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white font-black text-lg">EC</span>
                </div>
                <div>
                  <p className="text-white font-bold">Emma Chen</p>
                  <p className="text-white/60 text-sm">Pro Member</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="p-12 rounded-3xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-white/10 text-center"
        >
          <h3 className="text-4xl font-black text-white mb-4">Ready to Transform?</h3>
          <p className="text-xl text-white/80 mb-8">Join thousands of users achieving their fitness goals</p>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg px-12 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
              Start Your Free Account
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </motion.div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  if (statsLoading || plansLoading) {
    return <LoadingSkeleton />;
  }

  // Get the first workout plan for hero section
  const featuredWorkout = workoutPlans?.[0];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl h-[500px]"
      >
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/90 via-purple-600/90 to-cyan-600/90">
          <div className="absolute inset-0 opacity-30" 
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&h=900&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-pulse-slow"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
          {activeSession ? (
            <>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400 text-black font-bold text-sm mb-6"
                >
                  <Zap className="h-4 w-4" />
                  <span>WORKOUT IN PROGRESS</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-black text-white mb-4"
                >
                  {activeSession.workoutPlan.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 font-medium"
                >
                  Started {formatDistanceToNow(new Date(activeSession.startTime), { addSuffix: true })}
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href={`/dashboard/workout/${activeSession.id}`}>
                  <Button className="bg-white hover:bg-white/90 text-black font-bold text-lg px-8 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                    <Play className="mr-2 h-6 w-6" />
                    Continue Workout
                  </Button>
                </Link>
              </motion.div>
            </>
          ) : featuredWorkout ? (
            <>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm mb-6"
                >
                  <Flame className="h-4 w-4" />
                  <span>TODAY'S WORKOUT</span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-black text-white mb-4"
                >
                  {featuredWorkout.name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-6 text-white/90 text-lg font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {featuredWorkout.workoutExercises.length} exercises
                  </span>
                  <span>•</span>
                  <span>45-60 min</span>
                  <span>•</span>
                  <span>Full Body</span>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href={`/dashboard/workout/start/${featuredWorkout.id}`}>
                  <Button className="bg-white hover:bg-white/90 text-black font-bold text-lg px-8 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                    <Zap className="mr-2 h-6 w-6" />
                    Start Workout
                  </Button>
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-black text-white mb-4"
                >
                  Ready to Transform?
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-white/90 font-medium"
                >
                  Create your first workout plan and start your fitness journey today
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/dashboard/workouts/new">
                  <Button className="bg-white hover:bg-white/90 text-black font-bold text-lg px-8 py-7 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                    <Plus className="mr-2 h-6 w-6" />
                    Create Workout Plan
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      {/* Active Programs Section */}
      {activePrograms && activePrograms.length > 0 && (
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-black text-white mb-2">Your Active Programs</h2>
            <p className="text-white/60 font-medium">Keep following the system</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activePrograms.map((enrollment: any, index: number) => {
              const progress = enrollment.completedWorkouts as any || {};
              let totalWorkouts = 0;
              let completedCount = 0;

              enrollment.program.weeks.forEach((week: any) => {
                week.workouts.forEach((workout: any) => {
                  if (!workout.isRestDay) {
                    totalWorkouts++;
                    if (progress[week.weekNumber]?.[workout.dayNumber]) {
                      completedCount++;
                    }
                  }
                });
              });

              const progressPercentage = totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0;
              const currentWeek = enrollment.program.weeks.find((w: any) => w.weekNumber === enrollment.currentWeek);

              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  {/* Program Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{enrollment.program.title}</h3>
                      <p className="text-gray-400 text-sm">Week {enrollment.currentWeek} of {enrollment.program.durationWeeks}</p>
                    </div>
                    {enrollment.program.isPremium && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange- 500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        PRO
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Overall Progress</span>
                      <span className="text-sm font-bold text-purple-400">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{completedCount}</div>
                      <div className="text-xs text-gray-400">Completed</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{totalWorkouts - completedCount}</div>
                      <div className="text-xs text-gray-400">Remaining</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{enrollment.program.durationWeeks - enrollment.currentWeek + 1}</div>
                      <div className="text-xs text-gray-400">Weeks Left</div>
                    </div>
                  </div>

                  {/* Current Week */}
                  {currentWeek?.title && (
                    <div className="mb-3 px-3 py-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
                      <div className="text-xs text-purple-400 font-semibold mb-1">Current Phase</div>
                      <div className="text-sm text-white font-bold">{currentWeek.title}</div>
                      {currentWeek.description && (
                        <div className="text-xs text-gray-400 mt-1">{currentWeek.description}</div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/programs/${enrollment.program.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm">
                        View Program
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Today's Workout */}
          {todaysWorkout && todaysWorkout.todaysWorkout && !todaysWorkout.todaysWorkout.isRestDay && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="text-xl font-bold text-white">Today's Workout</h3>
                {todaysWorkout.isCompleted && (
                  <span className="ml-auto bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">{todaysWorkout.todaysWorkout.workout.name}</h4>
                  <p className="text-gray-400 mb-4">{todaysWorkout.todaysWorkout.workout.description || 'Complete your daily workout to stay on track'}</p>
                  
                  {todaysWorkout.todaysWorkout.notes && (
                    <div className="mb-4 p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                      <div className="text-sm text-purple-300">💡 {todaysWorkout.todaysWorkout.notes}</div>
                    </div>
                  )}

                  <div className="flex gap-4 text-sm text-gray-400 mb-4">
                    {todaysWorkout.todaysWorkout.workout.durationMinutes && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {todaysWorkout.todaysWorkout.workout.durationMinutes} min
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {todaysWorkout.todaysWorkout.workout.workoutExercises?.length || 0} exercises
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {!todaysWorkout.isCompleted && (
                      <Button
                        onClick={() => markWorkoutCompleteMutation.mutate({
                          programId: todaysWorkout.enrollment.program.id,
                          weekNumber: todaysWorkout.currentWeek.weekNumber,
                          dayNumber: todaysWorkout.dayNumber,
                        })}
                        disabled={markWorkoutCompleteMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-400 mb-3">Exercises</h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {todaysWorkout.todaysWorkout.workout.workoutExercises?.slice(0, 10).map((we: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{we.exercise.name}</span>
                        <span className="text-gray-500">{we.sets}×{we.reps}</span>
                      </div>
                    ))}
                    {todaysWorkout.todaysWorkout.workout.workoutExercises?.length > 10 && (
                      <div className="text-sm text-purple-400 font-medium">
                        +{todaysWorkout.todaysWorkout.workout.workoutExercises.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rest Day */}
          {todaysWorkout && todaysWorkout.todaysWorkout?.isRestDay && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6 bg-gradient-to-br from-green-900/30 via-emerald-900/30 to-teal-900/30 rounded-2xl p-8 border border-green-500/50 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Rest Day</h3>
              <p className="text-gray-400 mb-4">
                {todaysWorkout.todaysWorkout.notes || 'Recovery is just as important as training. Let your muscles rebuild and come back stronger tomorrow!'}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <span>Stretch lightly</span>
                <span>•</span>
                <span>Stay hydrated</span>
                <span>•</span>
                <span>Eat well</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* AI Coach Insights Section */}
      <div>
        <AdaptiveTrainingPanel />
      </div>

      {/* Quick Stats Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-3xl font-black text-white mb-2">Your Progress</h2>
          <p className="text-white/60 font-medium">Keep up the amazing work!</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Workouts This Week"
            value={stats?.weeklyWorkouts || 0}
            subtitle="Last 7 days"
            icon={Calendar}
            gradient="bg-gradient-to-br from-pink-500 to-rose-500"
            delay={0.7}
          />
          <StatCard
            title="Total Sessions"
            value={stats?.totalSessions || 0}
            subtitle="All time"
            icon={Dumbbell}
            gradient="bg-gradient-to-br from-purple-500 to-indigo-500"
            delay={0.8}
          />
          <StatCard
            title="Current Streak"
            value={(stats?.weeklyWorkouts && stats.weeklyWorkouts > 0) ? `${stats.weeklyWorkouts} 🔥` : '0'}
            subtitle={(stats?.weeklyWorkouts && stats.weeklyWorkouts > 0) ? 'Keep it going!' : 'Start today!'}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
            delay={0.9}
          />
        </div>
      </div>

      {/* Workout Categories */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Workout Categories</h2>
            <p className="text-white/60 font-medium">Choose your training focus</p>
          </div>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category, index) => (
            <div key={category.title} className="flex-shrink-0 w-80">
              <CategoryCard {...category} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Workouts */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Your Workout Plans</h2>
            <p className="text-white/60 font-medium">
              {workoutPlans?.length || 0} plan{workoutPlans?.length !== 1 ? 's' : ''} ready to go
            </p>
          </div>
          <Link href="/dashboard/workouts/new">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold">
              <Plus className="mr-2 h-5 w-5" />
              Create New
            </Button>
          </Link>
        </motion.div>

        {workoutPlans && workoutPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutPlans.map((plan, index) => (
              <WorkoutCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                exercises={plan.workoutExercises.length}
                duration="45 min"
                difficulty="Intermediate"
                delay={1.3 + index * 0.1}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Workout Plans Yet"
            description="Create your first workout plan and start tracking your fitness journey. It only takes a minute!"
            actionLabel="Create Your First Plan"
            actionHref="/dashboard/workouts/new"
            icon="💪"
          />
        )}
      </div>
    </div>
  );
}
