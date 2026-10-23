'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Card } from '../ui/card';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  brand: string;
  images: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  tags: string[];
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/shop/${product.id}`}>
        <Card className="overflow-hidden bg-gray-900/50 backdrop-blur-lg border-gray-800/50 hover:border-neon-pink/30 transition-all duration-300 group">
          {/* Image */}
          <div className="relative h-64 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
            {product.featured && (
              <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-neon-pink to-neon-cyan px-3 py-1 rounded-full text-xs font-bold text-white">
                FEATURED
              </div>
            )}
            <div className="absolute top-3 right-3 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-colors"
              >
                <Heart className="w-5 h-5 text-white" />
              </motion.button>
            </div>
            {/* Product Image */}
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Brand & Category */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wide">
                {product.brand}
              </span>
              <span className="text-xs text-neon-cyan capitalize">
                {product.category.replace('_', ' ')}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2 mb-3">
              {product.colors.slice(0, 4).map((color, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full border-2 border-gray-700"
                  style={{
                    background:
                      color.toLowerCase() === 'white'
                        ? '#fff'
                        : color.toLowerCase() === 'black'
                        ? '#000'
                        : color.toLowerCase().includes('pink')
                        ? '#ff6ec7'
                        : color.toLowerCase().includes('blue')
                        ? '#00d4ff'
                        : color.toLowerCase().includes('purple')
                        ? '#a855f7'
                        : color.toLowerCase().includes('green')
                        ? '#a0ff1f'
                        : '#6b7280',
                  }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-gray-400">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>

            {/* Price & Cart */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <div className="text-2xl font-bold bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-lime bg-clip-text text-transparent">
                ${product.price}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-neon-pink to-neon-cyan rounded-lg text-white font-semibold text-sm hover:shadow-lg hover:shadow-neon-pink/50 transition-shadow"
              >
                <ShoppingCart className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
