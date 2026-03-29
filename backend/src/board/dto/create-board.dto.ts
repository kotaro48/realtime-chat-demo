import { IsString, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator' // class-validator：用装饰器定义校验规则，类似 Java 的 Bean Validation（@NotNull、@Size）
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'                      // @nestjs/swagger：生成 Swagger 文档的字段说明

export class CreateBoardDto {
  @ApiProperty({ example: 'general', description: 'URL 路径标识，只允许小写字母、数字和连字符' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug 只能包含小写字母、数字和连字符' })
  slug: string

  @ApiProperty({ example: '综合讨论' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string

  @ApiPropertyOptional({ example: 'AKB48 相关的所有话题' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string
}
