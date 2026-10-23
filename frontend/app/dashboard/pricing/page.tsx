'use client';

import { motion } from 'framer-motion';
import { Check, Crown, Zap, Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/fitness/PageHeader';
import { useAuthStore } from '@/lib/store';

export default function PricingPage() {
  const { user } = useAuthStore();
  
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Star,
      color: 'from-gray-500 to-gray-600',
      features: [
        { text: 'Basic workout tracking', included: true },
        { text: 'Up to 3 workout plans', included: true },
        { text: '7 days history', included: true },
        { text: 'Basic stats', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Calendar scheduling', included: false },
        { text: 'Unlimited history', included: false },
        { text: 'Custom plans', included: false },
      ],
      buttonText: 'Current Plan',
      current: user?.subscriptionPlan === 'free',
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'For serious fitness enthusiasts',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited workout plans', included: true },
        { text: 'Advanced analytics & charts', included: true },
        { text: 'Calendar scheduling', included: true },
        { text: 'Unlimited history', included: true },
        { text: 'Progress photos', included: true },
        { text: 'Export data', included: true },
        { text: 'Priority support', included: false },
      ],
      buttonText: 'Upgrade to Pro',
      current: user?.subscriptionPlan === 'pro',
    },
    {
      name: 'Elite',
      price: '$19.99',
      period: 'per month',
      description: 'Maximum performance & features',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Personal AI coach', included: true },
        { text: 'Custom meal plans', included: true },
        { text: 'Video form analysis', included: true },
        { text: '1-on-1 coaching calls', included: true },
        { text: 'Early access to features', included: true },
        { text: 'Priority support', included: true },
        { text: 'Exclusive community', included: true },
      ],
      buttonText: 'Upgrade to Elite',
      current: user?.subscriptionPlan === 'elite',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Unlock premium features and take your fitness journey to the next level
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={plan.popular ? 'md:-mt-4' : ''}
            >
              <Card className={`glass-card border-white/10 relative overflow-hidden h-full ${
                plan.popular ? 'ring-2 ring-pink-500 shadow-2xl shadow-pink-500/20' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold uppercase rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} p-3 flex items-center justify-center`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                  </div>
                  <p className="text-white/60 text-sm">{plan.period}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                            <X className="w-3 h-3 text-white/40" />
                          </div>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-white' : 'text-white/40'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full font-bold text-lg py-6 ${
                      plan.current 
                        ? 'bg-white/10 text-white cursor-default' 
                        : plan.popular
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/20'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-white text-center">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and digital wallets through Stripe.',
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Absolutely! You can change your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'The Free plan is available forever with no credit card required. You can upgrade to Pro or Elite at any time.',
              },
            ].map((faq, index) => (
              <div key={index} className="border-b border-white/10 last:border-0 pb-6 last:pb-0">
                <h4 className="text-lg font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-white/60">{faq.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
