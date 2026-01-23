/**
 * Serviço oficial do Habbo Avatar Editor
 * Seguindo a especificação técnica completa
 */

export interface HabboPalette {
  id: string;
  colors: Array<{
    id: string;
    index: string;
    club: string;
    selectable: string;
    hex: string;
  }>;
}

export interface HabboClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: string;
  selectable: string;
  imageUrl: string;
  isSelectable: boolean;
  isColorable: boolean;
}

export interface HabboCategory {
  id: string;
  name: string;
  displayName: string;
  paletteId: string;
  items: HabboClothingItem[];
  colors: string[];
}

export interface AvatarState {
  hr: string; // hr-100-61
  hd: string; // hd-180-1
  ch: string; // ch-210-66
  lg: string; // lg-270-82
  sh: string; // sh-290-80
  // Opcionais
  ha?: string;
  he?: string;
  ea?: string;
  fa?: string;
  cc?: string;
  cp?: string;
  ca?: string;
  wa?: string;
}

export class HabboOfficialService {
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas
  private habboData: { palettes: HabboPalette[], categories: HabboCategory[] } | null = null;

  /**
   * Carrega dados oficiais do Habbo seguindo a especificação técnica
   */
  async loadHabboData(): Promise<{ palettes: HabboPalette[], categories: HabboCategory[] }> {
    const cacheKey = 'habbo_official_data';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      console.log('🔄 Carregando dados oficiais do Habbo...');

      // Tentar carregar dados do arquivo gerado usando fetch
      const response = await fetch('/complete_mock_data.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const mockData = await response.json();
      console.log('✅ Carregando dados mock completos do arquivo');

      // Adicionar as paletas oficiais
      const palettes = this.getOfficialPalettes();

      const data = {
        palettes,
        categories: mockData.categories.map((cat: any) => ({
          ...cat,
          // Preencher cores disponíveis para cada categoria (incluir todas as cores - abordagem HabboNews)
          colors: palettes.find(p => p.id === cat.paletteId)?.colors
            .map((c: any) => c.id) || []
        }))
      };

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      this.habboData = data;
      console.log('✅ Dados oficiais carregados com sucesso!');
      return data;

    } catch (error) {
      console.warn('❌ Erro ao carregar dados do arquivo, usando fallback:', error);
      // Fallback para dados hardcoded se o arquivo não existir
      const data = this.getFallbackMockData();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      this.habboData = data;
      return data;
    }
  }

