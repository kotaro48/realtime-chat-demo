import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator'; // class-validator: DTO validation

export class CreateWallPinDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
