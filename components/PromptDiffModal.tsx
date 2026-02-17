import React, { useMemo } from 'react';
import { Modal } from './Modal';
import { PromptVersion, IdTextPair } from '../types';

interface DiffResult {
  value: string;
  added?: boolean;
  removed?: boolean;
}

const createTextDiff = (textA: string = '', textB: string = ''): DiffResult[] => {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  
  const n = linesA.length;
  const m = linesB.length;
  const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const diff: DiffResult[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      diff.unshift({ value: linesA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ value: linesB[j - 1], added: true });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ value: linesA[i - 1], removed: true });
      i--;
    } else {
      break;
    }
  }
  return diff;
};


interface PromptDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionA: PromptVersion;
  versionB: PromptVersion;
  promptTitle: string;
}

export const PromptDiffModal: React.FC<PromptDiffModalProps> = ({
  isOpen,
  onClose,
  versionA,
  versionB,
  promptTitle,
}) => {

  const contentDiff = useMemo(() => createTextDiff(versionA.content, versionB.content), [versionA.content, versionB.content]);
  const instructionsDiff = useMemo(() => createTextDiff(versionA.systemInstructions, versionB.systemInstructions), [versionA.systemInstructions, versionB.systemInstructions]);

  const rulesDiff = useMemo(() => {
    const rulesA = new Map<string, string>(versionA.rules.map(r => [r.id, r.text]));
    const rulesB = new Map<string, string>(versionB.rules.map(r => [r.id, r.text]));
    const allIds = new Set<string>([...rulesA.keys(), ...rulesB.keys()]);
    const diffs: { id: string; text: string; status: 'added' | 'removed' | 'common' | 'modified' }[] = [];

    allIds.forEach(id => {
      const inA = rulesA.has(id);
      const inB = rulesB.has(id);

      if (inA && !inB) {
        diffs.push({ id, text: rulesA.get(id)!, status: 'removed' });
      } else if (!inA && inB) {
        diffs.push({ id, text: rulesB.get(id)!, status: 'added' });
      } else if (inA && inB) {
        if (rulesA.get(id) !== rulesB.get(id)) {
          diffs.push({ id: `${id}-removed`, text: rulesA.get(id)!, status: 'removed' });
          diffs.push({ id: `${id}-added`, text: rulesB.get(id)!, status: 'added' });
        } else {
          diffs.push({ id, text: rulesA.get(id)!, status: 'common' });
        }
      }
    });
    return diffs;
  }, [versionA.rules, versionB.rules]);

  const tagsDiff = useMemo(() => {
    const tagsA = new Set(versionA.tags || []);
    const tagsB = new Set(versionB.tags || []);
    const added = [...tagsB].filter(t => !tagsA.has(t));
    const removed = [...tagsA].filter(t => !tagsB.has(t));
    return { added, removed };
  }, [versionA.tags, versionB.tags]);
  
  const DiffView: React.FC<{ diff: DiffResult[] }> = ({ diff }) => (
    <div className="diff-modal__content-box custom-scrollbar">
      {diff.map((line, index) => (
        <div
          key={index}
          className={`diff-line ${line.added ? 'diff-line--added' : ''} ${line.removed ? 'diff-line--removed' : ''}`}
        >
          <span className="diff-line__prefix">{line.added ? '+' : line.removed ? '-' : ' '}</span>
          <span className="diff-line__content">{line.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comparing Versions for: ${promptTitle}`} size="4xl">
      <div className="modal__body custom-scrollbar">
        <div className="diff-modal__grid">
          {/* Column A */}
          <div>
            <h3 className="diff-modal__column_header">Version {versionA.version}</h3>
            <div className="diff-modal__section">
              <h4 className="diff-modal__section-title">Configuration</h4>
              <div className="prompt-card__content-panel" style={{padding: 'var(--space-md)'}}>
                <div className={`diff-modal__meta-item ${versionA.temperature !== versionB.temperature ? 'changed' : ''}`}>
                  <span>Temperature:</span><span>{versionA.temperature?.toFixed(2) ?? '1.00'}</span>
                </div>
                <div className={`diff-modal__meta-item ${versionA.topP !== versionB.topP ? 'changed' : ''}`}>
                  <span>Top P:</span><span>{versionA.topP?.toFixed(2) ?? '0.95'}</span>
                </div>
                <div className={`diff-modal__meta-item ${versionA.evaluation !== versionB.evaluation ? 'changed' : ''}`}>
                  <span>Evaluation:</span><span>{versionA.evaluation || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="diff-modal__section">
              <h4 className="diff-modal__section-title">Tags</h4>
              <div className="prompt-card__content-panel" style={{padding: 'var(--space-md)'}}>
                {(!versionA.tags || versionA.tags.length === 0) && tagsDiff.removed.length === 0 && <p style={{color: 'var(--text-tertiary)', margin:0}}>No tags.</p>}
                <ul className="diff-modal__tag-list">
                  {versionA.tags?.map(t => (
                    <li key={t} className={`diff-modal__tag ${tagsDiff.removed.includes(t) ? 'diff-modal__tag--removed' : 'tag'}`}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Column B */}
          <div>
            <h3 className="diff-modal__column_header">Version {versionB.version}</h3>
             <div className="diff-modal__section">
              <h4 className="diff-modal__section-title">Configuration</h4>
              <div className="prompt-card__content-panel" style={{padding: 'var(--space-md)'}}>
                <div className={`diff-modal__meta-item ${versionA.temperature !== versionB.temperature ? 'changed' : ''}`}>
                  <span>Temperature:</span><span>{versionB.temperature?.toFixed(2) ?? '1.00'}</span>
                </div>
                <div className={`diff-modal__meta-item ${versionA.topP !== versionB.topP ? 'changed' : ''}`}>
                  <span>Top P:</span><span>{versionB.topP?.toFixed(2) ?? '0.95'}</span>
                </div>
                <div className={`diff-modal__meta-item ${versionA.evaluation !== versionB.evaluation ? 'changed' : ''}`}>
                  <span>Evaluation:</span><span>{versionB.evaluation || 'N/A'}</span>
                </div>
              </div>
            </div>
             <div className="diff-modal__section">
              <h4 className="diff-modal__section-title">Tags</h4>
              <div className="prompt-card__content-panel" style={{padding: 'var(--space-md)'}}>
                {(!versionB.tags || versionB.tags.length === 0) && tagsDiff.added.length === 0 && <p style={{color: 'var(--text-tertiary)', margin:0}}>No tags.</p>}
                 <ul className="diff-modal__tag-list">
                  {versionB.tags?.map(t => (
                    <li key={t} className={`diff-modal__tag ${tagsDiff.added.includes(t) ? 'diff-modal__tag--added' : 'tag'}`}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="diff-modal__section" style={{ gridColumn: '1 / -1' }}>
          <h4 className="diff-modal__section-title">Content</h4>
          <DiffView diff={contentDiff} />
        </div>
        <div className="diff-modal__section" style={{ gridColumn: '1 / -1' }}>
          <h4 className="diff-modal__section-title">System Instructions</h4>
          <DiffView diff={instructionsDiff} />
        </div>
         <div className="diff-modal__section" style={{ gridColumn: '1 / -1' }}>
          <h4 className="diff-modal__section-title">Rules</h4>
           <div className="diff-modal__content-box custom-scrollbar">
            {rulesDiff.length === 0 && <span style={{color: 'var(--text-tertiary)', padding: '0.1em 0.5em'}}>No rules in either version.</span>}
            {rulesDiff.map((line) => (
              <div
                key={line.id}
                className={`diff-line ${line.status === 'added' ? 'diff-line--added' : ''} ${line.status === 'removed' ? 'diff-line--removed' : ''}`}
              >
                <span className="diff-line__prefix">{line.status === 'added' ? '+' : line.status === 'removed' ? '-' : ' '}</span>
                <span className="diff-line__content">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="modal__footer">
        <button type="button" onClick={onClose} className="btn btn--primary">
          Close
        </button>
      </div>
    </Modal>
  );
};