
import { useState } from 'react';
import { Search } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { mockData } from '../data/mockData';

export const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCatalog = mockData.catalog.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PanelCard title="Catálogo de Itens">
        <p className="text-lg text-gray-600 mb-4">
          Navegue pelos mobis e emblemas disponíveis publicamente.
        </p>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome do item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
          />
        </div>
      </PanelCard>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCatalog.map((item, index) => (
          <PanelCard key={index}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 mx-auto rounded-lg flex items-center justify-center text-gray-500 font-bold text-lg border-2 border-gray-300">
                {item.type === 'Mobi' ? '🪑' : '🏅'}
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
              <div className="flex justify-between items-center text-xs">
                <span className={`px-2 py-1 rounded text-white font-medium ${
                  item.type === 'Mobi' ? 'bg-[#008800]' : 'bg-[#dd0000]'
                }`}>
                  {item.type}
                </span>
                <button className="text-[#007bff] hover:underline">Ver</button>
              </div>
            </div>
          </PanelCard>
        ))}
      </div>
    </div>
  );
};
