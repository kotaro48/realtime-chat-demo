import 'dotenv/config' // dotenv：在应用启动时加载 .env 文件中的环境变量，必须放在第一行
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';           // NestJS 内置：配合 class-validator 自动校验请求体
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局启用请求体校验：自动根据 DTO 的装饰器规则校验入参，不合法时返回 400
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger 文档配置
  const config = new DocumentBuilder()
    .setTitle('AKB48 Fan Community API')
    .setDescription('AKB48 粉丝社区后端接口文档')
    .setVersion('1.0')
    .addBearerAuth() // 支持在文档页面填写 JWT token
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document); // 挂载到 /docs，避免与 /api 路由冲突

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port: ${port}`);
}
bootstrap();
