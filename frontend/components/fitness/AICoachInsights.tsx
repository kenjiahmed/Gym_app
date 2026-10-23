'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface AdaptiveInsights {
  readinessScore: number;
  weeklyVolume: number;
  consistencyScore: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  strengthProgression: number;
  recentAdaptations: any[];
  recommendations: string[];
  fatigueWarning: boolean;
  shouldDeload: boolean;
}

export default function AICoachInsights() {
  const { data: insights, isLoading, error } = useQuery<AdaptiveInsights>({
    queryKey: ['adaptive-insights'],
    queryFn: async () => {
      const response = await api.get('/adaptive-training/insights');
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

  // Show error message if API call fails
  if (error) {
    return (
      <Card className="p-6 bg-orange-50 border-orange-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-orange-900 mb-1">Unable to Load AI Insights</h4>
            <p className="text-sm text-orange-700">
              Start logging your workouts to unlock personalized AI recommendations.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!insights) return null;

  // Determine readiness color
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Determine trend icon
  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '📊';
  };

  return (
    <div className="space-y-4">
      {/* Readiness Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`p-6 border-2 ${getReadinessColor(insights.readinessScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Training Readiness</h3>
              <p className="text-3xl font-bold">{insights.readinessScore}/100</p>
            </div>
            <div className="text-4xl">
              {insights.readinessScore >= 80 ? '💪' : insights.readinessScore >= 60 ? '😊' : '😴'}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Warning Banners */}
      {insights.shouldDeload && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4 bg-orange-50 border-orange-200 border-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <h4 className="font-semibold text-orange-900">Deload Week Recommended</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Your body needs recovery. Reduce weight by 20% this week.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {insights.fatigueWarning && !insights.shouldDeload && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-4 bg-yellow-50 border-yellow-200 border-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-900">Fatigue Detected</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Consider taking an extra rest day this week.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Consistency Score</p>
            <p className="text-2xl font-bold text-purple-600">{insights.consistencyScore}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Performance Trend</p>
            <p className="text-2xl font-bold flex items-center gap-2">
              <span>{getTrendIcon(insights.performanceTrend)}</span>
              <span className="capitalize text-base">{insights.performanceTrend}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Strength Progression</p>
            <p className="text-2xl font-bold text-green-600">
              {insights.strengthProgression > 0 ? '+' : ''}{insights.strengthProgression}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Weekly Volume</p>
            <p className="text-2xl font-bold text-blue-600">
              {(insights.weeklyVolume / 1000).toFixed(1)}k
            </p>
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Coach Recommendations</h3>
        {insights.recommendations.length > 0 ? (
          <ul className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-xl">{rec.slice(0, 2)}</span>
                <p className="text-sm text-gray-700 flex-1">{rec.slice(3)}</p>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Keep logging workouts to get personalized insights.</p>
        )}
      </Card>

      {/* Recent Adaptations */}
      {insights.recentAdaptations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent AI Adjustments</h3>
          <div className="space-y-3">
            {insights.recentAdaptations.map((adaptation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium capitalize">
                      {adaptation.adjustmentType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(adaptation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{adaptation.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
