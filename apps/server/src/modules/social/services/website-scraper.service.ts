import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class WebsiteScraperService {
  private readonly logger = new Logger(WebsiteScraperService.name);

  constructor(
    @InjectQueue('website-scraping') private scrapingQueue: Queue
  ) {}

  async queueWebsiteScraping(agentId: string, websiteUrl: string) {
    await this.scrapingQueue.add('scrape-website', {
      agentId,
      websiteUrl
    });
  }

  async scrapeWebsite(websiteUrl: string) {
    try {
      const { data } = await axios.get(websiteUrl);
      const $ = cheerio.load(data);

      return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        mainContent: $('main, article, #content, .content').text().trim(),
        // Add more selectors as needed
      };
    } catch (error) {
      this.logger.error(`Error scraping website: ${error.message}`);
      throw error;
    }
  }
} 