import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ModifyBlockDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;
} 