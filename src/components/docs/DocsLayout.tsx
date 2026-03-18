import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DocsSidebar } from './DocsSidebar';
import { DocsMobileNav } from './DocsMobileNav';
import { Breadcrumbs } from './Breadcrumbs';
import { PageTitle } from '@/components/ui/PageTitle';

interface DocsLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  lastUpdated?: string;
}

export const DocsLayout = ({ children, title, description, lastUpdated }: DocsLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex pt-16">
        <DocsSidebar />
        
        <main className="flex-1 min-w-0">
          <DocsMobileNav />
          
          <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
            {/* Breadcrumbs */}
            <Breadcrumbs />
            
            {/* Header */}
            <header className="mb-8 pb-6 border-b border-border">
              <PageTitle description={description} size="compact">
                {title}
              </PageTitle>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground mt-4">
                  Последнее обновление: {lastUpdated}
                </p>
              )}
            </header>

            {/* Content */}
            <div className="prose prose-invert prose-emerald max-w-none">
              {children}
            </div>
          </article>
        </main>
      </div>

      <Footer />
    </div>
  );
};
