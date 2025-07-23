import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Bell, Shield, Heart, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HeaderNew from '@/components/HeaderNew';
import { Link } from 'react-router-dom';

export default function AccountSettings() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Profile data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userType, setUserType] = useState('buyer');

  // Redirect unauthenticated users
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || '');
        setUserType(data.user_type || 'buyer');
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل بيانات الملف الشخصي",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl,
          user_type: userType,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الشخصي بنجاح"
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل الخروج بنجاح"
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background font-arabic ${isDark ? 'dark' : ''}`} dir="rtl">
      <HeaderNew isDark={isDark} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button variant="outline" size="sm" className="ml-4">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-arabic">إعدادات الحساب</h1>
              <p className="text-muted-foreground font-arabic">إدارة ملفك الشخصي وتفضيلاتك</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                الملف الشخصي
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                المفضلات
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                الإشعارات
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                الحماية
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">المعلومات الشخصية</CardTitle>
                  <CardDescription className="font-arabic">
                    قم بتحديث معلوماتك الشخصية هنا
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium font-arabic">
                        الاسم الكامل
                      </label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        className="font-arabic"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium font-arabic">
                        رقم الهاتف
                      </label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium font-arabic">
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                      dir="ltr"
                    />
                    <p className="text-xs text-muted-foreground font-arabic">
                      لا يمكن تغيير البريد الإلكتروني
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="userType" className="text-sm font-medium font-arabic">
                      نوع الحساب
                    </label>
                    <select
                      id="userType"
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-arabic"
                    >
                      <option value="buyer">مشتري</option>
                      <option value="seller">بائع</option>
                      <option value="agent">وسيط عقاري</option>
                    </select>
                  </div>

                  <Button onClick={updateProfile} disabled={loading} className="font-arabic">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    حفظ التغييرات
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">العروض المفضلة</CardTitle>
                  <CardDescription className="font-arabic">
                    قائمة العروض التي أضفتها إلى المفضلات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground font-arabic mb-2">
                      لا توجد عروض مفضلة بعد
                    </h3>
                    <p className="text-muted-foreground font-arabic mb-4">
                      ابدأ بإضافة العروض المهمة إلى قائمة المفضلات
                    </p>
                    <Link to="/properties">
                      <Button className="font-arabic">تصفح العروض</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">إعدادات الإشعارات</CardTitle>
                  <CardDescription className="font-arabic">
                    تحكم في الإشعارات التي تريد استقبالها
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium font-arabic">عروض جديدة</h4>
                        <p className="text-sm text-muted-foreground font-arabic">
                          إشعارات عند إضافة عروض جديدة في فئاتك المفضلة
                        </p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium font-arabic">تغيير الأسعار</h4>
                        <p className="text-sm text-muted-foreground font-arabic">
                          إشعارات عند تغيير أسعار العروض المفضلة
                        </p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium font-arabic">رسائل البائعين</h4>
                        <p className="text-sm text-muted-foreground font-arabic">
                          إشعارات عند استقبال رسائل من البائعين
                        </p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="font-arabic">الحماية والأمان</CardTitle>
                  <CardDescription className="font-arabic">
                    إدارة إعدادات الحماية لحسابك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium font-arabic">تغيير كلمة المرور</h4>
                        <p className="text-sm text-muted-foreground font-arabic">
                          آخر تحديث منذ 30 يوماً
                        </p>
                      </div>
                      <Button variant="outline" className="font-arabic">تغيير</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium font-arabic">التحقق المزدوج</h4>
                        <p className="text-sm text-muted-foreground font-arabic">
                          غير مفعل - ننصح بتفعيله لحماية إضافية
                        </p>
                      </div>
                      <Button variant="outline" className="font-arabic">تفعيل</Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <Button 
                      variant="destructive" 
                      onClick={handleSignOut}
                      className="font-arabic"
                    >
                      تسجيل الخروج
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}