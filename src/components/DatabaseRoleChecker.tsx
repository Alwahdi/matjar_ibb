import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { RefreshCw, Database } from 'lucide-react';

export default function DatabaseRoleChecker() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkDatabaseRoles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('Database roles query result:', { data, error });
      setRoles(data || []);
    } catch (error) {
      console.error('Database role check error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-4 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />
          Database Role Checker
        </CardTitle>
        <CardDescription className="text-xs">
          Check actual roles in database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          size="sm"
          onClick={checkDatabaseRoles}
          disabled={loading}
          className="mb-3"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
          Check Database Roles
        </Button>
        {roles.length > 0 ? (
          <div className="text-xs">
            <strong>Database Roles Found:</strong>
            <pre className="mt-1 p-2 bg-background rounded text-xs">
              {JSON.stringify(roles, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {loading ? 'Checking...' : 'No roles checked yet. Click button above.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}