'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface SecurityLogs {
  logs: SecurityEvent[];
  count: number;
  filters: {
    type: string | null;
    minutes: number;
  };
}

export function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLogs | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchLogs = async (type?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type && type !== 'all') {
        params.append('type', type);
      }
      params.append('minutes', '60'); // Last hour
      
      const response = await fetch(`/api/security/logs?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Server error occurred');
      }
      
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
      // Set empty logs state to show error message to user
      setLogs({
        logs: [],
        count: 0,
        filters: { type: type || null, minutes: 60 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(filter);
  }, [filter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sql_injection': return 'SQL Injection';
      case 'xss_attempt': return 'XSS Attempt';
      case 'login_attempt': return 'Login Attempt';
      default: return type;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Security Event Dashboard 🛡️</CardTitle>
        <CardDescription>
          Real-time monitoring of security events for educational analysis
        </CardDescription>
        <div className="flex gap-2 flex-wrap">
          {['all', 'sql_injection', 'xss_attempt', 'login_attempt'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
            >
              {filterType === 'all' ? 'All Events' : getTypeLabel(filterType)}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(filter)}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {logs ? (
          <div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {logs.count} events from the last hour
              </p>
            </div>
            
            {logs.logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No security events detected. Try performing some vulnerability tests!
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.logs.map((event, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {getTypeLabel(event.type)}
                        </Badge>
                        <Badge variant="outline">
                          {event.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <p><strong>Endpoint:</strong> {event.details.endpoint}</p>
                      {event.details.payload && (
                        <p><strong>Payload:</strong> 
                          <code className="ml-1 bg-muted px-1 rounded text-xs">
                            {event.details.payload.length > 100 
                              ? `${event.details.payload.substring(0, 100)}...` 
                              : event.details.payload}
                          </code>
                        </p>
                      )}
                      {event.details.success !== undefined && (
                        <p><strong>Success:</strong> 
                          <span className={event.details.success ? 'text-red-500' : 'text-green-500'}>
                            {event.details.success ? 'Yes (Vulnerable!)' : 'No (Blocked)'}
                          </span>
                        </p>
                      )}
                      {event.details.ip && (
                        <p><strong>IP:</strong> {event.details.ip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading security events...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
