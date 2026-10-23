'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  orderItems: Array<{
    id: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h1 className="text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Order Confirmed!
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Thank you for your purchase
          </p>
          <p className="text-gray-400">
            Order #{order.orderNumber}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Order Items */}
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-neon-cyan" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{item.product.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                    <p className="text-neon-cyan font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Shipping Address</h2>
            <div className="text-gray-300">
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span className="font-semibold">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span className="font-semibold">
                  {order.shippingCost === 0 ? (
                    <span className="text-green-400">FREE</span>
                  ) : (
                    `$${order.shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push('/dashboard/history')}
              className="flex-1 bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
            >
              View Order History
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => router.push('/shop')}
              variant="outline"
              className="flex-1 border-gray-700 hover:border-neon-cyan"
            >
              Continue Shopping
            </Button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            A confirmation email has been sent to your email address.
            <br />
            Your order will be shipped within 2-5 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
