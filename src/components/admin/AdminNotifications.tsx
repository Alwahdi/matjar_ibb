import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSender, NotificationType } from '@/hooks/useNotificationSender';
import { supabase } from '@/integrations/supabase/client';

interface Profile { user_id: string; full_name: string | null }

export default function AdminNotifications() {
  const { toast } = useToast();
  const { sending, sendToUsers, sendToAll, suggest } = useNotificationSender();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('user_id, full_name').order('created_at', { ascending: false });
      setProfiles((data as any) || []);
    })();
  }, []);

  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const onSuggest = () => {
    const s = suggest('العرض', 'إضافة');
    setTitle(s.title);
    setMessage(s.message);
  };

  const submitAll = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'تنبيه', description: 'العنوان والمحتوى مطلوبان', variant: 'destructive' });
      return;
    }
    const res = await sendToAll(title.trim(), message.trim(), type);
    if ((res as any).error) return toast({ title: 'خطأ', description: (res as any).error, variant: 'destructive' });
    toast({ title: 'تم الإرسال', description: 'تم إرسال الإشعار لجميع المستخدمين' });
    setTitle(''); setMessage('');
  };

  const submitSelected = async () => {
    if (!selected.length) return toast({ title: 'لا يوجد مستلمون', description: 'اختر مستخدمين لإرسال الإشعار', variant: 'destructive' });
    if (!title.trim() || !message.trim()) return toast({ title: 'تنبيه', description: 'العنوان والمحتوى مطلوبان', variant: 'destructive' });
    const res = await sendToUsers(selected, title.trim(), message.trim(), type);
    if ((res as any).error) return toast({ title: 'خطأ', description: (res as any).error, variant: 'destructive' });
    toast({ title: 'تم الإرسال', description: `تم إرسال الإشعار إلى ${selected.length} مستخدم` });
    setSelected([]); setTitle(''); setMessage('');
  };

  const counter = useMemo(() => ({ all: profiles.length, selected: selected.length }), [profiles.length, selected.length]);

  return (
    <Card className="bg-gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle className="text-xl">إرسال إشعارات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge>{counter.all} مستخدم</Badge>
              <Badge variant="secondary">{counter.selected} محدد</Badge>
              <Button size="sm" variant="outline" onClick={() => setSelected(profiles.map(p => p.user_id))}>تحديد الكل</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>تفريغ</Button>
            </div>
            <ScrollArea className="h-56 rounded border">
              <div className="p-2 space-y-1">
                {profiles.map((p) => (
                  <label key={p.user_id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/60 cursor-pointer">
                    <input type="checkbox" checked={selected.includes(p.user_id)} onChange={() => toggle(p.user_id)} />
                    <span className="text-sm">{p.full_name || p.user_id}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Button variant={type==='info'? 'default':'outline'} onClick={() => setType('info')}>معلومة</Button>
              <Button variant={type==='success'? 'default':'outline'} onClick={() => setType('success')}>نجاح</Button>
              <Button variant={type==='warning'? 'default':'outline'} onClick={() => setType('warning')}>تحذير</Button>
            </div>
            <Input placeholder="عنوان الإشعار" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="محتوى الإشعار" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px]" />
            <div className="flex gap-2">
              <Button onClick={onSuggest} variant="secondary">اقتراح نص</Button>
              <Button onClick={submitSelected} disabled={sending}>إرسال للمحددين</Button>
              <Button onClick={submitAll} variant="outline" disabled={sending}>إرسال للجميع</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
