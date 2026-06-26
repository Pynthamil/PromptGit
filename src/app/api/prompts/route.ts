import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { collectionId, name, isPublic } = await request.json();

    if (!collectionId || !name) {
      return NextResponse.json({ error: 'CollectionId and Name are required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const hash = Math.random().toString(36).substring(2, 9);

    // Run creation inside a transaction to ensure both prompt and root commit succeed
    const result = await db.$transaction(async (tx) => {
      const prompt = await tx.prompt.create({
        data: {
          collectionId,
          name,
          slug,
          isPublic: !!isPublic
        }
      });

      const commit = await tx.commit.create({
        data: {
          promptId: prompt.id,
          parentCommitId: null,
          authorName: 'Alex Mercer',
          commitHash: hash,
          template: 'Enter instructions here. Use {{variable_name}} to add dynamic slots.',
          commitMessage: 'Initial Commit',
          provider: 'openai',
          modelName: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 500,
          topP: 1.0
        }
      });

      return { prompt, commit };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
