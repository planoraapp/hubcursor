
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, User, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  publishDate: string;
  author?: string;
  link?: string;
  category?: string;
}

export const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
                // Mock data for now - replace with actual API call later
        const mockNews: NewsArticle[] = [
          {
            id: '1',
            title: 'Nova Atualização do Habbo',
            excerpt: 'Confira as novidades da última atualização com novos mobis e recursos incríveis!',
            publishDate: '2024-01-15',
            author: 'Equipe Habbo',
            category: 'Atualização',
            link: 'https://habbo.com.br'
          },
          {
            id: '2',
            title: 'Evento Especial de Inverno',
            excerpt: 'Participe do evento especial de inverno e ganhe mobis exclusivos e distintivos raros.',
            publishDate: '2024-01-10',
            author: 'Equipe Habbo',
            category: 'Evento',
            link: 'https://habbo.com.br'
          }
        ];
        
        setArticles(mockNews);
              } catch (error) {
              } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full bg-white border-2 border-black">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg volter-font habbo-text text-center">
            📰 Habbo Notícias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-sm habbo-text">Carregando notícias...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white border-2 border-black">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg volter-font habbo-text text-center">
          📰 Habbo Notícias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm habbo-text leading-tight">
                    {article.title}
                  </h3>
                  {article.link && (
                    <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </div>
                
                <p className="text-xs habbo-text mb-2 leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center habbo-text">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(article.publishDate).toLocaleDateString('pt-BR')}
                    </span>
                    {article.author && (
                      <span className="flex items-center habbo-text">
                        <User className="w-3 h-3 mr-1" />
                        {article.author}
                      </span>
                    )}
                  </div>
                  {article.category && (
                    <Badge variant="secondary" className="text-xs habbo-text">
                      {article.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="text-center mt-4">
          <a 
            href="https://habbo.com.br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs habbo-text hover:underline"
          >
            Ver mais notícias no Habbo.com.br →
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
