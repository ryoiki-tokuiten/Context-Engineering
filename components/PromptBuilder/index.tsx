
import React, { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  NodeDragHandler,
} from 'reactflow';

import { BlockLibrary } from './BlockLibrary';
import { PropertiesPanel } from './PropertiesPanel';
import { ConfirmationModal } from '../ConfirmationModal';
import { PROMPT_NODE_TYPE, initialNodes, initialEdges, SYSTEM_NODE_ID, TRIGGER_NODE_ID } from './constants';
import { PromptBlockNode } from './customNode';
import { PromptBlockData, BlockType } from './types';
import { AppSettings, NotificationState } from '../../types';
import { SaveIcon, PanelLeftOpenIcon, PanelLeftCloseIcon, DeleteIcon } from '../icons';

let id = 100;
const getId = () => `node_${id++}`;

interface PromptBuilderProps {
  appSettings: AppSettings;
  showNotification: (message: string, type?: NotificationState['type'], duration?: number) => void;
  onSaveRequest: (livePrompt: string) => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const PromptBuilderUI: React.FC<PromptBuilderProps> = ({ appSettings, showNotification, onSaveRequest, onToggleSidebar, isSidebarCollapsed }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

  const { deleteElements, getNodes, getEdges } = useReactFlow();

  const nodeTypes = useMemo(() => ({ [PROMPT_NODE_TYPE]: PromptBlockNode }), []);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
        // Prevent connecting Definitions
        const sourceNode = nodes.find(n => n.id === params.source);
        if (sourceNode?.parentNode === SYSTEM_NODE_ID) return;
        setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setNodes, nodes, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const getLowestNode = (currentNodes: Node[], currentEdges: Edge[]): Node | null => {
      // Trace from Trigger Node down
      let currentId = TRIGGER_NODE_ID;
      let currentNode = currentNodes.find(n => n.id === currentId);
      
      // Safety check if trigger is deleted (though we try to prevent it)
      if (!currentNode) return currentNodes[currentNodes.length -1]; 

      while (true) {
          const outEdge = currentEdges.find(e => e.source === currentId);
          if (!outEdge) break;
          currentId = outEdge.target;
          const nextNode = currentNodes.find(n => n.id === currentId);
          if (nextNode) currentNode = nextNode;
          else break;
      }
      return currentNode || null;
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const blockDefinitionString = event.dataTransfer.getData('application/reactflow');

      if (!blockDefinitionString) return;

      const blockDefinition = JSON.parse(blockDefinitionString);
      const type: BlockType = blockDefinition.type;
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 1. Handle Definitions (Must drop into System)
      if (['ToolDef', 'SubAgentDef', 'MCPDef', 'MemoryTool'].includes(type)) {
        // Simple grid logic for small chips inside the container
        const existingDefs = nodes.filter(n => n.parentNode === SYSTEM_NODE_ID);
        const cols = 4; 
        const row = Math.floor(existingDefs.length / cols);
        const col = existingDefs.length % cols;
        const xOffset = 20 + (col * 80);
        const yOffset = 100 + (row * 80);
        
        const newNode: Node<PromptBlockData> = {
            id: getId(),
            type: PROMPT_NODE_TYPE,
            position: { x: xOffset, y: yOffset }, // Relative to parent
            parentNode: SYSTEM_NODE_ID,
            extent: 'parent',
            data: {
                type: type,
                name: `${blockDefinition.name.replace(' Definition', '').replace(' Manager', '')}`,
                content: blockDefinition.defaultContent || '',
            },
            style: { zIndex: 10 }
        };
        
        // Auto-expand System Node height if needed
        setNodes((nds) => {
            const systemNode = nds.find(n => n.id === SYSTEM_NODE_ID);
            let newNds = [...nds];
            if (systemNode) {
                const currentHeight = Number(systemNode.style?.height) || 300;
                if (yOffset > currentHeight - 80) {
                     newNds = newNds.map(n => n.id === SYSTEM_NODE_ID ? { ...n, style: { ...n.style, height: currentHeight + 80 } } : n);
                }
            }
            return [...newNds, newNode];
        });
        return;
      }

      // 2. Handle Build History (Append to chain)
      const lastNode = getLowestNode(nodes, edges);
      if (!lastNode) return; // Should not happen given TriggerNode is fixed

      const newNodeId = getId();
      // Auto-position below the last node
      const newX = lastNode.position.x;
      const newY = lastNode.position.y + 100;

      const newNode: Node<PromptBlockData> = {
        id: newNodeId,
        type: PROMPT_NODE_TYPE,
        position: { x: newX, y: newY },
        data: {
          type: type,
          name: blockDefinition.name,
          content: blockDefinition.defaultContent || '',
        },
      };

      const newEdge = { id: `e-${lastNode.id}-${newNodeId}`, source: lastNode.id, target: newNodeId, animated: true };
      
      let nodesToAdd = [newNode];
      let edgesToAdd = [newEdge];

      // Auto-completion Logic
      let nextY = newY + 100;

      if (type === 'ToolCall') {
          const resultNodeId = getId();
          const resultNode: Node<PromptBlockData> = {
              id: resultNodeId,
              type: PROMPT_NODE_TYPE,
              position: { x: newX, y: nextY },
              data: { type: 'ToolResult', name: 'Tool Result', content: 'Result: ...' }
          };
          const resultEdge = { id: `e-${newNodeId}-${resultNodeId}`, source: newNodeId, target: resultNodeId, animated: true };
          nodesToAdd.push(resultNode);
          edgesToAdd.push(resultEdge);
      } else if (type === 'MCPCall') {
          const resultNodeId = getId();
          const resultNode: Node<PromptBlockData> = {
              id: resultNodeId,
              type: PROMPT_NODE_TYPE,
              position: { x: newX, y: nextY },
              data: { type: 'MCPResult', name: 'MCP Result', content: 'Result: ...' }
          };
          const resultEdge = { id: `e-${newNodeId}-${resultNodeId}`, source: newNodeId, target: resultNodeId, animated: true };
          nodesToAdd.push(resultNode);
          edgesToAdd.push(resultEdge);
      } else if (type === 'SubAgentCall') {
          const resultNodeId = getId();
          const resultNode: Node<PromptBlockData> = {
              id: resultNodeId,
              type: PROMPT_NODE_TYPE,
              position: { x: newX, y: nextY },
              data: { type: 'SubAgentResponse', name: 'Sub-Agent Response', content: 'Response: ...' }
          };
          const resultEdge = { id: `e-${newNodeId}-${resultNodeId}`, source: newNodeId, target: resultNodeId, animated: true };
          nodesToAdd.push(resultNode);
          edgesToAdd.push(resultEdge);
      } else if (type === 'ImplementationPlan') {
          // Mandatory Auto-Approve append
          const autoNodeId = getId();
          const autoNode: Node<PromptBlockData> = {
              id: autoNodeId,
              type: PROMPT_NODE_TYPE,
              position: { x: newX, y: nextY },
              data: { type: 'AutoApprove', name: 'Auto Approve', content: '<system_note>User Auto-Approved</system_note>' }
          };
          const autoEdge = { id: `e-${newNodeId}-${autoNodeId}`, source: newNodeId, target: autoNodeId, animated: true };
          nodesToAdd.push(autoNode);
          edgesToAdd.push(autoEdge);
      }

      setNodes((nds) => nds.concat(nodesToAdd));
      setEdges((eds) => eds.concat(edgesToAdd));
    },
    [reactFlowInstance, setNodes, setEdges, nodes, edges]
  );
  
