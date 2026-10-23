'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, Target, Lock } from 'lucide-react';
import { PageHeader } from '@/components/fitness/PageHeader';
import { useAuthStore } from '@/lib/store';
import { workoutSessionsApi } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const isPro = user?.subscriptionPlan !== 'free';

  const { data: sessions } = useQuery({
    queryKey: ['workout-sessions'],
    queryFn: async () => {
      const response = await workoutSessionsApi.getHistory();
      return response.data;
    },
  });

  // Prepare data for charts
  const workoutsPerWeek = [
    { week: 'Week 1', workouts: 3 },
    { week: 'Week 2', workouts: 4 },
    { week: 'Week 3', workouts: 5 },
    { week: 'Week 4', workouts: 3 },
  ];

  const timeTrainedPerMonth = [
    { month: 'Sep', hours: 8 },
    { month: 'Oct', hours: 12 },
    { month: 'Nov', hours: 15 },
    { month: 'Dec', hours: 18 },
    { month: 'Jan', hours: 20 },
  ];

  const muscleGroupData = [
    { name: 'Chest', value: 25, color: '#ff6ec7' },
    { name: 'Back', value: 20, color: '#00d4ff' },
    { name: 'Legs', value: 30, color: '#a0ff1f' },
    { name: 'Arms', value: 15, color: '#b967ff' },
    { name: 'Core', value: 10, color: '#ffa500' },
  ];

  const LockedOverlay = () => (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
      <div className="text-center p-8">
        <Lock className="w-16 h-16 text-pink-500 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-white mb-2">Pro Feature</h3>
        <p className="text-white/60 mb-6">Upgrade to Pro to unlock advanced analytics</p>
        <Link href="/dashboard/pricing">
          <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold">
            Upgrade Now
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Analytics" 
        subtitle="Track your fitness progress with detailed insights"
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-12 h-12 text-pink-500" />
                <div className="text-right">
                  <p className="text-4xl font-black text-white">18</p>
                  <p className="text-sm text-white/60 font-medium">This Month</p>
                </div>
              </div>
              <p className="text-white/80 font-semibold">Total Workouts</p>
              <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+25% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-12 h-12 text-purple-500" />
                <div className="text-right">
                  <p className="text-4xl font-black text-white">24h</p>
                  <p className="text-sm text-white/60 font-medium">Total Time</p>
                </div>
              </div>
              <p className="text-white/80 font-semibold">Training Hours</p>
              <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+15% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-12 h-12 text-cyan-500" />
                <div className="text-right">
                  <p className="text-4xl font-black text-white">4.5</p>
                  <p className="text-sm text-white/60 font-medium">Per Week</p>
                </div>
              </div>
              <p className="text-white/80 font-semibold">Average Sessions</p>
              <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Above target!</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workouts Per Week */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-white/10 relative">
            {!isPro && <LockedOverlay />}
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">Workouts Per Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workoutsPerWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="workouts" fill="url(#colorWorkouts)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6ec7" />
                      <stop offset="100%" stopColor="#b967ff" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Trained Per Month */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-white/10 relative">
            {!isPro && <LockedOverlay />}
            <CardHeader>
              <CardTitle className="text-xl font-black text-white">Training Time (Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeTrainedPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#00d4ff" 
                    strokeWidth={3}
                    dot={{ fill: '#00d4ff', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Muscle Group Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card border-white/10 relative">
          {!isPro && <LockedOverlay />}
          <CardHeader>
            <CardTitle className="text-xl font-black text-white">Muscle Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={muscleGroupData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {muscleGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {muscleGroupData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-white/80 font-medium">{item.name}</span>
                    <span className="text-white/60 ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
