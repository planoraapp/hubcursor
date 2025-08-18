
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Eye, MessageSquare } from 'lucide-react';

const mockNews = [
  {
    id: 1,
    title: 'Nova Atualização do Habbo!',
    excerpt: 'Confira todas as novidades desta grande atualização que chegou ao Habbo.',
    content: 'Lorem ipsum dolor sit amet...',
    author: 'Equipe Habbo',
    date: '2024-01-20',
    category: 'atualização',
    views: 1250,
    comments: 45,
    featured: true
  },
  {
    id: 2,
    title: 'Evento Especial de Páscoa',
    excerpt: 'Prepare-se para o maior evento de Páscoa do Habbo com muitas surpresas!',
    content: 'Lorem ipsum dolor sit amet...',
    author: 'DJ Habbo',
    date: '2024-01-18',
    category: 'evento',
    views: 890,
    comments: 32,
    featured: false
  },
  {
    id: 3,
    title: 'Dicas de Decoração',
    excerpt: 'Aprenda como deixar seu quarto ainda mais incrível com essas dicas.',
    content: 'Lorem ipsum dolor sit amet...',
    author: 'Designer Habbo',
    date: '2024-01-15',
    category: 'dicas',
    views: 670,
    comments: 18,
    featured: false
  }
];

export const NewsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockNews.map((article) => (
        <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <Badge 
              variant={article.featured ? 'default' : 'secondary'}
              className="volter-font"
            >
              {article.category}
            </Badge>
            {article.featured && (
              <Badge variant="destructive" className="volter-font">
                Destaque
              </Badge>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-amber-900 mb-2 volter-font">
            {article.title}
          </h3>
          
          <p className="text-gray-600 mb-4 volter-font">
            {article.excerpt}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600 volter-font">
              <User className="w-4 h-4 mr-2" />
              {article.author}
            </div>
            <div className="flex items-center text-sm text-gray-600 volter-font">
              <Calendar className="w-4 h-4 mr-2" />
              {article.date}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center volter-font">
                <Eye className="w-4 h-4 mr-1" />
                {article.views}
              </div>
              <div className="flex items-center volter-font">
                <MessageSquare className="w-4 h-4 mr-1" />
                {article.comments}
              </div>
            </div>
          </div>
          
          <Button className="w-full volter-font">
            Ler Mais
          </Button>
        </Card>
      ))}
    </div>
  );
};
