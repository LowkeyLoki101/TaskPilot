import OpenAI from "openai";

// Ensure we have an API key
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// Initialize OpenAI client
export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Basic text analysis example
export async function summarizeArticle(text: string): Promise<string> {
  const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content || "Could not generate summary";
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for logic and management tasks
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    throw new Error("Failed to analyze sentiment: " + (error as Error).message);
  }
}

// Enhanced AI function calling for workflow generation
export async function generateWorkflowFromPrompt(
  prompt: string,
  availableTools: string[]
): Promise<any> {
  const systemPrompt = `You are an expert workflow designer. Convert natural language descriptions into structured workflow steps.

Available tools: ${availableTools.join(", ")}

Create a workflow with:
1. Clear, actionable steps
2. Appropriate tool assignments
3. Input/output dependencies
4. Error handling
5. Realistic assumptions

Respond with a structured workflow plan.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for logic and workflow generation
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    throw new Error("Failed to generate workflow: " + (error as Error).message);
  }
}

// Enhanced AI class with comprehensive tool support
export class EnhancedAI {
  private client = openai;

  async generateImage(prompt: string): Promise<{ url: string }> {
    try {
      const response = await this.client.images.generate({
        model: "dall-e-3", // Latest DALL-E model
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      return { url: response.data?.[0]?.url || "" };
    } catch (error) {
      console.error("Image generation error:", error);
      throw new Error("Failed to generate image");
    }
  }

  async analyzeImage(base64Image: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // Best vision model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image in detail and describe its key elements, context, and any notable aspects."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content || "Unable to analyze image";
    } catch (error) {
      console.error("Image analysis error:", error);
      throw new Error("Failed to analyze image");
    }
  }

  async generateText(prompt: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || "gpt-5", // Using GPT-5 as specified in replit.md
        messages: [{ role: "user", content: prompt }],
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Text generation error:", error);
      throw new Error("Failed to generate text");
    }
  }

  async generateStructuredResponse(prompt: string): Promise<any> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Structured response error:", error);
      throw new Error("Failed to generate structured response");
    }
  }
}

export const enhancedAI = new EnhancedAI();