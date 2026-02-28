import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, FileText, Users, Shield, ScrollText, BookOpen, HelpCircle, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const allLinks = [
  { title: 'О нас', href: '/docs/about', icon: Users },
  { title: 'Возможности', href: '/docs/features', icon: Sparkles },
  { title: 'Как это работает', href: '/docs/how-it-works', icon: BookOpen },
  { title: 'Частые вопросы', href: '/docs/faq', icon: HelpCircle },
  { title: 'Политика конфиденциальности', href: '/docs/privacy', icon: Shield },
  { title: 'Условия использования', href: '/docs/terms', icon: ScrollText },
  { title: 'Помощь', href: '/docs/help', icon: Mail },
  { title: 'Контакты', href: '/docs/contact', icon: Mail },
];

export const DocsMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const currentPage = allLinks.find(l => l.href === location.pathname);

  return (
    <div className="md:hidden border-b border-border bg-card/50 sticky top-16 z-40">
      <Button
        variant="ghost"
        className="w-full justify-between px-4 py-3 h-auto rounded-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm">{currentPage?.title || 'Документация'}</span>
        </div>
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {isOpen && (
        <nav className="border-t border-border p-2 bg-card">
          {allLinks.map((link) => {
            const isActive = location.pathname === link.href;
            const Icon = link.icon;
            
            return (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {link.title}
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
};
