'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Package,
  Truck,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface CartItem {
  id: string;
  quantity: number;
  size: string;
  color: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    brand?: string;
  };
}

interface CartSummary {
  cart: {
    id: string;
    cartItems: CartItem[];
  };
  summary: {
    itemCount: number;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
  };
}

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch cart with summary
  const { data: cartData, isLoading } = useQuery<CartSummary>({
    queryKey: ['cart-summary'],
    queryFn: async () => {
      const response = await api.get('/cart/summary');
      return response.data;
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update quantity', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/cart/clear');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
    onError: () => {
      toast.error('Failed to clear cart');
    },
  });

  const handleUpdateQuantity = (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your cart...</div>
      </div>
    );
  }

  const cart = cartData?.cart;
  const summary = cartData?.summary;
  const isEmpty = !cart || cart.cartItems.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/shop')}
            className="mb-4 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-lime bg-clip-text text-transparent">
              Shopping Cart
            </span>
          </h1>
          {!isEmpty && (
            <p className="text-gray-400 text-lg">
              {summary?.itemCount} {summary?.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        {isEmpty ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto p-12 bg-gray-900/50 border-gray-800">
              <div className="w-24 h-24 bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-neon-cyan" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button
                onClick={() => router.push('/shop')}
                className="bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart?.cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-6 bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all">
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div
                          className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => router.push(`/shop/${item.product.id}`)}
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              {item.product.brand && (
                                <p className="text-neon-cyan text-sm font-semibold mb-1">
                                  {item.product.brand}
                                </p>
                              )}
                              <h3
                                className="text-white font-bold text-lg line-clamp-2 cursor-pointer hover:text-neon-cyan transition-colors"
                                onClick={() => router.push(`/shop/${item.product.id}`)}
                              >
                                {item.product.name}
                              </h3>
                            </div>
                            <button
                              onClick={() => removeItemMutation.mutate(item.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                              disabled={removeItemMutation.isPending}
                            >
                              <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700">
                              Size: {item.size}
                            </span>
                            <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700">
                              Color: {item.color}
                            </span>
                            {item.product.stock < 10 && (
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/30">
                                Only {item.product.stock} left
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                className="p-2 hover:bg-gray-700 transition-colors rounded-l-lg"
                                disabled={item.quantity === 1 || updateQuantityMutation.isPending}
                              >
                                <Minus className="w-4 h-4 text-white" />
                              </button>
                              <span className="px-4 text-white font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                className="p-2 hover:bg-gray-700 transition-colors rounded-r-lg"
                                disabled={
                                  item.quantity >= item.product.stock || updateQuantityMutation.isPending
                                }
                              >
                                <Plus className="w-4 h-4 text-white" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-2xl font-bold bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-gray-400 text-sm">
                                  ${item.product.price.toFixed(2)} each
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear Cart Button */}
              <Button
                onClick={() => clearCartMutation.mutate()}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                disabled={clearCartMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <Card className="p-6 bg-gray-900/50 border-gray-800">
                  <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span className="font-semibold">${summary?.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Tax (8%)</span>
                      <span className="font-semibold">${summary?.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Shipping</span>
                      <span className="font-semibold">
                        {summary && summary.shippingCost === 0 ? (
                          <span className="text-green-400">FREE</span>
                        ) : (
                          `$${summary?.shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    {summary && summary.subtotal < 100 && summary.subtotal > 0 && (
                      <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                        <p className="text-neon-cyan text-sm flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          Add ${(100 - summary.subtotal).toFixed(2)} more for free shipping!
                        </p>
                      </div>
                    )}

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between text-white text-xl font-bold">
                        <span>Total</span>
                        <span className="bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                          ${summary?.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Card>

                {/* Features */}
                <Card className="p-6 bg-gray-900/50 border-gray-800">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neon-cyan/20 rounded-lg">
                        <Package className="w-5 h-5 text-neon-cyan" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Free Returns</p>
                        <p className="text-gray-400 text-xs">30-day return policy</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neon-pink/20 rounded-lg">
                        <Truck className="w-5 h-5 text-neon-pink" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Fast Shipping</p>
                        <p className="text-gray-400 text-xs">2-5 business days</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
