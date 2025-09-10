import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Search, Package, Utensils, Coffee, Candy, Wrench, Smartphone, Gamepad2, RefreshCw, Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';


interface HanditemData {
  name: string;
  webId: number;
  inGameId: number;
  iconUrl: string;
  categoryType: string;
}

interface MobiData {
  name: string;
  furniId: string;
  imageUrl: string;
  iconUrl: string;
  function: string;
  handitems: HanditemData[];
}



const MAIN_CATEGORIES = {
  'Todos': { label: 'Todos', icon: Package, subCategories: [] },
  'Alimentos': { label: 'Alimentos', icon: Utensils, subCategories: ['Vegetais', 'Frutas', 'Laticínios', 'Carnes', 'Pães', 'Nozes', 'Salgados', 'Frutos do Mar'] },
  'Bebidas': { label: 'Bebidas', icon: Coffee, subCategories: ['Suco', 'Chá', 'Energéticos', 'Alcoólicas', 'Milkshakes', 'Refrigerantes', 'Água', 'Sopas', 'Laticínios', 'Café', 'Especiais'] },
  'Doces': { label: 'Doces', icon: Candy, subCategories: ['Sorvetes', 'Gomas', 'Chicletes', 'Pirulitos', 'Algodão Doce', 'Diversos'] },
  'Utensílios': { label: 'Utensílios', icon: Wrench, subCategories: ['Ferramentas', 'Escritório', 'Saúde', 'Laboratório'] },
  'Eletrônicos': { label: 'Eletrônicos', icon: Smartphone, subCategories: ['Tablets', 'Celulares', 'Diversos'] },
  'Outros': { label: 'Outros', icon: Gamepad2, subCategories: ['Plantas e Flores', 'Animais', 'Diversos'] }
};

