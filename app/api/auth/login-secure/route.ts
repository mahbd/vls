import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Your Prisma client instance

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  // Prisma uses prepared statements, preventing SQLi
  const user = await prisma.user.findFirst({
    where: { username, password },
  });

  if (user) {
    // ... login success logic
    return NextResponse.json({ message: 'Login successful (Secure Mode)' });
  }
  return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
}