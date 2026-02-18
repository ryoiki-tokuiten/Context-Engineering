
import React, { useMemo, useState, useCallback } from 'react';
import { EyeIcon, EditIcon, CopyIcon, CheckIcon, SaveIcon, HistoryIcon, CogIcon } from '../icons';
import { PromptBlockData } from './types';
import type { Node, Edge } from 'reactflow';
import { getSortedNodes, SYSTEM_NODE_ID, TRIGGER_NODE_ID } from './constants';

interface PropertiesPanelProps {
    selectedNode: Node<PromptBlockData> | undefined;
    onNodeDataChange: (nodeId: string, newData: Partial<PromptBlockData>) => void;
    nodes: Node<PromptBlockData>[];
    edges: Edge[];
    onSaveRequest: (livePrompt: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onNodeDataChange, nodes, edges, onSaveRequest }) => {
    const [isCopied, setIsCopied] = useState(false);

    // Derived State for System Prompt part
    const systemPromptText = useMemo(() => {
        const systemNode = nodes.find(n => n.id === SYSTEM_NODE_ID);
        let prompt = systemNode?.data.content || '';

        const definitions = nodes.filter(n => n.parentNode === SYSTEM_NODE_ID);
        if (definitions.length > 0) {
            prompt += '\n\n### Available Tools & Agents:\n';
            definitions.forEach(def => {
                prompt += `\n- **${def.data.name}**: ${def.data.description || 'No description'}`;
                if (def.data.content) prompt += `\n  Usage: ${def.data.content}`;
            });
        }
        return prompt;
    }, [nodes]);

    // Derived State for Conversation History part
    const chatHistoryNodes = useMemo(() => {
        const historyNodes = getSortedNodes(nodes, edges);
        
        // Pruning Logic (Implementation Plan)
        const implementationPlanIndex = historyNodes.findIndex(n => n.data.type === 'ImplementationPlan');
        let filteredHistory = historyNodes;

        if (implementationPlanIndex !== -1) {
            const triggerIndex = historyNodes.findIndex(n => n.data.type === 'TriggerAgent');
            if (triggerIndex !== -1 && implementationPlanIndex > triggerIndex) {
                 const beforeTrigger = historyNodes.slice(0, triggerIndex + 1);
                 const afterPlan = historyNodes.slice(implementationPlanIndex);
                 filteredHistory = [...beforeTrigger, ...afterPlan];
            }
        }
        return filteredHistory;
    }, [nodes, edges]);

    const fullLivePrompt = useMemo(() => {
        let prompt = systemPromptText;
        if (chatHistoryNodes.length > 0) {
            prompt += '\n\n### Conversation History:\n';
            chatHistoryNodes.forEach(node => {
                prompt += `\n${node.data.content}`;
            });
        }
        return prompt;
    }, [systemPromptText, chatHistoryNodes]);

    const handleCopy = useCallback(() => {
        if (!fullLivePrompt) return;
        navigator.clipboard.writeText(fullLivePrompt).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [fullLivePrompt]);

    const handleDataChange = (key: keyof PromptBlockData, value: string) => {
        if (selectedNode) {
            onNodeDataChange(selectedNode.id, { [key]: value });
        }
    }

    const isDefinition = selectedNode && ['ToolDef', 'SubAgentDef', 'MCPDef', 'MemoryTool'].includes(selectedNode.data.type);

    return (
        <aside className="prompt-builder__panel prompt-builder__panel--right custom-scrollbar">
            {selectedNode ? (
                <div style={{flex: '0 0 auto', borderBottom: '1px solid var(--border-primary)', paddingBottom: 'var(--space-lg)', marginBottom: 'var(--space-lg)'}}>
                    <h2 className="prompt-builder__panel-title">
                        <EditIcon className="icon" />
                        Properties: {selectedNode.data.type}
                    </h2>
                    <div className="form-group">
                        <label htmlFor="nodeName" className="form-label">Name</label>
                        <input
                            id="nodeName"
                            type="text"
                            value={selectedNode.data.name}
                            onChange={(e) => handleDataChange('name', e.target.value)}
                            className="form-input"
                            disabled={selectedNode.data.isLocked && selectedNode.data.type !== 'SystemContainer'} 
                        />
                    </div>
                    
                    {isDefinition && (
                         <div className="form-group">
                            <label htmlFor="nodeDesc" className="form-label">Description</label>
                            <input
                                id="nodeDesc"
                                type="text"
                                value={selectedNode.data.description || ''}
                                onChange={(e) => handleDataChange('description', e.target.value)}
                                className="form-input"
                                placeholder="Describe what this tool/agent does..."
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="nodeContent" className="form-label">
                            {isDefinition ? 'Usage / Schema' : 'Content'}
                        </label>
                        <textarea
                            id="nodeContent"
                            value={selectedNode.data.content}
                            onChange={(e) => handleDataChange('content', e.target.value)}
                            className="form-textarea"
                            style={{minHeight: '100px'}}
                        />
                    </div>
                </div>
            ) : (
                <div className="properties-panel__placeholder" style={{flex: '0 0 auto', height: 'auto', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)'}}>
                    <EditIcon className="icon" style={{width: '1.5rem', height: '1.5rem'}}/>
                    <p style={{margin:0}}>Select a block to edit.</p>
                </div>
            )}
            
            <div style={{flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)'}}>
                    <h2 className="prompt-builder__panel-title" style={{borderBottom: 'none', paddingBottom: 0, marginBottom: 0}}>
                        <EyeIcon className="icon" />
                        Preview
                    </h2>
                    <div style={{display: 'flex', gap: 'var(--space-xs)'}}>
                        <button className="btn btn--secondary btn--icon btn--sm" onClick={handleCopy} disabled={!fullLivePrompt || isCopied} title="Copy full prompt">
                            {isCopied ? <CheckIcon className="icon" /> : <CopyIcon className="icon" />}
                        </button>
                         <button className="btn btn--primary btn--icon btn--sm" onClick={() => onSaveRequest(fullLivePrompt)} disabled={!fullLivePrompt} title="Save as Prompt">
                            <SaveIcon className="icon" />
                        </button>
                    </div>
                </div>

                <div className="custom-scrollbar" style={{overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingRight: '4px'}}>
                    
                    {/* System Context Box */}
                    <div style={{
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-primary)', 
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600}}>
                            <CogIcon className="icon" style={{width: '14px', height: '14px'}}/> SYSTEM CONTEXT
                        </div>
                        <div style={{fontSize: '0.8rem', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)'}}>
                            {systemPromptText}
                        </div>
                    </div>

                    {/* Conversation History Visualizer */}
                    <div style={{
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-primary)', 
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        flexGrow: 1
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)', color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 600}}>
                            <HistoryIcon className="icon" style={{width: '14px', height: '14px'}}/> CONVERSATION HISTORY
                        </div>
                        
                        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)'}}>
                            {chatHistoryNodes.map((node, i) => {
                                const isUser = node.data.type === 'TriggerAgent' || node.data.type === 'UserMessage';
                                const isSystem = node.data.type === 'ImplementationPlan' || node.data.type === 'AutoApprove';
                                const isTool = ['ToolCall', 'ToolResult', 'MCPCall', 'MCPResult'].includes(node.data.type);
                                
                                let bg = 'var(--surface-primary)';
                                let align = 'flex-start';
                                let border = '1px solid var(--border-primary)';
                                
                                if (isUser) {
                                    bg = 'rgba(34, 197, 94, 0.1)';
                                    border = '1px solid rgba(34, 197, 94, 0.3)';
                                    align = 'flex-end';
                                } else if (isSystem) {
                                    bg = 'rgba(245, 158, 11, 0.1)';
                                    border = '1px solid rgba(245, 158, 11, 0.3)';
                                    align = 'center';
                                } else if (isTool) {
                                    bg = 'var(--surface-tertiary)';
                                }

                                return (
                                    <div key={node.id} style={{
                                        alignSelf: align,
                                        maxWidth: isSystem ? '100%' : '90%',
                                        background: bg,
                                        border: border,
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '8px',
                                        fontSize: '0.8rem'
                                    }}>
                                        <div style={{fontWeight: 600, marginBottom: '2px', fontSize: '0.7rem', color: 'var(--text-tertiary)'}}>
                                            {node.data.name}
                                        </div>
                                        <div style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                                            {node.data.content}
                                        </div>
                                    </div>
                                )
                            })}
                            {chatHistoryNodes.length === 0 && (
                                <div style={{textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '20px'}}>
                                    History empty
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
