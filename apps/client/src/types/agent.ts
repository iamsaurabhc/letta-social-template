export interface AgentData {
  id: string;
  name: string;
  connectionId: string;
  description?: string;
  industry?: string;
  targetAudience?: string[];
  brandPersonality?: string[];
  contentPreferences?: Record<string, any>;
} 