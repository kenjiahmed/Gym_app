'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { LoadingSkeleton } from '@/components/fitness/LoadingSkeleton';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';

interface ProgramWorkout {
  id: string;
  dayNumber: number;
  isRestDay: boolean;
  notes?: string;
  workout: {
    id: string;
    name: string;
    description?: string;
    durationMinutes?: number;
    workoutExercises: Array<{
      sets: number;
      reps: number;
      exercise: {
        name: string;
        muscleGroup: string;
      };
    }>;
  };
}

interface ProgramWeek {
  id: string;
  weekNumber: number;
  title?: string;
  description?: string;
  workouts: ProgramWorkout[];
}

interface Program {
  id: string;
  title: string;
  description: string;
  level: string;
  goal: string;
  durationWeeks: number;
  coverImage?: string;
  isPremium: boolean;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  featured: boolean;
  weeks: ProgramWeek[];
  _count: {
    enrollments: number;
  };
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', params.id],
    queryFn: async () => {
      const response = await api.get(`/programs/${params.id}`);
      return response.data as Program;
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', params.id],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      try {
        const response = await api.get(`/programs/enrollments/${params.id}`);
        return response.data;
      } catch (error) {
        return null;
      }
    },
    enabled: isAuthenticated,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/programs/enroll', {
        programId: params.id,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Successfully enrolled in program!');
      queryClient.invalidateQueries({ queryKey: ['enrollment', params.id] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      if (error.response?.data?.message?.includes('Pro or Elite')) {
        setShowUpgradeModal(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to enroll');
      }
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (program?.isPremium && user?.subscriptionPlan === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    enrollMutation.mutate();
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Program not found</h1>
          <button
            onClick={() => router.push('/dashboard/programs')}
            className="text-purple-400 hover:text-purple-300"
          >
            ← Back to programs
          </button>
        </div>
      </div>
    );
  }

  const currentWeek = program.weeks.find(w => w.weekNumber === selectedWeek);
  const isEnrolled = !!enrollment;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden rounded-3xl mb-8">
        {program.coverImage ? (
          <img
            src={program.coverImage}
            alt={program.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/programs')}
          className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg text-white hover:bg-black/70 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Title & Badges */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {program.isPremium && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                PRO ONLY
              </span>
            )}
            <span className="bg-blue-600/30 backdrop-blur-sm text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {program.goal}
            </span>
            <span className="bg-purple-600/30 backdrop-blur-sm text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
              {program.level}
            </span>
            <span className="bg-green-600/30 backdrop-blur-sm text-green-300 px-3 py-1 rounded-full text-sm font-medium">
              {program.durationWeeks} weeks
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-3">{program.title}</h1>
          <p className="text-xl text-gray-300 max-w-3xl">{program.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Program Overview
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Duration</div>
                <div className="text-2xl font-bold text-white">{program.durationWeeks} weeks</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Enrolled</div>
                <div className="text-2xl font-bold text-white">{program._count?.enrollments || 0} people</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Level</div>
                <div className="text-lg font-semibold text-white">{program.level}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Category</div>
                <div className="text-lg font-semibold text-white capitalize">{program.category}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Muscle Groups</h3>
                <div className="flex flex-wrap gap-2">
                  {program.muscleGroups?.map((group) => (
                    <span key={group} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-lg text-sm">
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Equipment Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {program.equipment?.map((item) => (
                    <span key={item} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-lg text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Weekly Breakdown
            </h2>

            {/* Week Selector */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-2">
                {program.weeks.map((week) => (
                  <button
                    key={week.id}
                    onClick={() => setSelectedWeek(week.weekNumber)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      selectedWeek === week.weekNumber
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    Week {week.weekNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* Week Details */}
            {currentWeek && (
              <div className="space-y-4">
                {currentWeek.title && (
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{currentWeek.title}</h3>
                    {currentWeek.description && (
                      <p className="text-gray-400 mt-1">{currentWeek.description}</p>
                    )}
                  </div>
                )}

                {/* Days */}
                <div className="space-y-3">
                  {currentWeek.workouts.map((programWorkout) => (
                    <div
                      key={programWorkout.id}
                      className={`p-4 rounded-lg border ${
                        programWorkout.isRestDay
                          ? 'bg-gray-800/30 border-gray-700/30'
                          : 'bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-colors'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm text-gray-400">{DAY_NAMES[programWorkout.dayNumber - 1]}</div>
                          <div className="text-lg font-semibold text-white">
                            {programWorkout.isRestDay ? 'Rest Day' : programWorkout.workout.name}
                          </div>
                        </div>
                        {!programWorkout.isRestDay && programWorkout.workout.durationMinutes && (
                          <div className="text-sm text-gray-400">{programWorkout.workout.durationMinutes} min</div>
                        )}
                      </div>

                      {programWorkout.notes && (
                        <div className="text-sm text-purple-400 mb-2">💡 {programWorkout.notes}</div>
                      )}

                      {!programWorkout.isRestDay && programWorkout.workout.workoutExercises && (
                        <div className="text-sm text-gray-400 mt-2">
                          {programWorkout.workout.workoutExercises.slice(0, 3).map((we, idx) => (
                            <div key={idx}>• {we.exercise.name} - {we.sets}×{we.reps}</div>
                          ))}
                          {programWorkout.workout.workoutExercises.length > 3 && (
                            <div className="text-purple-400 mt-1">
                              +{programWorkout.workout.workoutExercises.length - 3} more exercises
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - Enrollment CTA */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-8 bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50"
          >
            {isEnrolled ? (
              <>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-3">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">You're Enrolled!</h3>
                  <p className="text-gray-400 mt-1">Keep up the great work</p>
                </div>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Ready to Start?</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-sm">Structured {program.durationWeeks}-week plan</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-sm">Progressive overload system</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-sm">Track your progress weekly</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-sm">Expert-designed workouts</span>
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
                </button>

                {program.isPremium && (
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Requires Pro or Elite subscription
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border border-purple-500/50 shadow-2xl shadow-purple-500/20"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Upgrade Required</h3>
              <p className="text-gray-400">
                This premium program requires a Pro or Elite subscription to access.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/pricing')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                View Plans
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full bg-gray-700/50 text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-700 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
