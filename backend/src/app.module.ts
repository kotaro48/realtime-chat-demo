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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
