'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/fitness/PageHeader';
import { LoadingSkeleton } from '@/components/fitness/LoadingSkeleton';
import { EmptyState } from '@/components/fitness/EmptyState';

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
  _count: {
    enrollments: number;
  };
}

const GOALS = ['All', 'Muscle Gain', 'Fat Loss', 'Strength', 'Glutes', 'Endurance'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = ['All', '4 weeks', '6 weeks', '8 weeks', '12+ weeks'];

export default function ProgramsPage() {
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');

  const { data: programs, isLoading } = useQuery({
    queryKey: ['programs', selectedGoal, selectedLevel, selectedDuration],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (selectedGoal !== 'All') params.append('goal', selectedGoal);
      if (selectedLevel !== 'All') params.append('level', selectedLevel);
      if (selectedDuration !== 'All') {
        const maxWeeks = selectedDuration === '4 weeks' ? 4 : selectedDuration === '6 weeks' ? 6 : selectedDuration === '8 weeks' ? 8 : 100;
        params.append('maxWeeks', maxWeeks.toString());
      }

      const response = await api.get(`/programs?${params.toString()}`);
      return response.data as Program[];
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Training Programs"
          subtitle="Structured, progressive programs designed by experts"
        />
        <LoadingSkeleton />
      </div>
    );
  }

  const filteredPrograms = programs || [];

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Training Programs"
        subtitle="Structured, progressive programs designed by experts"
      />

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Goal Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Goal</h3>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGoal === goal
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Level</h3>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedLevel === level
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Duration</h3>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDuration === duration
                      ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <EmptyState
            title="No programs found"
            description="Try adjusting your filters to see more programs"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/programs/${program.id}`}>
                  <div className="group relative bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
                    {/* Cover Image */}
                    <div className="relative h-48 overflow-hidden">
                      {program.coverImage ? (
                        <img
                          src={program.coverImage}
                          alt={program.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50" />
                      )}
                      
                      {/* Premium Badge */}
                      {program.isPremium && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          PRO
                        </div>
                      )}

                      {/* Featured Badge */}
                      {program.featured && !program.isPremium && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                        {program.title}
                      </h3>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {program.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">
                          {program.goal}
                        </span>
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs font-medium">
                          {program.level}
                        </span>
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">
                          {program.durationWeeks} weeks
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>{program._count?.enrollments || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{program.muscleGroups?.length || 0} groups</span>
                          </div>
                        </div>
                        
                        <div className="text-purple-400 font-semibold flex items-center gap-1">
                          View Program
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
}
