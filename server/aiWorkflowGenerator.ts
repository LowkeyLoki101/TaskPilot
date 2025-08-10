import OpenAI from "openai";
import { FlowScript } from "@shared/flowscript";
import { getToolSchemas } from "./toolRegistry";
import { randomUUID } from "crypto";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Convert natural language to FlowScript workflow
export async function generateWorkflowFromSpeech(
  userInput: string,
  context?: { projectId?: string; existingWorkflows?: FlowScript[] }
): Promise<FlowScript> {
  
  const toolSchemas = getToolSchemas();
  
  const systemPrompt = `You are a Conversational Workflow Composer. Convert natural language descriptions into FlowScript workflows.

FlowScript is a human-readable JSON format with these key elements:
- nodes: Steps with id, label, actor (user/app/ai/system), type, tool, inputs, outputs, pre/post conditions
- edges: Connections between steps with conditions
- assumptions: What you inferred from the user's description

Available tools: ${toolSchemas.map(t => t.function.name).join(", ")}

IMPORTANT RULES:
1. Use clear, descriptive labels for each step
2. Set appropriate actor (user=human action, app=UI action, ai=AI processing, system=automated)
3. Set type (ui_action, api_call, decision, analysis, wait, background)
4. Use @nodeId.outputField syntax for variable references
5. Add preconditions (pre) and postconditions (post) for flow control
6. Include error handling scenarios
7. List assumptions about what you inferred
8. Generate realistic test cases

Respond with valid FlowScript JSON only.`;

  const userPrompt = `Create a workflow for: "${userInput}"

Consider:
- Break down into clear, actionable steps
- Identify what tools/APIs are needed
- Add error handling for common failure cases
- Make assumptions explicit
- Ensure steps flow logically with proper conditions`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const workflow = JSON.parse(content) as FlowScript;
    
    // Ensure required fields
    workflow.id = workflow.id || randomUUID();
    workflow.assumptions = workflow.assumptions || [];
    
    // Add positions for nodes if not provided
    workflow.nodes.forEach((node, index) => {
      if (!node.position) {
        node.position = {
          x: (index % 4) * 320,
          y: Math.floor(index / 4) * 200
        };
      }
    });

    return workflow;
    
  } catch (error) {
    console.error("Error generating workflow:", error);
    
    // Return a simple fallback workflow
    return {
      id: randomUUID(),
      title: "Simple Task",
      description: `Workflow for: ${userInput}`,
      assumptions: ["Could not parse user input, created simple task"],
      nodes: [
        {
          id: "n1",
          label: userInput.slice(0, 50),
          actor: "user",
          type: "ui_action",
          position: { x: 0, y: 0 }
        }
      ],
      edges: []
    };
  }
}

// Refine workflow based on user feedback
export async function refineWorkflow(
  workflow: FlowScript,
  userFeedback: string
): Promise<FlowScript> {
  
  const systemPrompt = `You are refining a FlowScript workflow based on user feedback. 

Current workflow: ${JSON.stringify(workflow, null, 2)}

User feedback: "${userFeedback}"

Update the workflow to address the feedback. Maintain the same structure but modify nodes, edges, assumptions, or add new steps as needed.

Respond with the complete updated FlowScript JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content) as FlowScript;
    
  } catch (error) {
    console.error("Error refining workflow:", error);
    return workflow; // Return original if refinement fails
  }
}

// Explain a specific workflow step
export async function explainWorkflowStep(
  workflow: FlowScript,
  stepId: string,
  level: "user" | "developer" = "user"
): Promise<string> {
  
  const node = workflow.nodes.find(n => n.id === stepId);
  if (!node) {
    return "Step not found";
  }

  const prompt = level === "user" 
    ? `Explain this workflow step in simple terms for an end user: ${JSON.stringify(node, null, 2)}`
    : `Provide a technical explanation of this workflow step for a developer: ${JSON.stringify(node, null, 2)}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a helpful assistant explaining workflow steps." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    return response.choices[0].message.content || "Could not generate explanation";
    
  } catch (error) {
    console.error("Error explaining step:", error);
    return "Error generating explanation";
  }
}