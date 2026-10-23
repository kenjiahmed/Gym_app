'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exercisesApi, workoutPlansApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: '',
    description: '',
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await exercisesApi.getAll();
      return response.data;
    },
  });

  const { data: workoutPlans } = useQuery({
    queryKey: ['workout-plans'],
    queryFn: async () => {
      const response = await workoutPlansApi.getAll();
      return response.data;
    },
  });

  const createExerciseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await exercisesApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setShowAddExercise(false);
      setNewExercise({ name: '', muscleGroup: '', description: '' });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: string) => {
      await exercisesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      await workoutPlansApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
    },
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    createExerciseMutation.mutate(newExercise);
  };

  const muscleGroups = exercises
    ? Array.from(new Set(exercises.map((e) => e.muscleGroup)))
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage exercises and workout plans
        </p>
      </div>

      {/* Exercises Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Exercise Library</CardTitle>
            <CardDescription>
              {exercises?.length || 0} exercise(s) available
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddExercise(!showAddExercise)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddExercise && (
            <form
              onSubmit={handleCreateExercise}
              className="p-4 border rounded-lg space-y-4"
            >
              <div className="space-y-2">
                <Label>Exercise Name</Label>
                <Input
                  value={newExercise.name}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, name: e.target.value })
                  }
                  placeholder="e.g., Dumbbell Flyes"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Muscle Group</Label>
                <Input
                  value={newExercise.muscleGroup}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, muscleGroup: e.target.value })
                  }
                  placeholder="e.g., Chest, Back, Legs"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={newExercise.description}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, description: e.target.value })
                  }
                  placeholder="Exercise description..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddExercise(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createExerciseMutation.isPending}>
                  {createExerciseMutation.isPending ? 'Adding...' : 'Add Exercise'}
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {muscleGroups.map((group) => (
              <div key={group}>
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                  {group}
                </h3>
                <div className="space-y-2">
                  {exercises
                    ?.filter((e) => e.muscleGroup === group)
                    .map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          {exercise.description && (
                            <p className="text-sm text-muted-foreground">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                'Are you sure you want to delete this exercise?'
                              )
                            ) {
                              deleteExerciseMutation.mutate(exercise.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workout Plans Management */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Plans</CardTitle>
          <CardDescription>
            {workoutPlans?.length || 0} plan(s) created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workoutPlans && workoutPlans.length > 0 ? (
            <div className="space-y-3">
              {workoutPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.workoutExercises.length} exercises
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (
                        confirm('Are you sure you want to delete this plan?')
                      ) {
                        deletePlanMutation.mutate(plan.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No workout plans created yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
