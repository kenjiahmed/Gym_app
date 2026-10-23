'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ShoppingCart,
  Heart,
  Star,
  Check,
  Minus,
  Plus,
  ArrowLeft,
  Package,
  Truck,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  brand?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  rating?: number;
  reviewCount: number;
  tags: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = params.id as string;

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    },
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ['related-products', product?.category, product?.gender],
    queryFn: async () => {
      if (!product) return [];
      const response = await api.get(
        `/products?category=${product.category}&gender=${product.gender}&limit=4`
      );
      return response.data.filter((p: Product) => p.id !== productId).slice(0, 4);
    },
    enabled: !!product,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/cart/add', {
        productId,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Added to cart!', {
        description: `${product?.name} has been added to your cart.`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to add to cart', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/wishlist/add', { productId });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Added to wishlist!');
    },
    onError: () => {
      toast.error('Failed to add to wishlist');
    },
  });

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color');
      return;
    }
    addToCartMutation.mutate();
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Initialize selected color when product loads
  useState(() => {
    if (product && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/shop')}
          className="mb-6 text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800 border border-gray-700"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-2xl font-bold text-red-400">Out of Stock</span>
                </div>
              )}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-neon-pink to-neon-cyan px-4 py-2 rounded-full">
                  <span className="text-white font-bold">Featured</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-neon-cyan'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              {product.brand && <p className="text-neon-cyan font-semibold mb-2">{product.brand}</p>}
              <h1 className="text-4xl font-black text-white mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">{product.rating}</span>
                    <span className="text-gray-400">({product.reviewCount} reviews)</span>
                  </div>
                )}
                <span className="text-gray-400">|</span>
                <span className="text-gray-400 capitalize">{product.gender}</span>
              </div>
              <p className="text-5xl font-black bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </Card>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Size Selection */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Select Size {!selectedSize && <span className="text-red-400">*</span>}
              </label>
              <div className="grid grid-cols-5 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-lg font-semibold transition-all ${
                      selectedSize === size
                        ? 'bg-gradient-to-r from-neon-pink to-neon-cyan text-white border-2 border-transparent'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-white font-semibold mb-3 block">
                Select Color {!selectedColor && <span className="text-red-400">*</span>}
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedColor === color
                        ? 'bg-gradient-to-r from-neon-pink to-neon-cyan text-white border-2 border-transparent'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-white font-semibold mb-3 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700">
                  <button
                    onClick={decrementQuantity}
                    className="p-3 hover:bg-gray-700 transition-colors rounded-l-lg"
                    disabled={quantity === 1}
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <span className="px-6 text-white font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-3 hover:bg-gray-700 transition-colors rounded-r-lg"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
                <span className="text-gray-400">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCartMutation.isPending}
                className="flex-1 py-6 text-lg font-bold bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
              </Button>
              <Button
                onClick={() => addToWishlistMutation.mutate()}
                variant="outline"
                className="py-6 border-gray-700 hover:border-neon-pink hover:text-neon-pink"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neon-cyan/20 rounded-lg">
                    <Package className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Free Returns</p>
                    <p className="text-gray-400 text-sm">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neon-pink/20 rounded-lg">
                    <Truck className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Free Shipping</p>
                    <p className="text-gray-400 text-sm">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neon-lime/20 rounded-lg">
                    <Shield className="w-5 h-5 text-neon-lime" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Secure Payment</p>
                    <p className="text-gray-400 text-sm">100% secure checkout</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-black text-white mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/shop/${relatedProduct.id}`)}
                >
                  <Card className="overflow-hidden bg-gray-900/50 border-gray-800 hover:border-neon-cyan transition-all group">
                    <div className="aspect-square relative">
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-2xl font-bold bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                        ${relatedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
