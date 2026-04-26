import { IsBoolean, IsOptional, IsString } from 'class-validator'; // class-validator: DTO validation

export class UpdateWallPinDto {
  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
