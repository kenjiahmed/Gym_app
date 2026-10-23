'use client';

import { useQuery } from '@tanstack/react-query';
import { workoutSessionsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { Calendar, Dumbbell } from 'lucide-react';

export default function HistoryPage() {
  const { data: history } = useQuery({
    queryKey: ['workout-history'],
    queryFn: async () => {
      const response = await workoutSessionsApi.getHistory();
      return response.data;
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Workout History</h1>
        <p className="text-muted-foreground">
          {history?.length || 0} workout(s) completed
        </p>
      </div>

      {history && history.length > 0 ? (
        <div className="space-y-4">
          {history.map((session) => {
            const duration = session.endTime
              ? Math.floor(
                  (new Date(session.endTime).getTime() -
                    new Date(session.startTime).getTime()) /
                    60000
                )
              : 0;

            return (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{session.workoutPlan.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.startTime), 'MMM dd, yyyy')}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(session.startTime), {
                            addSuffix: true,
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{duration}min</div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span>{session.completedSets.length} sets completed</span>
                    </div>

                    {session.notes && (
                      <div className="p-3 rounded-lg bg-secondary">
                        <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                        <p className="text-sm">{session.notes}</p>
                      </div>
                    )}

                    <details className="cursor-pointer">
                      <summary className="text-sm text-muted-foreground hover:text-foreground">
                        View details
                      </summary>
                      <div className="mt-3 space-y-2">
                        {session.workoutPlan.workoutExercises?.map((we) => {
                          const exerciseSets = session.completedSets.filter(
                            (cs) => cs.exerciseId === we.exerciseId
                          );

                          return (
                            <div
                              key={we.id}
                              className="p-3 rounded-lg bg-secondary/50"
                            >
                              <p className="font-medium text-sm">
                                {we.exercise.name}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {exerciseSets.map((set, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 rounded bg-primary/10"
                                  >
                                    Set {set.setNumber}: {set.reps} reps
                                    {set.weight && ` @ ${set.weight}kg`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No workout history yet. Complete your first workout!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
