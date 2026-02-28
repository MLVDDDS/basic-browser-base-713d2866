import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { Menu, X, User, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  iridescent?: boolean;
}

export const Header = ({ iridescent = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const navLinks = [
    { href: '/dashboard', label: 'Проекты' },
    { href: '/docs/faq', label: 'Помощь' },
    { href: '/docs/contact', label: 'Контакты' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass-strong">
      <ScrollProgress />
      <div className="container-main">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo size="sm" iridescent={iridescent} />
          </Link>

          {/* Navigation - visible on tablets and up */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 font-sans">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors link-underline whitespace-nowrap",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA - visible on tablets and up */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : user ? (
              <>
                <Link to="/create">
                  <Button size="sm" className="btn-glow whitespace-nowrap">
                    Создать
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 px-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block">
                        {profile?.full_name || user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Мои проекты
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login" state={{ from: location.pathname }}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Войти
                  </Button>
                </Link>
                <Link to="/create">
                  <Button size="sm" className="btn-glow whitespace-nowrap">
                    Создать
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - phones only */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Меню"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - phones only */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-200',
          isMenuOpen ? 'max-h-[400px] pb-6' : 'max-h-0'
        )}>
          <nav className="flex flex-col gap-1 pt-4 font-sans">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'py-2 text-sm font-medium transition-all',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground',
                    isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  )}
                  style={{
                    transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                    transitionDuration: '200ms'
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div 
              className={cn(
                'flex flex-col gap-2 pt-4 mt-4 border-t border-border transition-all',
                isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              )}
              style={{
                transitionDelay: isMenuOpen ? `${navLinks.length * 50}ms` : '0ms',
                transitionDuration: '200ms'
              }}
            >
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/create" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">
                      Создать проект
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" state={{ from: location.pathname }} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/create" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">
                      Создать проект
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
