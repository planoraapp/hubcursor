// Serviço para descobrir imagens de handitems de múltiplas fontes
// Baseado no tutorial ViaJovem e fontes reais disponíveis

export interface ImageSource {
  name: string;
  priority: number;
  baseUrl: string;
  pattern: string;
  testUrl?: string;
}

export interface DiscoveredImage {
  url: string;
  source: string;
  exists: boolean;
  size?: number;
  lastChecked: string;
}

export interface HanditemImageInfo {
  handitemId: number;
  handitemName: string;
  discoveredImages: DiscoveredImage[];
  bestImage?: string;
  fallbackUsed: boolean;
}

export class HanditemImageDiscovery {
  private sources: ImageSource[] = [
    {
      name: 'Local Images - drk',
      priority: 1,
      baseUrl: '/handitems/images/drk',
      pattern: '{filename}',
      testUrl: '/handitems/images/drk/attic15_mousetrap_icon.png'
    },
    {
      name: 'Local Images - crr',
      priority: 2,
      baseUrl: '/handitems/images/crr',
      pattern: '{filename}',
      testUrl: '/handitems/images/crr/hblooza14_track_crr_icon.png'
    },
    {
      name: 'Local Images - preview',
      priority: 3,
      baseUrl: '/handitems/images/preview',
      pattern: 'handitem_{id}.svg',
      testUrl: '/handitems/images/preview/handitem_0.svg'
    }
  ];

  private cache = new Map<number, HanditemImageInfo>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Descobre a melhor imagem para um handitem
   */
  async discoverHanditemImage(handitemId: number, handitemName: string): Promise<HanditemImageInfo> {
    // Verificar cache primeiro
    const cached = this.cache.get(handitemId);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const discoveredImages: DiscoveredImage[] = [];
    let bestImage: string | undefined;
    let fallbackUsed = false;

    // Tentar cada fonte em ordem de prioridade
    for (const source of this.sources.sort((a, b) => a.priority - b.priority)) {
      try {
        const imageUrl = this.generateImageUrl(handitemId, handitemName, source);
        
        // Pular se a URL for nula (fonte não aplicável)
        if (!imageUrl) {
          continue;
        }
        
        const exists = await this.checkImageExists(imageUrl);
        
        const discoveredImage: DiscoveredImage = {
          url: imageUrl,
          source: source.name,
          exists,
          lastChecked: new Date().toISOString()
        };

        discoveredImages.push(discoveredImage);

        if (exists && !bestImage) {
          bestImage = imageUrl;
        }
      } catch (error) {
        console.warn(`Erro ao verificar ${source.name} para handitem ${handitemId}:`, error);
      }
    }

    // Se nenhuma imagem foi encontrada, usar fallback
    if (!bestImage) {
      bestImage = this.getFallbackImage(handitemId);
      fallbackUsed = true;
    }

    const result: HanditemImageInfo = {
      handitemId,
      handitemName,
      discoveredImages,
      bestImage,
      fallbackUsed
    };

    // Salvar no cache
    this.cache.set(handitemId, result);
    return result;
  }

