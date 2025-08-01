import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Building2, Shield, UserX, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  user_type: string;
  is_active: boolean;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  property_type: string;
  location: string;
  city: string;
  status: string;
  agent_name: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme, isDark, toggleTheme } = useTheme();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
    
    if (error || !data) {
      toast({
        title: "غير مخول",
        description: "ليس لديك صلاحية للوصول إلى لوحة الإدارة",
        variant: "destructive",
      });
      window.location.href = '/';
    }
  };

  const fetchData = async () => {
    try {
      const [profilesResult, propertiesResult, rolesResult] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*').order('created_at', { ascending: false })
      ]);

      if (profilesResult.data) setProfiles(profilesResult.data);
      if (propertiesResult.data) setProperties(propertiesResult.data);
      if (rolesResult.data) setUserRoles(rolesResult.data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          suspended_at: new Date().toISOString(),
          suspended_by: user?.id,
          suspension_reason: reason
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم إيقاف المستخدم",
        description: "تم إيقاف المستخدم بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في إيقاف المستخدم",
        variant: "destructive",
      });
    }
  };

  const reactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          suspended_at: null,
          suspended_by: null,
          suspension_reason: null
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم تفعيل المستخدم",
        description: "تم تفعيل المستخدم بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تفعيل المستخدم",
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: "تم حذف العقار",
        description: "تم حذف العقار بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف العقار",
        variant: "destructive",
      });
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      // First, delete existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as 'user' | 'admin' | 'moderator' });

      if (error) throw error;

      toast({
        title: "تم تغيير الدور",
        description: "تم تغيير دور المستخدم بنجاح",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في تغيير الدور",
        variant: "destructive",
      });
    }
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.phone?.includes(searchTerm) ||
    profile.user_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProperties = properties.filter(property =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.agent_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">لوحة الإدارة</h1>
              <p className="text-muted-foreground">إدارة المستخدمين والعقارات والأدوار</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={toggleTheme}>
                {isDark ? '☀️' : '🌙'} تبديل المظهر
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="secondary">
                العودة للرئيسية
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{profiles.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي العقارات</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{properties.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المستخدمون المعلقون</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {profiles.filter(p => !p.is_active).length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث في المستخدمين والعقارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="properties">إدارة العقارات</TabsTrigger>
            <TabsTrigger value="roles">إدارة الأدوار</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>المستخدمون</CardTitle>
                <CardDescription>
                  إدارة المستخدمين وحالات التعليق
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>نوع المستخدم</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ التسجيل</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.full_name || 'غير محدد'}
                        </TableCell>
                        <TableCell>{profile.phone || 'غير محدد'}</TableCell>
                        <TableCell>{profile.user_type}</TableCell>
                        <TableCell>
                          <Badge variant={profile.is_active ? "default" : "destructive"}>
                            {profile.is_active ? 'نشط' : 'معلق'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {profile.is_active ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setSelectedUser(profile)}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>إيقاف المستخدم</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p>سبب الإيقاف:</p>
                                    <Input
                                      value={suspensionReason}
                                      onChange={(e) => setSuspensionReason(e.target.value)}
                                      placeholder="اكتب سبب الإيقاف..."
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => {
                                          if (selectedUser && suspensionReason) {
                                            suspendUser(selectedUser.user_id, suspensionReason);
                                            setSuspensionReason('');
                                            setSelectedUser(null);
                                          }
                                        }}
                                        variant="destructive"
                                      >
                                        تأكيد الإيقاف
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => reactivateUser(profile.user_id)}
                              >
                                تفعيل
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>العقارات</CardTitle>
                <CardDescription>
                  إدارة العقارات والإعلانات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الموقع</TableHead>
                      <TableHead>الوكيل</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          {property.title}
                        </TableCell>
                        <TableCell>{property.price.toLocaleString()} ر.س</TableCell>
                        <TableCell>{property.property_type}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>{property.agent_name || 'غير محدد'}</TableCell>
                        <TableCell>
                          <Badge variant={property.status === 'active' ? "default" : "secondary"}>
                            {property.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProperty(property.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle>إدارة الأدوار</CardTitle>
                <CardDescription>
                  تغيير أدوار المستخدمين وصلاحياتهم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الدور الحالي</TableHead>
                      <TableHead>تاريخ التعيين</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => {
                      const userRole = userRoles.find(r => r.user_id === profile.user_id);
                      return (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">
                            {profile.full_name || 'غير محدد'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getUserRole(profile.user_id) === 'admin' ? 'مدير' :
                               getUserRole(profile.user_id) === 'moderator' ? 'مشرف' : 'مستخدم'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {userRole ? new Date(userRole.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={getUserRole(profile.user_id)}
                              onValueChange={(newRole) => changeUserRole(profile.user_id, newRole)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">مستخدم</SelectItem>
                                <SelectItem value="moderator">مشرف</SelectItem>
                                <SelectItem value="admin">مدير</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}