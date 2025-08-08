import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { detectHotelFromHabboId } from '@/utils/habboDomains';
import { generateFigureString } from '@/lib/figureStringGenerator';
import { HabboRenderer } from '../HabboRenderer';
import { OfficialHabboClothingGrid } from './OfficialHabboClothingGrid';
import { ViaJovemClothingGrid } from './ViaJovemClothingGrid';
import FlashAssetsV3Complete from '../HabboEditor/FlashAssetsV3Complete';

export default function ViaJovemEditorRedesigned() {
  const [activeTab, setActiveTab] = useState("habbo");
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedHotel, setSelectedHotel] = useState(detectHotelFromHabboId('hhbr-'));
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('1');
  const [zoom, setZoom] = useState(100);
  const [currentFigureString, setCurrentFigureString] = useState('hr-100-0.ch-210-0.lg-270-0.sh-305-0.hd-180-0');
  const [isCopied, setIsCopied] = React.useState(false)
  const { toast } = useToast()

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  const handleItemSelect = (item: any, colorId?: string) => {
    setSelectedItem(item);
    setSelectedColor(colorId || '1');
    
    if (item) {
      const newFigure = generateFigureString(currentFigureString, item, colorId || '1');
      setCurrentFigureString(newFigure);
    }
  };

  const handleViaJovemItemSelect = (item: any, colorId: string) => {
    setSelectedItem(item);
    setSelectedColor(colorId);
    
    if (item) {
      const newFigure = generateFigureString(currentFigureString, item, colorId);
      setCurrentFigureString(newFigure);
    }
  };

  const restoreFigure = (figureString: string) => {
    setCurrentFigureString(figureString);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(currentFigureString)
    setIsCopied(true)
    toast({
      description: "Figuredata copiada para a área de transferência.",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleRandomizeFigure = useCallback(() => {
    const randomHair = Math.floor(Math.random() * 150) + 1;
    const randomShirt = Math.floor(Math.random() * 150) + 1;
    const randomLegs = Math.floor(Math.random() * 150) + 1;
    const randomShoes = Math.floor(Math.random() * 150) + 1;
    const randomHead = Math.floor(Math.random() * 20) + 1;

    const newFigure = `hr-${randomHair}-0.ch-${randomShirt}-0.lg-${randomLegs}-0.sh-${randomShoes}-0.hd-${randomHead}-0`;
    setCurrentFigureString(newFigure);
  }, []);

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel - Avatar Preview and Controls */}
      <div className="w-80 p-4 border-r border-gray-300 flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-center items-center mb-4">
            <HabboRenderer
              figure={currentFigureString}
              zoom={zoom}
              hotel={selectedHotel}
              gender={selectedGender}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="figure-string" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Figuredata
            </Label>
            <div className="relative">
              <Input
                type="text"
                id="figure-string"
                value={currentFigureString}
                readOnly
                className="mt-1 bg-gray-50 border-gray-300 text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-md p-0"
                onClick={handleCopyClick}
                disabled={isCopied}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="zoom" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Zoom
            </Label>
            <Slider
              id="zoom"
              defaultValue={[zoom]}
              min={50}
              max={200}
              step={1}
              onValueChange={handleZoomChange}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <Label htmlFor="hotel" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Hotel
            </Label>
            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger className="w-full mt-1 text-sm">
                <SelectValue placeholder="Selecione o Hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="br">Habbo BR/PT</SelectItem>
                <SelectItem value="com">Habbo USA</SelectItem>
                <SelectItem value="es">Habbo ES</SelectItem>
                <SelectItem value="fr">Habbo FR</SelectItem>
                <SelectItem value="de">Habbo DE</SelectItem>
                <SelectItem value="it">Habbo IT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Gênero
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Button
                variant={selectedGender === 'M' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGender('M')}
              >
                Masculino
              </Button>
              <Button
                variant={selectedGender === 'F' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGender('F')}
              >
                Feminino
              </Button>
            </div>
          </div>

          <Button variant="secondary" className="w-full mt-4 volter-font text-xs" onClick={handleRandomizeFigure}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Randomizar Roupa
          </Button>
        </div>
      </div>

      {/* Right Panel - Asset Selection */}
      <div className="flex-1 flex flex-col border-l border-gray-300">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 border-b border-gray-300">
            <TabsTrigger value="habbo" className="volter-font text-xs">Habbo Oficial</TabsTrigger>
            <TabsTrigger value="viajovem" className="volter-font text-xs">ViaJovem</TabsTrigger>
            <TabsTrigger value="flash" className="volter-font text-xs">Flash Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="habbo" className="flex-1 overflow-hidden">
            <OfficialHabboClothingGrid
              selectedGender={selectedGender}
              selectedHotel={selectedHotel}
              onItemSelect={handleItemSelect}
              selectedItem={selectedItem}
              selectedColor={selectedColor}
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="viajovem" className="flex-1 overflow-hidden">
            <ViaJovemClothingGrid
              selectedGender={selectedGender}
              selectedHotel={selectedHotel}
              onItemSelect={handleViaJovemItemSelect}
              selectedItem={selectedItem}
              selectedColor={selectedColor}
              currentFigureString={currentFigureString}
              onRestoreFigure={restoreFigure}
              className="h-full"
            />
          </TabsContent>

          <TabsContent value="flash" className="flex-1 overflow-hidden">
            <FlashAssetsV3Complete />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
