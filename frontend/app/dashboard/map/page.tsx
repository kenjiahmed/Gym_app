'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, TrendingUp, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/fitness/PageHeader';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function MapPage() {
  const { user } = useAuthStore();
  const isPro = user?.subscriptionPlan !== 'free';
  
  const sampleRoutes = [
    {
      id: 1,
      name: 'Morning Run',
      date: 'Jan 20, 2026',
      distance: '5.2 km',
      duration: '28 min',
      pace: '5:23 min/km',
      calories: 412,
    },
    {
      id: 2,
      name: 'Evening Cycling',
      date: 'Jan 18, 2026',
      distance: '15.8 km',
      duration: '42 min',
      pace: '2:39 min/km',
      calories: 524,
    },
    {
      id: 3,
      name: 'Park Loop',
      date: 'Jan 15, 2026',
      distance: '3.5 km',
      duration: '18 min',
      pace: '5:08 min/km',
      calories: 285,
    },
  ];

  if (!isPro) {
    return (
      <div className="space-y-8 pb-12">
        <PageHeader 
          title="Workout Map" 
          subtitle="Track your outdoor activities"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-white/10 relative overflow-hidden h-[600px]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center p-8">
                <Lock className="w-20 h-20 text-pink-500 mx-auto mb-6" />
                <h2 className="text-4xl font-black text-white mb-4">Pro Feature</h2>
                <p className="text-xl text-white/80 mb-8 max-w-md mx-auto">
                  Upgrade to Pro to track your outdoor workouts and view your routes on the map
                </p>
                <Link href="/dashboard/pricing">
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-lg px-8 py-6">
                    <MapPin className="mr-2 h-5 w-5" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Blurred map preview */}
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 blur-sm flex items-center justify-center">
              <MapPin className="w-32 h-32 text-white/20" />
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Workout Map" 
        subtitle="Track and visualize your outdoor activities"
      />

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="h-[500px] relative bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            {/* Placeholder for actual map - would integrate Leaflet or Mapbox here */}
            <div className="text-center">
              <MapPin className="w-24 h-24 text-cyan-500 mx-auto mb-4 animate-bounce" />
              <p className="text-2xl font-bold text-white mb-2">Map Integration Coming Soon</p>
              <p className="text-white/60">
                Leaflet/Mapbox integration will display your workout routes here
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Routes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-white">Recent Outdoor Workouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sampleRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{route.name}</h3>
                    <p className="text-sm text-white/60">{route.date}</p>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    View Route
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-cyan-500" />
                    <div>
                      <p className="text-xs text-white/60">Distance</p>
                      <p className="text-lg font-bold text-white">{route.distance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-white/60">Duration</p>
                      <p className="text-lg font-bold text-white">{route.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    <div>
                      <p className="text-xs text-white/60">Pace</p>
                      <p className="text-lg font-bold text-white">{route.pace}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-orange-500 flex items-center justify-center font-bold">🔥</div>
                    <div>
                      <p className="text-xs text-white/60">Calories</p>
                      <p className="text-lg font-bold text-white">{route.calories}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
