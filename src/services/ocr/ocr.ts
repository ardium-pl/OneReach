import "dotenv/config";
import vision from "@google-cloud/vision";
import { logger } from "../../utils/logger";

const VISION_AUTH = {
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL as string,
    private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(
      /\\n/g,
      "\n"
    ), 
  },
  fallback: true,
};

export async function fileOcr(imageFilePath: string): Promise<string | null> {
  const client = new vision.ImageAnnotatorClient(VISION_AUTH);

  logger.info(` 🕶️ Processing image with Google Vision: ${imageFilePath}`);
  try {
    const [result] = await client.documentTextDetection(imageFilePath);

    const googleVisionText = result.fullTextAnnotation?.text;

    if (!googleVisionText) {
      logger.warn(`No text found in image: ${imageFilePath}`);
      return null;
    }

    logger.info(` 💚 Successfully processed image ${imageFilePath}`);
    return googleVisionText;
  } catch (err: any) {
    logger.error(`Error during Google Vision OCR processing: ${err.message}`);
    return null;
  }
}
