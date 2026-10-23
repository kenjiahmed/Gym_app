'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { OnboardingShell, finishStep, readOnboarding, useOnboardingGuard, writeOnboarding } from '@/components/onboarding/OnboardingFlow';

const plans = [
  { id: 'free' as const, name: 'Free', price: '$0', period: 'forever', description: 'A simple way to get started', icon: Star, features: ['Basic workout tracking', 'Up to 3 workout plans', '7 days of history', 'Basic stats'] },
  { id: 'pro' as const, name: 'Pro', price: '$9.99', period: 'per month', description: 'For consistent training', icon: Zap, features: ['Everything in Free', 'Unlimited workout plans', 'Advanced analytics', 'Calendar scheduling', 'Unlimited history'] },
  { id: 'elite' as const, name: 'Elite', price: '$19.99', period: 'per month', description: 'More coaching features', icon: Crown, features: ['Everything in Pro', 'Personal AI coach', 'Custom meal plans', 'Video form analysis', 'Priority support'] },
];

export default function PlansPage() {
  const router = useRouter();
  const ready = useOnboardingGuard('plans');
  const [plan, setPlan] = useState<'free' | 'pro' | 'elite'>('free');
  useEffect(() => { if (ready) setPlan(readOnboarding().plan || 'free'); }, [ready]);
  if (!ready) return null;
  const continueWithFree = () => {
    finishStep('plans', { plan: 'free' });
    router.push('/onboarding/get-started');
  };
  return <OnboardingShell step="plans" title="Choose your plan" description="Free, Pro, and Elite are the plans configured in the app. You can start on Free and review paid options later." onBack={() => router.push('/onboarding/units')} onContinue={continueWithFree} continueLabel="Continue with Free" disableContinue={plan !== 'free'}>
    <fieldset>
      <legend className="sr-only">Select a subscription plan</legend>
      <div role="radiogroup" aria-label="Subscription plan" className="grid gap-3 md:grid-cols-3">
        {plans.map((item) => {
          const Icon = item.icon;
          const selected = plan === item.id;
          return <button key={item.id} type="button" role="radio" aria-checked={selected} onClick={() => { setPlan(item.id); writeOnboarding({ ...readOnboarding(), plan: item.id }); }} className={`h-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${selected ? 'border-pink-400 bg-pink-500/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'}`}>
            <span className="flex items-center justify-between"><Icon className="h-5 w-5 text-pink-300" aria-hidden="true" />{selected && <Check className="h-4 w-4 text-emerald-300" aria-label="Selected" />}</span>
            <span className="mt-3 block text-lg font-bold">{item.name}</span>
            <span className="mt-1 block text-xl font-semibold">{item.price}<span className="ml-1 text-xs font-normal text-white/50">{item.period}</span></span>
            <span className="mt-1 block min-h-9 text-xs text-white/55">{item.description}</span>
            <span className="mt-3 block space-y-2">{item.features.map((feature) => <span key={feature} className="flex gap-2 text-xs text-white/75"><Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" />{feature}</span>)}</span>
          </button>;
        })}
      </div>
    </fieldset>
    {plan !== 'free' && <p role="status" className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">Paid-plan checkout is not available yet. Stripe is configured for shop orders, but the backend has no subscription checkout or confirmation flow. No paid plan will be activated here. Select Free to continue.</p>}
  </OnboardingShell>;
}
