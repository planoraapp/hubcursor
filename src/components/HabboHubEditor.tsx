
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Palette, User, Crown, Shirt, PaintBucket, Footprints, Glasses } from 'lucide-react';

// Importar o novo sistema unificado
import HabboWidgetsEditor from './HabboEditor/HabboWidgetsEditor';

const HabboHubEditor = () => {
    // Usar o novo sistema HabboWidgets que agora é o sistema unificado
  return <HabboWidgetsEditor />;
};

export default HabboHubEditor;
