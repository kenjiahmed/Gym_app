'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/fitness/PageHeader';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { user } = useAuthStore();
  const isPro = user?.subscriptionPlan !== 'free';
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  
  // Sample scheduled/completed workouts
  const scheduledDates = [5, 7, 12, 14, 19, 21, 26];
  const completedDates = [5, 7, 12];
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isScheduled = scheduledDates.includes(day);
      const isCompleted = completedDates.includes(day);
      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      
      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all
            ${isToday ? 'ring-2 ring-pink-500' : ''}
            ${isScheduled ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}
            ${isCompleted ? 'bg-green-500/20 border-green-500/40' : ''}
          `}
        >
          <span className={`text-lg font-bold ${isToday ? 'text-pink-500' : 'text-white'}`}>
            {day}
          </span>
          {isScheduled && (
            <div className="absolute bottom-1 flex gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-purple-400'}`}></div>
            </div>
          )}
        </motion.button>
      );
    }
    
    return days;
  };

  if (!isPro) {
    return (
      <div className="space-y-8 pb-12">
        <PageHeader 
          title="Workout Calendar" 
          subtitle="Schedule and track your workouts"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center p-8">
                <Lock className="w-20 h-20 text-pink-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black text-white mb-4">Pro Feature</h2>
                <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
                  Upgrade to Pro to unlock workout scheduling and calendar planning
                </p>
                <Link href="/dashboard/pricing">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-6">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Blurred preview */}
            <CardHeader className="blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black text-white">Preview Calendar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="blur-sm">
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Workout Calendar" 
        subtitle="Schedule and track your workouts"
        action={
          <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold">
            <Plus className="mr-2 h-5 w-5" />
            Schedule Workout
          </Button>
        }
      />

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-500/40 border border-purple-500"></div>
                <span className="text-sm text-white/80 font-medium">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/40 border border-green-500"></div>
                <span className="text-sm text-white/80 font-medium">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-pink-500"></div>
                <span className="text-sm text-white/80 font-medium">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-black text-white">
                {months[month]} {year}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={prevMonth}
                  variant="outline"
                  size="icon"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  onClick={nextMonth}
                  variant="outline"
                  size="icon"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-sm font-bold text-white/60 uppercase">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-white">Upcoming Workouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { date: 'Jan 19', name: 'Upper Body Blast', time: '6:00 PM' },
              { date: 'Jan 21', name: 'Leg Day', time: '7:00 AM' },
              { date: 'Jan 26', name: 'Full Body HIIT', time: '6:30 PM' },
            ].map((workout, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">{workout.name}</h4>
                    <p className="text-sm text-white/60">{workout.date} at {workout.time}</p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
