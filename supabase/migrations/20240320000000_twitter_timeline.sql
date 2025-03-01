-- Create table for storing Twitter timeline data
CREATE TABLE twitter_timeline_entries (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES user_agents(id) ON DELETE CASCADE,
  tweet_id text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL,
  engagement_metrics jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  analyzed_at timestamp with time zone,
  created_at_platform timestamp with time zone NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_twitter_timeline_agent_id ON twitter_timeline_entries(agent_id);
CREATE INDEX idx_twitter_timeline_created_at ON twitter_timeline_entries(created_at); 