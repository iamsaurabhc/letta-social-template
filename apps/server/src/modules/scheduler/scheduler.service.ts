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
    try {
      const activeAgents = await this.postService.getActiveAgentsForPosting();
      for (const agent of activeAgents) {
        try {
          await this.agentService.generateAndSchedulePost(agent.id);
        } catch (error) {
          this.logger.error(`Failed to generate post for agent ${agent.id}:`, error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Failed to generate posts:', error);
    }
  }

  // Post to Twitter at 2 AM (0 2 * * *)
  @Cron('0 2 * * *', {
    name: 'twitter-posting',
    timeZone: 'UTC'
  })
  async handleTwitterPosting() {
    try {
      const now = new Date();
      const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
      await this.postService.publishScheduledPosts(now, fifteenMinsFromNow);
    } catch (error) {
      this.logger.error('Failed to publish scheduled posts:', error);
    }
  }

  // Monitor engagement every hour (0 * * * *)
  @Cron('0 * * * *', {
    name: 'engagement-monitoring',
    timeZone: 'UTC'
  })
  async handleEngagementMonitoring() {
    try {
      const agents = await this.postService.getAgentsWithTwitterConnections();
      
      for (const agent of agents) {
        try {
          // Fetch timeline and engagement metrics
          const tweets = await this.twitterProfileService.fetchAndStoreTimeline(
            agent.auth,
            agent.platform_user_id,
            agent.agent_id
          );

          // Calculate engagement metrics
          const engagementMetrics = await this.postService.calculateEngagementMetrics(tweets);
          
          // Update agent memory with both timeline and metrics
          await this.agentService.updateAgentMemory(agent.agent_id, {
            type: 'twitter_engagement',
            data: {
              timeline: tweets,
              metrics: engagementMetrics,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error) {
          this.logger.error(`Failed to process agent ${agent.id}:`, error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Failed to monitor engagement:', error);
    }
  }

  // Website scraping every 6 hours (0 */6 * * *)
  @Cron('0 */6 * * *', {
    name: 'website-scraping',
    timeZone: 'UTC'
  })
  async handleWebsiteScraping() {
    try {
      const { data: agents } = await this.userAgentService.getAgentsWithWebsites();
      
      for (const agent of agents) {
        try {
          // Create website source if doesn't exist
          let websiteSource = agent.agent_website_sources?.[0]?.website_id;
          if (!websiteSource) {
            const source = await this.userAgentService.createWebsiteSource(
              agent.id,
              agent.website_url
            );
            websiteSource = source.id;
          }

          // Scrape website
          const scrapedData = await this.scraperService.scrapeWebsite(agent.website_url);
          
          // Update website content
          await this.userAgentService.updateWebsiteContent(websiteSource, scrapedData);
          
          // Update agent memory
          await this.userAgentService.updateAgentWithScrapedData(
            agent.id,
            scrapedData,
            agent.letta_agent_id
          );
        } catch (error) {
          this.logger.error(`Failed to scrape website for agent ${agent.id}:`, error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Failed to process website scraping:', error);
    }
  }

  // Twitter timeline fetch every 4 hours (0 */4 * * *)
  @Cron('0 */4 * * *', {
    name: 'twitter-timeline-analysis',
    timeZone: 'UTC'
  })
  async handleTwitterTimeline() {
    try {
      const agents = await this.postService.getAgentsWithTwitterConnections();
      
      for (const agent of agents) {
        try {
          // Fetch extended timeline (more posts than hourly check)
          const tweets = await this.twitterProfileService.fetchAndStoreTimeline(
            agent.auth,
            agent.platform_user_id,
            agent.agent_id,
          );

          // Perform trend analysis
          const trends = await this.postService.analyzeContentTrends(tweets);
          
          // Update agent memory with analysis
          await this.agentService.updateAgentMemory(agent.agent_id, {
            type: 'twitter_content_analysis',
            data: {
              trends,
              analyzedAt: new Date().toISOString()
            }
          });
        } catch (error) {
          this.logger.error(`Failed to analyze timeline for agent ${agent.id}:`, error);
          continue;
        }
      }
    } catch (error) {
      this.logger.error('Failed to analyze Twitter timelines:', error);
    }
  }
} 