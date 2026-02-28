import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { 
  Send, 
  Plus, 
  FolderOpen, 
  CreditCard, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  Mail, 
  Users, 
  Shield, 
  FileText,
  LucideIcon
} from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const Footer = () => {
  const footerLinks: { product: FooterLink[]; resources: FooterLink[]; company: FooterLink[] } = {
    product: [
      { label: 'Создать проект', href: '/create', icon: Plus },
      { label: 'Мои проекты', href: '/dashboard', icon: FolderOpen },
      { label: 'Тарифы', href: '/pricing', icon: CreditCard },
    ],
    resources: [
      { label: 'Как это работает', href: '/docs/how-it-works', icon: Lightbulb },
      { label: 'Документация', href: '/docs', icon: BookOpen },
      { label: 'Помощь', href: '/docs/faq', icon: HelpCircle },
      { label: 'Контакты', href: '/docs/contact', icon: Mail },
    ],
    company: [
      { label: 'О нас', href: '/docs/about', icon: Users },
      { label: 'Политика конфиденциальности', href: '/docs/privacy', icon: Shield },
      { label: 'Условия использования', href: '/docs/terms', icon: FileText },
    ],
  };

  return (
    <footer className="border-t border-border pb-20 md:pb-0">
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="sm" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Сайты и Telegram Mini App за минуты.
            </p>
            <a 
              href="https://t.me/lybacode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Send className="w-4 h-4" />
              Telegram
            </a>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-base font-bold text-primary uppercase tracking-wider mb-3">Продукт</h4>
            <div className="h-px bg-border mb-4" />
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                  >
                    <link.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="link-underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold text-primary uppercase tracking-wider mb-3">Ресурсы</h4>
            <div className="h-px bg-border mb-4" />
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                  >
                    <link.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="link-underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-base font-bold text-primary uppercase tracking-wider mb-3">Компания</h4>
            <div className="h-px bg-border mb-4" />
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                  >
                    <link.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="link-underline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 ЛЮБАКОДЪ. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};
