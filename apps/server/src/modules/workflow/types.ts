export type PostFormat = 'normal' | 'long_form' | 'both';

export interface GenerateContentRequest {
  agentId: string;
  settings: {
    format: PostFormat;
  };
  scheduledFor: string;
} 