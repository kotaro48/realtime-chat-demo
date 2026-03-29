import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator'  // class-validator: DTO 字段校验

export class UpsertTicketDto {
  @IsString()
  eventId: string

  @IsString()
  memberId: string

  @IsInt()
  @Min(0)
  @Max(999)
  count: number  // 枚数，0 表示删除记录

  @IsOptional()
  @IsString()
  note?: string  // 备注（聊什么话题等），可为空
}
