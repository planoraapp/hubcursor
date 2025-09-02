
import { useState } from 'react';
import { PanelCard } from './PanelCard';
import { Events } from './Events';
import { News } from './News';

export const NewsAndEvents = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');

  return (
    <div className="space-y-6">
      <PanelCard title="📰 Notícias e Eventos do Habbo">
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'news'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📰 Notícias
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📅 Eventos
            </button>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'news' ? <News /> : <Events />}
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
