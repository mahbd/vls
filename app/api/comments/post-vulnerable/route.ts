import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { securityLogger } from '@/lib/security-logger';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const ip = rawIp.replace('::ffff:', ''); // Clean IPv6-mapped IPv4 addresses

    if (!content) {
      return NextResponse.json({ message: 'Comment cannot be empty.' }, { status: 400 });
    }

    // Detect potential XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*onerror/gi,
      /<svg[^>]*onload/gi,
    ];

    const isSuspiciousContent = xssPatterns.some(pattern => pattern.test(content));
    
    if (isSuspiciousContent) {
      securityLogger.logXssAttempt(
        content,
        '/api/comments/post-vulnerable',
        userAgent,
        ip
      );
    }

    // WARNING: Storing raw, unsanitized user input directly in the database.
    const newComment = await prisma.comment.create({
      data: {
        content: content,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 });
  }
}