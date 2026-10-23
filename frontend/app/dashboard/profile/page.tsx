'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Camera, 
  Edit, 
  Crown, 
  Zap,
  Target,
  TrendingUp,
  Calendar as CalendarIcon,
  Dumbbell,
  Award,
  Flame,
  BarChart3,
  History as HistoryIcon,
  Lock,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store';
import { usersApi, workoutSessionsApi } from '@/lib/api';
import { PageHeader } from '@/components/fitness/PageHeader';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, formatDistanceToNow, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

type TabType = 'profile' | 'analytics' | 'history' | 'calendar';

// Locked Feature Component
const LockedFeature = () => {
  return (
    <div className="relative min-h-[400px] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl"></div>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 text-center space-y-4 px-6"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-2xl font-black text-white">Premium Feature</h3>
        <p className="text-white/70 max-w-md">
          Upgrade to Pro or Elite to unlock advanced analytics, workout scheduling, and more!
        </p>
        <Link href="/dashboard/pricing">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold">
            <Crown className="w-4 h-4 mr-2" />
            View Plans
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    height: '',
    weight: '',
    fitnessGoal: '',
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await usersApi.getStats();
      return response.data;
    },
  });

  const { data: history } = useQuery({
    queryKey: ['workout-history'],
    queryFn: async () => {
      const response = await workoutSessionsApi.getHistory();
      return response.data;
    },
    enabled: activeTab === 'history',
  });

  const isPremium = user?.subscriptionPlan === 'pro' || user?.subscriptionPlan === 'elite';

  const planBadges = {
    free: { label: 'Free', color: 'bg-gray-500', icon: User },
    pro: { label: 'Pro', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Zap },
    elite: { label: 'Elite', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', icon: Crown },
  };

  const currentPlan = planBadges[user?.subscriptionPlan || 'free'];
  const PlanIcon = currentPlan.icon;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  ];

  // Analytics data
  const workoutsPerWeekData = [
    { week: 'Week 1', workouts: 3 },
    { week: 'Week 2', workouts: 4 },
    { week: 'Week 3', workouts: 2 },
    { week: 'Week 4', workouts: 5 },
  ];

  const trainingHoursData = [
    { month: 'Jan', hours: 12 },
    { month: 'Feb', hours: 15 },
    { month: 'Mar', hours: 18 },
    { month: 'Apr', hours: 14 },
    { month: 'May', hours: 20 },
    { month: 'Jun', hours: 22 },
  ];

  const muscleGroupData = [
    { name: 'Chest', value: 25, color: '#ff6ec7' },
    { name: 'Back', value: 20, color: '#a0ff1f' },
    { name: 'Legs', value: 30, color: '#00d4ff' },
    { name: 'Arms', value: 15, color: '#ffd700' },
    { name: 'Core', value: 10, color: '#ff6b9d' },
  ];

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();

  const scheduledDays = [5, 12, 19, 26];
  const completedDays = [5, 12];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Profile" 
        subtitle="Manage your account and fitness journey"
      />

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 relative">
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <CardContent className="relative -mt-16 px-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-500 p-1">
                  <div className="w-full h-full rounded-3xl bg-black flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-3xl object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black text-white">{user?.name}</h2>
                  <div className={`px-3 py-1 rounded-full ${currentPlan.color} flex items-center gap-1.5`}>
                    <PlanIcon className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white uppercase">{currentPlan.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/60 mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Card className="glass-card border-white/10">
        <CardContent className="p-6">
          <div className="flex gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Fitness Stats */}
                <div>
                  <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-pink-500" />
                    Fitness Stats
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                      <Dumbbell className="w-8 h-8 text-pink-500 mb-2" />
                      <p className="text-3xl font-black text-white">{stats?.totalSessions || 0}</p>
                      <p className="text-sm text-white/60 font-medium">Total Workouts</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                      <CalendarIcon className="w-8 h-8 text-purple-500 mb-2" />
                      <p className="text-3xl font-black text-white">{stats?.weeklyWorkouts || 0}</p>
                      <p className="text-sm text-white/60 font-medium">This Week</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                      <Flame className="w-8 h-8 text-cyan-500 mb-2" />
                      <p className="text-3xl font-black text-white">{stats?.weeklyWorkouts || 0}</p>
                      <p className="text-sm text-white/60 font-medium">Day Streak</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                      <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
                      <p className="text-3xl font-black text-white">
                        {stats?.totalSessions && stats.weeklyWorkouts
                          ? Math.round((stats.weeklyWorkouts / 7) * 10) / 10
                          : 0}
                      </p>
                      <p className="text-sm text-white/60 font-medium">Avg / Week</p>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                {!isEditing ? (
                  <div>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                      <h3 className="text-xl font-black text-white">Edit Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80">Name</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80">Height (cm)</Label>
                          <Input
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80">Weight (kg)</Label>
                          <Input
                            type="number"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80">Fitness Goal</Label>
                          <select
                            value={formData.fitnessGoal}
                            onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                            className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white px-3"
                          >
                            <option value="">Select a goal</option>
                            <option value="weight_loss">Weight Loss</option>
                            <option value="muscle_gain">Muscle Gain</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="endurance">Endurance</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold">
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Subscription Info */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
                  <h3 className="text-xl font-black text-white mb-4">Subscription</h3>
                  <div className={`p-6 rounded-2xl ${currentPlan.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative">
                      <PlanIcon className="w-12 h-12 text-white mb-3" />
                      <h3 className="text-2xl font-black text-white mb-1">{currentPlan.label} Plan</h3>
                      <p className="text-white/80 text-sm">
                        {user?.subscriptionPlan === 'free' && 'Basic features included'}
                        {user?.subscriptionPlan === 'pro' && '$9.99/month • Full access'}
                        {user?.subscriptionPlan === 'elite' && '$19.99/month • VIP access'}
                      </p>
                    </div>
                  </div>
                  {user?.subscriptionPlan === 'free' && (
                    <Link href="/dashboard/pricing">
                      <Button className="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold">
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {!isPremium ? (
                  <LockedFeature />
                ) : (
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <Activity className="w-8 h-8 text-pink-500" />
                          <span className="text-green-400 text-sm font-bold">+12%</span>
                        </div>
                        <p className="text-3xl font-black text-white mb-1">24</p>
                        <p className="text-sm text-white/60">Workouts This Month</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <Clock className="w-8 h-8 text-cyan-500" />
                          <span className="text-green-400 text-sm font-bold">+8%</span>
                        </div>
                        <p className="text-3xl font-black text-white mb-1">18h</p>
                        <p className="text-sm text-white/60">Training Time</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <Target className="w-8 h-8 text-purple-500" />
                          <span className="text-green-400 text-sm font-bold">+15%</span>
                        </div>
                        <p className="text-3xl font-black text-white mb-1">85%</p>
                        <p className="text-sm text-white/60">Goal Completion</p>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Bar Chart */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-xl font-black text-white mb-4">Workouts Per Week</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={workoutsPerWeekData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="week" stroke="#ffffff60" />
                            <YAxis stroke="#ffffff60" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#000', 
                                border: '1px solid #ffffff20',
                                borderRadius: '8px'
                              }} 
                            />
                            <Bar dataKey="workouts" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff6ec7" />
                                <stop offset="100%" stopColor="#a855f7" />
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Line Chart */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-xl font-black text-white mb-4">Training Hours</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={trainingHoursData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="month" stroke="#ffffff60" />
                            <YAxis stroke="#ffffff60" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#000', 
                                border: '1px solid #ffffff20',
                                borderRadius: '8px'
                              }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="hours" 
                              stroke="#00d4ff" 
                              strokeWidth={3}
                              dot={{ fill: '#00d4ff', r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie Chart */}
                      <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-xl font-black text-white mb-4">Muscle Group Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={muscleGroupData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(((percent ?? 0) * 100).toFixed(0))}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {muscleGroupData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#000', 
                                border: '1px solid #ffffff20',
                                borderRadius: '8px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {!isPremium ? (
                  <LockedFeature />
                ) : (
                  <div className="space-y-4">
                    {history && history.length > 0 ? (
                      history.map((session: any) => {
                        const duration = session.endTime
                          ? Math.floor(
                              (new Date(session.endTime).getTime() -
                                new Date(session.startTime).getTime()) /
                                60000
                            )
                          : 0;

                        return (
                          <div key={session.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-black text-white mb-2">{session.workoutPlan.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-white/60">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    {format(new Date(session.startTime), 'MMM dd, yyyy')}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {formatDistanceToNow(new Date(session.startTime), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-black text-white">{duration}min</div>
                                <p className="text-xs text-white/60">Duration</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/80">
                              <Dumbbell className="h-4 w-4 text-pink-500" />
                              <span>{session.completedSets.length} sets completed</span>
                            </div>
                            {session.notes && (
                              <div className="mt-4 p-4 rounded-xl bg-white/5">
                                <p className="text-sm text-white/60 mb-1">Notes:</p>
                                <p className="text-sm text-white">{session.notes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <HistoryIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No workout history yet</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {!isPremium ? (
                  <LockedFeature />
                ) : (
                  <div className="space-y-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-white">
                        {format(currentMonth, 'MMMM yyyy')}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          variant="outline"
                          size="icon"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          variant="outline"
                          size="icon"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-sm font-bold text-white/60 py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: startDay }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {daysInMonth.map((day) => {
                          const dayOfMonth = day.getDate();
                          const isToday = isSameDay(day, new Date());
                          const isScheduled = scheduledDays.includes(dayOfMonth);
                          const isCompleted = completedDays.includes(dayOfMonth);

                          return (
                            <button
                              key={day.toString()}
                              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${
                                isToday
                                  ? 'ring-2 ring-pink-500 bg-pink-500/10'
                                  : 'hover:bg-white/5'
                              } ${isCompleted ? 'bg-green-500/20' : ''} ${
                                isScheduled && !isCompleted ? 'bg-purple-500/20' : ''
                              }`}
                            >
                              <span className="text-white font-bold">{dayOfMonth}</span>
                              <div className="flex gap-1 mt-1">
                                {isScheduled && (
                                  <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-purple-400'}`} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500" />
                        <span className="text-white/80">Scheduled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500" />
                        <span className="text-white/80">Completed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded ring-2 ring-pink-500" />
                        <span className="text-white/80">Today</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
