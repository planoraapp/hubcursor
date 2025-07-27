
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Calendar, User, ArrowRight } from 'lucide-react';

export const News = () => {
  const { t } = useLanguage();

  const mockNews = [
    {
      id: 1,
      title: 'Novo Evento de Verão 2024',
      excerpt: 'Participe do maior evento de verão do Habbo! Ganhe moedas, móveis exclusivos e muito mais.',
      date: '2024-01-15',
      author: 'Equipe Habbo',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_summer24.png',
      featured: true
    },
    {
      id: 2,
      title: 'Novos Móveis na Loja',
      excerpt: 'Confira os novos móveis disponíveis na loja oficial do Habbo.',
      date: '2024-01-12',
      author: 'Equipe Habbo',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_furni_jan24.png',
      featured: false
    },
    {
      id: 3,
      title: 'Competição de Quartos',
      excerpt: 'Mostre sua criatividade na competição de quartos mais inovadores.',
      date: '2024-01-10',
      author: 'Moderação',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_roomcomp_jan24.png',
      featured: false
    },
    {
      id: 4,
      title: 'Atualizações de Segurança',
      excerpt: 'Melhorias na segurança e novas funcionalidades para proteger sua conta.',
      date: '2024-01-08',
      author: 'Equipe Técnica',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_security_jan24.png',
      featured: false
    }
  ];

  return (
    <div className="space-y-6">
      <PanelCard title={t('newsTitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockNews.map((news) => (
            <div key={news.id} className="habbo-card">
              <div className="relative">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
                {news.featured && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                    DESTAQUE
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 text-lg">{news.title}</h3>
                <p className="text-gray-600 mb-3 text-sm">{news.excerpt}</p>
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar size={14} className="mr-1" />
                  <span className="mr-4">{news.date}</span>
                  <User size={14} className="mr-1" />
                  <span>{news.author}</span>
                </div>
                <button className="habbo-button-green w-full flex items-center justify-center">
                  <span>Ler Mais</span>
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};
