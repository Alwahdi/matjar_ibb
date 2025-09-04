import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/useTheme';
import { BarChart3, Users, FolderOpen, Bell, Building2 } from 'lucide-react';
import AdminNotifications from '@/components/admin/AdminNotifications';
import UserManagement from '@/components/admin/UserManagement';
import SectionManagement from '@/components/admin/SectionManagement';
import PropertyManagement from '@/components/admin/PropertyManagement';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin } = useRoles();

  useEffect(() => {
    if (!user) {
      navigate('/landing');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5" dir="rtl">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">إدارة النظام والمستخدمين والأقسام</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">لوحة المعلومات</span>
            </TabsTrigger>
            
            {/* User Management - Admin Only */}
            {isAdmin && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">إدارة المستخدمين</span>
              </TabsTrigger>
            )}
            
            {/* Properties Management - Admin or Properties Admin */}
            {(isAdmin || isPropertiesAdmin) && (
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">إدارة العقارات</span>
              </TabsTrigger>
            )}
            
            {/* Section Management - Admin or Categories Admin */}
            {(isAdmin || isCategoriesAdmin) && (
              <TabsTrigger value="sections" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">إدارة الأقسام</span>
              </TabsTrigger>
            )}
            
            {/* Notifications - Admin or Notifications Admin */}
            {(isAdmin || isNotificationsAdmin) && (
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">الإشعارات</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+10.1% من الشهر الماضي</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العقارات المنشورة</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">456</div>
                  <p className="text-xs text-muted-foreground">+5.2% من الشهر الماضي</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الأقسام النشطة</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 أقسام جديدة</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الإشعارات المرسلة</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">789</div>
                  <p className="text-xs text-muted-foreground">+15.3% من الأسبوع الماضي</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات حسابك</CardTitle>
                  <CardDescription>معلومات الحساب والصلاحيات الحالية</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">المستخدم:</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">الصلاحيات:</span>
                      <div className="flex gap-2">
                        {isAdmin && <Badge>مدير عام</Badge>}
                        {isPropertiesAdmin && <Badge variant="secondary">مدير العقارات</Badge>}
                        {isCategoriesAdmin && <Badge variant="secondary">مدير الأقسام</Badge>}
                        {isNotificationsAdmin && <Badge variant="secondary">مدير الإشعارات</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          {/* Properties Management Tab - Admin or Properties Admin */}
          {(isAdmin || isPropertiesAdmin) && (
            <TabsContent value="properties">
              <PropertyManagement />
            </TabsContent>
          )}

          {/* Section Management Tab - Admin or Categories Admin */}
          {(isAdmin || isCategoriesAdmin) && (
            <TabsContent value="sections">
              <SectionManagement />
            </TabsContent>
          )}

          {/* Notifications Tab - Admin or Notifications Admin */}
          {(isAdmin || isNotificationsAdmin) && (
            <TabsContent value="notifications">
              <AdminNotifications />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}