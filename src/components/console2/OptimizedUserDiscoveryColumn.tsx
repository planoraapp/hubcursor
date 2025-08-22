
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RefreshCw, Loader2, Search } from 'lucide-react';
import { useOfficialHotelTicker } from '@/hooks/useOfficialHotelTicker';
import { RichActivityRenderer } from './RichActivityRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';

export const OptimizedUserDiscoveryColumn: React.FC = () => {
  const { activities, isLoading, error, refetch, hotel, metadata } = useOfficialHotelTicker({
    limit: 15
  });
  
  const isEmpty = !isLoading && (!activities || activities.length === 0);
  const lastUpdate = metadata?.timestamp;

  const handleRefresh = () => {
    refetch();
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'agora mesmo';
    } else if (minutes < 60) {
      return `${minutes}m atrás`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days}d atrás`;
    }
  };

  // Filter out friendship activities and group activities by user
  const filteredActivities = React.useMemo(() => {
    if (!activities) return [];
    
    // Filter out friendship activities
    const friendshipFiltered = activities.filter(activity => 
      !activity.description.toLowerCase().includes('amizade') &&
      !activity.description.toLowerCase().includes('amigo')
    );
    
    // Group activities by user and merge them
    const userGroups = new Map<string, any[]>();
    
    friendshipFiltered.forEach(activity => {
      if (!userGroups.has(activity.username)) {
        userGroups.set(activity.username, []);
      }
      userGroups.get(activity.username)!.push(activity);
    });
    
    // Create compiled activities with max 2 activities per user
    const compiledActivities = Array.from(userGroups.entries()).map(([username, userActivities]) => {
      const sortedActivities = userActivities.sort((a, b) => 
        new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
      );
      
      return {
        username,
        activities: sortedActivities.slice(0, 2), // Max 2 activities per user
        lastUpdate: sortedActivities[0].lastUpdate,
        profile: sortedActivities[0].profile
      };
    }).sort((a, b) => 
      new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
    );
    
    return compiledActivities;
  }, [activities]);

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="flex-shrink-0 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white habbo-text-shadow" />
            <span className="text-sm font-bold text-white habbo-text-shadow">
              Ticker Oficial
            </span>
            {metadata?.hotel && (
              <span className="text-xs text-white/60 habbo-text-shadow">
                • {metadata.hotel.toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-white/80 hover:text-white p-1 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-6">
            <Search className="w-8 h-8 mx-auto mb-3 text-white/40" />
            <p className="text-white/60 text-xs">Nenhuma atividade encontrada</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-white/80 hover:text-white text-xs border border-black px-2 py-1 hover:bg-white/10 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map((userGroup, index) => (
              <div key={`${userGroup.username}-${userGroup.lastUpdate}-${index}`}>
                {userGroup.activities.map((activity: any, actIndex: number) => (
                  <RichActivityRenderer
                    key={`${activity.username}-${activity.lastUpdate}-${actIndex}`}
                    activity={{
                      username: activity.username,
                      activity: activity.description,
                      timestamp: activity.lastUpdate,
                      figureString: activity.profile?.figureString,
                      hotel: hotel
                    }}
                    className="bg-transparent border border-black hover:bg-white/10 transition-colors p-2"
                  />
                ))}
                {index < filteredActivities.length - 1 && (
                  <div className="w-full h-px bg-white/20 my-1" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
