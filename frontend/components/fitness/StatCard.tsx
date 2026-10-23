'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm h-full group">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${gradient}`}></div>
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">
                {title}
              </p>
              <p className="text-4xl font-black text-white">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-white/50 mt-2 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-2xl ${gradient} group-hover:scale-110 transition-transform`}>
              <Icon className="h-6 w-6 text-black" strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
