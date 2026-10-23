'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { OnboardingShell, finishStep, readOnboarding, useOnboardingGuard, writeOnboarding } from '@/components/onboarding/OnboardingFlow';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function UsernamePage() {
  const router = useRouter();
  const ready = useOnboardingGuard('username');
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready) setName(readOnboarding().name || user?.name || ''); }, [ready, user?.name]);

  const save = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) { setError('Enter a display name with at least 2 characters.'); return; }
    setBusy(true); setError('');
    try {
      const { data } = await usersApi.updateProfile({ name: trimmed });
      updateUser({ name: data.name });
      finishStep('username', { name: data.name });
      router.push('/onboarding/units');
    } catch {
      setError('We could not save your display name. Please try again.');
    } finally { setBusy(false); }
  };
  if (!ready) return null;
  return <OnboardingShell step="username" title="Choose your display name" description="Your registration name is already filled in. You can keep it or change how it appears in your account." onBack={() => router.push('/onboarding/verification')} onContinue={save} busy={busy}>
    <div className="space-y-2">
      <Label htmlFor="display-name" className="text-white">Display name</Label>
      <Input id="display-name" autoComplete="nickname" value={name} maxLength={60} onChange={(event) => { const value = event.target.value; setName(value); setError(''); writeOnboarding({ ...readOnboarding(), name: value }); }} className="border-white/15 bg-black/20 text-white" aria-invalid={!!error} aria-describedby={error ? 'display-name-error' : 'display-name-help'} />
      <p id="display-name-help" className="text-xs text-white/50">This updates the name on your existing account; no new account is created.</p>
      {error && <p id="display-name-error" role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  </OnboardingShell>;
}