  /**
   * Paletas oficiais completas do Habbo (extraídas do figuredata.xml oficial)
   */
  private getOfficialPalettes(): HabboPalette[] {
    return [
      {
        "id": "1",
        "colors": [
          {
            "id": "14",
            "index": "0",
            "club": "0",
            "selectable": "1",
            "hex": "F5DA88"
          },
          {
            "id": "10",
            "index": "1",
            "club": "0",
            "selectable": "1",
            "hex": "FFDBC1"
          },
          {
            "id": "1",
            "index": "2",
            "club": "0",
            "selectable": "1",
            "hex": "FFCB98"
          },
          {
            "id": "8",
            "index": "3",
            "club": "0",
            "selectable": "1",
            "hex": "F4AC54"
          },
          {
            "id": "12",
            "index": "4",
            "club": "0",
            "selectable": "1",
            "hex": "FF987F"
          },
          {
            "id": "1369",
            "index": "5",
            "club": "0",
            "selectable": "1",
            "hex": "e0a9a9"
          },
          {
            "id": "1370",
            "index": "6",
            "club": "0",
            "selectable": "1",
            "hex": "ca8154"
          },
          {
            "id": "19",
            "index": "7",
            "club": "0",
            "selectable": "1",
            "hex": "B87560"
          },
          {
            "id": "20",
            "index": "8",
            "club": "0",
            "selectable": "1",
            "hex": "9C543F"
          },
          {
            "id": "1371",
            "index": "9",
            "club": "0",
            "selectable": "1",
            "hex": "904925"
          },
          {
            "id": "30",
            "index": "10",
            "club": "0",
            "selectable": "1",
            "hex": "4C311E"
          },
          {
            "id": "1372",
            "index": "11",
            "club": "2",
            "selectable": "1",
            "hex": "543d35"
          },
          {
            "id": "1373",
            "index": "12",
            "club": "2",
            "selectable": "1",
            "hex": "653a1d"
          },
          {
            "id": "21",
            "index": "13",
            "club": "2",
            "selectable": "1",
            "hex": "6E392C"
          },
          {
            "id": "1374",
            "index": "14",
            "club": "2",
            "selectable": "1",
            "hex": "714947"
          },
          {
            "id": "1375",
            "index": "15",
            "club": "2",
            "selectable": "1",
            "hex": "856860"
          },
          {
            "id": "1376",
            "index": "16",
            "club": "2",
            "selectable": "1",
            "hex": "895048"
          },
          {
            "id": "1377",
            "index": "17",
            "club": "2",
            "selectable": "1",
            "hex": "a15253"
          },
          {
            "id": "1378",
            "index": "18",
            "club": "2",
            "selectable": "1",
            "hex": "aa7870"
          },
          {
            "id": "1379",
            "index": "19",
            "club": "2",
            "selectable": "1",
            "hex": "be8263"
          },
          {
            "id": "1380",
            "index": "20",
            "club": "2",
            "selectable": "1",
            "hex": "b6856d"
          },
          {
            "id": "1381",
            "index": "21",
            "club": "2",
            "selectable": "1",
            "hex": "ba8a82"
          },
          {
            "id": "1382",
            "index": "22",
            "club": "2",
            "selectable": "1",
            "hex": "c88f82"
          },
          {
            "id": "1383",
            "index": "23",
            "club": "2",
            "selectable": "1",
            "hex": "d9a792"
          },
          {
            "id": "1384",
            "index": "24",
            "club": "2",
            "selectable": "1",
            "hex": "c68383"
          },
          {
            "id": "1368",
            "index": "25",
            "club": "2",
            "selectable": "1",
            "hex": "BC576A"
          },
          {
            "id": "1367",
            "index": "26",
            "club": "2",
            "selectable": "1",
            "hex": "FF5757"
          },
          {
            "id": "1366",
            "index": "27",
            "club": "2",
            "selectable": "1",
            "hex": "FF7575"
          },
          {
            "id": "1358",
            "index": "28",
            "club": "2",
            "selectable": "1",
            "hex": "B65E38"
          },
          {
            "id": "1385",
            "index": "29",
            "club": "2",
            "selectable": "1",
            "hex": "a76644"
          },
          {
            "id": "1386",
            "index": "30",
            "club": "2",
            "selectable": "1",
            "hex": "7c5133"
          },
          {
            "id": "1387",
            "index": "31",
            "club": "2",
            "selectable": "1",
            "hex": "9a7257"
          },
          {
            "id": "5",
            "index": "32",
            "club": "2",
            "selectable": "1",
            "hex": "945C2F"
          },
          {
            "id": "1389",
            "index": "33",
            "club": "2",
            "selectable": "1",
            "hex": "d98c63"
          },
          {
            "id": "4",
            "index": "34",
            "club": "2",
            "selectable": "1",
            "hex": "AE7748"
          },
          {
            "id": "1388",
            "index": "35",
            "club": "2",
            "selectable": "1",
            "hex": "c57040"
          },
          {
            "id": "1359",
            "index": "36",
            "club": "2",
            "selectable": "1",
            "hex": "B88655"
          },
          {
            "id": "3",
            "index": "37",
            "club": "2",
            "selectable": "1",
            "hex": "C99263"
          },
          {
            "id": "18",
            "index": "38",
            "club": "2",
            "selectable": "1",
            "hex": "A89473"
          },
          {
            "id": "17",
            "index": "39",
            "club": "2",
            "selectable": "1",
            "hex": "C89F56"
          },
          {
            "id": "9",
            "index": "40",
            "club": "2",
            "selectable": "1",
            "hex": "DC9B4C"
          },
          {
            "id": "1357",
            "index": "41",
            "club": "2",
            "selectable": "1",
            "hex": "FF8C40"
          },
          {
            "id": "1390",
            "index": "42",
            "club": "2",
            "selectable": "1",
            "hex": "de9d75"
          },
          {
            "id": "1391",
            "index": "43",
            "club": "2",
            "selectable": "1",
            "hex": "eca782"
          },
          {
            "id": "11",
            "index": "44",
            "club": "2",
            "selectable": "1",
            "hex": "FFB696"
          },
          {
            "id": "2",
            "index": "45",
            "club": "2",
            "selectable": "1",
            "hex": "E3AE7D"
          },
          {
            "id": "7",
            "index": "46",
            "club": "2",
            "selectable": "1",
            "hex": "FFC680"
          },
          {
            "id": "15",
            "index": "47",
            "club": "2",
            "selectable": "1",
            "hex": "DFC375"
          },
          {
            "id": "13",
            "index": "48",
            "club": "2",
            "selectable": "1",
            "hex": "F0DCA3"
          },
          {
            "id": "22",
            "index": "49",
            "club": "2",
            "selectable": "1",
            "hex": "EAEFD0"
          },
          {
            "id": "23",
            "index": "50",
            "club": "2",
            "selectable": "1",
            "hex": "E2E4B0"
          },
          {
            "id": "24",
            "index": "51",
            "club": "2",
            "selectable": "1",
            "hex": "D5D08C"
          },
          {
            "id": "1361",
            "index": "52",
            "club": "2",
            "selectable": "1",
            "hex": "BDE05F"
          },
          {
            "id": "1362",
            "index": "53",
            "club": "2",
            "selectable": "1",
            "hex": "5DC446"
          },
          {
            "id": "1360",
            "index": "54",
            "club": "2",
            "selectable": "1",
            "hex": "A2CC89"
          },
          {
            "id": "26",
            "index": "55",
            "club": "2",
            "selectable": "1",
            "hex": "C2C4A7"
          },
          {
            "id": "28",
            "index": "56",
            "club": "2",
            "selectable": "1",
            "hex": "F1E5DA"
          },
          {
            "id": "1392",
            "index": "57",
            "club": "2",
            "selectable": "1",
            "hex": "f6d3d4"
          },
          {
            "id": "1393",
            "index": "58",
            "club": "2",
            "selectable": "1",
            "hex": "e5b6b0"
          },
          {
            "id": "25",
            "index": "59",
            "club": "2",
            "selectable": "1",
            "hex": "C4A7B3"
          },
          {
            "id": "1363",
            "index": "60",
            "club": "2",
            "selectable": "1",
            "hex": "AC94B3"
          },
          {
            "id": "1364",
            "index": "61",
            "club": "2",
            "selectable": "1",
            "hex": "D288CE"
          },
          {
            "id": "1365",
            "index": "62",
            "club": "2",
            "selectable": "1",
            "hex": "6799CC"
          },
          {
            "id": "29",
            "index": "63",
            "club": "2",
            "selectable": "1",
            "hex": "B3BDC3"
          },
          {
            "id": "27",
            "index": "64",
            "club": "2",
            "selectable": "1",
            "hex": "C5C0C2"
          },
          {
            "id": "1001",
            "index": "65",
            "club": "0",
            "selectable": "0",
            "hex": "644628"
          },
          {
            "id": "1002",
            "index": "66",
            "club": "0",
            "selectable": "0",
            "hex": "926338"
          },
          {
            "id": "1003",
            "index": "67",
            "club": "0",
            "selectable": "0",
            "hex": "A97C44"
          },
          {
            "id": "1004",
            "index": "68",
            "club": "0",
            "selectable": "0",
            "hex": "B3957F"
          },
          {
            "id": "1005",
            "index": "69",
            "club": "0",
            "selectable": "0",
            "hex": "BD9562"
          },
          {
            "id": "1006",
            "index": "70",
            "club": "0",
            "selectable": "0",
            "hex": "C2A896"
          },
          {
            "id": "1007",
            "index": "71",
            "club": "0",
            "selectable": "0",
            "hex": "CA9072"
          },
          {
            "id": "1008",
            "index": "72",
            "club": "0",
            "selectable": "0",
            "hex": "CBBC90"
          },
          {
            "id": "1009",
            "index": "73",
            "club": "0",
            "selectable": "0",
            "hex": "D1A78C"
          },
          {
            "id": "1010",
            "index": "74",
            "club": "0",
            "selectable": "0",
            "hex": "D1BCAD"
          },
          {
            "id": "1011",
            "index": "75",
            "club": "0",
            "selectable": "0",
            "hex": "D7BCA9"
          },
          {
            "id": "1012",
            "index": "76",
            "club": "0",
            "selectable": "0",
            "hex": "D7CBA3"
          },
          {
            "id": "1013",
            "index": "77",
            "club": "0",
            "selectable": "0",
            "hex": "D8A595"
          },
          {
            "id": "1014",
            "index": "78",
            "club": "0",
            "selectable": "0",
            "hex": "D8B07E"
          },
          {
            "id": "1015",
            "index": "79",
            "club": "0",
            "selectable": "0",
            "hex": "E0BD91"
          },
          {
            "id": "1016",
            "index": "80",
            "club": "0",
            "selectable": "0",
            "hex": "E0D0C5"
          },
          {
            "id": "1017",
            "index": "81",
            "club": "0",
            "selectable": "0",
            "hex": "E2DBB9"
          },
          {
            "id": "1018",
            "index": "82",
            "club": "0",
            "selectable": "0",
            "hex": "E3D38D"
          },
          {
            "id": "1019",
            "index": "83",
            "club": "0",
            "selectable": "0",
            "hex": "E7C9A3"
          },
          {
            "id": "1020",
            "index": "84",
            "club": "0",
            "selectable": "0",
            "hex": "EDD7BB"
          },
          {
            "id": "1021",
            "index": "85",
            "club": "0",
            "selectable": "0",
            "hex": "EEE7E0"
          },
          {
            "id": "1022",
            "index": "86",
            "club": "0",
            "selectable": "0",
            "hex": "EFC3B6"
          },
          {
            "id": "1023",
            "index": "87",
            "club": "0",
            "selectable": "0",
            "hex": "F1D6B4"
          },
          {
            "id": "1024",
            "index": "88",
            "club": "0",
            "selectable": "0",
            "hex": "F8E5DA"
          },
          {
            "id": "1025",
            "index": "89",
            "club": "0",
            "selectable": "0",
            "hex": "FDDACF"
          },
          {
            "id": "1026",
            "index": "90",
            "club": "0",
            "selectable": "0",
            "hex": "FFCC99"
          },
          {
            "id": "6",
            "index": "91",
            "club": "0",
            "selectable": "0",
            "hex": "6E482C"
          },
          {
            "id": "16",
            "index": "92",
            "club": "0",
            "selectable": "0",
            "hex": "EFD17D"
          }
        ]
      },
      {
        "id": "2",
        "colors": [
          {
            "id": "40",
            "index": "0",
            "club": "0",
            "selectable": "1",
            "hex": "D8D3D9"
          },
          {
            "id": "34",
            "index": "1",
            "club": "0",
            "selectable": "1",
            "hex": "FFEEB9"
          },
          {
            "id": "35",
            "index": "2",
            "club": "0",
            "selectable": "1",
            "hex": "F6D059"
          },
          {
            "id": "36",
            "index": "3",
            "club": "0",
            "selectable": "1",
            "hex": "F2B11D"
          },
          {
            "id": "31",
            "index": "4",
            "club": "0",
            "selectable": "1",
            "hex": "FFD6A9"
          },
          {
            "id": "32",
            "index": "5",
            "club": "0",
            "selectable": "1",
            "hex": "DFA66F"
          },
          {
            "id": "37",
            "index": "6",
            "club": "0",
            "selectable": "1",
            "hex": "9A5D2E"
          },
          {
            "id": "38",
            "index": "7",
            "club": "0",
            "selectable": "1",
            "hex": "AC5300"
          },
          {
            "id": "43",
            "index": "8",
            "club": "0",
            "selectable": "1",
            "hex": "F29159"
          },
          {
            "id": "46",
            "index": "9",
            "club": "0",
            "selectable": "1",
            "hex": "FF8746"
          },
          {
            "id": "47",
            "index": "10",
            "club": "0",
            "selectable": "1",
            "hex": "FC610C"
          },
          {
            "id": "48",
            "index": "11",
            "club": "0",
            "selectable": "1",
            "hex": "DE3900"
          },
          {
            "id": "44",
            "index": "12",
            "club": "0",
            "selectable": "1",
            "hex": "9E3D3B"
          },
          {
            "id": "39",
            "index": "13",
            "club": "0",
            "selectable": "1",
            "hex": "783400"
          },
          {
            "id": "45",
            "index": "14",
            "club": "0",
            "selectable": "1",
            "hex": "5C4332"
          },
          {
            "id": "42",
            "index": "15",
            "club": "0",
            "selectable": "1",
            "hex": "4A4656"
          },
          {
            "id": "61",
            "index": "16",
            "club": "2",
            "selectable": "1",
            "hex": "2D2D2D"
          },
          {
            "id": "1394",
            "index": "17",
            "club": "2",
            "selectable": "1",
            "hex": "3f2113"
          },
          {
            "id": "1395",
            "index": "18",
            "club": "2",
            "selectable": "1",
            "hex": "774422"
          },
          {
            "id": "33",
            "index": "19",
            "club": "2",
            "selectable": "1",
            "hex": "D1803A"
          },
          {
            "id": "1396",
            "index": "20",
            "club": "2",
            "selectable": "1",
            "hex": "cc8b33"
          },
          {
            "id": "1397",
            "index": "21",
            "club": "2",
            "selectable": "1",
            "hex": "e5ba6a"
          },
          {
            "id": "1398",
            "index": "22",
            "club": "2",
            "selectable": "1",
            "hex": "f6d990"
          },
          {
            "id": "49",
            "index": "23",
            "club": "2",
            "selectable": "1",
            "hex": "FFFFFF"
          },
          {
            "id": "1342",
            "index": "24",
            "club": "2",
            "selectable": "1",
            "hex": "fffdd6"
          },
          {
            "id": "1343",
            "index": "25",
            "club": "2",
            "selectable": "1",
            "hex": "fff392"
          },
          {
            "id": "1399",
            "index": "26",
            "club": "2",
            "selectable": "1",
            "hex": "ffff00"
          },
          {
            "id": "1344",
            "index": "27",
            "club": "2",
            "selectable": "1",
            "hex": "ffe508"
          },
          {
            "id": "1400",
            "index": "28",
            "club": "2",
            "selectable": "1",
            "hex": "ff7716"
          },
          {
            "id": "1401",
            "index": "29",
            "club": "2",
            "selectable": "1",
            "hex": "aa2c1b"
          },
          {
            "id": "59",
            "index": "30",
            "club": "2",
            "selectable": "1",
            "hex": "E71B0A"
          },
          {
            "id": "1345",
            "index": "31",
            "club": "2",
            "selectable": "1",
            "hex": "ff3e3e"
          },
          {
            "id": "1348",
            "index": "32",
            "club": "2",
            "selectable": "1",
            "hex": "ff638f"
          },
          {
            "id": "54",
            "index": "33",
            "club": "2",
            "selectable": "1",
            "hex": "FFBDBC"
          },
          {
            "id": "1346",
            "index": "34",
            "club": "2",
            "selectable": "1",
            "hex": "ffddf1"
          },
          {
            "id": "1347",
            "index": "35",
            "club": "2",
            "selectable": "1",
            "hex": "ffaedc"
          },
          {
            "id": "55",
            "index": "36",
            "club": "2",
            "selectable": "1",
            "hex": "DE34A4"
          },
          {
            "id": "1349",
            "index": "37",
            "club": "2",
            "selectable": "1",
            "hex": "9e326a"
          },
          {
            "id": "56",
            "index": "38",
            "club": "2",
            "selectable": "1",
            "hex": "9F5699"
          },
          {
            "id": "1350",
            "index": "39",
            "club": "2",
            "selectable": "1",
            "hex": "8a4fb5"
          },
          {
            "id": "1351",
            "index": "40",
            "club": "2",
            "selectable": "1",
            "hex": "722ba6"
          },
          {
            "id": "1352",
            "index": "41",
            "club": "2",
            "selectable": "1",
            "hex": "4c1d6f"
          },
          {
            "id": "1402",
            "index": "42",
            "club": "2",
            "selectable": "1",
            "hex": "322c7a"
          },
          {
            "id": "1403",
            "index": "43",
            "club": "2",
            "selectable": "1",
            "hex": "71584a"
          },
          {
            "id": "1404",
            "index": "44",
            "club": "2",
            "selectable": "1",
            "hex": "aa8864"
          },
          {
            "id": "1405",
            "index": "45",
            "club": "2",
            "selectable": "1",
            "hex": "bbb1aa"
          },
          {
            "id": "1353",
            "index": "46",
            "club": "2",
            "selectable": "1",
            "hex": "c1c6ef"
          },
          {
            "id": "57",
            "index": "47",
            "club": "2",
            "selectable": "1",
            "hex": "D5F9FB"
          },
          {
            "id": "60",
            "index": "48",
            "club": "2",
            "selectable": "1",
            "hex": "95FFFA"
          },
          {
            "id": "58",
            "index": "49",
            "club": "2",
            "selectable": "1",
            "hex": "6699CC"
          },
          {
            "id": "1354",
            "index": "50",
            "club": "2",
            "selectable": "1",
            "hex": "4481e5"
          },
          {
            "id": "1355",
            "index": "51",
            "club": "2",
            "selectable": "1",
            "hex": "2c50aa"
          },
          {
            "id": "1356",
            "index": "52",
            "club": "2",
            "selectable": "1",
            "hex": "2a4167"
          },
          {
            "id": "53",
            "index": "53",
            "club": "2",
            "selectable": "1",
            "hex": "3A7B93"
          },
          {
            "id": "52",
            "index": "54",
            "club": "2",
            "selectable": "1",
            "hex": "339966"
          },
          {
            "id": "1406",
            "index": "55",
            "club": "2",
            "selectable": "1",
            "hex": "70c100"
          },
          {
            "id": "51",
            "index": "56",
            "club": "2",
            "selectable": "1",
            "hex": "A3FF8F"
          },
          {
            "id": "1316",
            "index": "57",
            "club": "2",
            "selectable": "1",
            "hex": "D2FF00"
          },
          {
            "id": "50",
            "index": "58",
            "club": "2",
            "selectable": "1",
            "hex": "E5FF09"
          },
          {
            "id": "41",
            "index": "59",
            "club": "2",
            "selectable": "1",
            "hex": "918D98"
          },
          {
            "id": "1407",
            "index": "60",
            "club": "2",
            "selectable": "1",
            "hex": "333333"
          },
          {
            "id": "1027",
            "index": "61",
            "club": "0",
            "selectable": "0",
            "hex": "00FA00"
          },
          {
            "id": "1028",
            "index": "62",
            "club": "0",
            "selectable": "0",
            "hex": "0A0A0A"
          },
          {
            "id": "1029",
            "index": "63",
            "club": "0",
            "selectable": "0",
            "hex": "105262"
          },
          {
            "id": "1030",
            "index": "64",
            "club": "0",
            "selectable": "0",
            "hex": "106262"
          },
          {
            "id": "1031",
            "index": "65",
            "club": "0",
            "selectable": "0",
            "hex": "1E3214"
          },
          {
            "id": "1032",
            "index": "66",
            "club": "0",
            "selectable": "0",
            "hex": "20B4A4"
          },
          {
            "id": "1033",
            "index": "67",
            "club": "0",
            "selectable": "0",
            "hex": "234CAF"
          },
          {
            "id": "1034",
            "index": "68",
            "club": "0",
            "selectable": "0",
            "hex": "248954"
          },
          {
            "id": "1035",
            "index": "69",
            "club": "0",
            "selectable": "0",
            "hex": "282828"
          },
          {
            "id": "1036",
            "index": "70",
            "club": "0",
            "selectable": "0",
            "hex": "292929"
          },
          {
            "id": "1037",
            "index": "71",
            "club": "0",
            "selectable": "0",
            "hex": "298BB4"
          },
          {
            "id": "1038",
            "index": "72",
            "club": "0",
            "selectable": "0",
            "hex": "2DA5E9"
          },
          {
            "id": "1039",
            "index": "73",
            "club": "0",
            "selectable": "0",
            "hex": "319CF6"
          },
          {
            "id": "1040",
            "index": "74",
            "club": "0",
            "selectable": "0",
            "hex": "31F6DE"
          },
          {
            "id": "1041",
            "index": "75",
            "club": "0",
            "selectable": "0",
            "hex": "322F3E"
          },
          {
            "id": "1042",
            "index": "76",
            "club": "0",
            "selectable": "0",
            "hex": "323235"
          },
          {
            "id": "1043",
            "index": "77",
            "club": "0",
            "selectable": "0",
            "hex": "325B6A"
          },
          {
            "id": "1044",
            "index": "78",
            "club": "0",
            "selectable": "0",
            "hex": "3296FA"
          },
          {
            "id": "1045",
            "index": "79",
            "club": "0",
            "selectable": "0",
            "hex": "333333"
          },
          {
            "id": "1046",
            "index": "80",
            "club": "0",
            "selectable": "0",
            "hex": "394194"
          },
          {
            "id": "1047",
            "index": "81",
            "club": "0",
            "selectable": "0",
            "hex": "463C14"
          },
          {
            "id": "1048",
            "index": "82",
            "club": "0",
            "selectable": "0",
            "hex": "4A6A18"
          },
          {
            "id": "1049",
            "index": "83",
            "club": "0",
            "selectable": "0",
            "hex": "4B5A5A"
          },
          {
            "id": "1050",
            "index": "84",
            "club": "0",
            "selectable": "0",
            "hex": "4D3223"
          },
          {
            "id": "1051",
            "index": "85",
            "club": "0",
            "selectable": "0",
            "hex": "4F87C0"
          },
          {
            "id": "1052",
            "index": "86",
            "club": "0",
            "selectable": "0",
            "hex": "579E1F"
          },
          {
            "id": "1053",
            "index": "87",
            "club": "0",
            "selectable": "0",
            "hex": "5A480A"
          },
          {
            "id": "1054",
            "index": "88",
            "club": "0",
            "selectable": "0",
            "hex": "5A837B"
          },
          {
            "id": "1055",
            "index": "89",
            "club": "0",
            "selectable": "0",
            "hex": "624A41"
          },
          {
            "id": "1056",
            "index": "90",
            "club": "0",
            "selectable": "0",
            "hex": "625A20"
          },
          {
            "id": "1057",
            "index": "91",
            "club": "0",
            "selectable": "0",
            "hex": "626262"
          },
          {
            "id": "1058",
            "index": "92",
            "club": "0",
            "selectable": "0",
            "hex": "646D6C"
          },
          {
            "id": "1059",
            "index": "93",
            "club": "0",
            "selectable": "0",
            "hex": "662608"
          },
          {
            "id": "1060",
            "index": "94",
            "club": "0",
            "selectable": "0",
            "hex": "666666"
          },
          {
            "id": "1061",
            "index": "95",
            "club": "0",
            "selectable": "0",
            "hex": "674E3B"
          },
          {
            "id": "1062",
            "index": "96",
            "club": "0",
            "selectable": "0",
            "hex": "6A3910"
          },
          {
            "id": "1063",
            "index": "97",
            "club": "0",
            "selectable": "0",
            "hex": "736346"
          },
          {
            "id": "1064",
            "index": "98",
            "club": "0",
            "selectable": "0",
            "hex": "781414"
          },
          {
            "id": "1065",
            "index": "99",
            "club": "0",
            "selectable": "0",
            "hex": "784215"
          },
          {
            "id": "1066",
            "index": "100",
            "club": "0",
            "selectable": "0",
            "hex": "786D5A"
          },
          {
            "id": "1067",
            "index": "101",
            "club": "0",
            "selectable": "0",
            "hex": "7B1894"
          },
          {
            "id": "1068",
            "index": "102",
            "club": "0",
            "selectable": "0",
            "hex": "7D5B17"
          },
          {
            "id": "1069",
            "index": "103",
            "club": "0",
            "selectable": "0",
            "hex": "80557C"
          },
          {
            "id": "1070",
            "index": "104",
            "club": "0",
            "selectable": "0",
            "hex": "833141"
          },
          {
            "id": "1071",
            "index": "105",
            "club": "0",
            "selectable": "0",
            "hex": "8A4924"
          },
          {
            "id": "1072",
            "index": "106",
            "club": "0",
            "selectable": "0",
            "hex": "8B1820"
          },
          {
            "id": "1073",
            "index": "107",
            "club": "0",
            "selectable": "0",
            "hex": "8C694B"
          },
          {
            "id": "1074",
            "index": "108",
            "club": "0",
            "selectable": "0",
            "hex": "8C967E"
          },
          {
            "id": "1075",
            "index": "109",
            "club": "0",
            "selectable": "0",
            "hex": "904839"
          },
          {
            "id": "1076",
            "index": "110",
            "club": "0",
            "selectable": "0",
            "hex": "926338"
          },
          {
            "id": "1077",
            "index": "111",
            "club": "0",
            "selectable": "0",
            "hex": "946220"
          },
          {
            "id": "1078",
            "index": "112",
            "club": "0",
            "selectable": "0",
            "hex": "947BAC"
          },
          {
            "id": "1079",
            "index": "113",
            "club": "0",
            "selectable": "0",
            "hex": "948B6A"
          },
          {
            "id": "1080",
            "index": "114",
            "club": "0",
            "selectable": "0",
            "hex": "94BD29"
          },
          {
            "id": "1081",
            "index": "115",
            "club": "0",
            "selectable": "0",
            "hex": "94DFFF"
          },
          {
            "id": "1082",
            "index": "116",
            "club": "0",
            "selectable": "0",
            "hex": "94FFD5"
          },
          {
            "id": "1083",
            "index": "117",
            "club": "0",
            "selectable": "0",
            "hex": "95784E"
          },
          {
            "id": "1084",
            "index": "118",
            "club": "0",
            "selectable": "0",
            "hex": "9CF068"
          },
          {
            "id": "1085",
            "index": "119",
            "club": "0",
            "selectable": "0",
            "hex": "9E3F0B"
          },
          {
            "id": "1086",
            "index": "120",
            "club": "0",
            "selectable": "0",
            "hex": "A08C64"
          },
          {
            "id": "1087",
            "index": "121",
            "club": "0",
            "selectable": "0",
            "hex": "A4A4A4"
          },
          {
            "id": "1088",
            "index": "122",
            "club": "0",
            "selectable": "0",
            "hex": "A4DEFF"
          },
          {
            "id": "1089",
            "index": "123",
            "club": "0",
            "selectable": "0",
            "hex": "A55A18"
          },
          {
            "id": "1090",
            "index": "124",
            "club": "0",
            "selectable": "0",
            "hex": "A7272C"
          },
          {
            "id": "1091",
            "index": "125",
            "club": "0",
            "selectable": "0",
            "hex": "A97C44"
          },
          {
            "id": "1092",
            "index": "126",
            "club": "0",
            "selectable": "0",
            "hex": "B29B86"
          },
          {
            "id": "1093",
            "index": "127",
            "club": "0",
            "selectable": "0",
            "hex": "B2A590"
          },
          {
            "id": "1094",
            "index": "128",
            "club": "0",
            "selectable": "0",
            "hex": "B3957F"
          },
          {
            "id": "1095",
            "index": "129",
            "club": "0",
            "selectable": "0",
            "hex": "B429CD"
          },
          {
            "id": "1096",
            "index": "130",
            "club": "0",
            "selectable": "0",
            "hex": "B4EE29"
          },
          {
            "id": "1097",
            "index": "131",
            "club": "0",
            "selectable": "0",
            "hex": "B58B5C"
          },
          {
            "id": "1098",
            "index": "132",
            "club": "0",
            "selectable": "0",
            "hex": "B9A16E"
          },
          {
            "id": "1099",
            "index": "133",
            "club": "0",
            "selectable": "0",
            "hex": "BD9562"
          },
          {
            "id": "1100",
            "index": "134",
            "club": "0",
            "selectable": "0",
            "hex": "BD9CFF"
          },
          {
            "id": "1101",
            "index": "135",
            "club": "0",
            "selectable": "0",
            "hex": "BDBD9D"
          },
          {
            "id": "1102",
            "index": "136",
            "club": "0",
            "selectable": "0",
            "hex": "C21A86"
          },
          {
            "id": "1103",
            "index": "137",
            "club": "0",
            "selectable": "0",
            "hex": "C29C57"
          },
          {
            "id": "1104",
            "index": "138",
            "club": "0",
            "selectable": "0",
            "hex": "C2A896"
          },
          {
            "id": "1105",
            "index": "139",
            "club": "0",
            "selectable": "0",
            "hex": "C2E3E8"
          },
          {
            "id": "1106",
            "index": "140",
            "club": "0",
            "selectable": "0",
            "hex": "C376C4"
          },
          {
            "id": "1107",
            "index": "141",
            "club": "0",
            "selectable": "0",
            "hex": "C4FFFF"
          },
          {
            "id": "1108",
            "index": "142",
            "club": "0",
            "selectable": "0",
            "hex": "C54A29"
          },
          {
            "id": "1109",
            "index": "143",
            "club": "0",
            "selectable": "0",
            "hex": "C59462"
          },
          {
            "id": "1110",
            "index": "144",
            "club": "0",
            "selectable": "0",
            "hex": "C8D2E6"
          },
          {
            "id": "1111",
            "index": "145",
            "club": "0",
            "selectable": "0",
            "hex": "C96B2F"
          },
          {
            "id": "1112",
            "index": "146",
            "club": "0",
            "selectable": "0",
            "hex": "CA5A1E"
          },
          {
            "id": "1113",
            "index": "147",
            "club": "0",
            "selectable": "0",
            "hex": "CA5A33"
          },
          {
            "id": "1114",
            "index": "148",
            "club": "0",
            "selectable": "0",
            "hex": "CA9072"
          },
          {
            "id": "1115",
            "index": "149",
            "club": "0",
            "selectable": "0",
            "hex": "CBBC90"
          },
          {
            "id": "1116",
            "index": "150",
            "club": "0",
            "selectable": "0",
            "hex": "CD99C7"
          },
          {
            "id": "1117",
            "index": "151",
            "club": "0",
            "selectable": "0",
            "hex": "CF6254"
          },
          {
            "id": "1118",
            "index": "152",
            "club": "0",
            "selectable": "0",
            "hex": "D1A78C"
          },
          {
            "id": "1119",
            "index": "153",
            "club": "0",
            "selectable": "0",
            "hex": "D1BCAD"
          },
          {
            "id": "1120",
            "index": "154",
            "club": "0",
            "selectable": "0",
            "hex": "D2C8CC"
          },
          {
            "id": "1121",
            "index": "155",
            "club": "0",
            "selectable": "0",
            "hex": "D45B0A"
          },
          {
            "id": "1122",
            "index": "156",
            "club": "0",
            "selectable": "0",
            "hex": "D4FE80"
          },
          {
            "id": "1123",
            "index": "157",
            "club": "0",
            "selectable": "0",
            "hex": "D54173"
          },
          {
            "id": "1124",
            "index": "158",
            "club": "0",
            "selectable": "0",
            "hex": "D5FF9C"
          },
          {
            "id": "1125",
            "index": "159",
            "club": "0",
            "selectable": "0",
            "hex": "D7BCA9"
          },
          {
            "id": "1126",
            "index": "160",
            "club": "0",
            "selectable": "0",
            "hex": "D7CBA3"
          },
          {
            "id": "1127",
            "index": "161",
            "club": "0",
            "selectable": "0",
            "hex": "D8A595"
          },
          {
            "id": "1128",
            "index": "162",
            "club": "0",
            "selectable": "0",
            "hex": "D8B07E"
          },
          {
            "id": "1129",
            "index": "163",
            "club": "0",
            "selectable": "0",
            "hex": "DA945E"
          },
          {
            "id": "1130",
            "index": "164",
            "club": "0",
            "selectable": "0",
            "hex": "DB7C62"
          },
          {
            "id": "1131",
            "index": "165",
            "club": "0",
            "selectable": "0",
            "hex": "DCDCC8"
          },
          {
            "id": "1132",
            "index": "166",
            "club": "0",
            "selectable": "0",
            "hex": "DDA934"
          },
          {
            "id": "1133",
            "index": "167",
            "club": "0",
            "selectable": "0",
            "hex": "DE73DE"
          },
          {
            "id": "1134",
            "index": "168",
            "club": "0",
            "selectable": "0",
            "hex": "DEDEDE"
          },
          {
            "id": "1135",
            "index": "169",
            "club": "0",
            "selectable": "0",
            "hex": "DFAFD1"
          },
          {
            "id": "1136",
            "index": "170",
            "club": "0",
            "selectable": "0",
            "hex": "DFCBAF"
          },
          {
            "id": "1137",
            "index": "171",
            "club": "0",
            "selectable": "0",
            "hex": "E0BA78"
          },
          {
            "id": "1138",
            "index": "172",
            "club": "0",
            "selectable": "0",
            "hex": "E0BD91"
          },
          {
            "id": "1139",
            "index": "173",
            "club": "0",
            "selectable": "0",
            "hex": "E0D0C5"
          },
          {
            "id": "1140",
            "index": "174",
            "club": "0",
            "selectable": "0",
            "hex": "E1CC78"
          },
          {
            "id": "1141",
            "index": "175",
            "club": "0",
            "selectable": "0",
            "hex": "E2DBB9"
          },
          {
            "id": "1142",
            "index": "176",
            "club": "0",
            "selectable": "0",
            "hex": "E63139"
          },
          {
            "id": "1143",
            "index": "177",
            "club": "0",
            "selectable": "0",
            "hex": "E6A4F6"
          },
          {
            "id": "1144",
            "index": "178",
            "club": "0",
            "selectable": "0",
            "hex": "E7C9A3"
          },
          {
            "id": "1145",
            "index": "179",
            "club": "0",
            "selectable": "0",
            "hex": "E7E92D"
          },
          {
            "id": "1146",
            "index": "180",
            "club": "0",
            "selectable": "0",
            "hex": "EA5959"
          },
          {
            "id": "1147",
            "index": "181",
            "club": "0",
            "selectable": "0",
            "hex": "ECFFED"
          },
          {
            "id": "1148",
            "index": "182",
            "club": "0",
            "selectable": "0",
            "hex": "EDD7BB"
          },
          {
            "id": "1149",
            "index": "183",
            "club": "0",
            "selectable": "0",
            "hex": "EEE7E0"
          },
          {
            "id": "1150",
            "index": "184",
            "club": "0",
            "selectable": "0",
            "hex": "EEEEEE"
          },
          {
            "id": "1151",
            "index": "185",
            "club": "0",
            "selectable": "0",
            "hex": "EFC3B6"
          },
          {
            "id": "1152",
            "index": "186",
            "club": "0",
            "selectable": "0",
            "hex": "F1D6B4"
          },
          {
            "id": "1153",
            "index": "187",
            "club": "0",
            "selectable": "0",
            "hex": "F6AC31"
          },
          {
            "id": "1154",
            "index": "188",
            "club": "0",
            "selectable": "0",
            "hex": "F73B32"
          },
          {
            "id": "1155",
            "index": "189",
            "club": "0",
            "selectable": "0",
            "hex": "F8E5DA"
          },
          {
            "id": "1156",
            "index": "190",
            "club": "0",
            "selectable": "0",
            "hex": "FDA61E"
          },
          {
            "id": "1157",
            "index": "191",
            "club": "0",
            "selectable": "0",
            "hex": "FDDACF"
          },
          {
            "id": "1158",
            "index": "192",
            "club": "0",
            "selectable": "0",
            "hex": "FE6D6D"
          },
          {
            "id": "1159",
            "index": "193",
            "club": "0",
            "selectable": "0",
            "hex": "FE834D"
          },
          {
            "id": "1160",
            "index": "194",
            "club": "0",
            "selectable": "0",
            "hex": "FF0000"
          },
          {
            "id": "1161",
            "index": "195",
            "club": "0",
            "selectable": "0",
            "hex": "FF006A"
          },
          {
            "id": "1162",
            "index": "196",
            "club": "0",
            "selectable": "0",
            "hex": "FF4814"
          },
          {
            "id": "1163",
            "index": "197",
            "club": "0",
            "selectable": "0",
            "hex": "FF4C2F"
          },
          {
            "id": "1164",
            "index": "198",
            "club": "0",
            "selectable": "0",
            "hex": "FF5F9B"
          },
          {
            "id": "1165",
            "index": "199",
            "club": "0",
            "selectable": "0",
            "hex": "FF7329"
          },
          {
            "id": "1166",
            "index": "200",
            "club": "0",
            "selectable": "0",
            "hex": "FF7383"
          },
          {
            "id": "1167",
            "index": "201",
            "club": "0",
            "selectable": "0",
            "hex": "FF7BDE"
          },
          {
            "id": "1168",
            "index": "202",
            "club": "0",
            "selectable": "0",
            "hex": "FF9C62"
          },
          {
            "id": "1169",
            "index": "203",
            "club": "0",
            "selectable": "0",
            "hex": "FFA772"
          },
          {
            "id": "1170",
            "index": "204",
            "club": "0",
            "selectable": "0",
            "hex": "FFADAE"
          },
          {
            "id": "1171",
            "index": "205",
            "club": "0",
            "selectable": "0",
            "hex": "FFBC42"
          },
          {
            "id": "1172",
            "index": "206",
            "club": "0",
            "selectable": "0",
            "hex": "FFBDBD"
          },
          {
            "id": "1173",
            "index": "207",
            "club": "0",
            "selectable": "0",
            "hex": "FFBE73"
          },
          {
            "id": "1174",
            "index": "208",
            "club": "0",
            "selectable": "0",
            "hex": "FFC53A"
          },
          {
            "id": "1175",
            "index": "209",
            "club": "0",
            "selectable": "0",
            "hex": "FFCD94"
          },
          {
            "id": "1176",
            "index": "210",
            "club": "0",
            "selectable": "0",
            "hex": "FFCD9B"
          },
          {
            "id": "1177",
            "index": "211",
            "club": "0",
            "selectable": "0",
            "hex": "FFDC7A"
          },
          {
            "id": "1178",
            "index": "212",
            "club": "0",
            "selectable": "0",
            "hex": "FFE639"
          },
          {
            "id": "1179",
            "index": "213",
            "club": "0",
            "selectable": "0",
            "hex": "FFE673"
          },
          {
            "id": "1180",
            "index": "214",
            "club": "0",
            "selectable": "0",
            "hex": "FFEAAC"
          },
          {
            "id": "1181",
            "index": "215",
            "club": "0",
            "selectable": "0",
            "hex": "FFEAAD"
          },
          {
            "id": "1182",
            "index": "216",
            "club": "0",
            "selectable": "0",
            "hex": "FFEEC5"
          },
          {
            "id": "1183",
            "index": "217",
            "club": "0",
            "selectable": "0",
            "hex": "FFFFFF"
          }
        ]
      },
      {
        "id": "3",
        "colors": [
          {
            "id": "1408",
            "index": "0",
            "club": "0",
            "selectable": "1",
            "hex": "dddddd"
          },
          {
            "id": "90",
            "index": "1",
            "club": "0",
            "selectable": "1",
            "hex": "96743D"
          },
          {
            "id": "91",
            "index": "2",
            "club": "0",
            "selectable": "1",
            "hex": "6B573B"
          },
          {
            "id": "66",
            "index": "3",
            "club": "0",
            "selectable": "1",
            "hex": "E7B027"
          },
          {
            "id": "1320",
            "index": "4",
            "club": "0",
            "selectable": "1",
            "hex": "fff7b7"
          },
          {
            "id": "68",
            "index": "5",
            "club": "0",
            "selectable": "1",
            "hex": "F8C790"
          },
          {
            "id": "73",
            "index": "6",
            "club": "0",
            "selectable": "1",
            "hex": "9F2B31"
          },
          {
            "id": "72",
            "index": "7",
            "club": "0",
            "selectable": "1",
            "hex": "ED5C50"
          },
          {
            "id": "71",
            "index": "8",
            "club": "0",
            "selectable": "1",
            "hex": "FFBFC2"
          },
          {
            "id": "74",
            "index": "9",
            "club": "0",
            "selectable": "1",
            "hex": "E7D1EE"
          },
          {
            "id": "75",
            "index": "10",
            "club": "0",
            "selectable": "1",
            "hex": "AC94B3"
          },
          {
            "id": "76",
            "index": "11",
            "club": "0",
            "selectable": "1",
            "hex": "7E5B90"
          },
          {
            "id": "82",
            "index": "12",
            "club": "0",
            "selectable": "1",
            "hex": "4F7AA2"
          },
          {
            "id": "81",
            "index": "13",
            "club": "0",
            "selectable": "1",
            "hex": "75B7C7"
          },
          {
            "id": "80",
            "index": "14",
            "club": "0",
            "selectable": "1",
            "hex": "C5EDE6"
          },
          {
            "id": "83",
            "index": "15",
            "club": "0",
            "selectable": "1",
            "hex": "BBF3BD"
          },
          {
            "id": "84",
            "index": "16",
            "club": "0",
            "selectable": "1",
            "hex": "6BAE61"
          },
          {
            "id": "85",
            "index": "17",
            "club": "0",
            "selectable": "1",
            "hex": "456F40"
          },
          {
            "id": "88",
            "index": "18",
            "club": "0",
            "selectable": "1",
            "hex": "7A7D22"
          },
          {
            "id": "64",
            "index": "19",
            "club": "0",
            "selectable": "1",
            "hex": "595959"
          },
          {
            "id": "110",
            "index": "20",
            "club": "2",
            "selectable": "1",
            "hex": "1E1E1E"
          },
          {
            "id": "1325",
            "index": "21",
            "club": "2",
            "selectable": "1",
            "hex": "84573c"
          },
          {
            "id": "67",
            "index": "22",
            "club": "2",
            "selectable": "1",
            "hex": "A86B19"
          },
          {
            "id": "1409",
            "index": "23",
            "club": "2",
            "selectable": "1",
            "hex": "c69f71"
          },
          {
            "id": "89",
            "index": "24",
            "club": "2",
            "selectable": "1",
            "hex": "F3E1AF"
          },
          {
            "id": "92",
            "index": "25",
            "club": "2",
            "selectable": "1",
            "hex": "FFFFFF"
          },
          {
            "id": "93",
            "index": "26",
            "club": "2",
            "selectable": "1",
            "hex": "FFF41D"
          },
          {
            "id": "1321",
            "index": "27",
            "club": "2",
            "selectable": "1",
            "hex": "ffe508"
          },
          {
            "id": "1410",
            "index": "28",
            "club": "2",
            "selectable": "1",
            "hex": "ffcc00"
          },
          {
            "id": "1322",
            "index": "29",
            "club": "2",
            "selectable": "1",
            "hex": "ffa508"
          },
          {
            "id": "94",
            "index": "30",
            "club": "2",
            "selectable": "1",
            "hex": "FF9211"
          },
          {
            "id": "1323",
            "index": "31",
            "club": "2",
            "selectable": "1",
            "hex": "ff5b08"
          },
          {
            "id": "70",
            "index": "32",
            "club": "2",
            "selectable": "1",
            "hex": "C74400"
          },
          {
            "id": "1411",
            "index": "33",
            "club": "2",
            "selectable": "1",
            "hex": "da6a43"
          },
          {
            "id": "1324",
            "index": "34",
            "club": "2",
            "selectable": "1",
            "hex": "b18276"
          },
          {
            "id": "1329",
            "index": "35",
            "club": "2",
            "selectable": "1",
            "hex": "ae4747"
          },
          {
            "id": "1330",
            "index": "36",
            "club": "2",
            "selectable": "1",
            "hex": "813033"
          },
          {
            "id": "1331",
            "index": "37",
            "club": "2",
            "selectable": "1",
            "hex": "5b2420"
          },
          {
            "id": "100",
            "index": "38",
            "club": "2",
            "selectable": "1",
            "hex": "9B001D"
          },
          {
            "id": "1412",
            "index": "39",
            "club": "2",
            "selectable": "1",
            "hex": "d2183c"
          },
          {
            "id": "1413",
            "index": "40",
            "club": "2",
            "selectable": "1",
            "hex": "e53624"
          },
          {
            "id": "96",
            "index": "41",
            "club": "2",
            "selectable": "1",
            "hex": "FF1300"
          },
          {
            "id": "1328",
            "index": "42",
            "club": "2",
            "selectable": "1",
            "hex": "ff638f"
          },
          {
            "id": "1414",
            "index": "43",
            "club": "2",
            "selectable": "1",
            "hex": "fe86b1"
          },
          {
            "id": "97",
            "index": "44",
            "club": "2",
            "selectable": "1",
            "hex": "FF6D8F"
          },
          {
            "id": "1326",
            "index": "45",
            "club": "2",
            "selectable": "1",
            "hex": "ffc7e4"
          },
          {
            "id": "98",
            "index": "46",
            "club": "2",
            "selectable": "1",
            "hex": "E993FF"
          },
          {
            "id": "1327",
            "index": "47",
            "club": "2",
            "selectable": "1",
            "hex": "ff88f4"
          },
          {
            "id": "95",
            "index": "48",
            "club": "2",
            "selectable": "1",
            "hex": "FF27A6"
          },
          {
            "id": "99",
            "index": "49",
            "club": "2",
            "selectable": "1",
            "hex": "C600AD"
          },
          {
            "id": "1415",
            "index": "50",
            "club": "2",
            "selectable": "1",
            "hex": "a1295e"
          },
          {
            "id": "1416",
            "index": "51",
            "club": "2",
            "selectable": "1",
            "hex": "a723c9"
          },
          {
            "id": "1417",
            "index": "52",
            "club": "2",
            "selectable": "1",
            "hex": "6a0481"
          },
          {
            "id": "1418",
            "index": "53",
            "club": "2",
            "selectable": "1",
            "hex": "693959"
          },
          {
            "id": "1419",
            "index": "54",
            "club": "2",
            "selectable": "1",
            "hex": "62368c"
          },
          {
            "id": "79",
            "index": "55",
            "club": "2",
            "selectable": "1",
            "hex": "544A81"
          },
          {
            "id": "1420",
            "index": "56",
            "club": "2",
            "selectable": "1",
            "hex": "957caf"
          },
          {
            "id": "78",
            "index": "57",
            "club": "2",
            "selectable": "1",
            "hex": "6D80BB"
          },
          {
            "id": "1340",
            "index": "58",
            "club": "2",
            "selectable": "1",
            "hex": "574bfb"
          },
          {
            "id": "1421",
            "index": "59",
            "club": "2",
            "selectable": "1",
            "hex": "6b71ed"
          },
          {
            "id": "1339",
            "index": "60",
            "club": "2",
            "selectable": "1",
            "hex": "8791f0"
          },
          {
            "id": "1337",
            "index": "61",
            "club": "2",
            "selectable": "1",
            "hex": "c1c6ef"
          },
          {
            "id": "105",
            "index": "62",
            "club": "2",
            "selectable": "1",
            "hex": "94FFEC"
          },
          {
            "id": "104",
            "index": "63",
            "club": "2",
            "selectable": "1",
            "hex": "00B9A8"
          },
          {
            "id": "1422",
            "index": "64",
            "club": "2",
            "selectable": "1",
            "hex": "009db9"
          },
          {
            "id": "106",
            "index": "65",
            "club": "2",
            "selectable": "1",
            "hex": "1BD2FF"
          },
          {
            "id": "1423",
            "index": "66",
            "club": "2",
            "selectable": "1",
            "hex": "2f8ce9"
          },
          {
            "id": "107",
            "index": "67",
            "club": "2",
            "selectable": "1",
            "hex": "1F55FF"
          },
          {
            "id": "1424",
            "index": "68",
            "club": "2",
            "selectable": "1",
            "hex": "1946c7"
          },
          {
            "id": "108",
            "index": "69",
            "club": "2",
            "selectable": "1",
            "hex": "0219A5"
          },
          {
            "id": "1341",
            "index": "70",
            "club": "2",
            "selectable": "1",
            "hex": "394a7e"
          },
          {
            "id": "1425",
            "index": "71",
            "club": "2",
            "selectable": "1",
            "hex": "2d547b"
          },
          {
            "id": "1426",
            "index": "72",
            "club": "2",
            "selectable": "1",
            "hex": "406184"
          },
          {
            "id": "1338",
            "index": "73",
            "club": "2",
            "selectable": "1",
            "hex": "6fa5cc"
          },
          {
            "id": "77",
            "index": "74",
            "club": "2",
            "selectable": "1",
            "hex": "ACC9E6"
          },
          {
            "id": "1427",
            "index": "75",
            "club": "2",
            "selectable": "1",
            "hex": "c8c8c8"
          },
          {
            "id": "63",
            "index": "76",
            "club": "2",
            "selectable": "1",
            "hex": "A4A4A4"
          },
          {
            "id": "1428",
            "index": "77",
            "club": "2",
            "selectable": "1",
            "hex": "868686"
          },
          {
            "id": "1334",
            "index": "78",
            "club": "2",
            "selectable": "1",
            "hex": "89906e"
          },
          {
            "id": "1335",
            "index": "79",
            "club": "2",
            "selectable": "1",
            "hex": "738b6e"
          },
          {
            "id": "1429",
            "index": "80",
            "club": "2",
            "selectable": "1",
            "hex": "626738"
          },
          {
            "id": "109",
            "index": "81",
            "club": "2",
            "selectable": "1",
            "hex": "3A5341"
          },
          {
            "id": "1336",
            "index": "82",
            "club": "2",
            "selectable": "1",
            "hex": "1d301a"
          },
          {
            "id": "1430",
            "index": "83",
            "club": "2",
            "selectable": "1",
            "hex": "0a6437"
          },
          {
            "id": "1431",
            "index": "84",
            "club": "2",
            "selectable": "1",
            "hex": "47891f"
          },
          {
            "id": "1432",
            "index": "85",
            "club": "2",
            "selectable": "1",
            "hex": "10a32f"
          },
          {
            "id": "1433",
            "index": "86",
            "club": "2",
            "selectable": "1",
            "hex": "69bb2d"
          },
          {
            "id": "87",
            "index": "87",
            "club": "2",
            "selectable": "1",
            "hex": "BABB3D"
          },
          {
            "id": "86",
            "index": "88",
            "club": "2",
            "selectable": "1",
            "hex": "EDFF9A"
          },
          {
            "id": "1315",
            "index": "89",
            "club": "2",
            "selectable": "1",
            "hex": "D2FF00"
          },
          {
            "id": "103",
            "index": "90",
            "club": "2",
            "selectable": "1",
            "hex": "AFF203"
          },
          {
            "id": "102",
            "index": "91",
            "club": "2",
            "selectable": "1",
            "hex": "1CDC00"
          },
          {
            "id": "101",
            "index": "92",
            "club": "2",
            "selectable": "1",
            "hex": "76FF2D"
          },
          {
            "id": "1332",
            "index": "93",
            "club": "2",
            "selectable": "1",
            "hex": "9eff8d"
          },
          {
            "id": "1333",
            "index": "94",
            "club": "2",
            "selectable": "1",
            "hex": "a2cc89"
          },
          {
            "id": "1184",
            "index": "95",
            "club": "0",
            "selectable": "0",
            "hex": "003F1D"
          },
          {
            "id": "1185",
            "index": "96",
            "club": "0",
            "selectable": "0",
            "hex": "096E16"
          },
          {
            "id": "1186",
            "index": "97",
            "club": "0",
            "selectable": "0",
            "hex": "105262"
          },
          {
            "id": "1187",
            "index": "98",
            "club": "0",
            "selectable": "0",
            "hex": "106262"
          },
          {
            "id": "1188",
            "index": "99",
            "club": "0",
            "selectable": "0",
            "hex": "121D6D"
          },
          {
            "id": "1189",
            "index": "100",
            "club": "0",
            "selectable": "0",
            "hex": "1F1F1F"
          },
          {
            "id": "1190",
            "index": "101",
            "club": "0",
            "selectable": "0",
            "hex": "20B4A4"
          },
          {
            "id": "1191",
            "index": "102",
            "club": "0",
            "selectable": "0",
            "hex": "20B913"
          },
          {
            "id": "1192",
            "index": "103",
            "club": "0",
            "selectable": "0",
            "hex": "2828C8"
          },
          {
            "id": "1193",
            "index": "104",
            "club": "0",
            "selectable": "0",
            "hex": "292929"
          },
          {
            "id": "1194",
            "index": "105",
            "club": "0",
            "selectable": "0",
            "hex": "298BB4"
          },
          {
            "id": "1195",
            "index": "106",
            "club": "0",
            "selectable": "0",
            "hex": "2F2D26"
          },
          {
            "id": "1196",
            "index": "107",
            "club": "0",
            "selectable": "0",
            "hex": "319CF6"
          },
          {
            "id": "1197",
            "index": "108",
            "club": "0",
            "selectable": "0",
            "hex": "31F6DE"
          },
          {
            "id": "1198",
            "index": "109",
            "club": "0",
            "selectable": "0",
            "hex": "333333"
          },
          {
            "id": "1199",
            "index": "110",
            "club": "0",
            "selectable": "0",
            "hex": "336633"
          },
          {
            "id": "1200",
            "index": "111",
            "club": "0",
            "selectable": "0",
            "hex": "365E8A"
          },
          {
            "id": "1201",
            "index": "112",
            "club": "0",
            "selectable": "0",
            "hex": "378BE8"
          },
          {
            "id": "1202",
            "index": "113",
            "club": "0",
            "selectable": "0",
            "hex": "37E8C5"
          },
          {
            "id": "1203",
            "index": "114",
            "club": "0",
            "selectable": "0",
            "hex": "394194"
          },
          {
            "id": "1204",
            "index": "115",
            "club": "0",
            "selectable": "0",
            "hex": "3B7AC0"
          },
          {
            "id": "1205",
            "index": "116",
            "club": "0",
            "selectable": "0",
            "hex": "3D3D3D"
          },
          {
            "id": "1206",
            "index": "117",
            "club": "0",
            "selectable": "0",
            "hex": "406A65"
          },
          {
            "id": "1207",
            "index": "118",
            "club": "0",
            "selectable": "0",
            "hex": "43001A"
          },
          {
            "id": "1208",
            "index": "119",
            "club": "0",
            "selectable": "0",
            "hex": "456283"
          },
          {
            "id": "1209",
            "index": "120",
            "club": "0",
            "selectable": "0",
            "hex": "4A6A18"
          },
          {
            "id": "1210",
            "index": "121",
            "club": "0",
            "selectable": "0",
            "hex": "4C882B"
          },
          {
            "id": "1211",
            "index": "122",
            "club": "0",
            "selectable": "0",
            "hex": "5A837B"
          },
          {
            "id": "1212",
            "index": "123",
            "club": "0",
            "selectable": "0",
            "hex": "5CC445"
          },
          {
            "id": "1213",
            "index": "124",
            "club": "0",
            "selectable": "0",
            "hex": "5F5F5F"
          },
          {
            "id": "1214",
            "index": "125",
            "club": "0",
            "selectable": "0",
            "hex": "624A41"
          },
          {
            "id": "1215",
            "index": "126",
            "club": "0",
            "selectable": "0",
            "hex": "625A20"
          },
          {
            "id": "1216",
            "index": "127",
            "club": "0",
            "selectable": "0",
            "hex": "626262"
          },
          {
            "id": "1217",
            "index": "128",
            "club": "0",
            "selectable": "0",
            "hex": "656A40"
          },
          {
            "id": "1218",
            "index": "129",
            "club": "0",
            "selectable": "0",
            "hex": "666666"
          },
          {
            "id": "1219",
            "index": "130",
            "club": "0",
            "selectable": "0",
            "hex": "687450"
          },
          {
            "id": "1220",
            "index": "131",
            "club": "0",
            "selectable": "0",
            "hex": "6A3910"
          },
          {
            "id": "1221",
            "index": "132",
            "club": "0",
            "selectable": "0",
            "hex": "6A4A40"
          },
          {
            "id": "1222",
            "index": "133",
            "club": "0",
            "selectable": "0",
            "hex": "779FBB"
          },
          {
            "id": "1223",
            "index": "134",
            "club": "0",
            "selectable": "0",
            "hex": "795E53"
          },
          {
            "id": "1224",
            "index": "135",
            "club": "0",
            "selectable": "0",
            "hex": "7B1894"
          },
          {
            "id": "1225",
            "index": "136",
            "club": "0",
            "selectable": "0",
            "hex": "7B5818"
          },
          {
            "id": "1226",
            "index": "137",
            "club": "0",
            "selectable": "0",
            "hex": "7C8F7D"
          },
          {
            "id": "1227",
            "index": "138",
            "club": "0",
            "selectable": "0",
            "hex": "7D0004"
          },
          {
            "id": "62",
            "index": "140",
            "club": "0",
            "selectable": "0",
            "hex": "EEEEEE"
          },
          {
            "id": "1229",
            "index": "141",
            "club": "0",
            "selectable": "0",
            "hex": "7D0034"
          },
          {
            "id": "65",
            "index": "144",
            "club": "0",
            "selectable": "0",
            "hex": "F6E179"
          },
          {
            "id": "1230",
            "index": "145",
            "club": "0",
            "selectable": "0",
            "hex": "833141"
          },
          {
            "id": "69",
            "index": "146",
            "club": "0",
            "selectable": "0",
            "hex": "EB7E43"
          },
          {
            "id": "1231",
            "index": "147",
            "club": "0",
            "selectable": "0",
            "hex": "87D7CD"
          },
          {
            "id": "1232",
            "index": "148",
            "club": "0",
            "selectable": "0",
            "hex": "88E0DE"
          },
          {
            "id": "1233",
            "index": "149",
            "club": "0",
            "selectable": "0",
            "hex": "8B1820"
          },
          {
            "id": "1234",
            "index": "150",
            "club": "0",
            "selectable": "0",
            "hex": "946220"
          },
          {
            "id": "1235",
            "index": "151",
            "club": "0",
            "selectable": "0",
            "hex": "947BAC"
          },
          {
            "id": "1236",
            "index": "152",
            "club": "0",
            "selectable": "0",
            "hex": "948B6A"
          },
          {
            "id": "1237",
            "index": "153",
            "club": "0",
            "selectable": "0",
            "hex": "94BD29"
          },
          {
            "id": "1238",
            "index": "154",
            "club": "0",
            "selectable": "0",
            "hex": "94FFD5"
          },
          {
            "id": "1239",
            "index": "155",
            "club": "0",
            "selectable": "0",
            "hex": "95784E"
          },
          {
            "id": "1240",
            "index": "156",
            "club": "0",
            "selectable": "0",
            "hex": "983E4F"
          },
          {
            "id": "1241",
            "index": "157",
            "club": "0",
            "selectable": "0",
            "hex": "98863E"
          },
          {
            "id": "1242",
            "index": "158",
            "club": "0",
            "selectable": "0",
            "hex": "9FD787"
          },
          {
            "id": "1243",
            "index": "159",
            "club": "0",
            "selectable": "0",
            "hex": "A4A4A4"
          },
          {
            "id": "1244",
            "index": "160",
            "club": "0",
            "selectable": "0",
            "hex": "A4DEFF"
          },
          {
            "id": "1245",
            "index": "161",
            "club": "0",
            "selectable": "0",
            "hex": "A88139"
          },
          {
            "id": "1246",
            "index": "162",
            "club": "0",
            "selectable": "0",
            "hex": "ADD0FF"
          },
          {
            "id": "1247",
            "index": "163",
            "club": "0",
            "selectable": "0",
            "hex": "AFDCDF"
          },
          {
            "id": "1248",
            "index": "164",
            "club": "0",
            "selectable": "0",
            "hex": "B3FCFF"
          },
          {
            "id": "1249",
            "index": "165",
            "club": "0",
            "selectable": "0",
            "hex": "B429CD"
          },
          {
            "id": "1250",
            "index": "166",
            "club": "0",
            "selectable": "0",
            "hex": "B4EE29"
          },
          {
            "id": "1251",
            "index": "167",
            "club": "0",
            "selectable": "0",
            "hex": "B6396D"
          },
          {
            "id": "1252",
            "index": "168",
            "club": "0",
            "selectable": "0",
            "hex": "B79BFF"
          },
          {
            "id": "1253",
            "index": "169",
            "club": "0",
            "selectable": "0",
            "hex": "B8E737"
          },
          {
            "id": "1254",
            "index": "170",
            "club": "0",
            "selectable": "0",
            "hex": "BA9D73"
          },
          {
            "id": "1255",
            "index": "171",
            "club": "0",
            "selectable": "0",
            "hex": "BAAD68"
          },
          {
            "id": "1256",
            "index": "172",
            "club": "0",
            "selectable": "0",
            "hex": "BAC7FF"
          },
          {
            "id": "1257",
            "index": "173",
            "club": "0",
            "selectable": "0",
            "hex": "BB2430"
          },
          {
            "id": "1258",
            "index": "174",
            "club": "0",
            "selectable": "0",
            "hex": "BD9CFF"
          },
          {
            "id": "1259",
            "index": "175",
            "club": "0",
            "selectable": "0",
            "hex": "BDFFC8"
          },
          {
            "id": "1260",
            "index": "176",
            "club": "0",
            "selectable": "0",
            "hex": "C0B4C7"
          },
          {
            "id": "1261",
            "index": "177",
            "club": "0",
            "selectable": "0",
            "hex": "C1C1C1"
          },
          {
            "id": "1262",
            "index": "178",
            "club": "0",
            "selectable": "0",
            "hex": "C1D2DB"
          },
          {
            "id": "1263",
            "index": "179",
            "club": "0",
            "selectable": "0",
            "hex": "C54A29"
          },
          {
            "id": "1264",
            "index": "180",
            "club": "0",
            "selectable": "0",
            "hex": "C59462"
          },
          {
            "id": "1265",
            "index": "181",
            "club": "0",
            "selectable": "0",
            "hex": "C6B3D6"
          },
          {
            "id": "1266",
            "index": "182",
            "club": "0",
            "selectable": "0",
            "hex": "C745D9"
          },
          {
            "id": "1267",
            "index": "183",
            "club": "0",
            "selectable": "0",
            "hex": "CA2221"
          },
          {
            "id": "1268",
            "index": "184",
            "club": "0",
            "selectable": "0",
            "hex": "CDCDFF"
          },
          {
            "id": "1269",
            "index": "185",
            "club": "0",
            "selectable": "0",
            "hex": "CDFFB3"
          },
          {
            "id": "1270",
            "index": "186",
            "club": "0",
            "selectable": "0",
            "hex": "D1DFAF"
          },
          {
            "id": "1271",
            "index": "187",
            "club": "0",
            "selectable": "0",
            "hex": "D1FFD4"
          },
          {
            "id": "1272",
            "index": "188",
            "club": "0",
            "selectable": "0",
            "hex": "D54173"
          },
          {
            "id": "1273",
            "index": "189",
            "club": "0",
            "selectable": "0",
            "hex": "D5FF9C"
          },
          {
            "id": "1274",
            "index": "190",
            "club": "0",
            "selectable": "0",
            "hex": "D68C8C"
          },
          {
            "id": "1275",
            "index": "191",
            "club": "0",
            "selectable": "0",
            "hex": "D7C187"
          },
          {
            "id": "1276",
            "index": "192",
            "club": "0",
            "selectable": "0",
            "hex": "D9457E"
          },
          {
            "id": "1277",
            "index": "193",
            "club": "0",
            "selectable": "0",
            "hex": "D97145"
          },
          {
            "id": "1278",
            "index": "194",
            "club": "0",
            "selectable": "0",
            "hex": "DE73DE"
          },
          {
            "id": "1279",
            "index": "195",
            "club": "0",
            "selectable": "0",
            "hex": "DEDEDE"
          },
          {
            "id": "1280",
            "index": "196",
            "club": "0",
            "selectable": "0",
            "hex": "DFAFD1"
          },
          {
            "id": "1281",
            "index": "197",
            "club": "0",
            "selectable": "0",
            "hex": "DFCBAF"
          },
          {
            "id": "1282",
            "index": "198",
            "club": "0",
            "selectable": "0",
            "hex": "E63139"
          },
          {
            "id": "1283",
            "index": "199",
            "club": "0",
            "selectable": "0",
            "hex": "E6A4F6"
          },
          {
            "id": "1284",
            "index": "200",
            "club": "0",
            "selectable": "0",
            "hex": "E8B137"
          },
          {
            "id": "1285",
            "index": "201",
            "club": "0",
            "selectable": "0",
            "hex": "E8FFFF"
          },
          {
            "id": "1286",
            "index": "202",
            "club": "0",
            "selectable": "0",
            "hex": "EEEEEE"
          },
          {
            "id": "1287",
            "index": "203",
            "club": "0",
            "selectable": "0",
            "hex": "F64C3E"
          },
          {
            "id": "1288",
            "index": "204",
            "club": "0",
            "selectable": "0",
            "hex": "F6AC31"
          },
          {
            "id": "1289",
            "index": "205",
            "club": "0",
            "selectable": "0",
            "hex": "F9A0A0"
          },
          {
            "id": "1290",
            "index": "206",
            "club": "0",
            "selectable": "0",
            "hex": "FF006A"
          },
          {
            "id": "1291",
            "index": "207",
            "club": "0",
            "selectable": "0",
            "hex": "FF1092"
          },
          {
            "id": "1292",
            "index": "208",
            "club": "0",
            "selectable": "0",
            "hex": "FF45D6"
          },
          {
            "id": "1293",
            "index": "209",
            "club": "0",
            "selectable": "0",
            "hex": "FF7329"
          },
          {
            "id": "1294",
            "index": "210",
            "club": "0",
            "selectable": "0",
            "hex": "FF7383"
          },
          {
            "id": "1295",
            "index": "211",
            "club": "0",
            "selectable": "0",
            "hex": "FF7BDE"
          },
          {
            "id": "1296",
            "index": "212",
            "club": "0",
            "selectable": "0",
            "hex": "FF8516"
          },
          {
            "id": "1297",
            "index": "213",
            "club": "0",
            "selectable": "0",
            "hex": "FF9C62"
          },
          {
            "id": "1298",
            "index": "214",
            "club": "0",
            "selectable": "0",
            "hex": "FFB3D7"
          },
          {
            "id": "1299",
            "index": "215",
            "club": "0",
            "selectable": "0",
            "hex": "FFB6DE"
          },
          {
            "id": "1300",
            "index": "216",
            "club": "0",
            "selectable": "0",
            "hex": "FFBDBD"
          },
          {
            "id": "1301",
            "index": "217",
            "club": "0",
            "selectable": "0",
            "hex": "FFC800"
          },
          {
            "id": "1302",
            "index": "218",
            "club": "0",
            "selectable": "0",
            "hex": "FFC92B"
          },
          {
            "id": "1303",
            "index": "219",
            "club": "0",
            "selectable": "0",
            "hex": "FFCD94"
          },
          {
            "id": "1304",
            "index": "220",
            "club": "0",
            "selectable": "0",
            "hex": "FFCD9B"
          },
          {
            "id": "1305",
            "index": "221",
            "club": "0",
            "selectable": "0",
            "hex": "FFDC7A"
          },
          {
            "id": "1306",
            "index": "222",
            "club": "0",
            "selectable": "0",
            "hex": "FFE639"
          },
          {
            "id": "1307",
            "index": "223",
            "club": "0",
            "selectable": "0",
            "hex": "FFE673"
          },
          {
            "id": "1308",
            "index": "224",
            "club": "0",
            "selectable": "0",
            "hex": "FFEDB3"
          },
          {
            "id": "1309",
            "index": "225",
            "club": "0",
            "selectable": "0",
            "hex": "FFEE6D"
          },
          {
            "id": "1310",
            "index": "226",
            "club": "0",
            "selectable": "0",
            "hex": "FFEEC5"
          },
          {
            "id": "1311",
            "index": "227",
            "club": "0",
            "selectable": "0",
            "hex": "FFFF00"
          },
          {
            "id": "1312",
            "index": "228",
            "club": "0",
            "selectable": "0",
            "hex": "FFFF66"
          },
          {
            "id": "1313",
            "index": "229",
            "club": "0",
            "selectable": "0",
            "hex": "FFFFFA"
          },
          {
            "id": "1314",
            "index": "230",
            "club": "0",
            "selectable": "0",
            "hex": "FFFFFF"
          }
        ]
      }
    ];
  }

