'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/login-form';
import { CommentsSection } from '@/components/comments-section';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function HomePage() {
  const [isSecureMode, setIsSecureMode] = useState(false);

  return (
    <main className="container mx-auto p-4 md:p-8 bg-background text-foreground min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Web Vulnerability Showcase</h1>
        <p className="text-muted-foreground">
          Explore SQL Injection and Stored XSS in a hands-on environment.
        </p>
      </header>

      <div className="flex items-center justify-center space-x-3 mb-10">
        <Label htmlFor="security-mode" className="text-lg font-medium text-red-500">
          Vulnerable Mode
        </Label>
        <Switch
          id="security-mode"
          checked={isSecureMode}
          onCheckedChange={setIsSecureMode}
        />
        <Label htmlFor="security-mode" className="text-lg font-medium text-green-500">
          Secure Mode
        </Label>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <LoginForm isSecureMode={isSecureMode} />
        <CommentsSection isSecureMode={isSecureMode} />
      </div>
    </main>
  );
}