import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator' // class-validator：字段校验装饰器
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'              // @nestjs/swagger：Swagger 文档字段说明

export class CreatePostDto {
  @ApiProperty({ example: '我也觉得这首歌旋律很好！', description: '回复正文' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string

  @ApiPropertyOptional({ description: '引用的楼层 ID（>>N 风格，可选）' })
  @IsString()
  @IsOptional()
  replyToId?: string
}
