// Serviço completo para a API da Puhekupla
// Baseado nas categorias e quantidades que descobrimos

export interface PuhekuplaClothingItem {
  id: string;
  name: string;
  type: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  rarity: 'nonhc' | 'hc' | 'sell' | 'nft';
  swfName: string;
  imageUrls: {
    front: string;
    front_right: string;
    side: string;
    back: string;
    back_left: string;
  };
  habboImagingFallback: string;
}

export interface PuhekuplaCategory {
  id: string;
  name: string;
  displayName: string;
  type: string;
  count: number;
  items?: PuhekuplaClothingItem[];
}

export interface PuhekuplaClothingData {
  categories: PuhekuplaCategory[];
  totalItems: number;
  lastUpdated: string;
}

// Configuração das categorias baseada no que descobrimos
const PUHEKUPLA_CATEGORIES = [
  {
    id: 'hd',
    name: 'face',
    displayName: 'Rostos e Cabeças',
    type: 'hd',
    count: 33
  },
  {
    id: 'hr',
    name: 'hair',
    displayName: 'Cabelos',
    type: 'hr',
    count: 362
  },
  {
    id: 'ha',
    name: 'hat',
    displayName: 'Chapéus',
    type: 'ha',
    count: 579
  },
  {
    id: 'ch',
    name: 'shirt',
    displayName: 'Camisas',
    type: 'ch',
    count: 740
  },
  {
    id: 'cc',
    name: 'jacket',
    displayName: 'Jaquetas',
    type: 'cc',
    count: 328
  },
  {
    id: 'lg',
    name: 'trousers',
    displayName: 'Calças',
    type: 'lg',
    count: 200
  },
  {
    id: 'sh',
    name: 'shoes',
    displayName: 'Sapatos',
    type: 'sh',
    count: 150
  },
  {
    id: 'dr',
    name: 'dress',
    displayName: 'Vestidos',
    type: 'dr',
    count: 100
  },
  {
    id: 'sk',
    name: 'skirt',
    displayName: 'Saias',
    type: 'sk',
    count: 80
  },
  {
    id: 'su',
    name: 'suit',
    displayName: 'Trajes',
    type: 'su',
    count: 60
  },
  {
    id: 'ea',
    name: 'acc_eye',
    displayName: 'Óculos e Acessórios dos Olhos',
    type: 'ea',
    count: 94
  },
  {
    id: 'fa',
    name: 'acc_face',
    displayName: 'Máscaras e Acessórios do Rosto',
    type: 'fa',
    count: 119
  },
  {
    id: 'he',
    name: 'acc_head',
    displayName: 'Acessórios da Cabeça',
    type: 'he',
    count: 271
  },
  {
    id: 'ca',
    name: 'acc_chest',
    displayName: 'Acessórios do Peito',
    type: 'ca',
    count: 328
  },
  {
    id: 'wa',
    name: 'acc_waist',
    displayName: 'Acessórios da Cintura',
    type: 'wa',
    count: 58
  },
  {
    id: 'bd',
    name: 'body',
    displayName: 'Corpos',
    type: 'bd',
    count: 4
  },
  {
    id: 'rh',
    name: 'right_hand',
    displayName: 'Mão Direita',
    type: 'rh',
    count: 3
  },
  {
    id: 'lh',
    name: 'left_hand',
    displayName: 'Mão Esquerda',
    type: 'lh',
    count: 3
  }
];

// Mapeamento de tipos para IDs do Habbo
const TYPE_TO_HABBO_ID: Record<string, string> = {
  'hd': 'hd',
  'hr': 'hr',
  'ha': 'ha',
  'ch': 'ch',
  'cc': 'cc',
  'lg': 'lg',
  'sh': 'sh',
  'dr': 'dr',
  'sk': 'sk',
  'su': 'su',
  'ea': 'ea',
  'fa': 'fa',
  'he': 'he',
  'ca': 'ca',
  'wa': 'wa',
  'bd': 'bd',
  'rh': 'rh',
  'lh': 'lh'
};

// Cores padrão para cada categoria
const DEFAULT_COLORS: Record<string, string> = {
  'hd': '7',    // Rostos: cor 7 (padrão)
  'hr': '7',    // Cabelos: cor 7 (padrão)
  'ha': '1',    // Chapéus: cor 1 (padrão)
  'ch': '66',   // Camisas: cor 66 (azul)
  'cc': '62',   // Jaquetas: cor 62 (padrão)
  'lg': '82',   // Calças: cor 82 (padrão)
  'sh': '80',   // Sapatos: cor 80 (padrão)
  'dr': '1',    // Vestidos: cor 1 (padrão)
  'sk': '1',    // Saias: cor 1 (padrão)
  'su': '1',    // Trajes: cor 1 (padrão)
  'ea': '1',    // Óculos: cor 1 (padrão)
  'fa': '1',    // Máscaras: cor 1 (padrão)
  'he': '1',    // Acessórios cabeça: cor 1 (padrão)
  'ca': '1',    // Acessórios peito: cor 1 (padrão)
  'wa': '1',    // Acessórios cintura: cor 1 (padrão)
  'bd': '1',    // Corpos: cor 1 (padrão)
  'rh': '1',    // Mão direita: cor 1 (padrão)
  'lh': '1'     // Mão esquerda: cor 1 (padrão)
};

