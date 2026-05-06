import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
  return aiClient;
}

export async function describeImageContext(base64Data: string, mimeType: string): Promise<string> {
  const response = await getAi().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        { text: "Generate a plain-text, detailed description of this image to be used as context for writing a social media caption. Focus on the main subject, setting, mood, colors, and any notable actions/products." },
        { inlineData: { data: base64Data, mimeType } }
      ]
    }
  });
  return response.text || "Image analyzed but no description generated.";
}

export interface CaptionGenerationParams {
  description: string;
  platform: string;
  tone: string;
  hashtagCount: number;
  language: string;
  brandVoice?: string;
  imageDescription?: string;
}

export interface GeneratedResult {
  variants: {
    direct: string;
    story: string;
    cta: string;
  };
  hashtags: string[];
}

export async function generateCaptions(params: CaptionGenerationParams): Promise<GeneratedResult> {
  const { description, platform, tone, hashtagCount, language, brandVoice, imageDescription } = params;
  
  let instructions = `You are a world-class social media copywriter. Write captions for ${platform} in ${language}.
Tone: ${tone}.
Target hashtag count: ${hashtagCount}.
The user described the post as: "${description}"
`;

  if (imageDescription) {
    instructions += `\nAn image is attached to the post. Image context: "${imageDescription}"`;
  }
  
  if (brandVoice) {
    instructions += `\nReference the following brand voice guidelines or past examples: "${brandVoice}"`;
  }

  instructions += `
Platform Rules:
- Instagram: 150-300 words, use line breaks, 3-5 well-placed emojis, end with a question/CTA.
- TikTok: strictly under 100 words, strong hook in the first line.
- LinkedIn: formal, insightful, avoid excessive emojis, open with bold statement/data, end with professional question.
- Twitter/X: under 250 characters, punchy, opinion-driven.
- Facebook: warm, community-focused, 50-150 words.

Hashtag Rules:
- Generate ${hashtagCount} hashtags in total. None should contain spaces or special characters.
- None should be generic single words like "love" or "happy".
- Provide a smart mix of high-volume, mid-range niche, and micro community tags.

Output:
Generate exactly 3 variant captions:
1. "direct": A straightforward caption getting straight to the point.
2. "story": Opens with a strong hook or personal story.
3. "cta": Focuses heavily on a Call To Action (e.g., save, tag someone, comment).

Return the result as a JSON object matching the requested schema.`;

  const response = await getAi().models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: instructions,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          variants: {
            type: Type.OBJECT,
            properties: {
              direct: { type: Type.STRING },
              story: { type: Type.STRING },
              cta: { type: Type.STRING }
            },
            required: ["direct", "story", "cta"]
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of hashtag strings WITHOUT the # symbol"
          }
        },
        required: ["variants", "hashtags"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response generated.");
  }
  
  const result: GeneratedResult = JSON.parse(response.text);
  
  // ensure hashtags don't have leading hashes so we can format them cleanly
  result.hashtags = result.hashtags.map(t => t.replace(/^#/, ''));
  return result;
}
