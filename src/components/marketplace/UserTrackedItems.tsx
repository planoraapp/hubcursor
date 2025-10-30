
import { useState } from 'react';
import { Bookmark, TrendingUp, TrendingDown, X } from 'lucide-react';
import { HabboAPIImage } from './HabboAPIImage';
import { CreditIcon } from './CreditIcon';
import { useTrackedItems } from '@/hooks/useTrackedItems';
import { useAuth } from '@/hooks/useAuth';

interface UserTrackedItemsProps {
  hotel: string;
}

export const UserTrackedItems = ({ hotel }: UserTrackedItemsProps) => {
  const { user } = useAuth();
  const { trackedItems, untrackItem, loading } = useTrackedItems(hotel);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (!user) return null;

  const handleRemoveItem = async (classname: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await untrackItem(classname);
  };

  // Dividir itens em 4 grupos para os 4 boxes
  const itemsPerBox = Math.ceil(trackedItems.length / 4);
  const boxes = Array.from({ length: 4 }, (_, i) => 
    trackedItems.slice(i * itemsPerBox, (i + 1) * itemsPerBox)
  );

  const boxTitles = [
    { title: "📌 Favoritos 1", icon: "/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png" },
    { title: "📌 Favoritos 2", icon: "/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png" },
    { title: "📌 Favoritos 3", icon: "/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png" },
    { title: "📌 Favoritos 4", icon: "/assets/2367_HabboFriendBarCom_icon_friendlist_notify_1_png.png" }
  ];

  return (
    <div className="space-y-3">
      {boxTitles.map((box, boxIndex) => (
        <div key={boxIndex} className="bg-white border-2 border-black rounded-lg shadow-lg">
          <div 
            className="p-2 border-b-2 border-black rounded-t-lg flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #4F46E5 100%)',
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundSize: 'cover'
            }}
          >
            <img src={box.icon} alt="" className="w-3 h-3" style={{ imageRendering: 'pixelated' }} />
            <h4 className="font-bold text-white volter-font text-xs" style={{
              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
            }}>
              {box.title}
            </h4>
          </div>
          
          <div className="p-2 max-h-32 overflow-y-auto">
            {boxes[boxIndex]?.length > 0 ? (
              <div className="space-y-1">
                {boxes[boxIndex].map((item) => (
                  <div 
                    key={item.classname} 
                    className="flex items-center gap-2 p-1 rounded hover:bg-blue-50 border border-blue-200 relative group text-xs"
                    onMouseEnter={() => setHoveredItem(item.classname)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <HabboAPIImage
                      className={item.classname}
                      name={item.name}
                      size="sm"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" title={item.name}>
                        {item.name || item.classname}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <CreditIcon size="sm" />
                          {item.currentPrice?.toLocaleString() || '--'}
                        </span>
                        
                        {item.priceChange && (
                          <div className="flex items-center gap-1">
                            {item.priceChange > 0 ? (
                              <TrendingUp size={8} className="text-green-500" />
                            ) : (
                              <TrendingDown size={8} className="text-red-500" />
                            )}
                            <span className={`text-xs ${
                              item.priceChange > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.priceChange > 0 ? '+' : ''}{item.priceChange}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botão de remover */}
                    {hoveredItem === item.classname && (
                      <button
                        onClick={(e) => handleRemoveItem(item.classname, e)}
                        className="absolute right-1 top-1 p-0.5 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Remover dos favoritos"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-xs">
                <Bookmark size={16} className="mx-auto mb-1 opacity-50" />
                <p>Nenhum item salvo</p>
                <p className="text-xs opacity-75">Clique no ícone 📌 nos itens para salvá-los</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
