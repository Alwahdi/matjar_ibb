import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!loading && user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('user_id', user.id)
            .single();
          
          setIsUserActive(profile?.is_active ?? true);
        } catch (error) {
          console.error('Error checking user status:', error);
        }
        setProfileLoading(false);
      } else if (!loading && !user) {
        navigate('/landing');
        setProfileLoading(false);
      }
    };

    checkUserStatus();
  }, [user, loading, navigate]);

  // If user is suspended, sign them out and redirect
  useEffect(() => {
    if (!profileLoading && user && !isUserActive) {
      supabase.auth.signOut();
      navigate('/landing');
    }
  }, [profileLoading, user, isUserActive, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isUserActive) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;