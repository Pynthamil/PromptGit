export interface Workspace {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
}

export interface Prompt {
  id: string;
  collectionId: string;
  creatorId: string;
  name: string;
  slug: string;
  forkedFromId: string | null;
  isPublic: boolean;
  createdAt: string;
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic';
  modelName: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface Commit {
  id: string;
  promptId: string;
  parentCommitId: string | null;
  authorName: string;
  commitHash: string;
  template: string;
  modelConfig: ModelConfig;
  commitMessage: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  promptId: string;
  commitId: string;
  name: string; // 'production' | 'staging'
  updatedAt: string;
}

// Initial mock data to ensure the app is visually stunning out of the box
const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    workspaceId: 'ws-1',
    name: 'Customer Operations',
    description: 'Prompts for automating customer support, refund validations, and order tracking emails.',
    isPublic: false,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'col-2',
    workspaceId: 'ws-1',
    name: 'Marketing & Copy',
    description: 'Prompts for generating social copy, blog templates, and landing page outlines.',
    isPublic: true,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_PROMPTS: Prompt[] = [
  {
    id: 'p-1',
    collectionId: 'col-1',
    creatorId: 'user-1',
    name: 'Refund Assister',
    slug: 'refund-assister',
    forkedFromId: null,
    isPublic: false,
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'p-2',
    collectionId: 'col-2',
    creatorId: 'user-1',
    name: 'Social Media Writer',
    slug: 'social-media-writer',
    forkedFromId: null,
    isPublic: true,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_COMMITS: Commit[] = [
  // Prompt 1 Commits (Refund Assister)
  {
    id: 'c-101',
    promptId: 'p-1',
    parentCommitId: null,
    authorName: 'Alex Mercer',
    commitHash: '8f4c02a',
    template: `You are a helpful customer support agent.
Process the customer's request: {{customer_query}}.
Assess if they are eligible for a refund.
If they are eligible, tell them we will process it.`,
    modelConfig: {
      provider: 'openai',
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 500,
      topP: 1,
    },
    commitMessage: 'Initial draft of support refund assistant',
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c-102',
    promptId: 'p-1',
    parentCommitId: 'c-101',
    authorName: 'Alex Mercer',
    commitHash: '9a31f7c',
    template: `You are an empathetic customer support assistant at PromptGit.
Process the customer's request: {{customer_query}}.
Reference their transaction history: {{transaction_history}}.

Guidelines:
- Keep the tone polite, professional, and empathetic.
- Validate if the transaction dates fall within our 30-day refund window.
- If eligible, state that the refund will take 5-10 business days.
- If not eligible, explain why politely.`,
    modelConfig: {
      provider: 'openai',
      modelName: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 600,
      topP: 0.9,
    },
    commitMessage: 'Add empathy guidelines, transaction context, and 30-day check',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c-103',
    promptId: 'p-1',
    parentCommitId: 'c-102',
    authorName: 'Alex Mercer',
    commitHash: 'e7b12d5',
    template: `You are an empathetic, world-class customer support assistant at PromptGit.
Process the customer's query: {{customer_query}}.
Reference transaction history: {{transaction_history}}.

System Instructions:
- Adopt a professional yet warm tone.
- Validate if the transaction falls within our 30-day refund window.
- If eligible, state that the refund will take 5-10 business days.
- If ineligible, politely suggest alternatives (e.g. credit, discounts).
- Never promise immediate payouts. Always maintain compliance policies.

Please reply in markdown.`,
    modelConfig: {
      provider: 'anthropic',
      modelName: 'claude-3-5-sonnet-20240620',
      temperature: 0.3,
      maxTokens: 800,
      topP: 0.95,
    },
    commitMessage: 'Re-align tone to warm, adjust model to Claude 3.5 Sonnet, add markdown output instruction',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },

  // Prompt 2 Commits (Social Media Writer)
  {
    id: 'c-201',
    promptId: 'p-2',
    parentCommitId: null,
    authorName: 'Sarah Chen',
    commitHash: '2b73d9e',
    template: `Write a Twitter post about {{topic}}. Make it engaging.`,
    modelConfig: {
      provider: 'openai',
      modelName: 'gpt-4o',
      temperature: 0.9,
      maxTokens: 200,
      topP: 1,
    },
    commitMessage: 'Initial twitter post helper',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_TAGS: Tag[] = [
  {
    id: 'tag-1',
    promptId: 'p-1',
    commitId: 'c-103',
    name: 'production',
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tag-2',
    promptId: 'p-1',
    commitId: 'c-102',
    name: 'staging',
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
];

export class MockDb {
  private static getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private static setStorageItem<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static getCollections(): Collection[] {
    return this.getStorageItem('pg_collections', INITIAL_COLLECTIONS);
  }

  static saveCollections(cols: Collection[]): void {
    this.setStorageItem('pg_collections', cols);
  }

  static getPrompts(): Prompt[] {
    return this.getStorageItem('pg_prompts', INITIAL_PROMPTS);
  }

  static savePrompts(prompts: Prompt[]): void {
    this.setStorageItem('pg_prompts', prompts);
  }

  static getCommits(): Commit[] {
    return this.getStorageItem('pg_commits', INITIAL_COMMITS);
  }

  static saveCommits(commits: Commit[]): void {
    this.setStorageItem('pg_commits', commits);
  }

  static getTags(): Tag[] {
    return this.getStorageItem('pg_tags', INITIAL_TAGS);
  }

  static saveTags(tags: Tag[]): void {
    this.setStorageItem('pg_tags', tags);
  }

  // API Helpers
  static getPromptHistory(promptId: string): Commit[] {
    return this.getCommits()
      .filter((c) => c.promptId === promptId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getLatestCommit(promptId: string): Commit | null {
    const history = this.getPromptHistory(promptId);
    return history.length > 0 ? history[0] : null;
  }

  static createCollection(name: string, description: string, isPublic: boolean): Collection {
    const cols = this.getCollections();
    const newCol: Collection = {
      id: `col-${Math.random().toString(36).substr(2, 9)}`,
      workspaceId: 'ws-1',
      name,
      description,
      isPublic,
      createdAt: new Date().toISOString(),
    };
    cols.push(newCol);
    this.saveCollections(cols);
    return newCol;
  }

  static createPrompt(collectionId: string, name: string, isPublic: boolean = false): { prompt: Prompt; commit: Commit } {
    const prompts = this.getPrompts();
    const commits = this.getCommits();

    const promptId = `p-${Math.random().toString(36).substr(2, 9)}`;
    const commitId = `c-${Math.random().toString(36).substr(2, 9)}`;
    const hash = Math.random().toString(36).substr(2, 7);

    const newPrompt: Prompt = {
      id: promptId,
      collectionId,
      creatorId: 'user-1',
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      forkedFromId: null,
      isPublic,
      createdAt: new Date().toISOString(),
    };

    const initialCommit: Commit = {
      id: commitId,
      promptId,
      parentCommitId: null,
      authorName: 'Alex Mercer',
      commitHash: hash,
      template: 'Enter instructions here. Use {{variable_name}} to add dynamic slots.',
      modelConfig: {
        provider: 'openai',
        modelName: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 500,
        topP: 1,
      },
      commitMessage: 'Initial Commit',
      createdAt: new Date().toISOString(),
    };

    prompts.push(newPrompt);
    commits.push(initialCommit);

    this.savePrompts(prompts);
    this.saveCommits(commits);

    return { prompt: newPrompt, commit: initialCommit };
  }

  static createCommit(
    promptId: string,
    template: string,
    modelConfig: ModelConfig,
    commitMessage: string,
    parentCommitId: string | null
  ): Commit {
    const commits = this.getCommits();
    const hash = Math.random().toString(36).substr(2, 7);
    const newCommit: Commit = {
      id: `c-${Math.random().toString(36).substr(2, 9)}`,
      promptId,
      parentCommitId,
      authorName: 'Alex Mercer',
      commitHash: hash,
      template,
      modelConfig,
      commitMessage,
      createdAt: new Date().toISOString(),
    };
    commits.push(newCommit);
    this.saveCommits(commits);
    return newCommit;
  }

  static setTag(promptId: string, commitId: string, tagName: string): Tag {
    const tags = this.getTags();
    const existingIndex = tags.findIndex((t) => t.promptId === promptId && t.name === tagName);

    const tagData: Tag = {
      id: existingIndex >= 0 ? tags[existingIndex].id : `tag-${Math.random().toString(36).substr(2, 9)}`,
      promptId,
      commitId,
      name: tagName,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      tags[existingIndex] = tagData;
    } else {
      tags.push(tagData);
    }

    this.saveTags(tags);
    return tagData;
  }

  static forkPrompt(promptId: string, targetCollectionId: string): Prompt {
    const prompts = this.getPrompts();
    const original = prompts.find((p) => p.id === promptId);
    if (!original) throw new Error('Original prompt not found');

    const latestCommit = this.getLatestCommit(promptId);
    const newPromptId = `p-${Math.random().toString(36).substr(2, 9)}`;
    const forkedName = `${original.name} (Fork)`;

    const forkedPrompt: Prompt = {
      id: newPromptId,
      collectionId: targetCollectionId,
      creatorId: 'user-1',
      name: forkedName,
      slug: forkedName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      forkedFromId: promptId,
      isPublic: false,
      createdAt: new Date().toISOString(),
    };

    const newCommit: Commit = {
      id: `c-${Math.random().toString(36).substr(2, 9)}`,
      promptId: newPromptId,
      parentCommitId: null,
      authorName: 'Alex Mercer',
      commitHash: Math.random().toString(36).substr(2, 7),
      template: latestCommit ? latestCommit.template : '',
      modelConfig: latestCommit ? latestCommit.modelConfig : {
        provider: 'openai',
        modelName: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 500,
        topP: 1,
      },
      commitMessage: `Forked from ${original.name} (${latestCommit?.commitHash || 'root'})`,
      createdAt: new Date().toISOString(),
    };

    prompts.push(forkedPrompt);
    this.getCommits().push(newCommit);

    this.savePrompts(prompts);
    this.saveCommits(this.getCommits());

    return forkedPrompt;
  }
}
