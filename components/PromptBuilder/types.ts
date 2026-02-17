
import type { Node, Edge } from 'reactflow';

export type BlockType = 
  | 'SystemContainer' 
  | 'TriggerAgent' 
  | 'ToolDef' 
  | 'SubAgentDef' 
  | 'MCPDef' 
  | 'AgentResponse' 
  | 'UserMessage'
  | 'ToolCall' 
  | 'ToolResult' 
  | 'MCPCall'
  | 'MCPResult'
  | 'SubAgentCall' 
  | 'SubAgentResponse' 
  | 'ImplementationPlan'
  | 'AutoApprove';

export interface PromptBlockData {
    type: BlockType;
    name: string;
    content: string;
    // For definitions
    description?: string;
    usage?: string;
    // For automatic management
    isLocked?: boolean; 
}

export interface AIFillWorkflow {
  workflowName?: string;
  nodes: Node<PromptBlockData>[];
  edges: Edge[];
}
