import { useState } from "react";
import { Moon, Sun, Menu, Heart, User, Search, Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Header = ({ isDark, toggleTheme }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-card backdrop-blur-md border-b border-border/50 shadow-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* الشعار */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-glow">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold font-arabic bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                دلّالتي
              </h1>
              <p className="text-xs text-muted-foreground font-arabic">
                منصتك الذكية للعقارات
              </p>
            </div>
          </Link>

          {/* شريط البحث المركزي */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="ابحث عن عقارات..."
                className="pr-10 bg-background/80 border-border/50 focus:ring-primary/50 font-arabic"
                dir="rtl"
              />
            </div>
          </div>

          {/* الأزرار الجانبية */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* زر العقارات */}
            <Button 
              variant="ghost" 
              className="hidden sm:flex font-arabic hover:bg-accent/50"
              asChild
            >
              <Link to="/properties">العقارات</Link>
            </Button>

            {/* زر المفضلة */}
            {user && (
              <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-colors">
                <Heart className="w-5 h-5" />
              </Button>
            )}

            {/* زر الملف الشخصي أو تسجيل الدخول */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-colors">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      مرحباً بك في دلّالتي
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>المفضلة</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent/50 transition-colors"
                onClick={() => navigate('/auth')}
              >
                <User className="w-5 h-5" />
              </Button>
            )}

            {/* زر تبديل الوضع */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hover:bg-accent/50 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600" />
              )}
            </Button>

            {/* زر القائمة للموبايل */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-accent/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* شريط البحث للموبايل */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="ابحث عن عقارات..."
              className="pr-10 bg-background/80 border-border/50 font-arabic"
              dir="rtl"
            />
          </div>
        </div>

        {/* القائمة المنسدلة للموبايل */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 animate-fade-in">
            <div className="space-y-2 font-arabic">
              <Button variant="ghost" className="w-full justify-start text-right" asChild>
                <Link to="/properties">العقارات</Link>
              </Button>
              {user ? (
                <>
                  <Button variant="ghost" className="w-full justify-start text-right">
                    المفضلة
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-right">
                    حسابي
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-right" onClick={handleSignOut}>
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <Button variant="ghost" className="w-full justify-start text-right" asChild>
                  <Link to="/auth">تسجيل الدخول</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;