import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  'docs': 'Документация',
  'about': 'О нас',
  'how-it-works': 'Как это работает',
  'features': 'Возможности',
  'faq': 'Частые вопросы',
  'help': 'Помощь',
  'contact': 'Помощь и FAQ',
  'privacy': 'Конфиденциальность',
  'terms': 'Условия использования',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Главная"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.map(({ path, label, isLast }) => (
        <span key={path} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          {isLast ? (
            <span className="text-foreground font-medium">{label}</span>
          ) : (
            <Link 
              to={path} 
              className="hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};
