import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { KnowledgeBase } from "../../utils/types";

export class OpenAiService {
  private readonly client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private messages: ChatCompletionMessageParam[] = [];

  private async generateGptResponse(
    messages: ChatCompletionMessageParam[]
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-2024-08-06",
        messages: messages,
      });

      return (
        response.choices[0]?.message?.content || "No response from OpenAI."
      );
    } catch (error) {
      console.error("Error in generateGpt3Response:", error);
      return "No response from OpenAI.";
    }
  }

  public async generateQuestion(
    knowledgeData: KnowledgeBase
  ): Promise<string | null> {
    try {
      this.messages = [
        {
          role: "system",
          content: `You are a specialist in generating queries, based on the knowledge provided. 
            Your task is to analyze the provided knowledge and, based on it, create a question that can be answered based on the provided knowledge data.
            Try to generate pretty simply questions`,
        },
        {
          role: "user",
          content: `Here is the knowledge:

        ${JSON.stringify(knowledgeData, null, 2)}`,
        },
      ];

      return await this.generateGptResponse(this.messages);
    } catch (error) {
      console.error("Error in generateQuestion:", error);
      return null;
    }
  }

  public async checkAnswer(
    question: string,
    knowledgeData: KnowledgeBase,
    ocrText: string
  ): Promise<string | null> {
    try {
      this.messages = [
        {
          role: "system",
          content: `You are a specialist in checking the correctness of the answer to the question. 
          Based on the data provided, in this case called knowledge, a question was created.
          You will receive from me the question asked, the data and the answer to the question asked in the form of text from OCR. 
          Analyze whether the question was answered correctly`,
        },
        {
          role: "user",
          content: `Here is the knowledge:
      
              ${JSON.stringify(knowledgeData, null, 2)},
               here is the question:
              ${question},
              
              and here is the OCR text:
              ${ocrText}`,
        },
      ];
      return await this.generateGptResponse(this.messages);
    } catch (error) {
      console.log("Checking asnwer failed: ", error);
      return null;
    }
  }
}
