'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: string;
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel = 'Get Started',
  actionHref = '/dashboard/workouts/new',
  icon = '🏋️'
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-4"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 10, 0],
          scale: [1, 1.1, 1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1
        }}
        className="text-8xl mb-6 inline-block"
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold text-white mb-3">
        {title}
      </h3>
      <p className="text-white/60 mb-8 max-w-md mx-auto">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold px-8 py-6 text-lg">
            <Sparkles className="mr-2 h-5 w-5" />
            {actionLabel}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
