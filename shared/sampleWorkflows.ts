import { FlowScript } from "./flowscript";

// Sample workflows to demonstrate the Conversational Workflow Composer
export const sampleWorkflows: FlowScript[] = [
  {
    id: "dropbox-analysis-email",
    title: "Dropbox File Analysis & Email Report", 
    description: "Analyze a Dropbox file using AI and email the results as a PDF report",
    assumptions: [
      "User has Dropbox access credentials",
      "File is accessible and readable",
      "Email service is configured",
      "PDF generation service available"
    ],
    nodes: [
      {
        id: "n1",
        label: "Get Dropbox File",
        actor: "system",
        type: "api_call",
        tool: "dropbox.analyzeFile",
        inputs: {
          fileUrl: "https://dropbox.com/files/quarterly-report.pdf",
          analysisType: "business_metrics"
        },
        outputs: {
          summary: "string",
          pdfReportUrl: "string",
          confidence: "number"
        },
        position: { x: 100, y: 100 }
      },
      {
        id: "n2", 
        label: "Email Analysis Report",
        actor: "system",
        type: "api_call",
        tool: "email.send",
        inputs: {
          to: "client@company.com",
          subject: "Quarterly Report Analysis Complete",
          body: "Please find the analysis report attached.",
          attachmentUrl: "@n1.pdfReportUrl"
        },
        pre: { "n1.completed": true },
        outputs: {
          messageId: "string",
          status: "string"
        },
        position: { x: 400, y: 100 }
      },
      {
        id: "n3",
        label: "Notify Team on Slack",
        actor: "system", 
        type: "api_call",
        tool: "slack.postMessage",
        inputs: {
          channel: "#reports",
          text: "📊 Quarterly analysis complete! Report sent to client. Confidence: @n1.confidence"
        },
        pre: { "n2.completed": true },
        post: { "workflow.completed": true },
        position: { x: 700, y: 100 }
      }
    ],
    edges: [
      {
        from: "n1",
        to: "n2",
        when: "success",
        label: "Analysis Complete"
      },
      {
        from: "n2", 
        to: "n3",
        when: "success",
        label: "Email Sent"
      }
    ],
    testcases: [
      {
        name: "Happy Path",
        given: {
          fileUrl: "https://dropbox.com/files/test-report.pdf"
        },
        expect: {
          emailSent: true,
          slackNotified: true
        }
      }
    ]
  },

  {
    id: "customer-support-workflow",
    title: "Customer Support Ticket Resolution",
    description: "Automated customer support workflow with escalation",
    assumptions: [
      "Support ticket system integrated",
      "AI analysis available for ticket classification",
      "SMS notifications configured"
    ],
    nodes: [
      {
        id: "n1",
        label: "Analyze Support Ticket",
        actor: "ai",
        type: "analysis", 
        inputs: {
          ticketContent: "Customer complaint about delayed delivery",
          priority: "medium"
        },
        outputs: {
          category: "string",
          urgency: "string", 
          suggestedResponse: "string"
        },
        position: { x: 100, y: 100 }
      },
      {
        id: "n2",
        label: "High Priority Check",
        actor: "system",
        type: "decision",
        inputs: {
          urgency: "@n1.urgency"
        },
        outputs: {
          isHighPriority: "boolean"
        },
        position: { x: 400, y: 100 }
      },
      {
        id: "n3",
        label: "Send SMS Alert",
        actor: "system",
        type: "api_call",
        tool: "sms.send",
        inputs: {
          to: "+1234567890",
          message: "High priority ticket requires immediate attention: @n1.category"
        },
        pre: { "n2.isHighPriority": true },
        position: { x: 700, y: 50 }
      },
      {
        id: "n4",
        label: "Schedule Follow-up",
        actor: "system",
        type: "api_call", 
        tool: "calendar.scheduleEvent",
        inputs: {
          title: "Follow up on support ticket",
          startTime: "2024-08-11T10:00:00Z",
          endTime: "2024-08-11T10:30:00Z"
        },
        pre: { "n2.isHighPriority": false },
        position: { x: 700, y: 150 }
      }
    ],
    edges: [
      {
        from: "n1",
        to: "n2", 
        label: "Analysis Complete"
      },
      {
        from: "n2",
        to: "n3",
        when: "isHighPriority == true",
        label: "High Priority"
      },
      {
        from: "n2",
        to: "n4", 
        when: "isHighPriority == false",
        label: "Standard Priority"
      }
    ],
    testcases: [
      {
        name: "High Priority Path",
        given: {
          ticketContent: "URGENT: System down, revenue impact",
          priority: "high"
        },
        expect: {
          smsAlertSent: true
        }
      },
      {
        name: "Standard Priority Path", 
        given: {
          ticketContent: "Question about billing cycle",
          priority: "low"
        },
        expect: {
          followUpScheduled: true
        }
      }
    ]
  },

  {
    id: "social-media-automation",
    title: "Social Media Content Automation",
    description: "Generate, schedule and post social media content across platforms",
    assumptions: [
      "AI content generation available",
      "Social media APIs configured", 
      "Image generation service active"
    ],
    nodes: [
      {
        id: "n1",
        label: "Generate Post Content",
        actor: "ai",
        type: "analysis",
        inputs: {
          topic: "quarterly business results",
          tone: "professional",
          platform: "linkedin"
        },
        outputs: {
          postText: "string",
          hashtags: "array",
          imagePrompt: "string"
        },
        position: { x: 100, y: 100 }
      },
      {
        id: "n2",
        label: "Generate Image",
        actor: "ai", 
        type: "background",
        inputs: {
          prompt: "@n1.imagePrompt",
          style: "professional"
        },
        outputs: {
          imageUrl: "string"
        },
        position: { x: 400, y: 100 }
      },
      {
        id: "n3",
        label: "Upload to LinkedIn",
        actor: "system",
        type: "api_call",
        tool: "http.call",
        inputs: {
          url: "https://api.linkedin.com/v2/posts",
          method: "POST",
          body: {
            text: "@n1.postText",
            image: "@n2.imageUrl"
          }
        },
        pre: { 
          "n1.completed": true,
          "n2.completed": true 
        },
        position: { x: 700, y: 100 }
      },
      {
        id: "n4",
        label: "Wait 2 Hours",
        actor: "system",
        type: "wait",
        inputs: {
          duration: "7200" // 2 hours in seconds
        },
        position: { x: 400, y: 300 }
      },
      {
        id: "n5",
        label: "Post to Twitter",
        actor: "system",
        type: "api_call",
        tool: "http.call", 
        inputs: {
          url: "https://api.twitter.com/2/tweets",
          method: "POST",
          body: {
            text: "@n1.postText @n1.hashtags"
          }
        },
        pre: { "n4.completed": true },
        position: { x: 700, y: 300 }
      }
    ],
    edges: [
      {
        from: "n1",
        to: "n2",
        label: "Content Ready"
      },
      {
        from: "n1", 
        to: "n3",
        label: "Text Ready"
      },
      {
        from: "n2",
        to: "n3", 
        label: "Image Ready"
      },
      {
        from: "n3",
        to: "n4",
        label: "LinkedIn Posted"
      },
      {
        from: "n4",
        to: "n5",
        label: "Delay Complete"
      }
    ],
    testcases: [
      {
        name: "Full Automation Flow",
        given: {
          topic: "product launch announcement"
        },
        expect: {
          linkedinPosted: true,
          twitterPosted: true
        }
      }
    ]
  }
];

// Get a random sample workflow
export function getRandomSampleWorkflow(): FlowScript {
  return sampleWorkflows[Math.floor(Math.random() * sampleWorkflows.length)];
}

// Get workflow by ID
export function getSampleWorkflow(id: string): FlowScript | undefined {
  return sampleWorkflows.find(w => w.id === id);
}