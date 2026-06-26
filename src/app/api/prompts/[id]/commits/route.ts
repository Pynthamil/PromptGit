import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commits = await db.commit.findMany({
      where: { promptId: id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(commits);
  } catch (error: any) {
    console.error('Error fetching commits:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { template, modelConfig, commitMessage, parentCommitId } = await request.json();

    if (!template || !commitMessage || !modelConfig) {
      return NextResponse.json({ error: 'Template, commitMessage, and modelConfig are required' }, { status: 400 });
    }

    const hash = Math.random().toString(36).substring(2, 9);

    const commit = await db.commit.create({
      data: {
        promptId: id,
        parentCommitId: parentCommitId || null,
        authorName: 'Alex Mercer',
        commitHash: hash,
        template,
        commitMessage,
        provider: modelConfig.provider,
        modelName: modelConfig.modelName,
        temperature: parseFloat(modelConfig.temperature),
        maxTokens: parseInt(modelConfig.maxTokens),
        topP: parseFloat(modelConfig.topP)
      }
    });

    return NextResponse.json(commit);
  } catch (error: any) {
    console.error('Error creating commit:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
