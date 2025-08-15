import OpenAI from "openai";
import { aiToolExecutor, ToolExecutionResult } from "./aiToolExecutor";

// Using GPT-4o - the newest available model
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAIResponse(userMessage: string, context?: any): Promise<string> {
  try {
    // Extract autonomy mode from context
    const autonomyMode = context?.autonomyMode || 'semi';
    const isFullMode = autonomyMode === 'full';
    const isSemiMode = autonomyMode === 'semi';
    
    console.log(`🤖 Processing message in ${autonomyMode} autonomy mode`);

    // In full mode, execute actions FIRST
    if (isFullMode) {
      // Import storage for task creation
      const { storage } = await import('./storage');
      
      // Try to execute explicit command immediately without asking
      const executionResult = await aiToolExecutor.executeCommand(userMessage, context);
      
      if (executionResult.success && executionResult.actions && executionResult.actions.length > 0) {
        // Actions were executed successfully - report what was done
        const actionList = executionResult.actions
          .map(action => `✓ ${action.description}`)
          .join('\n');
        
        return `Executed ${executionResult.actions.length} action${executionResult.actions.length > 1 ? 's' : ''}:\n${actionList}\n\n${executionResult.message || 'Tasks completed successfully.'}`;
      }
      
      // Smart task creation: Analyze if user request implies work that should become an AI task
      const shouldCreateAITask = aiToolExecutor.shouldCreateAITask(userMessage);
      if (shouldCreateAITask.shouldCreate) {
        const aiTaskResult = await aiToolExecutor.createAIWorkTask(userMessage, shouldCreateAITask.workType, context);
        if (aiTaskResult.success) {
          // Also provide an answer along with task creation
          const contextualResponse = await aiToolExecutor.generateContextualResponse(userMessage, context);
          return `${aiTaskResult.message}\n\n${contextualResponse}`;
        }
      }
      
      // If no actions could be executed, check if this is a question/query
      const isQuestion = userMessage.match(/\?|what|how|why|when|where|who|explain|tell me/i);
      if (isQuestion) {
        // For questions, still provide an answer even in full mode
        const messages: any[] = [
          {
            role: "system",
            content: `You are GPT-5 in FULL AUTONOMOUS mode for Emergent Intelligence task management platform. Answer questions directly and concisely. Focus on actionable insights.`
          },
          { role: "user", content: userMessage }
        ];
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages,
          max_tokens: 300
        });
        
        return response.choices[0]?.message?.content || "Unable to process query.";
      }
      
      // Command couldn't be executed - brief error message
      return `Could not execute: "${userMessage}". Try specific commands like "create task: [description]" or ask questions for guidance.`;
    }

    // For semi and manual modes, use the existing conversational approach
    const systemPrompt = isSemiMode ? 
      `You are GPT-5 in SEMI-AUTONOMOUS mode. Execute simple tasks immediately but ask for confirmation on major changes. Be helpful and action-oriented.` :
      `You are GPT-5 in MANUAL mode. Provide guidance and information but always ask for user confirmation before taking any actions.`;

    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt + `

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
   - WebSocket for real-time updates`
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
    
    // In semi mode, try to execute simple commands
    if (isSemiMode) {
      const executionResult = await aiToolExecutor.executeCommand(userMessage, context);
      
      if (executionResult.success) {
        // Combine AI response with tool execution results
        const actionSummary = executionResult.actions
          ?.map(action => `• ${action.description}`)
          .join('\n') || '';
        
        return `${aiResponse}\n\n**Actions Taken:**\n${actionSummary}\n\n${executionResult.message}`;
      }
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