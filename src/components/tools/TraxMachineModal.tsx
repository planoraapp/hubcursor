import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play, Square, Save, SkipBack, SkipForward } from 'lucide-react';
import { getTraxSampleUrl } from '@/lib/cloudflare-r2';

interface TraxMachineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sound collections data from the original TraxMachine
const collections = [
  null,
  ['1', 'DJ Fuse\'s Duck Funk', '01.gif', '#89dc00'],
  ['2', 'DJ Fuse\'s Habbo Theme', '02.gif', '#efb100'],
  ['3', 'SnowStorm Theme', '03.gif', '#ef00b8'],
  ['4', 'Sunset Adverture(s)', '04.gif', '#00d2dc'],
  ['5', 'Dark Skies', '05.gif', ''],
  ['6', 'Ambience(s)', '06.gif', ''],
  ['7', 'Furni Sounds I', '07.gif', ''],
  ['8', 'Electronica', '08.gif', ''],
  ['9', 'Mysto Magica', '09.gif', ''],
  ['10', 'Boy Band Sensation', '10.gif', ''],
  ['11', 'Spicey Donna', '11.gif', ''],
  ['12', 'Abe Normal', '12.gif', ''],
  ['13', 'Cafe Muzzakh', '13.gif', ''],
  ['14', 'Cameron\'s Ex', '14.gif', ''],
  ['15', 'El Generico', '15.gif', ''],
  ['16', 'Ferry Nultado', '16.gif', ''],
  ['17', 'Jive Sideburns', '17.gif', ''],
  ['18', 'Little Tanga Beach', '18.gif', ''],
  ['19', 'MnM', '19.gif', ''],
  ['20', 'Monkey Paradise', '20.gif', ''],
  ['21', 'Snotty Day', '21.gif', ''],
  ['22', 'A Day in the Park', '22.gif', ''],
  ['23', 'Nature Nightlife', '23.gif', ''],
  ['24', 'Compu FX', '24.gif', ''],
  ['25', 'Party Pack', '25.gif', ''],
  ['26', 'Bhangra Mangra', '26.gif', ''],
  ['27', 'Rasta Santa\'s Pack', '27.gif', ''],
  ['28', 'Moshy Metal', '28.gif', ''],
  ['29', 'Dancefloor Burners', '29.gif', ''],
  ['30', 'Double Peaks', '30.gif', ''],
  ['31', 'House Loops', '31.gif', ''],
  ['32', 'Pianissimo', '32.gif', ''],
  ['33', 'Yngvie Van Halen', '33.gif', ''],
  ['34', 'Rockin\' Riffs', '34.gif', ''],
  ['35', 'Supa Funk', '35.gif', ''],
  ['36', 'Bossa Nueva', '36.gif', ''],
  ['37', 'Habbowood', '37.gif', ''],
  ['38', 'Highway to Habbo', '38.gif', ''],
  ['39', 'Pixels on the Water', '39.gif', ''],
  ['40', 'Iron Maid', '40.gif', ''],
  ['41', 'Sympathy for the Coder', '41.gif', ''],
  ['42', 'Snouthill Horror', '42.gif', ''],
  ['43', 'Silence of the Moderators', '43.gif', ''],
  ['44', 'Ghost Story', '44.gif', ''],
  ['45', 'Berlin Connection', '45.gif', ''],
  ['46', 'Club Sounds III', '46.gif', ''],
  ['47', 'Loco Electro', '47.gif', ''],
  ['48', 'Jackin\' Chicago', '48.gif', ''],
  ['49', 'Maximum Minimal', '49.gif', ''],
  ['50', 'Nu Skool Breakz', '50.gif', ''],
  ['51', 'NYC Beat', '51.gif', ''],
  ['52', 'State of Trancehouse', '52.gif', ''],
  ['53', 'Jingle Beats', '53.gif', ''],
  ['54', 'Rudolph\'s Loops', '54.gif', ''],
  ['55', 'RnB Grooves 1', '55.gif', ''],
  ['56', 'RnB Grooves 2', '56.gif', ''],
  ['57', 'RnB Grooves 3', '57.gif', ''],
  ['58', 'RnB Grooves 4', '58.gif', ''],
  ['59', 'RnB Grooves 5', '59.gif', ''],
  ['60', 'Valentine 1', '60.gif', ''],
  ['61', 'Valentine 2', '61.gif', ''],
  ['62', 'Alhambra Trax 1', '62.gif', ''],
  ['63', 'Alhambra Trax 2', '63.gif', ''],
  ['64', 'Alhambra Trax 3', '64.gif', ''],
  ['65', 'Tiki Vol. 1', '65.gif', ''],
  ['66', 'Tiki Vol. 2', '66.gif', ''],
  ['67', 'Tiki Vol. 3', '67.gif', ''],
  ['68', 'EC 1', '68.gif', ''],
  ['69', 'EC 2', '69.gif', ''],
  ['70', 'EC 3', '70.gif', ''],
  ['71', 'Icy Trax', '71.gif', ''],
  ['72', 'Country sounds', '72.gif', '']
];

