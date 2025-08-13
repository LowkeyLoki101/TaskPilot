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
      model: "gpt-5", // Using GPT-5 for logic and management tasks
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
      model: "gpt-5", // Using GPT-5 for logic and workflow generation
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