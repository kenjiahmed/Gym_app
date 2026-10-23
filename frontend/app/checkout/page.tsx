'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Lock,
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CartSummary {
  cart: {
    id: string;
    cartItems: Array<{
      id: string;
      quantity: number;
      size: string;
      color: string;
      product: {
        id: string;
        name: string;
        price: number;
        images: string[];
      };
    }>;
  };
  summary: {
    itemCount: number;
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
  };
}

interface ShippingInfo {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function CheckoutForm({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        toast.error('Payment failed', {
          description: error.message,
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        await api.post('/orders/webhook/payment-success', {
          paymentIntentId: paymentIntent.id,
        });
        
        toast.success('Payment successful!');
        router.push(`/order-confirmation/${orderId}`);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred');
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
      >
        {isProcessing ? (
          <>Processing...</>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay Now
          </>
        )}
      </Button>

      <p className="text-center text-gray-400 text-sm flex items-center justify-center gap-2">
        <Lock className="w-4 h-4" />
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
  });
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Fetch cart summary
  const { data: cartData, isLoading } = useQuery<CartSummary>({
    queryKey: ['cart-summary'],
    queryFn: async () => {
      const response = await api.get('/cart/summary');
      return response.data;
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/orders/from-cart', {
        shippingAddress: shippingInfo,
      });
      return response.data;
    },
    onSuccess: async (order) => {
      setOrderId(order.id);
      
      // Create payment intent
      const paymentResponse = await api.post(`/orders/${order.id}/payment-intent`);
      setClientSecret(paymentResponse.data.clientSecret);
      
      // Move to payment step
      setStep('payment');
      
      // Clear cart from cache
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-summary'] });
    },
    onError: (error: any) => {
      toast.error('Failed to create order', {
        description: error.response?.data?.message || 'Please try again.',
      });
    },
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate shipping info
    if (!shippingInfo.name || !shippingInfo.street || !shippingInfo.city || 
        !shippingInfo.state || !shippingInfo.zip) {
      toast.error('Please fill in all required fields');
      return;
    }

    createOrderMutation.mutate();
  };

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const isEmpty = !cartData || !cartData.cart || cartData.cart.cartItems.length === 0;

  if (isEmpty && step === 'shipping') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="max-w-md p-12 bg-gray-900/50 border-gray-800 text-center">
          <ShoppingBag className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <Button onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => step === 'shipping' ? router.push('/cart') : setStep('shipping')}
            className="mb-4 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 'shipping' ? 'Back to Cart' : 'Back to Shipping'}
          </Button>
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-lime bg-clip-text text-transparent">
              Checkout
            </span>
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-neon-cyan' : 'text-green-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step === 'shipping' ? 'border-neon-cyan bg-neon-cyan/20' : 'border-green-400 bg-green-400/20'
              }`}>
                {step === 'payment' ? <Check className="w-5 h-5" /> : <span className="font-bold">1</span>}
              </div>
              <span className="font-semibold">Shipping</span>
            </div>
            <div className={`w-16 h-0.5 ${step === 'payment' ? 'bg-neon-cyan' : 'bg-gray-700'}`} />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-neon-cyan' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                step === 'payment' ? 'border-neon-cyan bg-neon-cyan/20' : 'border-gray-700'
              }`}>
                <span className="font-bold">2</span>
              </div>
              <span className="font-semibold">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' ? (
              <Card className="p-8 bg-gray-900/50 border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">Shipping Information</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-white">Full Name *</Label>
                    <Input
                      id="name"
                      value={shippingInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="street" className="text-white">Street Address *</Label>
                    <Input
                      id="street"
                      value={shippingInfo.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="mt-2 bg-gray-800 border-gray-700 text-white"
                      placeholder="123 Main St, Apt 4B"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-white">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-white">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        placeholder="NY"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip" className="text-white">ZIP Code *</Label>
                      <Input
                        id="zip"
                        value={shippingInfo.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-white">Country *</Label>
                      <Input
                        id="country"
                        value={shippingInfo.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="mt-2 bg-gray-800 border-gray-700 text-white"
                        placeholder="USA"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="w-full py-6 text-lg font-bold bg-gradient-to-r from-neon-pink to-neon-cyan hover:opacity-90 transition-opacity"
                  >
                    {createOrderMutation.isPending ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-8 bg-gray-900/50 border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Payment Details
                </h2>
                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} orderId={orderId!} />
                  </Elements>
                )}
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gray-900/50 border-gray-800 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartData?.cart.cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="text-neon-cyan font-semibold text-sm">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">${cartData?.summary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span className="font-semibold">${cartData?.summary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {cartData?.summary.shippingCost === 0 ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      `$${cartData?.summary.shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
                    ${cartData?.summary.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
