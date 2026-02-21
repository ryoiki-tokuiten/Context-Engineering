
import type { Node, Edge } from 'reactflow';

export type BlockType =
  | 'SystemContainer'
  | 'TriggerAgent'
  | 'ToolDef'
  | 'SubAgentDef'
  | 'MCPDef'
  | 'MemoryTool'
  | 'FileSystemBashDef'
  | 'AgentResponse'
  | 'UserMessage'
  | 'ToolCall'
  | 'ToolResult'

  | 'MCPCall'
  | 'MCPResult'
  | 'FileSystemBashCall'
  | 'FileSystemBashResult'
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
