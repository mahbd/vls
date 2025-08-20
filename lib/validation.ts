/**
 * Input validation utilities for the vulnerability showcase
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: string;
}

/**
 * Validates username input
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  }
  
  if (username.length > 50) {
    errors.push('Username must be less than 50 characters');
  }
  
  // Allow alphanumeric and common special characters for usernames
  const usernamePattern = /^[a-zA-Z0-9_.-]+$/;
  if (username && !usernamePattern.test(username)) {
    errors.push('Username contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: username.trim().toLowerCase()
  };
}

/**
 * Validates password input (basic validation)
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || password.length === 0) {
    errors.push('Password is required');
  }
  
  if (password.length > 100) {
    errors.push('Password must be less than 100 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates comment content
 */
export function validateComment(content: string): ValidationResult {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Comment content is required');
  }
  
  if (content.length > 1000) {
    errors.push('Comment must be less than 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized: content.trim()
  };
}

/**
 * Detects SQL injection patterns in text
 */
export function detectSqlInjection(text: string): {
  isSuspicious: boolean;
  patterns: string[];
} {
  const sqlPatterns = [
    { name: 'quotes', regex: /('|\\')|(;)|(--)/i },
    { name: 'sql_keywords', regex: /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i },
    { name: 'boolean_bypass', regex: /(or\s+['"\d]+\s*=\s*['"\d]+)|(and\s+['"\d]+\s*=\s*['"\d]+)/i },
    { name: 'comment_injection', regex: /(\/\*.*?\*\/)|(--)|(#)/i }
  ];
  
  const detectedPatterns: string[] = [];
  
  for (const pattern of sqlPatterns) {
    if (pattern.regex.test(text)) {
      detectedPatterns.push(pattern.name);
    }
  }
  
  return {
    isSuspicious: detectedPatterns.length > 0,
    patterns: detectedPatterns
  };
}

/**
 * Detects XSS patterns in text
 */
export function detectXss(text: string): {
  isSuspicious: boolean;
  patterns: string[];
} {
  const xssPatterns = [
    { name: 'script_tags', regex: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi },
    { name: 'iframe_tags', regex: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi },
    { name: 'javascript_protocol', regex: /javascript:/gi },
    { name: 'event_handlers', regex: /on\w+\s*=/gi },
    { name: 'img_onerror', regex: /<img[^>]*onerror/gi },
    { name: 'svg_onload', regex: /<svg[^>]*onload/gi },
    { name: 'style_expression', regex: /style\s*=.*expression\s*\(/gi },
    { name: 'vbscript', regex: /vbscript:/gi }
  ];
  
  const detectedPatterns: string[] = [];
  
  for (const pattern of xssPatterns) {
    if (pattern.regex.test(text)) {
      detectedPatterns.push(pattern.name);
    }
  }
  
  return {
    isSuspicious: detectedPatterns.length > 0,
    patterns: detectedPatterns
  };
}

/**
 * Rate limiting check (simple in-memory implementation)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove attempts outside the time window
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  getRemainingAttempts(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    
    return Math.max(0, maxAttempts - validAttempts.length);
  }
}

export const rateLimiter = new RateLimiter();