  /**
   * Descobre imagens para múltiplos handitems (otimizado)
   */
  async discoverMultipleHanditems(handitems: Array<{id: number, name: string}>): Promise<HanditemImageInfo[]> {
    const results: HanditemImageInfo[] = [];
    
    // Processar em lotes menores para evitar sobrecarga
    const batchSize = 10;
    for (let i = 0; i < handitems.length; i += batchSize) {
      const batch = handitems.slice(i, i + batchSize);
      
      // Processar em paralelo mas com limite
      const batchResults = await Promise.all(
        batch.map(item => this.discoverHanditemImage(item.id, item.name))
      );
      results.push(...batchResults);
      
      // Pausa menor entre lotes
      if (i + batchSize < handitems.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Gera URL de imagem baseada na fonte
   */
  private generateImageUrl(handitemId: number, handitemName: string, source: ImageSource): string {
    switch (source.name) {
      case 'Local Images - drk':
        const drkFilename = this.getDrkImageName(handitemId, handitemName);
        return `${source.baseUrl}/${drkFilename}`;
      
      case 'Local Images - crr':
        const crrFilename = this.getCrrImageName(handitemId, handitemName);
        return `${source.baseUrl}/${crrFilename}`;
      
      case 'Local Images - preview':
        return `${source.baseUrl}/${source.pattern.replace('{id}', handitemId.toString())}`;
      
      default:
        throw new Error(`Fonte não suportada: ${source.name}`);
    }
  }

  private getDrkImageName(handitemId: number, handitemName: string): string {
    // Carregar mapeamento do arquivo JSON
    try {
      const mappingFile = '/handitems/images/handitem-mapping.json';
      // Para evitar carregamento síncrono, usar cache ou carregar de forma assíncrona
      return this.getMappedImageName(handitemId, 'drk');
    } catch (error) {
      return `drk${handitemId}.png`;
    }
  }

  private getCrrImageName(handitemId: number, handitemName: string): string {
    try {
      return this.getMappedImageName(handitemId, 'crr');
    } catch (error) {
      return `crr${handitemId}.png`;
    }
  }

  private getMappedImageName(handitemId: number, type: 'drk' | 'crr'): string {
    // Mapeamento baseado nos IDs reais dos handitems
    const mappings: { [key: number]: { drk: string; crr: string } } = {
      1: { drk: 'circus_c24_mastermouseact_icon.png', crr: 'hween12_track_crr_icon.png' },
      2: { drk: 'circus_c24_mouseact_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      3: { drk: 'clothing_bratzeitantrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      4: { drk: 'clothing_edwardianblouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      5: { drk: 'clothing_grungetrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      6: { drk: 'clothing_highwaisttrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      7: { drk: 'clothing_knighttrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      8: { drk: 'clothing_leathertrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      9: { drk: 'clothing_mockymouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      10: { drk: 'clothing_nftstripedtrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      11: { drk: 'dimmer_fuse2_icon.png', crr: 'hween12_track_crr_icon.png' },
      12: { drk: 'dimmer_fuse6_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      13: { drk: 'easter_c16_house_icon.png', crr: 'hween12_track_crr_icon.png' },
      14: { drk: 'easter_c23_greenhousewall_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      15: { drk: 'house2_icon.png', crr: 'hween12_track_crr_icon.png' },
      16: { drk: 'house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      17: { drk: 'house_sofa_icon.png', crr: 'hween12_track_crr_icon.png' },
      18: { drk: 'hs_applause_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      19: { drk: 'hween_c20_housewall_icon.png', crr: 'hween12_track_crr_icon.png' },
      20: { drk: 'js_c16_drkcab_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      21: { drk: 'loyalty_mouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      22: { drk: 'mini_c24_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      23: { drk: 'nft_h22_fusetronics_caps_icon.png', crr: 'hween12_track_crr_icon.png' },
      24: { drk: 'nft_h22_fusetronics_coil_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      25: { drk: 'nft_h22_fusetronics_fan_icon.png', crr: 'hween12_track_crr_icon.png' },
      26: { drk: 'nft_h22_fusetronics_ledg_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      27: { drk: 'nft_h22_fusetronics_ledr_icon.png', crr: 'hween12_track_crr_icon.png' },
      28: { drk: 'nft_h22_fusetronics_ledy_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      29: { drk: 'nft_h22_fusetronics_res_icon.png', crr: 'hween12_track_crr_icon.png' },
      30: { drk: 'nft_h22_fusetronics_rug_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      31: { drk: 'nft_h23_bday_balloonmouse1_icon.png', crr: 'hween12_track_crr_icon.png' },
      32: { drk: 'nft_h23_bday_balloonmouse2_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      33: { drk: 'nft_h24_cefalu_greenhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      34: { drk: 'ny2015_drktray_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      35: { drk: 'nyc_c23_steakhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      36: { drk: 'rare_r20_treehouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      37: { drk: 'santorini_c17_house_icon.png', crr: 'hween12_track_crr_icon.png' },
      38: { drk: 'santorini_c17_lighthouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      39: { drk: 'santorini_ltd17_lighthouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      40: { drk: 'school_ltd22_treehouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      41: { drk: 'uservoice_soapbox_icon.png', crr: 'hween12_track_crr_icon.png' },
      42: { drk: 'vikings_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      43: { drk: 'wf_act_furni_to_user_icon.png', crr: 'hween12_track_crr_icon.png' },
      44: { drk: 'wf_act_kick_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      45: { drk: 'wf_act_move_rotate_user_icon.png', crr: 'hween12_track_crr_icon.png' },
      46: { drk: 'wf_act_user_to_furni_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      47: { drk: 'wf_cnd_not_user_count_icon.png', crr: 'hween12_track_crr_icon.png' },
      48: { drk: 'wf_cnd_not_user_performs_action_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      49: { drk: 'wf_cnd_user_count_in_icon.png', crr: 'hween12_track_crr_icon.png' },
      50: { drk: 'wf_cnd_user_performs_action_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      51: { drk: 'wf_slc_users_area_icon.png', crr: 'hween12_track_crr_icon.png' },
      52: { drk: 'wf_slc_users_byaction_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      53: { drk: 'wf_slc_users_byname_icon.png', crr: 'hween12_track_crr_icon.png' },
      54: { drk: 'wf_slc_users_bytype_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      55: { drk: 'wf_slc_users_group_icon.png', crr: 'hween12_track_crr_icon.png' },
      56: { drk: 'wf_slc_users_handitem_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      57: { drk: 'wf_slc_users_neighborhood_icon.png', crr: 'hween12_track_crr_icon.png' },
      58: { drk: 'wf_slc_users_onfurni_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      59: { drk: 'wf_slc_users_signal_icon.png', crr: 'hween12_track_crr_icon.png' },
      60: { drk: 'wf_slc_users_team_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      61: { drk: 'wf_slc_users_with_var_icon.png', crr: 'hween12_track_crr_icon.png' },
      62: { drk: 'wf_trg_click_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      63: { drk: 'wf_trg_user_performs_action_icon.png', crr: 'hween12_track_crr_icon.png' },
      64: { drk: 'wf_var_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      66: { drk: 'wf_xtra_filter_users_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      67: { drk: 'wf_xtra_mov_carry_users_icon.png', crr: 'hween12_track_crr_icon.png' },
      68: { drk: 'wf_xtra_text_output_username_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      69: { drk: 'xmas_c20_woodenhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      70: { drk: 'xmas_c23_mousechef_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      71: { drk: 'xmas_ltd23_carousel_icon.png', crr: 'hween12_track_crr_icon.png' },
      72: { drk: 'attic15_mousetrap_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      73: { drk: 'circus_c24_mastermouseact_icon.png', crr: 'hween12_track_crr_icon.png' },
      74: { drk: 'circus_c24_mouseact_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      75: { drk: 'clothing_bratzeitantrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      76: { drk: 'clothing_edwardianblouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      77: { drk: 'clothing_grungetrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      79: { drk: 'clothing_knighttrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      80: { drk: 'clothing_leathertrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      81: { drk: 'clothing_mockymouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      82: { drk: 'clothing_nftstripedtrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      83: { drk: 'dimmer_fuse2_icon.png', crr: 'hween12_track_crr_icon.png' },
      84: { drk: 'dimmer_fuse6_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      85: { drk: 'easter_c16_house_icon.png', crr: 'hween12_track_crr_icon.png' },
      86: { drk: 'easter_c23_greenhousewall_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      87: { drk: 'house2_icon.png', crr: 'hween12_track_crr_icon.png' },
      88: { drk: 'house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      89: { drk: 'house_sofa_icon.png', crr: 'hween12_track_crr_icon.png' },
      90: { drk: 'hs_applause_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      91: { drk: 'hween_c20_housewall_icon.png', crr: 'hween12_track_crr_icon.png' },
      92: { drk: 'js_c16_drkcab_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      93: { drk: 'loyalty_mouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      94: { drk: 'mini_c24_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      95: { drk: 'nft_h22_fusetronics_caps_icon.png', crr: 'hween12_track_crr_icon.png' },
      96: { drk: 'nft_h22_fusetronics_coil_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      97: { drk: 'nft_h22_fusetronics_fan_icon.png', crr: 'hween12_track_crr_icon.png' },
      98: { drk: 'nft_h22_fusetronics_ledg_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      99: { drk: 'nft_h22_fusetronics_ledr_icon.png', crr: 'hween12_track_crr_icon.png' },
      100: { drk: 'nft_h22_fusetronics_ledy_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      101: { drk: 'nft_h22_fusetronics_res_icon.png', crr: 'hween12_track_crr_icon.png' },
      102: { drk: 'nft_h22_fusetronics_rug_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      103: { drk: 'nft_h23_bday_balloonmouse1_icon.png', crr: 'hween12_track_crr_icon.png' },
      104: { drk: 'nft_h23_bday_balloonmouse2_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      105: { drk: 'nft_h24_cefalu_greenhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      106: { drk: 'ny2015_drktray_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      107: { drk: 'nyc_c23_steakhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      108: { drk: 'rare_r20_treehouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      109: { drk: 'santorini_c17_house_icon.png', crr: 'hween12_track_crr_icon.png' },
      110: { drk: 'santorini_c17_lighthouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      111: { drk: 'santorini_ltd17_lighthouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      112: { drk: 'school_ltd22_treehouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      113: { drk: 'uservoice_soapbox_icon.png', crr: 'hween12_track_crr_icon.png' },
      114: { drk: 'vikings_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      115: { drk: 'wf_act_furni_to_user_icon.png', crr: 'hween12_track_crr_icon.png' },
      116: { drk: 'wf_act_kick_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      117: { drk: 'wf_act_move_rotate_user_icon.png', crr: 'hween12_track_crr_icon.png' },
      118: { drk: 'wf_act_user_to_furni_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      119: { drk: 'wf_cnd_not_user_count_icon.png', crr: 'hween12_track_crr_icon.png' },
      120: { drk: 'wf_cnd_not_user_performs_action_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      121: { drk: 'wf_cnd_user_count_in_icon.png', crr: 'hween12_track_crr_icon.png' },
      122: { drk: 'wf_cnd_user_performs_action_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      123: { drk: 'wf_slc_users_area_icon.png', crr: 'hween12_track_crr_icon.png' },
      124: { drk: 'wf_slc_users_byaction_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      125: { drk: 'wf_slc_users_byname_icon.png', crr: 'hween12_track_crr_icon.png' },
      126: { drk: 'wf_slc_users_bytype_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      127: { drk: 'wf_slc_users_group_icon.png', crr: 'hween12_track_crr_icon.png' },
      128: { drk: 'wf_slc_users_handitem_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      129: { drk: 'wf_slc_users_neighborhood_icon.png', crr: 'hween12_track_crr_icon.png' },
      130: { drk: 'wf_slc_users_onfurni_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      131: { drk: 'wf_slc_users_signal_icon.png', crr: 'hween12_track_crr_icon.png' },
      132: { drk: 'wf_slc_users_team_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      133: { drk: 'wf_slc_users_with_var_icon.png', crr: 'hween12_track_crr_icon.png' },
      134: { drk: 'wf_trg_click_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      135: { drk: 'wf_trg_user_performs_action_icon.png', crr: 'hween12_track_crr_icon.png' },
      136: { drk: 'wf_var_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      137: { drk: 'wf_xtra_filter_users_by_var_icon.png', crr: 'hween12_track_crr_icon.png' },
      138: { drk: 'wf_xtra_filter_users_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      141: { drk: 'xmas_c20_woodenhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      142: { drk: 'xmas_c23_mousechef_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      143: { drk: 'xmas_ltd23_carousel_icon.png', crr: 'hween12_track_crr_icon.png' },
      144: { drk: 'attic15_mousetrap_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      146: { drk: 'circus_c24_mouseact_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      147: { drk: 'clothing_bratzeitantrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      148: { drk: 'clothing_edwardianblouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      149: { drk: 'clothing_grungetrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      150: { drk: 'clothing_highwaisttrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      151: { drk: 'clothing_knighttrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      152: { drk: 'clothing_leathertrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      153: { drk: 'clothing_mockymouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      154: { drk: 'clothing_nftstripedtrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      155: { drk: 'dimmer_fuse2_icon.png', crr: 'hween12_track_crr_icon.png' },
      159: { drk: 'house2_icon.png', crr: 'hween12_track_crr_icon.png' },
      163: { drk: 'hween_c20_housewall_icon.png', crr: 'hween12_track_crr_icon.png' },
      165: { drk: 'loyalty_mouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      166: { drk: 'mini_c24_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      167: { drk: 'nft_h22_fusetronics_caps_icon.png', crr: 'hween12_track_crr_icon.png' },
      168: { drk: 'nft_h22_fusetronics_coil_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      169: { drk: 'nft_h22_fusetronics_fan_icon.png', crr: 'hween12_track_crr_icon.png' },
      171: { drk: 'nft_h22_fusetronics_ledr_icon.png', crr: 'hween12_track_crr_icon.png' },
      172: { drk: 'nft_h22_fusetronics_ledy_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      173: { drk: 'nft_h22_fusetronics_res_icon.png', crr: 'hween12_track_crr_icon.png' },
      244: { drk: 'nft_h22_fusetronics_ledy_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1000: { drk: 'wf_var_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1001: { drk: 'wf_xtra_filter_users_by_var_icon.png', crr: 'hween12_track_crr_icon.png' },
      1002: { drk: 'wf_xtra_filter_users_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1003: { drk: 'wf_xtra_mov_carry_users_icon.png', crr: 'hween12_track_crr_icon.png' },
      1004: { drk: 'wf_xtra_text_output_username_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1005: { drk: 'xmas_c20_woodenhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1006: { drk: 'xmas_c23_mousechef_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1007: { drk: 'xmas_ltd23_carousel_icon.png', crr: 'hween12_track_crr_icon.png' },
      1008: { drk: 'attic15_mousetrap_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1009: { drk: 'circus_c24_mastermouseact_icon.png', crr: 'hween12_track_crr_icon.png' },
      1011: { drk: 'clothing_bratzeitantrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      1013: { drk: 'clothing_grungetrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      1014: { drk: 'clothing_highwaisttrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1015: { drk: 'clothing_knighttrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      1019: { drk: 'dimmer_fuse2_icon.png', crr: 'hween12_track_crr_icon.png' },
      1021: { drk: 'easter_c16_house_icon.png', crr: 'hween12_track_crr_icon.png' },
      1022: { drk: 'easter_c23_greenhousewall_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1023: { drk: 'house2_icon.png', crr: 'hween12_track_crr_icon.png' },
      1024: { drk: 'house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1025: { drk: 'house_sofa_icon.png', crr: 'hween12_track_crr_icon.png' },
      1026: { drk: 'hs_applause_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1027: { drk: 'hween_c20_housewall_icon.png', crr: 'hween12_track_crr_icon.png' },
      1028: { drk: 'js_c16_drkcab_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1029: { drk: 'loyalty_mouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1030: { drk: 'mini_c24_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1031: { drk: 'nft_h22_fusetronics_caps_icon.png', crr: 'hween12_track_crr_icon.png' },
      1032: { drk: 'nft_h22_fusetronics_coil_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1033: { drk: 'nft_h22_fusetronics_fan_icon.png', crr: 'hween12_track_crr_icon.png' },
      1034: { drk: 'nft_h22_fusetronics_ledg_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1035: { drk: 'nft_h22_fusetronics_ledr_icon.png', crr: 'hween12_track_crr_icon.png' },
      1036: { drk: 'nft_h22_fusetronics_ledy_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1037: { drk: 'nft_h22_fusetronics_res_icon.png', crr: 'hween12_track_crr_icon.png' },
      1038: { drk: 'nft_h22_fusetronics_rug_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1039: { drk: 'nft_h23_bday_balloonmouse1_icon.png', crr: 'hween12_track_crr_icon.png' },
      1040: { drk: 'nft_h23_bday_balloonmouse2_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1041: { drk: 'nft_h24_cefalu_greenhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1042: { drk: 'ny2015_drktray_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1043: { drk: 'nyc_c23_steakhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1044: { drk: 'rare_r20_treehouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1045: { drk: 'santorini_c17_house_icon.png', crr: 'hween12_track_crr_icon.png' },
      1046: { drk: 'santorini_c17_lighthouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1047: { drk: 'santorini_ltd17_lighthouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1048: { drk: 'school_ltd22_treehouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1049: { drk: 'uservoice_soapbox_icon.png', crr: 'hween12_track_crr_icon.png' },
      1050: { drk: 'vikings_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1051: { drk: 'wf_act_furni_to_user_icon.png', crr: 'hween12_track_crr_icon.png' },
      1052: { drk: 'wf_act_kick_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1053: { drk: 'wf_act_move_rotate_user_icon.png', crr: 'hween12_track_crr_icon.png' },
      1054: { drk: 'wf_act_user_to_furni_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1055: { drk: 'wf_cnd_not_user_count_icon.png', crr: 'hween12_track_crr_icon.png' },
      1056: { drk: 'wf_cnd_not_user_performs_action_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1057: { drk: 'wf_cnd_user_count_in_icon.png', crr: 'hween12_track_crr_icon.png' },
      1058: { drk: 'wf_cnd_user_performs_action_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1059: { drk: 'wf_slc_users_area_icon.png', crr: 'hween12_track_crr_icon.png' },
      1060: { drk: 'wf_slc_users_byaction_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1061: { drk: 'wf_slc_users_byname_icon.png', crr: 'hween12_track_crr_icon.png' },
      1062: { drk: 'wf_slc_users_bytype_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1063: { drk: 'wf_slc_users_group_icon.png', crr: 'hween12_track_crr_icon.png' },
      1064: { drk: 'wf_slc_users_handitem_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1065: { drk: 'wf_slc_users_neighborhood_icon.png', crr: 'hween12_track_crr_icon.png' },
      1066: { drk: 'wf_slc_users_onfurni_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1067: { drk: 'wf_slc_users_signal_icon.png', crr: 'hween12_track_crr_icon.png' },
      1068: { drk: 'wf_slc_users_team_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1069: { drk: 'wf_slc_users_with_var_icon.png', crr: 'hween12_track_crr_icon.png' },
      1070: { drk: 'wf_trg_click_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1071: { drk: 'wf_trg_user_performs_action_icon.png', crr: 'hween12_track_crr_icon.png' },
      1072: { drk: 'wf_var_user_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1073: { drk: 'wf_xtra_filter_users_by_var_icon.png', crr: 'hween12_track_crr_icon.png' },
      1074: { drk: 'wf_xtra_filter_users_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1075: { drk: 'wf_xtra_mov_carry_users_icon.png', crr: 'hween12_track_crr_icon.png' },
      1076: { drk: 'wf_xtra_text_output_username_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1077: { drk: 'xmas_c20_woodenhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1079: { drk: 'xmas_ltd23_carousel_icon.png', crr: 'hween12_track_crr_icon.png' },
      1080: { drk: 'attic15_mousetrap_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1081: { drk: 'circus_c24_mastermouseact_icon.png', crr: 'hween12_track_crr_icon.png' },
      1082: { drk: 'circus_c24_mouseact_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1083: { drk: 'clothing_bratzeitantrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      1084: { drk: 'clothing_edwardianblouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1085: { drk: 'clothing_grungetrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      1086: { drk: 'clothing_highwaisttrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1087: { drk: 'clothing_knighttrousers_icon.png', crr: 'hween12_track_crr_icon.png' },
      1088: { drk: 'clothing_leathertrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1089: { drk: 'clothing_mockymouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1090: { drk: 'clothing_nftstripedtrousers_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1091: { drk: 'dimmer_fuse2_icon.png', crr: 'hween12_track_crr_icon.png' },
      1092: { drk: 'dimmer_fuse6_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1093: { drk: 'easter_c16_house_icon.png', crr: 'hween12_track_crr_icon.png' },
      1094: { drk: 'easter_c23_greenhousewall_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1095: { drk: 'house2_icon.png', crr: 'hween12_track_crr_icon.png' },
      1096: { drk: 'house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1097: { drk: 'house_sofa_icon.png', crr: 'hween12_track_crr_icon.png' },
      1098: { drk: 'hs_applause_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1099: { drk: 'hween_c20_housewall_icon.png', crr: 'hween12_track_crr_icon.png' },
      1100: { drk: 'js_c16_drkcab_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1101: { drk: 'loyalty_mouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1102: { drk: 'mini_c24_house_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1103: { drk: 'nft_h22_fusetronics_caps_icon.png', crr: 'hween12_track_crr_icon.png' },
      1104: { drk: 'nft_h22_fusetronics_coil_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1105: { drk: 'nft_h22_fusetronics_fan_icon.png', crr: 'hween12_track_crr_icon.png' },
      1106: { drk: 'nft_h22_fusetronics_ledg_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1107: { drk: 'nft_h22_fusetronics_ledr_icon.png', crr: 'hween12_track_crr_icon.png' },
      1108: { drk: 'nft_h22_fusetronics_ledy_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1115: { drk: 'nyc_c23_steakhouse_icon.png', crr: 'hween12_track_crr_icon.png' },
      1116: { drk: 'rare_r20_treehouse_icon.png', crr: 'hblooza14_track_crr_icon.png' },
      1117: { drk: 'santorini_c17_house_icon.png', crr: 'hween12_track_crr_icon.png' }
    };
    
    const mapping = mappings[handitemId];
    if (mapping && mapping[type]) {
      return mapping[type];
    }
    
    // Fallback: usar índice circular para distribuir as imagens disponíveis
    const availableImages = type === 'drk' ? 
      ['attic15_mousetrap_icon.png', 'circus_c24_mastermouseact_icon.png', 'circus_c24_mouseact_icon.png', 'clothing_bratzeitantrousers_icon.png', 'clothing_edwardianblouse_icon.png'] :
      ['hblooza14_track_crr_icon.png', 'hween12_track_crr_icon.png'];
    
    const index = handitemId % availableImages.length;
    return availableImages[index];
  }


  /**
   * Verifica se uma imagem existe (otimizado para evitar loops)
   */
  private async checkImageExists(url: string): Promise<boolean> {
    try {
      // Para imagens locais, usar uma verificação mais rápida
      if (url.startsWith('/handitems/images/')) {
        // Assumir que as imagens preview existem baseado no padrão conhecido
        if (url.includes('/preview/handitem_') && url.endsWith('.svg')) {
          const handitemId = this.extractHanditemIdFromUrl(url);
          return handitemId !== null && handitemId >= 0 && handitemId <= 200; // Limite razoável
        }
        // Para drk e crr, assumir que não existem por enquanto
        return false;
      }
      
      // Para outras URLs, fazer verificação HTTP
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extrai o ID do handitem da URL
   */
  private extractHanditemIdFromUrl(url: string): number | null {
    const match = url.match(/handitem_(\d+)\.svg$/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Retorna imagem de fallback
   */
  private getFallbackImage(handitemId: number): string {
    // Usar placeholder baseado no tipo de handitem
    const isUseItem = this.isUseItem(handitemId);
    const type = isUseItem ? 'drk' : 'crr';
    return `/assets/handitem_placeholder_${type}.png`;
  }

  /**
   * Determina se é UseItem baseado no ID
   */
  private isUseItem(handitemId: number): boolean {
    // Lógica baseada nos IDs conhecidos de UseItems
    const useItemIds = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 40, 41, 42, 43, 44];
    return useItemIds.includes(handitemId);
  }

  /**
   * Verifica se o cache é válido
   */
  private isCacheValid(cached: HanditemImageInfo): boolean {
    const now = new Date().getTime();
    const lastChecked = new Date(cached.discoveredImages[0]?.lastChecked || 0).getTime();
    return (now - lastChecked) < this.CACHE_DURATION;
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Retorna estatísticas do cache
   */
  getCacheStats(): { total: number; valid: number; expired: number } {
    const now = new Date().getTime();
    let valid = 0;
    let expired = 0;

    for (const [, info] of this.cache) {
      if (this.isCacheValid(info)) {
        valid++;
      } else {
        expired++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

// Instância global
export const handitemImageDiscovery = new HanditemImageDiscovery();
