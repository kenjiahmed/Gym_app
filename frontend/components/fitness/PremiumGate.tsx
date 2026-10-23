'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface PremiumGateProps {
  feature: string;
  description: string;
  icon?: string;
}

export default function PremiumGate({ 
  feature, 
  description, 
  icon = '⭐' 
}: PremiumGateProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">
            {feature}
          </h3>
          <p className="text-gray-600 mb-6">
            {description}
          </p>
          
          <div className="bg-white rounded-lg p-4 mb-6 border border-purple-200">
            <p className="text-sm font-semibold text-purple-700 mb-2">
              Included in Pro & Elite Plans
            </p>
            <ul className="text-sm text-gray-700 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>AI-powered workout adjustments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Performance tracking & analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Personalized deload recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Fatigue detection & recovery insights</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={() => router.push('/dashboard/pricing')}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
          >
            Upgrade to Pro
          </Button>
          
          <p className="text-xs text-gray-500 mt-4">
            Start your 7-day free trial today
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
