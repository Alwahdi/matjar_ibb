import { Home, Search, Heart, User, Building2, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useFavorites } from "@/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "@/components/NotificationCenter";

const BottomNavigation = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { favorites } = useFavorites();

  const navItems = [
    {
      icon: Home,
      label: "الرئيسية",
      path: "/",
      badge: null,
    },
    {
      icon: Building2,
      label: "العقارات",
      path: "/properties",
      badge: null,
    },
    {
      icon: Search,
      label: "البحث",
      path: "/properties",
      badge: null,
    },
    {
      icon: Heart,
      label: "المفضلة",
      path: "/favorites",
      badge: favorites.length > 0 ? favorites.length : null,
    },
    {
      icon: User,
      label: "حسابي",
      path: "/account",
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 shadow-lg">
      <div className="flex items-center justify-between py-2 px-2">
        {/* Notification Center */}
        <div className="flex-shrink-0 px-2">
          <NotificationCenter />
        </div>

        {/* Navigation Items */}
        <div className="flex items-center justify-around flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "w-5 h-5 mb-1 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-arabic font-medium text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;