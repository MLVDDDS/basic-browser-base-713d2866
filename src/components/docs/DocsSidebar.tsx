import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Users, 
  Shield, 
  ScrollText,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Mail,
  Sparkles,
  MessageCircleQuestion
} from 'lucide-react';

interface DocLink {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface DocSection {
  title: string;
  links: DocLink[];
}

const sections: DocSection[] = [
  {
    title: 'Начало',
    links: [
      { title: 'О нас', href: '/docs/about', icon: Users },
      { title: 'Возможности', href: '/docs/features', icon: Sparkles },
      { title: 'Как это работает', href: '/docs/how-it-works', icon: BookOpen },
    ],
  },
  {
    title: 'Правовая информация',
    links: [
      { title: 'Политика конфиденциальности', href: '/docs/privacy', icon: Shield },
      { title: 'Условия использования', href: '/docs/terms', icon: ScrollText },
    ],
  },
  {
    title: 'Поддержка',
    links: [
      { title: 'Помощь и FAQ', href: '/docs/faq', icon: MessageCircleQuestion },
    ],
  },
];

export const DocsSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="sticky top-20">
        <div className="flex items-center gap-2 mb-6 px-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-medium">Документация</span>
        </div>

        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.links.map((link) => {
                  const isActive = location.pathname === link.href;
                  const Icon = link.icon;
                  
                  return (
                    <li key={link.href}>
                      <NavLink
                        to={link.href}
                        className={cn(
                          'flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1">{link.title}</span>
                        {isActive && <ChevronRight className="w-3 h-3" />}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};
