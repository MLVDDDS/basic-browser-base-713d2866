import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { apiRequest, isApiConfigured } from '@/lib/api-client';

const PublicSite = () => {
  const { slug } = useParams<{ slug: string }>();
  const apiEnabled = isApiConfigured();
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) {
        setError('Проект не найден');
        setIsLoading(false);
        return;
      }

      if (!apiEnabled) {
        setError('API не настроен');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{
          project?: { preview_html?: string | null; name?: string | null };
        }>(`/public/projects/${encodeURIComponent(slug)}`);

        const data = response.project;
        if (!data) {
          setError('Проект не найден или не опубликован');
        } else if (!data.preview_html) {
          setError('Сайт ещё не сгенерирован');
        } else {
          setHtml(data.preview_html);
          document.title = data.name || 'Сайт';
        }
      } catch (fetchError) {
        console.error('Error fetching project from API:', fetchError);
        setError('Ошибка загрузки проекта');
      }

      setIsLoading(false);
    };

    fetchProject();
  }, [slug, apiEnabled]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            На главную
          </a>
        </div>
      </div>
    );
  }

  // Render the full HTML document in an iframe for complete isolation
  return (
    <iframe
      srcDoc={html || ''}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-screen border-0"
      title="Published Site"
    />
  );
};

export default PublicSite;
