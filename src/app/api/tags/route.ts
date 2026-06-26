import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { promptId, commitId, name } = await request.json();

    if (!promptId || !commitId || !name) {
      return NextResponse.json({ error: 'promptId, commitId, and name are required' }, { status: 400 });
    }

    const existingTag = await db.tag.findFirst({
      where: { promptId, name }
    });

    let tag;

    if (existingTag) {
      tag = await db.tag.update({
        where: { id: existingTag.id },
        data: { commitId }
      });
    } else {
      tag = await db.tag.create({
        data: {
          promptId,
          commitId,
          name
        }
      });
    }

    return NextResponse.json(tag);
  } catch (error: any) {
    console.error('Error setting tag:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
export async function GET() {
  try {
    const tags = await db.tag.findMany();
    return NextResponse.json(tags);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
