import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Package, 
  Utensils, 
  Coffee, 
  Candy, 
  Wrench, 
  Smartphone, 
  RefreshCw, 
  Download, 
  Filter, 
  Eye, 
  Zap, 
  AlertCircle,
  Database,
  Globe,
  Image as ImageIcon,
  Copy,
  Link
} from 'lucide-react';
import { habboApiService, HabboHanditem, HabboFurni } from '@/services/HabboAPIService';
import { habboDataExtractor, ExtractedHanditem } from '@/utils/habboDataExtractor';
import { useToast } from '@/hooks/use-toast';

interface UnifiedCatalogProps {
  onHanditemSelect?: (handitem: HabboHanditem) => void;
  onFurniSelect?: (furni: HabboFurni) => void;
}

export const UnifiedCatalog: React.FC<UnifiedCatalogProps> = ({ 
  onHanditemSelect, 
  onFurniSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [handitems, setHanditems] = useState<HabboHanditem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  // Categorias para handitems
  const HANDITEM_CATEGORIES = {
    'Todos': { label: 'Todos', icon: Package },
    'Alimentos': { label: 'Alimentos', icon: Utensils },
    'Bebidas': { label: 'Bebidas', icon: Coffee },
    'Doces': { label: 'Doces', icon: Candy },
    'Utensílios': { label: 'Utensílios', icon: Wrench },
    'Eletrônicos': { label: 'Eletrônicos', icon: Smartphone },
    'Outros': { label: 'Outros', icon: Globe }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  // Debounce para evitar re-renderizações excessivas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (handitems.length > 0) {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [handitems.length]);

  const loadData = async () => {
    setIsLoading(true);
    try {
            const data = await habboApiService.getAllData();
      
      // Mostrar todos os handitems disponíveis
      setHanditems(data.handitems);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados carregados com sucesso!",
        description: `Encontrados ${data.handitems.length} handitems`,
      });
      
          } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
            toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível conectar aos servidores do Habbo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractData = async () => {
    setIsExtracting(true);
    try {
            const report = await habboApiService.discoverHanditemsWithImages();
      
      setHanditems(report.handitems);
      setLastUpdate(new Date());
      
      toast({
        title: "Extração concluída!",
        description: `Descobertos ${report.totalHanditems} handitems`,
      });
      
          } catch (error) {
            toast({
        title: "Erro na extração",
        description: "Não foi possível extrair dados dos servidores do Habbo",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Filtrar handitems
  const filteredHanditems = useMemo(() => {
    let filtered = handitems.filter(item => 
      item.id !== 0 && // Nenhum
      item.id !== 20 && // Lata de Bubblejuice
      item.id !== 21 && // Hambúrger
      item.id !== 22 && // Habbo Limonada
      item.id !== 23 && // Habbo Beterraba
      item.id !== 173 && // Frappucino Banana Deluxe
      item.id !== 244 && // Celular
      item.id !== 1077 // Toalha Spa Verde
    );

    // Filtro por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(item => {
        const name = item.name.toLowerCase();
        switch (selectedCategory) {
          case 'Alimentos':
            return name.includes('hambúrguer') || name.includes('pizza') || name.includes('sanduíche') || 
                   name.includes('frango') || name.includes('carne') || name.includes('peixe') ||
                   name.includes('vegetal') || name.includes('salada') || name.includes('sopa');
          case 'Bebidas':
            return name.includes('café') || name.includes('suco') || name.includes('água') || 
                   name.includes('leite') || name.includes('chá') || name.includes('refrigerante') ||
                   name.includes('bebida') || name.includes('drink') || name.includes('copo');
          case 'Doces':
            return name.includes('doce') || name.includes('açúcar') || name.includes('chocolate') || 
                   name.includes('balas') || name.includes('pirulito') || name.includes('biscoito') ||
                   name.includes('bolo') || name.includes('torta') || name.includes('sorvete');
          case 'Utensílios':
            return name.includes('garfo') || name.includes('faca') || name.includes('colher') || 
                   name.includes('prato') || name.includes('copo') || name.includes('xícara') ||
                   name.includes('tigela') || name.includes('panela') || name.includes('talher');
          case 'Eletrônicos':
            return name.includes('celular') || name.includes('telefone') || name.includes('computador') || 
                   name.includes('tablet') || name.includes('câmera') || name.includes('rádio') ||
                   name.includes('tv') || name.includes('vídeo') || name.includes('eletrônico');
          case 'Outros':
            return !name.includes('hambúrguer') && !name.includes('pizza') && !name.includes('sanduíche') && 
                   !name.includes('café') && !name.includes('suco') && !name.includes('água') &&
                   !name.includes('doce') && !name.includes('açúcar') && !name.includes('chocolate') &&
                   !name.includes('garfo') && !name.includes('faca') && !name.includes('colher') &&
                   !name.includes('celular') && !name.includes('telefone') && !name.includes('computador');
          default:
            return true;
        }
      });
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm) ||
        item.assetPrefix.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [handitems, selectedCategory, searchTerm]);


  // Obter URL da imagem do handitem usando imagens reais
  const getHanditemImageUrl = (handitem: HabboHanditem): string => {
  // Mapeamento de imagens reais da ViaJovem e outras fontes
  const realImages: { [key: number]: string } = {
    // UseItems (drk) - para beber
    1: 'https://i.imgur.com/1BGBH0d.png', // Chá Refrescante
    2: 'https://i.imgur.com/1BGBH0d.png', // Suco
  3: 'https://i.imgur.com/IGVknDZ.png', // Cenoura
  4: 'https://i.imgur.com/8743wmb.png', // Sorvete de Baunilha
  5: 'https://i.imgur.com/Cfa2xdt.png', // Leite
  6: 'https://i.imgur.com/Cfa2xdt.png', // Groselha
  7: 'https://i.imgur.com/Cfa2xdt.png', // Água
  8: 'https://i.imgur.com/1BGBH0d.png', // Café
  9: 'https://i.imgur.com/1BGBH0d.png', // Café Descafeinado
  10: 'https://i.imgur.com/1BGBH0d.png', // café com leite
  11: 'https://i.imgur.com/1BGBH0d.png', // Mocaccino
  12: 'https://i.imgur.com/1BGBH0d.png', // Caffè Macchiato
  13: 'https://i.imgur.com/1BGBH0d.png', // Café Expresso
  14: 'https://i.imgur.com/1BGBH0d.png', // Café Preto
  15: 'https://i.imgur.com/1BGBH0d.png', // Cappuccino
  16: 'https://i.imgur.com/1BGBH0d.png', // Cappuccino
  17: 'https://i.imgur.com/1BGBH0d.png', // Café Java
  18: 'https://i.imgur.com/Cfa2xdt.png', // Água da Torneira
    19: 'https://i.imgur.com/sMTSwiG.png', // Suco Bubblejuice
    24: 'https://i.imgur.com/3JtoDrn.png', // Suco de Bolhas de 1978
  25: 'https://i.imgur.com/VTfFXla.png', // Poção do Amor
  26: 'https://i.imgur.com/SyjIrTP.png', // Calippo
  27: 'https://i.imgur.com/1BGBH0d.png', // Chá Árabe
  28: 'https://i.imgur.com/utYMHeX.png', // Saquê
  29: 'https://i.imgur.com/s05v9hF.png', // Suco de Tomate
  30: 'https://i.imgur.com/O51apy3.png', // Sorvete de chocolate
  31: 'https://i.imgur.com/xzQi9tn.png', // Espumante Rosa
  32: 'https://i.imgur.com/xzQi9tn.png', // Drink de Coco
  33: 'https://i.imgur.com/sMTSwiG.png', // Refrigerante 711
  34: 'https://i.imgur.com/egp6U90.png', // Peixe
  35: 'https://i.imgur.com/4qHA9BV.png', // Champanhe
  36: 'https://i.imgur.com/0u2ZtNJ.png', // Pêra
  37: 'https://i.imgur.com/VStOTCZ.png', // Pêssego Suculento
  38: 'https://i.imgur.com/pDRtHvO.png', // Laranja
  39: 'https://i.imgur.com/AkWndvc.png', // Fatia de Queijo
  40: 'https://i.imgur.com/gekvl8o.png', // Suco de Laranja
  41: 'https://i.imgur.com/1BGBH0d.png', // Café Gourmet
  42: 'https://i.imgur.com/6BKKJUd.png', // Refrigerante de Laranja
  43: 'https://i.imgur.com/KKovhHi.png', // Habbo Refri Geladinho
  44: 'https://i.imgur.com/2xypAeW.png', // Energético Astrobar
  45: 'https://i.imgur.com/Uwby52g.png', // Goma de Mascar Amarela
  46: 'https://i.imgur.com/iW9Ub5D.png', // Goma de Mascar Verde
  47: 'https://i.imgur.com/OdYeZ21.png', // Goma de Mascar Vermelha
  48: 'https://i.imgur.com/Qf6StN8.png', // Pirulito
  49: 'https://i.imgur.com/SU1NHAB.png', // Pote de Iogurte Manchado
  50: 'https://i.imgur.com/B1QltwH.png', // Garrafa de Suco de Bolhas
  51: 'https://i.imgur.com/th9ezI9.png', // Salgadinho Grefusa
  52: 'https://i.imgur.com/mhBVDFW.png', // Salgadinho Cheetos
  53: 'https://i.imgur.com/61rJtrb.png', // Xícara de Café Expresso
  54: 'https://i.imgur.com/8St10JR.png', // Tigela de Cereais
  55: 'https://i.imgur.com/1kBUAeJ.png', // Garrafa de Pepsi
  56: 'https://i.imgur.com/mhBVDFW.png', // Salgadinho Cheetos Hot-dog
  57: 'https://i.imgur.com/s05v9hF.png', // Refrigerante de Cereja
  58: 'https://i.imgur.com/xPRXcn9.png', // Sangue fresco
  59: 'https://i.imgur.com/1Qo9v0o.png', // Saco de Moedas
  60: 'https://i.imgur.com/ImwPJAa.png', // Castanhas
  61: 'https://i.imgur.com/I0VBDys.png', // Garrafinha de Suco de Laranja
  62: 'https://i.imgur.com/kRKUkAv.png', // Água Envenenada
  63: 'https://i.imgur.com/XSaqRZp.png', // Saco de Pipocas
  64: 'https://i.imgur.com/hLVm2nD.png', // Suco de Limão
  65: 'https://i.imgur.com/61rJtrb.png', // Xícara de Café Expresso
  66: 'https://i.imgur.com/JG2Zh9L.png', // Milkshake de Banana
  67: 'https://i.imgur.com/kjDvllH.png', // Chiclete Azul
  68: 'https://i.imgur.com/iOsm5GN.png', // Chiclete Rosa
  69: 'https://i.imgur.com/DsijL6T.png', // Chiclete Verde
  70: 'https://i.imgur.com/3vCJmzZ.png', // Coxa de frango
  71: 'https://i.imgur.com/Z01e7Vm.png', // Torrada
  72: 'https://i.imgur.com/oSWfOEa.png', // Garrafinha de Suco de Pêssego e Maçã
  73: 'https://i.imgur.com/OQSV1F9.png', // Eggnog
  74: 'https://i.imgur.com/ZsA4yEF.png', // Tinta Spray
  75: 'https://i.imgur.com/4UyBReh.png', // Sorvete de Morango
  76: 'https://i.imgur.com/T8q5q6Q.png', // Sorvete de Menta
  77: 'https://i.imgur.com/O51apy3.png', // Sorvete de Chocolate
  78: 'https://i.imgur.com/VIJmJ4J.png', // Algodão Doce Rosa
  79: 'https://i.imgur.com/2EumMVp.png', // Algodão Doce Azul
  80: 'https://i.imgur.com/eSb4TEY.png', // Cachorro-quente
  81: 'https://i.imgur.com/g5SNnOs.png', // Luneta
  82: 'https://i.imgur.com/0xvncjK.png', // Americano
  83: 'https://i.imgur.com/U5YTw0f.png', // Maçã Suculenta
  84: 'https://i.imgur.com/cs6AmF0.png', // Boneco de Biscoito de Gengibre
  85: 'https://i.imgur.com/gO34eGD.png', // Frappuccino
  86: 'https://i.imgur.com/aIAT8v8.png', // Caneca com Água
  87: 'https://i.imgur.com/HKDAdfM.png', // Rum
  88: 'https://i.imgur.com/1c9iAfB.png', // Cupcake
  89: 'https://i.imgur.com/vfJD4FN.png', // Champanhe Rosé
  90: 'https://i.imgur.com/0Fkh9OT.png', // Chá Oriental
  91: 'https://i.imgur.com/uGcEx03.png', // Pincel
  92: 'https://i.imgur.com/NC1DyxN.png', // Goma de Mascar Vermelho
  93: 'https://i.imgur.com/cMJ1aol.png', // Goma de Mascar Rosa
  94: 'https://i.imgur.com/uLvIkBE.png', // Goma de Mascar Verde
  95: 'https://i.imgur.com/XkwghzW.png', // Goma de Mascar Azul
  96: 'https://i.imgur.com/aOcQiGg.png', // Fatia de Bolo
  97: 'https://i.imgur.com/hVV1PqK.png', // Croissant
  98: 'https://i.imgur.com/84YSA2L.png', // Tomate
  99: 'https://i.imgur.com/OQaYwKn.png', // Beringela
  100: 'https://i.imgur.com/D3T1iDy.png', // Repolho
  101: 'https://i.imgur.com/GvMNtEd.png', // Suco Borbulhante
  102: 'https://i.imgur.com/lvfv9bg.png', // Energético
  103: 'https://i.imgur.com/6BKn94N.png', // Banana
  104: 'https://i.imgur.com/ag1c9TQ.png', // Abacate
  105: 'https://i.imgur.com/hiItqwI.png', // Uvas
  106: 'https://i.imgur.com/ugS8uM3.png', // Vitamina
  107: 'https://i.imgur.com/D4O5pwc.png', // Suco de Vegetais
  108: 'https://i.imgur.com/b9bHieW.png', // Haltere
  109: 'https://i.imgur.com/LRKks9w.png', // Hambúrguer
  110: 'https://i.imgur.com/lUD4B0r.png', // Carta
  111: 'https://i.imgur.com/nFJOkaj.png', // Carangueijo
  112: 'https://i.imgur.com/hzl8v5t.png', // Pimenta Malagueta
  113: 'https://i.imgur.com/eDnmJve.png', // Vitamina Cítrica
  114: 'https://i.imgur.com/OElK8Hq.png', // Vitamina Detox
  115: 'https://i.imgur.com/5L0GH2v.png', // Vitamina Framboesa
  116: 'https://i.imgur.com/Urwgzak.png', // Limão
  117: 'https://i.imgur.com/iZ6015l.png', // Cookie
  118: 'https://i.imgur.com/9rnCqKk.png', // Ramune Rosa
  119: 'https://i.imgur.com/fVs2mqq.png', // Ramune Azul
  120: 'https://i.imgur.com/zh86F72.png', // Raspadinha de Mirtilo
  121: 'https://i.imgur.com/Ju9e4bE.png', // Raspadinha de Morango
  122: 'https://i.imgur.com/Nqx4tnl.png', // Espetinho de Takoyaki
  123: 'https://i.imgur.com/7oHrfZb.png', // Caldo Forte
  124: 'https://i.imgur.com/1FvNkj2.png', // Chá Bobba Crepúsculo
  125: 'https://i.imgur.com/vdhIk6o.png', // Chá Bobba Verde
  126: 'https://i.imgur.com/SsYO5eh.png', // Chá Bobba Pink
  127: 'https://i.imgur.com/r6ZHbn4.png', // Sorvete de Casquinha
  128: 'https://i.imgur.com/jPjyRBZ.png', // Sorvete de Carvão
  129: 'https://i.imgur.com/EoRgLYY.png', // Iogurte
  130: 'https://i.imgur.com/oMn0esa.png', // Queijo
  131: 'https://i.imgur.com/WX5N0ch.png', // Pão
  132: 'https://i.imgur.com/Lxp0MNw.png', // Camarão
  133: 'https://i.imgur.com/zwK72Pd.png', // Brócolis
  134: 'https://i.imgur.com/Mopt9SD.png', // Melancia
  135: 'https://i.imgur.com/0ApPE7i.png', // Donut
  136: 'https://i.imgur.com/Vd8gwFP.png', // Linguiças
  137: 'https://i.imgur.com/Vd8gwFP.png', // Picolé
  138: 'https://i.imgur.com/0kTsS3u.png', // Saco de Salgadinhos Aberto
  139: 'https://i.imgur.com/cs6AmF0.png', // Boneco de Biscoito de Gengibre
  140: 'https://i.imgur.com/rNmvNaT.png', // Marreta
  141: 'https://i.imgur.com/XH41ETY.png', // Ovo de Páscoa Cintilante
  142: 'https://i.imgur.com/68mQXVk.png', // Bebida Glacial
  143: 'https://i.imgur.com/6bsmt5u.png', // Banana com Chocolate
  144: 'https://i.imgur.com/9q9fXzE.png', // Morango com Chocolate
  145: 'https://i.imgur.com/gO34eGD.png', // Frappuccino
  146: 'https://i.imgur.com/DOAmruo.png', // Café Barista
  147: 'https://i.imgur.com/HbBXdEx.png', // Garrafa de Fanta
  148: 'https://i.imgur.com/QDCzoJT.png', // Lupa
  149: 'https://i.imgur.com/3LTCxQc.png', // Café com Chantilly
  150: 'https://i.imgur.com/hvTONBL.png', // Dalgona com Estrela
  151: 'https://i.imgur.com/FqS9Qab.png', // Dalgona com Círculo
  152: 'https://i.imgur.com/rk9cz7e.png', // Dalgona com Quadrado
  153: 'https://i.imgur.com/AURe8uR.png', // Torrada Hello Kitty
  154: 'https://i.imgur.com/Gu12HUS.png', // Poção Kryptomon Rosa
  155: 'https://i.imgur.com/5gqY9E1.png', // Refrigerante Bear
  156: 'https://i.imgur.com/AOzPq0A.png', // Caveira de Doces Rosa
  157: 'https://i.imgur.com/8zO0WgQ.png', // handitem158
  158: 'https://i.imgur.com/8zO0WgQ.png', // handitem158
  159: 'https://i.imgur.com/pReevAV.png', // Suco de Pêra
  160: 'https://i.imgur.com/2BWnoA3.png', // handitem160
  161: 'https://i.imgur.com/VS7oBi4.png', // handitem161
  162: 'https://i.imgur.com/G1U31G2.png', // handitem162
  163: 'https://i.imgur.com/0V7AZLL.png', // Sorvete Arco-Íris
  165: 'https://i.imgur.com/S89htlF.png', // Palitinho de Marshmallow
  166: 'https://i.imgur.com/m5Gmc1b.png', // Cupcake
  167: 'https://i.imgur.com/I1mb8xq.png', // Sorvetinho de Baunilha
  168: 'https://i.imgur.com/VLS4wXW.png', // Batata
  169: 'https://i.imgur.com/eNSOAhz.png', // Coxinha
  170: 'https://i.imgur.com/zhBCfVQ.png', // Bolo Pato
  171: 'https://i.imgur.com/jE3xT86.png', // Bolo Pato
  172: 'https://i.imgur.com/nWz2OMW.png', // Milkshake de Banana
  
  // CarryItems (crr) - para carregar
  1000: 'https://i.imgur.com/4gM6r6C.png', // Rosa
  1001: 'https://i.imgur.com/Zlu6ifO.png', // Rosa Negra
  1002: 'https://i.imgur.com/mQLKw3q.png', // Girassol
  1003: 'https://i.imgur.com/U2INTQY.png', // Livro Vermelho
  1004: 'https://i.imgur.com/fMJCUfp.png', // Livro Azul
  1005: 'https://i.imgur.com/MhMAMqQ.png', // Livro Verde
  1006: 'https://i.imgur.com/f8uG7pZ.png', // Flor de Presente
  1007: 'https://i.imgur.com/eXHHu6D.png', // Margarida Azul
  1008: 'https://i.imgur.com/ABbnvpD.png', // Margarida Amarela
  1009: 'https://i.imgur.com/RGPciQ6.png', // Margarida Rosa
  1011: 'https://i.imgur.com/kDLYfkl.png', // Prancheta
  1013: 'https://i.imgur.com/xuN1fLJ.png', // Comprimidos
  1014: 'https://i.imgur.com/u8R1Arz.png', // Seringa
  1015: 'https://i.imgur.com/YsCW8uV.png', // Bolsa de Resíduos Hospitalares
  1019: 'https://i.imgur.com/j3dHXD2.png', // Flor Bolly
  1021: 'https://i.imgur.com/SXgKTxX.png', // Jacinto Vermelho
  1022: 'https://i.imgur.com/2LnEO6a.png', // Jacinto Azul
  1023: 'https://i.imgur.com/bUo4kc0.png', // Poinsétia
  1024: 'https://i.imgur.com/A8TcY5X.png', // Panetone
  1025: 'https://i.imgur.com/UUxDAu9.png', // Bengala Doce
  1026: 'https://i.imgur.com/XbOEmiO.png', // Presente
  1027: 'https://i.imgur.com/6cTRrdL.png', // Vela Vermelha
  1028: 'https://i.imgur.com/cmsYdd4.png', // Tigela de Cereal
  1029: 'https://i.imgur.com/zcAjUIW.png', // Bexiga Bege
  1030: 'https://i.imgur.com/2bz2O5O.png', // HiPad
  1031: 'https://i.imgur.com/j36RF3O.png', // Tocha Habbolímpica
  1032: 'https://i.imgur.com/LnH1hO7.png', // Major Tom
  1033: 'https://i.imgur.com/HUOu7SX.png', // OVNI
  1034: 'https://i.imgur.com/0bm49KB.png', // Alienígena
  1035: 'https://i.imgur.com/DC9bwgO.png', // Osso
  1036: 'https://i.imgur.com/mzDcp8Q.png', // Pato de Borracha Viscoso
  1037: 'https://i.imgur.com/441jOt4.png', // Cobra
  1038: 'https://i.imgur.com/wSurn66.png', // Graveto
  1039: 'https://i.imgur.com/NFpQBxp.png', // Mão Decepada
  1040: 'https://i.imgur.com/KTvaGLH.png', // Coração Animal
  1041: 'https://i.imgur.com/cTQnLjz.png', // Lula
  1042: 'https://i.imgur.com/tOJdRTq.png', // Bat-Cocô
  1043: 'https://i.imgur.com/xDun8y8.png', // Verme
  1044: 'https://i.imgur.com/d2MSXaW.png', // Rato Morto
  1045: 'https://i.imgur.com/v7se7eU.png', // Dentadura
  1046: 'https://i.imgur.com/cVgXOXN.png', // Creme Clearasil
  1047: 'https://i.imgur.com/yMgBRfJ.png', // Pelouro
  1048: 'https://i.imgur.com/6D7nEX7.png', // Bandeira Ditch the Label Preta
  1049: 'https://i.imgur.com/rNmvNaT.png', // Marreta
  1050: 'https://i.imgur.com/XH41ETY.png', // Ovo de Páscoa
  1051: 'https://i.imgur.com/uGcEx03.png', // Pincel
  1052: 'https://i.imgur.com/CTp3zua.png', // Bandeira Ditch the Label Branca
  1053: 'https://i.imgur.com/3EL82RT.png', // Pato
  1054: 'https://i.imgur.com/cllQmtf.png', // Bexiga Laranja
  1055: 'https://i.imgur.com/o06TD0y.png', // Bexiga Verde
  1056: 'https://i.imgur.com/NTQgVKL.png', // Bexiga Azul
  1057: 'https://i.imgur.com/262gZxw.png', // Bexiga Rosa
  1058: 'https://i.imgur.com/DqBzgIQ.png', // Lampião
  1059: 'https://i.imgur.com/7OVjtWi.png', // Papel Higiênico
  1060: 'https://i.imgur.com/ZsA4yEF.png', // Tinta Spray
  1061: 'https://i.imgur.com/jCA08OY.png', // Cravo-de-tunes
  1062: 'https://i.imgur.com/AOzPq0A.png', // Caveira de Doces Rosa
  1063: 'https://i.imgur.com/pf0yYFz.png', // Caveira de Doces Verde
  1064: 'https://i.imgur.com/EkBdALa.png', // Caveira de Doces Azul
  1065: 'https://i.imgur.com/foeO33o.png', // Boneca Emília
  1066: 'https://i.imgur.com/2KYDnrl.png', // Ursinho
  1067: 'https://i.imgur.com/7M2EfPk.png', // Soldadinho
  1068: 'https://i.imgur.com/zLfpjYf.png', // Revista de Mangá
  1069: 'https://i.imgur.com/QBwlUUd.png', // Revista em Quadrinhos
  1070: 'https://i.imgur.com/nknKfKH.png', // Livro Amarelo
  1071: 'https://i.imgur.com/Fgcdsyn.png', // HiPad Dourado
  1072: 'https://i.imgur.com/EGiNJXo.png', // Bússola
  1073: 'https://i.imgur.com/T3u15aH.png', // Ovo Dino
  1074: 'https://i.imgur.com/UHrwe8a.png', // Alossauro Verde
  1075: 'https://i.imgur.com/lbNC1v2.png', // Tricerátopo Amarelo
  1076: 'https://i.imgur.com/WmCZiqq.png', // Saurolofo Roxo
  1078: 'https://i.imgur.com/wtziU5n.png', // Espetinho de Lagartixa
  1079: 'https://i.imgur.com/se0ANSR.png', // Besouro Lucano
  1080: 'https://i.imgur.com/ZqwFSAi.png', // Besouro Rinoceronte
  1081: 'https://i.imgur.com/GtPaVOv.png', // Regador
  1082: 'https://i.imgur.com/AVLbjLD.png', // Bandeira do Orgulho
  1083: 'https://i.imgur.com/uumALYT.png', // Abóbora de Arrepiar
  1084: 'https://i.imgur.com/ZUUKd4L.png', // Sacola de Compras
  1085: 'https://i.imgur.com/2rncx7N.png', // DVD Ação
  1086: 'https://i.imgur.com/XzzGms4.png', // DVD Terror
  1087: 'https://i.imgur.com/6MYtIcr.png', // Caderno
  1088: 'https://i.imgur.com/6LMu0DK.png', // Lápis
  1089: 'https://i.imgur.com/82QgwIn.png', // Saco de Salgadinhos Lacrado
  1090: 'https://i.imgur.com/VtfRFvS.png', // Vara de Pescar com Peixe
  1091: 'https://i.imgur.com/65zXMEe.png', // Vara de Pescar com uma Bota Velha
  1092: 'https://i.imgur.com/r57dZf0.png', // Vara de Pescar com uma Mensagem na Garrafa
  1093: 'https://i.imgur.com/TbcOCsD.png', // Bandeira Ditch the Label Dourada
  1094: 'https://i.imgur.com/wZfJmho.png', // Espada
  1095: 'https://i.imgur.com/WB20uCW.png', // Coração
  1096: 'https://i.imgur.com/EIaep5m.png', // Celular
  1097: 'https://i.imgur.com/pXaI2XQ.png', // Vasinho com Muda
  1098: 'https://i.imgur.com/OT2dhUQ.png', // Robozinho
  1099: 'https://i.imgur.com/HfNo578.png', // Ursinho Teddy
  1100: 'https://i.imgur.com/9flhPhK.png', // Pato Férias
  1101: 'https://i.imgur.com/N0JwJIv.png', // Bola de Futebol
  1102: 'https://i.imgur.com/3ucrzut.png', // Taco do Diálogo
  1103: 'https://i.imgur.com/btLSfhl.png', // Bola de Tênis
  1104: 'https://i.imgur.com/Ey281Fk.png', // H-Phone
  1105: 'https://i.imgur.com/QuhGoIF.png', // Microfone DR Sports
  1106: 'https://i.imgur.com/ktQPb37.png', // football
  1107: 'https://i.imgur.com/12G8LSK.png', // Astral Bow
  1108: 'https://i.imgur.com/NJOQWy7.png', // Virvontavitsa
  1109: 'https://i.imgur.com/1utVe0S.png', // Saco com peixe
  1110: 'https://i.imgur.com/CVtIBQR.png', // Celular
  1111: 'https://i.imgur.com/XBk4Qjm.png', // Balão de pato
  1112: 'https://i.imgur.com/NZHO8RW.png', // Console
  1113: 'https://i.imgur.com/NVkfwgw.png', // Vela
  1114: 'https://i.imgur.com/KP0IAh0.png', // Coração verde
  1115: 'https://i.imgur.com/gmVMo2i.png', // Chocolate Quente
  1116: 'https://i.imgur.com/2JrZEqZ.png', // Pato Rosa
  1117: 'https://i.imgur.com/X91bzNn.png', // Faca
};
  
    // Usar imagem real se disponível
    if (realImages[handitem.id]) {
      return realImages[handitem.id];
    }
    
    // Fallback: placeholder local
    return '/assets/handitem_placeholder.png';
  };

  // Copiar ID do handitem para a área de transferência
  const copyHanditemId = async (handitem: HabboHanditem) => {const textToCopy = handitem.id.toString();
    
    try {
      // Verificar se navigator existe e tem clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {await navigator.clipboard.writeText(textToCopy);
      } else {// Fallback para navegadores mais antigos ou contextos não seguros
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('execCommand failed');
        }
      }toast({
        title: "ID copiado!",
        description: `${handitem.name} (ID: ${handitem.id}) copiado para a área de transferência`,
      });
    } catch (error) {
      console.error('❌ Erro ao copiar ID:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o ID. Tente selecionar e copiar manualmente: " + textToCopy,
        variant: "destructive",
      });
    }
  };

  // Obter cor do badge baseado no tipo
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'UseItem': return 'default';
      case 'CarryItem': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">

      {/* Controles de busca e filtro */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar handitems ou mobílias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={loadData} 
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={extractData} 
                disabled={isExtracting}
                variant="default"
                className="flex items-center gap-2"
              >
                <Zap className={`h-4 w-4 ${isExtracting ? 'animate-pulse' : ''}`} />
                {isExtracting ? 'Extraindo...' : 'Extrair do Servidor'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Seção de handitems */}
        <div className="w-full space-y-4">
          {/* Filtros de categoria para handitems */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(HANDITEM_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                {category.label}
              </Button>
            ))}
          </div>

          {/* Lista de handitems */}
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-gray-500">Carregando handitems...</p>
                </div>
              </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredHanditems.map((handitem) => (
                <Card 
                  key={`${handitem.assetPrefix}-${handitem.id}`}
                      className="cursor-pointer hover:shadow-md transition-all duration-200 group hover:scale-105"
                      onClick={() => copyHanditemId(handitem)}
                      title="Clique para copiar o ID"
                    >
                      <CardContent className="p-3">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center justify-center">
                            <img 
                              src={getHanditemImageUrl(handitem)} 
                            alt={handitem.name}
                              className="max-w-12 max-h-12 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                            <ImageIcon className="h-6 w-6 text-gray-400 hidden" />
                      </div>
                          <div className="text-center w-full">
                            <h3 className="font-medium text-xs truncate mb-1">
                          {handitem.name}
                        </h3>
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs text-gray-500">
                                ID: {handitem.id}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyHanditemId(handitem);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </ScrollArea>
                      </div>
    </div>
  );
};

