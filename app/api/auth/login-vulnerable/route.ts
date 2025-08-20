// DO NOT USE IN PRODUCTION - VULNERABLE EXAMPLE
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Your db connection
import { securityLogger } from '@/lib/security-logger';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const userAgent = req.headers.get('user-agent') || 'Unknown';
  const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const ip = rawIp.replace('::ffff:', ''); // Clean IPv6-mapped IPv4 addresses
  
  // Detect potential SQL injection patterns
  const sqlInjectionPatterns = [
    /('|\\')|(;)|(--)|(\|)|(\*)|(%)|(\+)|(\?)|(\[)|(\])|(\{)|(\})|(\()|(\))|(\^)|(\$)/i,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    /(or\s+['"\d]+=['"\d]+)|(and\s+['"\d]+=['"\d]+)/i
  ];
  
  const isSuspiciousPayload = sqlInjectionPatterns.some(pattern => 
    pattern.test(username) || pattern.test(password)
  );
  
  if (isSuspiciousPayload) {
    securityLogger.logSqlInjection(
      `username: ${username}, password: ${password}`,
      '/api/auth/login-vulnerable',
      userAgent,
      ip
    );
  }
  
  // WARNING: Vulnerable to SQL Injection
  const query = `SELECT * FROM User WHERE username = '${username}' AND password = '${password}'`;
  const user = await prisma.$queryRawUnsafe(query) as unknown[];
  console.log(user);

  const success = user && user.length > 0;
  
  // Log all login attempts
  securityLogger.logLoginAttempt(username, success, '/api/auth/login-vulnerable', userAgent, ip);

  if (success) {
    return NextResponse.json({ message: 'Login successful (Vulnerable Mode)' });
  }
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}