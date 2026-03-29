import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common' // NestJS 内置：路由、请求体、参数、守卫装饰器
import { AuthGuard } from '@nestjs/passport'                                           // passport：JWT 认证守卫
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'                // @nestjs/swagger：Swagger 文档装饰器
import type { Request } from 'express'                                                 // express：Request 类型，用于取 req.user
import { User } from '@prisma/client'                                                  // Prisma 生成的 User 类型
import { ThreadService } from './thread.service'
import { CreateThreadDto } from './dto/create-thread.dto'

@ApiTags('threads')
@Controller('api/boards/:slug/threads') // 路由嵌套在版块下：/api/boards/:slug/threads
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  // GET /api/boards/:slug/threads — 公开，无需登录
  @Get()
  @ApiOperation({ summary: '获取版块下的帖子列表' })
  findByBoard(@Param('slug') slug: string) {
    return this.threadService.findByBoard(slug)
  }

  // POST /api/boards/:slug/threads — 需要登录
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '在版块内创建新帖（需登录）' })
  create(
    @Param('slug') slug: string,
    @Body() dto: CreateThreadDto,
    @Req() req: Request,
  ) {
    const user = req.user as User
    return this.threadService.create(slug, dto, user.id)
  }
}
