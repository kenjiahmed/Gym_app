'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingShell, finishStep, useOnboardingGuard } from '@/components/onboarding/OnboardingFlow';

export default function VerificationPage() {
  const router = useRouter();
  const ready = useOnboardingGuard('verification');
  if (!ready) return null;
  return <OnboardingShell step="verification" title="Email verification" description="One quick note about the account you just created." onContinue={() => { finishStep('verification'); router.push('/onboarding/username'); }}>
    <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-5" role="status">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-amber-100">Email verification is not enabled</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">This app does not currently send verification emails or provide a code confirmation endpoint. Your account has not been marked as verified. You can continue setting up your profile.</p>
        </div>
      </div>
    </div>
    <div className="mt-5 flex items-center gap-2 text-sm text-white/50"><MailCheck className="h-4 w-4" />No verification code is required or accepted.</div>
  </OnboardingShell>;
}
