import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { targetCollectionId } = await request.json();

    if (!targetCollectionId) {
      return NextResponse.json({ error: 'targetCollectionId is required' }, { status: 400 });
    }

    const originalPrompt = await db.prompt.findUnique({
      where: { id }
    });

    if (!originalPrompt) {
      return NextResponse.json({ error: 'Original prompt not found' }, { status: 404 });
    }

    const latestCommit = await db.commit.findFirst({
      where: { promptId: id },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestCommit) {
      return NextResponse.json({ error: 'Original prompt has no commits to fork' }, { status: 400 });
    }

    const forkedName = `${originalPrompt.name} (Fork)`;
    const forkedSlug = forkedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const hash = Math.random().toString(36).substring(2, 9);

    const result = await db.$transaction(async (tx) => {
      const forkedPrompt = await tx.prompt.create({
        data: {
          collectionId: targetCollectionId,
          name: forkedName,
          slug: forkedSlug,
          forkedFromId: id,
          isPublic: false
        }
      });

      const forkedCommit = await tx.commit.create({
        data: {
          promptId: forkedPrompt.id,
          parentCommitId: null,
          authorName: 'Alex Mercer',
          commitHash: hash,
          template: latestCommit.template,
          commitMessage: `Forked from ${originalPrompt.name} (${latestCommit.commitHash})`,
          provider: latestCommit.provider,
          modelName: latestCommit.modelName,
          temperature: latestCommit.temperature,
          maxTokens: latestCommit.maxTokens,
          topP: latestCommit.topP
        }
      });

      return { prompt: forkedPrompt, commit: forkedCommit };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error forking prompt:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
