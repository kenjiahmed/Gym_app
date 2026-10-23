'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Dumbbell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export type OnboardingStep = 'verification' | 'username' | 'units' | 'plans' | 'get-started';
export interface OnboardingData {
  completed: OnboardingStep[];
  name?: string;
  weightUnit?: 'kg' | 'lb';
  heightUnit?: 'cm' | 'ft-in';
  fitnessGoal?: string;
  plan?: 'free' | 'pro' | 'elite';
}

const STORAGE_KEY = 'fitness-onboarding';
export const steps: { id: OnboardingStep; label: string; path: string }[] = [
  { id: 'verification', label: 'Verification', path: '/onboarding/verification' },
  { id: 'username', label: 'Username', path: '/onboarding/username' },
  { id: 'units', label: 'Units', path: '/onboarding/units' },
  { id: 'plans', label: 'Plans', path: '/onboarding/plans' },
  { id: 'get-started', label: 'Get started', path: '/onboarding/get-started' },
];

export function readOnboarding(): OnboardingData {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"completed":[]}');
  } catch {
    return { completed: [] };
  }
}

export function writeOnboarding(data: OnboardingData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function finishStep(step: OnboardingStep, updates: Partial<OnboardingData> = {}) {
  const data = readOnboarding();
  writeOnboarding({ ...data, ...updates, completed: [...new Set([...data.completed, step])] });
}

export function useOnboardingGuard(step: OnboardingStep) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/register');
      return;
    }
    const currentIndex = steps.findIndex((item) => item.id === step);
    const data = readOnboarding();
    const missing = steps.slice(0, currentIndex).find((item) => !data.completed.includes(item.id));
    if (missing) {
      router.replace(missing.path);
      return;
    }
    setReady(true);
  }, [router, step]);
  return ready;
}

export function OnboardingShell({
  step,
  title,
  description,
  children,
  onBack,
  onContinue,
  continueLabel = 'Continue',
  busy = false,
  disableContinue = false,
}: {
  step: OnboardingStep;
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  busy?: boolean;
  disableContinue?: boolean;
}) {
  const index = steps.findIndex((item) => item.id === step);
  return (
    <main className="min-h-screen px-4 py-8 text-white sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Dumbbell className="h-7 w-7 text-pink-400" aria-hidden="true" />
          <span className="text-xl font-bold">GYM</span>
        </div>
        <nav aria-label="Onboarding progress" className="mb-8">
          <ol className="flex items-center justify-between gap-1 sm:gap-3">
            {steps.map((item, i) => {
              const completed = i < index;
              const active = i === index;
              return (
                <li key={item.id} aria-current={active ? 'step' : undefined} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3">
                  <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold sm:h-8 sm:w-8 ${active ? 'border-pink-400 bg-pink-500 text-white' : completed ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-white/20 bg-white/5 text-white/45'}`}>
                      {completed ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <span className={`truncate text-[10px] sm:text-xs ${active ? 'text-white' : completed ? 'text-emerald-200' : 'text-white/45'}`}>{item.label}</span>
                  </div>
                  {i < steps.length - 1 && <span aria-hidden="true" className={`mb-5 h-px min-w-2 flex-1 sm:mb-5 ${i < index ? 'bg-emerald-400/70' : 'bg-white/15'}`} />}
                </li>
              );
            })}
          </ol>
        </nav>
        <Card className="glass-card border-white/10 p-5 sm:p-8">
          <header className="mb-7">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">Step {index + 1} of {steps.length}</p>
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
          </header>
          {children}
          {(onBack || onContinue) && <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-between">
            {onBack ? <Button type="button" variant="outline" onClick={onBack} className="border-white/20 bg-white/5 text-white hover:bg-white/10"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button> : <span />}
            {onContinue && <Button type="button" onClick={onContinue} disabled={busy || disableContinue} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90">{busy ? 'Saving…' : continueLabel}<ArrowRight className="ml-2 h-4 w-4" /></Button>}
          </div>}
        </Card>
      </div>
    </main>
  );
}
