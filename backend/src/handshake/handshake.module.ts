import { Module } from '@nestjs/common'  // NestJS 内置：模块装饰器
import { HandshakeController } from './handshake.controller'
import { HandshakeService } from './handshake.service'

@Module({
  controllers: [HandshakeController],
  providers: [HandshakeService],
})
export class HandshakeModule {}
