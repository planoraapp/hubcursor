
import { useState, useEffect } from 'react';
import { Calendar, ExternalLink, Clock } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { supabase } from '@/integrations/supabase/client';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  date: string;
  link: string;
}

export const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching Habbo news...');
      
      const { data, error } = await supabase.functions.invoke('habbo-news-scraper');
      
      if (error) {
        throw error;
      }
      
      if (data?.news && Array.isArray(data.news)) {
        setNews(data.news);
        console.log('✅ News loaded:', data.news.length, 'items');
      } else {
        throw new Error('Invalid news data format');
      }
    } catch (err) {
      console.error('❌ Error fetching news:', err);
      setError('Erro ao carregar notícias');
      // Set fallback news
      setNews([
        {
          id: 'fallback_1',
          title: 'Habbo Hotel Brasil',
          summary: 'Confira as últimas novidades do Habbo Hotel Brasil no site oficial.',
          image: 'https://www.habbo.com.br/habbo-imaging/badge/b05114s36135s99999.gif',
          date: new Date().toISOString().split('T')[0],
          link: 'https://www.habbo.com.br'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PanelCard title="Notícias do Habbo">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando notícias do Habbo.com.br...</p>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PanelCard title="Notícias do Habbo">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            📰 Últimas notícias do Habbo Hotel Brasil
          </p>
          <button 
            onClick={fetchNews}
            className="habbo-button-blue text-sm px-3 py-1"
            disabled={loading}
          >
            <Clock className="w-4 h-4 mr-1 inline" />
            Atualizar
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <PanelCard key={item.id}>
              <div className="space-y-4">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://www.habbo.com.br/habbo-imaging/badge/b05114s36135s99999.gif';
                    }}
                  />
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </div>
                    
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Ver mais
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </PanelCard>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};
