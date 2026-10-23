'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dumbbell, TrendingUp } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  exerciseCount: number;
  gradient: string;
  index?: number;
  sampleExercises?: string[];
  popularity?: string;
}

export function CategoryCard({ 
  title, 
  icon: Icon, 
  exerciseCount, 
  gradient, 
  index = 0,
  sampleExercises = [],
  popularity = 'Popular'
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
    >
      <Card className={`relative overflow-hidden border-0 ${gradient} h-72 group shadow-lg hover:shadow-2xl transition-all`}>
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="h-48 w-48 text-white" strokeWidth={1} />
          </div>
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-3xl font-black text-white mb-2">{title}</h3>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <p className="text-xs text-white font-bold">{exerciseCount} Exercises</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-lime-400/90">
                  <p className="text-xs text-black font-bold">{popularity}</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all">
              <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Sample Exercises */}
          <div className="flex-1 space-y-2 mt-2">
            <p className="text-xs text-white/70 font-semibold uppercase tracking-wider mb-3">Sample Exercises</p>
            {sampleExercises.slice(0, 3).map((exercise, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + idx * 0.05 }}
                className="flex items-center gap-2 text-white/90"
              >
                <Dumbbell className="h-3 w-3 flex-shrink-0" />
                <span className="text-sm font-medium line-clamp-1">{exercise}</span>
              </motion.div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-white/80" />
              <span className="text-xs text-white/80 font-medium">Trending</span>
            </div>
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                className="h-full bg-lime-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
