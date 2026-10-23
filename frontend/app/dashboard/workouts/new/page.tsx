'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exercisesApi, workoutPlansApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface SelectedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restTime: number;
  order: number;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await exercisesApi.getAll();
      return response.data;
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await workoutPlansApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      router.push('/dashboard');
    },
  });

  const addExercise = (exerciseId: string, exerciseName: string) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId,
        exerciseName,
        sets: 3,
        reps: 10,
        restTime: 60,
        order: selectedExercises.length,
      },
    ]);
    setShowExercisePicker(false);
  };

  const removeExercise = (index: number) => {
    const newExercises = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(
      newExercises.map((ex, i) => ({ ...ex, order: i }))
    );
  };

  const updateExercise = (index: number, field: string, value: number) => {
    const newExercises = [...selectedExercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setSelectedExercises(newExercises);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlanMutation.mutate({
      name,
      description,
      exercises: selectedExercises.map(({ exerciseId, sets, reps, restTime, order }) => ({
        exerciseId,
        sets,
        reps,
        restTime,
        order,
      })),
    });
  };

  const muscleGroups = exercises
    ? Array.from(new Set(exercises.map((e) => e.muscleGroup)))
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Create Workout Plan</h1>
        <p className="text-muted-foreground">Build your custom workout routine</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g., Push Day, Upper Body"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add notes about this workout plan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Exercises</CardTitle>
              <CardDescription>
                {selectedExercises.length} exercise(s) added
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExercisePicker(!showExercisePicker)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {showExercisePicker && (
              <div className="p-4 border rounded-lg space-y-4">
                {muscleGroups.map((group) => (
                  <div key={group}>
                    <h3 className="font-medium mb-2">{group}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {exercises
                        ?.filter((e) => e.muscleGroup === group)
                        .map((exercise) => (
                          <Button
                            key={exercise.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addExercise(exercise.id, exercise.name)}
                            disabled={selectedExercises.some(
                              (e) => e.exerciseId === exercise.id
                            )}
                          >
                            {exercise.name}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedExercises.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No exercises added yet. Click "Add Exercise" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border rounded-lg bg-card"
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 space-y-3">
                      <h4 className="font-medium">{exercise.exerciseName}</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Sets</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) =>
                              updateExercise(index, 'sets', parseInt(e.target.value))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Reps</Label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) =>
                              updateExercise(index, 'reps', parseInt(e.target.value))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Rest (sec)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={exercise.restTime}
                            onChange={(e) =>
                              updateExercise(index, 'restTime', parseInt(e.target.value))
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createPlanMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createPlanMutation.isPending || selectedExercises.length === 0}
          >
            {createPlanMutation.isPending ? 'Creating...' : 'Create Workout Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
