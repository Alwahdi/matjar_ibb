import { Home, Search, Heart, User, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: "الرئيسية",
      path: "/",
    },
    {
      icon: Building2,
      label: "العقارات",
      path: "/properties",
    },
    {
      icon: Search,
      label: "البحث",
      path: "/properties",
    },
    {
      icon: Heart,
      label: "المفضلة",
      path: "/favorites",
    },
    {
      icon: User,
      label: "حسابي",
      path: "/account",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 shadow-lg">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-1 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-arabic font-medium text-center leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;