
import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { PromptBlockData } from './types';
import { 
    WrenchIcon, BotIcon, DatabaseIcon, MessageSquareIcon, 
    FunctionSquareIcon, GitCompareArrowsIcon, ZapIcon, 
    CogIcon, UserIcon, EditIcon, ServerIcon, CheckCircleIcon,
    BrainCircuitIcon
} from '../icons';

const ICON_MAP: Record<string, React.FC<any>> = {
    'SystemContainer': CogIcon,
    'TriggerAgent': UserIcon,
    'ToolDef': WrenchIcon,
    'SubAgentDef': BotIcon,
    'MCPDef': ServerIcon,
    'MemoryTool': BrainCircuitIcon,
    'AgentResponse': MessageSquareIcon,
    'UserMessage': UserIcon,
    'ToolCall': FunctionSquareIcon,
    'ToolResult': FunctionSquareIcon,
    'MCPCall': ServerIcon,
    'MCPResult': ServerIcon,
    'SubAgentCall': GitCompareArrowsIcon,
    'SubAgentResponse': MessageSquareIcon,
    'ImplementationPlan': ZapIcon,
    'AutoApprove': CheckCircleIcon
};

export const PromptBlockNode: React.FC<NodeProps<PromptBlockData>> = ({ data, selected }) => {
    const Icon = ICON_MAP[data.type] || EditIcon;
    
    // System Container (Parent)
    if (data.type === 'SystemContainer') {
        return (
            <div className={`prompt-node system-container ${selected ? 'selected' : ''}`} style={{height: '100%', width: '100%', border: 'none', background: 'transparent'}}>
                <div className="prompt-node__header" style={{background: 'var(--accent-primary)', color: 'white', borderRadius: '4px 4px 0 0'}}>
                    <Icon className="icon" style={{color: 'white'}} />
                    <span>{data.name}</span>
                </div>
                <div className="prompt-node__content" style={{height: 'calc(100% - 30px)', background: 'var(--surface-primary)', opacity: 0.8, borderRadius: '0 0 4px 4px', overflow: 'hidden'}}>
                    <p style={{ margin: 0, fontSize: '0.8rem', padding: '10px' }}>{data.content}</p>
                    <div style={{padding: '10px', fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-primary)', position: 'absolute', bottom: 0, width: '100%'}}>
                        <em>Drop Definitions here</em>
                    </div>
                </div>
                <Handle type="source" position={Position.Bottom} style={{background: 'var(--accent-primary)'}} />
            </div>
        );
    }

    // Definition Chips (Inside System) - Styled as small icons
    if (['ToolDef', 'SubAgentDef', 'MCPDef', 'MemoryTool'].includes(data.type)) {
        return (
            <div 
                className={`prompt-node definition-chip ${selected ? 'selected' : ''}`} 
                style={{
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '12px',
                    background: 'var(--surface-tertiary)',
                    border: selected ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    fontSize: '0.65rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden'
                }}
                title={`${data.name}: ${data.content}`}
            >
                <Icon className="icon" style={{width: '24px', height: '24px', marginBottom: '4px', color: 'var(--text-primary)'}} />
                <span style={{maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{data.name.replace(/ Definition| Server| Manager/, '')}</span>
            </div>
        );
    }

    // History Blocks
    const isTrigger = data.type === 'TriggerAgent';
    const isSpecial = data.type === 'ImplementationPlan';
    const isUser = data.type === 'UserMessage';
    const isAuto = data.type === 'AutoApprove';
    
    let borderColor = 'var(--border-primary)';
    let headerColor = 'var(--surface-secondary)';
    let iconColor = 'var(--accent-primary)';

    if (isTrigger) { borderColor = 'var(--accent-success)'; iconColor = 'var(--accent-success)'; }
    if (isSpecial) { borderColor = 'var(--accent-warning)'; iconColor = 'var(--accent-warning)'; }
    if (isUser) { borderColor = 'var(--border-accent)'; iconColor = 'var(--text-primary)'; }
    if (isAuto) { borderColor = 'var(--accent-success)'; iconColor = 'var(--accent-success)'; }

    return (
        <div className={`prompt-node ${selected ? 'selected' : ''}`} style={{ borderColor }}>
            <Handle type="target" position={Position.Top} style={{visibility: isTrigger ? 'visible' : 'visible'}} />
            <div className="prompt-node__header" style={{background: headerColor}}>
                <Icon className="icon" style={{ color: iconColor }} />
                <span>{data.name}</span>
            </div>
            <div className="prompt-node__content">
                <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {data.content}
                </p>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default memo(PromptBlockNode);
