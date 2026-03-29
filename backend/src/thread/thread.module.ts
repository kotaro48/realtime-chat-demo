import { Module } from '@nestjs/common'
import { ThreadController } from './thread.controller'
import { ThreadService } from './thread.service'
import { PrismaModule } from '../prisma/prisma.module' // PrismaModule 提供 PrismaService 的依赖注入

@Module({
  imports: [PrismaModule],
  controllers: [ThreadController],
  providers: [ThreadService],
})
export class ThreadModule {}
