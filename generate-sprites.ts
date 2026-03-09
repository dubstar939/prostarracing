import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function generateCarSprites() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const carColors = ["purple", "yellow", "red", "blue", "green"];
  const sprites: Record<string, string> = {};

  for (const color of carColors) {
    console.log(`Generating ${color} car sprite...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: `Rear view of a ${color} supercar, 16-bit pixel art style, arcade racing game asset, flat background, symmetrical, high detail, retro aesthetic`,
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        sprites[color] = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  const content = `export const CAR_SPRITES: Record<string, string> = ${JSON.stringify(sprites, null, 2)};`;
  fs.writeFileSync("src/constants/carSprites.ts", content);
  console.log("Car sprites generated and saved to src/constants/carSprites.ts");
}

generateCarSprites().catch(console.error);
