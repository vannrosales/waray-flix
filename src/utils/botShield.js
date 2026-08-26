/**
 * BotShield - Client-side bot, scraper, and automated crawler defense
 */

class BotShield {
  constructor() {
    this.isBotDetected = false;
    this.requestTimestamps = [];
    this.MAX_BURST_PER_WINDOW = 40; // Max requests per 10-second window
    this.WINDOW_MS = 10000;

    if (typeof window !== 'undefined') {
      this.evaluateEnvironment();
    }
  }

  /**
   * Evaluates if the current execution environment exhibits automated bot signatures.
   */
  evaluateEnvironment() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    try {
      // 1. Check for automated Webdriver flag (Selenium / Puppeteer / Playwright)
      if (navigator.webdriver) {
        this.isBotDetected = true;
        return;
      }

      // 2. Check for known bot user agents
      const ua = (navigator.userAgent || '').toLowerCase();
      const botKeywords = [
        'bot', 'crawl', 'spider', 'scrape', 'headless', 'phantomjs', 
        'selenium', 'nightwatch', 'casperjs', 'puppeteer', 'python-requests',
        'curl', 'wget', 'bytespider', 'semrush', 'ahrefs'
      ];
      
      const isKnownBot = botKeywords.some(keyword => ua.includes(keyword) && !ua.includes('googlebot') && !ua.includes('bingbot'));
      if (isKnownBot) {
        this.isBotDetected = true;
        return;
      }

      // 3. Check for headless browser anomalies
      if (
        window.outerWidth === 0 && 
        window.outerHeight === 0 && 
        !navigator.userAgent.includes('Mobile')
      ) {
        this.isBotDetected = true;
      }
    } catch {
      // Ignore evaluation errors to preserve normal user experience
    }
  }

  /**
   * Rate limits outgoing API requests to prevent scraping flood
   */
  shouldAllowRequest() {
    if (this.isBotDetected) {
      return false;
    }

    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < this.WINDOW_MS);

    if (this.requestTimestamps.length >= this.MAX_BURST_PER_WINDOW) {
      return false; // Rate limited
    }

    this.requestTimestamps.push(now);
    return true;
  }

  /**
   * Validates honeypot field submission
   */
  isHoneypotTriggered(honeypotValue) {
    return Boolean(honeypotValue && honeypotValue.trim().length > 0);
  }
}

export const botShield = new BotShield();

