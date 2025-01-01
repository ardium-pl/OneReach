import "dotenv/config";
import path from "path";
import { KnowledgeApiService } from "./services/api/knowledge";

const service = new KnowledgeApiService();
const knowledgeJsonPath = path.resolve("knowledge.json");
service.prepareAndExecute(knowledgeJsonPath);