const MOBIS_DATA: MobiData[] = [
  // === BEBIDAS E BARRAS ===
  {
    name: "Frigobar",
    furniId: "bar_polyfon",
    imageUrl: "https://habboapi.site/api/image/bar_polyfon",
    iconUrl: "https://habbofurni.com/furni_assets/48082/bar_polyfon_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Suco", webId: 6, inGameId: 2, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Suco" },
      { name: "Chá Árabe", webId: 6, inGameId: 27, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png", categoryType: "Bebidas - Chá" },
    ]
  },
  {
    name: "Quiosque Tiki Baladeiro",
    furniId: "xmas14_tikibar",
    imageUrl: "https://habboapi.site/api/image/xmas14_tikibar",
    iconUrl: "https://habbofurni.com/furni_assets/56170/xmas14_tikibar_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Espumante Rosa", webId: 45, inGameId: 31, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png", categoryType: "Bebidas - Alcoólicas" },
    ]
  },
  {
    name: "Geladeira Bling HC",
    furniId: "hc17_11",
    imageUrl: "https://habboapi.site/api/image/hc17_11",
    iconUrl: "https://habbofurni.com/furni_assets/63905/hc17_11_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Champanhe", webId: 47, inGameId: 35, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png", categoryType: "Bebidas - Alcoólicas" },
    ]
  },
  {
    name: "Máquina de Café",
    furniId: "mall_r17_coffeem",
    imageUrl: "https://habboapi.site/api/image/mall_r17_coffeem",
    iconUrl: "https://habbofurni.com/furni_assets/63018/mall_r17_coffeem_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Café Expresso", webId: 3, inGameId: 4, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png", categoryType: "Bebidas - Café" },
    ]
  },
  {
    name: "Pia",
    furniId: "sink",
    imageUrl: "https://habboapi.site/api/image/sink",
    iconUrl: "https://habbofurni.com/furni_assets/48082/sink_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Água da Torneira", webId: 1, inGameId: 18, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Água" },
    ]
  },

  // === ALIMENTOS E COZINHA ===
  {
    name: "Freezer",
    furniId: "ktchn_fridge",
    imageUrl: "https://habboapi.site/api/image/ktchn_fridge",
    iconUrl: "https://habbofurni.com/furni_assets/48082/ktchn_fridge_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Cenoura", webId: 2, inGameId: 3, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_carrot.png", categoryType: "Alimentos - Vegetais" },
      { name: "Pêra", webId: 50, inGameId: 36, iconUrl: "https://i.imgur.com/0u2ZtNJ.png", categoryType: "Alimentos - Frutas" },
      { name: "Pêssego Suculento", webId: 51, inGameId: 37, iconUrl: "https://i.imgur.com/VStOTCZ.png", categoryType: "Alimentos - Frutas" },
      { name: "Laranja", webId: 52, inGameId: 38, iconUrl: "https://i.imgur.com/pDRtHvO.png", categoryType: "Alimentos - Frutas" },
      { name: "Fatia de Queijo", webId: 53, inGameId: 39, iconUrl: "https://i.imgur.com/AkWndvc.png", categoryType: "Alimentos - Laticínios" },
    ]
  },

  // === LABORATÓRIO E SAÚDE ===
  {
    name: "Estante de Laboratório",
    furniId: "hween_c18_medicineshelf",
    imageUrl: "https://habboapi.site/api/image/hween_c18_medicineshelf",
    iconUrl: "https://habbofurni.com/furni_assets/64483/hween_c18_medicineshelf_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Suco Bubblejuice", webId: 5, inGameId: 19, iconUrl: "https://i.imgur.com/sMTSwiG.png", categoryType: "Bebidas - Suco" },
      { name: "Seringa", webId: 90, inGameId: 1014, iconUrl: "https://i.imgur.com/u8R1Arz.png", categoryType: "Utensílios - Saúde" },
      { name: "Energético Astrobar", webId: 56, inGameId: 44, iconUrl: "https://i.imgur.com/2xypAeW.png", categoryType: "Bebidas - Energéticos" },
    ]
  },

  // === NOVOS MOBIS BASEADOS EM FONTES EXTERNAS ===
  {
    name: "Barraquinha de Sorvete",
    furniId: "hblooza_icecream",
    imageUrl: "https://habboapi.site/api/image/hblooza_icecream",
    iconUrl: "https://habbofurni.com/furni_assets/56737/hblooza_icecream_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sorvete de Baunilha", webId: 4, inGameId: 4, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
      { name: "Sorvete de Morango", webId: 75, inGameId: 75, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
      { name: "Sorvete de Menta", webId: 76, inGameId: 76, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
      { name: "Sorvete de Chocolate", webId: 77, inGameId: 77, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
    ]
  },
  {
    name: "Barraquinha de Suco",
    furniId: "hblooza_bubblejuice",
    imageUrl: "https://habboapi.site/api/image/hblooza_bubblejuice",
    iconUrl: "https://habbofurni.com/furni_assets/46347/hblooza_bubblejuice_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Habbo Cola", webId: 5, inGameId: 19, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png", categoryType: "Bebidas - Refrigerantes" },
    ]
  },
  {
    name: "Palooza Quiosque",
    furniId: "hblooza_kiosk",
    imageUrl: "https://habboapi.site/api/image/hblooza_kiosk",
    iconUrl: "https://habbofurni.com/furni_assets/46476/hblooza_kiosk_icon.png",
    function: "Segurar e Comer/Beber",
    handitems: [
      { name: "Câmera", webId: 20, inGameId: 20, iconUrl: "https://i.imgur.com/camera.png", categoryType: "Eletrônicos - Diversos" },
      { name: "Hambúrguer", webId: 21, inGameId: 21, iconUrl: "https://i.imgur.com/burger.png", categoryType: "Alimentos - Carnes" },
      { name: "Calippo", webId: 26, inGameId: 26, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_calippo.png", categoryType: "Doces - Pirulitos" },
      { name: "Espumante Rosa", webId: 31, inGameId: 31, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png", categoryType: "Bebidas - Alcoólicas" },
      { name: "Pêra", webId: 36, inGameId: 36, iconUrl: "https://i.imgur.com/0u2ZtNJ.png", categoryType: "Alimentos - Frutas" },
      { name: "Maçã", webId: 37, inGameId: 37, iconUrl: "https://i.imgur.com/apple.png", categoryType: "Alimentos - Frutas" },
      { name: "Laranja", webId: 38, inGameId: 38, iconUrl: "https://i.imgur.com/pDRtHvO.png", categoryType: "Alimentos - Frutas" },
      { name: "Abacaxi", webId: 39, inGameId: 39, iconUrl: "https://i.imgur.com/pineapple.png", categoryType: "Alimentos - Frutas" },
    ]
  },
  {
    name: "Barraquinha de bebidas",
    furniId: "hblooza14_drinkstall",
    imageUrl: "https://habboapi.site/api/image/hblooza14_drinkstall",
    iconUrl: "https://habbofurni.com/furni_assets/54309/hblooza14_drinkstall_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Habbo Soda de Limão", webId: 22, inGameId: 22, iconUrl: "https://i.imgur.com/lemon_soda.png", categoryType: "Bebidas - Refrigerantes" },
      { name: "Habbo Soda de Beterraba", webId: 23, inGameId: 23, iconUrl: "https://i.imgur.com/beet_soda.png", categoryType: "Bebidas - Refrigerantes" },
      { name: "Suco de Bolhas de 1978", webId: 24, inGameId: 24, iconUrl: "https://i.imgur.com/bubble_juice.png", categoryType: "Bebidas - Suco" },
      { name: "Poção do Amor", webId: 25, inGameId: 25, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png", categoryType: "Bebidas - Especiais" },
      { name: "Calippo", webId: 26, inGameId: 26, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_calippo.png", categoryType: "Doces - Pirulitos" },
      { name: "Delícia de Coco", webId: 32, inGameId: 32, iconUrl: "https://i.imgur.com/coconut_delight.png", categoryType: "Doces - Diversos" },
      { name: "Tubo de Ensaio", webId: 44, inGameId: 44, iconUrl: "https://i.imgur.com/test_tube.png", categoryType: "Utensílios - Laboratório" },
      { name: "Moodi Laranja", webId: 45, inGameId: 45, iconUrl: "https://i.imgur.com/moodi_orange.png", categoryType: "Bebidas - Energéticos" },
      { name: "Moodi Verde", webId: 46, inGameId: 46, iconUrl: "https://i.imgur.com/moodi_green.png", categoryType: "Bebidas - Energéticos" },
      { name: "Moodi Vermelho", webId: 47, inGameId: 47, iconUrl: "https://i.imgur.com/moodi_red.png", categoryType: "Bebidas - Energéticos" },
      { name: "Refrigerante de Cereja", webId: 57, inGameId: 57, iconUrl: "https://i.imgur.com/cherry_soda.png", categoryType: "Bebidas - Refrigerantes" },
      { name: "Milkshake de Banana", webId: 66, inGameId: 66, iconUrl: "https://i.imgur.com/banana_milkshake.png", categoryType: "Bebidas - Laticínios" },
      { name: "Goma de Mascar Azul", webId: 67, inGameId: 67, iconUrl: "https://i.imgur.com/gum_blue.png", categoryType: "Doces - Gomas" },
      { name: "Goma de Mascar Vermelha", webId: 68, inGameId: 68, iconUrl: "https://i.imgur.com/gum_red.png", categoryType: "Doces - Gomas" },
      { name: "Goma de Mascar Verde", webId: 69, inGameId: 69, iconUrl: "https://i.imgur.com/gum_green.png", categoryType: "Doces - Gomas" },
      { name: "Torrada", webId: 71, inGameId: 71, iconUrl: "https://i.imgur.com/toast.png", categoryType: "Alimentos - Pães" },
      { name: "Egg Nog", webId: 73, inGameId: 73, iconUrl: "https://i.imgur.com/egg_nog.png", categoryType: "Bebidas - Laticínios" },
      { name: "Taça de Brinde", webId: 74, inGameId: 74, iconUrl: "https://i.imgur.com/toasting_goblet.png", categoryType: "Bebidas - Alcoólicas" },
      { name: "Chiclete Azul", webId: 92, inGameId: 92, iconUrl: "https://i.imgur.com/gum_blue.png", categoryType: "Doces - Chicletes" },
      { name: "Chiclete Vermelho", webId: 93, inGameId: 93, iconUrl: "https://i.imgur.com/gum_red.png", categoryType: "Doces - Chicletes" },
      { name: "Chiclete Verde", webId: 94, inGameId: 94, iconUrl: "https://i.imgur.com/gum_green.png", categoryType: "Doces - Chicletes" },
    ]
  },
  {
    name: "Máquina de Refrigerantes",
    furniId: "hosp_c19_drinksvend",
    imageUrl: "https://habboapi.site/api/image/hosp_c19_drinksvend",
    iconUrl: "https://habbofurni.com/furni_assets/64533/hosp_c19_drinksvend_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Suco de Tomate", webId: 28, inGameId: 28, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_tomato.png", categoryType: "Bebidas - Suco" },
      { name: "Líquido Radioativo", webId: 29, inGameId: 29, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_radioactive.png", categoryType: "Bebidas - Especiais" },
      { name: "Suco de Laranja", webId: 42, inGameId: 42, iconUrl: "https://i.imgur.com/pDRtHvO.png", categoryType: "Bebidas - Suco" },
      { name: "Refrigerante Gelado", webId: 43, inGameId: 43, iconUrl: "https://i.imgur.com/chilled_soda.png", categoryType: "Bebidas - Refrigerantes" },
    ]
  },
  {
    name: "Ponche Maldito",
    furniId: "hween11_punch",
    imageUrl: "https://habbofurni.com/furni_assets/45508/hween11_punch.swf",
    iconUrl: "https://habbofurni.com/furni_assets/45508/hween11_punch_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Peixe", webId: 34, inGameId: 34, iconUrl: "https://i.imgur.com/fish.png", categoryType: "Alimentos - Frutos do Mar" },
    ]
  },
  {
    name: "Barraquinha de Algodão Doce",
    furniId: "hblooza_candyfloss",
    imageUrl: "https://habboapi.site/api/image/hblooza_candyfloss",
    iconUrl: "https://habbofurni.com/furni_assets/46347/hblooza_candyfloss_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Pirulito", webId: 48, inGameId: 48, iconUrl: "https://i.imgur.com/lollipop.png", categoryType: "Doces - Pirulitos" },
      { name: "Algodão Doce Rosa", webId: 79, inGameId: 79, iconUrl: "https://i.imgur.com/cotton_candy_pink.png", categoryType: "Doces - Algodão Doce" },
      { name: "Algodão Doce Azul", webId: 80, inGameId: 80, iconUrl: "https://i.imgur.com/cotton_candy_blue.png", categoryType: "Doces - Algodão Doce" },
      { name: "Homem de Gengibre", webId: 84, inGameId: 84, iconUrl: "https://i.imgur.com/gingerbread_man.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Barraquinha da pipoca",
    furniId: "hblooza_popcorn",
    imageUrl: "https://habboapi.site/api/image/hblooza_popcorn",
    iconUrl: "https://habbofurni.com/furni_assets/46347/hblooza_popcorn_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Pipoca", webId: 63, inGameId: 63, iconUrl: "https://i.imgur.com/popcorn.png", categoryType: "Alimentos - Salgados" },
    ]
  },
  {
    name: "A barraquinha do frango",
    furniId: "hblooza_chicken",
    imageUrl: "https://habboapi.site/api/image/hblooza_chicken",
    iconUrl: "https://habbofurni.com/furni_assets/56746/hblooza_chicken_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Frango", webId: 70, inGameId: 70, iconUrl: "https://i.imgur.com/chicken_leg.png", categoryType: "Alimentos - Carnes" },
    ]
  },
  {
    name: "Vendedor de Hot Dog",
    furniId: "hblooza_hotdog",
    imageUrl: "https://habboapi.site/api/image/hblooza_hotdog",
    iconUrl: "https://habbofurni.com/furni_assets/46347/hblooza_hotdog_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Cachorro-Quente", webId: 81, inGameId: 81, iconUrl: "https://i.imgur.com/hotdog.png", categoryType: "Alimentos - Carnes" },
    ]
  },

  // === MOBIS ESPECIAIS E RAROS ===
  {
    name: "Geladeira Inteligente",
    furniId: "hc21_11",
    imageUrl: "https://habboapi.site/api/image/hc21_11",
    iconUrl: "https://habbofurni.com/furni_assets/66168/hc21_11_icon.png",
    function: "Segurar e Ler",
    handitems: [
      { name: "Rosa Vermelha", webId: 1000, inGameId: 1000, iconUrl: "https://i.imgur.com/red_rose.png", categoryType: "Outros - Plantas e Flores" },
      { name: "Rosa Negra", webId: 1001, inGameId: 1001, iconUrl: "https://i.imgur.com/black_rose.png", categoryType: "Outros - Plantas e Flores" },
      { name: "Girassol", webId: 1002, inGameId: 1002, iconUrl: "https://i.imgur.com/sunflower.png", categoryType: "Outros - Plantas e Flores" },
      { name: "Livro Vermelho", webId: 1003, inGameId: 1003, iconUrl: "https://i.imgur.com/red_book.png", categoryType: "Utensílios - Escritório" },
      { name: "Livro Azul", webId: 1004, inGameId: 1004, iconUrl: "https://i.imgur.com/blue_book.png", categoryType: "Utensílios - Escritório" },
      { name: "Livro Verde", webId: 1005, inGameId: 1005, iconUrl: "https://i.imgur.com/green_book.png", categoryType: "Utensílios - Escritório" },
    ]
  },
  {
    name: "Cama de Hospital",
    furniId: "hosptl_bed",
    imageUrl: "https://habboapi.site/api/image/hosptl_bed",
    iconUrl: "https://habbofurni.com/furni_assets/60192/hosptl_bed_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Prancheta", webId: 1011, inGameId: 1011, iconUrl: "https://i.imgur.com/clipboard.png", categoryType: "Utensílios - Escritório" },
    ]
  },
  {
    name: "Armário de remédios",
    furniId: "hosptl_cab1",
    imageUrl: "https://habboapi.site/api/image/hosptl_cab1",
    iconUrl: "https://habbofurni.com/furni_assets/54764/hosptl_cab1_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Analgésico", webId: 1013, inGameId: 1013, iconUrl: "https://i.imgur.com/painkiller.png", categoryType: "Utensílios - Saúde" },
      { name: "Seringa", webId: 1014, inGameId: 1014, iconUrl: "https://i.imgur.com/u8R1Arz.png", categoryType: "Utensílios - Saúde" },
      { name: "Saco de Resíduos Biológicos", webId: 1015, inGameId: 1015, iconUrl: "https://i.imgur.com/bio_waste_bag.png", categoryType: "Utensílios - Saúde" },
    ]
  },

  // === NOVOS MOBIS ADICIONADOS ===
  
  // === GELADEIRAS E DISPENSADORES ===
  {
    name: "Geladeira Silo Branca",
    furniId: "silo_c24_silofridge*8",
    imageUrl: "https://habboapi.site/api/image/silo_c24_silofridge*8",
    iconUrl: "https://habbofurni.com/furni_assets/48082/silo_c24_silofridge_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Água Gelada", webId: 2001, inGameId: 2001, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Água" },
      { name: "Refrigerante", webId: 2002, inGameId: 2002, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png", categoryType: "Bebidas - Refrigerantes" },
    ]
  },
  {
    name: "Frigobar JääBoost",
    furniId: "habbo25_sc25_drinksdispenser",
    imageUrl: "https://habboapi.site/api/image/habbo25_sc25_drinksdispenser",
    iconUrl: "https://habbofurni.com/furni_assets/48082/habbo25_sc25_drinksdispenser_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Bebida Energética", webId: 2003, inGameId: 2003, iconUrl: "https://i.imgur.com/2xypAeW.png", categoryType: "Bebidas - Energéticos" },
      { name: "Suco Natural", webId: 2004, inGameId: 2004, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Suco" },
    ]
  },
  {
    name: "Dispensador Bebidas Polares",
    furniId: "xmas_c19_stackedicedrinks",
    imageUrl: "https://habboapi.site/api/image/xmas_c19_stackedicedrinks",
    iconUrl: "https://habbofurni.com/furni_assets/48082/xmas_c19_stackedicedrinks_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Bebida Gelada", webId: 2005, inGameId: 2005, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png", categoryType: "Bebidas - Refrigerantes" },
    ]
  },
  {
    name: "Dispensador Usina do Chocolate",
    furniId: "xmas_c23_chocolatedispenser",
    imageUrl: "https://habboapi.site/api/image/xmas_c23_chocolatedispenser",
    iconUrl: "https://habbofurni.com/furni_assets/48082/xmas_c23_chocolatedispenser_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Chocolate Quente", webId: 2006, inGameId: 2006, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png", categoryType: "Bebidas - Café" },
    ]
  },

  // === SORVETEIRAS (UMA COR POR TIPO) ===
  {
    name: "Sorveteira Azul",
    furniId: "rare_icecream*1",
    imageUrl: "https://habboapi.site/api/image/rare_icecream*1",
    iconUrl: "https://habbofurni.com/furni_assets/48082/rare_icecream_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sorvete de Baunilha", webId: 2007, inGameId: 2007, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
      { name: "Sorvete de Morango", webId: 2008, inGameId: 2008, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
    ]
  },
  {
    name: "Sorveteira Chocolate",
    furniId: "rare_icecream*7",
    imageUrl: "https://habboapi.site/api/image/rare_icecream*7",
    iconUrl: "https://habbofurni.com/furni_assets/48082/rare_icecream_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sorvete de Chocolate", webId: 2009, inGameId: 2009, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
    ]
  },
  {
    name: "Sorveteira azul de gelo",
    furniId: "xmas13_icecream",
    imageUrl: "https://habboapi.site/api/image/xmas13_icecream",
    iconUrl: "https://habbofurni.com/furni_assets/48082/xmas13_icecream_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sorvete de Menta", webId: 2010, inGameId: 2010, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
    ]
  },
  {
    name: "Calippo icecream machine",
    furniId: "calippo",
    imageUrl: "https://habboapi.site/api/image/calippo",
    iconUrl: "https://habbofurni.com/furni_assets/48082/calippo_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Calippo", webId: 2011, inGameId: 2011, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_calippo.png", categoryType: "Doces - Pirulitos" },
    ]
  },

  // === MÁQUINAS DE CHICLETES (UMA COR) ===
  {
    name: "Máquina de Chicletes Azul",
    furniId: "diner_gumvendor*6",
    imageUrl: "https://habboapi.site/api/image/diner_gumvendor*6",
    iconUrl: "https://habbofurni.com/furni_assets/48082/diner_gumvendor_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Chiclete Azul", webId: 2012, inGameId: 2012, iconUrl: "https://i.imgur.com/gum_blue.png", categoryType: "Doces - Chicletes" },
      { name: "Chiclete Verde", webId: 2013, inGameId: 2013, iconUrl: "https://i.imgur.com/gum_green.png", categoryType: "Doces - Chicletes" },
      { name: "Chiclete Vermelho", webId: 2014, inGameId: 2014, iconUrl: "https://i.imgur.com/gum_red.png", categoryType: "Doces - Chicletes" },
    ]
  },

  // === MÁQUINAS VENDING ===
  {
    name: "Máquina de Lanche Vegano",
    furniId: "olympics_r16_vendingmchn",
    imageUrl: "https://habboapi.site/api/image/olympics_r16_vendingmchn",
    iconUrl: "https://habbofurni.com/furni_assets/48082/olympics_r16_vendingmchn_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Salada Vegana", webId: 2015, inGameId: 2015, iconUrl: "https://i.imgur.com/salad.png", categoryType: "Alimentos - Vegetais" },
      { name: "Suco Verde", webId: 2016, inGameId: 2016, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Suco" },
    ]
  },

  {
    name: "Máquina de venda de insetos",
    furniId: "tokyo_c18_bugsmachine",
    imageUrl: "https://habboapi.site/api/image/tokyo_c18_bugsmachine",
    iconUrl: "https://habbofurni.com/furni_assets/48082/tokyo_c18_bugsmachine_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Inseto Frito", webId: 2018, inGameId: 2018, iconUrl: "https://i.imgur.com/fried_bug.png", categoryType: "Alimentos - Diversos" },
    ]
  },

  // === QUIOSQUES E LOJAS ===

  {
    name: "Quiosque da piscininha",
    furniId: "lido_kiosk",
    imageUrl: "https://habbofurni.com/furni_assets/48082/lido_kiosk.swf",
    iconUrl: "https://habbofurni.com/furni_assets/48082/lido_kiosk_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Coco Gelado", webId: 2021, inGameId: 2021, iconUrl: "https://i.imgur.com/coconut_delight.png", categoryType: "Bebidas - Diversos" },
      { name: "Protetor Solar", webId: 2022, inGameId: 2022, iconUrl: "https://i.imgur.com/sunscreen.png", categoryType: "Utensílios - Diversos" },
    ]
  },


  // === ALIMENTOS E LANCHES ===
  {
    name: "Pipoqueira",
    furniId: "cine_popcorn",
    imageUrl: "https://habboapi.site/api/image/cine_popcorn",
    iconUrl: "https://habbofurni.com/furni_assets/48082/cine_popcorn_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Pipoca Doce", webId: 2026, inGameId: 2026, iconUrl: "https://i.imgur.com/popcorn.png", categoryType: "Alimentos - Salgados" },
      { name: "Pipoca Salgada", webId: 2027, inGameId: 2027, iconUrl: "https://i.imgur.com/popcorn.png", categoryType: "Alimentos - Salgados" },
    ]
  },
  {
    name: "Hora do lanche",
    furniId: "uni_snacks",
    imageUrl: "https://habboapi.site/api/image/uni_snacks",
    iconUrl: "https://habbofurni.com/furni_assets/48082/uni_snacks_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sanduíche", webId: 2028, inGameId: 2028, iconUrl: "https://i.imgur.com/sandwich.png", categoryType: "Alimentos - Carnes" },
      { name: "Batata Frita", webId: 2029, inGameId: 2029, iconUrl: "https://i.imgur.com/fries.png", categoryType: "Alimentos - Salgados" },
    ]
  },
  {
    name: "Comida Encantada",
    furniId: "easter_c19_forrestfood",
    imageUrl: "https://habboapi.site/api/image/easter_c19_forrestfood",
    iconUrl: "https://habbofurni.com/furni_assets/48082/easter_c19_forrestfood_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Fruta Mágica", webId: 2030, inGameId: 2030, iconUrl: "https://i.imgur.com/0u2ZtNJ.png", categoryType: "Alimentos - Frutas" },
    ]
  },
  {
    name: "Lanche de Picnic",
    furniId: "easter_c20_energyfood",
    imageUrl: "https://habboapi.site/api/image/easter_c20_energyfood",
    iconUrl: "https://habbofurni.com/furni_assets/48082/easter_c20_energyfood_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sanduíche de Picnic", webId: 2031, inGameId: 2031, iconUrl: "https://i.imgur.com/sandwich.png", categoryType: "Alimentos - Carnes" },
    ]
  },

  // === DOCES E GULOSEIMAS ===
  {
    name: "Quiosque de doces",
    furniId: "hblooza14_candystall",
    imageUrl: "https://habboapi.site/api/image/hblooza14_candystall",
    iconUrl: "https://habbofurni.com/furni_assets/48082/hblooza14_candystall_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Bala de Goma", webId: 2032, inGameId: 2032, iconUrl: "https://i.imgur.com/gum_blue.png", categoryType: "Doces - Gomas" },
      { name: "Chocolate", webId: 2033, inGameId: 2033, iconUrl: "https://i.imgur.com/chocolate.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Máquina de doces",
    furniId: "xmas13_candycane1",
    imageUrl: "https://habboapi.site/api/image/xmas13_candycane1",
    iconUrl: "https://habbofurni.com/furni_assets/48082/xmas13_candycane1_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Bengala Doce", webId: 2034, inGameId: 2034, iconUrl: "https://i.imgur.com/lollipop.png", categoryType: "Doces - Pirulitos" },
    ]
  },
  {
    name: "Doces da Dona Caveirinha",
    furniId: "st_hween14_skulls",
    imageUrl: "https://habboapi.site/api/image/st_hween14_skulls",
    iconUrl: "https://habbofurni.com/furni_assets/48082/st_hween14_skulls_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Doce Assombrado", webId: 2035, inGameId: 2035, iconUrl: "https://i.imgur.com/ghost_candy.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Trono dos gulosos",
    furniId: "cland15_candythrone",
    imageUrl: "https://habboapi.site/api/image/cland15_candythrone",
    iconUrl: "https://habbofurni.com/furni_assets/48082/cland15_candythrone_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Coroa de Doces", webId: 2036, inGameId: 2036, iconUrl: "https://i.imgur.com/candy_crown.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Árvore de algodão doce",
    furniId: "cland15_flosstree",
    imageUrl: "https://habboapi.site/api/image/cland15_flosstree",
    iconUrl: "https://habbofurni.com/furni_assets/48082/cland15_flosstree_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Algodão Doce Rosa", webId: 2037, inGameId: 2037, iconUrl: "https://i.imgur.com/cotton_candy_pink.png", categoryType: "Doces - Algodão Doce" },
      { name: "Algodão Doce Azul", webId: 2038, inGameId: 2038, iconUrl: "https://i.imgur.com/cotton_candy_blue.png", categoryType: "Doces - Algodão Doce" },
    ]
  },
  {
    name: "Loja de Doces Vitoriana",
    furniId: "xmas_c17_candyshop",
    imageUrl: "https://habboapi.site/api/image/xmas_c17_candyshop",
    iconUrl: "https://habbofurni.com/furni_assets/48082/xmas_c17_candyshop_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Bombom Vitoriano", webId: 2039, inGameId: 2039, iconUrl: "https://i.imgur.com/victorian_candy.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Bastão Doce",
    furniId: "xmas_c18_candycane",
    imageUrl: "https://habboapi.site/api/image/xmas_c18_candycane",
    iconUrl: "https://habbofurni.com/furni_assets/48082/xmas_c18_candycane_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Bengala Natalina", webId: 2040, inGameId: 2040, iconUrl: "https://i.imgur.com/lollipop.png", categoryType: "Doces - Pirulitos" },
    ]
  },
  {
    name: "Maçã do Terror",
    furniId: "hween_c20_candyapple",
    imageUrl: "https://habboapi.site/api/image/hween_c20_candyapple",
    iconUrl: "https://habbofurni.com/furni_assets/48082/hween_c20_candyapple_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Maçã Assombrada", webId: 2041, inGameId: 2041, iconUrl: "https://i.imgur.com/apple.png", categoryType: "Alimentos - Frutas" },
    ]
  },
  {
    name: "Tigela de Doces Assustadora",
    furniId: "hween_c24_candybowl",
    imageUrl: "https://habboapi.site/api/image/hween_c24_candybowl",
    iconUrl: "https://habbofurni.com/furni_assets/48082/hween_c24_candybowl_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Doce Assombrado", webId: 2042, inGameId: 2042, iconUrl: "https://i.imgur.com/ghost_candy.png", categoryType: "Doces - Diversos" },
    ]
  },





  // === ALIMENTOS PARA PETS ===
  {
    name: "Sardinhas",
    furniId: "petfood2",
    imageUrl: "https://habboapi.site/api/image/petfood2",
    iconUrl: "https://habbofurni.com/furni_assets/48082/petfood2_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sardinha", webId: 2051, inGameId: 2051, iconUrl: "https://i.imgur.com/fish.png", categoryType: "Alimentos - Frutos do Mar" },
    ]
  },
  {
    name: "Salmão",
    furniId: "petfood9",
    imageUrl: "https://habboapi.site/api/image/petfood9",
    iconUrl: "https://habbofurni.com/furni_assets/48082/petfood9_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Salmão", webId: 2052, inGameId: 2052, iconUrl: "https://i.imgur.com/fish.png", categoryType: "Alimentos - Frutos do Mar" },
    ]
  },
  {
    name: "Frango",
    furniId: "petfood8",
    imageUrl: "https://habboapi.site/api/image/petfood8",
    iconUrl: "https://habbofurni.com/furni_assets/48082/petfood8_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Frango", webId: 2053, inGameId: 2053, iconUrl: "https://i.imgur.com/chicken_leg.png", categoryType: "Alimentos - Carnes" },
    ]
  },
  {
    name: "Cenoura",
    furniId: "petfood28",
    imageUrl: "https://habboapi.site/api/image/petfood28",
    iconUrl: "https://habbofurni.com/furni_assets/48082/petfood28_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Cenoura", webId: 2054, inGameId: 2054, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_carrot.png", categoryType: "Alimentos - Vegetais" },
    ]
  },

  // === ALIMENTOS DE PICNIC ===
  {
    name: "Queijo e Frutas",
    furniId: "picnic_food1",
    imageUrl: "https://habboapi.site/api/image/picnic_food1",
    iconUrl: "https://habbofurni.com/furni_assets/48082/picnic_food1_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Queijo", webId: 2055, inGameId: 2055, iconUrl: "https://i.imgur.com/AkWndvc.png", categoryType: "Alimentos - Laticínios" },
      { name: "Uva", webId: 2056, inGameId: 2056, iconUrl: "https://i.imgur.com/0u2ZtNJ.png", categoryType: "Alimentos - Frutas" },
    ]
  },
  {
    name: "Suco de Uva",
    furniId: "picnic_food3",
    imageUrl: "https://habboapi.site/api/image/picnic_food3",
    iconUrl: "https://habbofurni.com/furni_assets/48082/picnic_food3_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Suco de Uva", webId: 2057, inGameId: 2057, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Suco" },
    ]
  },
  {
    name: "Pães e Maçãs",
    furniId: "picnic_food2",
    imageUrl: "https://habboapi.site/api/image/picnic_food2",
    iconUrl: "https://habbofurni.com/furni_assets/48082/picnic_food2_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Pão", webId: 2058, inGameId: 2058, iconUrl: "https://i.imgur.com/toast.png", categoryType: "Alimentos - Pães" },
      { name: "Maçã", webId: 2059, inGameId: 2059, iconUrl: "https://i.imgur.com/apple.png", categoryType: "Alimentos - Frutas" },
    ]
  },

  // === DOCES ESPECIAIS ===
  {
    name: "Bandeja de cupcakes",
    furniId: "ny2015_cctray",
    imageUrl: "https://habboapi.site/api/image/ny2015_cctray",
    iconUrl: "https://habbofurni.com/furni_assets/48082/ny2015_cctray_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Cupcake", webId: 2060, inGameId: 2060, iconUrl: "https://i.imgur.com/cupcake.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Bandeja de bolo",
    furniId: "easter_c17_sweetpastries",
    imageUrl: "https://habboapi.site/api/image/easter_c17_sweetpastries",
    iconUrl: "https://habbofurni.com/furni_assets/48082/easter_c17_sweetpastries_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Bolo", webId: 2061, inGameId: 2061, iconUrl: "https://i.imgur.com/cake.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Doces de Natal",
    furniId: "xmas_c18_food",
    imageUrl: "https://habboapi.site/api/image/xmas_c18_food",
    iconUrl: "https://habbofurni.com/furni_assets/48082/xmas_c18_food_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Biscoito de Natal", webId: 2062, inGameId: 2062, iconUrl: "https://i.imgur.com/christmas_cookie.png", categoryType: "Doces - Diversos" },
    ]
  },
  {
    name: "Doces Medievais",
    furniId: "fantasy_c22_sweetrolls",
    imageUrl: "https://habboapi.site/api/image/fantasy_c22_sweetrolls",
    iconUrl: "https://habbofurni.com/furni_assets/48082/fantasy_c22_sweetrolls_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Pão Doce Medieval", webId: 2063, inGameId: 2063, iconUrl: "https://i.imgur.com/medieval_bread.png", categoryType: "Alimentos - Pães" },
    ]
  },
  {
    name: "Doces Brasileiros",
    furniId: "br_c25_sweetfood",
    imageUrl: "https://habboapi.site/api/image/br_c25_sweetfood",
    iconUrl: "https://habbofurni.com/furni_assets/48082/br_c25_sweetfood_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Brigadeiro", webId: 2064, inGameId: 2064, iconUrl: "https://i.imgur.com/brigadeiro.png", categoryType: "Doces - Diversos" },
    ]
  },

  // === BALCÕES DE COMIDA TÓQUIO ===
  {
    name: "Balcão de Comida Tóquio",
    furniId: "tokyo_c18_snackdisplay",
    imageUrl: "https://habboapi.site/api/image/tokyo_c18_snackdisplay",
    iconUrl: "https://habbofurni.com/furni_assets/48082/tokyo_c18_snackdisplay_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sushi", webId: 2065, inGameId: 2065, iconUrl: "https://i.imgur.com/sushi.png", categoryType: "Alimentos - Frutos do Mar" },
      { name: "Ramen", webId: 2066, inGameId: 2066, iconUrl: "https://i.imgur.com/ramen.png", categoryType: "Alimentos - Diversos" },
    ]
  },
  {
    name: "Balcão de Feira Tóquio",
    furniId: "tokyo_c18_snackdisplay2",
    imageUrl: "https://habboapi.site/api/image/tokyo_c18_snackdisplay2",
    iconUrl: "https://habbofurni.com/furni_assets/48082/tokyo_c18_snackdisplay2_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Takoyaki", webId: 2067, inGameId: 2067, iconUrl: "https://i.imgur.com/takoyaki.png", categoryType: "Alimentos - Diversos" },
    ]
  },

  // === VENDING MACHINES REAIS DA API ===
  
  // === BEBIDAS E BARRAS ESPECIAIS ===
  {
    name: "Samovar Russo",
    furniId: "samovar",
    imageUrl: "https://habboapi.site/api/image/samovar",
    iconUrl: "https://habbofurni.com/furni_assets/45512/samovar_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Chá Russo", webId: 3001, inGameId: 3001, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png", categoryType: "Bebidas - Chá" },
    ]
  },
  {
    name: "Chocomaster",
    furniId: "mocchamaster",
    imageUrl: "https://habboapi.site/api/image/mocchamaster",
    iconUrl: "https://habbofurni.com/furni_assets/45508/mocchamaster_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Chocolate Quente", webId: 3002, inGameId: 3002, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png", categoryType: "Bebidas - Café" },
    ]
  },
  {
    name: "Habbo Máquina de Refrigerante",
    furniId: "md_limukaappi",
    imageUrl: "https://habboapi.site/api/image/md_limukaappi",
    iconUrl: "https://habbofurni.com/furni_assets/45512/md_limukaappi_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Refrigerante Gelado", webId: 3003, inGameId: 3003, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png", categoryType: "Bebidas - Refrigerantes" },
    ]
  },
  {
    name: "Carrinho de Bebidas",
    furniId: "arabian_teamk",
    imageUrl: "https://habboapi.site/api/image/arabian_teamk",
    iconUrl: "https://habbofurni.com/furni_assets/56746/arabian_teamk_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Chá Árabe", webId: 3004, inGameId: 3004, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png", categoryType: "Bebidas - Chá" },
    ]
  },
  {
    name: "Casinha de Chá Japonesa",
    furniId: "jp_teamaker",
    imageUrl: "https://habboapi.site/api/image/jp_teamaker",
    iconUrl: "https://habbofurni.com/furni_assets/56746/jp_teamaker_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Chá Verde", webId: 3005, inGameId: 3005, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png", categoryType: "Bebidas - Chá" },
    ]
  },
  {
    name: "Frigobar do Clube",
    furniId: "hcc_minibar",
    imageUrl: "https://habboapi.site/api/image/hcc_minibar",
    iconUrl: "https://habbofurni.com/furni_assets/45512/hcc_minibar_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Bebida Premium", webId: 3006, inGameId: 3006, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png", categoryType: "Bebidas - Alcoólicas" },
    ]
  },
  {
    name: "Astrobar",
    furniId: "sf_mbar",
    imageUrl: "https://habboapi.site/api/image/sf_mbar",
    iconUrl: "https://habbofurni.com/furni_assets/45512/sf_mbar_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Bebida Galáctica", webId: 3007, inGameId: 3007, iconUrl: "https://i.imgur.com/2xypAeW.png", categoryType: "Bebidas - Energéticos" },
    ]
  },
  {
    name: "Máquina de Expresso",
    furniId: "hc2_coffee",
    imageUrl: "https://habboapi.site/api/image/hc2_coffee",
    iconUrl: "https://habbofurni.com/furni_assets/45512/hc2_coffee_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Café Expresso Italiano", webId: 3008, inGameId: 3008, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png", categoryType: "Bebidas - Café" },
    ]
  },
  {
    name: "Máquina de Chocolate Quente",
    furniId: "xm09_cocoa",
    imageUrl: "https://habboapi.site/api/image/xm09_cocoa",
    iconUrl: "https://habbofurni.com/furni_assets/54031/xm09_cocoa_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Chocolate Quente", webId: 3009, inGameId: 3009, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png", categoryType: "Bebidas - Café" },
    ]
  },
  {
    name: "Limonada Refrescante",
    furniId: "mm_lemon_drink",
    imageUrl: "https://habboapi.site/api/image/mm_lemon_drink",
    iconUrl: "https://habbofurni.com/furni_assets/55440/mm_lemon_drink_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Limonada", webId: 3010, inGameId: 3010, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Suco" },
    ]
  },

  // === SORVETEIRAS ADICIONAIS ===
  {
    name: "Sorveteira Azul-piscina",
    furniId: "rare_icecream*8",
    imageUrl: "https://habboapi.site/api/image/rare_icecream*8",
    iconUrl: "https://habbofurni.com/furni_assets/73739/rare_icecream_8_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sorvete de Chocolate", webId: 3011, inGameId: 3011, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
    ]
  },
  {
    name: "Sorveteira Verde",
    furniId: "rare_icecream*2",
    imageUrl: "https://habboapi.site/api/image/rare_icecream*2",
    iconUrl: "https://habbofurni.com/furni_assets/73739/rare_icecream_2_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sorvete de Menta", webId: 3012, inGameId: 3012, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
    ]
  },
  {
    name: "Sorveteira Dourada",
    furniId: "rare_icecream*5",
    imageUrl: "https://habboapi.site/api/image/rare_icecream*5",
    iconUrl: "https://habbofurni.com/furni_assets/73739/rare_icecream_5_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Sorvete de Baunilha", webId: 3013, inGameId: 3013, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png", categoryType: "Doces - Sorvetes" },
    ]
  },

  // === MÁQUINAS DE CHICLETES ADICIONAIS ===
  {
    name: "Máquina de Chicletes Rosa",
    furniId: "diner_gumvendor*2",
    imageUrl: "https://habboapi.site/api/image/diner_gumvendor*2",
    iconUrl: "https://habbofurni.com/furni_assets/49500/diner_gumvendor_2_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Chiclete Rosa", webId: 3014, inGameId: 3014, iconUrl: "https://i.imgur.com/gum_red.png", categoryType: "Doces - Chicletes" },
    ]
  },
  {
    name: "Máquina de Chicletes Verde",
    furniId: "diner_gumvendor*7",
    imageUrl: "https://habboapi.site/api/image/diner_gumvendor*7",
    iconUrl: "https://habbofurni.com/furni_assets/49500/diner_gumvendor_7_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Chiclete Verde", webId: 3015, inGameId: 3015, iconUrl: "https://i.imgur.com/gum_green.png", categoryType: "Doces - Chicletes" },
    ]
  },

  // === COFRES E SEGURANÇA ===
  {
    name: "Cofre Frigobar",
    furniId: "safe_silo",
    imageUrl: "https://habboapi.site/api/image/safe_silo",
    iconUrl: "https://habbofurni.com/furni_assets/56746/safe_silo_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Item Seguro", webId: 3016, inGameId: 3016, iconUrl: "https://i.imgur.com/safe_item.png", categoryType: "Utensílios - Diversos" },
    ]
  },
  {
    name: "Cofre Rosa",
    furniId: "safe_silo*5",
    imageUrl: "https://habboapi.site/api/image/safe_silo*5",
    iconUrl: "https://habbofurni.com/furni_assets/56746/safe_silo_5_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Item Rosa", webId: 3017, inGameId: 3017, iconUrl: "https://i.imgur.com/pink_item.png", categoryType: "Utensílios - Diversos" },
    ]
  },

  // === MORDOMOS E SERVIÇOS ===
  {
    name: "Mordomo Elétrico",
    furniId: "hc_btlr",
    imageUrl: "https://habboapi.site/api/image/hc_btlr",
    iconUrl: "https://habbofurni.com/furni_assets/45678/hc_btlr_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Serviço Premium", webId: 3018, inGameId: 3018, iconUrl: "https://i.imgur.com/premium_service.png", categoryType: "Utensílios - Diversos" },
    ]
  },
  {
    name: "Mordomo Zumbi",
    furniId: "hween10_zombie",
    imageUrl: "https://habboapi.site/api/image/hween10_zombie",
    iconUrl: "https://habbofurni.com/furni_assets/54764/hween10_zombie_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Serviço Assombrado", webId: 3019, inGameId: 3019, iconUrl: "https://i.imgur.com/ghost_service.png", categoryType: "Utensílios - Diversos" },
    ]
  },
  {
    name: "Elefante Mordomo",
    furniId: "bolly_phant",
    imageUrl: "https://habboapi.site/api/image/bolly_phant",
    iconUrl: "https://habbofurni.com/furni_assets/56746/bolly_phant_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Serviço Exótico", webId: 3020, inGameId: 3020, iconUrl: "https://i.imgur.com/exotic_service.png", categoryType: "Utensílios - Diversos" },
    ]
  },

  // === CALDEIRÕES E POÇÕES ===
  {
    name: "Caldeirão Lendário",
    furniId: "val_cauldron",
    imageUrl: "https://habboapi.site/api/image/val_cauldron",
    iconUrl: "https://habbofurni.com/furni_assets/45512/val_cauldron_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Poção Mágica", webId: 3021, inGameId: 3021, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png", categoryType: "Bebidas - Especiais" },
    ]
  },
  {
    name: "Caldeirão Sinistro",
    furniId: "hal_cauldron",
    imageUrl: "https://habboapi.site/api/image/hal_cauldron",
    iconUrl: "https://habbofurni.com/furni_assets/54309/hal_cauldron_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Poção Assombrada", webId: 3022, inGameId: 3022, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_radioactive.png", categoryType: "Bebidas - Especiais" },
    ]
  },
  {
    name: "Caldeirão Ritualístico",
    furniId: "gothic_bowl",
    imageUrl: "https://habboapi.site/api/image/gothic_bowl",
    iconUrl: "https://habbofurni.com/furni_assets/56746/gothic_bowl_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Poção Gótica", webId: 3023, inGameId: 3023, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_radioactive.png", categoryType: "Bebidas - Especiais" },
    ]
  },

  // === ALIMENTOS E FRUTAS ===
  {
    name: "Pé de Laranja",
    furniId: "eco_tree1",
    imageUrl: "https://habboapi.site/api/image/eco_tree1",
    iconUrl: "https://habbofurni.com/furni_assets/45508/eco_tree1_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Laranja", webId: 3024, inGameId: 3024, iconUrl: "https://i.imgur.com/pDRtHvO.png", categoryType: "Alimentos - Frutas" },
    ]
  },
  {
    name: "Pé de Pêra",
    furniId: "eco_tree2",
    imageUrl: "https://habboapi.site/api/image/eco_tree2",
    iconUrl: "https://habbofurni.com/furni_assets/45508/eco_tree2_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Pêra", webId: 3025, inGameId: 3025, iconUrl: "https://i.imgur.com/0u2ZtNJ.png", categoryType: "Alimentos - Frutas" },
    ]
  },
  {
    name: "Cesto de Frutas",
    furniId: "eco_fruits1",
    imageUrl: "https://habboapi.site/api/image/eco_fruits1",
    iconUrl: "https://habbofurni.com/furni_assets/45508/eco_fruits1_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Maçã", webId: 3026, inGameId: 3026, iconUrl: "https://i.imgur.com/apple.png", categoryType: "Alimentos - Frutas" },
      { name: "Banana", webId: 3027, inGameId: 3027, iconUrl: "https://i.imgur.com/banana.png", categoryType: "Alimentos - Frutas" },
    ]
  },
  {
    name: "Grelha de Assar",
    furniId: "es_roaster",
    imageUrl: "https://habboapi.site/api/image/es_roaster",
    iconUrl: "https://habbofurni.com/furni_assets/56278/es_roaster_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Castanha Assada", webId: 3028, inGameId: 3028, iconUrl: "https://i.imgur.com/roasted_nut.png", categoryType: "Alimentos - Nozes" },
    ]
  },

  // === ESPECIAIS E RAROS ===
  {
    name: "Poço dos Desejos",
    furniId: "country_well",
    imageUrl: "https://habboapi.site/api/image/country_well",
    iconUrl: "https://habbofurni.com/furni_assets/48082/country_well_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Desejo Realizado", webId: 3029, inGameId: 3029, iconUrl: "https://i.imgur.com/wish_granted.png", categoryType: "Outros - Diversos" },
    ]
  },
  {
    name: "Buraco no Gelo",
    furniId: "xmas08_hole",
    imageUrl: "https://habboapi.site/api/image/xmas08_hole",
    iconUrl: "https://habbofurni.com/furni_assets/48478/xmas08_hole_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Peixe Gelo", webId: 3030, inGameId: 3030, iconUrl: "https://i.imgur.com/fish.png", categoryType: "Alimentos - Frutos do Mar" },
    ]
  },
  {
    name: "Elefante Gelado",
    furniId: "qt_xm10_elephant",
    imageUrl: "https://habboapi.site/api/image/qt_xm10_elephant",
    iconUrl: "https://habbofurni.com/furni_assets/45512/qt_xm10_elephant_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Água Gelada", webId: 3031, inGameId: 3031, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Água" },
    ]
  },
  {
    name: "Freezer Portátil",
    furniId: "summer_icebox",
    imageUrl: "https://habboapi.site/api/image/summer_icebox",
    iconUrl: "https://habbofurni.com/furni_assets/48082/summer_icebox_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Bebida Gelada", webId: 3032, inGameId: 3032, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png", categoryType: "Bebidas - Refrigerantes" },
    ]
  },
  {
    name: "Violeta Geladeira",
    furniId: "bling_fridge",
    imageUrl: "https://habboapi.site/api/image/bling_fridge",
    iconUrl: "https://habbofurni.com/furni_assets/56746/bling_fridge_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Bebida Bling", webId: 3033, inGameId: 3033, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png", categoryType: "Bebidas - Alcoólicas" },
    ]
  },
  {
    name: "Caça Níqueis",
    furniId: "bling11_slot",
    imageUrl: "https://habboapi.site/api/image/bling11_slot",
    iconUrl: "https://habbofurni.com/furni_assets/56746/bling11_slot_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Prêmio", webId: 3034, inGameId: 3034, iconUrl: "https://i.imgur.com/prize.png", categoryType: "Utensílios - Diversos" },
    ]
  },
  {
    name: "Interior Limusine com Drinks",
    furniId: "limo_b_mid3",
    imageUrl: "https://habboapi.site/api/image/limo_b_mid3",
    iconUrl: "https://habbofurni.com/furni_assets/56746/limo_b_mid3_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Drink de Luxo", webId: 3035, inGameId: 3035, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png", categoryType: "Bebidas - Alcoólicas" },
    ]
  },

  // === PIAS ESPECIAIS ===
  {
    name: "Pia de Limo",
    furniId: "hween08_sink2",
    imageUrl: "https://habboapi.site/api/image/hween08_sink2",
    iconUrl: "https://habbofurni.com/furni_assets/54764/hween08_sink2_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Água de Limo", webId: 3036, inGameId: 3036, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png", categoryType: "Bebidas - Água" },
    ]
  },
  {
    name: "Pia de Sangue",
    furniId: "hween08_sink",
    imageUrl: "https://habboapi.site/api/image/hween08_sink",
    iconUrl: "https://habbofurni.com/furni_assets/54764/hween08_sink_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Sangue", webId: 3037, inGameId: 3037, iconUrl: "https://images.habbotemplarios.com/web/avatargen/hand_radioactive.png", categoryType: "Bebidas - Especiais" },
    ]
  },

  // === PLANTAS E FLORES ===
  {
    name: "Girassol",
    furniId: "plant_sunflower",
    imageUrl: "https://habboapi.site/api/image/plant_sunflower",
    iconUrl: "https://habbofurni.com/furni_assets/48082/plant_sunflower_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Sementes de Girassol", webId: 3038, inGameId: 3038, iconUrl: "https://i.imgur.com/sunflower_seeds.png", categoryType: "Alimentos - Nozes" },
    ]
  },
  {
    name: "Rosas",
    furniId: "plant_rose",
    imageUrl: "https://habboapi.site/api/image/plant_rose",
    iconUrl: "https://habbofurni.com/furni_assets/48082/plant_rose_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Rosa", webId: 3039, inGameId: 3039, iconUrl: "https://i.imgur.com/red_rose.png", categoryType: "Outros - Plantas e Flores" },
    ]
  },

  // === ESPECIAIS DE COZINHA ===
  {
    name: "Inspetor Sanitário",
    furniId: "ktchn_inspctr",
    imageUrl: "https://habboapi.site/api/image/ktchn_inspctr",
    iconUrl: "https://habbofurni.com/furni_assets/52046/ktchn_inspctr_icon.png",
    function: "Segurar e Usar",
    handitems: [
      { name: "Certificado Sanitário", webId: 3040, inGameId: 3040, iconUrl: "https://i.imgur.com/health_certificate.png", categoryType: "Utensílios - Escritório" },
    ]
  },
  {
    name: "Franz",
    furniId: "ktchn_hlthNut",
    imageUrl: "https://habboapi.site/api/image/ktchn_hlthNut",
    iconUrl: "https://habbofurni.com/furni_assets/48082/ktchn_hlthNut_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Alimento Saudável", webId: 3041, inGameId: 3041, iconUrl: "https://i.imgur.com/healthy_food.png", categoryType: "Alimentos - Vegetais" },
    ]
  },

  // === PRATELEIRAS E BANDEJAS ===
  {
    name: "Prateleira Neon",
    furniId: "party_tray",
    imageUrl: "https://habboapi.site/api/image/party_tray",
    iconUrl: "https://habbofurni.com/furni_assets/48082/party_tray_icon.png",
    function: "Segurar e Comer",
    handitems: [
      { name: "Petisco de Festa", webId: 3042, inGameId: 3042, iconUrl: "https://i.imgur.com/party_snack.png", categoryType: "Alimentos - Salgados" },
    ]
  },
  {
    name: "Torre de taças",
    furniId: "tray_glasstower",
    imageUrl: "https://habboapi.site/api/image/tray_glasstower",
    iconUrl: "https://habbofurni.com/furni_assets/56746/tray_glasstower_icon.png",
    function: "Segurar e Beber",
    handitems: [
      { name: "Taça de Cristal", webId: 3043, inGameId: 3043, iconUrl: "https://i.imgur.com/crystal_glass.png", categoryType: "Utensílios - Diversos" },
    ]
  },

];

