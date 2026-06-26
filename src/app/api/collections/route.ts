import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Fetch all collections, prompts, commits, and tags in a single relation fetch
    const collections = await db.collection.findMany({
      where: { workspaceId: 'ws-1' },
      include: {
        prompts: {
          include: {
            commits: {
              orderBy: { createdAt: 'desc' }
            },
            tags: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(collections);
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, isPublic } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const collection = await db.collection.create({
      data: {
        workspaceId: 'ws-1',
        name,
        description: description || '',
        isPublic: !!isPublic
      }
    });

    return NextResponse.json(collection);
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
