import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear any existing data
  await prisma.tag.deleteMany({});
  await prisma.commit.deleteMany({});
  await prisma.prompt.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.workspace.deleteMany({});

  // Create Workspace
  const ws = await prisma.workspace.create({
    data: {
      id: 'ws-1',
      name: 'Personal Workspace',
    },
  });

  // Create Collections
  const col1 = await prisma.collection.create({
    data: {
      id: 'col-1',
      workspaceId: ws.id,
      name: 'Customer Operations',
      description: 'Prompts for automating customer support, refund validations, and order tracking emails.',
      isPublic: false,
    },
  });

  const col2 = await prisma.collection.create({
    data: {
      id: 'col-2',
      workspaceId: ws.id,
      name: 'Marketing & Copy',
      description: 'Prompts for generating social copy, blog templates, and landing page outlines.',
      isPublic: true,
    },
  });

  // Create Prompts
  const p1 = await prisma.prompt.create({
    data: {
      id: 'p-1',
      collectionId: col1.id,
      name: 'Refund Assister',
      slug: 'refund-assister',
      isPublic: false,
    },
  });

  const p2 = await prisma.prompt.create({
    data: {
      id: 'p-2',
      collectionId: col2.id,
      name: 'Social Media Writer',
      slug: 'social-media-writer',
      isPublic: true,
    },
  });

  // Create Commits
  const c101 = await prisma.commit.create({
    data: {
      id: 'c-101',
      promptId: p1.id,
      parentCommitId: null,
      authorName: 'Alex Mercer',
      commitHash: '8f4c02a',
      template: `You are a helpful customer support agent.
Process the customer's request: {{customer_query}}.
Assess if they are eligible for a refund.
If they are eligible, tell them we will process it.`,
      commitMessage: 'Initial draft of support refund assistant',
      provider: 'openai',
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 500,
      topP: 1.0,
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
    },
  });

  const c102 = await prisma.commit.create({
    data: {
      id: 'c-102',
      promptId: p1.id,
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
      commitMessage: 'Add empathy guidelines, transaction context, and 30-day check',
      provider: 'openai',
      modelName: 'gpt-4o',
      temperature: 0.5,
      maxTokens: 600,
      topP: 0.9,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  });

  const c103 = await prisma.commit.create({
    data: {
      id: 'c-103',
      promptId: p1.id,
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
      commitMessage: 'Re-align tone to warm, adjust model to Claude 3.5 Sonnet, add markdown output instruction',
      provider: 'anthropic',
      modelName: 'claude-3-5-sonnet-20240620',
      temperature: 0.3,
      maxTokens: 800,
      topP: 0.95,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  });

  const c201 = await prisma.commit.create({
    data: {
      id: 'c-201',
      promptId: p2.id,
      parentCommitId: null,
      authorName: 'Sarah Chen',
      commitHash: '2b73d9e',
      template: `Write a Twitter post about {{topic}}. Make it engaging.`,
      commitMessage: 'Initial twitter post helper',
      provider: 'openai',
      modelName: 'gpt-4o',
      temperature: 0.9,
      maxTokens: 200,
      topP: 1.0,
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    },
  });

  // Create Tags
  await prisma.tag.create({
    data: {
      id: 'tag-1',
      promptId: p1.id,
      commitId: c103.id,
      name: 'production',
    },
  });

  await prisma.tag.create({
    data: {
      id: 'tag-2',
      promptId: p1.id,
      commitId: c102.id,
      name: 'staging',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
