import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export function useNotificationSender() {
  const [sending, setSending] = useState(false);

  const sendToUsers = async (userIds: string[], title: string, message: string, type: NotificationType = 'info') => {
    if (!userIds.length) return { error: 'no-users' } as const;
    try {
      setSending(true);
      const rows = userIds.map((uid) => ({ user_id: uid, title, message, type, read: false }));
      const { error } = await supabase.from('notifications').insert(rows);
      if (error) throw error;
      return { ok: true } as const;
    } catch (e: any) {
      return { error: e.message } as const;
    } finally {
      setSending(false);
    }
  };

  const sendToAll = async (title: string, message: string, type: NotificationType = 'info') => {
    try {
      setSending(true);
      const { data: profiles, error } = await supabase.from('profiles').select('user_id');
      if (error) throw error;
      const ids = (profiles || []).map((p: any) => p.user_id).filter(Boolean);
      return await sendToUsers(ids, title, message, type);
    } finally {
      setSending(false);
    }
  };

  const suggest = (entity: 'القسم' | 'العرض', action: 'إضافة' | 'تعديل' | 'حذف', name?: string) => {
    const base = `${action} ${entity}${name ? `: ${name}` : ''}`;
    switch (action) {
      case 'إضافة':
        return {
          title: base,
          message: `تم ${action.toLowerCase()} ${entity} جديد${name ? ` باسم "${name}"` : ''}. اكتشف التفاصيل الآن!`,
        };
      case 'تعديل':
        return {
          title: base,
          message: `تم ${action.toLowerCase()} ${entity}${name ? ` "${name}"` : ''}. اطلع على التحديثات.`,
        };
      case 'حذف':
        return {
          title: base,
          message: `تم ${action.toLowerCase()} ${entity}${name ? ` "${name}"` : ''}.`,
        };
      default:
        return { title: base, message: base };
    }
  };

  return { sending, sendToUsers, sendToAll, suggest };
}
