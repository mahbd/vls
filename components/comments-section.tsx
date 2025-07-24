'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
}

interface CommentsSectionProps {
  isSecureMode: boolean;
}

export function CommentsSection({ isSecureMode }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [key, setKey] = useState(0); // Used to force re-fetch of comments

  // Fetch comments on initial load and whenever a new comment is posted
  useEffect(() => {
    const fetchComments = async () => {
      const res = await fetch('/api/comments');
      const data = await res.json();
      setComments(data);
    };
    fetchComments();
  }, [key]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const endpoint = isSecureMode ? '/api/comments/post-secure' : '/api/comments/post-vulnerable';
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    });
    setNewComment('');
    setKey(prevKey => prevKey + 1); // Trigger re-fetch
  };
  
  const xssExample = `<img src="x" onerror="alert('XSS Attack!')" />`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stored XSS Demo ✍️</CardTitle>
        <CardDescription>
          In vulnerable mode, submit a comment with the payload{' '}
          <code className="bg-muted p-1 rounded-md text-sm font-mono">{xssExample}</code> to trigger an alert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Try the XSS payload here..." />
          <Button type="submit">Post</Button>
        </form>
        <div className="space-y-3 max-h-60 overflow-y-auto p-3 border rounded-md">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="p-2 border-b text-sm">
                {isSecureMode ? (
                  // SECURE: React escapes the content by default, treating it as a plain string.
                  <p>{comment.content}</p>
                ) : (
                  // VULNERABLE: This renders raw HTML from the database, allowing scripts to execute.
                  <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center p-4">No comments yet. Be the first!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}