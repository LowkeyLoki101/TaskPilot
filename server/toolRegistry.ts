import { ToolDefinition } from "@shared/flowscript";

// Tool registry for workflow execution
export const toolRegistry: Record<string, ToolDefinition> = {
  "email.send": {
    name: "email.send",
    description: "Send an email with optional attachments",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject line" },
        body: { type: "string", description: "Email body content" },
        attachmentUrl: { type: "string", description: "URL of attachment to include" }
      },
      required: ["to", "subject"]
    },
    handler: async (params) => {
      // Simulate email sending with SendGrid
      console.log("Sending email:", params);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      return {
        messageId: `msg_${Date.now()}`,
        status: "sent",
        timestamp: new Date().toISOString()
      };
    }
  },

  "slack.postMessage": {
    name: "slack.postMessage", 
    description: "Post a message to a Slack channel",
    parameters: {
      type: "object",
      properties: {
        channel: { type: "string", description: "Slack channel (e.g., #general)" },
        text: { type: "string", description: "Message text to post" },
        username: { type: "string", description: "Bot username" }
      },
      required: ["channel", "text"]
    },
    handler: async (params) => {
      console.log("Posting to Slack:", params);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      return {
        messageId: `slack_${Date.now()}`,
        channel: params.channel,
        timestamp: new Date().toISOString()
      };
    }
  },

  "dropbox.analyzeFile": {
    name: "dropbox.analyzeFile",
    description: "Analyze a file using Dropbox AI",
    parameters: {
      type: "object", 
      properties: {
        fileUrl: { type: "string", description: "URL of the file to analyze" },
        analysisType: { type: "string", description: "Type of analysis to perform" }
      },
      required: ["fileUrl"]
    },
    handler: async (params) => {
      console.log("Analyzing file:", params);
      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));
      
      return {
        summary: "This document contains a quarterly business report with key metrics and performance indicators.",
        pdfReportUrl: `https://example.com/reports/analysis_${Date.now()}.pdf`,
        confidence: 0.95,
        analysisTime: new Date().toISOString()
      };
    }
  },

  "calendar.scheduleEvent": {
    name: "calendar.scheduleEvent",
    description: "Schedule an event in Google Calendar",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Event title" },
        startTime: { type: "string", description: "Start time (ISO format)" },
        endTime: { type: "string", description: "End time (ISO format)" },
        attendees: { type: "array", items: { type: "string" }, description: "List of attendee emails" },
        description: { type: "string", description: "Event description" }
      },
      required: ["title", "startTime", "endTime"]
    },
    handler: async (params) => {
      console.log("Scheduling event:", params);
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));
      
      return {
        eventId: `cal_${Date.now()}`,
        calendarUrl: `https://calendar.google.com/event?eid=${Date.now()}`,
        created: new Date().toISOString()
      };
    }
  },

  "http.call": {
    name: "http.call",
    description: "Make an HTTP request to any API",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "API endpoint URL" },
        method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"], description: "HTTP method" },
        headers: { type: "object", description: "Request headers" },
        body: { type: "object", description: "Request body" }
      },
      required: ["url"]
    },
    handler: async (params) => {
      console.log("Making HTTP call:", params);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 3000));
      
      return {
        status: 200,
        data: { success: true, timestamp: new Date().toISOString() },
        headers: { "content-type": "application/json" }
      };
    }
  },

  "file.upload": {
    name: "file.upload",
    description: "Upload a file to cloud storage",
    parameters: {
      type: "object",
      properties: {
        filePath: { type: "string", description: "Local file path" },
        destination: { type: "string", description: "Upload destination" }
      },
      required: ["filePath"]
    },
    handler: async (params) => {
      console.log("Uploading file:", params);
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 4000));
      
      return {
        fileUrl: `https://storage.example.com/files/${Date.now()}.pdf`,
        fileSize: Math.floor(Math.random() * 1000000),
        uploadTime: new Date().toISOString()
      };
    }
  },

  "sms.send": {
    name: "sms.send", 
    description: "Send an SMS message",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Phone number to send to" },
        message: { type: "string", description: "SMS message content" }
      },
      required: ["to", "message"]
    },
    handler: async (params) => {
      console.log("Sending SMS:", params);
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      return {
        messageId: `sms_${Date.now()}`,
        status: "delivered",
        timestamp: new Date().toISOString()
      };
    }
  }
};

// Execute a tool with error handling and metrics
export async function executeTool(
  toolName: string, 
  params: Record<string, any>
): Promise<{ success: boolean; result?: any; error?: string; latency_ms: number }> {
  const startTime = Date.now();
  
  try {
    const tool = toolRegistry[toolName];
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    const result = await tool.handler(params);
    const latency_ms = Date.now() - startTime;
    
    return {
      success: true,
      result,
      latency_ms
    };
  } catch (error) {
    const latency_ms = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      latency_ms
    };
  }
}

// Get tool schemas for AI function calling
export function getToolSchemas() {
  return Object.values(toolRegistry).map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
}