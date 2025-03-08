import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostService } from '../social/posts/services/post.service';
import { AgentService } from '../letta/features/agents/services/agent.service';
import { TwitterProfileService } from '../social/twitter/features/profile/services/profile.service';
import { WebsiteScraperService } from '../social/services/website-scraper.service';
import { UserAgentService } from '../social/services/user-agent.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly postService: PostService,
    private readonly agentService: AgentService,
    private readonly twitterProfileService: TwitterProfileService,
    private readonly scraperService: WebsiteScraperService,
    private readonly userAgentService: UserAgentService
  ) {}

  // Generate posts at midnight (0 0 * * *)
  @Cron('0 0 * * *', {
    name: 'generate-posts',
    timeZone: 'UTC'
  })
  async handlePostGeneration() {
    this.logger.log('Starting daily post generation job');
    try {
      const activeAgents = await this.postService.getActiveAgentsForPosting();
      this.logger.log(`Found ${activeAgents.length} active agents for posting`);

      for (const agent of activeAgents) {
        try {
          this.logger.log(`Generating post for agent ${agent.id} (${agent.name || 'unnamed'})`);
          await this.agentService.generateAndSchedulePost(agent.id);
          this.logger.log(`Successfully generated post for agent ${agent.id}`);
        } catch (error) {
          this.logger.error(`Failed to generate post for agent ${agent.id}:`, {
            error: error.message,
            stack: error.stack,
            agentDetails: {
              id: agent.id,
              name: agent.name,
              settings: agent.platform_settings
            }
          });
          continue;
        }
      }
      this.logger.log('Completed daily post generation job');
    } catch (error) {
      this.logger.error('Failed to generate posts:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Post to Twitter at 2 AM (0 2 * * *)
  @Cron('0 2 * * *', {
    name: 'twitter-posting',
    timeZone: 'UTC'
  })
  async handleTwitterPosting() {
    this.logger.log('Starting Twitter posting job');
    try {
      const now = new Date();
      const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
      
      this.logger.log(`Publishing posts scheduled between ${now.toISOString()} and ${fifteenMinsFromNow.toISOString()}`);
      
      const publishedPosts = await this.postService.publishScheduledPosts(now, fifteenMinsFromNow);
      this.logger.log(`Successfully published ${publishedPosts.length} posts`);
      
      // Log details of published posts
      publishedPosts.forEach(post => {
        this.logger.debug(`Published post details:`, {
          postId: post.id,
          agentId: post.agent_id,
          scheduledFor: post.scheduled_for,
          platform: post.platform
        });
      });
    } catch (error) {
      this.logger.error('Failed to publish scheduled posts:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Monitor engagement every hour (0 * * * *)
  @Cron('0 * * * *', {
    name: 'engagement-monitoring',
    timeZone: 'UTC'
  })
  async handleEngagementMonitoring() {
    this.logger.log('Starting hourly engagement monitoring');
    try {
      const agents = await this.postService.getAgentsWithTwitterConnections();
      this.logger.log(`Found ${agents.length} agents with Twitter connections`);
      
      for (const agent of agents) {
        try {
          this.logger.log(`Processing engagement for agent ${agent.id}`, {
            platformUserId: agent.platform_user_id,
            agentId: agent.agent_id
          });

          const tweets = await this.twitterProfileService.fetchAndStoreTimeline(
            agent.auth,
            agent.platform_user_id,
            agent.agent_id
          );
          this.logger.log(`Fetched ${tweets.length} tweets for agent ${agent.id}`);

          const engagementMetrics = await this.postService.calculateEngagementMetrics(tweets);
          this.logger.log(`Calculated engagement metrics for agent ${agent.id}`, {
            metrics: engagementMetrics
          });

          await this.agentService.updateAgentMemory(agent.agent_id, {
            type: 'twitter_engagement',
            data: {
              timeline: tweets,
              metrics: engagementMetrics,
              timestamp: new Date().toISOString()
            }
          });
          this.logger.log(`Updated engagement memory for agent ${agent.id}`);
        } catch (error) {
          this.logger.error(`Failed to process agent ${agent.id}:`, {
            error: error.message,
            stack: error.stack,
            agentDetails: {
              id: agent.id,
              platformUserId: agent.platform_user_id,
              agentId: agent.agent_id
            }
          });
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Failed to monitor engagement:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Website scraping every 6 hours (0 */6 * * *)
  @Cron('0 */6 * * *', {
    name: 'website-scraping',
    timeZone: 'UTC'
  })
  async handleWebsiteScraping() {
    this.logger.log('Starting website scraping job');
    try {
      const { data: agents } = await this.userAgentService.getAgentsWithWebsites();
      this.logger.log(`Found ${agents.length} agents with websites to scrape`);
      
      for (const agent of agents) {
        try {
          this.logger.log(`Processing website for agent ${agent.id}`, {
            websiteUrl: agent.website_url,
            lettaAgentId: agent.letta_agent_id
          });

          let websiteSource = agent.agent_website_sources?.[0]?.website_id;
          if (!websiteSource) {
            const source = await this.userAgentService.createWebsiteSource(
              agent.id,
              agent.website_url
            );
            websiteSource = source.id;
            this.logger.log(`Created new website source for agent ${agent.id}`, {
              sourceId: source.id
            });
          }

          const scrapedData = await this.scraperService.scrapeWebsite(agent.website_url);
          this.logger.log(`Successfully scraped website for agent ${agent.id}`, {
            dataLength: JSON.stringify(scrapedData).length
          });

          await this.userAgentService.updateWebsiteContent(websiteSource, scrapedData);
          await this.userAgentService.updateAgentWithScrapedData(
            agent.id,
            scrapedData,
            agent.letta_agent_id
          );
          this.logger.log(`Updated agent ${agent.id} with scraped data`);
        } catch (error) {
          this.logger.error(`Failed to scrape website for agent ${agent.id}:`, {
            error: error.message,
            stack: error.stack,
            agentDetails: {
              id: agent.id,
              websiteUrl: agent.website_url,
              lettaAgentId: agent.letta_agent_id
            }
          });
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Failed to process website scraping:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Twitter timeline fetch every 4 hours (0 */4 * * *)
  @Cron('0 */4 * * *', {
    name: 'twitter-timeline-analysis',
    timeZone: 'UTC'
  })
  async handleTwitterTimeline() {
    this.logger.log('Starting Twitter timeline analysis job');
    try {
      const agents = await this.postService.getAgentsWithTwitterConnections();
      this.logger.log(`Found ${agents.length} agents for timeline analysis`);
      
      for (const agent of agents) {
        try {
          this.logger.log(`Analyzing timeline for agent ${agent.id}`, {
            platformUserId: agent.platform_user_id,
            agentId: agent.agent_id
          });

          const tweets = await this.twitterProfileService.fetchAndStoreTimeline(
            agent.auth,
            agent.platform_user_id,
            agent.agent_id
          );
          this.logger.log(`Fetched ${tweets.length} tweets for analysis`, {
            agentId: agent.id
          });

          const trends = await this.postService.analyzeContentTrends(tweets);
          this.logger.log(`Analyzed content trends for agent ${agent.id}`, {
            trendCount: Object.keys(trends).length
          });

          await this.agentService.updateAgentMemory(agent.agent_id, {
            type: 'twitter_content_analysis',
            data: {
              trends,
              analyzedAt: new Date().toISOString()
            }
          });
          this.logger.log(`Updated content analysis memory for agent ${agent.id}`);
        } catch (error) {
          this.logger.error(`Failed to analyze timeline for agent ${agent.id}:`, {
            error: error.message,
            stack: error.stack,
            agentDetails: {
              id: agent.id,
              platformUserId: agent.platform_user_id,
              agentId: agent.agent_id
            }
          });
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Failed to analyze Twitter timelines:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  }
} 