const getMainCategoryForItem = (categoryType: string): keyof typeof MAIN_CATEGORIES => {
  if (!categoryType) return "Outros";
  for (const mainCatKey in MAIN_CATEGORIES) {
    if (mainCatKey === 'Todos') continue;
    const category = MAIN_CATEGORIES[mainCatKey as keyof typeof MAIN_CATEGORIES];
    if (category.subCategories.some(subCat => categoryType.includes(subCat))) {
      return mainCatKey as keyof typeof MAIN_CATEGORIES;
    }
  }
  return "Outros";
};

const getSubCategoryForItem = (categoryType: string): string => {
  if (!categoryType) return "Diversos";
  const parts = categoryType.split(' - ');
  return parts.length > 1 ? parts[1] : categoryType;
};

const generateHanditemAvatarUrl = (
  habboName: string, 
  handitemId: number | null, 
  size: string = 'm'
): string => {
  const direction = 2;
  const headDirection = 2;
  const gesture = 'nrm';
  const actionParam = handitemId && handitemId !== 0 ? `crr=${handitemId}` : '';
  
  return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboName}&direction=${direction}&head_direction=${headDirection}&action=${actionParam}&gesture=${gesture}&size=${size}`;
};

// Dados estruturados baseados nas fontes fornecidas
const HANDITEM_DATA = [
  // Bebidas
  { id: 1, name: "Chá", category: "bebidas", subcategory: "chá", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png" },
  { id: 3, name: "Cenoura", category: "alimentos", subcategory: "vegetais", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_carrot.png" },
  { id: 4, name: "Sorvete de baunilha", category: "doces", subcategory: "sorvetes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png" },
  { id: 5, name: "Leite", category: "bebidas", subcategory: "laticínios", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 6, name: "Groselha", category: "bebidas", subcategory: "sucos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 7, name: "Água", category: "bebidas", subcategory: "água", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 8, name: "Café", category: "bebidas", subcategory: "café", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png" },
  { id: 19, name: "Habbo Cola", category: "bebidas", subcategory: "refrigerantes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png" },
  { id: 20, name: "Limonada", category: "bebidas", subcategory: "sucos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 24, name: "Champin 1", category: "bebidas", subcategory: "especiais", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 25, name: "Brebaje do Amor", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png" },
  { id: 26, name: "Calippo", category: "doces", subcategory: "sorvetes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_calippo.png" },
  { id: 28, name: "Sake", category: "bebidas", subcategory: "alcoólicas", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 29, name: "Suco de Tomate", category: "bebidas", subcategory: "sucos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_tomato.png" },
  { id: 30, name: "Líquido Radioativo", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_radioactive.png" },
  { id: 31, name: "Coquetel", category: "bebidas", subcategory: "alcoólicas", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 34, name: "Peixe", category: "alimentos", subcategory: "frutos do mar", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 35, name: "Champin 2", category: "bebidas", subcategory: "especiais", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 36, name: "Pera", category: "alimentos", subcategory: "frutas", rarity: "common", spriteUrl: "https://i.imgur.com/0u2ZtNJ.png" },
  { id: 37, name: "Maçã", category: "alimentos", subcategory: "frutas", rarity: "common", spriteUrl: "https://i.imgur.com/apple.png" },
  { id: 38, name: "Laranja", category: "alimentos", subcategory: "frutas", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 39, name: "Abacaxi", category: "alimentos", subcategory: "frutas", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 40, name: "Champin 3", category: "bebidas", subcategory: "especiais", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 41, name: "Sumppi-kuppi", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 42, name: "Suco de Laranja", category: "bebidas", subcategory: "sucos", rarity: "common", spriteUrl: "https://i.imgur.com/pDRtHvO.png" },
  { id: 43, name: "Limonada", category: "bebidas", subcategory: "sucos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 44, name: "Água Galáctica", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 45, name: "Pêssego", category: "alimentos", subcategory: "frutas", rarity: "common", spriteUrl: "https://i.imgur.com/VStOTCZ.png" },
  { id: 46, name: "Brebaje Malhumor", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png" },
  { id: 47, name: "Tomate", category: "alimentos", subcategory: "vegetais", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_tomato.png" },
  { id: 48, name: "Chupa Chups", category: "doces", subcategory: "pirulitos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_calippo.png" },
  { id: 49, name: "Iogurte", category: "bebidas", subcategory: "laticínios", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 50, name: "Champanhe", category: "bebidas", subcategory: "alcoólicas", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 51, name: "Pipas G", category: "doces", subcategory: "diversos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 52, name: "Cheetos", category: "alimentos", subcategory: "salgados", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 53, name: "Expresso", category: "bebidas", subcategory: "café", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png" },
  { id: 54, name: "Chocapic", category: "alimentos", subcategory: "cereais", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 55, name: "Pepsi", category: "bebidas", subcategory: "refrigerantes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png" },
  { id: 57, name: "Suco de Uva", category: "bebidas", subcategory: "sucos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 58, name: "Sangue Fresco", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 59, name: "Poção", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png" },
  { id: 60, name: "Castanhas", category: "alimentos", subcategory: "nozes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 61, name: "Sunny", category: "bebidas", subcategory: "refrigerantes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png" },
  { id: 62, name: "Água Envenenada", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 63, name: "Pipoca", category: "alimentos", subcategory: "salgados", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 64, name: "Suco de Pera", category: "bebidas", subcategory: "sucos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 65, name: "Mamadeira", category: "bebidas", subcategory: "laticínios", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 66, name: "Milkshake de Banana", category: "bebidas", subcategory: "milkshakes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 67, name: "Brebaje de Poder", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png" },
  { id: 68, name: "Brebaje Invisível", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png" },
  { id: 69, name: "Brebaje de Levitação", category: "bebidas", subcategory: "especiais", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png" },
  { id: 70, name: "Frango", category: "alimentos", subcategory: "carnes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 71, name: "Torrada", category: "alimentos", subcategory: "pães", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 72, name: "Gatorade", category: "bebidas", subcategory: "energéticos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 73, name: "Cerveja", category: "bebidas", subcategory: "alcoólicas", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 74, name: "Taça de Brinde", category: "bebidas", subcategory: "alcoólicas", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png" },
  { id: 75, name: "Sorvete de Morango", category: "doces", subcategory: "sorvetes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png" },
  { id: 76, name: "Sorvete de Anis", category: "doces", subcategory: "sorvetes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png" },
  { id: 77, name: "Sorvete de Chocolate", category: "doces", subcategory: "sorvetes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_icecream.png" },
  { id: 79, name: "Algodão Doce Rosa", category: "doces", subcategory: "algodão doce", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 80, name: "Algodão Doce Azul", category: "doces", subcategory: "algodão doce", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 81, name: "Cachorro-Quente", category: "alimentos", subcategory: "carnes", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 82, name: "Monóculo", category: "utensílios", subcategory: "diversos", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 83, name: "Maçã Envenenada", category: "alimentos", subcategory: "frutas", rarity: "rare", spriteUrl: "https://i.imgur.com/apple.png" },
  { id: 84, name: "Biscoito de Gengibre", category: "doces", subcategory: "diversos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 85, name: "Starbucks Branco", category: "bebidas", subcategory: "café", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png" },
  { id: 86, name: "Starbucks Transparente", category: "bebidas", subcategory: "café", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_coffee.png" },
  
  // Flores e Plantas
  { id: 1000, name: "Rosa Vermelha", category: "outros", subcategory: "plantas e flores", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/handitem_1000.png" },
  { id: 1001, name: "Rosa Negra", category: "outros", subcategory: "plantas e flores", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/handitem_1001.png" },
  { id: 1002, name: "Girassol", category: "outros", subcategory: "plantas e flores", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/handitem_1002.png" },
  { id: 1003, name: "Livro Vermelho", category: "utensílios", subcategory: "escritório", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1004, name: "Livro Azul", category: "utensílios", subcategory: "escritório", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1005, name: "Livro Verde", category: "utensílios", subcategory: "escritório", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1006, name: "Flor de Presente", category: "outros", subcategory: "plantas e flores", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1007, name: "Estramônio", category: "outros", subcategory: "plantas e flores", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1008, name: "Placer Amarelo", category: "outros", subcategory: "plantas e flores", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1009, name: "Pandemia Rosa", category: "outros", subcategory: "plantas e flores", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1011, name: "Prendedor de Papel", category: "utensílios", subcategory: "escritório", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1013, name: "Pílulas", category: "utensílios", subcategory: "saúde", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1014, name: "Seringa", category: "utensílios", subcategory: "saúde", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1015, name: "Resíduos Tóxicos", category: "utensílios", subcategory: "laboratório", rarity: "rare", spriteUrl: "https://i.imgur.com/test_tube.png" },
  { id: 1019, name: "Flor Bolly", category: "outros", subcategory: "plantas e flores", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1021, name: "Jacinto 1", category: "outros", subcategory: "plantas e flores", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1022, name: "Jacinto 2", category: "outros", subcategory: "plantas e flores", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1023, name: "Flor de Páscoa", category: "outros", subcategory: "plantas e flores", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1024, name: "Pudim", category: "doces", subcategory: "diversos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1025, name: "Bastão de Doce", category: "doces", subcategory: "diversos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1026, name: "Presente", category: "outros", subcategory: "diversos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1027, name: "Vela", category: "utensílios", subcategory: "diversos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1028, name: "Kellogg's", category: "alimentos", subcategory: "cereais", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1029, name: "Balão", category: "outros", subcategory: "diversos", rarity: "common", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1030, name: "Tablet", category: "eletrônicos", subcategory: "tablets", rarity: "uncommon", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1031, name: "Tocha Olímpica", category: "utensílios", subcategory: "diversos", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1032, name: "Comandante Tom", category: "outros", subcategory: "diversos", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1033, name: "OVNI", category: "outros", subcategory: "diversos", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
  { id: 1034, name: "Alienígena", category: "outros", subcategory: "diversos", rarity: "rare", spriteUrl: "https://images.habbotemplarios.com/web/avatargen/hand_water.png" },
];

// Componente para o catálogo unificado
const UnifiedHanditemCatalog: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unifiedData, setUnifiedData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    rarity: 'all',
    showHanditems: true,
    showMobis: false,
    source: 'all'
  });

  const fetchUnifiedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [UnifiedHanditem] Loading handitem data from structured sources...');
      
      // Simular carregamento dos dados estruturados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Converter dados estruturados para formato unificado
      const unifiedItems = HANDITEM_DATA.map((item) => ({
        id: item.id,
        name: item.name,
        description: `Handitem ID: ${item.id}`,
        category: item.category,
        subcategory: item.subcategory,
        rarity: item.rarity,
        iconUrl: item.spriteUrl,
        imageUrl: item.spriteUrl,
        isHanditem: true,
        isMobi: false,
        source: 'hajuda.me + wikitable',
        lastUpdated: new Date().toISOString(),
        tags: [item.category, item.subcategory, item.rarity].filter(Boolean),
        handitemId: item.id
      }));

      console.log(`✅ [UnifiedHanditem] Loaded ${unifiedItems.length} handitems`);
      setUnifiedData(unifiedItems);
      
    } catch (err: any) {
      console.error('❌ [UnifiedHanditem] Error:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUnifiedData();
  };

  const handleDownload = () => {
    console.log('📥 [UnifiedHanditem] Downloading handitems data...');
    fetchUnifiedData();
  };

  const handleCopyHanditemId = (handitemId: number) => {
    navigator.clipboard.writeText(handitemId.toString());
    console.log(`📋 [UnifiedHanditem] Copied handitem ID: ${handitemId}`);
  };

  // Carregar dados na inicialização
  useEffect(() => {
    fetchUnifiedData();
  }, []);

  // Filtrar dados baseado nos filtros
  const filteredData = useMemo(() => {
    return unifiedData.filter(item => {
      const matchesSearch = filters.search === '' || 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesRarity = filters.rarity === 'all' || item.rarity === filters.rarity;
      const matchesType = (filters.showHanditems && item.isHanditem) || (filters.showMobis && item.isMobi);
      
      return matchesSearch && matchesCategory && matchesRarity && matchesType;
    });
  }, [unifiedData, filters]);

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Catálogo Unificado</h2>
          <p className="text-gray-600">
            Sistema unificado para todos os handitems do Habbo baseado em fontes externas
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
          <Button
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar Dados
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Nome, descrição ou tags..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as categorias</option>
                <option value="alimentos">Alimentos</option>
                <option value="bebidas">Bebidas</option>
                <option value="doces">Doces</option>
                <option value="utensílios">Utensílios</option>
                <option value="eletrônicos">Eletrônicos</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            {/* Raridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raridade
              </label>
              <select
                value={filters.rarity}
                onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as raridades</option>
                <option value="common">Comum</option>
                <option value="uncommon">Incomum</option>
                <option value="rare">Raro</option>
                <option value="epic">Épico</option>
                <option value="legendary">Lendário</option>
              </select>
            </div>

            {/* Fonte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fonte
              </label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as fontes</option>
                <option value="hajuda.me + wikitable">Hajuda.me + Wikitable</option>
                <option value="manual">Manual</option>
                <option value="api">API</option>
              </select>
            </div>
          </div>

          {/* Filtros de tipo */}
          <div className="flex gap-4 mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showHanditems}
                onChange={(e) => setFilters(prev => ({ ...prev, showHanditems: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Mostrar Handitems</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showMobis}
                onChange={(e) => setFilters(prev => ({ ...prev, showMobis: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Mostrar Mobis</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do catálogo unificado */}
      {loading ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground mb-2">
              Carregando dados...
            </h3>
            <p className="text-muted-foreground">
              Buscando handitems do Habbo
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      ) : filteredData.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros para encontrar mais itens
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">
              {filteredData.length} handitems encontrados
            </h3>
            <div className="text-sm text-muted-foreground">
              Fonte: Hajuda.me + Wikitable
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredData.map((item) => (
              <Card 
                key={item.id}
                className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleCopyHanditemId(item.handitemId)}
              >
                <CardContent className="p-2">
                  <div className="aspect-square relative mb-2 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/150x150/e0e0e0/333333?text=Handitem';
                      }}
                    />
                    <div className="absolute top-1 right-1 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center">
                      <Package className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <h3 className="volter-font font-bold text-xs mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-xs text-muted-foreground volter-font mb-1">{item.category}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-1 py-0.5 rounded text-xs ${
                      item.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                      item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                      item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.rarity}
                    </span>
                    <span className="text-muted-foreground">ID: {item.handitemId}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const HanditemTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'unified'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof MAIN_CATEGORIES>('Todos');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Todos');
  const [selectedMobi, setSelectedMobi] = useState<MobiData | null>(null);
  const [selectedHanditem, setSelectedHanditem] = useState<HanditemData | null>(null);
  const { toast } = useToast();
  const { habboAccount } = useUnifiedAuth();

  const defaultHabboName = habboAccount?.habbo_username || "Beebop";



  const filteredMobis = useMemo(() => {

    return MOBIS_DATA.filter(mobi => {
      const mobiName = mobi.name.toLowerCase();
      const handitemNames = mobi.handitems.map(item => item.name.toLowerCase()).join(' ');
      const matchesSearch = mobiName.includes(searchTerm.toLowerCase()) || 
                          handitemNames.includes(searchTerm.toLowerCase());

      let matchesMainCategory = true;
      if (selectedCategory !== 'Todos') {
        matchesMainCategory = mobi.handitems.some(item => 
          getMainCategoryForItem(item.categoryType) === selectedCategory
        );
      }

      let matchesSubCategory = true;
      if (selectedSubCategory !== 'Todos') {
        matchesSubCategory = mobi.handitems.some(item => 
          getSubCategoryForItem(item.categoryType) === selectedSubCategory
        );
      }

      return matchesSearch && matchesMainCategory && matchesSubCategory;
    });
  }, [searchTerm, selectedCategory, selectedSubCategory]);

  const currentSubCategories = useMemo(() => {
    return selectedCategory === 'Todos' ? [] : MAIN_CATEGORIES[selectedCategory].subCategories;
  }, [selectedCategory]);

  const handleCopyHanditemId = useCallback((handitem: HanditemData) => {
    navigator.clipboard.writeText(handitem.inGameId.toString());
    setSelectedHanditem(handitem);
    toast({
      title: "ID Copiado!",
      description: `ID ${handitem.inGameId} do item "${handitem.name}" foi copiado.`
    });
  }, [toast]);

  const handleCategoryChange = useCallback((category: keyof typeof MAIN_CATEGORIES) => {
    setSelectedCategory(category);
    setSelectedSubCategory('Todos');
  }, []);

  const avatarUrl = useMemo(() => {
    return generateHanditemAvatarUrl(
      defaultHabboName,
      selectedHanditem?.inGameId || null
    );
  }, [defaultHabboName, selectedHanditem]);

  return (
    <div className="space-y-6">
      {/* Abas */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'catalog' | 'unified')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="catalog" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Catálogo Atual
              </TabsTrigger>
              <TabsTrigger value="unified" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Catálogo Unificado
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Conteúdo das abas */}
      {activeTab === 'catalog' ? (
        <div className="space-y-6">
          {/* Header */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="volter-font text-2xl text-primary">
                🤲 Catálogo de Handitems Habbo
              </CardTitle>
              <p className="text-muted-foreground volter-font">
                Explore todos os itens de mão que os mobis entregam no hotel!
              </p>
            </CardHeader>
          </Card>

      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-4">


          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar mobi ou item de mão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
            <TabsList className="grid grid-cols-7 w-full">
              {Object.entries(MAIN_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="flex items-center gap-1 text-xs volter-font"
                  >
                    <Icon className="w-3 h-3" />
                    {category.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {currentSubCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedSubCategory === 'Todos' ? 'default' : 'outline'}
                className="cursor-pointer volter-font"
                onClick={() => setSelectedSubCategory('Todos')}
              >
                Todos
              </Badge>
              {currentSubCategories.map((subCat) => (
                <Badge
                  key={subCat}
                  variant={selectedSubCategory === subCat ? 'default' : 'outline'}
                  className="cursor-pointer volter-font"
                  onClick={() => setSelectedSubCategory(subCat)}
                >
                  {subCat}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobis Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredMobis.map((mobi) => (
          <Card 
            key={mobi.furniId}
            className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setSelectedMobi(mobi)}
          >
            <CardContent className="p-2">
              <div className="aspect-square relative mb-2 bg-muted rounded-lg overflow-hidden">
                <img
                  src={mobi.imageUrl}
                  alt={mobi.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/150x150/e0e0e0/333333?text=Mobi';
                  }}
                />
                <div className="absolute top-1 right-1 w-6 h-6 bg-background rounded-full border border-border flex items-center justify-center">
                  <img
                    src={mobi.iconUrl}
                    alt="Ícone"
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.src = 'https://i.imgur.com/8DdHXoN.png';
                    }}
                  />
                </div>
              </div>
              
              <h3 className="volter-font font-bold text-xs mb-1 line-clamp-2">{mobi.name}</h3>
              <p className="text-xs text-muted-foreground volter-font mb-1">{mobi.function}</p>
              
              <div className="flex flex-wrap gap-1">
                {mobi.handitems.slice(0, 4).map((item, idx) => (
                  <img
                    key={idx}
                    src={item.iconUrl}
                    alt={item.name}
                    title={item.name}
                    className="w-4 h-4 border border-border rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/20x20/cccccc/ffffff?text=?';
                    }}
                  />
                ))}
                {mobi.handitems.length > 6 && (
                  <div className="w-5 h-5 bg-muted border border-border rounded flex items-center justify-center text-xs volter-font">
                    +{mobi.handitems.length - 6}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMobis.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="volter-font text-lg font-bold text-muted-foreground mb-2">
              Nenhum mobi encontrado
            </h3>
            <p className="text-muted-foreground volter-font">
              Tente ajustar os filtros ou termos de busca
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <Dialog open={!!selectedMobi} onOpenChange={() => setSelectedMobi(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="volter-font text-xl">
              {selectedMobi?.name} - {selectedMobi?.function}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMobi && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Mobi Info and Avatar */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedMobi.imageUrl}
                    alt={selectedMobi.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <h4 className="volter-font font-bold">Avatar Preview ({defaultHabboName})</h4>
                  <div className="w-32 h-40 mx-auto bg-muted rounded-lg overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt="Avatar com handitem"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {selectedHanditem && (
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={selectedHanditem.iconUrl}
                        alt={selectedHanditem.name}
                        className="w-6 h-6"
                      />
                      <span className="text-sm volter-font">{selectedHanditem.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Handitems Table */}
              <div className="space-y-4">
                <h4 className="volter-font font-bold text-lg">Itens de Mão Entregues:</h4>
                
                <ScrollArea className="h-80">
                  <div className="space-y-2">
                    {selectedMobi.handitems.map((item) => (
                      <Card
                        key={item.inGameId}
                        className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleCopyHanditemId(item)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.iconUrl}
                            alt={item.name}
                            className="w-8 h-8 border border-border rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/32x32/cccccc/ffffff?text=?';
                            }}
                          />
                          <div className="flex-1">
                            <h5 className="volter-font font-bold text-sm">{item.name}</h5>
                            <p className="text-xs text-muted-foreground">
                              ID: {item.inGameId} • {item.categoryType}
                            </p>
                          </div>
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                
                <p className="text-xs text-muted-foreground text-center volter-font">
                  💡 Clique em qualquer item para copiar seu ID e ver no avatar
                </p>
              </div>
            </div>
          )}
         </DialogContent>
       </Dialog>
        </div>
      ) : (
        <UnifiedHanditemCatalog />
      )}
    </div>
  );
};