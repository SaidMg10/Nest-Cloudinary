import { IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsOptional()
  url?: string;
  @IsString()
  @IsOptional()
  public_id?: string;
}
