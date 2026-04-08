/**
 * [INPUT]: 依赖 ThreadService 的 trending/recent 方法
 * [OUTPUT]: 对外提供 GET /api/trending、GET /api/threads/recent
 * [POS]: thread 模块的全局发现端点，与 ThreadController（版块级）并列
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Controller, Get, Query } from '@nestjs/common'  // NestJS 内置：路由、查询参数装饰器
import { ApiOperation, ApiTags } from '@nestjs/swagger'   // swagger：API 文档
import { ThreadService } from './thread.service'

@ApiTags('discover')
@Controller('api')
export class DiscoverController {
  constructor(private readonly threadService: ThreadService) {}

  // GET /api/trending?limit=7&board=general
  @Get('trending')
  @ApiOperation({ summary: '全版块热度排名（支持版块过滤）' })
  trending(
    @Query('limit') limit = '7',
    @Query('board') board?: string,
  ) {
    return this.threadService.trending(+limit, board)
  }

  // GET /api/threads/recent?limit=15&offset=0&board=general
  @Get('threads/recent')
  @ApiOperation({ summary: '全版块最新帖（支持分页和版块过滤）' })
  recent(
    @Query('limit') limit = '15',
    @Query('offset') offset = '0',
    @Query('board') board?: string,
  ) {
    return this.threadService.recent(+limit, +offset, board)
  }
}
