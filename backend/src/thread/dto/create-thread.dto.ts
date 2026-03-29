import { IsString, IsNotEmpty, MaxLength } from 'class-validator' // class-validator：字段校验装饰器
import { ApiProperty } from '@nestjs/swagger'                       // @nestjs/swagger：Swagger 文档字段说明

export class CreateThreadDto {
  @ApiProperty({ example: '最新单曲感想分享', description: '帖子标题' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string

  @ApiProperty({ example: '今天刚听了新单曲，感觉...', description: '第一楼正文内容' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string
}
