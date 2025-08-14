import OpenAI from "openai";

// Using GPT-5 as specified in user preferences
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAIResponse(userMessage: string, context?: any[]): Promise<string> {
  try {
    const messages: any[] = [
      {
        role: "system",
        content: "You are GPT-5, the AI assistant for Emergent Intelligence, a sophisticated task management and workflow orchestration system. Be helpful, intelligent, and professional. Help users manage their tasks, projects, and workflows with advanced capabilities."
      }
    ];

    // Add context if provided (previous messages)
    if (context && context.length > 0) {
      // Add last 10 messages for context
      const recentMessages = context.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      messages.push(...recentMessages);
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Check if it's an API key issue
    if (error.message?.includes('401') || error.message?.includes('apiKey')) {
      return "⚠️ OpenAI API key issue. Please check that the OPENAI_API_KEY environment variable is set correctly.";
    }
    
    return "I'm having trouble connecting to the AI service right now. Please try again later.";
  }
}