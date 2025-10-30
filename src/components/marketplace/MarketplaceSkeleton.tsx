
import { ScrollArea } from '@/components/ui/scroll-area';

export const MarketplaceSkeleton = () => {
  return (
    <div className="bg-white border-2 border-black rounded-lg shadow-lg">
      <div 
        className="p-4 border-b-2 border-black rounded-t-lg"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
          backgroundImage: 'url(/assets/site/bghabbohub.png)',
          backgroundSize: 'cover'
        }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded mb-2 w-48"></div>
          <div className="h-4 bg-white/20 rounded w-32"></div>
        </div>
      </div>
      
      <ScrollArea className="h-96">
        <div className="p-4 space-y-3">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="flex items-center gap-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
