// SISTEMA DE EXIBIÇÃO DE ASSETS SWF LOCAIS
// Usa os arquivos SWF já carregados para exibir imagens no grid

class SWFAssetsDisplay {
    constructor() {
        this.swfAssets = new Map();
        this.assetCache = new Map();
        this.basePath = './assets/swf/'; // Caminho para os assets SWF
        this.supportedTypes = ['hd', 'hr', 'ha', 'ch', 'lg', 'sh', 'ea', 'fa', 'he', 'cp', 'ca', 'wa', 'cc', 'dr', 'sk', 'su', 'ac', 'bp', 'bg', 'wg', 'tl', 'mk', 'cs', 'bd', 'lh', 'rh'];
    }

    // ===== MAPEAMENTO DE ASSETS SWF =====
    
    // Mapear todos os assets SWF disponíveis
    async mapAvailableSWFAssets() {
        console.log('🔍 Mapeando assets SWF disponíveis...');
        
        // Mapeamento baseado nos arquivos SWF conhecidos
        const swfMapping = {
            // Cabeças
            'hd': [
                { file: 'hh_human_face.swf', baseId: 180, count: 30, rarity: 'common' },
                { file: 'face_U_goddesseyes.swf', baseId: 200, count: 1, rarity: 'rare' },
                { file: 'face_U_nftsmileyface.swf', baseId: 201, count: 1, rarity: 'nft' },
                { file: 'face_U_nftsmileyface2.swf', baseId: 202, count: 1, rarity: 'nft' },
                { file: 'face_U_special1.swf', baseId: 205, count: 1, rarity: 'hc' },
                { file: 'face_U_special2.swf', baseId: 210, count: 1, rarity: 'hc' },
                { file: 'face_U_sellable1.swf', baseId: 215, count: 1, rarity: 'sell' },
                { file: 'face_U_sellable2.swf', baseId: 220, count: 1, rarity: 'sell' }
            ],
            
            // Cabelos
            'hr': [
                { file: 'hh_human_hair.swf', baseId: 100, count: 50, rarity: 'common' },
                { file: 'hair_U_botticellihair.swf', baseId: 150, count: 1, rarity: 'rare' },
                { file: 'hair_U_duckafro.swf', baseId: 151, count: 1, rarity: 'rare' },
                { file: 'hair_U_summermanbun.swf', baseId: 152, count: 1, rarity: 'rare' },
                { file: 'hair_U_poolpartybraids.swf', baseId: 153, count: 1, rarity: 'rare' },
                { file: 'hair_U_nonbowponytail.swf', baseId: 154, count: 1, rarity: 'rare' },
                { file: 'hair_U_rainbowponytail.swf', baseId: 155, count: 1, rarity: 'rare' },
                { file: 'hair_U_afro.swf', baseId: 111, count: 1, rarity: 'rare' },
                { file: 'hair_U_braids.swf', baseId: 112, count: 1, rarity: 'rare' },
                { file: 'hair_U_bun.swf', baseId: 113, count: 1, rarity: 'rare' },
                { file: 'hair_U_mohawk.swf', baseId: 114, count: 1, rarity: 'rare' },
                { file: 'hair_U_bald.swf', baseId: 115, count: 1, rarity: 'rare' }
            ],
            
            // Chapéus
            'ha': [
                { file: 'hh_human_hats.swf', baseId: 1, count: 20, rarity: 'common' },
                { file: 'hat_U_party.swf', baseId: 2, count: 1, rarity: 'common' },
                { file: 'hat_U_winter.swf', baseId: 3, count: 1, rarity: 'common' },
                { file: 'hat_U_grape.swf', baseId: 4, count: 1, rarity: 'common' },
                { file: 'hat_U_cowboy.swf', baseId: 5, count: 1, rarity: 'common' },
                { file: 'hat_U_sailor.swf', baseId: 6, count: 1, rarity: 'common' },
                { file: 'hat_U_magician.swf', baseId: 7, count: 1, rarity: 'common' },
                { file: 'hat_U_princess.swf', baseId: 8, count: 1, rarity: 'rare' },
                { file: 'hat_U_hc1.swf', baseId: 11, count: 1, rarity: 'hc' },
                { file: 'hat_U_hc2.swf', baseId: 12, count: 1, rarity: 'hc' },
                { file: 'hat_U_hc3.swf', baseId: 13, count: 1, rarity: 'hc' }
            ],
            
            // Camisas
            'ch': [
                { file: 'hh_human_chest.swf', baseId: 210, count: 100, rarity: 'common' },
                { file: 'chest_U_social.swf', baseId: 215, count: 1, rarity: 'common' },
                { file: 'chest_U_casual.swf', baseId: 220, count: 1, rarity: 'common' },
                { file: 'chest_U_basic.swf', baseId: 225, count: 1, rarity: 'common' },
                { file: 'chest_U_simple.swf', baseId: 230, count: 1, rarity: 'common' },
                { file: 'chest_U_classic.swf', baseId: 235, count: 1, rarity: 'common' },
                { file: 'chest_U_modern.swf', baseId: 240, count: 1, rarity: 'common' },
                { file: 'chest_U_elegant.swf', baseId: 245, count: 1, rarity: 'common' },
                { file: 'chest_U_formal.swf', baseId: 250, count: 1, rarity: 'common' },
                { file: 'chest_U_sport.swf', baseId: 255, count: 1, rarity: 'common' },
                { file: 'chest_U_style.swf', baseId: 260, count: 1, rarity: 'common' },
                { file: 'chest_U_premium.swf', baseId: 265, count: 1, rarity: 'common' },
                { file: 'chest_U_exclusive.swf', baseId: 266, count: 1, rarity: 'common' },
                { file: 'chest_U_limited.swf', baseId: 267, count: 1, rarity: 'common' },
                { file: 'chest_U_vintage.swf', baseId: 268, count: 1, rarity: 'common' },
                { file: 'chest_U_street.swf', baseId: 269, count: 1, rarity: 'common' },
                { file: 'chest_U_hc1.swf', baseId: 803, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc2.swf', baseId: 3001, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc3.swf', baseId: 3015, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc4.swf', baseId: 3022, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc5.swf', baseId: 3032, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc6.swf', baseId: 3038, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc7.swf', baseId: 3050, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc8.swf', baseId: 3059, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc9.swf', baseId: 3077, count: 1, rarity: 'hc' },
                { file: 'chest_U_hc10.swf', baseId: 3167, count: 1, rarity: 'hc' },
                { file: 'chest_U_sell1.swf', baseId: 3321, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell2.swf', baseId: 3323, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell3.swf', baseId: 3332, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell4.swf', baseId: 3334, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell5.swf', baseId: 3336, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell6.swf', baseId: 3342, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell7.swf', baseId: 3368, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell8.swf', baseId: 3372, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell9.swf', baseId: 3400, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell10.swf', baseId: 3416, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell137.swf', baseId: 4994, count: 1, rarity: 'sell' },
                { file: 'chest_U_sell138.swf', baseId: 5006, count: 1, rarity: 'sell' }
            ],
            
            // Calças
            'lg': [
                { file: 'hh_human_legs.swf', baseId: 270, count: 50, rarity: 'common' },
                { file: 'legs_U_jeans.swf', baseId: 271, count: 1, rarity: 'common' },
                { file: 'legs_U_social.swf', baseId: 272, count: 1, rarity: 'common' },
                { file: 'legs_U_sport.swf', baseId: 273, count: 1, rarity: 'common' },
                { file: 'legs_U_party.swf', baseId: 274, count: 1, rarity: 'common' },
                { file: 'legs_U_elegant.swf', baseId: 275, count: 1, rarity: 'common' },
                { file: 'legs_U_premium.swf', baseId: 276, count: 1, rarity: 'common' },
                { file: 'legs_U_exclusive.swf', baseId: 277, count: 1, rarity: 'common' },
                { file: 'legs_U_vintage.swf', baseId: 278, count: 1, rarity: 'common' },
                { file: 'legs_U_street.swf', baseId: 279, count: 1, rarity: 'common' },
                { file: 'legs_U_hc1.swf', baseId: 280, count: 1, rarity: 'hc' },
                { file: 'legs_U_hc2.swf', baseId: 281, count: 1, rarity: 'hc' },
                { file: 'legs_U_hc3.swf', baseId: 282, count: 1, rarity: 'hc' },
                { file: 'legs_U_sell1.swf', baseId: 290, count: 1, rarity: 'sell' },
                { file: 'legs_U_sell2.swf', baseId: 291, count: 1, rarity: 'sell' },
                { file: 'legs_U_sell3.swf', baseId: 292, count: 1, rarity: 'sell' }
            ],
            
            // Sapatos
            'sh': [
                { file: 'hh_human_shoes.swf', baseId: 290, count: 30, rarity: 'common' },
                { file: 'shoes_U_tennis.swf', baseId: 291, count: 1, rarity: 'common' },
                { file: 'shoes_U_social.swf', baseId: 292, count: 1, rarity: 'common' },
                { file: 'shoes_U_boots.swf', baseId: 293, count: 1, rarity: 'common' },
                { file: 'shoes_U_sandals.swf', baseId: 294, count: 1, rarity: 'common' },
                { file: 'shoes_U_elegant.swf', baseId: 295, count: 1, rarity: 'common' },
                { file: 'shoes_U_premium.swf', baseId: 296, count: 1, rarity: 'common' },
                { file: 'shoes_U_exclusive.swf', baseId: 297, count: 1, rarity: 'common' },
                { file: 'shoes_U_vintage.swf', baseId: 298, count: 1, rarity: 'common' },
                { file: 'shoes_U_street.swf', baseId: 299, count: 1, rarity: 'common' },
                { file: 'shoes_U_hc1.swf', baseId: 300, count: 1, rarity: 'hc' },
                { file: 'shoes_U_hc2.swf', baseId: 301, count: 1, rarity: 'hc' },
                { file: 'shoes_U_hc3.swf', baseId: 302, count: 1, rarity: 'hc' },
                { file: 'shoes_U_sell1.swf', baseId: 310, count: 1, rarity: 'sell' },
                { file: 'shoes_U_sell2.swf', baseId: 311, count: 1, rarity: 'sell' },
                { file: 'shoes_U_sell3.swf', baseId: 312, count: 1, rarity: 'sell' }
            ]
        };
        
        this.swfAssets = swfMapping;
        console.log('✅ Assets SWF mapeados:', Object.keys(swfMapping).length, 'tipos');
        return swfMapping;
    }

