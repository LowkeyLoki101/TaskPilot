import OpenAI from "openai";

/*
Updated to use GPT-5:
1. GPT-5 was officially released on August 7, 2025 and is now the latest model
2. GPT-5 offers unified reasoning, better coding capabilities, reduced hallucinations, and enhanced multimodal support
3. Use the response_format: { type: "json_object" } option
4. Request output in JSON format in the prompt
*/

// Using GPT-5 - the newest OpenAI model released August 7, 2025 with unified reasoning and enhanced capabilities
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface TaskGenerationParams {
  title: string;
  description?: string;
  context?: string;
}

export interface SubtaskGenerationParams {
  parentTask: string;
  context?: string;
}

export interface FunctionCall {
  name: string;
  params: Record<string, any>;
}

export interface AIResponse {
  message: string;
  functions?: FunctionCall[];
}

// Basic text analysis for task management
export async function generateTasksFromText(text: string): Promise<{
  tasks: TaskGenerationParams[];
  message: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI task management assistant. Analyze the user's text and extract actionable tasks. 
          Respond with JSON in this format: 
          {
            "message": "Brief summary of what you found",
            "tasks": [
              {
                "title": "Task title",
                "description": "Detailed description",
                "context": "Additional context"
              }
            ]
          }`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"message": "No tasks found", "tasks": []}');
    return result;
  } catch (error) {
    throw new Error("Failed to generate tasks: " + (error as Error).message);
  }
}

// Generate subtasks for a given parent task
export async function generateSubtasks(params: SubtaskGenerationParams): Promise<TaskGenerationParams[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI task management assistant. Break down the given task into logical subtasks.
          Respond with JSON in this format:
          {
            "subtasks": [
              {
                "title": "Subtask title",
                "description": "Detailed description"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Break down this task into subtasks: ${params.parentTask}${params.context ? `. Context: ${params.context}` : ''}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"subtasks": []}');
    return result.subtasks || [];
  } catch (error) {
    throw new Error("Failed to generate subtasks: " + (error as Error).message);
  }
}

// Process chat messages and determine appropriate actions
export async function processChatMessage(message: string, context?: string): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for a task management system. You can help users:
          1. Create and manage tasks
          2. Schedule events and reminders
          3. Send emails and SMS notifications
          4. Search the web for information
          5. Generate subtasks and organize projects
          6. Analyze project progress and provide insights

          When users request actions, respond with JSON containing both a human-readable message and function calls if needed.
          
          Available functions:
          - create_task: {title, description, priority, dueDate, status}
          - update_task: {id, updates}
          - schedule_reminder: {taskId, reminderDate, message}
          - send_email: {to, subject, body, attachments}
          - send_sms: {to, message}
          - search_web: {query, limit}
          - generate_subtasks: {parentTaskId}
          
          Format: 
          {
            "message": "Human-readable response explaining what you'll do",
            "functions": [
              {
                "name": "function_name", 
                "params": {
                  "param1": "value1",
                  "param2": "value2"
                }
              }
            ]
          }
          
          If no functions are needed, omit the functions array.`
        },
        {
          role: "user",
          content: `${message}${context ? `. Context: ${context}` : ''}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"message": "I apologize, but I encountered an error processing your request."}');
    return result;
  } catch (error) {
    throw new Error("Failed to process chat message: " + (error as Error).message);
  }
}

// Analyze task priorities and suggest optimizations
export async function analyzeTaskPriorities(tasks: string[]): Promise<{
  analysis: string;
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI productivity analyst. Analyze the given tasks and provide prioritization insights.
          Respond with JSON in this format:
          {
            "analysis": "Overall analysis of the task list",
            "suggestions": [
              "Specific suggestion 1",
              "Specific suggestion 2"
            ]
          }`
        },
        {
          role: "user",
          content: `Analyze these tasks and suggest prioritization: ${tasks.join(', ')}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"analysis": "No analysis available", "suggestions": []}');
    return result;
  } catch (error) {
    throw new Error("Failed to analyze task priorities: " + (error as Error).message);
  }
}

// Generate project summary and insights
export async function generateProjectSummary(projectData: {
  name: string;
  tasks: Array<{
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
  }>;
}): Promise<{
  summary: string;
  insights: string[];
  recommendations: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI project analyst. Analyze the project data and provide comprehensive insights.
          Respond with JSON in this format:
          {
            "summary": "Overall project summary",
            "insights": [
              "Key insight 1",
              "Key insight 2"
            ],
            "recommendations": [
              "Actionable recommendation 1",
              "Actionable recommendation 2"
            ]
          }`
        },
        {
          role: "user",
          content: `Analyze this project: ${JSON.stringify(projectData)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"summary": "No summary available", "insights": [], "recommendations": []}');
    return result;
  } catch (error) {
    throw new Error("Failed to generate project summary: " + (error as Error).message);
  }
}

// Process voice commands specifically
export async function processVoiceCommand(transcript: string): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an AI voice assistant for a task management system. Process voice commands naturally.
          
          Common voice patterns to recognize:
          - "Create a task..." / "Add a task..." -> create_task
          - "Schedule..." / "Set a reminder..." -> schedule_reminder  
          - "Send an email..." -> send_email
          - "Search for..." -> search_web
          - "Update task..." -> update_task
          
          Respond with JSON format:
          {
            "message": "Confirmation of what you understood and will do",
            "functions": [
              {
                "name": "function_name",
                "params": {...}
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Voice command: "${transcript}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"message": "I didn\'t understand that command."}');
    return result;
  } catch (error) {
    throw new Error("Failed to process voice command: " + (error as Error).message);
  }
}

export { openai };
