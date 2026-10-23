'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dumbbell, Home, Plus, History, Settings, LogOut, Menu, X, Zap, BarChart3, Calendar, User, Crown, ShoppingBag, ShoppingCart, Package, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/dashboard');
  };

  // Show layout for both authenticated and unauthenticated users
  // But only show navigation for authenticated users

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', gradient: 'from-pink-500 to-rose-500' },
    { icon: Layers, label: 'Programs', href: '/dashboard/programs', gradient: 'from-violet-500 to-purple-500' },
    { icon: Plus, label: 'New Workout', href: '/dashboard/workouts/new', gradient: 'from-purple-500 to-indigo-500' },
    { icon: ShoppingBag, label: 'Shop', href: '/shop', gradient: 'from-cyan-500 to-blue-500' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart', gradient: 'from-green-500 to-teal-500' },
    { icon: Package, label: 'My Orders', href: '/dashboard/orders', gradient: 'from-orange-500 to-amber-500' },
    { icon: User, label: 'Profile', href: '/dashboard/profile', gradient: 'from-indigo-500 to-purple-500' },
    { icon: Crown, label: 'Pricing', href: '/dashboard/pricing', gradient: 'from-yellow-500 to-orange-500' },
  ];

  // Only show admin to admin users
  const adminNavItem = { icon: Settings, label: 'Admin', href: '/dashboard/admin/products', gradient: 'from-red-500 to-pink-500' };
  const allNavItems = user?.role === 'admin' ? [...navItems, adminNavItem] : navItems;

  return (
    <div className="min-h-screen">
      {isAuthenticated && (
        <>
      {/* Mobile Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-white">GYM</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="lg:hidden fixed top-16 right-0 bottom-0 w-64 z-40 bg-black/95 backdrop-blur-xl border-l border-white/10 p-6"
          >
            <nav className="space-y-2">
              {allNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${
                        isActive ? `bg-gradient-to-r ${item.gradient} text-white` : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white/80 hover:text-white mt-8"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden lg:block fixed left-0 top-0 h-screen w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6 z-40"
      >
        <div className="flex items-center gap-3 mb-12">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg shadow-pink-500/50">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">GYM</h1>
            <p className="text-xs text-white/60 font-semibold">TRAINING APP</p>
          </div>
        </div>

        <nav className="space-y-3">
          {allNavItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-12 relative group overflow-hidden ${
                      isActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {!isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    )}
                    <item.icon className={`h-5 w-5 relative ${isActive ? 'animate-pulse-slow' : ''}`} />
                    <span className="font-bold relative">{item.label}</span>
                    {isActive && <Zap className="h-4 w-4 ml-auto animate-pulse" />}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10"
          >
            <p className="text-sm font-bold text-white mb-1">{user?.name}</p>
            <p className="text-xs text-white/60">{user?.email}</p>
          </motion.div>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-white/20 text-white/80 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-bold">Logout</span>
          </Button>
        </div>
      </motion.aside>
        </>
      )}

      {/* Main content */}
      <main className={`${isAuthenticated ? 'lg:ml-72 pt-20 lg:pt-0' : ''} min-h-screen`}>
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
