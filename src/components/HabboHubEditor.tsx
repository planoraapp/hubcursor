import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Palette, User, Crown, Shirt, PaintBucket, Footprints, Glasses } from 'lucide-react';
import { useUnifiedHabboClothing } from '@/hooks/useUnifiedHabboClothing';

const CATEGORY_CONFIG = {
  hd: { name: 'Rosto', icon: User },
  hr: { name: 'Cabelo', icon: Crown },
  ch: { name: 'Camiseta', icon: Shirt },
  lg: { name: 'Calça', icon: PaintBucket },
  sh: { name: 'Sapatos', icon: Footprints },
  ha: { name: 'Chapéu', icon: Crown },
  ea: { name: 'Óculos', icon: Glasses },
  fa: { name: 'Rosto Acc', icon: User },
  cc: { name: 'Casaco', icon: Shirt },
  ca: { name: 'Peito Acc', icon: PaintBucket },
  wa: { name: 'Cintura', icon: PaintBucket },
  cp: { name: 'Estampa', icon: Palette }
};

import HabboWidgetsEditor from './HabboEditor/HabboWidgetsEditor';

const HabboHubEditor = () => {
  // Usar o novo sistema HabboWidgets ao invés do sistema anterior
  return <HabboWidgetsEditor />;
};

export default HabboHubEditor;
