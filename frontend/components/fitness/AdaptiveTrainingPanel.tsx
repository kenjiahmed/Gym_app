'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import AICoachInsights from './AICoachInsights';
import PremiumGate from './PremiumGate';
import { Card } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionPlan: 'free' | 'pro' | 'elite';
}

export default function AdaptiveTrainingPanel() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  // Show premium gate for free users
  if (user?.subscriptionPlan === 'free') {
    return (
      <PremiumGate
        feature="AI Adaptive Training"
        description="Get intelligent workout adjustments based on your performance, fatigue levels, and recovery. Our AI coach analyzes your training data and optimizes your program in real-time."
        icon="🤖"
      />
    );
  }

  // Show AI insights for premium users
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">AI Coach Insights</h2>
        <p className="text-gray-600 mt-1">
          Your personalized training recommendations powered by AI
        </p>
      </div>
      <AICoachInsights />
    </div>
  );
}
