import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { KnowledgeApiService } from "./services/api/knowledge";
import { fileOcr } from "./services/ocr/ocr";
import { OpenAiService } from "./services/openAI/openAi";
import { PuppeteerWrapper } from "./services/puppeteer/puppeteer";
import {
    continueButton,
    conversationInput,
    startNewButton,
    webPage
} from "./services/puppeteer/selectors";
import { logger } from "./utils/logger";
import { KnowledgeBase } from "./utils/types";

class Main {
  private readonly knowledgeService = new KnowledgeApiService();
  private readonly openAiService = new OpenAiService();
  private readonly puppeteer = new PuppeteerWrapper();
  private readonly knowledgeJsonPath = path.resolve("knowledge.json");
  private readonly screenshotPath = path.resolve("checkQuestion.png");

  public async trainModel(): Promise<KnowledgeBase> {
    await this.knowledgeService.prepareAndExecute(this.knowledgeJsonPath);
    return this.knowledgeService.readKnowledgeJson(this.knowledgeJsonPath);
  }

  public async askTrainedModel(knowledgeData: KnowledgeBase): Promise<string | null> {
    const question = await this.openAiService.generateQuestion(knowledgeData);
    if (!question) return null;
    await this.launchPuppeteer(question);
    return question;
  }

  private async launchPuppeteer(question: string): Promise<void> {
    const sleep = (milliseconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };
    await this.puppeteer.init();
    await this.puppeteer.goToWebpage(webPage);
    await this.puppeteer.clickButton(startNewButton);
    await sleep(1000);
    await this.puppeteer.deleteText(conversationInput);
    await this.puppeteer.typeIntoInput(conversationInput, question);
    await sleep(1000);
    await this.puppeteer.page?.keyboard.press("Enter");
    await sleep(15000);
    await this.puppeteer.clickButton("body");
    await this.puppeteer.page?.keyboard.press("PageDown");
    await sleep(500);
    await this.puppeteer.page?.screenshot({ path: this.screenshotPath });
    await sleep(1000);
    await this.puppeteer.close();
  }

  public async checkAnswer(question: string, knowledgeData: KnowledgeBase): Promise<string> {
    const ocrText = await fileOcr(this.screenshotPath);

    if (!ocrText) return "No ocrText";

    const finalResponse = await this.openAiService.checkAnswer(question, knowledgeData, ocrText);

    if (!finalResponse) return "There was no final response";

    try {
      await fs.unlink(this.screenshotPath);
      console.log("Screenshot file removed.");
    } catch (err) {
      console.error("Error removing screenshot file:", err);
    }
    return finalResponse;
  }

  public async execute(): Promise<void> {
    const knowledgeData = await this.trainModel();
    const question = await this.askTrainedModel(knowledgeData);

    if (!question) {
      logger.error("No question generated. Exiting...");
      return;
    }

    const answer = await this.checkAnswer(question, knowledgeData);
    logger.info(`Final Answer: ${answer}`);
  }
}

const main = new Main();
await main.execute();
