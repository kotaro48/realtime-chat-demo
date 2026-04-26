import { Module } from '@nestjs/common'; // nestjs core
import { WallPinController } from './wall-pin.controller';
import { WallPinService } from './wall-pin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WallPinController],
  providers: [WallPinService],
})
export class WallPinModule {}
