import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WebsiteScraperService } from '../services/website-scraper.service';
import { UserAgentService } from '../services/user-agent.service';

@Processor('website-scraping')
export class WebsiteScraperProcessor {
  private readonly logger = new Logger(WebsiteScraperProcessor.name);

  constructor(
    private readonly scraperService: WebsiteScraperService,
    private readonly userAgentService: UserAgentService,
  ) {}

  @Process('scrape-website')
  async handleWebsiteScraping(job: Job) {
    const { agentId, websiteUrl } = job.data;
    
    try {
      const scrapedData = await this.scraperService.scrapeWebsite(websiteUrl);
      
      // Update the agent with scraped data
      await this.userAgentService.updateAgentWithScrapedData(agentId, scrapedData);
      
      return scrapedData;
    } catch (error) {
      this.logger.error(`Failed to process website scraping: ${error.message}`);
      throw error;
    }
  }
} 