  const selectedNode = useMemo(() => nodes.find(n => n.selected), [nodes]);

  const onNodeDataChange = (nodeId: string, newData: Partial<PromptBlockData>) => {
      setNodes((nds) => 
        nds.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: { ...node.data, ...newData } }
            }
            return node;
        })
      );
  }

  const handleDeleteAction = () => {
    // Prevent deletion of Locked nodes
    const nodesToDelete = getNodes().filter((node) => node.selected && !node.data.isLocked);
    // Allow deleting edges, but be careful not to break the chain permanently (user can reconnect)
    const edgesToDelete = getEdges().filter((edge) => edge.selected);

    if (nodesToDelete.length > 0 || edgesToDelete.length > 0) {
      deleteElements({ nodes: nodesToDelete, edges: edgesToDelete });
    }
  };

  const handleClearCanvas = () => {
      setIsClearConfirmationOpen(true);
  };

  const executeReset = () => {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setIsClearConfirmationOpen(false);
      showNotification('Canvas reset to initial state.', 'success');
  }

  return (
    <main className="app-main app-main--builder">
        <div className="prompt-builder">
        <BlockLibrary />
        <div className="prompt-builder__canvas-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{ animated: true }}
                proOptions={{ hideAttribution: true }}
                deleteKeyCode={['Backspace', 'Delete']}
                onNodesDelete={(nodesToDelete) => {
                    // Prevent deleting locked nodes via keyboard
                    if (nodesToDelete.some(n => n.data.isLocked)) return false;
                }}
            >
                <Controls />
                <Background gap={16} color="var(--surface-tertiary)" />
                    <div className="prompt-builder__sidebar-toggle">
                    <button className="btn btn--secondary btn--icon" onClick={onToggleSidebar} title={isSidebarCollapsed ? "Show Organizer Panel" : "Hide Organizer Panel"}>
                        {isSidebarCollapsed ? <PanelLeftOpenIcon className="icon" /> : <PanelLeftCloseIcon className="icon" />}
                    </button>
                </div>
                <div className="prompt-builder__canvas-actions">
                     <button className="btn btn--secondary" onClick={handleClearCanvas}>
                        Reset Canvas
                    </button>
                    <button className="btn btn--primary" onClick={() => {
                         alert("Please copy the generated prompt from the Properties Panel preview.");
                    }}>
                        <SaveIcon className="icon" />
                        Save Prompt
                    </button>
                     <button className="btn btn--danger btn--icon" onClick={handleDeleteAction} title="Delete Selected">
                        <DeleteIcon className="icon" />
                    </button>
                </div>
            </ReactFlow>
        </div>
        <PropertiesPanel
            selectedNode={selectedNode}
            onNodeDataChange={onNodeDataChange}
            nodes={nodes}
            edges={edges}
            onSaveRequest={onSaveRequest} 
        />
        </div>
        {isClearConfirmationOpen && (
            <ConfirmationModal
                isOpen={true}
                onClose={() => setIsClearConfirmationOpen(false)}
                onConfirm={executeReset}
                title="Reset Workflow"
                message={<p>Are you sure you want to reset the workflow? This will remove all custom tools and history, reverting to the default System Prompt and Trigger.</p>}
                confirmButtonText="Reset"
            />
        )}
    </main>
  );
};

export const PromptBuilder: React.FC<PromptBuilderProps> = (props) => {
    return (
        <ReactFlowProvider>
            <PromptBuilderUI {...props} />
        </ReactFlowProvider>
    );
}