    // ===== GERAÇÃO DE DADOS DE ROUPAS =====
    
    // Gerar dados de roupas baseados nos assets SWF
    generateClothingDataFromSWF() {
        console.log('🔄 Gerando dados de roupas dos assets SWF...');
        
        const clothingData = {};
        
        Object.entries(this.swfAssets).forEach(([type, assets]) => {
            const category = this.getCategoryFromType(type);
            if (!clothingData[category]) {
                clothingData[category] = { nonhc: [], hc: [], sell: [], nft: [] };
            }
            
            assets.forEach(asset => {
                // Gerar itens para cada ID no range
                for (let i = 0; i < asset.count; i++) {
                    const id = asset.baseId + i;
                    const item = {
                        id: id.toString(),
                        name: this.generateItemName(category, type, id),
                        type: type,
                        rarity: asset.rarity,
                        figure: this.generateFigureString(type, id),
                        color: this.getDefaultColorForType(type),
                        swfFile: asset.file,
                        swfPath: this.basePath + asset.file
                    };
                    
                    // Categorizar por raridade
                    const rarity = this.mapRarity(asset.rarity);
                    clothingData[category][rarity].push(item);
                }
            });
        });
        
        console.log('✅ Dados de roupas gerados dos SWF:', clothingData);
        return clothingData;
    }
    
