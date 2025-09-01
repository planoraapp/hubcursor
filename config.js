// Configuração do Editor de Visuais Habbo
// Este arquivo mapeia os arquivos SWF para as categorias do editor

const HABBO_CONFIG = {
    // Configurações gerais
    defaultGender: 'M',
    defaultSize: 'l',
    defaultDirection: 2,
    defaultHeadDirection: 2,
    defaultExpression: 'nrm',
    defaultAction: '',
    
    // Mapeamento de arquivos SWF para categorias
    swfMapping: {
        // Cabeças (hd)
        head: [
            { file: 'hh_human_face.swf', type: 'hd', baseId: '180', count: 30, rarity: 'common' },
            { file: 'face_U_goddesseyes.swf', type: 'hd', baseId: '200', count: 1, rarity: 'rare' },
            { file: 'face_U_nftsmileyface.swf', type: 'hd', baseId: '201', count: 1, rarity: 'nft' },
            { file: 'face_U_nftsmileyface2.swf', type: 'hd', baseId: '202', count: 1, rarity: 'nft' }
        ],
        
        // Cabelos (hr)
        hair: [
            { file: 'hh_human_hair.swf', type: 'hr', baseId: '100', count: 50, rarity: 'common' },
            { file: 'hair_U_botticellihair.swf', type: 'hr', baseId: '150', count: 1, rarity: 'rare' },
            { file: 'hair_U_duckafro.swf', type: 'hr', baseId: '151', count: 1, rarity: 'rare' },
            { file: 'hair_U_summermanbun.swf', type: 'hr', baseId: '152', count: 1, rarity: 'rare' },
            { file: 'hair_U_poolpartybraids.swf', type: 'hr', baseId: '153', count: 1, rarity: 'rare' },
            { file: 'hair_U_nonbowponytail.swf', type: 'hr', baseId: '154', count: 1, rarity: 'rare' },
            { file: 'hair_U_rainbowponytail.swf', type: 'hr', baseId: '155', count: 1, rarity: 'rare' }
        ],
        
        // Chapéus (ha)
        hats: [
            { file: 'hh_human_hats.swf', type: 'ha', baseId: '1', count: 40, rarity: 'common' },
            { file: 'hat_U_nemeanlion.swf', type: 'ha', baseId: '50', count: 1, rarity: 'rare' },
            { file: 'hat_U_cathat2.swf', type: 'ha', baseId: '51', count: 1, rarity: 'rare' },
            { file: 'hat_U_grapes.swf', type: 'ha', baseId: '52', count: 1, rarity: 'rare' },
            { file: 'hat_U_nfthabbo25crown.swf', type: 'ha', baseId: '53', count: 1, rarity: 'nft' },
            { file: 'hat_U_nftwatermelonhelmet.swf', type: 'ha', baseId: '54', count: 1, rarity: 'nft' },
            { file: 'hat_U_loyaltycrown_15.swf', type: 'ha', baseId: '55', count: 1, rarity: 'legendary' },
            { file: 'hat_U_loyaltycrown_20.swf', type: 'ha', baseId: '56', count: 1, rarity: 'legendary' },
            { file: 'hat_U_loyaltycrown_25.swf', type: 'ha', baseId: '57', count: 1, rarity: 'legendary' },
            { file: 'hat_U_bedazzledhat.swf', type: 'ha', baseId: '58', count: 1, rarity: 'rare' },
            { file: 'hat_U_discohead.swf', type: 'ha', baseId: '59', count: 1, rarity: 'rare' },
            { file: 'hat_U_sk8erhelmet.swf', type: 'ha', baseId: '60', count: 1, rarity: 'rare' },
            { file: 'hat_U_cheerbear.swf', type: 'ha', baseId: '61', count: 1, rarity: 'rare' },
            { file: 'hat_U_grumpybear.swf', type: 'ha', baseId: '62', count: 1, rarity: 'rare' },
            { file: 'hat_U_sharebear.swf', type: 'ha', baseId: '63', count: 1, rarity: 'rare' },
            { file: 'hat_U_tenderheart.swf', type: 'ha', baseId: '64', count: 1, rarity: 'rare' }
        ],
        
        // Camisas (ch)
        shirts: [
            { file: 'hh_human_shirt.swf', type: 'ch', baseId: '210', count: 100, rarity: 'common' },
            { file: 'shirt_F_basictoga.swf', type: 'ch', baseId: '310', count: 1, rarity: 'rare' },
            { file: 'shirt_F_blessedtoga.swf', type: 'ch', baseId: '311', count: 1, rarity: 'rare' },
            { file: 'shirt_M_basictoga.swf', type: 'ch', baseId: '312', count: 1, rarity: 'rare' },
            { file: 'shirt_M_blessedtoga.swf', type: 'ch', baseId: '313', count: 1, rarity: 'rare' },
            { file: 'shirt_F_frillybikinitop.swf', type: 'ch', baseId: '314', count: 1, rarity: 'rare' },
            { file: 'shirt_M_frillybikinitop.swf', type: 'ch', baseId: '315', count: 1, rarity: 'rare' },
            { file: 'shirt_F_nftdenimcroptop.swf', type: 'ch', baseId: '316', count: 1, rarity: 'nft' },
            { file: 'shirt_M_nftdenimcroptop.swf', type: 'ch', baseId: '317', count: 1, rarity: 'nft' },
            { file: 'shirt_U_nftbubblebath.swf', type: 'ch', baseId: '318', count: 1, rarity: 'nft' },
            // Adicionar algumas camisas vendáveis para demonstração
            { file: 'shirt_sellable_1.swf', type: 'ch', baseId: '3321', count: 1, rarity: 'sellable' },
            { file: 'shirt_sellable_2.swf', type: 'ch', baseId: '3323', count: 1, rarity: 'sellable' },
            { file: 'shirt_sellable_3.swf', type: 'ch', baseId: '3332', count: 1, rarity: 'sellable' }
        ],
        
        // Calças (lg)
        pants: [
            { file: 'hh_human_leg.swf', type: 'lg', baseId: '270', count: 30, rarity: 'common' },
            { file: 'trousers_U_ombreswimtrunks.swf', type: 'lg', baseId: '300', count: 1, rarity: 'rare' },
            { file: 'trousers_U_frillybikinibottom.swf', type: 'lg', baseId: '301', count: 1, rarity: 'rare' },
            { file: 'trousers_U_nftdenimshorts.swf', type: 'lg', baseId: '302', count: 1, rarity: 'nft' },
            { file: 'trousers_U_sk8ershorts.swf', type: 'lg', baseId: '303', count: 1, rarity: 'rare' }
        ],
        
        // Sapatos (sh)
        shoes: [
            { file: 'hh_human_shoe.swf', type: 'sh', baseId: '290', count: 30, rarity: 'common' },
            { file: 'shoes_U_blessedsandals.swf', type: 'sh', baseId: '320', count: 1, rarity: 'rare' },
            { file: 'shoes_U_olympiansandals.swf', type: 'sh', baseId: '321', count: 1, rarity: 'rare' }
        ],
        
        // Jaquetas (cc)
        jackets: [
            { file: 'jacket_U_blessedcape.swf', type: 'cc', baseId: '1', count: 1, rarity: 'rare' },
            { file: 'jacket_U_basicgreekcape.swf', type: 'cc', baseId: '2', count: 1, rarity: 'rare' },
            { file: 'jacket_U_cerberuscompanion.swf', type: 'cc', baseId: '3', count: 1, rarity: 'rare' },
            { file: 'jacket_U_nftbionic.swf', type: 'cc', baseId: '4', count: 1, rarity: 'nft' },
            { file: 'jacket_U_patchlongscarf.swf', type: 'cc', baseId: '5', count: 1, rarity: 'rare' },
            { file: 'jacket_F_rainbowpatchjacket.swf', type: 'cc', baseId: '6', count: 1, rarity: 'rare' },
            { file: 'jacket_M_rainbowpatchjacket.swf', type: 'cc', baseId: '7', count: 1, rarity: 'rare' },
            { file: 'jacket_U_armfloats.swf', type: 'cc', baseId: '8', count: 1, rarity: 'rare' },
            { file: 'jacket_U_nftdenimjacket.swf', type: 'cc', baseId: '9', count: 1, rarity: 'nft' },
            { file: 'jacket_U_unicorncompanion.swf', type: 'cc', baseId: '10', count: 1, rarity: 'rare' }
        ],
        
        // Acessórios dos olhos (ea)
        eyeAccessories: [
            { file: 'hh_human_acc_eye.swf', type: 'ea', baseId: '1', count: 20, rarity: 'common' },
            { file: 'acc_eye_U_nftbrokenglasses.swf', type: 'ea', baseId: '25', count: 1, rarity: 'nft' },
            { file: 'acc_eye_U_nfts25glasses1.swf', type: 'ea', baseId: '26', count: 1, rarity: 'nft' },
            { file: 'acc_eye_U_nfts25glasses2.swf', type: 'ea', baseId: '27', count: 1, rarity: 'nft' }
        ],
        
        // Acessórios do rosto (fa)
        faceAccessories: [
            { file: 'hh_human_acc_face.swf', type: 'fa', baseId: '1', count: 20, rarity: 'common' },
            { file: 'acc_face_U_nftchocoicecream.swf', type: 'fa', baseId: '25', count: 1, rarity: 'nft' },
            { file: 'acc_face_U_nftpopsicle1.swf', type: 'fa', baseId: '26', count: 1, rarity: 'nft' },
            { file: 'acc_face_U_nftpopsicle2.swf', type: 'fa', baseId: '27', count: 1, rarity: 'nft' },
            { file: 'acc_face_U_nftpopsicle3.swf', type: 'fa', baseId: '28', count: 1, rarity: 'nft' }
        ],
        
        // Acessórios da cabeça (he)
        headAccessories: [
            { file: 'hh_human_acc_head.swf', type: 'he', baseId: '1', count: 20, rarity: 'common' },
            { file: 'acc_head_U_aphroditehearts.swf', type: 'he', baseId: '25', count: 1, rarity: 'rare' },
            { file: 'acc_head_U_blessedheadpiece.swf', type: 'he', baseId: '26', count: 1, rarity: 'rare' },
            { file: 'acc_head_U_nft25earrings3.swf', type: 'he', baseId: '27', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_nftpotpalm.swf', type: 'he', baseId: '28', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_poolpartyshades.swf', type: 'he', baseId: '29', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_sparklerheadband.swf', type: 'he', baseId: '30', count: 1, rarity: 'rare' },
            { file: 'acc_head_U_nftbubblebath.swf', type: 'he', baseId: '31', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_nftpiranha.swf', type: 'he', baseId: '32', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_nftsun.swf', type: 'he', baseId: '33', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_nftflowershades2.swf', type: 'he', baseId: '34', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_nftflowershades3.swf', type: 'he', baseId: '35', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_nftflowershades4.swf', type: 'he', baseId: '36', count: 1, rarity: 'nft' },
            { file: 'acc_head_U_nftflowershades5.swf', type: 'he', baseId: '37', count: 1, rarity: 'nft' }
        ],
        
        // Acessórios do peito (ca)
        chestAccessories: [
            { file: 'hh_human_acc_chest.swf', type: 'ca', baseId: '1', count: 20, rarity: 'common' },
            { file: 'acc_chest_U_dionysianwinebarrel.swf', type: 'ca', baseId: '25', count: 1, rarity: 'rare' },
            { file: 'acc_chest_U_nftcola.swf', type: 'ca', baseId: '26', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_zeuslightning.swf', type: 'ca', baseId: '27', count: 1, rarity: 'rare' },
            { file: 'acc_chest_U_catfloat.swf', type: 'ca', baseId: '28', count: 1, rarity: 'rare' },
            { file: 'acc_chest_U_iridescentstarbag.swf', type: 'ca', baseId: '29', count: 1, rarity: 'rare' },
            { file: 'acc_chest_U_nftfrogfloat.swf', type: 'ca', baseId: '30', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_nftseahorsefloat.swf', type: 'ca', baseId: '31', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_nftseashellp1.swf', type: 'ca', baseId: '32', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_nftseashellp2.swf', type: 'ca', baseId: '33', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_nftseashellp3.swf', type: 'ca', baseId: '34', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_nftseashellp4.swf', type: 'ca', baseId: '35', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_nftbackmonkey.swf', type: 'ca', baseId: '36', count: 1, rarity: 'nft' },
            { file: 'acc_chest_U_sk8board.swf', type: 'ca', baseId: '37', count: 1, rarity: 'rare' }
        ],
        
        // Acessórios da cintura (wa)
        waistAccessories: [
            { file: 'hh_human_acc_waist.swf', type: 'wa', baseId: '1', count: 20, rarity: 'common' },
            { file: 'acc_waist_U_nft25balloonblue.swf', type: 'wa', baseId: '25', count: 1, rarity: 'nft' },
            { file: 'acc_waist_U_nft25balloonred.swf', type: 'wa', baseId: '26', count: 1, rarity: 'nft' },
            { file: 'acc_waist_U_balloon.swf', type: 'wa', baseId: '27', count: 1, rarity: 'rare' }
        ],
        
        // Acessórios de impressão (print)
        printAccessories: [
            { file: 'acc_print_U_nfthabbo25necklace3.swf', type: 'cp', baseId: '1', count: 1, rarity: 'nft' }
        ]
    },
    
    // Configurações de cores
    colorPalettes: {
        skin: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        hair: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99],
        club: [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199]
    },
    
    // Configurações de expressões
    expressions: {
        nrm: { name: 'Normal', icon: 'face_normal.png' },
        sml: { name: 'Feliz', icon: 'face_happy.png' },
        sad: { name: 'Triste', icon: 'face_sad.png' },
        agr: { name: 'Enojado', icon: 'face_angry.png' },
        srp: { name: 'Surpreso', icon: 'face_surprised.png' },
        eyb: { name: 'Dormindo', icon: 'face_sleep.png' },
        spk: { name: 'Falando', icon: 'face_talking.png' }
    },
    
    // Configurações de ações
    actions: {
        '': { name: 'Normal', icon: 'action_normal.png' },
        wlk: { name: 'Andando', icon: 'action_walking.png' },
        lay: { name: 'Deitado', icon: 'action_sleeping.png' },
        sit: { name: 'Sentado', icon: 'action_sit.png' },
        wav: { name: 'Acenando', icon: 'action_wave.png' },
        crr: { name: 'Carregando', icon: 'action_holding.png' },
        drk: { name: 'Bebendo', icon: 'action_drinking.png' }
    },
    
    // Configurações de tamanhos
    sizes: {
        'headonly=1': 'Cabeça',
        'size=s': 'Mini',
        'size=m': 'Normal',
        'size=l': 'Grande'
    },
    
    // Configurações de hotéis
    hotels: [
        { code: 'com.br', name: 'Brasil', flag: '🇧🇷' },
        { code: 'es', name: 'Espanha', flag: '🇪🇸' },
        { code: 'fi', name: 'Finlândia', flag: '🇫🇮' },
        { code: 'it', name: 'Itália', flag: '🇮🇹' },
        { code: 'nl', name: 'Holanda', flag: '🇳🇱' },
        { code: 'de', name: 'Alemanha', flag: '🇩🇪' },
        { code: 'fr', name: 'França', flag: '🇫🇷' },
        { code: 'com', name: 'Internacional', flag: '🌍' },
        { code: 'com.tr', name: 'Turquia', flag: '🇹🇷' }
    ]
};

// Função para gerar dados de roupas baseados na configuração
function generateClothingData() {
    const clothingData = {};
    
    Object.entries(HABBO_CONFIG.swfMapping).forEach(([category, items]) => {
        // Organizar por raridade como no exemplo das camisetas
        clothingData[category] = {
            nonhc: [],    // Roupas normais (não-HC)
            hc: [],       // Roupas de Habbo Club (HC)
            sell: [],     // Roupas vendáveis
            nft: []       // Roupas NFT
        };
        
        items.forEach(item => {
            for (let i = 0; i < item.count; i++) {
                const id = parseInt(item.baseId) + i;
                const clothingItem = {
                    id: id.toString(),
                    name: `${item.file.replace('.swf', '')} ${i + 1}`,
                    type: item.type,
                    rarity: item.rarity,
                    file: item.file
                };
                
                // Categorizar por raridade
                switch (item.rarity) {
                    case 'common':
                        clothingData[category].nonhc.push(clothingItem);
                        break;
                    case 'rare':
                        clothingData[category].hc.push(clothingItem);
                        break;
                    case 'legendary':
                        clothingData[category].hc.push(clothingItem);
                        break;
                    case 'nft':
                        clothingData[category].nft.push(clothingItem);
                        break;
                    case 'sellable':
                        clothingData[category].sell.push(clothingItem);
                        break;
                    default:
                        clothingData[category].nonhc.push(clothingItem);
                }
            }
        });
    });
    
    return clothingData;
}

// Função para obter configuração específica
function getConfig(category, key) {
    return HABBO_CONFIG[category]?.[key] || null;
}

// Função para obter todas as configurações
function getAllConfig() {
    return HABBO_CONFIG;
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HABBO_CONFIG, generateClothingData, getConfig, getAllConfig };
} else {
    window.HABBO_CONFIG = HABBO_CONFIG;
    window.generateClothingData = generateClothingData;
    window.getConfig = getConfig;
    window.getAllConfig = getAllConfig;
}
