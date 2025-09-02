// Dados completos do HabboTemplarios
// Extraído em: 2025-09-02T00:40:46.565Z
// Total: 1738 itens em 13 categorias

export interface HabboPaletteColor {
  index: number;
  club: number;
  selectable: number;
  hex: string;
}

export interface HabboPalette {
  [colorId: string]: HabboPaletteColor;
}

export interface HabboSetData {
  gender: 'M' | 'F' | 'U';
  club: number;
  colorable: number;
  selectable: number;
  preselectable: number;
  sellable?: number;
  duotone?: number;
  nft?: number;
}

export interface HabboFigureSet {
  paletteid: number;
  type: string;
  sets: { [setId: string]: HabboSetData };
}

export const palettesJSON: { [paletteId: string]: HabboPalette } = {
  "1": {
    "1": {
      "index": 2,
      "club": 0,
      "selectable": 1,
      "hex": "FFCB98"
    },
    "2": {
      "index": 45,
      "club": 2,
      "selectable": 1,
      "hex": "E3AE7D"
    },
    "3": {
      "index": 37,
      "club": 2,
      "selectable": 1,
      "hex": "C99263"
    },
    "4": {
      "index": 34,
      "club": 2,
      "selectable": 1,
      "hex": "AE7748"
    },
    "5": {
      "index": 32,
      "club": 2,
      "selectable": 1,
      "hex": "945C2F"
    },
    "6": {
      "index": 91,
      "club": 0,
      "selectable": 0,
      "hex": "6E482C"
    },
    "7": {
      "index": 46,
      "club": 2,
      "selectable": 1,
      "hex": "FFC680"
    },
    "8": {
      "index": 3,
      "club": 0,
      "selectable": 1,
      "hex": "F4AC54"
    },
    "9": {
      "index": 40,
      "club": 2,
      "selectable": 1,
      "hex": "DC9B4C"
    },
    "10": {
      "index": 1,
      "club": 0,
      "selectable": 1,
      "hex": "FFDBC1"
    },
    "11": {
      "index": 44,
      "club": 2,
      "selectable": 1,
      "hex": "FFB696"
    },
    "12": {
      "index": 4,
      "club": 0,
      "selectable": 1,
      "hex": "FF987F"
    },
    "13": {
      "index": 48,
      "club": 2,
      "selectable": 1,
      "hex": "F0DCA3"
    },
    "14": {
      "index": 0,
      "club": 0,
      "selectable": 1,
      "hex": "F5DA88"
    },
    "15": {
      "index": 47,
      "club": 2,
      "selectable": 1,
      "hex": "DFC375"
    },
    "16": {
      "index": 92,
      "club": 0,
      "selectable": 0,
      "hex": "EFD17D"
    },
    "17": {
      "index": 39,
      "club": 2,
      "selectable": 1,
      "hex": "C89F56"
    },
    "18": {
      "index": 38,
      "club": 2,
      "selectable": 1,
      "hex": "A89473"
    },
    "19": {
      "index": 7,
      "club": 0,
      "selectable": 1,
      "hex": "B87560"
    },
    "20": {
      "index": 8,
      "club": 0,
      "selectable": 1,
      "hex": "9C543F"
    },
    "21": {
      "index": 13,
      "club": 2,
      "selectable": 1,
      "hex": "6E392C"
    },
    "22": {
      "index": 49,
      "club": 2,
      "selectable": 1,
      "hex": "EAEFD0"
    },
    "23": {
      "index": 50,
      "club": 2,
      "selectable": 1,
      "hex": "E2E4B0"
    },
    "24": {
      "index": 51,
      "club": 2,
      "selectable": 1,
      "hex": "D5D08C"
    },
    "25": {
      "index": 59,
      "club": 2,
      "selectable": 1,
      "hex": "C4A7B3"
    },
    "26": {
      "index": 55,
      "club": 2,
      "selectable": 1,
      "hex": "C2C4A7"
    },
    "27": {
      "index": 64,
      "club": 2,
      "selectable": 1,
      "hex": "C5C0C2"
    },
    "28": {
      "index": 56,
      "club": 2,
      "selectable": 1,
      "hex": "F1E5DA"
    },
    "29": {
      "index": 63,
      "club": 2,
      "selectable": 1,
      "hex": "B3BDC3"
    },
    "30": {
      "index": 10,
      "club": 0,
      "selectable": 1,
      "hex": "4C311E"
    },
    "1001": {
      "index": 65,
      "club": 0,
      "selectable": 0,
      "hex": "644628"
    },
    "1002": {
      "index": 66,
      "club": 0,
      "selectable": 0,
      "hex": "926338"
    },
    "1003": {
      "index": 67,
      "club": 0,
      "selectable": 0,
      "hex": "A97C44"
    },
    "1004": {
      "index": 68,
      "club": 0,
      "selectable": 0,
      "hex": "B3957F"
    },
    "1005": {
      "index": 69,
      "club": 0,
      "selectable": 0,
      "hex": "BD9562"
    },
    "1006": {
      "index": 70,
      "club": 0,
      "selectable": 0,
      "hex": "C2A896"
    },
    "1007": {
      "index": 71,
      "club": 0,
      "selectable": 0,
      "hex": "CA9072"
    },
    "1008": {
      "index": 72,
      "club": 0,
      "selectable": 0,
      "hex": "CBBC90"
    },
    "1009": {
      "index": 73,
      "club": 0,
      "selectable": 0,
      "hex": "D1A78C"
    },
    "1010": {
      "index": 74,
      "club": 0,
      "selectable": 0,
      "hex": "D1BCAD"
    },
    "1011": {
      "index": 75,
      "club": 0,
      "selectable": 0,
      "hex": "D7BCA9"
    },
    "1012": {
      "index": 76,
      "club": 0,
      "selectable": 0,
      "hex": "D7CBA3"
    },
    "1013": {
      "index": 77,
      "club": 0,
      "selectable": 0,
      "hex": "D8A595"
    },
    "1014": {
      "index": 78,
      "club": 0,
      "selectable": 0,
      "hex": "D8B07E"
    },
    "1015": {
      "index": 79,
      "club": 0,
      "selectable": 0,
      "hex": "E0BD91"
    },
    "1016": {
      "index": 80,
      "club": 0,
      "selectable": 0,
      "hex": "E0D0C5"
    },
    "1017": {
      "index": 81,
      "club": 0,
      "selectable": 0,
      "hex": "E2DBB9"
    },
    "1018": {
      "index": 82,
      "club": 0,
      "selectable": 0,
      "hex": "E3D38D"
    },
    "1019": {
      "index": 83,
      "club": 0,
      "selectable": 0,
      "hex": "E7C9A3"
    },
    "1020": {
      "index": 84,
      "club": 0,
      "selectable": 0,
      "hex": "EDD7BB"
    },
    "1021": {
      "index": 85,
      "club": 0,
      "selectable": 0,
      "hex": "EEE7E0"
    },
    "1022": {
      "index": 86,
      "club": 0,
      "selectable": 0,
      "hex": "EFC3B6"
    },
    "1023": {
      "index": 87,
      "club": 0,
      "selectable": 0,
      "hex": "F1D6B4"
    },
    "1024": {
      "index": 88,
      "club": 0,
      "selectable": 0,
      "hex": "F8E5DA"
    },
    "1025": {
      "index": 89,
      "club": 0,
      "selectable": 0,
      "hex": "FDDACF"
    },
    "1026": {
      "index": 90,
      "club": 0,
      "selectable": 0,
      "hex": "FFCC99"
    },
    "1357": {
      "index": 41,
      "club": 2,
      "selectable": 1,
      "hex": "FF8C40"
    },
    "1358": {
      "index": 28,
      "club": 2,
      "selectable": 1,
      "hex": "B65E38"
    },
    "1359": {
      "index": 36,
      "club": 2,
      "selectable": 1,
      "hex": "B88655"
    },
    "1360": {
      "index": 54,
      "club": 2,
      "selectable": 1,
      "hex": "A2CC89"
    },
    "1361": {
      "index": 52,
      "club": 2,
      "selectable": 1,
      "hex": "BDE05F"
    },
    "1362": {
      "index": 53,
      "club": 2,
      "selectable": 1,
      "hex": "5DC446"
    },
    "1363": {
      "index": 60,
      "club": 2,
      "selectable": 1,
      "hex": "AC94B3"
    },
    "1364": {
      "index": 61,
      "club": 2,
      "selectable": 1,
      "hex": "D288CE"
    },
    "1365": {
      "index": 62,
      "club": 2,
      "selectable": 1,
      "hex": "6799CC"
    },
    "1366": {
      "index": 27,
      "club": 2,
      "selectable": 1,
      "hex": "FF7575"
    },
    "1367": {
      "index": 26,
      "club": 2,
      "selectable": 1,
      "hex": "FF5757"
    },
    "1368": {
      "index": 25,
      "club": 2,
      "selectable": 1,
      "hex": "BC576A"
    },
    "1369": {
      "index": 5,
      "club": 0,
      "selectable": 1,
      "hex": "e0a9a9"
    },
    "1370": {
      "index": 6,
      "club": 0,
      "selectable": 1,
      "hex": "ca8154"
    },
    "1371": {
      "index": 9,
      "club": 0,
      "selectable": 1,
      "hex": "904925"
    },
    "1372": {
      "index": 11,
      "club": 2,
      "selectable": 1,
      "hex": "543d35"
    },
    "1373": {
      "index": 12,
      "club": 2,
      "selectable": 1,
      "hex": "653a1d"
    },
    "1374": {
      "index": 14,
      "club": 2,
      "selectable": 1,
      "hex": "714947"
    },
    "1375": {
      "index": 15,
      "club": 2,
      "selectable": 1,
      "hex": "856860"
    },
    "1376": {
      "index": 16,
      "club": 2,
      "selectable": 1,
      "hex": "895048"
    },
    "1377": {
      "index": 17,
      "club": 2,
      "selectable": 1,
      "hex": "a15253"
    },
    "1378": {
      "index": 18,
      "club": 2,
      "selectable": 1,
      "hex": "aa7870"
    },
    "1379": {
      "index": 19,
      "club": 2,
      "selectable": 1,
      "hex": "be8263"
    },
    "1380": {
      "index": 20,
      "club": 2,
      "selectable": 1,
      "hex": "b6856d"
    },
    "1381": {
      "index": 21,
      "club": 2,
      "selectable": 1,
      "hex": "ba8a82"
    },
    "1382": {
      "index": 22,
      "club": 2,
      "selectable": 1,
      "hex": "c88f82"
    },
    "1383": {
      "index": 23,
      "club": 2,
      "selectable": 1,
      "hex": "d9a792"
    },
    "1384": {
      "index": 24,
      "club": 2,
      "selectable": 1,
      "hex": "c68383"
    },
    "1385": {
      "index": 29,
      "club": 2,
      "selectable": 1,
      "hex": "a76644"
    },
    "1386": {
      "index": 30,
      "club": 2,
      "selectable": 1,
      "hex": "7c5133"
    },
    "1387": {
      "index": 31,
      "club": 2,
      "selectable": 1,
      "hex": "9a7257"
    },
    "1388": {
      "index": 35,
      "club": 2,
      "selectable": 1,
      "hex": "c57040"
    },
    "1389": {
      "index": 33,
      "club": 2,
      "selectable": 1,
      "hex": "d98c63"
    },
    "1390": {
      "index": 42,
      "club": 2,
      "selectable": 1,
      "hex": "de9d75"
    },
    "1391": {
      "index": 43,
      "club": 2,
      "selectable": 1,
      "hex": "eca782"
    },
    "1392": {
      "index": 57,
      "club": 2,
      "selectable": 1,
      "hex": "f6d3d4"
    },
    "1393": {
      "index": 58,
      "club": 2,
      "selectable": 1,
      "hex": "e5b6b0"
    }
  },
  "2": {
    "31": {
      "index": 4,
      "club": 0,
      "selectable": 1,
      "hex": "FFD6A9"
    },
    "32": {
      "index": 5,
      "club": 0,
      "selectable": 1,
      "hex": "DFA66F"
    },
    "33": {
      "index": 19,
      "club": 2,
      "selectable": 1,
      "hex": "D1803A"
    },
    "34": {
      "index": 1,
      "club": 0,
      "selectable": 1,
      "hex": "FFEEB9"
    },
    "35": {
      "index": 2,
      "club": 0,
      "selectable": 1,
      "hex": "F6D059"
    },
    "36": {
      "index": 3,
      "club": 0,
      "selectable": 1,
      "hex": "F2B11D"
    },
    "37": {
      "index": 6,
      "club": 0,
      "selectable": 1,
      "hex": "9A5D2E"
    },
    "38": {
      "index": 7,
      "club": 0,
      "selectable": 1,
      "hex": "AC5300"
    },
    "39": {
      "index": 13,
      "club": 0,
      "selectable": 1,
      "hex": "783400"
    },
    "40": {
      "index": 0,
      "club": 0,
      "selectable": 1,
      "hex": "D8D3D9"
    },
    "41": {
      "index": 59,
      "club": 2,
      "selectable": 1,
      "hex": "918D98"
    },
    "42": {
      "index": 15,
      "club": 0,
      "selectable": 1,
      "hex": "4A4656"
    },
    "43": {
      "index": 8,
      "club": 0,
      "selectable": 1,
      "hex": "F29159"
    },
    "44": {
      "index": 12,
      "club": 0,
      "selectable": 1,
      "hex": "9E3D3B"
    },
    "45": {
      "index": 14,
      "club": 0,
      "selectable": 1,
      "hex": "5C4332"
    },
    "46": {
      "index": 9,
      "club": 0,
      "selectable": 1,
      "hex": "FF8746"
    },
    "47": {
      "index": 10,
      "club": 0,
      "selectable": 1,
      "hex": "FC610C"
    },
    "48": {
      "index": 11,
      "club": 0,
      "selectable": 1,
      "hex": "DE3900"
    },
    "49": {
      "index": 23,
      "club": 2,
      "selectable": 1,
      "hex": "FFFFFF"
    },
    "50": {
      "index": 58,
      "club": 2,
      "selectable": 1,
      "hex": "E5FF09"
    },
    "51": {
      "index": 56,
      "club": 2,
      "selectable": 1,
      "hex": "A3FF8F"
    },
    "52": {
      "index": 54,
      "club": 2,
      "selectable": 1,
      "hex": "339966"
    },
    "53": {
      "index": 53,
      "club": 2,
      "selectable": 1,
      "hex": "3A7B93"
    },
    "54": {
      "index": 33,
      "club": 2,
      "selectable": 1,
      "hex": "FFBDBC"
    },
    "55": {
      "index": 36,
      "club": 2,
      "selectable": 1,
      "hex": "DE34A4"
    },
    "56": {
      "index": 38,
      "club": 2,
      "selectable": 1,
      "hex": "9F5699"
    },
    "57": {
      "index": 47,
      "club": 2,
      "selectable": 1,
      "hex": "D5F9FB"
    },
    "58": {
      "index": 49,
      "club": 2,
      "selectable": 1,
      "hex": "6699CC"
    },
    "59": {
      "index": 30,
      "club": 2,
      "selectable": 1,
      "hex": "E71B0A"
    },
    "60": {
      "index": 48,
      "club": 2,
      "selectable": 1,
      "hex": "95FFFA"
    },
    "61": {
      "index": 16,
      "club": 2,
      "selectable": 1,
      "hex": "2D2D2D"
    },
    "1027": {
      "index": 61,
      "club": 0,
      "selectable": 0,
      "hex": "00FA00"
    },
    "1028": {
      "index": 62,
      "club": 0,
      "selectable": 0,
      "hex": "0A0A0A"
    },
    "1029": {
      "index": 63,
      "club": 0,
      "selectable": 0,
      "hex": "105262"
    },
    "1030": {
      "index": 64,
      "club": 0,
      "selectable": 0,
      "hex": "106262"
    },
    "1031": {
      "index": 65,
      "club": 0,
      "selectable": 0,
      "hex": "1E3214"
    },
    "1032": {
      "index": 66,
      "club": 0,
      "selectable": 0,
      "hex": "20B4A4"
    },
    "1033": {
      "index": 67,
      "club": 0,
      "selectable": 0,
      "hex": "234CAF"
    },
    "1034": {
      "index": 68,
      "club": 0,
      "selectable": 0,
      "hex": "248954"
    },
    "1035": {
      "index": 69,
      "club": 0,
      "selectable": 0,
      "hex": "282828"
    },
    "1036": {
      "index": 70,
      "club": 0,
      "selectable": 0,
      "hex": "292929"
    },
    "1037": {
      "index": 71,
      "club": 0,
      "selectable": 0,
      "hex": "298BB4"
    },
    "1038": {
      "index": 72,
      "club": 0,
      "selectable": 0,
      "hex": "2DA5E9"
    },
    "1039": {
      "index": 73,
      "club": 0,
      "selectable": 0,
      "hex": "319CF6"
    },
    "1040": {
      "index": 74,
      "club": 0,
      "selectable": 0,
      "hex": "31F6DE"
    },
    "1041": {
      "index": 75,
      "club": 0,
      "selectable": 0,
      "hex": "322F3E"
    },
    "1042": {
      "index": 76,
      "club": 0,
      "selectable": 0,
      "hex": "323235"
    },
    "1043": {
      "index": 77,
      "club": 0,
      "selectable": 0,
      "hex": "325B6A"
    },
    "1044": {
      "index": 78,
      "club": 0,
      "selectable": 0,
      "hex": "3296FA"
    },
    "1045": {
      "index": 79,
      "club": 0,
      "selectable": 0,
      "hex": "333333"
    },
    "1046": {
      "index": 80,
      "club": 0,
      "selectable": 0,
      "hex": "394194"
    },
    "1047": {
      "index": 81,
      "club": 0,
      "selectable": 0,
      "hex": "463C14"
    },
    "1048": {
      "index": 82,
      "club": 0,
      "selectable": 0,
      "hex": "4A6A18"
    },
    "1049": {
      "index": 83,
      "club": 0,
      "selectable": 0,
      "hex": "4B5A5A"
    },
    "1050": {
      "index": 84,
      "club": 0,
      "selectable": 0,
      "hex": "4D3223"
    },
    "1051": {
      "index": 85,
      "club": 0,
      "selectable": 0,
      "hex": "4F87C0"
    },
    "1052": {
      "index": 86,
      "club": 0,
      "selectable": 0,
      "hex": "579E1F"
    },
    "1053": {
      "index": 87,
      "club": 0,
      "selectable": 0,
      "hex": "5A480A"
    },
    "1054": {
      "index": 88,
      "club": 0,
      "selectable": 0,
      "hex": "5A837B"
    },
    "1055": {
      "index": 89,
      "club": 0,
      "selectable": 0,
      "hex": "624A41"
    },
    "1056": {
      "index": 90,
      "club": 0,
      "selectable": 0,
      "hex": "625A20"
    },
    "1057": {
      "index": 91,
      "club": 0,
      "selectable": 0,
      "hex": "626262"
    },
    "1058": {
      "index": 92,
      "club": 0,
      "selectable": 0,
      "hex": "646D6C"
    },
    "1059": {
      "index": 93,
      "club": 0,
      "selectable": 0,
      "hex": "662608"
    },
    "1060": {
      "index": 94,
      "club": 0,
      "selectable": 0,
      "hex": "666666"
    },
    "1061": {
      "index": 95,
      "club": 0,
      "selectable": 0,
      "hex": "674E3B"
    },
    "1062": {
      "index": 96,
      "club": 0,
      "selectable": 0,
      "hex": "6A3910"
    },
    "1063": {
      "index": 97,
      "club": 0,
      "selectable": 0,
      "hex": "736346"
    },
    "1064": {
      "index": 98,
      "club": 0,
      "selectable": 0,
      "hex": "781414"
    },
    "1065": {
      "index": 99,
      "club": 0,
      "selectable": 0,
      "hex": "784215"
    },
    "1066": {
      "index": 100,
      "club": 0,
      "selectable": 0,
      "hex": "786D5A"
    },
    "1067": {
      "index": 101,
      "club": 0,
      "selectable": 0,
      "hex": "7B1894"
    },
    "1068": {
      "index": 102,
      "club": 0,
      "selectable": 0,
      "hex": "7D5B17"
    },
    "1069": {
      "index": 103,
      "club": 0,
      "selectable": 0,
      "hex": "80557C"
    },
    "1070": {
      "index": 104,
      "club": 0,
      "selectable": 0,
      "hex": "833141"
    },
    "1071": {
      "index": 105,
      "club": 0,
      "selectable": 0,
      "hex": "8A4924"
    },
    "1072": {
      "index": 106,
      "club": 0,
      "selectable": 0,
      "hex": "8B1820"
    },
    "1073": {
      "index": 107,
      "club": 0,
      "selectable": 0,
      "hex": "8C694B"
    },
    "1074": {
      "index": 108,
      "club": 0,
      "selectable": 0,
      "hex": "8C967E"
    },
    "1075": {
      "index": 109,
      "club": 0,
      "selectable": 0,
      "hex": "904839"
    },
    "1076": {
      "index": 110,
      "club": 0,
      "selectable": 0,
      "hex": "926338"
    },
    "1077": {
      "index": 111,
      "club": 0,
      "selectable": 0,
      "hex": "946220"
    },
    "1078": {
      "index": 112,
      "club": 0,
      "selectable": 0,
      "hex": "947BAC"
    },
    "1079": {
      "index": 113,
      "club": 0,
      "selectable": 0,
      "hex": "948B6A"
    },
    "1080": {
      "index": 114,
      "club": 0,
      "selectable": 0,
      "hex": "94BD29"
    },
    "1081": {
      "index": 115,
      "club": 0,
      "selectable": 0,
      "hex": "94DFFF"
    },
    "1082": {
      "index": 116,
      "club": 0,
      "selectable": 0,
      "hex": "94FFD5"
    },
    "1083": {
      "index": 117,
      "club": 0,
      "selectable": 0,
      "hex": "976D3E"
    },
    "1084": {
      "index": 118,
      "club": 0,
      "selectable": 0,
      "hex": "9CF068"
    },
    "1085": {
      "index": 119,
      "club": 0,
      "selectable": 0,
      "hex": "9E3F0B"
    },
    "1086": {
      "index": 120,
      "club": 0,
      "selectable": 0,
      "hex": "A08C64"
    },
    "1087": {
      "index": 121,
      "club": 0,
      "selectable": 0,
      "hex": "A4A4A4"
    },
    "1088": {
      "index": 122,
      "club": 0,
      "selectable": 0,
      "hex": "A4DEFF"
    },
    "1089": {
      "index": 123,
      "club": 0,
      "selectable": 0,
      "hex": "A55A18"
    },
    "1090": {
      "index": 124,
      "club": 0,
      "selectable": 0,
      "hex": "A7272C"
    },
    "1091": {
      "index": 125,
      "club": 0,
      "selectable": 0,
      "hex": "A97C44"
    },
    "1092": {
      "index": 126,
      "club": 0,
      "selectable": 0,
      "hex": "B29B86"
    },
    "1093": {
      "index": 127,
      "club": 0,
      "selectable": 0,
      "hex": "B2A590"
    },
    "1094": {
      "index": 128,
      "club": 0,
      "selectable": 0,
      "hex": "B3957F"
    },
    "1095": {
      "index": 129,
      "club": 0,
      "selectable": 0,
      "hex": "B429CD"
    },
    "1096": {
      "index": 130,
      "club": 0,
      "selectable": 0,
      "hex": "B4EE29"
    },
    "1097": {
      "index": 131,
      "club": 0,
      "selectable": 0,
      "hex": "B58B5C"
    },
    "1098": {
      "index": 132,
      "club": 0,
      "selectable": 0,
      "hex": "B9A16E"
    },
    "1099": {
      "index": 133,
      "club": 0,
      "selectable": 0,
      "hex": "BD9562"
    },
    "1100": {
      "index": 134,
      "club": 0,
      "selectable": 0,
      "hex": "BD9CFF"
    },
    "1101": {
      "index": 135,
      "club": 0,
      "selectable": 0,
      "hex": "BDBD9D"
    },
    "1102": {
      "index": 136,
      "club": 0,
      "selectable": 0,
      "hex": "C21A86"
    },
    "1103": {
      "index": 137,
      "club": 0,
      "selectable": 0,
      "hex": "C29C57"
    },
    "1104": {
      "index": 138,
      "club": 0,
      "selectable": 0,
      "hex": "C2A896"
    },
    "1105": {
      "index": 139,
      "club": 0,
      "selectable": 0,
      "hex": "C2E3E8"
    },
    "1106": {
      "index": 140,
      "club": 0,
      "selectable": 0,
      "hex": "C376C4"
    },
    "1107": {
      "index": 141,
      "club": 0,
      "selectable": 0,
      "hex": "C4FFFF"
    },
    "1108": {
      "index": 142,
      "club": 0,
      "selectable": 0,
      "hex": "C54A29"
    },
    "1109": {
      "index": 143,
      "club": 0,
      "selectable": 0,
      "hex": "C59462"
    },
    "1110": {
      "index": 144,
      "club": 0,
      "selectable": 0,
      "hex": "C8D2E6"
    },
    "1111": {
      "index": 145,
      "club": 0,
      "selectable": 0,
      "hex": "C96B2F"
    },
    "1112": {
      "index": 146,
      "club": 0,
      "selectable": 0,
      "hex": "CA5A1E"
    },
    "1113": {
      "index": 147,
      "club": 0,
      "selectable": 0,
      "hex": "CA5A33"
    },
    "1114": {
      "index": 148,
      "club": 0,
      "selectable": 0,
      "hex": "CA9072"
    },
    "1115": {
      "index": 149,
      "club": 0,
      "selectable": 0,
      "hex": "CBBC90"
    },
    "1116": {
      "index": 150,
      "club": 0,
      "selectable": 0,
      "hex": "CD99C7"
    },
    "1117": {
      "index": 151,
      "club": 0,
      "selectable": 0,
      "hex": "CF6254"
    },
    "1118": {
      "index": 152,
      "club": 0,
      "selectable": 0,
      "hex": "D1A78C"
    },
    "1119": {
      "index": 153,
      "club": 0,
      "selectable": 0,
      "hex": "D1BCAD"
    },
    "1120": {
      "index": 154,
      "club": 0,
      "selectable": 0,
      "hex": "D2C8CC"
    },
    "1121": {
      "index": 155,
      "club": 0,
      "selectable": 0,
      "hex": "D45B0A"
    },
    "1122": {
      "index": 156,
      "club": 0,
      "selectable": 0,
      "hex": "D4FE80"
    },
    "1123": {
      "index": 157,
      "club": 0,
      "selectable": 0,
      "hex": "D54173"
    },
    "1124": {
      "index": 158,
      "club": 0,
      "selectable": 0,
      "hex": "D5FF9C"
    },
    "1125": {
      "index": 159,
      "club": 0,
      "selectable": 0,
      "hex": "D7BCA9"
    },
    "1126": {
      "index": 160,
      "club": 0,
      "selectable": 0,
      "hex": "D7CBA3"
    },
    "1127": {
      "index": 161,
      "club": 0,
      "selectable": 0,
      "hex": "D8A595"
    },
    "1128": {
      "index": 162,
      "club": 0,
      "selectable": 0,
      "hex": "D8B07E"
    },
    "1129": {
      "index": 163,
      "club": 0,
      "selectable": 0,
      "hex": "DA945E"
    },
    "1130": {
      "index": 164,
      "club": 0,
      "selectable": 0,
      "hex": "DB7C62"
    },
    "1131": {
      "index": 165,
      "club": 0,
      "selectable": 0,
      "hex": "DCDCC8"
    },
    "1132": {
      "index": 166,
      "club": 0,
      "selectable": 0,
      "hex": "DDA934"
    },
    "1133": {
      "index": 167,
      "club": 0,
      "selectable": 0,
      "hex": "DE73DE"
    },
    "1134": {
      "index": 168,
      "club": 0,
      "selectable": 0,
      "hex": "DEDEDE"
    },
    "1135": {
      "index": 169,
      "club": 0,
      "selectable": 0,
      "hex": "DFDAB4"
    },
    "1136": {
      "index": 170,
      "club": 0,
      "selectable": 0,
      "hex": "DFDABE"
    },
    "1137": {
      "index": 171,
      "club": 0,
      "selectable": 0,
      "hex": "E0BA78"
    },
    "1138": {
      "index": 172,
      "club": 0,
      "selectable": 0,
      "hex": "E0BD91"
    },
    "1139": {
      "index": 173,
      "club": 0,
      "selectable": 0,
      "hex": "E0D0C5"
    },
    "1140": {
      "index": 174,
      "club": 0,
      "selectable": 0,
      "hex": "E1CC78"
    },
    "1141": {
      "index": 175,
      "club": 0,
      "selectable": 0,
      "hex": "E2DBB9"
    },
    "1142": {
      "index": 176,
      "club": 0,
      "selectable": 0,
      "hex": "E63139"
    },
    "1143": {
      "index": 177,
      "club": 0,
      "selectable": 0,
      "hex": "E6A4F6"
    },
    "1144": {
      "index": 178,
      "club": 0,
      "selectable": 0,
      "hex": "E7C9A3"
    },
    "1145": {
      "index": 179,
      "club": 0,
      "selectable": 0,
      "hex": "E7E92D"
    },
    "1146": {
      "index": 180,
      "club": 0,
      "selectable": 0,
      "hex": "EA5959"
    },
    "1147": {
      "index": 181,
      "club": 0,
      "selectable": 0,
      "hex": "ECFFED"
    },
    "1148": {
      "index": 182,
      "club": 0,
      "selectable": 0,
      "hex": "EDD7BB"
    },
    "1149": {
      "index": 183,
      "club": 0,
      "selectable": 0,
      "hex": "EEE7E0"
    },
    "1150": {
      "index": 184,
      "club": 0,
      "selectable": 0,
      "hex": "EEEEEE"
    },
    "1151": {
      "index": 185,
      "club": 0,
      "selectable": 0,
      "hex": "EFC3B6"
    },
    "1152": {
      "index": 186,
      "club": 0,
      "selectable": 0,
      "hex": "F1D6B4"
    },
    "1153": {
      "index": 187,
      "club": 0,
      "selectable": 0,
      "hex": "F6AC31"
    },
    "1154": {
      "index": 188,
      "club": 0,
      "selectable": 0,
      "hex": "F73B32"
    },
    "1155": {
      "index": 189,
      "club": 0,
      "selectable": 0,
      "hex": "F8E5DA"
    },
    "1156": {
      "index": 190,
      "club": 0,
      "selectable": 0,
      "hex": "FDA61E"
    },
    "1157": {
      "index": 191,
      "club": 0,
      "selectable": 0,
      "hex": "FDDACF"
    },
    "1158": {
      "index": 192,
      "club": 0,
      "selectable": 0,
      "hex": "FE6D6D"
    },
    "1159": {
      "index": 193,
      "club": 0,
      "selectable": 0,
      "hex": "FE834D"
    },
    "1160": {
      "index": 194,
      "club": 0,
      "selectable": 0,
      "hex": "FF0000"
    },
    "1161": {
      "index": 195,
      "club": 0,
      "selectable": 0,
      "hex": "FF006A"
    },
    "1162": {
      "index": 196,
      "club": 0,
      "selectable": 0,
      "hex": "FF4814"
    },
    "1163": {
      "index": 197,
      "club": 0,
      "selectable": 0,
      "hex": "FF4C2F"
    },
    "1164": {
      "index": 198,
      "club": 0,
      "selectable": 0,
      "hex": "FF5F9B"
    },
    "1165": {
      "index": 199,
      "club": 0,
      "selectable": 0,
      "hex": "FF7329"
    },
    "1166": {
      "index": 200,
      "club": 0,
      "selectable": 0,
      "hex": "FF7383"
    },
    "1167": {
      "index": 201,
      "club": 0,
      "selectable": 0,
      "hex": "FF7BDE"
    },
    "1168": {
      "index": 202,
      "club": 0,
      "selectable": 0,
      "hex": "FF9C62"
    },
    "1169": {
      "index": 203,
      "club": 0,
      "selectable": 0,
      "hex": "FFA772"
    },
    "1170": {
      "index": 204,
      "club": 0,
      "selectable": 0,
      "hex": "FFADAE"
    },
    "1171": {
      "index": 205,
      "club": 0,
      "selectable": 0,
      "hex": "FFBC42"
    },
    "1172": {
      "index": 206,
      "club": 0,
      "selectable": 0,
      "hex": "FFBDBD"
    },
    "1173": {
      "index": 207,
      "club": 0,
      "selectable": 0,
      "hex": "FFBE73"
    },
    "1174": {
      "index": 208,
      "club": 0,
      "selectable": 0,
      "hex": "FFC53A"
    },
    "1175": {
      "index": 209,
      "club": 0,
      "selectable": 0,
      "hex": "FFCD94"
    },
    "1176": {
      "index": 210,
      "club": 0,
      "selectable": 0,
      "hex": "FFCD9B"
    },
    "1177": {
      "index": 211,
      "club": 0,
      "selectable": 0,
      "hex": "FFDC7A"
    },
    "1178": {
      "index": 212,
      "club": 0,
      "selectable": 0,
      "hex": "FFE639"
    },
    "1179": {
      "index": 213,
      "club": 0,
      "selectable": 0,
      "hex": "FFE673"
    },
    "1180": {
      "index": 214,
      "club": 0,
      "selectable": 0,
      "hex": "FFEAAC"
    },
    "1181": {
      "index": 215,
      "club": 0,
      "selectable": 0,
      "hex": "FFEAAD"
    },
    "1182": {
      "index": 216,
      "club": 0,
      "selectable": 0,
      "hex": "FFEEC5"
    },
    "1183": {
      "index": 217,
      "club": 0,
      "selectable": 0,
      "hex": "FFFFFF"
    },
    "1316": {
      "index": 57,
      "club": 2,
      "selectable": 1,
      "hex": "D2FF00"
    },
    "1342": {
      "index": 24,
      "club": 2,
      "selectable": 1,
      "hex": "fffdd6"
    },
    "1343": {
      "index": 25,
      "club": 2,
      "selectable": 1,
      "hex": "fff392"
    },
    "1344": {
      "index": 27,
      "club": 2,
      "selectable": 1,
      "hex": "ffe508"
    },
    "1345": {
      "index": 31,
      "club": 2,
      "selectable": 1,
      "hex": "ff3e3e"
    },
    "1346": {
      "index": 34,
      "club": 2,
      "selectable": 1,
      "hex": "ffddf1"
    },
    "1347": {
      "index": 35,
      "club": 2,
      "selectable": 1,
      "hex": "ffaedc"
    },
    "1348": {
      "index": 32,
      "club": 2,
      "selectable": 1,
      "hex": "ff638f"
    },
    "1349": {
      "index": 37,
      "club": 2,
      "selectable": 1,
      "hex": "9e326a"
    },
    "1350": {
      "index": 39,
      "club": 2,
      "selectable": 1,
      "hex": "8a4fb5"
    },
    "1351": {
      "index": 40,
      "club": 2,
      "selectable": 1,
      "hex": "722ba6"
    },
    "1352": {
      "index": 41,
      "club": 2,
      "selectable": 1,
      "hex": "4c1d6f"
    },
    "1353": {
      "index": 46,
      "club": 2,
      "selectable": 1,
      "hex": "c1c6ef"
    },
    "1354": {
      "index": 50,
      "club": 2,
      "selectable": 1,
      "hex": "4481e5"
    },
    "1355": {
      "index": 51,
      "club": 2,
      "selectable": 1,
      "hex": "2c50aa"
    },
    "1356": {
      "index": 52,
      "club": 2,
      "selectable": 1,
      "hex": "2a4167"
    },
    "1394": {
      "index": 17,
      "club": 2,
      "selectable": 1,
      "hex": "3f2113"
    },
    "1395": {
      "index": 18,
      "club": 2,
      "selectable": 1,
      "hex": "774422"
    },
    "1396": {
      "index": 20,
      "club": 2,
      "selectable": 1,
      "hex": "cc8b33"
    },
    "1397": {
      "index": 21,
      "club": 2,
      "selectable": 1,
      "hex": "e5ba6a"
    },
    "1398": {
      "index": 22,
      "club": 2,
      "selectable": 1,
      "hex": "f6d990"
    },
    "1399": {
      "index": 26,
      "club": 2,
      "selectable": 1,
      "hex": "ffff00"
    },
    "1400": {
      "index": 28,
      "club": 2,
      "selectable": 1,
      "hex": "ff7716"
    },
    "1401": {
      "index": 29,
      "club": 2,
      "selectable": 1,
      "hex": "aa2c1b"
    },
    "1402": {
      "index": 42,
      "club": 2,
      "selectable": 1,
      "hex": "322c7a"
    },
    "1403": {
      "index": 43,
      "club": 2,
      "selectable": 1,
      "hex": "71584a"
    },
    "1404": {
      "index": 44,
      "club": 2,
      "selectable": 1,
      "hex": "aa8864"
    },
    "1405": {
      "index": 45,
      "club": 2,
      "selectable": 1,
      "hex": "bbb1aa"
    },
    "1406": {
      "index": 55,
      "club": 2,
      "selectable": 1,
      "hex": "70c100"
    },
    "1407": {
      "index": 60,
      "club": 2,
      "selectable": 1,
      "hex": "333333"
    }
  },
  "3": {
    "62": {
      "index": 140,
      "club": 0,
      "selectable": 0,
      "hex": "EEEEEE"
    },
    "63": {
      "index": 76,
      "club": 2,
      "selectable": 1,
      "hex": "A4A4A4"
    },
    "64": {
      "index": 19,
      "club": 0,
      "selectable": 1,
      "hex": "595959"
    },
    "65": {
      "index": 142,
      "club": 0,
      "selectable": 0,
      "hex": "F6E179"
    },
    "66": {
      "index": 3,
      "club": 0,
      "selectable": 1,
      "hex": "E7B027"
    },
    "67": {
      "index": 22,
      "club": 2,
      "selectable": 1,
      "hex": "A86B19"
    },
    "68": {
      "index": 5,
      "club": 0,
      "selectable": 1,
      "hex": "F8C790"
    },
    "69": {
      "index": 144,
      "club": 0,
      "selectable": 0,
      "hex": "EB7E43"
    },
    "70": {
      "index": 32,
      "club": 2,
      "selectable": 1,
      "hex": "C74400"
    },
    "71": {
      "index": 8,
      "club": 0,
      "selectable": 1,
      "hex": "FFBFC2"
    },
    "72": {
      "index": 7,
      "club": 0,
      "selectable": 1,
      "hex": "ED5C50"
    },
    "73": {
      "index": 6,
      "club": 0,
      "selectable": 1,
      "hex": "9F2B31"
    },
    "74": {
      "index": 9,
      "club": 0,
      "selectable": 1,
      "hex": "E7D1EE"
    },
    "75": {
      "index": 10,
      "club": 0,
      "selectable": 1,
      "hex": "AC94B3"
    },
    "76": {
      "index": 11,
      "club": 0,
      "selectable": 1,
      "hex": "7E5B90"
    },
    "77": {
      "index": 74,
      "club": 2,
      "selectable": 1,
      "hex": "ACC9E6"
    },
    "78": {
      "index": 57,
      "club": 2,
      "selectable": 1,
      "hex": "6D80BB"
    },
    "79": {
      "index": 55,
      "club": 2,
      "selectable": 1,
      "hex": "544A81"
    },
    "80": {
      "index": 14,
      "club": 0,
      "selectable": 1,
      "hex": "C5EDE6"
    },
    "81": {
      "index": 13,
      "club": 0,
      "selectable": 1,
      "hex": "75B7C7"
    },
    "82": {
      "index": 12,
      "club": 0,
      "selectable": 1,
      "hex": "4F7AA2"
    },
    "83": {
      "index": 15,
      "club": 0,
      "selectable": 1,
      "hex": "BBF3BD"
    },
    "84": {
      "index": 16,
      "club": 0,
      "selectable": 1,
      "hex": "6BAE61"
    },
    "85": {
      "index": 17,
      "club": 0,
      "selectable": 1,
      "hex": "456F40"
    },
    "86": {
      "index": 88,
      "club": 2,
      "selectable": 1,
      "hex": "EDFF9A"
    },
    "87": {
      "index": 87,
      "club": 2,
      "selectable": 1,
      "hex": "BABB3D"
    },
    "88": {
      "index": 18,
      "club": 0,
      "selectable": 1,
      "hex": "7A7D22"
    },
    "89": {
      "index": 24,
      "club": 2,
      "selectable": 1,
      "hex": "F3E1AF"
    },
    "90": {
      "index": 1,
      "club": 0,
      "selectable": 1,
      "hex": "96743D"
    },
    "91": {
      "index": 2,
      "club": 0,
      "selectable": 1,
      "hex": "6B573B"
    },
    "92": {
      "index": 25,
      "club": 2,
      "selectable": 1,
      "hex": "FFFFFF"
    },
    "93": {
      "index": 26,
      "club": 2,
      "selectable": 1,
      "hex": "FFF41D"
    },
    "94": {
      "index": 30,
      "club": 2,
      "selectable": 1,
      "hex": "FF9211"
    },
    "95": {
      "index": 48,
      "club": 2,
      "selectable": 1,
      "hex": "FF27A6"
    },
    "96": {
      "index": 41,
      "club": 2,
      "selectable": 1,
      "hex": "FF1300"
    },
    "97": {
      "index": 44,
      "club": 2,
      "selectable": 1,
      "hex": "FF6D8F"
    },
    "98": {
      "index": 46,
      "club": 2,
      "selectable": 1,
      "hex": "E993FF"
    },
    "99": {
      "index": 49,
      "club": 2,
      "selectable": 1,
      "hex": "C600AD"
    },
    "100": {
      "index": 38,
      "club": 2,
      "selectable": 1,
      "hex": "9B001D"
    },
    "101": {
      "index": 92,
      "club": 2,
      "selectable": 1,
      "hex": "76FF2D"
    },
    "102": {
      "index": 91,
      "club": 2,
      "selectable": 1,
      "hex": "1CDC00"
    },
    "103": {
      "index": 90,
      "club": 2,
      "selectable": 1,
      "hex": "AFF203"
    },
    "104": {
      "index": 63,
      "club": 2,
      "selectable": 1,
      "hex": "00B9A8"
    },
    "105": {
      "index": 62,
      "club": 2,
      "selectable": 1,
      "hex": "94FFEC"
    },
    "106": {
      "index": 65,
      "club": 2,
      "selectable": 1,
      "hex": "1BD2FF"
    },
    "107": {
      "index": 67,
      "club": 2,
      "selectable": 1,
      "hex": "1F55FF"
    },
    "108": {
      "index": 69,
      "club": 2,
      "selectable": 1,
      "hex": "0219A5"
    },
    "109": {
      "index": 81,
      "club": 2,
      "selectable": 1,
      "hex": "3A5341"
    },
    "110": {
      "index": 20,
      "club": 2,
      "selectable": 1,
      "hex": "1E1E1E"
    },
    "1184": {
      "index": 95,
      "club": 0,
      "selectable": 0,
      "hex": "003F1D"
    },
    "1185": {
      "index": 96,
      "club": 0,
      "selectable": 0,
      "hex": "096E16"
    },
    "1186": {
      "index": 97,
      "club": 0,
      "selectable": 0,
      "hex": "105262"
    },
    "1187": {
      "index": 98,
      "club": 0,
      "selectable": 0,
      "hex": "106262"
    },
    "1188": {
      "index": 99,
      "club": 0,
      "selectable": 0,
      "hex": "121D6D"
    },
    "1189": {
      "index": 100,
      "club": 0,
      "selectable": 0,
      "hex": "1F1F1F"
    },
    "1190": {
      "index": 101,
      "club": 0,
      "selectable": 0,
      "hex": "20B4A4"
    },
    "1191": {
      "index": 102,
      "club": 0,
      "selectable": 0,
      "hex": "20B913"
    },
    "1192": {
      "index": 103,
      "club": 0,
      "selectable": 0,
      "hex": "2828C8"
    },
    "1193": {
      "index": 104,
      "club": 0,
      "selectable": 0,
      "hex": "292929"
    },
    "1194": {
      "index": 105,
      "club": 0,
      "selectable": 0,
      "hex": "298BB4"
    },
    "1195": {
      "index": 106,
      "club": 0,
      "selectable": 0,
      "hex": "2F2D26"
    },
    "1196": {
      "index": 107,
      "club": 0,
      "selectable": 0,
      "hex": "319CF6"
    },
    "1197": {
      "index": 108,
      "club": 0,
      "selectable": 0,
      "hex": "31F6DE"
    },
    "1198": {
      "index": 109,
      "club": 0,
      "selectable": 0,
      "hex": "333333"
    },
    "1199": {
      "index": 110,
      "club": 0,
      "selectable": 0,
      "hex": "336633"
    },
    "1200": {
      "index": 111,
      "club": 0,
      "selectable": 0,
      "hex": "365E8A"
    },
    "1201": {
      "index": 112,
      "club": 0,
      "selectable": 0,
      "hex": "378BE8"
    },
    "1202": {
      "index": 113,
      "club": 0,
      "selectable": 0,
      "hex": "37E8C5"
    },
    "1203": {
      "index": 114,
      "club": 0,
      "selectable": 0,
      "hex": "394194"
    },
    "1204": {
      "index": 115,
      "club": 0,
      "selectable": 0,
      "hex": "3B7AC0"
    },
    "1205": {
      "index": 116,
      "club": 0,
      "selectable": 0,
      "hex": "3D3D3D"
    },
    "1206": {
      "index": 117,
      "club": 0,
      "selectable": 0,
      "hex": "406A65"
    },
    "1207": {
      "index": 118,
      "club": 0,
      "selectable": 0,
      "hex": "43001A"
    },
    "1208": {
      "index": 119,
      "club": 0,
      "selectable": 0,
      "hex": "456283"
    },
    "1209": {
      "index": 120,
      "club": 0,
      "selectable": 0,
      "hex": "4A6A18"
    },
    "1210": {
      "index": 121,
      "club": 0,
      "selectable": 0,
      "hex": "4C882B"
    },
    "1211": {
      "index": 122,
      "club": 0,
      "selectable": 0,
      "hex": "5A837B"
    },
    "1212": {
      "index": 123,
      "club": 0,
      "selectable": 0,
      "hex": "5CC445"
    },
    "1213": {
      "index": 124,
      "club": 0,
      "selectable": 0,
      "hex": "5F5F5F"
    },
    "1214": {
      "index": 125,
      "club": 0,
      "selectable": 0,
      "hex": "624A41"
    },
    "1215": {
      "index": 126,
      "club": 0,
      "selectable": 0,
      "hex": "625A20"
    },
    "1216": {
      "index": 127,
      "club": 0,
      "selectable": 0,
      "hex": "626262"
    },
    "1217": {
      "index": 128,
      "club": 0,
      "selectable": 0,
      "hex": "656A40"
    },
    "1218": {
      "index": 129,
      "club": 0,
      "selectable": 0,
      "hex": "666666"
    },
    "1219": {
      "index": 130,
      "club": 0,
      "selectable": 0,
      "hex": "687450"
    },
    "1220": {
      "index": 131,
      "club": 0,
      "selectable": 0,
      "hex": "6A3910"
    },
    "1221": {
      "index": 132,
      "club": 0,
      "selectable": 0,
      "hex": "6A405C"
    },
    "1222": {
      "index": 133,
      "club": 0,
      "selectable": 0,
      "hex": "6A4A40"
    },
    "1223": {
      "index": 134,
      "club": 0,
      "selectable": 0,
      "hex": "779FBB"
    },
    "1224": {
      "index": 135,
      "club": 0,
      "selectable": 0,
      "hex": "795E53"
    },
    "1225": {
      "index": 136,
      "club": 0,
      "selectable": 0,
      "hex": "7B1894"
    },
    "1226": {
      "index": 137,
      "club": 0,
      "selectable": 0,
      "hex": "7B5818"
    },
    "1227": {
      "index": 138,
      "club": 0,
      "selectable": 0,
      "hex": "7C8F7D"
    },
    "1228": {
      "index": 139,
      "club": 0,
      "selectable": 0,
      "hex": "7D0004"
    },
    "1229": {
      "index": 141,
      "club": 0,
      "selectable": 0,
      "hex": "7D0034"
    },
    "1230": {
      "index": 143,
      "club": 0,
      "selectable": 0,
      "hex": "833141"
    },
    "1231": {
      "index": 145,
      "club": 0,
      "selectable": 0,
      "hex": "87D7CD"
    },
    "1232": {
      "index": 146,
      "club": 0,
      "selectable": 0,
      "hex": "88E0DE"
    },
    "1233": {
      "index": 147,
      "club": 0,
      "selectable": 0,
      "hex": "8B1820"
    },
    "1234": {
      "index": 148,
      "club": 0,
      "selectable": 0,
      "hex": "946220"
    },
    "1235": {
      "index": 149,
      "club": 0,
      "selectable": 0,
      "hex": "947BAC"
    },
    "1236": {
      "index": 150,
      "club": 0,
      "selectable": 0,
      "hex": "948B6A"
    },
    "1237": {
      "index": 151,
      "club": 0,
      "selectable": 0,
      "hex": "94BD29"
    },
    "1238": {
      "index": 152,
      "club": 0,
      "selectable": 0,
      "hex": "94FFD5"
    },
    "1239": {
      "index": 153,
      "club": 0,
      "selectable": 0,
      "hex": "95784E"
    },
    "1240": {
      "index": 154,
      "club": 0,
      "selectable": 0,
      "hex": "983E4F"
    },
    "1241": {
      "index": 155,
      "club": 0,
      "selectable": 0,
      "hex": "98863E"
    },
    "1242": {
      "index": 156,
      "club": 0,
      "selectable": 0,
      "hex": "9FD787"
    },
    "1243": {
      "index": 157,
      "club": 0,
      "selectable": 0,
      "hex": "A4A4A4"
    },
    "1244": {
      "index": 158,
      "club": 0,
      "selectable": 0,
      "hex": "A4DEFF"
    },
    "1245": {
      "index": 159,
      "club": 0,
      "selectable": 0,
      "hex": "A88139"
    },
    "1246": {
      "index": 160,
      "club": 0,
      "selectable": 0,
      "hex": "ADD0FF"
    },
    "1247": {
      "index": 161,
      "club": 0,
      "selectable": 0,
      "hex": "AFDCDF"
    },
    "1248": {
      "index": 162,
      "club": 0,
      "selectable": 0,
      "hex": "B3FCFF"
    },
    "1249": {
      "index": 163,
      "club": 0,
      "selectable": 0,
      "hex": "B429CD"
    },
    "1250": {
      "index": 164,
      "club": 0,
      "selectable": 0,
      "hex": "B4EE29"
    },
    "1251": {
      "index": 165,
      "club": 0,
      "selectable": 0,
      "hex": "B6396D"
    },
    "1252": {
      "index": 166,
      "club": 0,
      "selectable": 0,
      "hex": "B79BFF"
    },
    "1253": {
      "index": 167,
      "club": 0,
      "selectable": 0,
      "hex": "B8E737"
    },
    "1254": {
      "index": 168,
      "club": 0,
      "selectable": 0,
      "hex": "BA9D73"
    },
    "1255": {
      "index": 169,
      "club": 0,
      "selectable": 0,
      "hex": "BAAD68"
    },
    "1256": {
      "index": 170,
      "club": 0,
      "selectable": 0,
      "hex": "BAC7FF"
    },
    "1257": {
      "index": 171,
      "club": 0,
      "selectable": 0,
      "hex": "BB2430"
    },
    "1258": {
      "index": 172,
      "club": 0,
      "selectable": 0,
      "hex": "BD9CFF"
    },
    "1259": {
      "index": 173,
      "club": 0,
      "selectable": 0,
      "hex": "BDFFC8"
    },
    "1260": {
      "index": 174,
      "club": 0,
      "selectable": 0,
      "hex": "C0B4C7"
    },
    "1261": {
      "index": 175,
      "club": 0,
      "selectable": 0,
      "hex": "C1C1C1"
    },
    "1262": {
      "index": 176,
      "club": 0,
      "selectable": 0,
      "hex": "C1D2DB"
    },
    "1263": {
      "index": 177,
      "club": 0,
      "selectable": 0,
      "hex": "C54A29"
    },
    "1264": {
      "index": 178,
      "club": 0,
      "selectable": 0,
      "hex": "C59462"
    },
    "1265": {
      "index": 179,
      "club": 0,
      "selectable": 0,
      "hex": "C6B3D6"
    },
    "1266": {
      "index": 180,
      "club": 0,
      "selectable": 0,
      "hex": "C745D9"
    },
    "1267": {
      "index": 181,
      "club": 0,
      "selectable": 0,
      "hex": "CA2221"
    },
    "1268": {
      "index": 182,
      "club": 0,
      "selectable": 0,
      "hex": "CDCDFF"
    },
    "1269": {
      "index": 183,
      "club": 0,
      "selectable": 0,
      "hex": "CDFFB3"
    },
    "1270": {
      "index": 184,
      "club": 0,
      "selectable": 0,
      "hex": "D1DFAF"
    },
    "1271": {
      "index": 185,
      "club": 0,
      "selectable": 0,
      "hex": "D1FFD4"
    },
    "1272": {
      "index": 186,
      "club": 0,
      "selectable": 0,
      "hex": "D54173"
    },
    "1273": {
      "index": 187,
      "club": 0,
      "selectable": 0,
      "hex": "D5FF9C"
    },
    "1274": {
      "index": 188,
      "club": 0,
      "selectable": 0,
      "hex": "D68C8C"
    },
    "1275": {
      "index": 189,
      "club": 0,
      "selectable": 0,
      "hex": "D7C187"
    },
    "1276": {
      "index": 190,
      "club": 0,
      "selectable": 0,
      "hex": "D9457E"
    },
    "1277": {
      "index": 191,
      "club": 0,
      "selectable": 0,
      "hex": "D97145"
    },
    "1278": {
      "index": 192,
      "club": 0,
      "selectable": 0,
      "hex": "DE73DE"
    },
    "1279": {
      "index": 193,
      "club": 0,
      "selectable": 0,
      "hex": "DEDEDE"
    },
    "1280": {
      "index": 194,
      "club": 0,
      "selectable": 0,
      "hex": "DFAFD1"
    },
    "1281": {
      "index": 195,
      "club": 0,
      "selectable": 0,
      "hex": "DFCBAF"
    },
    "1282": {
      "index": 196,
      "club": 0,
      "selectable": 0,
      "hex": "E63139"
    },
    "1283": {
      "index": 197,
      "club": 0,
      "selectable": 0,
      "hex": "E6A4F6"
    },
    "1284": {
      "index": 198,
      "club": 0,
      "selectable": 0,
      "hex": "E8B137"
    },
    "1285": {
      "index": 199,
      "club": 0,
      "selectable": 0,
      "hex": "E8FFFF"
    },
    "1286": {
      "index": 200,
      "club": 0,
      "selectable": 0,
      "hex": "EEEEEE"
    },
    "1287": {
      "index": 201,
      "club": 0,
      "selectable": 0,
      "hex": "F64C3E"
    },
    "1288": {
      "index": 202,
      "club": 0,
      "selectable": 0,
      "hex": "F6AC31"
    },
    "1289": {
      "index": 203,
      "club": 0,
      "selectable": 0,
      "hex": "F9A0A0"
    },
    "1290": {
      "index": 204,
      "club": 0,
      "selectable": 0,
      "hex": "FF006A"
    },
    "1291": {
      "index": 205,
      "club": 0,
      "selectable": 0,
      "hex": "FF1092"
    },
    "1292": {
      "index": 206,
      "club": 0,
      "selectable": 0,
      "hex": "FF45D6"
    },
    "1293": {
      "index": 207,
      "club": 0,
      "selectable": 0,
      "hex": "FF7329"
    },
    "1294": {
      "index": 208,
      "club": 0,
      "selectable": 0,
      "hex": "FF7383"
    },
    "1295": {
      "index": 209,
      "club": 0,
      "selectable": 0,
      "hex": "FF7BDE"
    },
    "1296": {
      "index": 210,
      "club": 0,
      "selectable": 0,
      "hex": "FF8516"
    },
    "1297": {
      "index": 211,
      "club": 0,
      "selectable": 0,
      "hex": "FF9C62"
    },
    "1298": {
      "index": 212,
      "club": 0,
      "selectable": 0,
      "hex": "FFB3D7"
    },
    "1299": {
      "index": 213,
      "club": 0,
      "selectable": 0,
      "hex": "FFB6DE"
    },
    "1300": {
      "index": 214,
      "club": 0,
      "selectable": 0,
      "hex": "FFBDBD"
    },
    "1301": {
      "index": 215,
      "club": 0,
      "selectable": 0,
      "hex": "FFC800"
    },
    "1302": {
      "index": 216,
      "club": 0,
      "selectable": 0,
      "hex": "FFC92B"
    },
    "1303": {
      "index": 217,
      "club": 0,
      "selectable": 0,
      "hex": "FFCD94"
    },
    "1304": {
      "index": 218,
      "club": 0,
      "selectable": 0,
      "hex": "FFCE64"
    },
    "1305": {
      "index": 219,
      "club": 0,
      "selectable": 0,
      "hex": "FFD2B3"
    },
    "1306": {
      "index": 220,
      "club": 0,
      "selectable": 0,
      "hex": "FFE639"
    },
    "1307": {
      "index": 221,
      "club": 0,
      "selectable": 0,
      "hex": "FFE673"
    },
    "1308": {
      "index": 222,
      "club": 0,
      "selectable": 0,
      "hex": "FFEDB3"
    },
    "1309": {
      "index": 223,
      "club": 0,
      "selectable": 0,
      "hex": "FFEE6D"
    },
    "1310": {
      "index": 224,
      "club": 0,
      "selectable": 0,
      "hex": "FFEEC5"
    },
    "1311": {
      "index": 225,
      "club": 0,
      "selectable": 0,
      "hex": "FFFF00"
    },
    "1312": {
      "index": 226,
      "club": 0,
      "selectable": 0,
      "hex": "FFFF66"
    },
    "1313": {
      "index": 227,
      "club": 0,
      "selectable": 0,
      "hex": "FFFFFA"
    },
    "1314": {
      "index": 228,
      "club": 0,
      "selectable": 0,
      "hex": "FFFFFF"
    },
    "1315": {
      "index": 89,
      "club": 2,
      "selectable": 1,
      "hex": "D2FF00"
    },
    "1320": {
      "index": 4,
      "club": 0,
      "selectable": 1,
      "hex": "fff7b7"
    },
    "1321": {
      "index": 27,
      "club": 2,
      "selectable": 1,
      "hex": "ffe508"
    },
    "1322": {
      "index": 29,
      "club": 2,
      "selectable": 1,
      "hex": "ffa508"
    },
    "1323": {
      "index": 31,
      "club": 2,
      "selectable": 1,
      "hex": "ff5b08"
    },
    "1324": {
      "index": 34,
      "club": 2,
      "selectable": 1,
      "hex": "b18276"
    },
    "1325": {
      "index": 21,
      "club": 2,
      "selectable": 1,
      "hex": "84573c"
    },
    "1326": {
      "index": 45,
      "club": 2,
      "selectable": 1,
      "hex": "ffc7e4"
    },
    "1327": {
      "index": 47,
      "club": 2,
      "selectable": 1,
      "hex": "ff88f4"
    },
    "1328": {
      "index": 42,
      "club": 2,
      "selectable": 1,
      "hex": "ff638f"
    },
    "1329": {
      "index": 35,
      "club": 2,
      "selectable": 1,
      "hex": "ae4747"
    },
    "1330": {
      "index": 36,
      "club": 2,
      "selectable": 1,
      "hex": "813033"
    },
    "1331": {
      "index": 37,
      "club": 2,
      "selectable": 1,
      "hex": "5b2420"
    },
    "1332": {
      "index": 93,
      "club": 2,
      "selectable": 1,
      "hex": "9eff8d"
    },
    "1333": {
      "index": 94,
      "club": 2,
      "selectable": 1,
      "hex": "a2cc89"
    },
    "1334": {
      "index": 78,
      "club": 2,
      "selectable": 1,
      "hex": "89906e"
    },
    "1335": {
      "index": 79,
      "club": 2,
      "selectable": 1,
      "hex": "738b6e"
    },
    "1336": {
      "index": 82,
      "club": 2,
      "selectable": 1,
      "hex": "1d301a"
    },
    "1337": {
      "index": 61,
      "club": 2,
      "selectable": 1,
      "hex": "c1c6ef"
    },
    "1338": {
      "index": 73,
      "club": 2,
      "selectable": 1,
      "hex": "6fa5cc"
    },
    "1339": {
      "index": 60,
      "club": 2,
      "selectable": 1,
      "hex": "8791f0"
    },
    "1340": {
      "index": 58,
      "club": 2,
      "selectable": 1,
      "hex": "574bfb"
    },
    "1341": {
      "index": 70,
      "club": 2,
      "selectable": 1,
      "hex": "394a7e"
    },
    "1408": {
      "index": 0,
      "club": 0,
      "selectable": 1,
      "hex": "dddddd"
    },
    "1409": {
      "index": 23,
      "club": 2,
      "selectable": 1,
      "hex": "c69f71"
    },
    "1410": {
      "index": 28,
      "club": 2,
      "selectable": 1,
      "hex": "ffcc00"
    },
    "1411": {
      "index": 33,
      "club": 2,
      "selectable": 1,
      "hex": "da6a43"
    },
    "1412": {
      "index": 39,
      "club": 2,
      "selectable": 1,
      "hex": "d2183c"
    },
    "1413": {
      "index": 40,
      "club": 2,
      "selectable": 1,
      "hex": "e53624"
    },
    "1414": {
      "index": 43,
      "club": 2,
      "selectable": 1,
      "hex": "fe86b1"
    },
    "1415": {
      "index": 50,
      "club": 2,
      "selectable": 1,
      "hex": "a1295e"
    },
    "1416": {
      "index": 51,
      "club": 2,
      "selectable": 1,
      "hex": "a723c9"
    },
    "1417": {
      "index": 52,
      "club": 2,
      "selectable": 1,
      "hex": "6a0481"
    },
    "1418": {
      "index": 53,
      "club": 2,
      "selectable": 1,
      "hex": "693959"
    },
    "1419": {
      "index": 54,
      "club": 2,
      "selectable": 1,
      "hex": "62368c"
    },
    "1420": {
      "index": 56,
      "club": 2,
      "selectable": 1,
      "hex": "957caf"
    },
    "1421": {
      "index": 59,
      "club": 2,
      "selectable": 1,
      "hex": "6b71ed"
    },
    "1422": {
      "index": 64,
      "club": 2,
      "selectable": 1,
      "hex": "009db9"
    },
    "1423": {
      "index": 66,
      "club": 2,
      "selectable": 1,
      "hex": "2f8ce9"
    },
    "1424": {
      "index": 68,
      "club": 2,
      "selectable": 1,
      "hex": "1946c7"
    },
    "1425": {
      "index": 71,
      "club": 2,
      "selectable": 1,
      "hex": "2d547b"
    },
    "1426": {
      "index": 72,
      "club": 2,
      "selectable": 1,
      "hex": "406184"
    },
    "1427": {
      "index": 75,
      "club": 2,
      "selectable": 1,
      "hex": "c8c8c8"
    },
    "1428": {
      "index": 77,
      "club": 2,
      "selectable": 1,
      "hex": "868686"
    },
    "1429": {
      "index": 80,
      "club": 2,
      "selectable": 1,
      "hex": "626738"
    },
    "1430": {
      "index": 83,
      "club": 2,
      "selectable": 1,
      "hex": "0a6437"
    },
    "1431": {
      "index": 84,
      "club": 2,
      "selectable": 1,
      "hex": "47891f"
    },
    "1432": {
      "index": 85,
      "club": 2,
      "selectable": 1,
      "hex": "10a32f"
    },
    "1433": {
      "index": 86,
      "club": 2,
      "selectable": 1,
      "hex": "69bb2d"
    }
  }
};