    // Mapear tipo para categoria
    getCategoryFromType(type) {
        const typeMap = {
            'hd': 'head',
            'hr': 'hair',
            'ha': 'hats',
            'ch': 'shirts',
            'lg': 'pants',
            'sh': 'shoes',
            'ea': 'eyeAccessories',
            'fa': 'faceAccessories',
            'he': 'headAccessories',
            'cp': 'chestAccessories',
            'ca': 'chestAccessories',
            'wa': 'waistAccessories',
            'cc': 'jackets',
            'dr': 'dresses',
            'sk': 'skirts',
            'su': 'suits',
            'ac': 'accessories',
            'bp': 'backpacks',
            'bg': 'bags',
            'wg': 'wings',
            'tl': 'tails',
            'mk': 'masks',
            'cs': 'costumes',
            'bd': 'body',
            'lh': 'leftHand',
            'rh': 'rightHand'
        };
        return typeMap[type] || 'accessories';
    }
    
    // Mapear raridade
    mapRarity(swfRarity) {
        const rarityMap = {
            'common': 'nonhc',
            'rare': 'hc',
            'hc': 'hc',
            'sell': 'sell',
            'nft': 'nft'
        };
        return rarityMap[swfRarity] || 'nonhc';
    }
    
    // Gerar nome do item
    generateItemName(category, type, id) {
        const categoryNames = {
            'head': 'Cabeça',
            'hair': 'Cabelo',
            'hats': 'Chapéu',
            'shirts': 'Camisa',
            'pants': 'Calça',
            'shoes': 'Sapato',
            'eyeAccessories': 'Acessório dos Olhos',
            'faceAccessories': 'Acessório do Rosto',
            'headAccessories': 'Acessório da Cabeça',
            'chestAccessories': 'Acessório do Peito',
            'waistAccessories': 'Acessório da Cintura',
            'jackets': 'Jaqueta',
            'dresses': 'Vestido',
            'skirts': 'Saia',
            'suits': 'Traje',
            'accessories': 'Acessório',
            'backpacks': 'Mochila',
            'bags': 'Bolsa',
            'wings': 'Asas',
            'tails': 'Cauda',
            'masks': 'Máscara',
            'costumes': 'Fantasia',
            'body': 'Corpo',
            'leftHand': 'Mão Esquerda',
            'rightHand': 'Mão Direita'
        };
        
        const baseName = categoryNames[category] || 'Item';
        return `${baseName} ${id}`;
    }
    
