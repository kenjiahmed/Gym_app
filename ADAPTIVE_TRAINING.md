# AI Adaptive Training System

## Overview

The AI Adaptive Training System is a **premium feature** (Pro/Elite only) that dynamically adjusts user workout programs based on performance data, fatigue levels, and consistency patterns.

## Key Features

### 🤖 Intelligent Adjustments
- **Progressive Overload**: Automatically increases weight by 2.5-5% when RPE < 8 and performance is consistent
- **Deload Detection**: Reduces volume by 15-20% when detecting high fatigue (RPE = 10 or consecutive failures)
- **Fatigue Monitoring**: Tracks performance decline over 3+ sessions and triggers recovery protocols
- **Maintenance Mode**: Keeps current load when RPE is in the optimal 8-9 range

### 📊 Performance Tracking
- **RPE (Rate of Perceived Exertion)**: Track exercise difficulty on a 1-10 scale
- **Volume Metrics**: Calculate total weekly training volume (sets × reps × weight)
- **Consistency Score**: Monitor workout frequency (0-100 scale, optimal ~18 days/month)
- **Strength Progression**: Track weight increases over time

### 🎯 Personalized Insights
- **Readiness Score**: 0-100 score indicating training readiness
- **Performance Trend**: Improving / Stable / Declining
- **AI Recommendations**: Actionable advice based on recent performance
- **Fatigue Warnings**: Real-time alerts when recovery is needed

## Architecture

### Database Schema

#### `UserPerformanceLog`
Tracks individual exercise performance:
- `userId`, `exerciseId`, `workoutSessionId`
- `weightUsed`, `repsCompleted`, `setsCompleted`
- `rpe` (1-10 scale)
- `notes`, `completedAt`

#### `AdaptationLog`
Records AI adjustments with reasoning:
- `userId`, `programId`, `exerciseId`
- `adjustmentType`: increase / decrease / deload / recovery / maintain
- `reason`: Human-readable explanation
- `previousValue`, `newValue`: JSON objects with workout parameters

### Backend API

**Endpoints:**
- `GET /adaptive-training/insights` - Get AI coach insights
- `GET /adaptive-training/summary` - Get performance summary
- `GET /adaptive-training/exercise/:id` - Analyze specific exercise
- `POST /adaptive-training/log` - Log workout performance
- `POST /adaptive-training/adapt` - Apply manual adaptation

**Service Logic (`AdaptiveTrainingService`):**
- `analyzeAndAdapt()` - Main analysis method returning full insights
- `analyzeExercise()` - Exercise-specific performance analysis
- `applyAdaptation()` - Log adaptations with reasoning
- `calculateWeeklyVolume()` - Sum of sets × reps × weight (last 7 days)
- `calculateConsistencyScore()` - Workout frequency vs. ideal (4-5 days/week)
- `detectFatigue()` - High RPE + declining volume = fatigue
- `shouldDeload()` - 3+ sessions with RPE 10 or declining trend = deload

### Frontend Components

#### `AICoachInsights.tsx`
Main insights dashboard displaying:
- Training Readiness score with color coding
- Warning banners for deload/fatigue
- Performance metrics grid
- AI recommendations list
- Recent adaptations timeline

#### `PremiumGate.tsx`
Paywall component for free users:
- Feature highlights
- Upgrade CTA to pricing page
- 7-day trial mention

#### `AdaptiveTrainingPanel.tsx`
Wrapper component that:
- Checks user subscription plan
- Shows PremiumGate for free users
- Renders AICoachInsights for Pro/Elite users

### Workout Integration

Modified `workout/start/[id]/page.tsx`:
- Added RPE selector (1-10 buttons) after each exercise
- Automatically logs performance data to `/adaptive-training/log`
- Sends exercise metrics: weight, reps, sets, RPE, timestamp
- Invalidates adaptive insights cache on completion

## Logic Rules

### Progressive Overload
```
IF averageRPE < 8 
AND completionRate > 90%
AND volumeTrend != 'declining'
THEN increase weight by 2.5%
```

### Deload
```
IF averageRPE >= 9.5
THEN decrease weight by 15% AND reduce sets by 1
```

### Recovery Week
```
IF volumeTrend == 'declining' for 3+ sessions
OR 3+ sessions with RPE = 10
THEN decrease weight by 20% AND reduce sets by 1
```

