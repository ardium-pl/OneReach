import puppeteer, { Browser, Page } from "puppeteer";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.3 Safari/605.1.15",
  "Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 9; LM-Q720) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Trident/7.0; AS; rv:11.0) like Gecko",
];

const getRandomUserAgent = (): string => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};


class PuppeteerWrapper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: false,
      args: [`--user-agent=${getRandomUserAgent()}`],
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(getRandomUserAgent());
  }

  async goToWebpage(url: string): Promise<void> {
    if (!this.page) {
      throw new Error(
        "Puppeteer instance is not initialized. Call init() first."
      );
    }
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async searchSignature(
    selector: string,
    signature: string,
    searchButton: string
  ): Promise<void> {
    if (!this.page) {
      throw new Error(
        "Puppeteer instance is not initialized. Call init() first."
      );
    }

    await this.page.waitForSelector(selector);
    await this.page.type(selector, signature);
    await this.page.click(searchButton);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
