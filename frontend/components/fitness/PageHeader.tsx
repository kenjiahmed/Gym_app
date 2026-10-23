'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-lg font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
