import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Your Prisma client instance
import { securityLogger } from '@/lib/security-logger';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const ip = rawIp.replace('::ffff:', ''); // Clean IPv6-mapped IPv4 addresses
  
  // Prisma uses prepared statements, preventing SQLi
  const user = await prisma.user.findFirst({
    where: { username, password },
  });

  const success = !!user;
  
  // Log login attempt
  securityLogger.logLoginAttempt(username, success, '/api/auth/login-secure', userAgent, ip);

  if (user) {
    // Set secure HTTP-only cookie for session management
    const response = NextResponse.json({ message: 'Login successful (Secure Mode)' });
    response.cookies.set('session', 'secure-session-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/'
    });
    return response;
  }
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}