import { Controller, Get, Post, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookmarkService } from './bookmark.service';

@Controller('api/bookmarks')  // 统一 /api 前缀（与 board / thread / handshake 保持一致）
@UseGuards(AuthGuard('jwt'))
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@Req() req: any) {
    return this.bookmarkService.getBookmarks(req.user.id);
  }

  @Post(':threadId')
  addBookmark(@Req() req: any, @Param('threadId') threadId: string) {
    return this.bookmarkService.addBookmark(req.user.id, threadId);
  }

  @Delete(':threadId')
  removeBookmark(@Req() req: any, @Param('threadId') threadId: string) {
    return this.bookmarkService.removeBookmark(req.user.id, threadId);
  }
}
