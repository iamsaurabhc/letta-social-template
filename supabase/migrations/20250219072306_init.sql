-- First, create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the updated_at function FIRST
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Then create enum types
CREATE TYPE post_status AS ENUM ('draft', 'pending_approval', 'scheduled', 'posted', 'failed');
CREATE TYPE social_platform AS ENUM ('twitter', 'linkedin', 'instagram', 'facebook', 'threads', 'youtube', 'gbp');
CREATE TYPE posting_mode AS ENUM ('automatic', 'manual_approval');

-- User Agents table
CREATE TABLE user_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    letta_agent_id VARCHAR(255) NOT NULL,
    website_url TEXT,
    industry VARCHAR(100),
    target_audience TEXT[],
    brand_personality TEXT[], -- Array of descriptors
    content_preferences JSONB, -- Flexible storage for preferences
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Social Platform Connections
CREATE TABLE social_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    platform_user_id VARCHAR(255), -- ID from the social platform
    username VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    posting_mode posting_mode DEFAULT 'manual_approval',
    platform_settings JSONB, -- Platform-specific settings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id, platform)
);

-- Social Posts table (unified for all platforms)
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES social_connections(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array of media URLs
    platform_post_id VARCHAR(255), -- ID from the social platform once posted
    status post_status DEFAULT 'draft',
    scheduled_for TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    engagement_metrics JSONB DEFAULT '{}',
    error_message TEXT,
    metadata JSONB DEFAULT '{}', -- Platform-specific metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Approval Workflow
CREATE TABLE post_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending',
    approval_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspiration Sources
CREATE TABLE inspiration_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    source_url TEXT NOT NULL,
    source_username VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website Sources table
CREATE TABLE website_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    last_scraped_at TIMESTAMPTZ,
    scrape_frequency INTERVAL DEFAULT '24 hours',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website Content table
CREATE TABLE website_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES website_sources(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'metadata'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Store additional data like headers, alt text, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Website Sources (junction table)
CREATE TABLE agent_website_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES user_agents(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES website_sources(id) ON DELETE CASCADE,
    letta_source_id VARCHAR(255), -- ID returned from Letta after source creation
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, website_id)
);

-- Add triggers for new tables
CREATE TRIGGER update_website_sources_updated_at
    BEFORE UPDATE ON website_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_content_updated_at
    BEFORE UPDATE ON website_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_website_sources_updated_at
    BEFORE UPDATE ON agent_website_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for new tables
ALTER TABLE website_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_website_sources ENABLE ROW LEVEL SECURITY;

-- Website sources can be read by users who have agents linked to them
CREATE POLICY "Users can read linked website sources" ON website_sources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agent_website_sources aws
            JOIN user_agents ua ON aws.agent_id = ua.id
            WHERE aws.website_id = website_sources.id
            AND ua.user_id = auth.uid()
        )
    );

-- Website content follows the same rules as website sources
CREATE POLICY "Users can read linked website content" ON website_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agent_website_sources aws
            JOIN user_agents ua ON aws.agent_id = ua.id
            WHERE aws.website_id = website_content.website_id
            AND ua.user_id = auth.uid()
        )
    );

-- Users can read their own agent website sources
CREATE POLICY "Users can read own agent website sources" ON agent_website_sources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_agents ua
            WHERE ua.id = agent_website_sources.agent_id
            AND ua.user_id = auth.uid()
        )
    );

-- Triggers for updated_at
CREATE TRIGGER update_user_agents_updated_at
    BEFORE UPDATE ON user_agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
    BEFORE UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON social_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_approvals_updated_at
    BEFORE UPDATE ON post_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE user_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspiration_sources ENABLE ROW LEVEL SECURITY;

-- User can read their own data
CREATE POLICY "Users can read own agents" ON user_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own connections" ON social_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own posts" ON social_posts
    FOR SELECT USING (auth.uid() = user_id);

-- Only allow inserts by authenticated users for their own data
CREATE POLICY "Users can insert own agents" ON user_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON social_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON social_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow updates on own data
CREATE POLICY "Users can update own agents" ON user_agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON social_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON social_posts
    FOR UPDATE USING (auth.uid() = user_id);
