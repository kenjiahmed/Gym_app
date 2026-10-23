'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingShell, useOnboardingGuard } from '@/components/onboarding/OnboardingFlow';

export default function GetStartedPage() {
  const router = useRouter();
  const ready = useOnboardingGuard('get-started');
  if (!ready) return null;
  return <OnboardingShell step="get-started" title="You’re ready to get started" description="Your account is set up with the Free plan. You can update your profile and preferences from the dashboard." onBack={() => router.push('/onboarding/plans')}>
    <div className="flex flex-col items-center rounded-xl border border-emerald-300/15 bg-emerald-300/5 px-5 py-8 text-center">
      <CheckCircle2 className="h-12 w-12 text-emerald-300" aria-hidden="true" />
      <p className="mt-4 max-w-md text-sm leading-6 text-white/70">Email verification is not enabled in this application. Your account remains unverified; the rest of onboarding is complete.</p>
      <Button onClick={() => router.push('/dashboard/profile')} className="mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white"><Dumbbell className="mr-2 h-4 w-4" />Enter dashboard</Button>
    </div>
  </OnboardingShell>;
}
