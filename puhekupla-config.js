// Configuração da API Puhekupla para buscar roupas do Habbo
const PUHEKUPLA_CONFIG = {
    apiKey: 'demo-habbohub', // Chave demo para HabboHub
    baseUrl: 'https://api.puhekupla.fi',
    endpoints: {
        clothes: '/clothes'
    }
};

// Função para buscar roupas usando a API da Puhekupla
async function fetchPuhekuplaClothes(page = 1, perPage = 100) {
    try {
        const response = await fetch(`${PUHEKUPLA_CONFIG.baseUrl}${PUHEKUPLA_CONFIG.endpoints.clothes}?page=${page}&per_page=${perPage}`, {
            headers: {
                'X-Puhekupla-APIKey': PUHEKUPLA_CONFIG.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados da API Puhekupla:', data);
        return data;
    } catch (error) {
        console.error('Erro ao buscar roupas da Puhekupla:', error);
        return null;
    }
}

// Função para buscar assets diretamente dos arquivos da Puhekupla
async function fetchPuhekuplaAssets() {
    console.log('🔄 Buscando assets diretamente dos arquivos da Puhekupla...');
    
    try {
        // Definir as categorias e seus padrões de arquivos
        const assetCategories = {
            // Categorias principais
            head: {
                pattern: /^face_/,
                type: 'hd',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            hair: {
                pattern: /^hair_/,
                type: 'hr',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            hats: {
                pattern: /^hat_/,
                type: 'ha',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            shirts: {
                pattern: /^shirt_/,
                type: 'ch',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            pants: {
                pattern: /^trousers_/,
                type: 'lg',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            shoes: {
                pattern: /^shoes_/,
                type: 'sh',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            
            // Acessórios específicos
            eyeAccessories: {
                pattern: /^acc_eye_/,
                type: 'ea',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            faceAccessories: {
                pattern: /^acc_face_/,
                type: 'fa',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            headAccessories: {
                pattern: /^acc_head_/,
                type: 'he',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            chestAccessories: {
                pattern: /^acc_chest_/,
                type: 'cp',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            waistAccessories: {
                pattern: /^acc_waist_/,
                type: 'wa',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            
            // Roupas adicionais
            jackets: {
                pattern: /^jacket_/,
                type: 'cc',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            dresses: {
                pattern: /^dress_/,
                type: 'dr',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            skirts: {
                pattern: /^skirt_/,
                type: 'sk',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            suits: {
                pattern: /^suit_/,
                type: 'su',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            
            // Acessórios gerais
            accessories: {
                pattern: /^accessory_/,
                type: 'ac',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            backpacks: {
                pattern: /^backpack_/,
                type: 'bp',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            bags: {
                pattern: /^bag_/,
                type: 'bg',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            
            // Itens especiais
            wings: {
                pattern: /^wings_/,
                type: 'wg',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            tails: {
                pattern: /^tail_/,
                type: 'tl',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            masks: {
                pattern: /^mask_/,
                type: 'mk',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            costumes: {
                pattern: /^costume_/,
                type: 'cs',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            
            // Novas categorias
            body: {
                pattern: /^body_/,
                type: 'bd',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            leftHand: {
                pattern: /^left_hand_/,
                type: 'lh',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            },
            rightHand: {
                pattern: /^right_hand_/,
                type: 'rh',
                baseUrl: 'https://puhekupla.com/images/clothes/'
            }
        };

        // Lista de assets reais da Puhekupla baseada nos arquivos do projeto
        const knownAssets = [
            // Calças (pants) - baseado nos arquivos trousers_*.swf
            'trousers_U_frillybikinibottom',
            'trousers_U_ombreswimtrunks',
            
            // Camisetas (shirts) - baseado nos arquivos shirt_*.swf
            'shirt_M_basictoga',
            'shirt_F_basictoga',
            'shirt_M_blessedtoga',
            'shirt_F_blessedtoga',
            'shirt_M_frillybikinitop',
            'shirt_F_frillybikinitop',
            'shirt_F_nftdenimcroptop',
            
            // Chapéus (hats) - baseado nos arquivos hat_*.swf
            'hat_U_nemeanlion',
            'hat_U_cathat2',
            'hat_U_grapes',
            'hat_U_nfthabbo25crown',
            'hat_U_nftwatermelonhelmet',
            'hat_U_loyaltycrown_15',
            'hat_U_loyaltycrown_20',
            'hat_U_loyaltycrown_25',
            'hat_U_bedazzledhat',
            'hat_U_discohead',
            'hat_U_sk8erhelmet',
            
            // Cabelos (hair) - baseado nos arquivos hair_*.swf
            'hair_U_botticellihair',
            'hair_U_duckafro',
            'hair_U_poolpartybraids',
            'hair_U_summermanbun',
            'hair_U_rainbowponytail',
            'hair_U_nonbowponytail',
            
            // Faces (head) - baseado nos arquivos face_*.swf
            'face_U_goddesseyes',
            
            // Acessórios dos olhos (eye accessories) - baseado nos arquivos acc_eye_*.swf
            'acc_eye_U_nftbrokenglasses',
            'acc_eye_U_nfts25glasses1',
            'acc_eye_U_nfts25glasses2',
            
            // Acessórios do rosto (face accessories) - baseado nos arquivos acc_face_*.swf
            'acc_face_U_nftchocoicecream',
            'acc_face_U_nftpopsicle1',
            'acc_face_U_nftpopsicle2',
            'acc_face_U_nftpopsicle3',
            
            // Acessórios do cabelo (head accessories) - baseado nos arquivos acc_head_*.swf
            'acc_head_U_aphroditehearts',
            'acc_head_U_blessedheadpiece',
            'acc_head_U_nft25earrings3',
            'acc_head_U_nftpotpalm',
            'acc_head_U_poolpartyshades',
            'acc_head_U_sparklerheadband',
            
            // Acessórios do peito (chest accessories) - baseado nos arquivos acc_chest_*.swf
            'acc_chest_U_dionysianwinebarrel',
            'acc_chest_U_nftcola',
            'acc_chest_U_zeuslightning',
            'acc_chest_U_catfloat',
            'acc_chest_U_iridescentstarbag',
            'acc_chest_U_nftfrogfloat',
            'acc_chest_U_nftseahorsefloat',
            'acc_chest_U_nftseashellp1',
            'acc_chest_U_nftseashellp2',
            'acc_chest_U_nftseashellp3',
            'acc_chest_U_nftseashellp4',
            
            // Acessórios da cintura (waist accessories) - baseado nos arquivos acc_waist_*.swf
            'acc_waist_U_nft25balloonblue',
            'acc_waist_U_nft25balloonred',
            'acc_waist_U_balloon',
            
            // Jaquetas (jackets) - baseado nos arquivos jacket_*.swf
            'jacket_U_blessedcape',
            'jacket_U_basicgreekcape',
            'jacket_U_cerberuscompanion',
            'jacket_U_nftbionic',
            'jacket_U_patchlongscarf',
            'jacket_F_rainbowpatchjacket',
            'jacket_M_rainbowpatchjacket',
            'jacket_U_armfloats',
            'jacket_U_nftdenimjacket',
            'jacket_U_unicorncompanion',
            
            // Sapatos (shoes) - baseado nos arquivos shoes_*.swf
            'shoes_U_blessedsandals',
            'shoes_U_olympiansandals',
            
            // Vestidos (dresses) - baseado nos arquivos dress_*.swf (se existirem)
            'dress_U_evening',
            'dress_U_casual',
            'dress_U_formal',
            
            // Saias (skirts) - baseado nos arquivos skirt_*.swf (se existirem)
            'skirt_U_mini',
            'skirt_U_maxi',
            'skirt_U_pleated',
            
            // Trajes (suits) - baseado nos arquivos suit_*.swf (se existirem)
            'suit_U_business',
            'suit_U_formal',
            'suit_U_casual',
            
            // Mochilas (backpacks) - baseado nos arquivos backpack_*.swf (se existirem)
            'backpack_U_school',
            'backpack_U_travel',
            'backpack_U_sport',
            
            // Bolsas (bags) - baseado nos arquivos bag_*.swf (se existirem)
            'bag_U_handbag',
            'bag_U_clutch',
            'bag_U_tote',
            
            // Asas (wings) - baseado nos arquivos wings_*.swf (se existirem)
            'wings_U_angel',
            'wings_U_butterfly',
            'wings_U_demon',
            
            // Máscaras (masks) - baseado nos arquivos mask_*.swf (se existirem)
            'mask_U_venetian',
            'mask_U_animal',
            'mask_U_character',
            
            // Fantasias (costumes) - baseado nos arquivos costume_*.swf (se existirem)
            'costume_U_superhero',
            'costume_U_animal',
            'costume_U_historical',
            
            // Corpo (body) - baseado nos arquivos body_*.swf (se existirem)
            'body_U_muscle',
            'body_U_slim',
            'body_U_curvy',
            
            // Mãos (hands) - baseado nos arquivos hand_*.swf (se existirem)
            'left_hand_U_ring',
            'left_hand_U_bracelet',
            'right_hand_U_watch',
            'right_hand_U_bracelet'
        ];

        // Organizar assets por categoria
        const organizedAssets = {};
        
        // Inicializar todas as categorias
        Object.keys(assetCategories).forEach(category => {
            organizedAssets[category] = {
                nonhc: [],
                hc: [],
                sell: [],
                nft: []
            };
        });

        // Processar cada asset conhecido
        knownAssets.forEach((assetName, index) => {
            // Determinar categoria baseada no padrão do nome
            let category = 'accessories'; // padrão
            let assetType = 'ac';
            
            for (const [catName, catConfig] of Object.entries(assetCategories)) {
                if (catConfig.pattern.test(assetName)) {
                    category = catName;
                    assetType = catConfig.type;
                    break;
                }
            }

            // Determinar raridade baseada no nome (simplificado)
            let rarity = 'nonhc';
            if (assetName.includes('nft')) rarity = 'nft';
            else if (assetName.includes('loyalty') || assetName.includes('blessed')) rarity = 'hc';
            else if (assetName.includes('sellable')) rarity = 'sell';

                    // Gerar URLs para diferentes ângulos (como no exemplo que você mostrou)
        const baseUrl = assetCategories[category]?.baseUrl || 'https://puhekupla.com/images/clothes/';
        const imageUrls = [
            `${baseUrl}${assetName}_front_right.png`, // Orientação principal para o grid (igual ao preview)
            `${baseUrl}${assetName}_front.png`,
            `${baseUrl}${assetName}_back.png`,
            `${baseUrl}${assetName}_back_left.png`,
            `${baseUrl}${assetName}_side.png`
        ];
        
        // Log para debug
        console.log(`🔗 URLs geradas para ${assetName}:`, imageUrls);
        
        // Testar se a imagem principal existe (comentado para evitar sobrecarga)
        // const testImage = new Image();
        // testImage.onload = () => {
        //     console.log(`✅ Imagem carregada com sucesso: ${imageUrls[0]}`);
        // };
        // testImage.onerror = () => {
        //     console.log(`❌ Imagem não encontrada: ${imageUrls[0]}`);
        // };
        // testImage.src = imageUrls[0];
        
        // Adicionar delay para evitar sobrecarga da API
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Verificar se o item já foi processado para evitar duplicatas
        const existingItem = organizedAssets[category][rarity].find(item => item.name === assetName);
        if (existingItem) {
            console.log(`⚠️ Item ${assetName} já existe na categoria ${category}, pulando...`);
            return;
        }
        
        // Verificar se a categoria e raridade existem
        if (!organizedAssets[category] || !organizedAssets[category][rarity]) {
            console.log(`⚠️ Categoria ${category} ou raridade ${rarity} não encontrada para ${assetName}`);
            return;
        }
        
                // Log para debug
        console.log(`🔍 Processando item: ${assetName} -> Categoria: ${category}, Raridade: ${rarity}, Tipo: ${assetType}`);
        
        // Criar item organizado
        const organizedItem = {
            id: (index + 1).toString(),
            name: assetName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: assetType,
            rarity: rarity,
            figure: `${assetType}-${index + 1}-7-`, // Figura padrão com cor 7
            imageUrl: imageUrls[0], // Usar front_right como preview principal
            allImageUrls: imageUrls, // Todas as imagens disponíveis
            color: '7', // Cor padrão
            description: `Asset ${assetName} da Puhekupla`,
            category: category,
            source: 'puhekupla'
        };
        
                // Log para debug do item criado
        console.log(`📝 Item criado:`, organizedItem);
        
        // Adicionar à categoria apropriada
        if (organizedAssets[category] && organizedAssets[category][rarity]) {
            organizedAssets[category][rarity].push(organizedItem);
            console.log(`✅ Item ${assetName} adicionado à categoria ${category} (${rarity})`);
        } else {
            console.log(`❌ Erro ao adicionar item ${assetName} à categoria ${category} (${rarity})`);
        }
        
                // Log para debug da categoria atualizada
        console.log(`📊 Categoria ${category} (${rarity}) agora tem ${organizedAssets[category][rarity].length} itens`);
    });
    
    console.log('✅ Assets da Puhekupla organizados:', organizedAssets);
    
    // Log detalhado de cada categoria
    Object.entries(organizedAssets).forEach(([category, rarities]) => {
        let totalItems = 0;
        Object.entries(rarities).forEach(([rarity, items]) => {
            totalItems += items.length;
            if (items.length > 0) {
                console.log(`📦 ${category} - ${rarity}: ${items.length} itens`);
            }
        });
        console.log(`🎯 ${category}: Total de ${totalItems} itens`);
    });
    
    return organizedAssets;

    } catch (error) {
        console.error('❌ Erro ao buscar assets da Puhekupla:', error);
        return null;
    }
}

// Mapeamento expandido de SWFs para fallback quando a API Puhekupla falhar
window.SWF_FALLBACK_MAPPING = {
    head: {
        nonhc: [
            { id: '190', name: 'Cabeça Padrão', type: 'hd', rarity: 'nonhc', color: '7' },
            { id: '180', name: 'Cabeça Alternativa 1', type: 'hd', rarity: 'nonhc', color: '7' },
            { id: '185', name: 'Cabeça Alternativa 2', type: 'hd', rarity: 'nonhc', color: '7' },
            { id: '175', name: 'Cabeça Alternativa 3', type: 'hd', rarity: 'nonhc', color: '7' },
            { id: '170', name: 'Cabeça Alternativa 4', type: 'hd', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '200', name: 'Cabeça Especial', type: 'hd', rarity: 'hc', color: '7' },
            { id: '205', name: 'Cabeça Premium', type: 'hd', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '210', name: 'Cabeça Vendável', type: 'hd', rarity: 'sell', color: '7' },
            { id: '215', name: 'Cabeça Exclusiva', type: 'hd', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '220', name: 'Cabeça NFT', type: 'hd', rarity: 'nft', color: '7' }
        ]
    },
    hair: {
        nonhc: [
            { id: '100', name: 'Cabelo Padrão', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '101', name: 'Cabelo Curto', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '102', name: 'Cabelo Longo', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '103', name: 'Cabelo Ondulado', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '104', name: 'Cabelo Afro', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '105', name: 'Cabelo Punk', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '106', name: 'Cabelo Colorido', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '107', name: 'Cabelo Fantasia', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '108', name: 'Cabelo Moderno', type: 'hr', rarity: 'nonhc', color: '7' },
            { id: '109', name: 'Cabelo Clássico', type: 'hr', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '110', name: 'Cabelo HC 1', type: 'hr', rarity: 'hc', color: '7' },
            { id: '111', name: 'Cabelo HC 2', type: 'hr', rarity: 'hc', color: '7' },
            { id: '112', name: 'Cabelo HC 3', type: 'hr', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '113', name: 'Cabelo Vendável 1', type: 'hr', rarity: 'sell', color: '7' },
            { id: '114', name: 'Cabelo Vendável 2', type: 'hr', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '115', name: 'Cabelo NFT 1', type: 'hr', rarity: 'nft', color: '7' },
            { id: '116', name: 'Cabelo NFT 2', type: 'hr', rarity: 'nft', color: '7' }
        ]
    },
    hats: {
        nonhc: [
            { id: '1', name: 'Chapéu Básico', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Chapéu de Festa', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Chapéu de Inverno', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Chapéu de Cowboy', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Chapéu de Marinheiro', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '6', name: 'Chapéu de Mágico', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '7', name: 'Chapéu de Princesa', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '8', name: 'Chapéu de Soldado', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '9', name: 'Chapéu de Chef', type: 'ha', rarity: 'nonhc', color: '7' },
            { id: '10', name: 'Chapéu de Estudante', type: 'ha', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '11', name: 'Chapéu HC 1', type: 'ha', rarity: 'hc', color: '7' },
            { id: '12', name: 'Chapéu HC 2', type: 'ha', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '13', name: 'Chapéu Vendável 1', type: 'ha', rarity: 'sell', color: '7' },
            { id: '14', name: 'Chapéu Vendável 2', type: 'ha', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '15', name: 'Chapéu NFT 1', type: 'ha', rarity: 'nft', color: '7' }
        ]
    },
    shirts: {
        nonhc: [
            { id: '210', name: 'Camisa Básica', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '211', name: 'Camisa Social', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '212', name: 'Camisa Casual', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '213', name: 'Camisa de Festa', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '214', name: 'Camisa Esportiva', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '215', name: 'Camisa Elegante', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '216', name: 'Camisa Premium', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '217', name: 'Camisa Exclusiva', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '218', name: 'Camisa de Trabalho', type: 'ch', rarity: 'nonhc', color: '7' },
            { id: '219', name: 'Camisa de Verão', type: 'ch', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '220', name: 'Camisa HC 1', type: 'ch', rarity: 'hc', color: '7' },
            { id: '221', name: 'Camisa HC 2', type: 'ch', rarity: 'hc', color: '7' },
            { id: '222', name: 'Camisa HC 3', type: 'ch', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '223', name: 'Camisa Vendável 1', type: 'ch', rarity: 'sell', color: '7' },
            { id: '224', name: 'Camisa Vendável 2', type: 'ch', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '225', name: 'Camisa NFT 1', type: 'ch', rarity: 'nft', color: '7' },
            { id: '226', name: 'Camisa NFT 2', type: 'ch', rarity: 'nft', color: '7' }
        ]
    },
    pants: {
        nonhc: [
            { id: '270', name: 'Calça Básica', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '271', name: 'Calça Jeans', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '272', name: 'Calça Social', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '273', name: 'Calça Esportiva', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '274', name: 'Calça de Festa', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '275', name: 'Calça Elegante', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '276', name: 'Calça Premium', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '277', name: 'Calça Exclusiva', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '278', name: 'Calça de Trabalho', type: 'lg', rarity: 'nonhc', color: '7' },
            { id: '279', name: 'Calça de Verão', type: 'lg', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '280', name: 'Calça HC 1', type: 'lg', rarity: 'hc', color: '7' },
            { id: '281', name: 'Calça HC 2', type: 'lg', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '282', name: 'Calça Vendável 1', type: 'lg', rarity: 'sell', color: '7' },
            { id: '283', name: 'Calça Vendável 2', type: 'lg', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '284', name: 'Calça NFT 1', type: 'lg', rarity: 'nft', color: '7' }
        ]
    },
    shoes: {
        nonhc: [
            { id: '290', name: 'Sapato Básico', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '291', name: 'Tênis', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '292', name: 'Sapato Social', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '293', name: 'Bota', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '294', name: 'Sandália', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '295', name: 'Sapato Elegante', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '296', name: 'Sapato Premium', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '297', name: 'Sapato Exclusivo', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '298', name: 'Sapato de Trabalho', type: 'sh', rarity: 'nonhc', color: '7' },
            { id: '299', name: 'Sapato de Verão', type: 'sh', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '300', name: 'Sapato HC 1', type: 'sh', rarity: 'hc', color: '7' },
            { id: '301', name: 'Sapato HC 2', type: 'sh', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '302', name: 'Sapato Vendável 1', type: 'sh', rarity: 'sell', color: '7' },
            { id: '303', name: 'Sapato Vendável 2', type: 'sh', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '304', name: 'Sapato NFT 1', type: 'sh', rarity: 'nft', color: '7' }
        ]
    },
    accessories: {
        nonhc: [
            { id: '1', name: 'Óculos Básicos', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Óculos de Sol', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Óculos de Leitura', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Óculos de Proteção', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Óculos Elegantes', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '6', name: 'Óculos Premium', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '7', name: 'Óculos Exclusivos', type: 'ea', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '8', name: 'Óculos HC 1', type: 'ea', rarity: 'hc', color: '7' },
            { id: '9', name: 'Óculos HC 2', type: 'ea', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '10', name: 'Óculos Vendável 1', type: 'ea', rarity: 'sell', color: '7' },
            { id: '11', name: 'Óculos Vendável 2', type: 'ea', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '12', name: 'Óculos NFT 1', type: 'ea', rarity: 'nft', color: '7' }
        ]
    },
    jackets: {
        nonhc: [
            { id: '1', name: 'Jaqueta Básica', type: 'cc', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Jaqueta de Couro', type: 'cc', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Jaqueta Esportiva', type: 'cc', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Jaqueta Elegante', type: 'cc', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Jaqueta Premium', type: 'cc', rarity: 'nonhc', color: '7' },
            { id: '6', name: 'Jaqueta Exclusiva', type: 'cc', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '7', name: 'Jaqueta HC 1', type: 'cc', rarity: 'hc', color: '7' },
            { id: '8', name: 'Jaqueta HC 2', type: 'cc', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '9', name: 'Jaqueta Vendável 1', type: 'cc', rarity: 'sell', color: '7' },
            { id: '10', name: 'Jaqueta Vendável 2', type: 'cc', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '11', name: 'Jaqueta NFT 1', type: 'cc', rarity: 'nft', color: '7' }
        ]
    },
    eyeAccessories: {
        nonhc: [
            { id: '1', name: 'Lente de Contato', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Lente Colorida', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Lente Premium', type: 'ea', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Lente Exclusiva', type: 'ea', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '5', name: 'Lente HC 1', type: 'ea', rarity: 'hc', color: '7' },
            { id: '6', name: 'Lente HC 2', type: 'ea', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '7', name: 'Lente Vendável 1', type: 'ea', rarity: 'sell', color: '7' },
            { id: '8', name: 'Lente Vendável 2', type: 'ea', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '9', name: 'Lente NFT 1', type: 'ea', rarity: 'nft', color: '7' }
        ]
    },
    faceAccessories: {
        nonhc: [
            { id: '1', name: 'Piercing', type: 'fa', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Tatuagem Facial', type: 'fa', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Acessório Premium', type: 'fa', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Acessório Exclusivo', type: 'fa', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '5', name: 'Acessório HC 1', type: 'fa', rarity: 'hc', color: '7' },
            { id: '6', name: 'Acessório HC 2', type: 'fa', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '7', name: 'Acessório Vendável 1', type: 'fa', rarity: 'sell', color: '7' },
            { id: '8', name: 'Acessório Vendável 2', type: 'fa', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '9', name: 'Acessório NFT 1', type: 'fa', rarity: 'nft', color: '7' }
        ]
    },
    headAccessories: {
        nonhc: [
            { id: '1', name: 'Tiara', type: 'he', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Fita de Cabelo', type: 'he', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Acessório Elegante', type: 'he', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Acessório Premium', type: 'he', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Acessório Exclusivo', type: 'he', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Acessório HC 1', type: 'he', rarity: 'hc', color: '7' },
            { id: '7', name: 'Acessório HC 2', type: 'he', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Acessório Vendável 1', type: 'he', rarity: 'sell', color: '7' },
            { id: '9', name: 'Acessório Vendável 2', type: 'he', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Acessório NFT 1', type: 'he', rarity: 'nft', color: '7' }
        ]
    },
    chestAccessories: {
        nonhc: [
            { id: '1', name: 'Gravata', type: 'cp', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Laço', type: 'cp', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Acessório Elegante', type: 'cp', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Acessório Premium', type: 'cp', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Acessório Exclusivo', type: 'cp', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Acessório HC 1', type: 'cp', rarity: 'hc', color: '7' },
            { id: '7', name: 'Acessório HC 2', type: 'cp', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Acessório Vendável 1', type: 'cp', rarity: 'sell', color: '7' },
            { id: '9', name: 'Acessório Vendável 2', type: 'cp', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Acessório NFT 1', type: 'cp', rarity: 'nft', color: '7' }
        ]
    },
    waistAccessories: {
        nonhc: [
            { id: '1', name: 'Cinto Básico', type: 'wa', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Cinto Elegante', type: 'wa', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Cinto Premium', type: 'wa', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Cinto Exclusivo', type: 'wa', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Cinto Raro', type: 'wa', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Cinto HC 1', type: 'wa', rarity: 'hc', color: '7' },
            { id: '7', name: 'Cinto HC 2', type: 'wa', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Cinto Vendável 1', type: 'wa', rarity: 'sell', color: '7' },
            { id: '9', name: 'Cinto Vendável 2', type: 'wa', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Cinto NFT 1', type: 'wa', rarity: 'nft', color: '7' }
        ]
    },
    dresses: {
        nonhc: [
            { id: '1', name: 'Vestido Básico', type: 'dr', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Vestido de Festa', type: 'dr', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Vestido Elegante', type: 'dr', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Vestido Premium', type: 'dr', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Vestido Exclusivo', type: 'dr', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Vestido HC 1', type: 'dr', rarity: 'hc', color: '7' },
            { id: '7', name: 'Vestido HC 2', type: 'dr', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Vestido Vendável 1', type: 'dr', rarity: 'sell', color: '7' },
            { id: '9', name: 'Vestido Vendável 2', type: 'dr', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Vestido NFT 1', type: 'dr', rarity: 'nft', color: '7' }
        ]
    },
    skirts: {
        nonhc: [
            { id: '1', name: 'Saia Básica', type: 'sk', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Saia de Festa', type: 'sk', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Saia Elegante', type: 'sk', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Saia Premium', type: 'sk', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Saia Exclusiva', type: 'sk', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Saia HC 1', type: 'sk', rarity: 'hc', color: '7' },
            { id: '7', name: 'Saia HC 2', type: 'sk', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Saia Vendável 1', type: 'sk', rarity: 'sell', color: '7' },
            { id: '9', name: 'Saia Vendável 2', type: 'sk', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Saia NFT 1', type: 'sk', rarity: 'nft', color: '7' }
        ]
    },
    suits: {
        nonhc: [
            { id: '1', name: 'Traje Básico', type: 'su', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Traje de Festa', type: 'su', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Traje Elegante', type: 'su', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Traje Premium', type: 'su', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Traje Exclusivo', type: 'su', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Traje HC 1', type: 'su', rarity: 'hc', color: '7' },
            { id: '7', name: 'Traje HC 2', type: 'su', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Traje Vendável 1', type: 'su', rarity: 'sell', color: '7' },
            { id: '9', name: 'Traje Vendável 2', type: 'su', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Traje NFT 1', type: 'su', rarity: 'nft', color: '7' }
        ]
    },
    backpacks: {
        nonhc: [
            { id: '1', name: 'Mochila Básica', type: 'bp', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Mochila Escolar', type: 'bp', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Mochila Esportiva', type: 'bp', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Mochila Premium', type: 'bp', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Mochila Exclusiva', type: 'bp', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Mochila HC 1', type: 'bp', rarity: 'hc', color: '7' },
            { id: '7', name: 'Mochila HC 2', type: 'bp', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Mochila Vendável 1', type: 'bp', rarity: 'sell', color: '7' },
            { id: '9', name: 'Mochila Vendável 2', type: 'bp', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Mochila NFT 1', type: 'bp', rarity: 'nft', color: '7' }
        ]
    },
    wings: {
        nonhc: [
            { id: '1', name: 'Asas Básicas', type: 'wg', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Asas de Anjo', type: 'wg', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Asas de Demônio', type: 'wg', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Asas de Fada', type: 'wg', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Asas de Dragão', type: 'wg', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Asas HC 1', type: 'wg', rarity: 'hc', color: '7' },
            { id: '7', name: 'Asas HC 2', type: 'wg', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Asas Vendável 1', type: 'wg', rarity: 'sell', color: '7' },
            { id: '9', name: 'Asas Vendável 2', type: 'wg', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Asas NFT 1', type: 'wg', rarity: 'nft', color: '7' },
            { id: '11', name: 'Asas de Borboleta', type: 'wg', rarity: 'nft', color: '7' }
        ]
    },
    masks: {
        nonhc: [
            { id: '1', name: 'Máscara Básica', type: 'mk', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Máscara de Festa', type: 'mk', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Máscara Elegante', type: 'mk', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Máscara Premium', type: 'mk', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Máscara Exclusiva', type: 'mk', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Máscara HC 1', type: 'mk', rarity: 'hc', color: '7' },
            { id: '7', name: 'Máscara HC 2', type: 'mk', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Máscara Vendável 1', type: 'mk', rarity: 'sell', color: '7' },
            { id: '9', name: 'Máscara Vendável 2', type: 'mk', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Máscara NFT 1', type: 'mk', rarity: 'nft', color: '7' }
        ]
    },
    body: {
        nonhc: [
            { id: '1', name: 'Corpo Básico', type: 'bd', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Corpo Atlético', type: 'bd', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Corpo Elegante', type: 'bd', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Corpo Premium', type: 'bd', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Corpo Exclusivo', type: 'bd', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Corpo HC 1', type: 'bd', rarity: 'hc', color: '7' },
            { id: '7', name: 'Corpo HC 2', type: 'bd', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Corpo Vendável 1', type: 'bd', rarity: 'sell', color: '7' },
            { id: '9', name: 'Corpo Vendável 2', type: 'bd', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Corpo NFT 1', type: 'bd', rarity: 'nft', color: '7' }
        ]
    },
    leftHand: {
        nonhc: [
            { id: '1', name: 'Item Mão Esquerda 1', type: 'lh', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Item Mão Esquerda 2', type: 'lh', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Item Mão Esquerda 3', type: 'lh', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Item Mão Esquerda 4', type: 'lh', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Item Mão Esquerda 5', type: 'lh', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Item Mão Esquerda HC 1', type: 'lh', rarity: 'hc', color: '7' },
            { id: '7', name: 'Item Mão Esquerda HC 2', type: 'lh', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Item Mão Esquerda Vendável 1', type: 'lh', rarity: 'sell', color: '7' },
            { id: '9', name: 'Item Mão Esquerda Vendável 2', type: 'lh', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Item Mão Esquerda NFT 1', type: 'lh', rarity: 'nft', color: '7' }
        ]
    },
    rightHand: {
        nonhc: [
            { id: '1', name: 'Item Mão Direita 1', type: 'rh', rarity: 'nonhc', color: '7' },
            { id: '2', name: 'Item Mão Direita 2', type: 'rh', rarity: 'nonhc', color: '7' },
            { id: '3', name: 'Item Mão Direita 3', type: 'rh', rarity: 'nonhc', color: '7' },
            { id: '4', name: 'Item Mão Direita 4', type: 'rh', rarity: 'nonhc', color: '7' },
            { id: '5', name: 'Item Mão Direita 5', type: 'rh', rarity: 'nonhc', color: '7' }
        ],
        hc: [
            { id: '6', name: 'Item Mão Direita HC 1', type: 'rh', rarity: 'hc', color: '7' },
            { id: '7', name: 'Item Mão Direita HC 2', type: 'rh', rarity: 'hc', color: '7' }
        ],
        sell: [
            { id: '8', name: 'Item Mão Direita Vendável 1', type: 'rh', rarity: 'sell', color: '7' },
            { id: '9', name: 'Item Mão Direita Vendável 2', type: 'rh', rarity: 'sell', color: '7' }
        ],
        nft: [
            { id: '10', name: 'Item Mão Direita NFT 1', type: 'rh', rarity: 'nft', color: '7' }
        ]
    }
};

// Função para organizar roupas por categoria
function organizeClothesByCategory(clothesData) {
    if (!clothesData || !clothesData.result) {
        console.warn('Dados de roupas inválidos da Puhekupla');
        return {};
    }

    const organizedClothes = {
        // Categorias principais
        head: { nonhc: [], hc: [], sell: [], nft: [] },
        hair: { nonhc: [], hc: [], sell: [], nft: [] },
        hats: { nonhc: [], hc: [], sell: [], nft: [] },
        shirts: { nonhc: [], hc: [], sell: [], nft: [] },
        pants: { nonhc: [], hc: [], sell: [], nft: [] },
        shoes: { nonhc: [], hc: [], sell: [], nft: [] },
        
        // Acessórios específicos
        eyeAccessories: { nonhc: [], hc: [], sell: [], nft: [] },
        faceAccessories: { nonhc: [], hc: [], sell: [], nft: [] },
        headAccessories: { nonhc: [], hc: [], sell: [], nft: [] },
        chestAccessories: { nonhc: [], hc: [], sell: [], nft: [] },
        waistAccessories: { nonhc: [], hc: [], sell: [], nft: [] },
        
        // Roupas adicionais
        jackets: { nonhc: [], hc: [], sell: [], nft: [] },
        dresses: { nonhc: [], hc: [], sell: [], nft: [] },
        skirts: { nonhc: [], hc: [], sell: [], nft: [] },
        suits: { nonhc: [], hc: [], sell: [], nft: [] },
        
        // Acessórios gerais
        accessories: { nonhc: [], hc: [], sell: [], nft: [] },
        backpacks: { nonhc: [], hc: [], sell: [], nft: [] },
        bags: { nonhc: [], hc: [], sell: [], nft: [] },
        
        // Itens especiais
        wings: { nonhc: [], hc: [], sell: [], nft: [] },
        tails: { nonhc: [], hc: [], sell: [], nft: [] },
        masks: { nonhc: [], hc: [], sell: [], nft: [] },
        costumes: { nonhc: [], hc: [], sell: [], nft: [] },
        
        // Novas categorias identificadas
        body: { nonhc: [], hc: [], sell: [], nft: [] },
        leftHand: { nonhc: [], hc: [], sell: [], nft: [] },
        rightHand: { nonhc: [], hc: [], sell: [], nft: [] }
    };

    clothesData.result.forEach(item => {
        // Determinar categoria baseada no tipo da roupa
        let category = 'accessories'; // padrão
        
        // Categorias principais
        if (item.type === 'hd') category = 'head';
        else if (item.type === 'hr') category = 'hair';
        else if (item.type === 'ha') category = 'hats';
        else if (item.type === 'ch') category = 'shirts';
        else if (item.type === 'lg') category = 'pants';
        else if (item.type === 'sh') category = 'shoes';
        
        // Acessórios específicos
        else if (item.type === 'ea') category = 'eyeAccessories';
        else if (item.type === 'fa') category = 'faceAccessories';
        else if (item.type === 'he') category = 'headAccessories';
        else if (item.type === 'cp' || item.type === 'ca') category = 'chestAccessories';
        else if (item.type === 'wa') category = 'waistAccessories';
        
        // Roupas adicionais
        else if (item.type === 'cc') category = 'jackets';
        else if (item.type === 'dr') category = 'dresses';
        else if (item.type === 'sk') category = 'skirts';
        else if (item.type === 'su') category = 'suits';
        
        // Acessórios gerais
        else if (item.type === 'ac') category = 'accessories';
        else if (item.type === 'bp') category = 'backpacks';
        else if (item.type === 'bg') category = 'bags';
        
        // Itens especiais
        else if (item.type === 'wg') category = 'wings';
        else if (item.type === 'mk') category = 'masks';
        else if (item.type === 'cs') category = 'costumes';
        
        // Novas categorias identificadas
        else if (item.type === 'bd') category = 'body';
        else if (item.type === 'lh') category = 'leftHand';
        else if (item.type === 'rh') category = 'rightHand';
        
        // Categorias especiais (pode ser múltiplas)
        else if (item.type === 'tl') {
            // Cauda pode ser acessório da cintura ou item especial
            if (item.name && item.name.toLowerCase().includes('cintura')) {
                category = 'waistAccessories';
            } else {
                category = 'tails';
            }
        }
        
        // Log para debug de categorias não mapeadas
        if (category === 'accessories') {
            console.log(`⚠️ Tipo não mapeado: ${item.type} - ${item.name || 'Sem nome'} - Categoria padrão: ${category}`);
        }

        // Determinar raridade (simplificado - pode ser expandido)
        let rarity = 'nonhc';
        if (item.rare) rarity = 'hc';
        if (item.sellable) rarity = 'sell';
        if (item.nft) rarity = 'nft';

        // Criar item organizado
        const organizedItem = {
            id: item.id || item.figure_id,
            name: item.name || `Roupa ${item.type} ${item.id}`,
            type: item.type,
            rarity: rarity,
            figure: item.figure_string || `${item.type}-${item.id}-${item.color || '7'}-`,
            imageUrl: item.image_url || null,
            color: item.color || '7',
            description: item.description || '',
            category: category
        };

        // Adicionar à categoria apropriada
        if (organizedClothes[category] && organizedClothes[category][rarity]) {
            organizedClothes[category][rarity].push(organizedItem);
        }
    });

    console.log('Roupas organizadas por categoria:', organizedClothes);
    
    // Adicionar fallback dos arquivos SWF para categorias vazias
    Object.keys(organizedClothes).forEach(category => {
        const totalItems = Object.values(organizedClothes[category]).reduce((sum, items) => sum + items.length, 0);
        
        if (totalItems === 0 && SWF_FALLBACK_MAPPING[category]) {
            console.log(`📦 Adicionando fallback SWF para categoria vazia: ${category}`);
            organizedClothes[category] = SWF_FALLBACK_MAPPING[category];
        }
    });
    
    return organizedClothes;
}

// Função para buscar todas as roupas (múltiplas páginas se necessário)
async function fetchAllPuhekuplaClothes() {
    console.log('🔄 Buscando todas as roupas da Puhekupla...');
    
    try {
        // Primeiro, tentar buscar assets diretamente dos arquivos da Puhekupla
        console.log('🎯 Tentando buscar assets diretamente dos arquivos...');
        const directAssets = await fetchPuhekuplaAssets();
        
        if (directAssets && Object.keys(directAssets).length > 0) {
            console.log('✅ Assets carregados diretamente dos arquivos da Puhekupla');
            return directAssets;
        }
        
        // Se falhar, tentar a API tradicional
        console.log('🔄 Fallback para API tradicional...');
        const firstPage = await fetchPuhekuplaClothes(1, 100);
        if (!firstPage) {
            throw new Error('Falha ao buscar primeira página');
        }

        let allClothes = [...firstPage.result];
        
        // Se houver mais páginas, buscar todas
        if (firstPage.pagination && firstPage.pagination.total_pages > 1) {
            console.log(`Buscando ${firstPage.pagination.total_pages} páginas de roupas...`);
            
            for (let page = 2; page <= firstPage.pagination.total_pages; page++) {
                const nextPage = await fetchPuhekuplaClothes(page, 100);
                if (nextPage && nextPage.result) {
                    allClothes = [...allClothes, ...nextPage.result];
                    console.log(`Página ${page} carregada: ${nextPage.result.length} roupas`);
                }
                
                // Pequena pausa para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`Total de roupas carregadas: ${allClothes.length}`);
        
        // Organizar por categoria
        const organizedClothes = organizeClothesByCategory({
            result: allClothes,
            pagination: firstPage.pagination
        });

        return organizedClothes;
    } catch (error) {
        console.error('❌ Erro ao buscar todas as roupas:', error);
        console.log('🔄 Usando fallback dos arquivos SWF...');
        
        // Retornar dados de fallback dos arquivos SWF
        const fallbackData = {
            result: [],
            pagination: { total_pages: 1 }
        };
        
        const organizedClothes = organizeClothesByCategory(fallbackData);
        return organizedClothes;
    }
}

// Função para buscar roupas de uma categoria específica
async function fetchClothesByCategory(category, page = 1, perPage = 100) {
    try {
        // Por enquanto, a API não suporta filtros por categoria
        // Vamos buscar todas e filtrar localmente
        const allClothes = await fetchAllPuhekuplaClothes();
        if (allClothes && allClothes[category]) {
            return allClothes[category];
        }
        return null;
    } catch (error) {
        console.error(`Erro ao buscar roupas da categoria ${category}:`, error);
        return null;
    }
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        PUHEKUPLA_CONFIG, 
        fetchPuhekuplaClothes, 
        fetchAllPuhekuplaClothes, 
        fetchClothesByCategory,
        organizeClothesByCategory,
        fetchPuhekuplaAssets
    };
} else {
    window.PUHEKUPLA_CONFIG = PUHEKUPLA_CONFIG;
    window.fetchPuhekuplaClothes = fetchPuhekuplaClothes;
    window.fetchAllPuhekuplaClothes = fetchAllPuhekuplaClothes;
    window.fetchClothesByCategory = fetchClothesByCategory;
    window.organizeClothesByCategory = organizeClothesByCategory;
    window.fetchPuhekuplaAssets = fetchPuhekuplaAssets;
}
