import puppeteer from "puppeteer-extra";
import { Browser, Page, WaitForSelectorOptions } from "puppeteer";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";
// puppeteer.use(StealthPlugin());

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

export class PuppeteerWrapper {
  private browser: Browser | null = null;
  public page: Page | null = null;
  private setTimeoutToSelectors: WaitForSelectorOptions = { timeout: 50000 };

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      // executablePath:
      //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: false,
      args: [
        // `--user-agent=${getRandomUserAgent()}`, // Set a random user agent for this browser instance
        "--start-maximized", // This will open the browser maximized, but not necessarily in full-screen
        "--disable-infobars",
        "--disable-sync",
        "--disable-notifications", // This flag disables the "Chrome is being controlled by automated test software" infobar
      ],
      defaultViewport: null,
      userDataDir: "./tmp",
    });
    this.page = await this.browser.newPage();
    // await this.page.setUserAgent(getRandomUserAgent());
  }

  async goToWebpage(url: string): Promise<void> {
    if (!this.page) {
      throw new Error(
        "Puppeteer instance is not initialized. Call init() first."
      );
    }
    await this.page.goto(url, { waitUntil: "networkidle2" });
  }

  async typeIntoInput(selector: string, text: string): Promise<void> {
    if (!this.page) {
      throw new Error(
        "Puppeteer instance is not initialized. Call init() first."
      );
    }

    await this.page.waitForSelector(selector, this.setTimeoutToSelectors);
    await this.page.click(selector);
    await this.page.type(selector, text);
  }

  async clickButton(selector: string, iFrame?: string): Promise<void> {
    if (!this.page) {
      throw new Error(
        "Puppeteer instance is not initialized. Call init() first."
      );
    }
    if (iFrame) {
      const targetFrame = await this.page.$(iFrame);
      const iFrameContent = await targetFrame?.contentFrame();
      await iFrameContent?.waitForSelector(selector);
      await iFrameContent?.click(selector);
    }
    else{
      await this.page.waitForSelector(selector);
      await this.page.click(selector);
    }
  }

  async deleteText(selector: string): Promise<void> {
    if (!this.page) {
      throw new Error(
        "Puppeteer instance is not initialized. Call init() first."
      );
    }

    await this.page.waitForSelector(selector, this.setTimeoutToSelectors);
    await this.page.focus(selector);
    const inputValue = await this.page.$eval(selector, (el) => el.textContent);
    const textLenght = inputValue?.length;
    if (textLenght) {
      for (let i = 0; i < textLenght; i++) {
        await this.page.keyboard.down("Backspace");
      }

      for (let i = 0; i < textLenght; i++) {
        await this.page.keyboard.up("Backspace");
      }
    } else {
      console.log("There was nothing to delete");
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
