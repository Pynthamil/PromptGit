"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Folder, 
  Plus, 
  Play, 
  Check, 
  Copy, 
  FileText, 
  GitCompare, 
  History, 
  Globe, 
  Lock, 
  Tag, 
  Terminal, 
  Layers,
  ChevronRight,
  Flame,
  ArrowLeft,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import styles from './page.module.css';
import { MockDb, Collection, Prompt, Commit, Tag as TagType, ModelConfig } from '@/lib/mockDb';
import { computeLineDiff } from '@/lib/diff';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Database states
  const [collections, setCollections] = useState<Collection[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);

  // Navigation / Selection states
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'diff'>('editor');
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({
    'col-1': true,
    'col-2': true
  });

  // Editor states
  const [editorText, setEditorText] = useState<string>('');
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    provider: 'openai',
    modelName: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 500,
    topP: 1
  });

  // Playground variables
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [streamingOutput, setStreamingOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runStats, setRunStats] = useState<{ tokens: number; latency: number } | null>(null);

  // History / Diff selections
  const [selectedHistoryCommitId, setSelectedHistoryCommitId] = useState<string>('');
  const [diffBaseCommitId, setDiffBaseCommitId] = useState<string>('');
  const [diffCompareCommitId, setDiffCompareCommitId] = useState<string>('');

  // Modals state
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);

  // Modal Inputs
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColPublic, setNewColPublic] = useState(false);

  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptPublic, setNewPromptPublic] = useState(false);
  const [targetColIdForPrompt, setTargetColIdForPrompt] = useState('');

  const [commitMessage, setCommitMessage] = useState('');

  const [targetColIdForFork, setTargetColIdForFork] = useState('');

  // Clipboard copy feedback states
  const [copyCodeText, setCopyCodeText] = useState<string>('Copy SDK Code');
  const [copyOutputText, setCopyOutputText] = useState<string>('Copy Output');

  // Load database on mount
  useEffect(() => {
    setCollections(MockDb.getCollections());
    const initialPrompts = MockDb.getPrompts();
    setPrompts(initialPrompts);
    setCommits(MockDb.getCommits());
    setTags(MockDb.getTags());

    if (initialPrompts.length > 0) {
      setSelectedPromptId(initialPrompts[0].id);
    }
    setMounted(true);
  }, []);

  // Sync editor when active prompt changes
  const activePrompt = useMemo(() => {
    return prompts.find(p => p.id === selectedPromptId) || null;
  }, [prompts, selectedPromptId]);

  const activeLatestCommit = useMemo(() => {
    if (!selectedPromptId) return null;
    return MockDb.getLatestCommit(selectedPromptId);
  }, [selectedPromptId, commits]);

  useEffect(() => {
    if (activeLatestCommit) {
      setEditorText(activeLatestCommit.template);
      setModelConfig(activeLatestCommit.modelConfig);
      // Initialize default compare selection for diff view
      const promptCommits = MockDb.getPromptHistory(selectedPromptId);
      if (promptCommits.length > 0) {
        setDiffCompareCommitId(promptCommits[0].id); // Latest
        setDiffBaseCommitId(promptCommits[promptCommits.length - 1].id); // Root
      }
    }
  }, [selectedPromptId, activeLatestCommit]);

  // Extract variables dynamically from prompt template body
  const parsedVariables = useMemo(() => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(editorText)) !== null) {
      matches.add(match[1].trim());
    }
    return Array.from(matches);
  }, [editorText]);

  // Initialize input fields for new variables
  useEffect(() => {
    setVariables(prev => {
      const next: Record<string, string> = {};
      parsedVariables.forEach(v => {
        next[v] = prev[v] || '';
      });
      return next;
    });
  }, [parsedVariables]);

  // Get active tag metadata
  const activePromptTags = useMemo(() => {
    return tags.filter(t => t.promptId === selectedPromptId);
  }, [tags, selectedPromptId]);

  const currentWorkspaceName = "Personal Workspace";

  // Actions handlers
  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const newCol = MockDb.createCollection(newColName, newColDesc, newColPublic);
    setCollections(MockDb.getCollections());
    setIsColModalOpen(false);
    setNewColName('');
    setNewColDesc('');
    setNewColPublic(false);
  };

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptName.trim() || !targetColIdForPrompt) return;
    const { prompt } = MockDb.createPrompt(targetColIdForPrompt, newPromptName, newPromptPublic);
    setPrompts(MockDb.getPrompts());
    setCommits(MockDb.getCommits());
    setSelectedPromptId(prompt.id);
    setActiveTab('editor');
    setIsPromptModalOpen(false);
    setNewPromptName('');
    setNewPromptPublic(false);
  };

  const handleSaveCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromptId || !commitMessage.trim()) return;
    MockDb.createCommit(
      selectedPromptId,
      editorText,
      modelConfig,
      commitMessage,
      activeLatestCommit?.id || null
    );
    setCommits(MockDb.getCommits());
    setCommitMessage('');
    setIsCommitModalOpen(false);
  };

  const handleForkPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromptId || !targetColIdForFork) return;
    const forked = MockDb.forkPrompt(selectedPromptId, targetColIdForFork);
    setPrompts(MockDb.getPrompts());
    setCommits(MockDb.getCommits());
    setSelectedPromptId(forked.id);
    setActiveTab('editor');
    setIsForkModalOpen(false);
  };

  const handleSetTag = (tagName: string, commitId: string) => {
    MockDb.setTag(selectedPromptId, commitId, tagName);
    setTags(MockDb.getTags());
  };

  // Mock Streaming Playground Execution
  const handleRunPlayground = () => {
    if (isRunning) return;
    setIsRunning(true);
    setStreamingOutput('');
    setRunStats(null);

    // Substitute variables in the template for a mock processing display
    let processedPrompt = editorText;
    parsedVariables.forEach(v => {
      processedPrompt = processedPrompt.replace(new RegExp(`\\{\\{\\s*${v}\\s*\\}\\}`, 'g'), variables[v] || `[${v}]`);
    });

    const mockOutputResponse = `[Playground Execution Sandbox]
Model Engine: ${modelConfig.provider === 'openai' ? 'OpenAI GPT-4o' : 'Anthropic Claude 3.5 Sonnet'}
Temperature: ${modelConfig.temperature}
Active Settings: MaxTokens=${modelConfig.maxTokens}, TopP=${modelConfig.topP}

---
Response:
Here is a test generation responding to your prompt configurations and inputs:

Given your instruction parameters: "${processedPrompt.substring(0, 100)}...", I will formulate a structured outputs matching your schema requirements.

1. Tone analysis checks out successfully.
2. Compliance parameters and refund verification are enabled.
3. System parameters: 
   - Safety checks: PASSED
   - Token usage optimization: ACTIVE

Testing output streaming complete. Let me know if you would like to commit this configuration version.`;

    const tokens = mockOutputResponse.split(' ');
    let currentWordIndex = 0;
    
    const interval = setInterval(() => {
      if (currentWordIndex < tokens.length) {
        setStreamingOutput(prev => prev + (prev ? ' ' : '') + tokens[currentWordIndex]);
        currentWordIndex++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setRunStats({
          tokens: Math.round(mockOutputResponse.length / 4),
          latency: 280
        });
      }
    }, 45); // fast visual typing simulation
  };

  // Visual Diff View Generator
  const diffLines = useMemo(() => {
    const baseCommit = commits.find(c => c.id === diffBaseCommitId);
    const compareCommit = commits.find(c => c.id === diffCompareCommitId);
    if (!baseCommit || !compareCommit) return [];
    return computeLineDiff(baseCommit.template, compareCommit.template);
  }, [commits, diffBaseCommitId, diffCompareCommitId]);

  // UI Helpers
  const copyToClipboard = (text: string, setFeedback: (msg: string) => void) => {
    navigator.clipboard.writeText(text);
    setFeedback('Copied!');
    setTimeout(() => {
      setFeedback('Copy SDK Code');
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      {/* 1. Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <GitBranch className={styles.brandIcon} size={18} />
            <span>PromptGit</span>
            <span className={styles.betaBadge}>Beta</span>
          </div>
        </div>

        <div className={styles.sidebarScroll}>
          {/* Workspace info */}
          <div className={styles.navItem} style={{ pointerEvents: 'none' }}>
            <Layers size={15} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 500, fontSize: '12px' }}>{currentWorkspaceName}</span>
          </div>

          {/* Controls to trigger Modals */}
          <div className={styles.sectionHeader}>
            <span>Collections</span>
            <button 
              className={styles.sidebarBtn} 
              title="Create Collection"
              onClick={() => setIsColModalOpen(true)}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* List Collections and their Prompts */}
          {collections.map(col => {
            const isExpanded = expandedCollections[col.id];
            const colPrompts = prompts.filter(p => p.collectionId === col.id);
            return (
              <div key={col.id} className={styles.collectionBlock}>
                <div 
                  className={styles.collectionHeader}
                  onClick={() => setExpandedCollections(prev => ({ ...prev, [col.id]: !isExpanded }))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronRight 
                      size={14} 
                      style={{ 
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.15s',
                        color: 'var(--text-muted)'
                      }} 
                    />
                    <Folder size={14} style={{ color: col.isPublic ? 'var(--accent)' : 'var(--text-secondary)' }} />
                    <span>{col.name}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.collectionDetails}>
                    {colPrompts.map(p => {
                      const isActive = p.id === selectedPromptId;
                      return (
                        <div
                          key={p.id}
                          className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                          onClick={() => {
                            setSelectedPromptId(p.id);
                            // default history selection
                            const ph = MockDb.getPromptHistory(p.id);
                            if (ph.length > 0) setSelectedHistoryCommitId(ph[0].id);
                          }}
                        >
                          <FileText size={13} />
                          <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </span>
                          {p.isPublic && <Globe size={10} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      );
                    })}
                    {colPrompts.length === 0 && (
                      <span style={{ padding: '6px 20px', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No prompts yet
                      </span>
                    )}
                    <button 
                      className={styles.navItem} 
                      style={{ background: 'none', border: 'none', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => {
                        setTargetColIdForPrompt(col.id);
                        setIsPromptModalOpen(true);
                      }}
                    >
                      <Plus size={11} />
                      <span>Create Prompt...</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar} />
            <div>
              <div style={{ fontWeight: 500, fontSize: '12px' }}>Alex Mercer</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pro Account</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Layout */}
      {activePrompt ? (
        <main className={styles.workspace}>
          {/* Header Row */}
          <div className={styles.workspaceHeader}>
            <div className={styles.breadcrumbs}>
              <span>{collections.find(c => c.id === activePrompt.collectionId)?.name}</span>
              <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
              <span className={styles.crumbActive}>{activePrompt.name}</span>
              
              {/* Show production/staging tag badges */}
              {activePromptTags.map(t => (
                <span 
                  key={t.id} 
                  className={`${styles.tagBadge} ${t.name === 'production' ? styles.tagProd : styles.tagStaging}`}
                >
                  {t.name}
                </span>
              ))}
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.btn}
                onClick={() => {
                  setTargetColIdForFork(collections[0]?.id || '');
                  setIsForkModalOpen(true);
                }}
              >
                <GitBranch size={14} />
                <span>Fork</span>
              </button>
              <button 
                className={styles.btn}
                onClick={() => setIsCommitModalOpen(true)}
              >
                <GitCommit size={14} />
                <span>Commit</span>
              </button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleRunPlayground}
                disabled={isRunning}
              >
                <Play size={14} />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className={styles.workspaceTabs}>
            <div 
              className={`${styles.tab} ${activeTab === 'editor' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} />
              Editor
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
              onClick={() => {
                setActiveTab('history');
                const ph = MockDb.getPromptHistory(selectedPromptId);
                if (ph.length > 0) setSelectedHistoryCommitId(ph[0].id);
              }}
            >
              <History size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} />
              Version History
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'diff' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('diff')}
            >
              <GitCompare size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} />
              Compare Versions
            </div>
          </div>

          {/* 3. Panel Container depending on Tab Selection */}
          {activeTab === 'editor' && (
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
              <div className={styles.panelContainer}>
                {/* Text Area Prompt Editor */}
                <div className={styles.editorPanel}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.editorLabel}>Prompt Template Instructions</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      Variables will be parsed automatically
                    </span>
                  </div>
                  <textarea
                    className={styles.editorArea}
                    value={editorText}
                    onChange={(e) => setEditorText(e.target.value)}
                    placeholder="Write system instructions here... e.g. You are a helpful assistant. Translate {{text}} to {{language}}."
                  />

                  {/* Variables pills preview */}
                  <div className={styles.variableBanner}>
                    {parsedVariables.map(v => (
                      <span key={v} className={styles.varPill}>
                        <span>{`{{${v}}}`}</span>
                      </span>
                    ))}
                    {parsedVariables.length === 0 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No variables declared in template yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Playground Configuration Right Sidebar */}
                <div className={styles.playgroundPanel}>
                  <div className={styles.editorLabel}>Playground Settings</div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Model Provider</label>
                    <select
                      className={styles.formSelect}
                      value={modelConfig.provider}
                      onChange={(e) => setModelConfig(prev => ({ 
                        ...prev, 
                        provider: e.target.value as 'openai' | 'anthropic',
                        modelName: e.target.value === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20240620'
                      }))}
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Model Name</label>
                    <select
                      className={styles.formSelect}
                      value={modelConfig.modelName}
                      onChange={(e) => setModelConfig(prev => ({ ...prev, modelName: e.target.value }))}
                    >
                      {modelConfig.provider === 'openai' ? (
                        <>
                          <option value="gpt-4o">gpt-4o</option>
                          <option value="gpt-4-turbo">gpt-4-turbo</option>
                          <option value="o1-mini">o1-mini</option>
                        </>
                      ) : (
                        <>
                          <option value="claude-3-5-sonnet-20240620">claude-3-5-sonnet</option>
                          <option value="claude-3-opus-20240229">claude-3-opus</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Temperature</label>
                    <div className={styles.sliderContainer}>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={modelConfig.temperature}
                        onChange={(e) => setModelConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        style={{ flex: 1, accentColor: 'var(--accent)' }}
                      />
                      <span className={styles.sliderValue}>{modelConfig.temperature}</span>
                    </div>
                  </div>

                  <div className={styles.editorLabel} style={{ marginTop: '24px' }}>Input Variables</div>
                  {parsedVariables.map(v => (
                    <div key={v} className={styles.formGroup}>
                      <label className={styles.formLabel} style={{ fontFamily: 'var(--font-mono)' }}>{v}</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={variables[v] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [v]: e.target.value }))}
                        placeholder={`Value for ${v}`}
                      />
                    </div>
                  ))}
                  {parsedVariables.length === 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                      Declare dynamic text slots in the editor template.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Console Drawer */}
              <div className={styles.consoleDrawer}>
                <div className={styles.consoleHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={14} style={{ color: 'var(--accent)' }} />
                    <span>Playground Terminal</span>
                  </div>
                  {runStats && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      Tokens: <span style={{ color: 'var(--text-primary)' }}>{runStats.tokens}</span> | Latency: <span style={{ color: 'var(--text-primary)' }}>{runStats.latency}ms</span>
                    </div>
                  )}
                </div>
                <div className={styles.consoleContent}>
                  {streamingOutput ? (
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{streamingOutput}</pre>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Click "Run" at the top right to execute prompt configurations.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className={styles.historyView}>
              <div className={styles.timeline}>
                {MockDb.getPromptHistory(selectedPromptId).map((commit, idx) => {
                  const isSelected = commit.id === selectedHistoryCommitId;
                  const commitTags = tags.filter(t => t.commitId === commit.id);
                  return (
                    <div key={commit.id} className={styles.timelineItem}>
                      <div className={`${styles.timelineDot} ${isSelected ? styles.timelineDotActive : ''}`} />
                      
                      <div 
                        className={styles.commitCard}
                        style={{ 
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          cursor: 'pointer' 
                        }}
                        onClick={() => setSelectedHistoryCommitId(commit.id)}
                      >
                        <div className={styles.commitCardHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={styles.commitTitle}>{commit.commitMessage}</span>
                            {commitTags.map(t => (
                              <span 
                                key={t.id} 
                                className={`${styles.tagBadge} ${t.name === 'production' ? styles.tagProd : styles.tagStaging}`}
                              >
                                {t.name}
                              </span>
                            ))}
                          </div>
                          <div className={styles.commitMeta}>
                            <span className={styles.commitHash}>{commit.commitHash}</span>
                            <span>{commit.authorName}</span>
                            <span>•</span>
                            <span>{new Date(commit.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div 
                            className="animate-slide-up"
                            style={{ 
                              marginTop: '12px',
                              paddingTop: '12px',
                              borderTop: '1px solid var(--border)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}
                          >
                            <div>
                              <div className={styles.formLabel}>Prompt Instruction Content</div>
                              <pre style={{ 
                                background: 'var(--bg-canvas)', 
                                padding: '12px', 
                                borderRadius: '6px', 
                                fontSize: '13px',
                                fontFamily: 'var(--font-mono)',
                                border: '1px solid var(--border)',
                                whiteSpace: 'pre-wrap'
                              }}>{commit.template}</pre>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              <div>Model: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{commit.modelConfig.modelName}</span></div>
                              <div>Temp: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{commit.modelConfig.temperature}</span></div>
                              <div>Tokens limit: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{commit.modelConfig.maxTokens}</span></div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              <button 
                                className={styles.btn}
                                onClick={() => {
                                  setEditorText(commit.template);
                                  setModelConfig(commit.modelConfig);
                                  setActiveTab('editor');
                                }}
                              >
                                Restore to Editor
                              </button>
                              <button 
                                className={styles.btn}
                                onClick={() => handleSetTag('production', commit.id)}
                              >
                                Promote to Production
                              </button>
                              <button 
                                className={styles.btn}
                                onClick={() => handleSetTag('staging', commit.id)}
                              >
                                Deploy to Staging
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                              <span className={styles.formLabel}>Developer API Endpoint Snippet</span>
                              <div style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--bg-canvas)',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                padding: '6px 12px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12px',
                                justifyContent: 'space-between'
                              }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {`curl -X POST https://api.promptgit.com/v1/prompts/${activePrompt.slug}?hash=${commit.commitHash}`}
                                </span>
                                <button 
                                  onClick={() => copyToClipboard(`curl -X POST https://api.promptgit.com/v1/prompts/${activePrompt.slug}?hash=${commit.commitHash}`, setCopyCodeText)}
                                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '11px' }}
                                >
                                  {copyCodeText === 'Copied!' ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'diff' && (
            <div className={styles.diffView}>
              <div className={styles.diffSelectorRow}>
                <span className={styles.formLabel} style={{ margin: 0 }}>Compare:</span>
                <select
                  className={styles.formSelect}
                  style={{ width: '180px' }}
                  value={diffBaseCommitId}
                  onChange={(e) => setDiffBaseCommitId(e.target.value)}
                >
                  {commits.filter(c => c.promptId === selectedPromptId).map(c => (
                    <option key={c.id} value={c.id}>{c.commitMessage} ({c.commitHash})</option>
                  ))}
                </select>

                <span className={styles.formLabel} style={{ margin: 0 }}>with:</span>
                <select
                  className={styles.formSelect}
                  style={{ width: '180px' }}
                  value={diffCompareCommitId}
                  onChange={(e) => setDiffCompareCommitId(e.target.value)}
                >
                  {commits.filter(c => c.promptId === selectedPromptId).map(c => (
                    <option key={c.id} value={c.id}>{c.commitMessage} ({c.commitHash})</option>
                  ))}
                </select>
              </div>

              {/* Side by side diff grids */}
              <div className={styles.diffGrid}>
                {/* Left side (Old text / Base) */}
                <div className={styles.diffColumn}>
                  <div className={styles.diffColumnHeader}>
                    {commits.find(c => c.id === diffBaseCommitId)?.commitMessage} ({commits.find(c => c.id === diffBaseCommitId)?.commitHash})
                  </div>
                  <div className={styles.diffContent}>
                    {diffLines.map((line, idx) => {
                      if (line.type === 'added') return null; // hide added lines on base side
                      return (
                        <span 
                          key={idx} 
                          className={line.type === 'removed' ? styles.diffLineRemoved : ''}
                        >
                          {line.type === 'removed' ? `- ${line.value}` : `  ${line.value}`}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Right side (New text / Compare) */}
                <div className={styles.diffColumn}>
                  <div className={styles.diffColumnHeader}>
                    {commits.find(c => c.id === diffCompareCommitId)?.commitMessage} ({commits.find(c => c.id === diffCompareCommitId)?.commitHash})
                  </div>
                  <div className={styles.diffContent}>
                    {diffLines.map((line, idx) => {
                      if (line.type === 'removed') return null; // hide removed lines on new side
                      return (
                        <span 
                          key={idx} 
                          className={line.type === 'added' ? styles.diffLineAdded : ''}
                        >
                          {line.type === 'added' ? `+ ${line.value}` : `  ${line.value}`}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className={styles.workspace} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '380px' }}>
            <FileText size={48} style={{ color: 'var(--border-active)', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No Prompt Selected</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
              Create or select a prompt from your workspace collections sidebar to start writing, testing, and versioning.
            </p>
          </div>
        </main>
      )}

      {/* 4. Modals Overlays */}

      {/* Create Collection Modal */}
      {isColModalOpen && (
        <div className={styles.overlay}>
          <form className={styles.modal} onSubmit={handleCreateCollection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={styles.modalTitle}>New Collection</span>
              <button type="button" className={styles.sidebarBtn} onClick={() => setIsColModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Name</label>
              <input
                type="text"
                className={styles.formInput}
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="e.g. Sales Prompts"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <input
                type="text"
                className={styles.formInput}
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                placeholder="Description of this collection..."
              />
            </div>

            <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={newColPublic}
                onChange={(e) => setNewColPublic(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <label className={styles.formLabel} style={{ margin: 0 }}>Make Publicly Shareable</label>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={() => setIsColModalOpen(false)}>Cancel</button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Prompt Modal */}
      {isPromptModalOpen && (
        <div className={styles.overlay}>
          <form className={styles.modal} onSubmit={handleCreatePrompt}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={styles.modalTitle}>New Prompt Template</span>
              <button type="button" className={styles.sidebarBtn} onClick={() => setIsPromptModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Target Collection</label>
              <select
                className={styles.formSelect}
                value={targetColIdForPrompt}
                onChange={(e) => setTargetColIdForPrompt(e.target.value)}
                required
              >
                <option value="">Select Collection...</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Prompt Name</label>
              <input
                type="text"
                className={styles.formInput}
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                placeholder="e.g. Email Summarizer"
                required
              />
            </div>

            <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={newPromptPublic}
                onChange={(e) => setNewPromptPublic(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <label className={styles.formLabel} style={{ margin: 0 }}>Public (Community Feed)</label>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={() => setIsPromptModalOpen(false)}>Cancel</button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Commit Version Modal */}
      {isCommitModalOpen && (
        <div className={styles.overlay}>
          <form className={styles.modal} onSubmit={handleSaveCommit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={styles.modalTitle}>Commit Prompt Changes</span>
              <button type="button" className={styles.sidebarBtn} onClick={() => setIsCommitModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Commit Message</label>
              <input
                type="text"
                className={styles.formInput}
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="e.g. Add safety guidelines & temperature checks"
                required
                autoFocus
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={() => setIsCommitModalOpen(false)}>Cancel</button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Commit Version</button>
            </div>
          </form>
        </div>
      )}

      {/* Fork Prompt Modal */}
      {isForkModalOpen && (
        <div className={styles.overlay}>
          <form className={styles.modal} onSubmit={handleForkPrompt}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={styles.modalTitle}>Fork Prompt</span>
              <button type="button" className={styles.sidebarBtn} onClick={() => setIsForkModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Forking will clone the active prompt configuration & instructions into a new lineage in your selected collection.
            </p>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Target Collection</label>
              <select
                className={styles.formSelect}
                value={targetColIdForFork}
                onChange={(e) => setTargetColIdForFork(e.target.value)}
                required
              >
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btn} onClick={() => setIsForkModalOpen(false)}>Cancel</button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Fork Prompt</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