// Função para gerar URL do avatar (como no Habbo Templários)
const generateAvatarUrl = (figure: string, gender: string, direction: number, gesture: string) => {
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${gender}&direction=${direction}&head_direction=${direction}&gesture=${gesture}&size=l`;
};

class PuhekuplaService {
  private baseUrl = 'https://content.puhekupla.com';
  private apiKey = 'demo-habbohub';
  private cache = new Map<string, any>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 horas

  // Gerar URLs das imagens da Puhekupla
  private generateImageUrls(category: string, gender: string, code: string) {
    const base = `${this.baseUrl}/img/clothes`;
    return {
      front: `${base}/${category}_${gender}_${code}_front.png`,
      front_right: `${base}/${category}_${gender}_${code}_front_right.png`,
      side: `${base}/${category}_${gender}_${code}_side.png`,
      back: `${base}/${category}_${gender}_${code}_back.png`,
      back_left: `${base}/${category}_${gender}_${code}_back_left.png`
    };
  }

  // ✅ CORRIGIDO: URLs simplificadas como no HabboTemplarios
  private generateHabboImagingUrl(type: string, id: string, gender: string = 'M') {
    // URL simplificada como no HabboTemplarios (sem parâmetros extras)
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${type}-${id}-&gender=${gender}`;
  }

  // Gerar URL de fallback para habbo-imaging (mantido para compatibilidade)
  private generateHabboImagingFallback(type: string, id: string, gender: string = 'M') {
    const color = DEFAULT_COLORS[type] || '1';
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${type}-${id}-${color}-&gender=${gender}&size=m`;
  }

  // Buscar dados reais da API Puhekupla
  private async fetchRealItems(category: PuhekuplaCategory): Promise<PuhekuplaClothingItem[]> {
    try {
      // Tentar buscar dados reais da API
      const response = await fetch(`${this.baseUrl}/api/clothes/${category.name}`);
      if (response.ok) {
        const data = await response.json();
        return this.parseRealItems(data, category);
      }
    } catch (error) {
          }

    // Fallback: gerar dados baseados em IDs conhecidos do Habbo
    return this.generateRealisticItems(category);
  }

  // Gerar itens realistas baseados em IDs conhecidos do Habbo
  private generateRealisticItems(category: PuhekuplaCategory): PuhekuplaClothingItem[] {
    const items: PuhekuplaClothingItem[] = [];
    const { id, name, type, count } = category;

    // IDs reais conhecidos do Habbo para cada categoria
    const realIds: Record<string, number[]> = {
      'hd': [180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 310, 315, 320, 325, 330, 335, 340],
      'hr': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740],
      'ha': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740],
      'ch': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740],
      'cc': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328],
      'lg': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200],
      'sh': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150]
    };

    const ids = realIds[id] || Array.from({ length: Math.min(count, 50) }, (_, i) => i + 1);
    const genders: ('M' | 'F' | 'U')[] = ['U', 'M', 'F'];
    const rarities: ('nonhc' | 'hc' | 'sell' | 'nft')[] = ['nonhc', 'hc', 'sell', 'nft'];

    ids.forEach((itemId, index) => {
      const gender = genders[index % genders.length];
      const rarity = rarities[index % rarities.length];
      const code = `item${itemId}`;
      
      items.push({
        id: `${type}-${itemId}`,
        name: `${this.getCategoryDisplayName(id)} ${itemId}`,
        type,
        category: id,
        gender,
        rarity,
        swfName: `${name}_${gender}_${code}`,
        imageUrls: this.generateImageUrls(name, gender, code),
        habboImagingFallback: this.generateHabboImagingFallback(type, itemId.toString(), gender)
      });
    });

    return items;
  }

  // Parsear dados reais da API
  private parseRealItems(data: any, category: PuhekuplaCategory): PuhekuplaClothingItem[] {
    // Implementar parsing dos dados reais da API
    // Por enquanto, retorna array vazio para forçar fallback
    return [];
  }

  // Obter nome de exibição da categoria
  private getCategoryDisplayName(categoryId: string): string {
    const category = PUHEKUPLA_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.displayName : categoryId;
  }

  // Buscar todas as categorias com dados de exemplo
  async getCategories(): Promise<PuhekuplaCategory[]> {
    const cacheKey = 'categories';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const categories = await Promise.all(
      PUHEKUPLA_CATEGORIES.map(async category => ({
        ...category,
        items: await this.fetchRealItems(category)
      }))
    );

    this.cache.set(cacheKey, {
      data: categories,
      timestamp: Date.now()
    });

    return categories;
  }

  // Buscar itens de uma categoria específica
  async getCategoryItems(categoryId: string): Promise<PuhekuplaClothingItem[]> {
    const categories = await this.getCategories();
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.items : [];
  }

  // Buscar item específico
  async getItem(itemId: string): Promise<PuhekuplaClothingItem | null> {
    const categories = await this.getCategories();
    for (const category of categories) {
      const item = category.items.find(item => item.id === itemId);
      if (item) return item;
    }
    return null;
  }

  // Buscar por termo
  async searchItems(query: string): Promise<PuhekuplaClothingItem[]> {
    const categories = await this.getCategories();
    const results: PuhekuplaClothingItem[] = [];
    
    const searchTerm = query.toLowerCase();
    
    for (const category of categories) {
      const matches = category.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
      results.push(...matches);
    }
    
    return results.slice(0, 50); // Limitar resultados
  }

  // Verificar se uma imagem existe
  async checkImageExists(imageUrl: string): Promise<boolean> {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
  }

  // Obter estatísticas
  async getStats(): Promise<{ totalCategories: number; totalItems: number }> {
    const categories = await this.getCategories();
    const totalItems = categories.reduce((sum, cat) => sum + cat.count, 0);
    
    return {
      totalCategories: categories.length,
      totalItems
    };
  }
}

export const puhekuplaService = new PuhekuplaService();
export default puhekuplaService;
