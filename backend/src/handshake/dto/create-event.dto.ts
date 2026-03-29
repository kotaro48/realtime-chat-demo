import { IsString, IsDateString, IsOptional, MinLength, MaxLength } from 'class-validator'  // class-validator: DTO 字段校验装饰器

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string  // 活动名称，如 "56th シングル個握"

  @IsDateString()
  date: string  // ISO 日期字符串

  @IsOptional()
  @IsDateString()
  endDate?: string  // 结束日（可选，跨天活动）
}
