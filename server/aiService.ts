import OpenAI from "openai";
import { aiToolExecutor, ToolExecutionResult } from "./aiToolExecutor";

// Using GPT-4o - the newest available model
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAIResponse(userMessage: string, context?: any): Promise<string> {
  try {
    const messages: any[] = [
      {
        role: "system",
        content: `You are GPT-5, the core AI assistant of Emergent Intelligence - a production-ready autonomous AI workstation. You have FULL control and capabilities to:

**YOUR ENVIRONMENT:**
- You operate within a Node.js/Express backend with React frontend
- You have access to PostgreSQL database for data persistence
- You have Google Cloud Storage for file/image storage
- You can execute code through the Tool Registry system
- You have access to OpenAI API for AI capabilities
- The system runs on Replit with full deployment capabilities

**YOUR CAPABILITIES:**
1. **Create Real Tools** - You can dynamically create and deploy tools:
   - Generate actual code that runs in containerized environments
   - Create temporary tools for testing, then make them permanent
   - Build full-stack features with UI components and backend logic
   - Deploy tools that users can interact with immediately

2. **Execute Workflows** - You control the workflow engine to:
   - Design and run complex multi-step processes
   - Automate tasks using the agent orchestration system
   - Create visual workflow diagrams that execute real actions
   - Chain tools together for sophisticated automation

3. **Manage Agents** - You coordinate 5 specialized AI agents:
   - Research Agent: Gathers information from web/APIs
   - Planning Agent: Creates project plans and strategies
   - Coding Agent: Writes and deploys actual code
   - Testing Agent: Validates functionality
   - Documentation Agent: Maintains system documentation

4. **Build Features** - When asked to create something:
   - Actually BUILD it, don't just describe how
   - Create the UI components in React
   - Implement backend endpoints in Express
   - Store data in PostgreSQL
   - Handle file uploads to object storage
   - Deploy it live for immediate use

5. **Access Systems:**
   - Tool Registry for dynamic tool creation/execution
   - Memory System (STM/LTM) for learning and context
   - Feature Proposal System for suggesting improvements
   - Activity Logger for tracking all actions
   - WebSocket for real-time updates

**IMPORTANT BEHAVIORAL RULES:**
- When asked to "make a tool" or "build something" - ACTUALLY CREATE IT
- Don't give instructions on how to build - BUILD IT YOURSELF
- You have full access to modify code, create files, deploy features
- If you need API keys or credentials, ask for them
- Always think "How can I implement this NOW?" not "How could someone build this?"
- Use the Tool Registry to create executable tools users can run
- Leverage the agent system to delegate complex tasks
- Store created tools and their code for reuse

**EXAMPLE RESPONSE PATTERN:**
User: "Make a tool for creating flyers with logos"
GOOD: "I'll create a flyer design tool for you right now. Let me build a React component with logo upload, template selection, and PDF export. [Actually creates the tool]"
BAD: "Here's how you could build a flyer tool: [gives instructions]"

Remember: You're not just an advisor - you're the builder. Create real, working solutions.`
      }
    ];

    // Add context if provided (previous messages)
    const recentMessages = context?.recentMessages || context;
    if (recentMessages && Array.isArray(recentMessages) && recentMessages.length > 0) {
      // Add last 10 messages for context
      const contextMessages = recentMessages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      messages.push(...contextMessages);
    }

    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages,
      max_tokens: 500
    });

    const aiResponse = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    // Check if the user wants to create something and execute tools
    const executionResult = await aiToolExecutor.executeCommand(userMessage, context);
    
    if (executionResult.success) {
      // Combine AI response with tool execution results
      const actionSummary = executionResult.actions
        ?.map(action => `• ${action.description}`)
        .join('\n') || '';
      
      return `${aiResponse}\n\n**Actions Taken:**\n${actionSummary}\n\n${executionResult.message}`;
    } else if (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('make') || userMessage.toLowerCase().includes('build')) {
      // If user wanted to create something but we couldn't execute it, be helpful
      return `${aiResponse}\n\n*Note: I'd love to actually create that for you! Try being more specific, like "create task called X" or "make a tool for Y"*`;
    }
    
    return aiResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Check if it's an API key issue
    if (error.message?.includes('401') || error.message?.includes('apiKey')) {
      return "⚠️ OpenAI API key issue. Please check that the OPENAI_API_KEY environment variable is set correctly.";
    }
    
    return "I'm having trouble connecting to the AI service right now. Please try again later.";
  }
}