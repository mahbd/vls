import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ message: 'Comment cannot be empty.' }, { status: 400 });
    }

    // WARNING: Storing raw, unsanitized user input directly in the database.
    const newComment = await prisma.comment.create({
      data: {
        content: content,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}