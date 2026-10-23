'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Flame, Heart, Dumbbell, Home, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function WomenTrainingPage() {
  const [filters, setFilters] = useState({
    muscleFocus: 'all',
    equipmentType: 'all',
    location: 'all',
  });

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['women-exercises', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('category', 'women');
      if (filters.muscleFocus !== 'all') params.append('muscleFocus', filters.muscleFocus);
      if (filters.equipmentType !== 'all') params.append('equipmentType', filters.equipmentType);

      const response = await api.get(`/exercises?${params.toString()}`);
      return response.data;
    },
  });

  const muscleFocusOptions = [
    { value: 'all', label: 'All', icon: Sparkles, color: 'from-neon-pink to-neon-cyan' },
    { value: 'glutes', label: 'Glutes', icon: Flame, color: 'from-pink-500 to-fuchsia-500' },
    { value: 'hips', label: 'Hips', icon: Heart, color: 'from-purple-500 to-pink-500' },
    { value: 'core', label: 'Core', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
  ];

  const equipmentOptions = [
    { value: 'all', label: 'All' },
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'bands', label: 'Resistance Bands' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'cables', label: 'Cables' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 rounded-full mb-6 backdrop-blur-lg border border-pink-500/30"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-pink-400" />
            <span className="text-white font-semibold">Women's Training Programs</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Sculpt & Strengthen
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Expertly designed workouts targeting glutes, hips, thighs, and core for feminine fitness goals
          </p>
        </motion.div>

        {/* Muscle Focus Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {muscleFocusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filters.muscleFocus === option.value;
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilters({ ...filters, muscleFocus: option.value })}
                className={`p-6 rounded-2xl backdrop-blur-lg border-2 transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${option.color} border-transparent shadow-lg`
                    : 'bg-gray-900/50 border-gray-800 hover:border-pink-500/30'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-white' : 'text-pink-400'}`} />
                <p className={`font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {option.label}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Equipment & Location Filters */}
        <Card className="p-6 mb-8 bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Equipment
              </label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ ...filters, equipmentType: option.value })}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      filters.equipmentType === option.value
                        ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Location
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, location: 'all' })}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    filters.location === 'all'
                      ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mx-auto mb-1" />
                  All
                </button>
                <button
                  onClick={() => setFilters({ ...filters, location: 'home' })}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    filters.location === 'home'
                      ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Home className="w-5 h-5 mx-auto mb-1" />
                  Home
                </button>
                <button
                  onClick={() => setFilters({ ...filters, location: 'gym' })}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                    filters.location === 'gym'
                      ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1" />
                  Gym
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Exercises Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : exercises.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-400">No exercises found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise: any, idx: number) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg border-gray-800/50 hover:border-pink-500/30 transition-all duration-300 group">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 group-hover:scale-110 transition-transform">
                        <Dumbbell className="w-6 h-6 text-pink-400" />
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 text-xs font-bold bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/30">
                          {exercise.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                          {exercise.equipmentType}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">
                      {exercise.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {exercise.description}
                    </p>

                    {/* Tips */}
                    {exercise.tips && (
                      <div className="p-3 bg-gray-800/50 rounded-lg mb-4">
                        <p className="text-xs text-gray-300">
                          💡 {exercise.tips}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Target</p>
                        <p className="text-sm font-bold text-pink-400 capitalize">
                          {exercise.muscleFocus}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Cal/Min</p>
                        <p className="text-sm font-bold text-green-400">
                          {exercise.caloriesPerMin}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