  /**
   * Gera URL de thumbnail usando habbo-imaging
   */
  private generateThumbnailUrl(category: string, figureId: string, colorId: string, gender: 'M' | 'F' | 'U' = 'M'): string {
    // Avatar base para preview focado na categoria
    const baseAvatar = this.getBaseAvatarForCategory(category);
    const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;

    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=s&img_format=png&gesture=std&action=std`;
  }

  /**
   * Gera avatar base focado na categoria específica
   */
  private getBaseAvatarForCategory(category: string): string {
    const baseAvatars = {
      'hd': 'hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'hr': 'hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
      'ch': 'hd-180-1.hr-828-45.lg-3116-92.sh-3297-92',
      'cc': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'lg': 'hd-180-1.hr-828-45.ch-3216-92.sh-3297-92',
      'sh': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92',
      'ha': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ea': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'fa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'he': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ca': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'cp': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'wa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92'
    };

    return baseAvatars[category as keyof typeof baseAvatars] || 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92';
  }

  /**
   * Fallback para dados mock se o arquivo não estiver disponível
   */
  private getFallbackMockData(): { palettes: HabboPalette[], categories: HabboCategory[] } {
    const palettes = this.getOfficialPalettes();

    // Dados básicos para fallback se o arquivo JSON não estiver disponível
    const categories: HabboCategory[] = [
      {
        id: 'hd',
        name: 'hd',
        displayName: 'Rosto',
        paletteId: '1',
        items: [
          { id: 'hd-180', figureId: '180', category: 'hd', gender: 'M', club: '0', colorable: '0', selectable: '1', imageUrl: this.generateThumbnailUrl('hd', '180', '1'), isSelectable: true, isColorable: false }
        ],
        colors: ['14', '10', '1', '8', '12']
      },
      {
        id: 'hr',
        name: 'hr',
        displayName: 'Cabelo',
        paletteId: '3',
        items: [
          { id: 'hr-100', figureId: '100', category: 'hr', gender: 'M', club: '0', colorable: '1', selectable: '1', imageUrl: this.generateThumbnailUrl('hr', '100', '1408'), isSelectable: true, isColorable: true }
        ],
        colors: ['1408', '90', '91', '66', '68']
      },
      {
        id: 'ch',
        name: 'ch',
        displayName: 'Camisa',
        paletteId: '3',
        items: [
          { id: 'ch-210', figureId: '210', category: 'ch', gender: 'M', club: '0', colorable: '1', selectable: '1', imageUrl: this.generateThumbnailUrl('ch', '210', '1408'), isSelectable: true, isColorable: true }
        ],
        colors: ['1408', '90', '91', '66', '68']
      },
      {
        id: 'lg',
        name: 'lg',
        displayName: 'Calça',
        paletteId: '3',
        items: [
          { id: 'lg-270', figureId: '270', category: 'lg', gender: 'M', club: '0', colorable: '1', selectable: '1', imageUrl: this.generateThumbnailUrl('lg', '270', '82'), isSelectable: true, isColorable: true }
        ],
        colors: ['1408', '90', '91', '66', '68']
      },
      {
        id: 'sh',
        name: 'sh',
        displayName: 'Sapatos',
        paletteId: '3',
        items: [
          { id: 'sh-290', figureId: '290', category: 'sh', gender: 'M', club: '0', colorable: '1', selectable: '1', imageUrl: this.generateThumbnailUrl('sh', '290', '1408'), isSelectable: true, isColorable: true }
        ],
        colors: ['1408', '90', '91', '66', '68']
      }
    ];

    return { palettes, categories };
  }

  /**
   * Filtra itens por gênero seguindo a especificação técnica
   */
  getItemsByGender(categoryId: string, gender: 'M' | 'F' | 'U' | 'ALL'): HabboClothingItem[] {
    if (!this.habboData) return [];

    const category = this.habboData.categories.find(cat => cat.id === categoryId);
    if (!category) return [];

    return category.items.filter(item => {
      if (gender === 'ALL') return true;
      return item.gender === gender || item.gender === 'U';
    });
  }

  /**
   * Obtém paleta de cores para uma categoria
   */
  getPaletteForCategory(categoryId: string): HabboPalette | null {
    if (!this.habboData) return null;

    const category = this.habboData.categories.find(cat => cat.id === categoryId);
    if (!category) return null;

    return this.habboData.palettes.find(palette => palette.id === category.paletteId) || null;
  }

  /**
   * Obtém cores disponíveis para um item específico
   */
  getColorsForItem(item: HabboClothingItem): string[] {
    if (!this.habboData) return [];

    const category = this.habboData.categories.find(cat => cat.id === item.category);
    if (!category) return [];

    // Se o item não é colorável, retorna apenas a cor padrão
    if (item.colorable !== '1') {
      return ['7']; // Cor padrão do Habbo
    }

    // Obtém a paleta da categoria
    const palette = this.habboData.palettes.find(p => p.id === category.paletteId);
    if (!palette) return [];

    // Incluir todas as cores disponíveis (abordagem HabboNews)
    const availableColors = palette.colors
      .map(color => color.id);

    return availableColors;
  }

  /**
   * Verifica se uma cor é válida para um item específico
   */
  isColorValidForItem(item: HabboClothingItem, colorId: string): boolean {
    const validColors = this.getColorsForItem(item);
    return validColors.includes(colorId);
  }

  /**
   * Converte estado do avatar para figure string
   */
  stateToFigureString(state: AvatarState): string {
    return Object.entries(state)
      .filter(([_, value]) => typeof value === 'string' && value && value.trim() !== '')
      .map(([key, value]) => `${key}-${value}`)
      .join('.');
  }

  /**
   * Gera URL do avatar para preview
   */
  generateAvatarUrl(state: AvatarState): string {
    const figureString = this.stateToFigureString(state);
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&size=l&direction=2&head_direction=2&action=std&gesture=std`;
  }

