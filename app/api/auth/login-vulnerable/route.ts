// DO NOT USE IN PRODUCTION - VULNERABLE EXAMPLE
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Your db connection

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  // WARNING: Vulnerable to SQL Injection
  const query = `SELECT * FROM User WHERE username = '${username}' AND password = '${password}'`;
  const user = await prisma.$queryRawUnsafe(query);

  if (user) {
    // ... login success logic
    return NextResponse.json({ message: 'Login successful (Vulnerable Mode)' });
  }
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}