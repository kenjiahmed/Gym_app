import { Module } from '@nestjs/common';
import { AdaptiveTrainingController } from './adaptive-training.controller';
import { AdaptiveTrainingService } from './adaptive-training.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdaptiveTrainingController],
  providers: [AdaptiveTrainingService],
  exports: [AdaptiveTrainingService],
})
export class AdaptiveTrainingModule {}
