import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { WorkoutPlansModule } from './modules/workout-plans/workout-plans.module';
import { WorkoutSessionsModule } from './modules/workout-sessions/workout-sessions.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { AdaptiveTrainingModule } from './modules/adaptive-training/adaptive-training.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ExercisesModule,
    WorkoutPlansModule,
    WorkoutSessionsModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    ProgramsModule,
    AdaptiveTrainingModule,
  ],
})
export class AppModule {}