export const setsJSON: HabboFigureSet[] = [
  {
    "paletteid": 2,
    "type": "hr",
    "sets": {
      "100": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "105": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "110": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "115": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "120": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "125": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "130": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "135": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "140": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "145": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "150": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "155": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "160": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "165": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "170": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "175": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "176": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "177": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "178": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "500": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "505": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "510": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "515": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "520": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "525": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "530": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "535": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "540": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "545": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "550": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "555": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "556": {
        "gender": "F",
        "club": 2,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "565": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "570": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "575": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "580": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "585": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "590": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "595": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "596": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "676": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "677": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "678": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "679": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "681": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "800": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "801": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "802": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "810": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "811": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "828": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "829": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "830": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "831": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "832": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "833": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "834": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "835": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "836": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "837": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "838": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "839": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "840": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "841": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "842": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "843": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "844": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "845": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "846": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "847": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "848": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "849": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "850": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "851": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "852": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "853": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "854": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "855": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "856": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "857": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "858": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "859": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "860": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "861": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "862": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "863": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "864": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "865": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "866": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "867": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "868": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "869": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "870": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "871": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "872": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "873": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "874": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "889": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "890": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "891": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "892": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "893": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3004": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3011": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3012": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3020": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3021": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3024": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3025": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3037": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3040": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3041": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3043": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3044": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3048": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3056": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3090": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3160": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3161": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3162": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3163": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3172": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3194": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3195": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3221": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3247": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3251": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3255": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3256": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3260": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3273": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3278": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3281": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3322": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3325": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3339": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3357": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3369": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3370": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3377": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3386": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3393": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3396": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3436": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3468": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3499": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3516": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3519": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3520": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3525": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3531": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3568": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3569": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3602": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3608": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3625": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3657": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3664": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3665": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3670": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3671": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3673": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3674": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3676": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3699": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3705": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3706": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3707": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3714": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3715": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3724": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3725": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3731": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3733": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3746": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3764": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3768": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3774": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3777": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3782": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3785": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3786": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3789": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3790": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3791": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3800": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3810": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3811": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3819": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3829": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3841": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3846": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3847": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3852": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3860": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3866": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3870": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3871": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3920": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3926": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3936": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3944": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3957": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3977": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3983": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3990": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3994": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3998": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4020": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4024": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4031": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4090": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4117": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4118": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4126": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4131": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4141": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4143": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4160": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4162": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4181": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4182": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4186": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4193": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4216": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4269": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4270": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4273": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4274": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4298": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4343": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4352": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4360": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4363": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4370": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4941": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4991": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4996": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "9534": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 1,
    "type": "hd",
    "sets": {
      "180": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "185": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "190": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "195": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "200": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "205": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "206": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "207": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "208": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "209": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "600": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "605": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "610": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "615": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "620": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "625": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "626": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "627": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "628": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "629": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3091": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3092": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3093": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3094": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3095": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3096": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3097": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3098": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3099": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3100": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3101": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3102": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3103": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3104": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3105": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3106": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3536": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3537": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3600": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3603": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3604": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3631": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3704": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3721": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3813": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3814": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3845": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3956": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3997": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4015": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4023": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4163": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4174": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4202": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4203": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4204": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4205": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4206": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4266": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4267": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4268": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4279": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4280": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4287": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4383": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "ch",
    "sets": {
      "210": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "215": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "220": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "225": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "230": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "235": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "240": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "245": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "250": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "255": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "262": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "265": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "266": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "267": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "630": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "635": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "640": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "645": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "650": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "655": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "660": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "665": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "667": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "669": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "670": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "675": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "680": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "685": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "690": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "691": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "803": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "804": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "805": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "806": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "807": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "808": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "809": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "812": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "813": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "814": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "815": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "816": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "817": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "818": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "819": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "820": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "821": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "822": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "823": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "824": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "825": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "826": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "875": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "876": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "877": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "878": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "879": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "880": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "881": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "882": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "883": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "884": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "885": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3001": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3005": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3013": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3014": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3015": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3022": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3030": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3032": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3033": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3036": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3038": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3045": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3046": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3049": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3050": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3051": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3059": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3060": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3067": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3076": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3077": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3109": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3110": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3111": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3112": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3113": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3114": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3133": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3135": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3137": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3165": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3167": {
        "gender": "M",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3183": {
        "gender": "F",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3185": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3197": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3199": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3203": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3208": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3213": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3214": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3215": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3222": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3233": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3234": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3237": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3244": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3245": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3250": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3266": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3279": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3293": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3321": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3323": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3332": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3334": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3335": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3336": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3340": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3342": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3351": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3367": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3368": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3371": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3372": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3399": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3400": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3416": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3417": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3428": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3429": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3432": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3433": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3438": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3439": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3442": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3443": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3446": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3459": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3486": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3487": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3489": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3490": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3491": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3492": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3496": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3497": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3498": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3501": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3505": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3506": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3510": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3517": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3518": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3527": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3528": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3529": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3530": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3538": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3539": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3540": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3563": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3581": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3582": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3598": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3599": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3615": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3616": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3617": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3618": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3629": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3630": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3636": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3637": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3658": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3659": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3668": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3669": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3672": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3678": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3679": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3682": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3683": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3685": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3686": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3688": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3689": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3728": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3729": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3735": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3747": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3748": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3769": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3770": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3779": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3780": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3788": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3792": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3793": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3796": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3797": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3806": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3807": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3808": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3809": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3817": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3818": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3834": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3835": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3836": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3839": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3840": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3848": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3849": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3853": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3854": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3868": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3880": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3881": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3913": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3914": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3923": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3931": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3932": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3934": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3935": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3940": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3941": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3942": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3943": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3947": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3948": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3949": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3969": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3970": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3971": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3972": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3979": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3980": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3981": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3987": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3988": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3995": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3996": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4000": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4001": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4003": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4004": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4025": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4062": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4063": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4067": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4068": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4069": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4070": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4071": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4072": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4073": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4074": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4087": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4088": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4098": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4099": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4100": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4101": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4110": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4111": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4121": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4122": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4127": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4128": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4139": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4140": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4142": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4155": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4156": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4157": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4158": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4165": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4166": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4169": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4171": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4172": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4189": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4190": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4199": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4200": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4218": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4219": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4220": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4221": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4222": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4223": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4224": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4225": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4226": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4227": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4228": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4229": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4230": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4231": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4232": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4233": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4234": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4235": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4236": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4237": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4238": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4239": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4240": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4241": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4242": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4243": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4244": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4245": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4246": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4247": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4248": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4249": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4250": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4251": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4252": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4253": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4254": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4255": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4256": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4257": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4275": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4276": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4285": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4286": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4289": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4299": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4337": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4338": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4339": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4340": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4350": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4351": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4353": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4361": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4362": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4365": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4366": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4367": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4368": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4384": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4385": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4392": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4393": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4950": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4951": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4961": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4962": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4974": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4975": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4976": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4981": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4982": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4983": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4984": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4989": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4994": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4995": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5005": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5006": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "lg",
    "sets": {
      "270": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "275": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "280": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "281": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "285": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "695": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "696": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "700": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "705": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "710": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "715": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "716": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "720": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "827": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3006": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3017": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3018": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3019": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3023": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3047": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3057": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3058": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3061": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3078": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3088": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3116": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3134": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3136": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3138": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3166": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3174": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3190": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3191": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3192": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3198": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3200": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3201": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3202": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3216": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3235": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3257": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3267": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3282": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3283": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3290": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3301": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3320": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3328": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3333": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3337": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3341": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3353": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3355": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3361": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3364": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3365": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3384": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3387": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3391": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3401": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3407": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3408": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3418": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3434": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3449": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3460": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3483": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3502": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3521": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3526": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3596": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3607": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3626": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3695": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3781": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3787": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3842": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3864": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3915": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3924": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3933": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3950": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3968": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4002": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4011": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4012": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4017": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4034": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4066": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4081": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4082": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4083": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4092": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4102": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4113": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4114": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4119": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4125": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4138": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4167": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4191": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4306": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4309": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4312": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4315": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4341": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4358": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4369": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4373": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4375": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4934": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "sh",
    "sets": {
      "290": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "295": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "300": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "305": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "725": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "730": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "735": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "740": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "905": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "906": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "907": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "908": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3016": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3027": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3035": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3064": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3068": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3089": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3115": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3154": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3180": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3184": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3206": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3252": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3275": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3277": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3338": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3348": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3354": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3375": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3383": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3419": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3435": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3467": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3524": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3587": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3595": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3611": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3619": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3621": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3687": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3693": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3719": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3720": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3783": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4016": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4030": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4064": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4065": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4112": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4159": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "ha",
    "sets": {
      "1001": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1002": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1003": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1004": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1005": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1006": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1007": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1008": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1009": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1010": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1011": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1012": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1013": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1014": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1015": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1016": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1017": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1018": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1019": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1020": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1021": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1022": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1023": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1024": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1025": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1026": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1027": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3026": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3054": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3086": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3117": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3118": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3129": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3130": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3139": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3140": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3144": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3145": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3150": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3156": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3171": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3173": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3179": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3209": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3220": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3231": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3236": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3238": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3240": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3241": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3242": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3243": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3253": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3254": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3259": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3261": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3265": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3268": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3272": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3291": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3298": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3300": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3303": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3305": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3331": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3347": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3349": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3352": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3356": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3362": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3363": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3382": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3392": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3394": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3404": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3409": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3415": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3421": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3422": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3426": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3430": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3431": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3440": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3441": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3450": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3451": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3452": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3453": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3454": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3455": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3456": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3457": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3461": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3463": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3477": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3478": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3479": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3480": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3481": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3482": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3488": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3494": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3495": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3500": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3514": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3533": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3534": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3535": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3541": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3544": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3546": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3554": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3555": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3556": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3564": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3565": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3566": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3567": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3570": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3571": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3583": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3584": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3585": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3586": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3588": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3589": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3591": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3601": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3605": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3606": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3612": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3613": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3614": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3620": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3622": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3623": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3624": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3632": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3633": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3638": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3646": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3647": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3648": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3649": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3650": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3651": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3652": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3653": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3654": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3655": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3656": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3662": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3666": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3667": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3675": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3677": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3680": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3684": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3690": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3694": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3701": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3708": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3709": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3710": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3711": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3730": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3734": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3736": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3737": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3741": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3742": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3745": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3756": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3757": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3758": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3759": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3760": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3761": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3762": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3763": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3765": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3766": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3767": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3775": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3776": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3784": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3804": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3823": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3843": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3855": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3857": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3859": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3862": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3922": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3929": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3930": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3945": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3952": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3953": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3954": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3967": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3976": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3984": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3986": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4006": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4007": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4008": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4009": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4018": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4027": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4038": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4039": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4050": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4051": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4052": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4053": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4054": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4055": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4056": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4057": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4061": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4084": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4085": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4086": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4089": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4094": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4095": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4103": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4120": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4132": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4133": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4134": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4136": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4154": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4164": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4170": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4187": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4188": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4192": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4194": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4195": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4196": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4197": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4198": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4201": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4207": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4208": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4214": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4215": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4284": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4294": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4295": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4296": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4297": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4301": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4304": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4307": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4310": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4313": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4316": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4319": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4320": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4321": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4322": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4323": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4324": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4325": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4326": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4327": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4328": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4329": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4330": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4331": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4332": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4333": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4334": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4348": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4349": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4354": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4355": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4371": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4374": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4948": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4949": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4955": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4960": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4964": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4970": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4972": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4980": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5003": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5004": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5010": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5011": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5012": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "he",
    "sets": {
      "1601": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1602": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1603": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1604": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1605": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1606": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1607": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1608": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1609": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1610": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3069": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3070": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3071": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3079": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3081": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3082": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3146": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3149": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3155": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3164": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3181": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3188": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3189": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3218": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3227": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3228": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3229": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3239": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3258": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3274": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3295": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3297": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3324": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3329": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3358": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3376": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3379": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3385": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3395": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3465": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3469": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3543": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3547": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3548": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3549": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3550": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3551": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3552": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3557": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3558": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3559": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3560": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3561": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3562": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3579": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3580": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3627": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3628": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3642": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3643": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3644": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3645": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3660": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3681": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3703": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3716": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3732": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3740": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3743": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3752": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3753": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3754": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3755": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3772": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3778": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3805": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3820": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3821": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3833": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3858": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3869": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3873": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3879": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3884": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3889": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3890": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3891": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3892": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3893": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3894": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3912": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3918": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3939": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3951": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3958": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3974": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3999": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4019": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4022": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4059": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4093": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4209": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4210": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4213": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4258": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4259": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4260": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4261": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4262": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4263": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4264": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4265": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4271": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4272": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4288": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4293": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4303": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4318": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4345": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4357": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4379": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4380": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4381": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4382": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4944": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4945": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4946": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4969": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4971": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4977": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4990": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "ea",
    "sets": {
      "1401": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1402": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1403": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1404": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1405": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1406": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3083": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3107": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3108": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3141": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3148": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3168": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3169": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3170": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3196": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3224": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3226": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3262": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3270": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3318": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3388": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3484": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3493": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3574": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3575": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3576": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3577": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3578": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3639": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3640": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3641": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3698": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3726": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3727": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3749": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3750": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3751": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3803": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3822": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3886": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3887": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3925": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3959": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3960": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3961": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3962": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3978": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4021": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4161": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4212": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4302": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4346": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4968": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4985": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4986": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4987": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4988": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5007": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5008": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5009": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "fa",
    "sets": {
      "1201": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1202": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1203": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1204": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1205": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1206": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1207": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1208": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1209": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1210": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1211": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1212": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 1,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3147": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3193": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3230": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3276": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3296": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3344": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3345": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3346": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3350": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3378": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3462": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3470": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3471": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3472": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3473": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3474": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3475": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3476": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3553": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3590": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3592": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3597": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3663": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3700": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3771": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3812": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3815": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3816": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3832": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3865": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3888": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3963": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3964": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3965": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3966": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3993": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4013": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4014": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4042": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4043": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4044": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4045": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4046": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4047": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4048": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4049": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4058": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4168": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4185": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4211": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4283": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "ca",
    "sets": {
      "1801": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1802": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1803": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1804": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1805": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1806": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1807": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1808": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1809": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1810": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1811": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1812": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1813": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1814": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1815": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1816": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1817": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1818": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "1819": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3084": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3085": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3131": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3151": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3175": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3176": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3177": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3187": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3217": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3219": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3223": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3225": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3292": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3343": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3410": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3411": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3412": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3413": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3414": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3423": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3424": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3425": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3437": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3444": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3458": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3464": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3466": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3485": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3503": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3511": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3545": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3691": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3702": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3799": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3801": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3802": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3828": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3844": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3856": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3861": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3876": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3882": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3883": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3885": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3916": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3919": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3921": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3937": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3938": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3973": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3982": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3985": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3989": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4005": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4036": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4037": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4115": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4116": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4129": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4130": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4135": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4173": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4183": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4281": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4292": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4335": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4336": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4344": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4347": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4364": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4372": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4378": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4388": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4389": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4390": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4391": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4542": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4936": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4937": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4938": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4939": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4956": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4957": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4958": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4959": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4963": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4965": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5001": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "5002": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "wa",
    "sets": {
      "2001": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2002": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2003": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2004": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2005": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2006": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2007": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2008": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2009": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2010": {
        "gender": "F",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2011": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "2012": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3072": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3073": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3074": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3080": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3178": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3210": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3211": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3212": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3263": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3264": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3359": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3366": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3427": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3504": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3661": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3773": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3798": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3872": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3895": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4040": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4060": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4317": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "cc",
    "sets": {
      "260": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "886": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "887": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "888": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3002": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3003": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3007": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3008": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3009": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3010": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3039": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3066": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3075": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3087": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3152": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3153": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3157": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3158": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3159": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3186": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3232": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3246": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3248": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3249": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3269": {
        "gender": "M",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3280": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3289": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3294": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3299": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3302": {
        "gender": "M",
        "club": 2,
        "colorable": 0,
        "selectable": 0,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3304": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3326": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3327": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3360": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3373": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3374": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3380": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3381": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3389": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3390": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3397": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3398": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3405": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3406": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3420": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3447": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3448": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3507": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3508": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3509": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3512": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3513": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3515": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3522": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3523": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3532": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3542": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3572": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3573": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3593": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3594": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3609": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3610": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3634": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3635": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3692": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3696": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3697": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3712": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3713": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3717": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3718": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3722": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3723": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3738": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3739": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3744": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3794": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3795": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3824": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3825": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3826": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3827": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3830": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3831": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3837": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3838": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3850": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3851": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3863": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3867": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3874": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3875": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3877": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3878": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3896": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3897": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3898": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3899": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3900": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3901": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3902": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3903": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3904": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3905": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3906": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3907": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3908": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3909": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3910": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3911": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3917": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3927": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3928": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3946": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3955": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3975": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3991": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3992": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4010": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4026": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4028": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4029": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4032": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4033": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4041": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4075": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4076": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4077": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4078": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4079": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4080": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4091": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4096": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4097": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4104": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4105": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4106": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4107": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4108": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4109": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4123": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4124": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4137": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4175": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4176": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4177": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4178": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4179": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4180": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4184": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4217": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4277": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4278": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4282": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4290": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4291": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4300": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4305": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4308": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4311": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4314": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4356": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4376": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4377": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4386": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4387": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4940": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4942": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4943": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4947": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4952": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4953": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4954": {
        "gender": "U",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4966": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4967": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4978": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4979": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4997": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "4998": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "9563": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "9865": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      }
    }
  },
  {
    "paletteid": 3,
    "type": "cp",
    "sets": {
      "3119": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3120": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3121": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3122": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3123": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3124": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3125": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3126": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3127": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3128": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3204": {
        "gender": "M",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3205": {
        "gender": "M",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3207": {
        "gender": "F",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3284": {
        "gender": "M",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3285": {
        "gender": "F",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3286": {
        "gender": "M",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3287": {
        "gender": "F",
        "club": 0,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3288": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3307": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3308": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3309": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3310": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3311": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3312": {
        "gender": "U",
        "club": 2,
        "colorable": 0,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3313": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3314": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3315": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3316": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3317": {
        "gender": "U",
        "club": 2,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 0,
        "duotone": 1,
        "nft": 0
      },
      "3402": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      },
      "3403": {
        "gender": "U",
        "club": 0,
        "colorable": 1,
        "selectable": 1,
        "preselectable": 0,
        "sellable": 1,
        "duotone": 1,
        "nft": 0
      }
    }
  }
];

// Estatísticas
export const clothingStats = {
  totalItems: 1738,
  totalCategories: 13,
  totalPalettes: 3,
  categories: {
  "hr": 239,
  "hd": 65,
  "ch": 368,
  "lg": 111,
  "sh": 51,
  "ha": 295,
  "he": 131,
  "ea": 60,
  "fa": 63,
  "ca": 108,
  "wa": 34,
  "cc": 182,
  "cp": 31
},
  generatedAt: '2025-09-02T00:40:46.565Z'
};