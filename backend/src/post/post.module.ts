import { Module } from '@nestjs/common'
import { PostController } from './post.controller'
import { PostService } from './post.service'
import { PrismaModule } from '../prisma/prisma.module' // PrismaModule 提供 PrismaService 的依赖注入

@Module({
  imports: [PrismaModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
