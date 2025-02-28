export type PostFormat = 'normal' | 'long_form' | 'both';

export interface GenerationResponse {
  success: boolean;
  content: string | {
    normal: string;
    longForm: string;
  };
  error?: {
    message: string;
    code: string;
  };
} 