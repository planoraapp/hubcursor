import React, { useState, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Habbo হোটেলSelect } from '../HabboHotelSelect';
import { GenderButtons } from '../GenderButtons';
import { Button } from '@/components/ui/button';
import { AvatarImage } from '@/components/ui/avatar';
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronsUpDown } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "@/components/ui/use-toast"
import { useFlashAssetsViaJovem } from '@/hooks/useFlashAssetsViaJovem';
import FlashAssetsV3Complete from '../HabboEditor/FlashAssetsV3Complete';
import ViaJovemClothingGrid from './ViaJovemClothingGrid';
import OfficialHabboClothingGrid from './OfficialHabboClothingGrid';

export default function OfficialHabboEditor() {
  const [selectedHotel, setSelectedHotel] = useState('br');
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("habbo");
  const [currentFigureString, setCurrentFigureString] = useState('ch-210-66.lg-270-82.sh-305-62.hr-100-61.hd-180-1');

	const restoreFigure = useCallback((figureString: string) => {
		setCurrentFigureString(figureString);
	}, []);

  const handleItemSelect = (item: any, colorId?: string) => {
    setSelectedItem(item.id);
    setSelectedColor(colorId || '1');
    console.log('Selected Item:', item);
    console.log('Selected Color:', colorId);
  };

  const handleViaJovemItemSelect = (item: any, colorId: string) => {
    setSelectedItem(item.id);
    setSelectedColor(colorId);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel - Avatar Preview and Controls */}
      <div className="w-80 p-4 border-r border-gray-300">
        <h2 className="text-lg font-semibold mb-4 volter-font">Editor de Avatar</h2>

        <Habbo হোটেলSelect selectedHotel={selectedHotel} onHotelChange={setSelectedHotel} />

        <GenderButtons selectedGender={selectedGender} onGenderChange={setSelectedGender} />

        <div className="mb-4">
          <AvatarImage
            src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${currentFigureString}&size=l&direction=2&head_direction=2&gesture=sml`}
            alt="Avatar Preview"
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="figureString" className="block text-sm font-medium text-gray-700">
            Figure String
          </Label>
          <Input
            type="text"
            id="figureString"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={currentFigureString}
            onChange={(e) => setCurrentFigureString(e.target.value)}
          />
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
