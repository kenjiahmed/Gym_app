'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Filter, Search, X, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterState {
  category: string;
  gender: string;
  minPrice: number;
  maxPrice: number;
  search: string;
}

export default function ShopPage() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    gender: 'all',
    minPrice: 0,
    maxPrice: 1000,
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.gender !== 'all') params.append('gender', filters.gender);
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 1000) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    },
  });

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'sports_bras', label: 'Sports Bras' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'tops', label: 'Tops' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'shoes', label: 'Shoes' },
  ];

  const genderOptions = [
    { value: 'all', label: 'All' },
    { value: 'women', label: "Women's" },
    { value: 'men', label: "Men's" },
    { value: 'unisex', label: 'Unisex' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-neon-pink/10 via-neon-cyan/10 to-neon-lime/10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-pink/20 to-neon-cyan/20 rounded-full mb-6 backdrop-blur-lg border border-neon-pink/30"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-neon-cyan" />
              <span className="text-white font-semibold">Premium Athletic Wear</span>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-lime bg-clip-text text-transparent">
                Shop FitGlow
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover premium gym apparel designed for your fitness journey
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <Card className="p-4 mb-8 bg-gray-900/50 backdrop-blur-lg border-gray-800/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-neon-pink/30 hover:bg-neon-pink/10"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {showFilters && <X className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-pink/50"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-pink/50"
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Price Range: ${filters.minPrice} - ${filters.maxPrice}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, maxPrice: parseInt(e.target.value) })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters({ ...filters, gender: 'women' })}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filters.gender === 'women'
                ? 'bg-gradient-to-r from-neon-pink to-neon-cyan text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Women's
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters({ ...filters, gender: 'men' })}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filters.gender === 'men'
                ? 'bg-gradient-to-r from-neon-pink to-neon-cyan text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Men's
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters({ ...filters, category: 'sports_bras' })}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filters.category === 'sports_bras'
                ? 'bg-gradient-to-r from-neon-pink to-neon-cyan text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Sports Bras
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilters({ ...filters, category: 'bottoms' })}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${
              filters.category === 'bottoms'
                ? 'bg-gradient-to-r from-neon-pink to-neon-cyan text-white'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Leggings & Shorts
          </motion.button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-semibold">{products.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-gray-800/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-400">No products found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {products.map((product: any, idx: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
