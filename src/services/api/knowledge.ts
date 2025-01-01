import "dotenv/config";
import axios, { AxiosHeaders, AxiosRequestHeaders } from "axios";
import * as fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { DataToUpdate, KnowledgeBase, ApiPayload, TrainPayload } from "../../utils/types";

export class KnowledgeApiService {
  private readonly apiUrl: string;
  private readonly trainUrl: string;
  private readonly apiHeaders: AxiosHeaders;
  private readonly trainHeaders: AxiosHeaders;
  private dataToUpdate: DataToUpdate[] = [];
  private readonly creatorId: string;
  private readonly creatorLabel: string;

  constructor() {
    this.apiUrl = process.env.API_URL || "";
    this.trainUrl = process.env.TRAIN_URL || "";

    this.apiHeaders = new AxiosHeaders({
        "Content-Type": "application/json",
        Authorization: process.env.API_AUTHORIZATION || "",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      });
  
      this.trainHeaders = new AxiosHeaders({
        "Content-Type": "application/json",
        Authorization: process.env.TRAIN_AUTHORIZATION || "",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      });

    this.creatorId = process.env.CREATOR_ID || "";
    this.creatorLabel = process.env.CREATOR_LABEL || "";
  }

  private async postPayload(
    url: string,
    headers: AxiosRequestHeaders,
    payload: ApiPayload | TrainPayload
  ): Promise<void> {
    try {
      const response = await axios.post(url, payload, { headers });
      console.log(`Payload Sent Successfully to ${url}:`, response.data);
    } catch (error) {
      console.error(`Error Sending Payload to ${url}:`, error);
    }
  }

  private async sendPayload(knowledgeData: KnowledgeBase): Promise<void> {
    const currentDate = Date.now();
    this.dataToUpdate = knowledgeData.knowledge.map((item) => ({
      id: uuidv4(),
      addedDate: currentDate,
      editor: null,
      isOpened: true,
      isApproved: true,
      modifiedDate: currentDate,
      needReview: false,
      question: item.question,
      answer: item.answer,
      selectedCategories: [],
      creator: {
        id: this.creatorId,
        label: this.creatorLabel,
      },
    }));

    const payload: ApiPayload = {
      dataToUpdate: this.dataToUpdate,
      currentUser: {
        id: this.creatorId,
        label: this.creatorLabel,
        role: "ADMIN",
      },
    };

    await this.postPayload(this.apiUrl, this.apiHeaders, payload);
  }

  private async trainAgent(): Promise<void> {
    const approvedPairs = this.dataToUpdate.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    }));

    const payload: TrainPayload = {
      approvedPairs,
      currentUser: {
        id: this.creatorId,
        label: this.creatorLabel,
        role: "ADMIN",
      },
    };

    await this.postPayload(this.trainUrl, this.trainHeaders, payload);
  }

  private async readKnowledgeJson(filePath: string): Promise<KnowledgeBase> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as KnowledgeBase;
    } catch (error) {
      console.error("Error Reading knowledge.json:", error);
      throw error;
    }
  }

  public async prepareAndExecute(filePath: string): Promise<void> {
    try {
      const knowledgeData = await this.readKnowledgeJson(filePath);
      await this.sendPayload(knowledgeData);
      await this.trainAgent();
    } catch (error) {
      console.error("Error in Execution Process:", error);
    }
  }
}
