'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
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
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/20',
    label: 'Pending',
  },
  paid: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-400/20',
    label: 'Paid',
  },
  processing: {
    icon: Package,
    color: 'text-blue-400',
    bg: 'bg-blue-400/20',
    label: 'Processing',
  },
  shipped: {
    icon: Truck,
    color: 'text-purple-400',
    bg: 'bg-purple-400/20',
    label: 'Shipped',
  },
  delivered: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-400/20',
    label: 'Delivered',
  },
  canceled: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/20',
    label: 'Canceled',
  },
};

export default function OrdersPage() {
  const router = useRouter();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const response = await api.get('/orders/my-orders');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  const isEmpty = orders.length === 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">
          <span className="bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-lime bg-clip-text text-transparent">
            My Orders
          </span>
        </h1>
        <p className="text-gray-400 text-lg">View and track all your orders</p>
      </div>

      {isEmpty ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Card className="max-w-md mx-auto p-12 bg-gray-900/50 border-gray-800">
            <div className="w-24 h-24 bg-gradient-to-br from-neon-pink/20 to-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-neon-cyan" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No orders yet</h2>
            <p className="text-gray-400 mb-8">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Button
              onClick={() => router.push('/shop')}
              className="bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Button>
          </Card>
        </motion.div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package;
            const statusStyle = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-700">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusStyle.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${statusStyle.color}`} />
                        <span className={`font-semibold ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div
                          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => router.push(`/shop/${item.product.id}`)}
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className="text-white font-semibold mb-1 cursor-pointer hover:text-neon-cyan transition-colors line-clamp-1"
                            onClick={() => router.push(`/shop/${item.product.id}`)}
                          >
                            {item.product.name}
                          </h4>
                          <p className="text-gray-400 text-sm mb-1">
                            Size: {item.size} • Color: {item.color}
                          </p>
                          <p className="text-gray-400 text-sm">
                            Qty: {item.quantity} × ${item.price.toFixed(2)} ={' '}
                            <span className="text-neon-cyan font-semibold">
                              ${(item.quantity * item.price).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div>
                        <span className="text-gray-500">Items:</span>{' '}
                        <span className="text-white font-semibold">
                          {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <span className="text-gray-500">Tracking:</span>{' '}
                          <span className="text-neon-cyan font-semibold">{order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => router.push(`/order-confirmation/${order.id}`)}
                      variant="outline"
                      className="border-gray-700 hover:border-neon-cyan hover:text-neon-cyan"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
