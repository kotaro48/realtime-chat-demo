import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common' // NestJS 内置：路由、请求体、参数、守卫装饰器
import { AuthGuard } from '@nestjs/passport'                                                  // passport：JWT 认证守卫
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'                       // @nestjs/swagger：Swagger 文档装饰器
import type { Request } from 'express'                                                        // express：Request 类型
import { User } from '@prisma/client'                                                         // Prisma 生成的 User 类型
import { PostService } from './post.service'
import { CreatePostDto } from './dto/create-post.dto'

@ApiTags('posts')
@Controller('api') // 根前缀，具体路径在各方法的装饰器里指定
export class PostController {
  constructor(private readonly postService: PostService) {}

  // GET /api/threads/:threadId/posts — 公开，无需登录
  @Get('threads/:threadId/posts')
  @ApiOperation({ summary: '获取帖子的所有楼层' })
  findByThread(@Param('threadId') threadId: string) {
    return this.postService.findByThread(threadId)
  }

  // POST /api/threads/:threadId/posts — 需要登录
  @Post('threads/:threadId/posts')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '在帖子下发布回复（需登录）' })
  create(
    @Param('threadId') threadId: string,
    @Body() dto: CreatePostDto,
    @Req() req: Request,
  ) {
    const user = req.user as User
    return this.postService.create(threadId, dto, user.id)
  }

  // DELETE /api/posts/:postId — 需要登录，本人或 MODERATOR/ADMIN
  @Delete('posts/:postId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '软删除楼层（本人或版主）' })
  remove(@Param('postId') postId: string, @Req() req: Request) {
    const user = req.user as User
    return this.postService.remove(postId, user.id, user.role)
  }
}
