import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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
import { Users, Building2, Shield, UserX, Plus, Edit, Trash2, Search, Settings, BarChart3, Activity, TrendingUp, RefreshCw } from 'lucide-react';
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
  suspended_by: string | null;
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
  agent_id: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

interface Category {
  id: string;
  parent_id?: string | null;
  title: string;
  subtitle?: string | null;
  slug: string;
  description?: string | null;
  icon?: string | null;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CategoryRole {
  id: string;
  user_id: string;
  category_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  // Categories & per-category roles
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryRoles, setCategoryRoles] = useState<CategoryRole[]>([]);

  // Forms
  const [newCategory, setNewCategory] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    status: 'active'
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [assignCategoryId, setAssignCategoryId] = useState<string>('');
  const [assignRole, setAssignRole] = useState<'moderator' | 'admin'>('moderator');

  // Check admin access first
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        setAdminCheckLoading(true);
        const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
        
        if (error) {
          console.error('Admin check error:', error);
          toast({
            title: "خطأ في التحقق من الصلاحيات",
            description: "حدث خطأ في التحقق من صلاحيات الإدارة",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        if (!data) {
          toast({
            title: "غير مخول",
            description: "ليس لديك صلاحية للوصول إلى لوحة الإدارة",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        await fetchData();
      } catch (error) {
        console.error('Admin access check failed:', error);
        toast({
          title: "خطأ",
          description: "فشل في التحقق من صلاحيات الإدارة",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setAdminCheckLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate, toast]);

  const fetchData = async () => {
    if (!isAdmin && !adminCheckLoading) return;
    
    try {
      setLoading(true);
      
      const [profilesResult, propertiesResult, rolesResult, categoriesResult, categoryRolesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_roles')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('order_index', { ascending: true }),
        supabase
          .from('category_roles')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (profilesResult.error) {
        console.error('Profiles fetch error:', profilesResult.error);
        toast({
          title: "خطأ في تحميل المستخدمين",
          description: profilesResult.error.message,
          variant: "destructive",
        });
      } else {
        setProfiles(profilesResult.data || []);
      }

      if (propertiesResult.error) {
        console.error('Properties fetch error:', propertiesResult.error);
        toast({
          title: "خطأ في تحميل العقارات",
          description: propertiesResult.error.message,
          variant: "destructive",
        });
      } else {
        setProperties(propertiesResult.data || []);
      }

      if (rolesResult.error) {
        console.error('Roles fetch error:', rolesResult.error);
        toast({
          title: "خطأ في تحميل الأدوار",
          description: rolesResult.error.message,
          variant: "destructive",
        });
      } else {
        setUserRoles(rolesResult.data || []);
      }

      if (categoriesResult.error) {
        console.error('Categories fetch error:', categoriesResult.error);
        toast({
          title: 'خطأ في تحميل الأقسام',
          description: categoriesResult.error.message,
          variant: 'destructive',
        });
      } else {
        setCategories(categoriesResult.data as Category[] || []);
      }

      if (categoryRolesResult.error) {
        console.error('Category roles fetch error:', categoryRolesResult.error);
        toast({
          title: 'خطأ في تحميل مشرفي الأقسام',
          description: categoryRolesResult.error.message,
          variant: 'destructive',
        });
      } else {
        setCategoryRoles(categoryRolesResult.data as CategoryRole[] || []);
      }

    } catch (error) {
      console.error('Data fetch error:', error);
      toast({
        title: "خطأ عام",
        description: "حدث خطأ في تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال سبب الإيقاف",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          suspended_at: new Date().toISOString(),
          suspended_by: user?.id,
          suspension_reason: reason.trim()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Suspend user error:', error);
        toast({
          title: "خطأ",
          description: `حدث خطأ في إيقاف المستخدم: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم إيقاف المستخدم",
        description: "تم إيقاف المستخدم بنجاح",
      });
      
      await fetchData();
    } catch (error) {
      console.error('Suspend user error:', error);
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

      if (error) {
        console.error('Reactivate user error:', error);
        toast({
          title: "خطأ",
          description: `حدث خطأ في تفعيل المستخدم: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم تفعيل المستخدم",
        description: "تم تفعيل المستخدم بنجاح",
      });
      
      await fetchData();
    } catch (error) {
      console.error('Reactivate user error:', error);
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

      if (error) {
        console.error('Delete property error:', error);
        toast({
          title: "خطأ",
          description: `حدث خطأ في حذف العقار: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم حذف العقار",
        description: "تم حذف العقار بنجاح",
      });
      
      await fetchData();
    } catch (error) {
      console.error('Delete property error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف العقار",
        variant: "destructive",
      });
    }
  };

  const changeUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      // First, delete existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) {
        console.error('Change role error:', error);
        toast({
          title: "خطأ",
          description: `حدث خطأ في تغيير الدور: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم تغيير الدور",
        description: "تم تغيير دور المستخدم بنجاح",
      });
      
      await fetchData();
    } catch (error) {
      console.error('Change role error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تغيير الدور",
        variant: "destructive",
      });
    }
  };

  // Categories CRUD
  const addCategory = async () => {
    if (!newCategory.title.trim() || !newCategory.slug.trim()) {
      toast({ title: 'بيانات ناقصة', description: 'العنوان والمعرّف (slug) مطلوبان', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('categories').insert({
      title: newCategory.title.trim(),
      slug: newCategory.slug.trim(),
      subtitle: newCategory.subtitle?.trim() || null,
      description: newCategory.description?.trim() || null,
      status: newCategory.status,
    });
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم', description: 'تمت إضافة القسم بنجاح' });
    setNewCategory({ title: '', slug: '', subtitle: '', description: '', status: 'active' });
    fetchData();
  };

  const updateCategoryDetails = async () => {
    if (!selectedCategory) return;
    const { error } = await supabase
      .from('categories')
      .update({
        title: selectedCategory.title,
        subtitle: selectedCategory.subtitle,
        description: selectedCategory.description,
        status: selectedCategory.status,
      })
      .eq('id', selectedCategory.id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم', description: 'تم تحديث القسم' });
    setSelectedCategory(null);
    fetchData();
  };

  const deleteCategoryById = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    toast({ title: 'تم', description: 'تم حذف القسم' });
    fetchData();
  };

  // Category roles
  const assignCategoryModerator = async () => {
    if (!assignUserId || !assignCategoryId) {
      toast({ title: 'بيانات ناقصة', description: 'اختر المستخدم والقسم', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('category_roles')
      .upsert({ user_id: assignUserId, category_id: assignCategoryId, role: assignRole }, { onConflict: 'user_id,category_id' });
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'تم', description: 'تم تعيين المشرف للقسم' });
    setAssignUserId('');
    setAssignCategoryId('');
    setAssignRole('moderator');
    fetchData();
  };

  const removeCategoryRole = async (id: string) => {
    const { error } = await supabase.from('category_roles').delete().eq('id', id);
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    toast({ title: 'تم', description: 'تم إلغاء تعيين المشرف' });
    fetchData();
  };

  const getUserRole = (userId: string): 'admin' | 'moderator' | 'user' => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'moderator': return 'مشرف';
      case 'user': return 'مستخدم';
      default: return 'مستخدم';
    }
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

  // Loading state for admin check
  if (adminCheckLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Loading state for data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل لوحة الإدارة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-display">
                🛡️ لوحة الإدارة المتقدمة
              </h1>
              <p className="text-muted-foreground text-lg">
                إدارة شاملة للمستخدمين والعقارات والأدوار في متجر أب الشامل
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={toggleTheme}
                className="gap-2"
              >
                {isDark ? '☀️' : '🌙'} تبديل المظهر
              </Button>
              <Button 
                onClick={() => fetchData()} 
                variant="secondary"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث البيانات
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="default"
                className="gap-2"
              >
                الصفحة الرئيسية
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-card shadow-elegant border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">{profiles.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{profiles.filter(p => {
                    const createdAt = new Date(p.created_at);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return createdAt > weekAgo;
                  }).length} هذا الأسبوع
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-elegant border-l-4 border-l-secondary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي العقارات</CardTitle>
                <Building2 className="h-5 w-5 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary mb-1">{properties.length}</div>
                <p className="text-xs text-muted-foreground">
                  {properties.filter(p => p.status === 'active').length} نشط
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-elegant border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المستخدمون المعلقون</CardTitle>
                <UserX className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive mb-1">
                  {profiles.filter(p => !p.is_active).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  من إجمالي {profiles.length} مستخدم
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-elegant border-l-4 border-l-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المديرون</CardTitle>
                <Shield className="h-5 w-5 text-accent-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent-foreground mb-1">
                  {userRoles.filter(r => r.role === 'admin').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userRoles.filter(r => r.role === 'moderator').length} مشرف
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="البحث في المستخدمين والعقارات والأدوار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg border-2 focus:border-primary"
            />
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="users" className="gap-2 text-base">
              <Users className="h-4 w-4" />
              إدارة المستخدمين
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2 text-base">
              <Building2 className="h-4 w-4" />
              إدارة العقارات
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2 text-base">
              <Shield className="h-4 w-4" />
              إدارة الأدوار
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 text-base">
              <Settings className="h-4 w-4" />
              إدارة الأقسام
            </TabsTrigger>
            <TabsTrigger value="categoryRoles" className="gap-2 text-base">
              <Activity className="h-4 w-4" />
              مشرفو الأقسام
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">المستخدمون المسجلون</CardTitle>
                <CardDescription>
                  إدارة المستخدمين وحالات التعليق - إجمالي {filteredProfiles.length} مستخدم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم الكامل</TableHead>
                        <TableHead className="text-right">الهاتف</TableHead>
                        <TableHead className="text-right">نوع المستخدم</TableHead>
                        <TableHead className="text-right">الدور</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">تاريخ التسجيل</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => (
                        <TableRow key={profile.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {profile.full_name || 'غير محدد'}
                          </TableCell>
                          <TableCell>{profile.phone || 'غير محدد'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {profile.user_type || 'مستخدم'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {getRoleDisplayName(getUserRole(profile.user_id))}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={profile.is_active ? "default" : "destructive"}>
                              {profile.is_active ? 'نشط' : 'معلق'}
                            </Badge>
                            {!profile.is_active && profile.suspension_reason && (
                              <p className="text-xs text-muted-foreground mt-1">
                                السبب: {profile.suspension_reason}
                              </p>
                            )}
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
                                      className="gap-1"
                                    >
                                      <UserX className="h-4 w-4" />
                                      إيقاف
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>إيقاف المستخدم: {profile.full_name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">سبب الإيقاف:</label>
                                        <Input
                                          value={suspensionReason}
                                          onChange={(e) => setSuspensionReason(e.target.value)}
                                          placeholder="اكتب سبب الإيقاف..."
                                          className="mt-2"
                                        />
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                        <Button
                                          onClick={() => {
                                            if (selectedUser && suspensionReason) {
                                              suspendUser(selectedUser.user_id, suspensionReason);
                                              setSuspensionReason('');
                                              setSelectedUser(null);
                                            }
                                          }}
                                          variant="destructive"
                                          disabled={!suspensionReason.trim()}
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
                                  className="gap-1"
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">العقارات المدرجة</CardTitle>
                <CardDescription>
                  إدارة العقارات والإعلانات - إجمالي {filteredProperties.length} عقار
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">الموقع</TableHead>
                        <TableHead className="text-right">الوكيل</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">تاريخ الإضافة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow key={property.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium max-w-xs">
                            <div className="truncate" title={property.title}>
                              {property.title}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            {property.price.toLocaleString()} ر.س
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {property.property_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{property.location}, {property.city}</TableCell>
                          <TableCell>{property.agent_name || 'غير محدد'}</TableCell>
                          <TableCell>
                            <Badge variant={property.status === 'active' ? "default" : "secondary"}>
                              {property.status === 'active' ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(property.created_at).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-1">
                                  <Trash2 className="h-4 w-4" />
                                  حذف
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد حذف العقار</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف العقار "{property.title}"؟ 
                                    لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المتعلقة بهذا العقار.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteProperty(property.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    تأكيد الحذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">إدارة الأدوار والصلاحيات</CardTitle>
                <CardDescription>
                  تغيير أدوار المستخدمين وصلاحياتهم في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المستخدم</TableHead>
                        <TableHead className="text-right">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">الدور الحالي</TableHead>
                        <TableHead className="text-right">تاريخ التعيين</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">تغيير الدور</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => {
                        const userRole = userRoles.find(r => r.user_id === profile.user_id);
                        const currentRole = getUserRole(profile.user_id);
                        return (
                          <TableRow key={profile.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              {profile.full_name || 'غير محدد'}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {profile.user_id}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  currentRole === 'admin' ? 'default' : 
                                  currentRole === 'moderator' ? 'secondary' : 'outline'
                                }
                              >
                                {getRoleDisplayName(currentRole)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {userRole ? new Date(userRole.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={profile.is_active ? "default" : "destructive"}>
                                {profile.is_active ? 'نشط' : 'معلق'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={currentRole}
                                onValueChange={(newRole: 'admin' | 'moderator' | 'user') => 
                                  changeUserRole(profile.user_id, newRole)
                                }
                                disabled={!profile.is_active}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">إدارة الأقسام</CardTitle>
                <CardDescription>إضافة وتعديل وحذف الأقسام الظاهرة في التطبيق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New category form */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <Input placeholder="عنوان القسم" value={newCategory.title} onChange={(e) => setNewCategory(c => ({...c, title: e.target.value}))} />
                  <Input placeholder="المعرّف (slug) بالإنجليزية" value={newCategory.slug} onChange={(e) => setNewCategory(c => ({...c, slug: e.target.value}))} />
                  <Input placeholder="وصف قصير" value={newCategory.subtitle} onChange={(e) => setNewCategory(c => ({...c, subtitle: e.target.value}))} />
                  <Input placeholder="وصف موسّع (اختياري)" value={newCategory.description} onChange={(e) => setNewCategory(c => ({...c, description: e.target.value}))} />
                  <Select value={newCategory.status} onValueChange={(v) => setNewCategory(c => ({...c, status: v as 'active' | 'hidden'} as any))}>
                    <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="hidden">مخفي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2" onClick={addCategory}><Plus className="h-4 w-4"/>إضافة قسم</Button>
                </div>

                {/* Categories table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">المعرّف</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الترتيب</TableHead>
                        <TableHead className="text-right">تاريخ الإضافة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => (
                        <TableRow key={cat.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{cat.title}</TableCell>
                          <TableCell>{cat.slug}</TableCell>
                          <TableCell>
                            <Badge variant={cat.status === 'active' ? 'default' : 'secondary'}>
                              {cat.status === 'active' ? 'نشط' : 'مخفي'}
                            </Badge>
                          </TableCell>
                          <TableCell>{cat.order_index}</TableCell>
                          <TableCell>{new Date(cat.created_at).toLocaleDateString('ar-SA')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelectedCategory(cat)}>
                                    <Edit className="h-4 w-4"/> تعديل
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>تعديل القسم</DialogTitle>
                                  </DialogHeader>
                                  {selectedCategory && selectedCategory.id === cat.id && (
                                    <div className="space-y-3">
                                      <Input value={selectedCategory.title} onChange={(e) => setSelectedCategory({ ...selectedCategory, title: e.target.value })} placeholder="العنوان"/>
                                      <Input value={selectedCategory.subtitle || ''} onChange={(e) => setSelectedCategory({ ...selectedCategory, subtitle: e.target.value })} placeholder="الوصف القصير"/>
                                      <Input value={selectedCategory.description || ''} onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })} placeholder="الوصف"/>
                                      <Select value={selectedCategory.status} onValueChange={(v) => setSelectedCategory({ ...selectedCategory, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">نشط</SelectItem>
                                          <SelectItem value="hidden">مخفي</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <div className="flex justify-end">
                                        <Button onClick={updateCategoryDetails}>حفظ</Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="gap-1">
                                    <Trash2 className="h-4 w-4"/> حذف
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد حذف القسم</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      سيؤثر حذف القسم على الصلاحيات المرتبطة به. هل تريد المتابعة؟
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteCategoryById(cat.id)}>
                                      تأكيد الحذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Roles Tab */}
          <TabsContent value="categoryRoles">
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl">تعيين مشرفين للأقسام</CardTitle>
                <CardDescription>اختر مستخدمًا وقسمًا وحدد دوره</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Select value={assignUserId} onValueChange={setAssignUserId}>
                    <SelectTrigger><SelectValue placeholder="اختر مستخدمًا" /></SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.user_id} value={p.user_id}>{p.full_name || p.user_id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={assignCategoryId} onValueChange={setAssignCategoryId}>
                    <SelectTrigger><SelectValue placeholder="اختر قسمًا" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={assignRole} onValueChange={(v) => setAssignRole(v as 'moderator' | 'admin')}>
                    <SelectTrigger><SelectValue placeholder="الدور" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moderator">مشرف</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="gap-2" onClick={assignCategoryModerator}><Plus className="h-4 w-4"/>تعيين</Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المستخدم</TableHead>
                        <TableHead className="text-right">القسم</TableHead>
                        <TableHead className="text-right">الدور</TableHead>
                        <TableHead className="text-right">تاريخ التعيين</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryRoles.map(cr => {
                        const profile = profiles.find(p => p.user_id === cr.user_id);
                        const category = categories.find(c => c.id === cr.category_id);
                        return (
                          <TableRow key={cr.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{profile?.full_name || cr.user_id}</TableCell>
                            <TableCell>{category?.title || cr.category_id}</TableCell>
                            <TableCell>
                              <Badge variant={cr.role === 'admin' ? 'default' : 'secondary'}>
                                {getRoleDisplayName(cr.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(cr.created_at).toLocaleDateString('ar-SA')}</TableCell>
                            <TableCell>
                              <Button variant="destructive" size="sm" className="gap-1" onClick={() => removeCategoryRole(cr.id)}>
                                <Trash2 className="h-4 w-4"/> حذف
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}