    // Gerar string de figura
    generateFigureString(type, id) {
        const defaultColors = {
            'hd': '7',   // Cabeça - cor da pele
            'hr': '7',   // Cabelo - cor padrão
            'ch': '66',  // Camisa - cor azul
            'lg': '82',  // Calça - cor marrom
            'sh': '80',  // Sapato - cor preta
            'ha': '7'    // Chapéu - cor padrão
        };
        
        const color = defaultColors[type] || '7';
        return `${type}-${id}-${color}-`;
    }
    
    // Obter cor padrão para o tipo
    getDefaultColorForType(type) {
        const defaultColors = {
            'hd': '7',
            'hr': '7', 
            'ch': '66',
            'lg': '82',
            'sh': '80',
            'ha': '7'
        };
        return defaultColors[type] || '7';
    }

    // ===== EXIBIÇÃO NO GRID =====
    
    // Renderizar grid com assets SWF
    renderSWFGrid(container, category, items) {
        if (!container || !items || items.length === 0) return;
        
        container.innerHTML = '';
        
        items.forEach(item => {
            const itemElement = this.createSWFItemElement(item);
            container.appendChild(itemElement);
        });
    }
    
    // Criar elemento de item SWF
    createSWFItemElement(item) {
        const div = document.createElement('div');
        div.className = `clothing-item ${item.rarity}`;
        div.setAttribute('data-type', item.type);
        div.setAttribute('data-id', item.id);
        div.setAttribute('data-category', this.getCategoryFromType(item.type));
        
        // Criar imagem do asset SWF
        const img = document.createElement('img');
        img.src = this.generateSWFPreviewUrl(item);
        img.alt = item.name;
        img.title = item.name;
        
        // Fallback para Habbo Imaging se SWF não carregar
        img.onerror = () => {
            console.log(`🔄 Fallback para Habbo Imaging: ${item.type}-${item.id}`);
            img.src = this.generateHabboImagingUrl(item);
        };
        
        div.appendChild(img);
        
        // Adicionar evento de clique
        div.addEventListener('click', () => {
            this.selectSWFItem(item);
        });
        
        return div;
    }
    
    // Gerar URL de preview do SWF
    generateSWFPreviewUrl(item) {
        // Se temos o arquivo SWF, tentar usar
        if (item.swfPath) {
            return item.swfPath;
        }
        
        // Fallback para Habbo Imaging
        return this.generateHabboImagingUrl(item);
    }
    
    // Gerar URL do Habbo Imaging como fallback
    generateHabboImagingUrl(item) {
        return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.figure}&gender=M&size=m`;
    }
    
    // Selecionar item SWF
    selectSWFItem(item) {
        console.log(`🎯 Item SWF selecionado: ${item.name} (${item.type}-${item.id})`);
        
        // Disparar evento customizado para o editor
        const event = new CustomEvent('swfItemSelected', {
            detail: { item: item }
        });
        document.dispatchEvent(event);
    }

    // ===== UTILITÁRIOS =====
    
    // Contar total de itens
    countTotalItems(data) {
        let total = 0;
        Object.values(data).forEach(category => {
            Object.values(category).forEach(items => {
                total += items.length;
            });
        });
        return total;
    }
    
    // Exportar dados para JSON
    exportToJSON(data) {
        const exportData = {
            metadata: {
                source: 'SWF Assets Display',
                timestamp: new Date().toISOString(),
                totalItems: this.countTotalItems(data),
                swfAssets: Object.keys(this.swfAssets)
            },
            data: data
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `swf_assets_data_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📤 Dados SWF exportados:', exportData.metadata);
        return exportData;
    }
}

// ===== FUNÇÕES DE UTILIDADE =====

// Função para inicializar o sistema SWF
async function initializeSWFDisplay() {
    const swfDisplay = new SWFAssetsDisplay();
    await swfDisplay.mapAvailableSWFAssets();
    return swfDisplay;
}

// Função para gerar dados de roupas dos SWF
function generateSWFClothingData() {
    const swfDisplay = new SWFAssetsDisplay();
    swfDisplay.mapAvailableSWFAssets();
    return swfDisplay.generateClothingDataFromSWF();
}

// ===== EXPORTAÇÃO =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        SWFAssetsDisplay, 
        initializeSWFDisplay,
        generateSWFClothingData
    };
} else {
    window.SWFAssetsDisplay = SWFAssetsDisplay;
    window.initializeSWFDisplay = initializeSWFDisplay;
    window.generateSWFClothingData = generateSWFClothingData;
}
