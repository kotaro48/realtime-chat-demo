import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common' // NestJS 内置：路由装饰器和守卫
import { AuthGuard } from '@nestjs/passport'                                    // passport：JWT 认证守卫，验证请求头里的 Bearer token
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'          // @nestjs/swagger：Swagger 文档装饰器
import { Role } from '@prisma/client'                                            // Prisma 生成的枚举
import { BoardService } from './board.service'
import { CreateBoardDto } from './dto/create-board.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'

@ApiTags('boards')         // Swagger 文档分组
@Controller('api/boards')  // 路由前缀：所有方法挂载在 /api/boards 下
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // GET /api/boards — 公开，无需登录
  @Get()
  @ApiOperation({ summary: '获取所有版块列表' })
  findAll() {
    return this.boardService.findAll()
  }

  // GET /api/activity — 全站最新动态，公开
  @Get('activity')
  @ApiOperation({ summary: '全站最新动态（最近更新的帖子）' })
  getActivity() {
    return this.boardService.getActivity()
  }

  // GET /api/boards/:slug — 公开，无需登录
  @Get(':slug')
  @ApiOperation({ summary: '获取单个版块信息' })
  findOne(@Param('slug') slug: string) {
    return this.boardService.findOne(slug)
  }

  // POST /api/boards — 仅 ADMIN
  // UseGuards 执行顺序：先 AuthGuard 验证 JWT，再 RolesGuard 验证角色
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建新版块（仅 ADMIN）' })
  create(@Body() dto: CreateBoardDto) {
    return this.boardService.create(dto)
  }
}
