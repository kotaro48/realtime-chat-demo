import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module' // PrismaModule 提供 PrismaService，BoardService 需要它来查询数据库
import { BoardController } from './board.controller'
import { BoardService } from './board.service'

@Module({
  imports: [PrismaModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