### Maintenance
```
IF averageRPE between 8-9
AND completionRate >= 80%
THEN maintain current load
```

## Calculations

### Weekly Volume
```
volume = Σ (sets × reps × weight) for last 7 days
```

### Consistency Score
```
workoutDays = unique days with workouts (last 30 days)
idealDays = 18 (4-5 per week)
score = min((workoutDays / idealDays) × 100, 100)
```

### Readiness Score
```
rpeScore = 100 - (avgRPE - 5) × 20
readiness = (rpeScore × 0.6) + (consistencyScore × 0.4)
```

### Strength Progression
```
recentAvg = avg(last 5 workout weights)
olderAvg = avg(5 oldest workout weights)
progression = ((recentAvg - olderAvg) / olderAvg) × 100
```

## Premium Gating

- **Free Plan**: Shows PremiumGate with upgrade CTA, no access to features
- **Pro/Elite Plans**: Full access to adaptive training system
- Backend enforces via `ForbiddenException` when `subscriptionPlan === 'free'`

## User Experience

### Dashboard Integration
1. AI Coach Insights panel appears on main dashboard
2. Shows readiness score with emoji indicator (💪 😊 😴)
3. Displays warning banners for deload/fatigue
4. Lists 3-5 actionable recommendations
5. Shows recent AI adjustments timeline

### Workout Flow
1. User starts workout session
2. Completes sets for each exercise
3. Rates RPE on 1-10 scale after all sets
4. System logs performance data automatically
5. On completion, AI analyzes and generates insights
6. Dashboard updates with new recommendations

### Insights Display
- **Green Banner (Readiness 80+)**: "High readiness! Perfect time to push intensity."
- **Yellow Banner (Fatigue Warning)**: "Consider taking an extra rest day this week."
- **Orange Banner (Deload)**: "Deload week recommended. Reduce weight by 20%."
- **Performance Metrics**: Grid showing consistency, trend, progression, volume
- **Recommendations**: Emoji-prefixed actionable items

## Migration

Migration: `20260218132102_add_adaptive_training_system`

```sql
CREATE TABLE "user_performance_logs" (
  id, userId, exerciseId, workoutSessionId,
  weightUsed, repsCompleted, setsCompleted, rpe,
  notes, completedAt
);

CREATE TABLE "adaptation_logs" (
  id, userId, programId, exerciseId,
  adjustmentType, reason, previousValue, newValue,
  createdAt
);

CREATE INDEX idx_user_performance_userId ON user_performance_logs(userId);
CREATE INDEX idx_user_performance_exerciseId ON user_performance_logs(exerciseId);
CREATE INDEX idx_adaptation_userId ON adaptation_logs(userId);
```

## Future Enhancements

- [ ] Auto-suggest workout timing based on recovery status
- [ ] Integrate with wearables for sleep/HRV data
- [ ] Exercise swap recommendations for overused muscles
- [ ] Weekly/monthly progress reports via email
- [ ] Predictive analytics for plateau detection
- [ ] Social features: compare progress with similar users
- [ ] Macro/nutrition recommendations based on training phase
- [ ] Video form check integration for RPE validation

## Technical Notes

- **Deterministic Logic**: All adjustments follow explicit rules, no randomness
- **Explainable AI**: Every adjustment includes a `reason` field
- **Performance**: Queries optimized with database indexes
- **Type Safety**: Full TypeScript coverage on frontend + backend
- **Error Handling**: Graceful degradation if adaptive API fails
- **Privacy**: Performance data is user-specific, never shared

## Testing

Manual testing checklist:
- [ ] Free user sees premium gate on dashboard
- [ ] Pro user sees AI insights panel
- [ ] RPE selector appears after completing exercise sets
- [ ] Performance data logs successfully after workout
- [ ] Deload warning triggers after 3 high-RPE sessions
- [ ] Fatigue warning appears when performance declining
- [ ] Readiness score updates based on recent workouts
- [ ] Recommendations are actionable and specific
- [ ] Recent adaptations display with timestamps
- [ ] Upgrade CTA redirects to pricing page

---

**Built with**: NestJS, Prisma, Next.js, TanStack Query, TypeScript, Framer Motion
