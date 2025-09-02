
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack, Music } from 'lucide-react';

export const TraxPlayerWidget = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack] = useState({
    title: 'Habbo Lounge Mix',
    artist: 'DJ Habbo',
    duration: '3:45'
  });

  return (
    <Card className="w-full h-full p-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="flex items-center gap-2 mb-3">
        <Music className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-lg volter-font">Trax Player</h3>
      </div>
      
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Music className="w-8 h-8 text-purple-600" />
        </div>
        <div className="font-bold text-sm volter-font">{currentTrack.title}</div>
        <div className="text-xs text-gray-600 volter-font">{currentTrack.artist}</div>
        <div className="text-xs text-gray-500 volter-font">{currentTrack.duration}</div>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => setIsPlaying(!isPlaying)}
          size="sm"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button variant="outline" size="sm">
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
        <div className="bg-purple-600 h-1 rounded-full" style={{ width: '45%' }}></div>
      </div>
    </Card>
  );
};
