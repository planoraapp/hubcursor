
// src/data/habboTemplariosData.ts

// Interfaces que representam a estrutura de dados do HabboTemplarios
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
    type: string; // código da categoria (ex: hd, hr, ch, lg, sh, etc)
    sets: { [setId: string]: HabboSetData };
}

// ===========================================================================
// BASES DE DADOS EXTRAÍDAS DO CÓDIGO DO HABBO TEMPLARIOS
// Este arquivo é a "fonte da verdade" para o editor HabboTemplarios.
// ===========================================================================

export const palettesJSON: { [paletteId: string]: HabboPalette } = {
  "1": {"14":{"index":0,"club":0,"selectable":1,"hex":"F5DA88"},"10":{"index":1,"club":0,"selectable":1,"hex":"FFDBC1"},"1":{"index":2,"club":0,"selectable":1,"hex":"FFCB98"},"8":{"index":3,"club":0,"selectable":1,"hex":"F4AC54"},"12":{"index":4,"club":0,"selectable":1,"hex":"FF987F"},"1369":{"index":5,"club":0,"selectable":1,"hex":"e0a9a9"},"1370":{"index":6,"club":0,"selectable":1,"hex":"ca8154"},"19":{"index":7,"club":0,"selectable":1,"hex":"B87560"},"20":{"index":8,"club":0,"selectable":1,"hex":"9C543F"},"1371":{"index":9,"club":0,"selectable":1,"hex":"904925"},"30":{"index":10,"club":0,"selectable":1,"hex":"4C311E"},"1372":{"index":11,"club":2,"selectable":1,"hex":"543d35"},"1373":{"index":12,"club":2,"selectable":1,"hex":"653a1d"},"21":{"index":13,"club":2,"selectable":1,"hex":"6E392C"},"1374":{"index":14,"club":2,"selectable":1,"hex":"714947"},"1375":{"index":15,"club":2,"selectable":1,"hex":"856860"},"1376":{"index":16,"club":2,"selectable":1,"hex":"895048"},"1377":{"index":17,"club":2,"selectable":1,"hex":"a15253"},"1378":{"index":18,"club":2,"selectable":1,"hex":"aa7870"},"1379":{"index":19,"club":2,"selectable":1,"hex":"be8263"},"1380":{"index":20,"club":2,"selectable":1,"hex":"b6856d"},"1381":{"index":21,"club":2,"selectable":1,"hex":"ba8a82"},"1382":{"index":22,"club":2,"selectable":1,"hex":"c88f82"},"1383":{"index":23,"club":2,"selectable":1,"hex":"d9a792"},"1384":{"index":24,"club":2,"selectable":1,"hex":"c68383"},"1368":{"index":25,"club":2,"selectable":1,"hex":"BC576A"},"1367":{"index":26,"club":2,"selectable":1,"hex":"FF5757"},"1366":{"index":27,"club":2,"selectable":1,"hex":"FF7575"},"1358":{"index":28,"club":2,"selectable":1,"hex":"B65E38"},"1385":{"index":29,"club":2,"selectable":1,"hex":"a76644"},"1386":{"index":30,"club":2,"selectable":1,"hex":"7c5133"},"1387":{"index":31,"club":2,"selectable":1,"hex":"9a7257"},"5":{"index":32,"club":2,"selectable":1,"hex":"945C2F"},"1389":{"index":33,"club":2,"selectable":1,"hex":"d98c63"},"4":{"index":34,"club":2,"selectable":1,"hex":"AE7748"},"1388":{"index":35,"club":2,"selectable":1,"hex":"c57040"},"1359":{"index":36,"club":2,"selectable":1,"hex":"B88655"},"3":{"index":37,"club":2,"selectable":1,"hex":"C99263"},"18":{"index":38,"club":2,"selectable":1,"hex":"A89473"},"17":{"index":39,"club":2,"selectable":1,"hex":"C89F56"},"9":{"index":40,"club":2,"selectable":1,"hex":"DC9B4C"},"1357":{"index":41,"club":2,"selectable":1,"hex":"FF8C40"},"1390":{"index":42,"club":2,"selectable":1,"hex":"de9d75"},"1391":{"index":43,"club":2,"selectable":1,"hex":"eca782"},"11":{"index":44,"club":2,"selectable":1,"hex":"FFB696"},"2":{"index":45,"club":2,"selectable":1,"hex":"E3AE7D"},"7":{"index":46,"club":2,"selectable":1,"hex":"FFC680"},"15":{"index":47,"club":2,"selectable":1,"hex":"DFC375"},"13":{"index":48,"club":2,"selectable":1,"hex":"F0DCA3"},"22":{"index":49,"club":2,"selectable":1,"hex":"EAEFD0"},"23":{"index":50,"club":2,"selectable":1,"hex":"E2E4B0"},"24":{"index":51,"club":2,"selectable":1,"hex":"D5D08C"},"1361":{"index":52,"club":2,"selectable":1,"hex":"BDE05F"},"1362":{"index":53,"club":2,"selectable":1,"hex":"5DC446"},"1360":{"index":54,"club":2,"selectable":1,"hex":"A2CC89"},"26":{"index":55,"club":2,"selectable":1,"hex":"C2C4A7"},"28":{"index":56,"club":2,"selectable":1,"hex":"F1E5DA"},"1392":{"index":57,"club":2,"selectable":1,"hex":"f6d3d4"},"1393":{"index":58,"club":2,"selectable":1,"hex":"e5b6b0"},"25":{"index":59,"club":2,"selectable":1,"hex":"C4A7B3"},"1363":{"index":60,"club":2,"selectable":1,"hex":"AC94B3"},"1364":{"index":61,"club":2,"selectable":1,"hex":"D288CE"},"1365":{"index":62,"club":2,"selectable":1,"hex":"6799CC"},"29":{"index":63,"club":2,"selectable":1,"hex":"B3BDC3"},"27":{"index":64,"club":2,"selectable":1,"hex":"C5C0C2"}},
  "2": {"40":{"index":0,"club":0,"selectable":1,"hex":"D8D3D9"},"34":{"index":1,"club":0,"selectable":1,"hex":"FFEEB9"},"35":{"index":2,"club":0,"selectable":1,"hex":"F6D059"},"36":{"index":3,"club":0,"selectable":1,"hex":"F2B11D"},"31":{"index":4,"club":0,"selectable":1,"hex":"FFD6A9"},"32":{"index":5,"club":0,"selectable":1,"hex":"DFA66F"},"37":{"index":6,"club":0,"selectable":1,"hex":"9A5D2E"},"38":{"index":7,"club":0,"selectable":1,"hex":"AC5300"},"43":{"index":8,"club":0,"selectable":1,"hex":"F29159"},"46":{"index":9,"club":0,"selectable":1,"hex":"FF8746"},"47":{"index":10,"club":0,"selectable":1,"hex":"FC610C"},"48":{"index":11,"club":0,"selectable":1,"hex":"DE3900"},"44":{"index":12,"club":0,"selectable":1,"hex":"9E3D3B"},"39":{"index":13,"club":0,"selectable":1,"hex":"783400"},"45":{"index":14,"club":0,"selectable":1,"hex":"5C4332"},"42":{"index":15,"club":0,"selectable":1,"hex":"4A4656"}},
  "3": {"1408":{"index":0,"club":0,"selectable":1,"hex":"dddddd"},"90":{"index":1,"club":0,"selectable":1,"hex":"96743D"},"91":{"index":2,"club":0,"selectable":1,"hex":"6B573B"},"66":{"index":3,"club":0,"selectable":1,"hex":"E7B027"},"1320":{"index":4,"club":0,"selectable":1,"hex":"fff7b7"},"68":{"index":5,"club":0,"selectable":1,"hex":"F8C790"},"73":{"index":6,"club":0,"selectable":1,"hex":"9F2B31"},"72":{"index":7,"club":0,"selectable":1,"hex":"ED5C50"},"71":{"index":8,"club":0,"selectable":1,"hex":"FFBFC2"},"74":{"index":9,"club":0,"selectable":1,"hex":"E7D1EE"},"75":{"index":10,"club":0,"selectable":1,"hex":"AC94B3"},"76":{"index":11,"club":0,"selectable":1,"hex":"7E5B90"},"82":{"index":12,"club":0,"selectable":1,"hex":"4F7AA2"},"81":{"index":13,"club":0,"selectable":1,"hex":"75B7C7"},"80":{"index":14,"club":0,"selectable":1,"hex":"C5EDE6"},"83":{"index":15,"club":0,"selectable":1,"hex":"BBF3BD"},"84":{"index":16,"club":0,"selectable":1,"hex":"6BAE61"},"85":{"index":17,"club":0,"selectable":1,"hex":"456F40"},"88":{"index":18,"club":0,"selectable":1,"hex":"7A7D22"},"64":{"index":19,"club":0,"selectable":1,"hex":"595959"}}
};

