interface SecurityEvent {
  timestamp: string;
  type: 'sql_injection' | 'xss_attempt' | 'login_attempt';
  severity: 'low' | 'medium' | 'high';
  details: {
    endpoint: string;
    payload?: string;
    userAgent?: string;
    ip?: string;
    success?: boolean;
  };
}

class SecurityLogger {
  private logs: SecurityEvent[] = [];
  private maxLogs = 1000; // Limit memory usage

  private log(event: SecurityEvent) {
    this.logs.push(event);
    
    // Keep only the most recent logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  logSqlInjection(payload: string, endpoint: string, userAgent?: string, ip?: string) {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      type: 'sql_injection',
      severity: 'high',
      details: {
        endpoint,
        payload,
        userAgent,
        ip,
      }
    };
    
    this.log(event);
    
    // Use structured logging instead of console.warn
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 SQL Injection Attempt:', {
        timestamp: event.timestamp,
        endpoint: event.details.endpoint,
        ip: event.details.ip,
        payloadLength: payload.length
      });
    }
  }

  logXssAttempt(payload: string, endpoint: string, userAgent?: string, ip?: string) {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      type: 'xss_attempt',
      severity: 'high',
      details: {
        endpoint,
        payload,
        userAgent,
        ip,
      }
    };
    
    this.log(event);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 XSS Attempt:', {
        timestamp: event.timestamp,
        endpoint: event.details.endpoint,
        ip: event.details.ip,
        payloadLength: payload.length
      });
    }
  }

  logLoginAttempt(username: string, success: boolean, endpoint: string, userAgent?: string, ip?: string) {
    const event: SecurityEvent = {
      timestamp: new Date().toISOString(),
      type: 'login_attempt',
      severity: success ? 'low' : 'medium',
      details: {
        endpoint,
        payload: username,
        userAgent,
        ip,
        success,
      }
    };
    
    this.log(event);
    
    if (process.env.NODE_ENV === 'development') {
      if (!success) {
        console.warn('🔒 Failed Login Attempt:', {
          timestamp: event.timestamp,
          endpoint: event.details.endpoint,
          username,
          ip: event.details.ip
        });
      } else {
        console.info('✅ Successful Login:', {
          timestamp: event.timestamp,
          endpoint: event.details.endpoint,
          username,
          ip: event.details.ip
        });
      }
    }
  }

  getLogs(type?: SecurityEvent['type']): SecurityEvent[] {
    if (type) {
      return this.logs.filter(log => log.type === type);
    }
    return this.logs;
  }

  getRecentLogs(minutes: number = 60): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.logs.filter(log => new Date(log.timestamp) > cutoff);
  }
}

export const securityLogger = new SecurityLogger();
export type { SecurityEvent };
