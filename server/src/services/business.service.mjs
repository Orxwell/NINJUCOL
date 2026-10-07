// Controllers for APIs
import MongoAPIcontroller from '#controllers/mongodb.controller.mjs';

// External & Internal Libraries
import puppeteer from 'puppeteer';


let browser;

export default class BusinessService {
  constructor () { this.is_initialized = false; }

  async init() {
    // Instantiating controllers ---------¬
    this.dbAPI = new MongoAPIcontroller();
    await this.dbAPI.connect();
    // ____________________________________

    if (!browser) {
      /* //! Only for critical problems: descomment
      try {
        console.log('  ~Installing Chrome runtime for Puppeteer... ~');
        execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });

      } catch (err) { console.warn('⚠️ Puppeteer Chrome install skipped or failed (may already exist).'); }
      */

      const isLinux = process.platform === 'linux';

      browser = await puppeteer.launch({
        headless: 'shell',
        defaultViewport: { width: 1280, height: 800 },
        args: [
          '--disable-gpu',
          '--disable-software-rasterizer',
          ...(isLinux
            ? [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              ]
            : [])
        ]
      });
    }

    this.browser = browser;

    this.is_initialized = true;
  }

  async getPuppeteerPage() {
    if (!this.is_initialized) throw new Error('BusinessService instance needs to be initialized.');

    if (!this.browser) throw new Error('Browser instance needs to be initialized.');

    return await this.browser.newPage();
  }
};