// Complete sets data from HabboTemplarios
export const setsJSON: HabboFigureSet[] = [
  {
    paletteid: 2,
    type: 'hr',
    sets: {
      "175": {"gender": "M", "club": 0, "colorable": 0, "selectable": 0, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "3004": {"gender": "F", "club": 2, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "3090": {"gender": "U", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "3160": {"gender": "F", "club": 2, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "3162": {"gender": "M", "club": 2, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "3322": {"gender": "U", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 1, "duotone": 1, "nft": 0},
      "145": {"gender": "M", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "550": {"gender": "F", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "125": {"gender": "M", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "676": {"gender": "U", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "105": {"gender": "M", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "500": {"gender": "F", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "555": {"gender": "F", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "681": {"gender": "U", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0},
      "828": {"gender": "M", "club": 2, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 1, "nft": 0}
    }
  },
  {
    paletteid: 1,
    type: 'hd',
    sets: {
      "180": {"gender": "U", "club": 0, "colorable": 0, "selectable": 1, "preselectable": 1, "sellable": 0, "duotone": 0, "nft": 0},
      "181": {"gender": "U", "club": 0, "colorable": 0, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 0, "nft": 0},
      "182": {"gender": "U", "club": 0, "colorable": 0, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 0, "nft": 0}
    }
  },
  {
    paletteid: 3,
    type: 'ch',
    sets: {
      "665": {"gender": "M", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 1, "sellable": 0, "duotone": 0, "nft": 0},
      "667": {"gender": "F", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 1, "sellable": 0, "duotone": 0, "nft": 0},
      "668": {"gender": "U", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 0, "nft": 0}
    }
  },
  {
    paletteid: 3,
    type: 'lg',
    sets: {
      "700": {"gender": "M", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 1, "sellable": 0, "duotone": 0, "nft": 0},
      "701": {"gender": "F", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 1, "sellable": 0, "duotone": 0, "nft": 0},
      "702": {"gender": "U", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 0, "nft": 0}
    }
  },
  {
    paletteid: 3,
    type: 'sh',
    sets: {
      "705": {"gender": "U", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 1, "sellable": 0, "duotone": 0, "nft": 0},
      "706": {"gender": "M", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 0, "nft": 0},
      "707": {"gender": "F", "club": 0, "colorable": 1, "selectable": 1, "preselectable": 0, "sellable": 0, "duotone": 0, "nft": 0}
    }
  }
];

// Category names mapping
export const CATEGORY_NAMES: Record<string, string> = {
  'hd': 'Cabeça',
  'hr': 'Cabelo',
  'ch': 'Camisa',
  'cc': 'Casaco',
  'lg': 'Calça',
  'sh': 'Sapatos',
  'ha': 'Chapéu',
  'ea': 'Óculos',
  'fa': 'Rosto',
  'ca': 'Acessório',
  'wa': 'Cintura',
  'cp': 'Estampa'
};
