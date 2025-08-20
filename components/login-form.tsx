'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trackLoginAttempt, trackVulnerabilityDemo } from '@/lib/analytics';

interface LoginFormProps {
  isSecureMode: boolean;
}

export function LoginForm({ isSecureMode }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const endpoint = isSecureMode ? '/api/auth/login-secure' : '/api/auth/login-vulnerable';
      
      // Check if this looks like an SQL injection attempt
      const sqlInjectionPattern = /('|--|union|select|or\s+.+=.+)/i;
      const isSqlInjectionAttempt = sqlInjectionPattern.test(password);
      
      if (isSqlInjectionAttempt && !isSecureMode) {
        trackVulnerabilityDemo('sql_injection', { 
          payload_detected: true,
          mode: 'vulnerable'
        });
      }
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const success = res.status === 200;
      
      // Track login attempt
      trackLoginAttempt(success, isSecureMode);
      
      setMessage(`API Response: ${data.message || 'No message received'}`);
    } catch (error) {
      console.error('Login error:', error);
      trackLoginAttempt(false, isSecureMode);
      setMessage(`Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`);
    }
  };

  const sqlInjectionExample = `' OR '1'='1`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>SQL Injection Demo 💉</CardTitle>
        <CardDescription>
          In vulnerable mode, use the payload{' '}
          <code className="bg-muted p-1 rounded-md text-sm font-mono">{sqlInjectionExample}</code>{' '}
          as the password to bypass the login.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Try the SQLi payload here" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button type="submit">Login</Button>
          {message && <p className="text-sm font-medium text-muted-foreground">{message}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}