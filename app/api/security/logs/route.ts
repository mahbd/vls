import { NextRequest, NextResponse } from 'next/server';
import { securityLogger } from '@/lib/security-logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'sql_injection' | 'xss_attempt' | 'login_attempt' | null;
    const minutesParam = searchParams.get('minutes');
    const minutes = minutesParam ? parseInt(minutesParam) : 60;

    // Validate minutes parameter
    if (isNaN(minutes) || minutes < 1 || minutes > 1440) { // Max 24 hours
      return NextResponse.json({ 
        message: 'Invalid minutes parameter. Must be between 1 and 1440.' 
      }, { status: 400 });
    }

    let logs;
    try {
      if (type) {
        logs = securityLogger.getLogs(type);
      } else {
        logs = securityLogger.getRecentLogs(minutes);
      }
    } catch (logError) {
      console.error('Error retrieving logs from security logger:', logError);
      return NextResponse.json({ 
        message: 'Error retrieving security logs',
        logs: [],
        count: 0,
        filters: { type, minutes }
      });
    }

    // Sort by timestamp descending (most recent first)
    logs.sort((a, b) => {
      try {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } catch (sortError) {
        console.error('Error sorting logs by timestamp:', sortError);
        return 0;
      }
    });

    return NextResponse.json({
      logs,
      count: logs.length,
      filters: { type, minutes },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in security logs API:', error);
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
