'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutSessionsApi, workoutPlansApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Timer, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CompletedSet {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight?: number;
}

interface ExerciseRPE {
  exerciseId: string;
  rpe: number;
}

export default function StartWorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const planId = params.id as string;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [exerciseRPEs, setExerciseRPEs] = useState<ExerciseRPE[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { data: plan } = useQuery({
    queryKey: ['workout-plan', planId],
    queryFn: async () => {
      const response = await workoutPlansApi.getById(planId);
      return response.data;
    },
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await workoutSessionsApi.start(planId);
      return response.data;
    },
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      const response = await workoutSessionsApi.complete(sessionId, {
        completedSets,
        notes,
      });
      
      // Log performance data for adaptive training
      // Group completed sets by exercise
      const exerciseData = new Map<string, { sets: CompletedSet[], rpe: number | null }>();
      
      completedSets.forEach(set => {
        if (!exerciseData.has(set.exerciseId)) {
          const rpeData = exerciseRPEs.find(r => r.exerciseId === set.exerciseId);
          exerciseData.set(set.exerciseId, { sets: [], rpe: rpeData?.rpe || null });
        }
        exerciseData.get(set.exerciseId)!.sets.push(set);
      });

      // Send performance logs to adaptive training API
      const promises = Array.from(exerciseData.entries()).map(async ([exerciseId, data]) => {
        const totalReps = data.sets.reduce((sum, set) => sum + set.reps, 0);
        const avgWeight = data.sets.reduce((sum, set) => sum + (set.weight || 0), 0) / data.sets.length;
        const setsCompleted = data.sets.length;
        
        try {
          await fetch('/api/adaptive-training/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exerciseId,
              workoutSessionId: sessionId,
              weightUsed: avgWeight,
              repsCompleted: Math.round(totalReps / setsCompleted),
              setsCompleted,
              rpe: data.rpe,
              notes: '',
            }),
          });
        } catch (error) {
          console.error('Failed to log performance:', error);
        }
      });

      await Promise.all(promises);
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['active-session'] });
      queryClient.invalidateQueries({ queryKey: ['adaptive-insights'] });
      router.push('/dashboard');
    },
  });

  useEffect(() => {
    if (plan && !sessionId) {
      startMutation.mutate();
    }
  }, [plan]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      const interval = setInterval(() => {
        setRestTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const markSetComplete = (exerciseId: string, setNumber: number, reps: number, weight?: number) => {
    setCompletedSets([
      ...completedSets,
      { exerciseId, setNumber, reps: reps || 0, weight },
    ]);

    const exercise = plan?.workoutExercises[currentExerciseIndex];
    if (exercise) {
      setRestTimer(exercise.restTime);
    }
  };

  const isSetCompleted = (exerciseId: string, setNumber: number) => {
    return completedSets.some(
      (s) => s.exerciseId === exerciseId && s.setNumber === setNumber
    );
  };

  const getCompletedSetsForExercise = (exerciseId: string) => {
    return completedSets.filter((s) => s.exerciseId === exerciseId).length;
  };

  const setExerciseRPE = (exerciseId: string, rpe: number) => {
    setExerciseRPEs(prev => {
      const existing = prev.find(r => r.exerciseId === exerciseId);
      if (existing) {
        return prev.map(r => r.exerciseId === exerciseId ? { ...r, rpe } : r);
      }
      return [...prev, { exerciseId, rpe }];
    });
  };

  const getExerciseRPE = (exerciseId: string) => {
    return exerciseRPEs.find(r => r.exerciseId === exerciseId)?.rpe;
  };

  const isExerciseComplete = (exerciseId: string, requiredSets: number) => {
    return getCompletedSetsForExercise(exerciseId) >= requiredSets;
  };

  const currentExercise = plan?.workoutExercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === (plan?.workoutExercises.length || 0) - 1;

  if (!plan || !currentExercise) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading workout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{plan.name}</h1>
          <p className="text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {plan.workoutExercises.length}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-2xl font-bold mb-1">
            <Timer className="h-6 w-6" />
            {formatTime(elapsedTime)}
          </div>
          <p className="text-sm text-muted-foreground">Total Time</p>
        </div>
      </div>

      {/* Rest Timer */}
      {restTimer !== null && restTimer > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{restTimer}s</div>
              <p className="text-muted-foreground">Rest Time Remaining</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setRestTimer(null)}
              >
                Skip Rest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <CardTitle>{currentExercise.exercise.name}</CardTitle>
          <CardDescription>
            {currentExercise.exercise.muscleGroup} •{' '}
            {currentExercise.sets} sets × {currentExercise.reps} reps •{' '}
            {currentExercise.restTime}s rest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: currentExercise.sets }).map((_, setIndex) => {
            const setNumber = setIndex + 1;
            const isCompleted = isSetCompleted(currentExercise.exerciseId, setNumber);

            return (
              <div
                key={setIndex}
                className={`flex items-center gap-4 p-4 border rounded-lg ${
                  isCompleted ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                  <span className="font-bold">{setNumber}</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Reps</Label>
                    <Input
                      type="number"
                      placeholder={currentExercise.reps.toString()}
                      min="1"
                      disabled={isCompleted}
                      id={`reps-${setNumber}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      min="0"
                      step="0.5"
                      disabled={isCompleted}
                      id={`weight-${setNumber}`}
                    />
                  </div>
                </div>
                <Button
                  variant={isCompleted ? 'secondary' : 'default'}
                  size="icon"
                  disabled={isCompleted}
                  onClick={() => {
                    const repsInput = document.getElementById(`reps-${setNumber}`) as HTMLInputElement;
                    const weightInput = document.getElementById(`weight-${setNumber}`) as HTMLInputElement;
                    const reps = parseInt(repsInput.value) || currentExercise.reps;
                    const weight = parseFloat(weightInput.value) || undefined;
                    markSetComplete(currentExercise.exerciseId, setNumber, reps, weight);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {/* RPE Selector - Shows after all sets completed */}
          {isExerciseComplete(currentExercise.exerciseId, currentExercise.sets) && (
            <div className="pt-4 border-t">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Rate of Perceived Exertion (RPE)
                </Label>
                <p className="text-xs text-muted-foreground">
                  How hard was this exercise? (1 = very easy, 10 = maximum effort)
                </p>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => {
                    const rpe = getExerciseRPE(currentExercise.exerciseId);
                    const isSelected = rpe === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setExerciseRPE(currentExercise.exerciseId, value)}
                        className={`h-12 rounded-lg font-bold transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
                {getExerciseRPE(currentExercise.exerciseId) && (
                  <p className="text-xs text-center font-medium">
                    {getExerciseRPE(currentExercise.exerciseId)! <= 3 && '😊 Very Easy'}
                    {getExerciseRPE(currentExercise.exerciseId)! >= 4 &&
                      getExerciseRPE(currentExercise.exerciseId)! <= 6 &&
                      '💪 Moderate'}
                    {getExerciseRPE(currentExercise.exerciseId)! >= 7 &&
                      getExerciseRPE(currentExercise.exerciseId)! <= 8 &&
                      '🔥 Challenging'}
                    {getExerciseRPE(currentExercise.exerciseId)! >= 9 && '💯 Maximum Effort'}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            {!isLastExercise && (
              <Button
                variant="outline"
                onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                disabled={
                  getCompletedSetsForExercise(currentExercise.exerciseId) <
                  currentExercise.sets
                }
                className="flex-1"
              >
                Next Exercise
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {plan.workoutExercises.map((exercise, index) => {
              const completed = getCompletedSetsForExercise(exercise.exerciseId);
              const total = exercise.sets;
              const isCurrent = index === currentExerciseIndex;

              return (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrent ? 'bg-primary/10 border border-primary' : 'bg-secondary'
                  }`}
                >
                  <span className="font-medium">{exercise.exercise.name}</span>
                  <span className="text-sm">
                    {completed}/{total} sets
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="How did it go? Any observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          disabled={completeMutation.isPending}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending || completedSets.length === 0}
          className="flex-1"
        >
          {completeMutation.isPending ? 'Completing...' : 'Complete Workout'}
        </Button>
      </div>
    </div>
  );
}
