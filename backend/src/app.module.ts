import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { ThreadModule } from './thread/thread.module';
import { PostModule } from './post/post.module';
import { HandshakeModule } from './handshake/handshake.module';
import { SyncModule } from './sync/sync.module';
import { ChatModule } from './chat/chat.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { GeocodingModule } from './geocoding/geocoding.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),   // 启用 @Cron 定时任务
    AuthModule,
    BoardModule,
    ThreadModule,
    PostModule,
    HandshakeModule,
    SyncModule,
    ChatModule,
    BookmarkModule,
    ActivityLogModule,          // 偶像活地図：活动记录 CRUD
    GeocodingModule,            // 偶像活地図：Nominatim 地理编码代理
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
