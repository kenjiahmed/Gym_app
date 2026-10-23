'use client';

import { motion } from 'framer-motion';
import { Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WorkoutCardProps {
  id: number | string;
  name: string;
  exercises: number;
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  image?: string;
  delay?: number;
}

export function WorkoutCard({ 
  id, 
  name, 
  exercises, 
  duration = '45 min', 
  difficulty = 'Intermediate',
  image,
  delay = 0 
}: WorkoutCardProps) {
  const difficultyColors = {
    Beginner: 'bg-green-500',
    Intermediate: 'bg-yellow-500',
    Advanced: 'bg-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm h-full group">
        <div className="relative h-48 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-pink-500/80 via-purple-500/80 to-cyan-500/80"
            style={{
              backgroundImage: image ? `url(${image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl opacity-30">💪</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-black ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{name}</h3>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>{exercises} exercises</span>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <Link href={`/dashboard/workout/start/${id}`}>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold">
              Start Workout
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
