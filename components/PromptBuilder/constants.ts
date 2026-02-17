
import React from 'react';
import type { Node, Edge } from 'reactflow';
import type { LucideProps } from 'lucide-react';
import { PromptBlockData, BlockType } from './types';
import {
    CogIcon,
    UserIcon,
    BotIcon,
    MessageSquareIcon,
    WrenchIcon,
    DatabaseIcon,
    FunctionSquareIcon,
    GitCompareArrowsIcon,
    ZapIcon,
    ServerIcon,
    CheckCircleIcon
} from '../icons';

export const PROMPT_NODE_TYPE = 'promptBlock';
export const SYSTEM_NODE_ID = 'system-node-root';
export const TRIGGER_NODE_ID = 'trigger-node-root';

interface BlockDefinition {
  type: BlockType;
  name: string;
  description: string;
  icon: React.FC<LucideProps>;
  defaultContent: string;
}

export interface BlockCategory {
  name: string;
  blocks: BlockDefinition[];
}

export const BLOCK_CATEGORIES: BlockCategory[] = [
    {
        name: 'Definitions (Drop in System Prompt)',
        blocks: [
            {
                type: 'ToolDef',
                name: 'Tool Definition',
                description: 'Define a tool the agent can use.',
                icon: WrenchIcon,
                defaultContent: 'Name: \nDescription: '
            },
            {
                type: 'SubAgentDef',
                name: 'Sub-Agent Definition',
                description: 'Define a specialized sub-agent persona.',
                icon: BotIcon,
                defaultContent: 'Name: \nPersona: '
            },
            {
                type: 'MCPDef',
                name: 'MCP Server',
                description: 'Connect a Model Context Protocol server.',
                icon: ServerIcon,
                defaultContent: 'Server Name: \nURI: '
            }
        ]
    },
    {
        name: 'Build History (Append to Chat)',
        blocks: [
             {
                type: 'UserMessage',
                name: 'User Message',
                description: 'Inject a user message into history.',
                icon: UserIcon,
                defaultContent: 'User: '
            },
            {
                type: 'AgentResponse',
                name: 'Agent Response',
                description: 'Plain text reasoning or response.',
                icon: MessageSquareIcon,
                defaultContent: 'Agent: '
            },
            {
                type: 'ToolCall',
                name: 'Tool Call',
                description: 'Simulate the agent calling a tool.',
                icon: FunctionSquareIcon,
                defaultContent: 'Call: {{tool_name}}(params)'
            },
            {
                type: 'MCPCall',
                name: 'MCP Call',
                description: 'Simulate a call to an MCP server.',
                icon: ServerIcon,
                defaultContent: 'MCP Call: {{server_name}}/{{tool_name}}'
            },
            {
                type: 'SubAgentCall',
                name: 'Sub-Agent Call',
                description: 'Hand off control to a sub-agent.',
                icon: GitCompareArrowsIcon,
                defaultContent: 'Handoff -> {{agent_name}}'
            },
            {
                type: 'ImplementationPlan',
                name: 'Implementation Plan',
                description: 'Prunes context and resets focus.',
                icon: ZapIcon,
                defaultContent: 'Tool Call: create_implementation_plan()'
            },
            {
                type: 'AutoApprove',
                name: 'Auto Approve',
                description: 'System flag to auto-approve next step.',
                icon: CheckCircleIcon,
                defaultContent: '<system_note>User Auto-Approved</system_note>'
            }
        ]
    }
];

export const BLOCK_CATEGORIES_FOR_PROMPT = BLOCK_CATEGORIES.map(cat => 
  `${cat.name}:\n` + cat.blocks.map(b => `- ${b.name} (${b.type}): ${b.description}`).join('\n')
).join('\n\n');

export const AI_FILL_SYSTEM_INSTRUCTION = `You are an AI workflow architect.`; 

export const initialNodes: Node<PromptBlockData>[] = [
  {
    id: SYSTEM_NODE_ID,
    type: PROMPT_NODE_TYPE,
    data: { 
        type: 'SystemContainer',
        name: 'System Prompt',
        content: 'You are a helpful AI assistant with access to the following tools and agents.',
        isLocked: true
    },
    position: { x: 250, y: 50 },
    style: { width: 500, height: 300, backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px dashed var(--border-accent)' },
    dragHandle: '.prompt-node__header' 
  },
  {
    id: TRIGGER_NODE_ID,
    type: PROMPT_NODE_TYPE,
    data: { 
        type: 'TriggerAgent',
        name: 'Trigger Agent (User Input)',
        content: 'User: {{user_query}}',
        isLocked: true
    },
    position: { x: 250, y: 400 }, // Positioned visually below system
  },
];

export const initialEdges: Edge[] = [
    { id: 'e-sys-trig', source: SYSTEM_NODE_ID, target: TRIGGER_NODE_ID, animated: true, style: { stroke: 'var(--border-accent)' } }
];

export const getSortedNodes = (nodes: Node<PromptBlockData>[], edges: Edge[]): Node<PromptBlockData>[] => {
  if (nodes.length === 0) return [];
  
  const historyNodes = nodes.filter(n => n.parentNode !== SYSTEM_NODE_ID && n.id !== SYSTEM_NODE_ID);
  
  const nodeMap = new Map(historyNodes.map(node => [node.id, node]));
  const edgeMap = new Map(edges.map(edge => [edge.source, edge.target]));
  
  const sortedHistory: Node<PromptBlockData>[] = [];
  let currentId: string | undefined = TRIGGER_NODE_ID; 

  while (currentId && nodeMap.has(currentId)) {
      sortedHistory.push(nodeMap.get(currentId)!);
      currentId = edgeMap.get(currentId);
  }

  return sortedHistory;
};
