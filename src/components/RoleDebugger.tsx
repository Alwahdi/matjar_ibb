import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RoleDebugger() {
  const { user } = useAuth();
  const { roles, loading, isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin, isAnyAdmin } = useRoles();

  if (!user) return null;

  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm">🐛 Role Debugger</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div><strong>User ID:</strong> {user.id}</div>
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Raw Roles:</strong> {JSON.stringify(roles)}</div>
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant={isAdmin ? "default" : "secondary"}>Admin: {isAdmin ? 'Yes' : 'No'}</Badge>
          <Badge variant={isPropertiesAdmin ? "default" : "secondary"}>Properties: {isPropertiesAdmin ? 'Yes' : 'No'}</Badge>
          <Badge variant={isCategoriesAdmin ? "default" : "secondary"}>Categories: {isCategoriesAdmin ? 'Yes' : 'No'}</Badge>
          <Badge variant={isNotificationsAdmin ? "default" : "secondary"}>Notifications: {isNotificationsAdmin ? 'Yes' : 'No'}</Badge>
          <Badge variant={isAnyAdmin ? "default" : "secondary"}>Any Admin: {isAnyAdmin ? 'Yes' : 'No'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}