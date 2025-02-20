import { AgentType } from '@letta-ai/letta-client/api';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsEnum(AgentType)
  @IsOptional()
  agentType?: AgentType;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  embedding?: string;
}

export class UpdateAgentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
} 