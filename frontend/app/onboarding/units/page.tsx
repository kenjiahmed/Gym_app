'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { OnboardingShell, finishStep, readOnboarding, useOnboardingGuard, writeOnboarding } from '@/components/onboarding/OnboardingFlow';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const goals = [
  ['weight_loss', 'Weight loss'], ['muscle_gain', 'Muscle gain'], ['maintenance', 'Maintenance'], ['endurance', 'Endurance'],
];

export default function UnitsPage() {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  const ready = useOnboardingGuard('units');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft-in'>('cm');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready) { const data = readOnboarding(); setWeightUnit(data.weightUnit || 'kg'); setHeightUnit(data.heightUnit || 'cm'); setFitnessGoal(data.fitnessGoal || ''); } }, [ready]);

  const save = async () => {
    setBusy(true); setError('');
    writeOnboarding({ ...readOnboarding(), weightUnit, heightUnit, fitnessGoal });
    try {
      if (fitnessGoal) {
        await usersApi.updateProfile({ fitnessGoal });
        updateUser({ fitnessGoal });
      }
      finishStep('units', { weightUnit, heightUnit, fitnessGoal });
      router.push('/onboarding/plans');
    } catch {
      setError('Could not save your fitness goal. Your unit choices are kept on this device; please try again.');
    } finally { setBusy(false); }
  };
  if (!ready) return null;
  const optionClass = (selected: boolean) => `rounded-xl border px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${selected ? 'border-pink-400 bg-pink-500/15 text-white' : 'border-white/15 bg-white/5 text-white/65 hover:bg-white/10'}`;
  return <OnboardingShell step="units" title="Set your units" description="Choose how you want to see measurements. These unit choices are saved in this browser; your profile also supports a fitness goal." onBack={() => router.push('/onboarding/username')} onContinue={save} busy={busy}>
    <div className="space-y-6">
      <fieldset><legend className="mb-3 text-sm font-medium">Weight</legend><div className="grid grid-cols-2 gap-3">{(['kg', 'lb'] as const).map((unit) => <button key={unit} type="button" aria-pressed={weightUnit === unit} onClick={() => { setWeightUnit(unit); writeOnboarding({ ...readOnboarding(), weightUnit: unit }); }} className={optionClass(weightUnit === unit)}>{unit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}</button>)}</div></fieldset>
      <fieldset><legend className="mb-3 text-sm font-medium">Height</legend><div className="grid grid-cols-2 gap-3">{(['cm', 'ft-in'] as const).map((unit) => <button key={unit} type="button" aria-pressed={heightUnit === unit} onClick={() => { setHeightUnit(unit); writeOnboarding({ ...readOnboarding(), heightUnit: unit }); }} className={optionClass(heightUnit === unit)}>{unit === 'cm' ? 'Centimeters (cm)' : 'Feet and inches (ft/in)'}</button>)}</div></fieldset>
      <div className="space-y-2"><Label htmlFor="fitness-goal" className="text-white">Fitness goal <span className="text-white/45">(optional)</span></Label><select id="fitness-goal" value={fitnessGoal} onChange={(event) => { setFitnessGoal(event.target.value); writeOnboarding({ ...readOnboarding(), fitnessGoal: event.target.value }); }} className="h-11 w-full rounded-md border border-white/15 bg-slate-950 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"><option value="">Choose a goal</option>{goals.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><p className="text-xs text-white/45">Experience level is not part of the current user profile, so it is not requested here.</p></div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  </OnboardingShell>;
}
