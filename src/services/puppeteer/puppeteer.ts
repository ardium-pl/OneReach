import puppeteer from "puppeteer-extra";
import { Browser, Page, WaitForSelectorOptions } from "puppeteer";
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
        "--start-maximized", 
        "--disable-infobars",
        "--disable-sync",
        "--disable-notifications",
      ],
      defaultViewport: null,
      userDataDir: "./tmp",
    });
    this.page = await this.browser.newPage();
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
    const sleep = (milliseconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };
    if (iFrame) {
      const targetFrame = await this.page.$(iFrame);
      const iFrameContent = await targetFrame?.contentFrame();
      await iFrameContent?.waitForSelector(selector);
      await iFrameContent?.click(selector);
    }
    else{
      await this.page.waitForSelector(selector);
      await sleep(500);
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

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
