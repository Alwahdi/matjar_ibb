import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, UserX, UserCheck, Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchUserRoles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات المستخدمين",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) throw error;
      setUserRoles(data as UserRole[] || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          suspended_at: new Date().toISOString(),
          suspension_reason: reason,
          suspended_by: user?.id
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم تعليق المستخدم",
        description: "تم تعليق المستخدم بنجاح"
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تعليق المستخدم",
        variant: "destructive"
      });
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          suspended_at: null,
          suspension_reason: null,
          suspended_by: null
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم تفعيل المستخدم",
        description: "تم تفعيل المستخدم بنجاح"
      });

      fetchProfiles();
    } catch (error) {
      console.error('Error activating user:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تفعيل المستخدم",
        variant: "destructive"
      });
    }
  };

  const assignRole = async (userId: string, role: string) => {
    try {
      // Check if role already exists
      const existingRole = userRoles.find(ur => ur.user_id === userId && ur.role === role);
      if (existingRole) {
        toast({
          title: "تحذير",
          description: "هذا الدور مُعيّن بالفعل للمستخدم",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any
        });

      if (error) throw error;

      toast({
        title: "تم تعيين الدور",
        description: "تم تعيين الدور بنجاح"
      });

      fetchUserRoles();
      setRoleDialogOpen(false);
      setSelectedRole('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تعيين الدور",
        variant: "destructive"
      });
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "تم حذف الدور",
        description: "تم حذف الدور بنجاح"
      });

      fetchUserRoles();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حذف الدور",
        variant: "destructive"
      });
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(role => role.user_id === userId);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'admin': 'مدير عام',
      'properties_admin': 'مدير العقارات',
      'categories_admin': 'مدير الأقسام',
      'notifications_admin': 'مدير الإشعارات',
      'moderator': 'مشرف',
      'user': 'مستخدم'
    };
    return roleLabels[role] || role;
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            إدارة المستخدمين
          </CardTitle>
          <CardDescription>
            إدارة المستخدمين وتعيين الأدوار وحالة التفعيل
          </CardDescription>
        </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="البحث في المستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>نوع المستخدم</TableHead>
                <TableHead>الأدوار</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const roles = getUserRoles(profile.user_id);
                return (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.full_name}</TableCell>
                    <TableCell>{profile.phone || 'غير محدد'}</TableCell>
                    <TableCell>{profile.user_type}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {roles.map((role) => (
                          <Badge
                            key={role.id}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeRole(role.id)}
                            title="اضغط لحذف الدور"
                          >
                            {getRoleLabel(role.role)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.is_active ? "default" : "destructive"}>
                        {profile.is_active ? "نشط" : "معلق"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {profile.is_active ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedUser(profile)}
                              >
                                <UserX className="w-4 h-4" />
                                تعليق
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تعليق المستخدم</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من تعليق هذا المستخدم؟ لن يتمكن من الوصول للتطبيق.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="space-y-4 my-4">
                                <Label htmlFor="reason">سبب التعليق</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="اكتب سبب تعليق المستخدم..."
                                  value={suspensionReason}
                                  onChange={(e) => setSuspensionReason(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    if (selectedUser && suspensionReason.trim()) {
                                      suspendUser(selectedUser.user_id, suspensionReason);
                                      setSuspensionReason('');
                                      setSelectedUser(null);
                                    }
                                  }}
                                >
                                  تعليق
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => activateUser(profile.user_id)}
                          >
                            <UserCheck className="w-4 h-4" />
                            تفعيل
                          </Button>
                        )}

                        <Dialog open={roleDialogOpen && selectedUser?.id === profile.id} onOpenChange={setRoleDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(profile);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Shield className="w-4 h-4" />
                              تعيين دور
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>تعيين دور للمستخدم: {profile.full_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Label htmlFor="role-select">اختر الدور</Label>
                              <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر دور..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">مدير عام</SelectItem>
                                  <SelectItem value="properties_admin">مدير العقارات</SelectItem>
                                  <SelectItem value="categories_admin">مدير الأقسام</SelectItem>
                                  <SelectItem value="notifications_admin">مدير الإشعارات</SelectItem>
                                  <SelectItem value="moderator">مشرف</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => {
                                  if (selectedRole && selectedUser) {
                                    assignRole(selectedUser.user_id, selectedRole);
                                  }
                                }}
                                disabled={!selectedRole}
                                className="w-full"
                              >
                                تعيين الدور
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}