const TraxMachineModal: React.FC<TraxMachineModalProps> = ({ open, onOpenChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(Math.ceil((collections.length - 1) / 3));
  const [selectedCartridges, setSelectedCartridges] = useState<number[]>([]);
  const [timeline, setTimeline] = useState<{[key: string]: any}>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [exportString, setExportString] = useState("1:0,10:2:0,10:3:0,10:4:0,10:");
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sample notes for each cartridge
  const noteSymbols = ['circle', 'square', 'rhombus', 'chevron', 'division', 'parenthesis', 'equals', 'cross', 'heart'];
  const noteColors = ['#89dc00', '#efb100', '#ef00b8', '#00d2dc'];

  const handleCartridgeSelect = (cartridgeId: number) => {
    if (selectedCartridges.length < 4 && !selectedCartridges.includes(cartridgeId)) {
      setSelectedCartridges([...selectedCartridges, cartridgeId]);
    }
  };

  const handleCartridgeRemove = (cartridgeId: number) => {
    setSelectedCartridges(selectedCartridges.filter(id => id !== cartridgeId));
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
  };

  const handleSave = () => {
    navigator.clipboard.writeText(exportString);
    alert('Código copiado para a área de transferência!');
  };

  const handleClear = () => {
    setTimeline({});
    setExportString("1:0,10:2:0,10:3:0,10:4:0,10:");
  };

  const handleNoteClick = (cartridgeIndex: number, noteIndex: number) => {
    const key = `${cartridgeIndex}-${noteIndex}`;
    setTimeline(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNotePreview = async (cartridgeId: number, noteIndex: number) => {
    try {
      setIsLoading(true);
      
      // Parar áudio anterior
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      }

      // Obter URL do sample
      const sampleUrl = getTraxSampleUrl(cartridgeId, noteIndex + 1);
      
      if (sampleUrl) {
        const audio = new Audio(sampleUrl);
        audio.volume = 0.5;
        audio.loop = true;
        
        audio.addEventListener('canplaythrough', () => {
          audio.play();
          setPreviewAudio(audio);
          setIsLoading(false);
        });

        audio.addEventListener('error', () => {
                    setIsLoading(false);
        });
      } else {
                setIsLoading(false);
      }
    } catch (error) {
            setIsLoading(false);
    }
  };

  const stopPreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewAudio(null);
    }
  };

  const generateExportString = () => {
    // Simplified export string generation
    const layers = [];
    for (let i = 1; i <= 4; i++) {
      const layerNotes = [];
      for (let j = 0; j < 9; j++) {
        const key = `${i}-${j}`;
        if (timeline[key]) {
          layerNotes.push(`${j + 1},2`);
        } else {
          layerNotes.push('0,2');
        }
      }
      layers.push(`${i}:${layerNotes.join(';')}`);
    }
    return layers.join(':') + ':';
  };

  useEffect(() => {
    setExportString(generateExportString());
  }, [timeline]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-4 border-[#333] text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="volter-font text-2xl font-bold text-white">
            Sound Machine Editor
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sound Collections */}
          <div className="bg-[#2a2a2a] p-4 rounded-lg border-2 border-[#444]">
            <h3 className="volter-font text-lg font-bold mb-3 text-white">Sound Collections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collections.slice(1).slice((currentPage - 1) * 3, currentPage * 3).map((collection, index) => {
                const collectionId = (currentPage - 1) * 3 + index + 1;
                return (
                  <div 
                    key={collectionId} 
                    className="flex items-center gap-3 p-3 bg-[#333] rounded border border-[#555] hover:bg-[#444] cursor-pointer"
                    onClick={() => handleCartridgeSelect(collectionId)}
                  >
                    <div 
                      className="w-12 h-12 rounded border-2 border-[#666] flex items-center justify-center"
                      style={{ backgroundColor: collection[3] || '#666' }}
                    >
                      <span className="text-xs font-bold text-white">{collectionId}</span>
                    </div>
                    <div className="flex-1">
                      <div className="volter-font font-medium text-white text-sm">{collection[1]}</div>
                      <span className="text-xs text-green-400 volter-font">Click to add</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button 
                className="w-8 h-8 bg-[#444] rounded border border-[#666] flex items-center justify-center hover:bg-[#555] transition-colors disabled:opacity-50"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                ‹
              </button>
              <span className="volter-font text-sm text-white">{currentPage}/{totalPages}</span>
              <button 
                className="w-8 h-8 bg-[#444] rounded border border-[#666] flex items-center justify-center hover:bg-[#555] transition-colors disabled:opacity-50"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                ›
              </button>
            </div>
          </div>

          {/* Selected Cartridges */}
          <div className="bg-[#2a2a2a] p-4 rounded-lg border-2 border-[#444]">
            <h3 className="volter-font text-lg font-bold mb-3 text-white">Selected Cartridges</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((slot) => {
                const cartridgeId = selectedCartridges[slot - 1];
                const collection = cartridgeId ? collections[cartridgeId] : null;
                
                return (
                  <div key={slot} className="bg-[#333] p-3 rounded border border-[#555] min-h-[120px]">
                    {collection ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="volter-font text-sm font-bold text-white">{collection[1]}</span>
                          <button
                            onClick={() => handleCartridgeRemove(cartridgeId)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {noteSymbols.map((symbol, noteIndex) => (
                            <button
                              key={noteIndex}
                              className="w-6 h-6 rounded border border-[#666] flex items-center justify-center hover:bg-[#444] transition-colors relative group"
                              style={{ backgroundColor: collection[3] || '#666' }}
                              onClick={() => handleNoteClick(slot, noteIndex)}
                              onMouseEnter={() => handleNotePreview(cartridgeId, noteIndex)}
                              onMouseLeave={stopPreview}
                            >
                              <div className="w-3 h-3 rounded-full bg-white"></div>
                              {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                              )}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Preview
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Empty Slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              className="w-12 h-12 bg-green-500 rounded-full border-2 border-black flex items-center justify-center hover:bg-green-600 transition-colors"
              onClick={handlePlay}
            >
              {isPlaying ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button 
              className="w-12 h-12 bg-red-500 rounded-full border-2 border-black flex items-center justify-center hover:bg-red-600 transition-colors"
              onClick={handleStop}
            >
              <Square className="w-6 h-6" />
            </button>
            <button 
              className="w-12 h-12 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center hover:bg-blue-600 transition-colors"
              onClick={handleSave}
            >
              <Save className="w-6 h-6" />
            </button>
            <button 
              className="w-12 h-12 bg-gray-400 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-500 transition-colors"
              onClick={handleClear}
            >
              <SkipBack className="w-6 h-6" />
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-[#2a2a2a] p-4 rounded-lg border-2 border-[#444]">
            <h3 className="volter-font text-lg font-bold mb-3 text-white">Timeline</h3>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((trackNum) => (
                <div key={trackNum} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#444] rounded border border-[#666] flex items-center justify-center volter-font text-sm font-bold text-white">
                    {trackNum}
                  </div>
                  <div className="flex-1 h-8 bg-[#333] rounded border border-[#555] relative overflow-hidden">
                    <div className="flex h-full">
                      {Array.from({ length: 24 }, (_, i) => (
                        <div
                          key={i}
                          className="w-6 h-full border-r border-[#555] flex items-center justify-center"
                        >
                          {timeline[`${trackNum}-${i % 9}`] && (
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: noteColors[(trackNum - 1) % 4] }}
                            ></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="bg-[#2a2a2a] p-4 rounded-lg border-2 border-[#444]">
            <h3 className="volter-font text-lg font-bold mb-3 text-white">Song in Habbo format</h3>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={exportString}
                className="flex-1 p-2 bg-[#333] border border-[#555] rounded volter-font text-sm text-white"
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded border border-black hover:bg-blue-600 transition-colors volter-font text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(exportString);
                  alert('Código copiado para a área de transferência!');
                }}
              >
                Copy
              </button>
            </div>
          </div>

          {/* Credits */}
          <div className="text-center text-sm text-gray-400 volter-font">
            Made with <span className="text-pink-500">ƒ</span> by{' '}
            <img 
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAeCAMAAADqx5XUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACEUExURQAAABAQEGWYMpjLZQAyADJlADIyADIAAGUyAJgyAMtlAMuYMphlMsuYZSEAAJgyMpgAAMsyMv5lZctlZakAAHYAAM2MsRAAAIcAAGUyMjIAMrG7wR8pL5gAMjnKXSl9V6NvjIA/PP6t29Xk7JlQUV9laadbXls+T8xzfbJhZ5aeowAAACY/w0sAAAAsdFJOU/////////////////////////////////////////////////////////8Ax9YJjAAAAAlwSFlzAAAOwwAADsMBx2+oZAAAARZJREFUOE+d0mFThCAQBuAXrhM1O44yKqVLPb1K////a+FElKsv7TgO7MMuwojp7wiGCdHCZco42/Et+hkji8gbOGd3+wSbtqGOiTTLxf0KfV2eA1mabtCPgOIBWZYmKwyDooA4iL38xRhwVI9PYvU5YQBRkoHvbszmylKBDrMUBuMQwq5AEhntgueDsitIr7nZoCGlenl9cz1LX3B9aygJKKUqoKpiA+oaklCquE7DGELSqnq/sZOhIC2pr0uu7ONkiNHgiHbOurfd0JgTMRmatnFpbx3OtidZ3zat7uwhZ6PDD2cbVNTq3mKwCcNgFc2l/9Rf7m5WVtf0AN3le761xajrOIyj/Ut9LpjVJe1iM4nifzZNP/pXYUO/S0DVAAAAAElFTkSuQmCC" 
              alt="@Justeeri@" 
              className="inline w-4 h-4 mx-1"
            />
            <a 
              href="https://twitter.com/JussuC" 
              target="_blank" 
              rel="noopener noreferrer nofollow"
              className="text-blue-400 hover:underline ml-1"
            >
              Follow me on Twitter
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TraxMachineModal;