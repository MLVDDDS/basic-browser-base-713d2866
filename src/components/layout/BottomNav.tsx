import { Link, useLocation } from 'react-router-dom';
import { Home, FolderKanban, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/dashboard', label: 'Проекты', icon: FolderKanban },
  { href: '/create', label: 'Создать', icon: Plus, isAction: true },
  { href: '/login', label: 'Профиль', icon: User },
];

export const BottomNav = () => {
  const location = useLocation();

  // Hide bottom nav on builder pages
  const isBuilder = location.pathname.startsWith('/builder');
  if (isBuilder) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
