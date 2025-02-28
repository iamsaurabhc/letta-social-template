import { IsNotEmpty, IsString, IsDateString, IsEnum } from 'class-validator';

export class CreateScheduledPostDto {
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @IsNotEmpty()
  @IsString()
  connectionId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsDateString()
  scheduledFor: string;

  @IsEnum(['normal', 'long_form'])
  format: 'normal' | 'long_form';
} 