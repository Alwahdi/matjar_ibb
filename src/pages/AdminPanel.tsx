import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Users, FolderOpen, Bell, Building2, Shield, Home } from 'lucide-react';
import AdminNotifications from '@/components/admin/AdminNotifications';
import UserManagement from '@/components/admin/UserManagement';
import SectionManagement from '@/components/admin/SectionManagement';
import PropertyManagement from '@/components/admin/PropertyManagement';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin, isPropertiesAdmin, isCategoriesAdmin, isNotificationsAdmin, isAnyAdmin } = useRoles();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 0,
    properties: 0,
    categories: 0,
    notifications: 0
  });

  useEffect(() => {
    if (!user || !isAnyAdmin) {
      navigate('/');
      return;
    }
    
    fetchStats();
  }, [user, isAnyAdmin, navigate]);

  const fetchStats = async () => {
    try {
      const [usersResult, propertiesResult, categoriesResult, notificationsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersResult.count || 0,
        properties: propertiesResult.count || 0,
        categories: categoriesResult.count || 0,
        notifications: notificationsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (!user || !isAnyAdmin) {
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'لوحة المعلومات', icon: BarChart3, show: true },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, show: isAdmin },
    { id: 'properties', label: 'إدارة العقارات', icon: Building2, show: isAdmin || isPropertiesAdmin },
    { id: 'sections', label: 'إدارة الأقسام', icon: FolderOpen, show: isAdmin || isCategoriesAdmin },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, show: isAdmin || isNotificationsAdmin }
  ];

  const visibleTabs = tabs.filter(tab => tab.show);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">مرحباً بك في لوحة الإدارة</h1>
          <p className="text-muted-foreground">إدارة شاملة لجميع جوانب النظام</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          العودة للرئيسية
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-primary">{stats.users.toLocaleString('ar')}</div>
            <p className="text-xs text-muted-foreground mt-1">المستخدمين المسجلين</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">العقارات المنشورة</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-600">{stats.properties.toLocaleString('ar')}</div>
            <p className="text-xs text-muted-foreground mt-1">عقار منشور</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">الأقسام النشطة</CardTitle>
            <FolderOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{stats.categories.toLocaleString('ar')}</div>
            <p className="text-xs text-muted-foreground mt-1">قسم متاح</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الإشعارات</CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">{stats.notifications.toLocaleString('ar')}</div>
            <p className="text-xs text-muted-foreground mt-1">إشعار مُرسل</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            معلومات حسابك الإداري
          </CardTitle>
          <CardDescription>الصلاحيات والمعلومات الشخصية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-sm">البريد الإلكتروني:</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-sm">الصلاحيات:</span>
              <div className="flex flex-wrap gap-1">
                {isAdmin && <Badge className="text-xs">مدير عام</Badge>}
                {isPropertiesAdmin && !isAdmin && <Badge variant="secondary" className="text-xs">مدير العقارات</Badge>}
                {isCategoriesAdmin && !isAdmin && <Badge variant="secondary" className="text-xs">مدير الأقسام</Badge>}
                {isNotificationsAdmin && !isAdmin && <Badge variant="secondary" className="text-xs">مدير الإشعارات</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
          <CardDescription>أهم العمليات الإدارية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {isAdmin && (
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4"
                onClick={() => setActiveTab('users')}
              >
                <Users className="w-4 h-4" />
                <div className="text-right">
                  <div className="font-medium text-sm">إدارة المستخدمين</div>
                  <div className="text-xs text-muted-foreground">تفعيل وتعليق الحسابات</div>
                </div>
              </Button>
            )}
            {(isAdmin || isPropertiesAdmin) && (
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4"
                onClick={() => setActiveTab('properties')}
              >
                <Building2 className="w-4 h-4" />
                <div className="text-right">
                  <div className="font-medium text-sm">إدارة العقارات</div>
                  <div className="text-xs text-muted-foreground">إضافة وتحرير العقارات</div>
                </div>
              </Button>
            )}
            {(isAdmin || isCategoriesAdmin) && (
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4"
                onClick={() => setActiveTab('sections')}
              >
                <FolderOpen className="w-4 h-4" />
                <div className="text-right">
                  <div className="font-medium text-sm">إدارة الأقسام</div>
                  <div className="text-xs text-muted-foreground">تعيين مدراء الأقسام</div>
                </div>
              </Button>
            )}
            {(isAdmin || isNotificationsAdmin) && (
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-3 px-4"
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="w-4 h-4" />
                <div className="text-right">
                  <div className="font-medium text-sm">إرسال الإشعارات</div>
                  <div className="text-xs text-muted-foreground">إشعار المستخدمين</div>
                </div>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return isAdmin ? <UserManagement /> : null;
      case 'properties':
        return (isAdmin || isPropertiesAdmin) ? <PropertyManagement /> : null;
      case 'sections':
        return (isAdmin || isCategoriesAdmin) ? <SectionManagement /> : null;
      case 'notifications':
        return (isAdmin || isNotificationsAdmin) ? <AdminNotifications /> : null;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20" dir="rtl">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center p-4 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="ml-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">لوحة الإدارة</h1>
        </div>
        
        <div className="flex overflow-x-auto pb-2 pt-2 px-4 gap-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className="whitespace-nowrap gap-2 min-w-fit"
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-1 min-h-0 bg-card border-r border-border">
            <div className="flex flex-col flex-1 pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1>
                    <p className="text-sm text-muted-foreground">النظام الإداري</p>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 px-4 space-y-2">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-11"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </Button>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 text-muted-foreground"
                    onClick={() => navigate('/')}
                  >
                    <Home className="w-5 h-5" />
                    العودة للرئيسية
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-4 lg:p-8">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
}