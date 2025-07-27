
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { Clock, ExternalLink, Globe } from 'lucide-react';

export const News = () => {
  const { t } = useLanguage();

  const mockNews = [
    {
      id: 1,
      title: 'Nova Coleção de Mobis Lançada',
      excerpt: 'Descubra os novos mobis temáticos da temporada de verão com designs únicos e exclusivos.',
      date: '2024-01-15',
      source: 'Habbo.com.br',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_gen_furni22_bun1.png'
    },
    {
      id: 2,
      title: 'Evento Especial de Emblemas',
      excerpt: 'Participe do evento especial e ganhe emblemas raros disponíveis apenas por tempo limitado.',
      date: '2024-01-12',
      source: 'Habbo.es',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_Niko_wrs21_bun1.png'
    },
    {
      id: 3,
      title: 'Atualização de Segurança',
      excerpt: 'Importantes melhorias de segurança foram implementadas para proteger sua conta.',
      date: '2024-01-10',
      source: 'Habbo.com',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_safety_2021_bun1.png'
    },
    {
      id: 4,
      title: 'Competição de Quartos',
      excerpt: 'Mostre sua criatividade na competição mensal de decoração de quartos.',
      date: '2024-01-08',
      source: 'Habbo.fi',
      image: 'https://images.habbo.com/web_images/habbo-web-articles/lpromo_BuildComp_bun1.png'
    }
  ];

  return (
    <div className="space-y-6">
      <PanelCard title={t('newsTitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockNews.map((news) => (
            <div key={news.id} className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] overflow-hidden hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-[#38332c] mb-2">{news.title}</h3>
                <p className="text-[#38332c] text-sm mb-3">{news.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{new Date(news.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe size={14} />
                    <span>{news.source}</span>
                  </div>
                </div>
                <button className="mt-3 w-full bg-[#008800] text-white px-4 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 flex items-center justify-center space-x-2">
                  <span>Ler mais</span>
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};