  /**
   * Gera URL de miniatura para um item específico
   */
  generateItemThumbnailUrl(type: string, id: string, color: string): string {
    // Sempre mostrar corpo completo para melhor visualização dos itens
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${type}-${id}-${color}&size=m&headonly=0`;
  }


  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
    this.habboData = null;
  }

  /**
   * Obter estatísticas
   */
  async getStats(): Promise<{ totalCategories: number; totalItems: number; categoryStats: Record<string, number> }> {
    const categories = await this.getCategories();
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);

    const categoryStats: Record<string, number> = {};
    categories.forEach(category => {
      categoryStats[category.id] = category.items.length;
    });

    return {
      totalCategories: categories.length,
      totalItems,
      categoryStats
    };
  }

  /**
   * Obtém categorias com itens seguindo a especificação técnica oficial
   */
  async getCategories(): Promise<HabboCategory[]> {
    console.log('🎯 Carregando dados oficiais do Habbo...');

    const habboData = await this.loadHabboData();

    // Retornar TODAS as categorias disponíveis, não apenas as agrupadas
    console.log(`📊 Categorias disponíveis: ${habboData.categories.length}`);
    console.log(`🎨 Paletas disponíveis: ${habboData.palettes.length}`);

    // Log detalhado de categorias encontradas
    habboData.categories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.items.length} itens`);
    });

    return habboData.categories;
  }
}

// Instância singleton
export const habboOfficialService = new HabboOfficialService();