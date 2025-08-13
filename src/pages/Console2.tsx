
import React from 'react';
import MobileLayout from '../layouts/MobileLayout';
import { MyAccountColumn } from '@/components/console/MyAccountColumn';
import { OptimizedHotelFeedColumn } from '@/components/console2/OptimizedHotelFeedColumn';
import { OptimizedOnlineUsersColumn } from '@/components/console2/OptimizedOnlineUsersColumn';
import { OptimizedUserDiscoveryColumn } from '@/components/console2/OptimizedUserDiscoveryColumn';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Radio, Zap, Database, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Console2: React.FC = () => {
  const { isLoggedIn, habboAccount } = useUnifiedAuth();

  if (!isLoggedIn) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#5A6573] text-white flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="p-6 text-center space-y-4">
              <Radio className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-bold text-foreground">Console do Hotel</h2>
                <p className="text-muted-foreground">
                  Faça login para acessar o console otimizado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#5A6573] text-white">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">Console Otimizado v2</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/20 border-green-400/30 text-green-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Nova Arquitetura
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 border-blue-400/30 text-blue-200">
                  <Database className="w-3 h-3 mr-1" />
                  Cache Inteligente
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 border-purple-400/30 text-purple-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Performance+
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-white/80">
                Sistema otimizado com edge functions e cache inteligente
              </p>
              {habboAccount && (
                <Badge variant="outline" className="ml-auto">
                  {habboAccount.habbo_name} • {(habboAccount as any).hotel?.toUpperCase() || 'BR'}
                </Badge>
              )}
            </div>
          </div>

          {/* Console Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
            {/* Left Column - My Account */}
            <div className="xl:col-span-1 space-y-6">
              <MyAccountColumn />
            </div>

            {/* Center Column - Hotel Feed */}
            <div className="xl:col-span-1">
              <OptimizedHotelFeedColumn />
            </div>

            {/* Right Column - Online Users */}
            <div className="xl:col-span-1">
              <OptimizedOnlineUsersColumn />
            </div>

            {/* Far Right Column - User Discovery */}
            <div className="xl:col-span-1">
              <OptimizedUserDiscoveryColumn />
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              Console2 • Arquitetura otimizada • Cache inteligente • Performance aprimorada
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
