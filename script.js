class HabboAvatarEditor {
    constructor() {
        this.currentFigure = {
            hr: '100-7-',         // Hair
            hd: '190-7-',         // Head
            ch: '210-66-',        // Chest
            lg: '270-82-',        // Legs
            sh: '290-80-',        // Shoes
            ha: '',               // Hat
            he: '',               // Hair accessories
            ea: '',               // Eye accessories
            fa: '',               // Face accessories
            cp: '',               // Chest accessories
            cc: '',               // Jacket
            ca: '',               // Chest accessories
            wa: '',               // Waist accessories
            gesture: 'nrm',       // Expression
            actions: [],          // Array de ações (múltiplas ações)
            item: '=0',           // Item in hand
            direction: 2,         // Body direction
            headDirection: 2,     // Head direction
            gender: 'M',          // Gender
            size: 'size=l'        // Size (formato HabboTemplarios)
        };
        
        this.currentCategory = 'head';
        this.currentColor = '7'; // Cor padrão (pele)
        this.clothingData = {};
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando editor...');
        console.log('🔍 Estado inicial das ações:', this.currentFigure.actions);
        
        await this.loadClothingData();
        this.setupEventListeners();
        this.loadColors();
        this.updateAvatar();
        this.updateDirectionIndicators();
        
        // Configurar botões de gênero
        this.setupGenderButtons();
        
        console.log('✅ Editor inicializado');
        console.log('🔍 Estado final das ações:', this.currentFigure.actions);
    }
    
    async loadClothingData() {
        console.log('🔄 Carregando dados de roupas...');
        
        // Priorizar a API da Puhekupla para roupas reais
        if (typeof fetchAllPuhekuplaClothes === 'function') {
            try {
                console.log('🎯 Tentando carregar roupas da API Puhekupla...');
                const puhekuplaSuccess = await this.loadPuhekuplaClothes();
                
                if (puhekuplaSuccess) {
                    console.log('✅ Dados de roupas carregados da API Puhekupla');
                } else {
                    throw new Error('API Puhekupla falhou');
                }
            } catch (error) {
                console.warn('❌ Erro ao carregar da API Puhekupla, tentando fallbacks...', error);
                this.loadClothingDataFallback();
            }
        } else {
            console.log('⚠️ API Puhekupla não disponível, usando fallbacks...');
            this.loadClothingDataFallback();
        }
        
        // Garantir que todas as categorias tenham pelo menos alguns itens
        this.ensureAllCategoriesHaveItems();
        
        console.log('📊 Dados finais de roupas:', this.clothingData);
        this.renderClothingGrid();
    }
    
    loadClothingDataFallback() {
        console.log('🔄 Carregando dados de roupas do fallback...');
        
        // Usar dados das categorias completas se disponível
        if (typeof HABBO_COMPLETE_CATEGORIES !== 'undefined' && typeof convertToEditorFormat === 'function') {
            console.log('✅ Usando mapeamento completo de categorias');
            try {
                const completeData = convertToEditorFormat();
                console.log('📊 Dados convertidos:', completeData);
                
                // Substituir completamente os dados de roupas
                this.clothingData = completeData;
                
                // Verificar se os dados foram carregados corretamente
                console.log('🔍 Verificando dados carregados...');
                Object.entries(this.clothingData).forEach(([category, rarities]) => {
                    if (rarities && typeof rarities === 'object') {
                        const nonhc = rarities.nonhc?.length || 0;
                        const hc = rarities.hc?.length || 0;
                        const sell = rarities.sell?.length || 0;
                        const nft = rarities.nft?.length || 0;
                        const total = nonhc + hc + sell + nft;
                        console.log(`✅ ${category}: ${total} itens (nonhc: ${nonhc}, hc: ${hc}, sell: ${sell}, nft: ${nft})`);
                    } else {
                        console.log(`❌ ${category}: Estrutura inválida`);
                    }
                });
                
                console.log('✅ Dados de categorias completas carregados:', this.clothingData);
                return;
            } catch (error) {
                console.error('❌ Erro ao converter dados completos:', error);
            }
        }
        
        // Fallback para dados antigos se as categorias completas não estiverem disponíveis
        console.log('⚠️ Usando fallback de dados antigos');
        
        // Dados básicos de fallback
        this.clothingData = {
            head: {
                nonhc: [
                    { id: '180', name: 'Rosto 1', type: 'hd', rarity: 'nonhc', figure: 'hd-180-7-', color: '7' },
                    { id: '185', name: 'Rosto 2', type: 'hd', rarity: 'nonhc', figure: 'hd-185-7-', color: '7' },
                    { id: '190', name: 'Rosto 3', type: 'hd', rarity: 'nonhc', figure: 'hd-190-7-', color: '7' }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            hair: {
                nonhc: [
                    { id: '100', name: 'Cabelo 1', type: 'hr', rarity: 'nonhc', figure: 'hr-100-7-', color: '7' },
                    { id: '105', name: 'Cabelo 2', type: 'hr', rarity: 'nonhc', figure: 'hr-105-7-', color: '7' },
                    { id: '110', name: 'Cabelo 3', type: 'hr', rarity: 'nonhc', figure: 'hr-110-7-', color: '7' }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            hats: {
                nonhc: [
                    { id: '1001', name: 'Chapéu 1', type: 'ha', rarity: 'nonhc', figure: 'ha-1001-7-', color: '7' },
                    { id: '1002', name: 'Chapéu 2', type: 'ha', rarity: 'nonhc', figure: 'ha-1002-7-', color: '7' },
                    { id: '1003', name: 'Chapéu 3', type: 'ha', rarity: 'nonhc', figure: 'ha-1003-7-', color: '7' }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            shirts: {
                nonhc: [
                    { id: '210', name: 'Camisa Padrão', type: 'ch', rarity: 'nonhc', figure: 'ch-210-66-', color: '66' },
                    { id: '215', name: 'Camisa Social', type: 'ch', rarity: 'nonhc', figure: 'ch-215-66-', color: '66' },
                    { id: '220', name: 'Camisa Casual', type: 'ch', rarity: 'nonhc', figure: 'ch-220-66-', color: '66' }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            pants: {
                nonhc: [
                    { id: '100', name: 'Calça Padrão', type: 'lg', rarity: 'nonhc', figure: 'lg-100-66-', color: '66' }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            shoes: {
                nonhc: [
                    { id: '100', name: 'Sapato Padrão', type: 'sh', rarity: 'nonhc', figure: 'sh-100-66-', color: '66' }
                ],
                hc: [],
                sell: [],
                nft: []
            }
        };
        
        console.log('✅ Dados de fallback carregados:', this.clothingData);
    }
    
    loadColors() {
        // Usar as configurações do HabboTemplarios
        const config = window.HABBO_TEMPLARIOS_CONFIG;
        if (!config) {
            console.warn('Configuração do HabboTemplarios não encontrada, usando cores padrão');
            return;
        }

        // Combinar cores de pele e roupas
        const allColors = [...config.colors.skin, ...config.colors.clothing];
        
        const colorGrid = document.getElementById('colorGrid');
        colorGrid.innerHTML = '';
        
        allColors.forEach((colorObj) => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = colorObj.color;
            colorItem.dataset.color = colorObj.color;
            colorItem.dataset.index = colorObj.index;
            colorItem.title = colorObj.name; // Tooltip com nome da cor
            
            if (colorObj.index === 7) { // Cor padrão (pele)
                colorItem.classList.add('selected');
            }
            
            colorItem.addEventListener('click', () => this.selectColor(colorObj.color, colorObj.index));
            colorGrid.appendChild(colorItem);
        });
    }
    
    // Método para carregar roupas da API Puhekupla
    async loadPuhekuplaClothes() {
        try {
            console.log('🔄 Carregando roupas da API Puhekupla...');
            const puhekuplaData = await fetchAllPuhekuplaClothes();
            
            if (puhekuplaData && Object.keys(puhekuplaData).length > 0) {
                this.clothingData = puhekuplaData;
                console.log('✅ Roupas carregadas da Puhekupla:', this.clothingData);
                
                // Log detalhado de cada categoria
                Object.entries(this.clothingData).forEach(([category, rarities]) => {
                    let totalItems = 0;
                    Object.entries(rarities).forEach(([rarity, items]) => {
                        totalItems += items.length;
                        if (items.length > 0) {
                            console.log(`📦 ${category} - ${rarity}: ${items.length} itens`);
                        }
                    });
                    console.log(`🎯 ${category}: Total de ${totalItems} itens`);
                });
                
                // Verificar se as categorias estão sendo mapeadas corretamente
                console.log('🔍 Verificando mapeamento de categorias...');
                const availableCategories = Object.keys(this.clothingData);
                console.log('📋 Categorias disponíveis:', availableCategories);
                
                // Verificar se as categorias do HTML correspondem às da API
                const htmlCategories = Array.from(document.querySelectorAll('.nav-item')).map(nav => nav.dataset.category);
                console.log('🏷️ Categorias do HTML:', htmlCategories);
                
                // Verificar correspondências
                htmlCategories.forEach(htmlCat => {
                    if (availableCategories.includes(htmlCat)) {
                        console.log(`✅ ${htmlCat}: OK`);
                    } else {
                        console.log(`❌ ${htmlCat}: NÃO ENCONTRADA na API`);
                    }
                });
                
                // Verificar se os assets têm URLs de imagem válidas
                console.log('🖼️ Verificando assets disponíveis...');
                let totalAssets = 0;
                
                Object.entries(this.clothingData).forEach(([category, rarities]) => {
                    Object.entries(rarities).forEach(([rarity, items]) => {
                        items.forEach(item => {
                            totalAssets++;
                            console.log(`📦 ${category} - ${item.name}: ID ${item.id}, Tipo ${item.type}`);
                        });
                    });
                });
                
                console.log(`📊 Total de assets disponíveis: ${totalAssets}`);
                console.log(`🎯 Todos os assets serão renderizados usando Habbo Imaging com previews otimizados`);
                
                return true;
            } else {
                throw new Error('API Puhekupla retornou dados vazios');
            }
        } catch (error) {
            console.warn('❌ Erro ao carregar da Puhekupla:', error);
            return false;
        }
    }
    
    // Garantir que todas as categorias tenham pelo menos alguns itens
    ensureAllCategoriesHaveItems() {
        console.log('🔧 Garantindo que todas as categorias tenham itens...');
        
        // Lista de todas as categorias que devem existir
        const requiredCategories = [
            'head', 'hair', 'hats', 'shirts', 'pants', 'shoes',
            'accessories', 'jackets', 'eyeAccessories', 'faceAccessories',
            'headAccessories', 'chestAccessories', 'waistAccessories',
            'dresses', 'skirts', 'suits', 'backpacks', 'wings', 'masks',
            'body', 'leftHand', 'rightHand'
        ];
        
        requiredCategories.forEach(category => {
            if (!this.clothingData[category]) {
                console.log(`📝 Criando categoria vazia: ${category}`);
                this.clothingData[category] = {
                    nonhc: [],
                    hc: [],
                    sell: [],
                    nft: []
                };
            }
            
            // Se a categoria não tem itens em nenhuma raridade, adicionar itens de fallback
            const totalItems = Object.values(this.clothingData[category]).reduce((sum, items) => sum + items.length, 0);
            if (totalItems === 0) {
                console.log(`⚠️ Categoria ${category} está vazia, adicionando itens de fallback...`);
                this.addFallbackItemsForCategory(category);
            } else {
                console.log(`✅ Categoria ${category} já tem ${totalItems} itens`);
            }
        });
        
        // Log final de todas as categorias e seus itens
        console.log('\n📊 RESUMO FINAL DAS CATEGORIAS:');
        requiredCategories.forEach(category => {
            if (this.clothingData[category]) {
                const nonhc = this.clothingData[category].nonhc?.length || 0;
                const hc = this.clothingData[category].hc?.length || 0;
                const sell = this.clothingData[category].sell?.length || 0;
                const nft = this.clothingData[category].nft?.length || 0;
                const total = nonhc + hc + sell + nft;
                console.log(`🎯 ${category}: ${total} itens (nonhc: ${nonhc}, hc: ${hc}, sell: ${sell}, nft: ${nft})`);
            }
        });
        
        console.log('✅ Verificação de categorias concluída');
    }
    
         // Adicionar itens de fallback para categorias vazias
     addFallbackItemsForCategory(category) {
         // Verificar se há arquivos SWF disponíveis para esta categoria
         if (window.SWF_FALLBACK_MAPPING && window.SWF_FALLBACK_MAPPING[category]) {
             this.clothingData[category] = window.SWF_FALLBACK_MAPPING[category];
             console.log(`📦 Adicionados itens SWF para categoria vazia: ${category}`);
             
             // Log detalhado dos itens adicionados
             const totalItems = Object.values(this.clothingData[category]).reduce((sum, items) => sum + items.length, 0);
             console.log(`✅ Categoria ${category} agora tem ${totalItems} itens via SWF fallback`);
             
             // Mostrar alguns exemplos
             Object.entries(this.clothingData[category]).forEach(([rarity, items]) => {
                 if (items.length > 0) {
                     console.log(`   ${rarity}: ${items.length} itens (ex: ${items[0].name})`);
                 }
             });
         } else {
             const fallbackItems = this.getFallbackItemsForCategory(category);
             if (fallbackItems.length > 0) {
                 // Distribuir itens por raridade
                 this.clothingData[category].nonhc = fallbackItems.filter(item => item.rarity === 'nonhc');
                 this.clothingData[category].hc = fallbackItems.filter(item => item.rarity === 'hc');
                 this.clothingData[category].sell = fallbackItems.filter(item => item.rarity === 'sell');
                 this.clothingData[category].nft = fallbackItems.filter(item => item.rarity === 'nft');
                 
                 const total = fallbackItems.length;
                 const nonhc = this.clothingData[category].nonhc.length;
                 const hc = this.clothingData[category].hc.length;
                 const sell = this.clothingData[category].sell.length;
                 const nft = this.clothingData[category].nft.length;
                 
                 console.log(`📦 Adicionados ${total} itens de fallback para ${category}: nonhc(${nonhc}), hc(${hc}), sell(${sell}), nft(${nft})`);
             }
         }
     }
    
    // Obter itens de fallback para uma categoria específica
    getFallbackItemsForCategory(category) {
        const fallbackData = {
            head: [
                { id: '190', name: 'Cabeça Padrão', type: 'hd', rarity: 'nonhc', color: '7' },
                { id: '180', name: 'Cabeça Alternativa 1', type: 'hd', rarity: 'nonhc', color: '7' },
                { id: '185', name: 'Cabeça Alternativa 2', type: 'hd', rarity: 'nonhc', color: '7' },
                { id: '200', name: 'Cabeça Especial', type: 'hd', rarity: 'hc', color: '7' },
                { id: '210', name: 'Cabeça Premium', type: 'hd', rarity: 'sell', color: '7' }
            ],
            hair: [
                { id: '100', name: 'Cabelo Padrão', type: 'hr', rarity: 'nonhc', color: '7' },
                { id: '101', name: 'Cabelo Curto', type: 'hr', rarity: 'nonhc', color: '7' },
                { id: '102', name: 'Cabelo Longo', type: 'hr', rarity: 'nonhc', color: '7' },
                { id: '103', name: 'Cabelo Ondulado', type: 'hr', rarity: 'nonhc', color: '7' },
                { id: '104', name: 'Cabelo Afro', type: 'hr', rarity: 'nonhc', color: '7' },
                { id: '105', name: 'Cabelo Punk', type: 'hr', rarity: 'hc', color: '7' },
                { id: '106', name: 'Cabelo Colorido', type: 'hr', rarity: 'sell', color: '7' },
                { id: '107', name: 'Cabelo Fantasia', type: 'hr', rarity: 'nft', color: '7' }
            ],
            hats: [
                { id: '1', name: 'Chapéu Básico', type: 'ha', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Chapéu de Festa', type: 'ha', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Chapéu de Inverno', type: 'ha', rarity: 'nonhc', color: '7' },
                { id: '4', name: 'Chapéu de Cowboy', type: 'ha', rarity: 'nonhc', color: '7' },
                { id: '5', name: 'Chapéu de Marinheiro', type: 'ha', rarity: 'hc', color: '7' },
                { id: '6', name: 'Chapéu de Mágico', type: 'ha', rarity: 'sell', color: '7' },
                { id: '7', name: 'Chapéu de Princesa', type: 'ha', rarity: 'nft', color: '7' }
            ],
            shirts: [
                { id: '210', name: 'Camisa Básica', type: 'ch', rarity: 'nonhc', color: '7' },
                { id: '211', name: 'Camiseta Social', type: 'ch', rarity: 'nonhc', color: '7' },
                { id: '212', name: 'Camiseta Casual', type: 'ch', rarity: 'nonhc', color: '7' },
                { id: '213', name: 'Camisa de Festa', type: 'ch', rarity: 'nonhc', color: '7' },
                { id: '214', name: 'Camisa Esportiva', type: 'ch', rarity: 'nonhc', color: '7' },
                { id: '215', name: 'Camisa Elegante', type: 'ch', rarity: 'hc', color: '7' },
                { id: '216', name: 'Camisa Premium', type: 'ch', rarity: 'sell', color: '7' },
                { id: '217', name: 'Camisa Exclusiva', type: 'ch', rarity: 'nft', color: '7' }
            ],
            pants: [
                { id: '270', name: 'Calça Básica', type: 'lg', rarity: 'nonhc', color: '7' },
                { id: '271', name: 'Calça Jeans', type: 'lg', rarity: 'nonhc', color: '7' },
                { id: '272', name: 'Calça Social', type: 'lg', rarity: 'nonhc', color: '7' },
                { id: '273', name: 'Calça Esportiva', type: 'lg', rarity: 'nonhc', color: '7' },
                { id: '274', name: 'Calça de Festa', type: 'lg', rarity: 'nonhc', color: '7' },
                { id: '275', name: 'Calça Elegante', type: 'lg', rarity: 'hc', color: '7' },
                { id: '276', name: 'Calça Premium', type: 'lg', rarity: 'sell', color: '7' },
                { id: '277', name: 'Calça Exclusiva', type: 'lg', rarity: 'nft', color: '7' }
            ],
            shoes: [
                { id: '290', name: 'Sapato Básico', type: 'sh', rarity: 'nonhc', color: '7' },
                { id: '291', name: 'Tênis', type: 'sh', rarity: 'nonhc', color: '7' },
                { id: '292', name: 'Sapato Social', type: 'sh', rarity: 'nonhc', color: '7' },
                { id: '293', name: 'Bota', type: 'sh', rarity: 'nonhc', color: '7' },
                { id: '294', name: 'Sandália', type: 'sh', rarity: 'nonhc', color: '7' },
                { id: '295', name: 'Sapato Elegante', type: 'sh', rarity: 'hc', color: '7' },
                { id: '296', name: 'Sapato Premium', type: 'sh', rarity: 'sell', color: '7' },
                { id: '297', name: 'Sapato Exclusivo', type: 'sh', rarity: 'nft', color: '7' }
            ],
            accessories: [
                { id: '1', name: 'Óculos Básicos', type: 'ea', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Óculos de Sol', type: 'ea', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Óculos de Leitura', type: 'ea', rarity: 'nonhc', color: '7' },
                { id: '4', name: 'Óculos de Proteção', type: 'ea', rarity: 'nonhc', color: '7' },
                { id: '5', name: 'Óculos Elegantes', type: 'ea', rarity: 'hc', color: '7' },
                { id: '6', name: 'Óculos Premium', type: 'ea', rarity: 'sell', color: '7' },
                { id: '7', name: 'Óculos Exclusivos', type: 'ea', rarity: 'nft', color: '7' }
            ],
            jackets: [
                { id: '1', name: 'Jaqueta Básica', type: 'cc', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Jaqueta de Couro', type: 'cc', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Jaqueta Esportiva', type: 'cc', rarity: 'nonhc', color: '7' },
                { id: '4', name: 'Jaqueta Elegante', type: 'cc', rarity: 'hc', color: '7' },
                { id: '5', name: 'Jaqueta Premium', type: 'cc', rarity: 'sell', color: '7' },
                { id: '6', name: 'Jaqueta Exclusiva', type: 'cc', rarity: 'nft', color: '7' }
            ],
            eyeAccessories: [
                { id: '1', name: 'Lente de Contato', type: 'ea', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Lente Colorida', type: 'ea', rarity: 'hc', color: '7' },
                { id: '3', name: 'Lente Premium', type: 'ea', rarity: 'sell', color: '7' },
                { id: '4', name: 'Lente Exclusiva', type: 'ea', rarity: 'nft', color: '7' }
            ],
            faceAccessories: [
                { id: '1', name: 'Piercing', type: 'fa', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Tatuagem Facial', type: 'fa', rarity: 'hc', color: '7' },
                { id: '3', name: 'Acessório Premium', type: 'fa', rarity: 'sell', color: '7' },
                { id: '4', name: 'Acessório Exclusivo', type: 'fa', rarity: 'nft', color: '7' }
            ],
            headAccessories: [
                { id: '1', name: 'Tiara', type: 'he', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Fita de Cabelo', type: 'he', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Acessório Elegante', type: 'he', rarity: 'hc', color: '7' },
                { id: '4', name: 'Acessório Premium', type: 'he', rarity: 'sell', color: '7' },
                { id: '5', name: 'Acessório Exclusivo', type: 'he', rarity: 'nft', color: '7' }
            ],
            chestAccessories: [
                { id: 'ca-100-7-', name: 'Raio de Zeus U', type: 'ca', swf: 'acc_chest_U_zeuslightning.swf', gender: 'U' },
                { id: 'ca-101-7-', name: 'Barril de Vinho Dionisíaco U', type: 'ca', swf: 'acc_chest_U_dionysianwinebarrel.swf', gender: 'U' },
                { id: 'ca-102-7-', name: 'Saco de Estrelas Iridescente U', type: 'ca', swf: 'acc_chest_U_iridescentstarbag.swf', gender: 'U' },
                { id: 'ca-103-7-', name: 'Coca-Cola NFT U', type: 'ca', swf: 'acc_chest_U_nftcola.swf', gender: 'U' },
                { id: 'ca-104-7-', name: 'Gato Flutuante U', type: 'ca', swf: 'acc_chest_U_catfloat.swf', gender: 'U' },
                { id: 'ca-105-7-', name: 'Skate U', type: 'ca', swf: 'acc_chest_U_sk8board.swf', gender: 'U' },
                { id: 'ca-200-7-', name: 'Sapo Flutuante NFT U', type: 'ca', swf: 'acc_chest_U_nftfrogfloat.swf', gender: 'U' },
                { id: 'ca-201-7-', name: 'Concha do Mar NFT P1 U', type: 'ca', swf: 'acc_chest_U_nftseashellp1.swf', gender: 'U' },
                { id: 'ca-202-7-', name: 'Concha do Mar NFT P2 U', type: 'ca', swf: 'acc_chest_U_nftseashellp2.swf', gender: 'U' },
                { id: 'ca-203-7-', name: 'Concha do Mar NFT P3 U', type: 'ca', swf: 'acc_chest_U_nftseashellp3.swf', gender: 'U' },
                { id: 'ca-204-7-', name: 'Concha do Mar NFT P4 U', type: 'ca', swf: 'acc_chest_U_nftseashellp4.swf', gender: 'U' },
                { id: 'ca-205-7-', name: 'Cavalo Marinho Flutuante NFT U', type: 'ca', swf: 'acc_chest_U_nftseahorsefloat.swf', gender: 'U' },
                { id: 'ca-206-7-', name: 'Macaco nas Costas NFT U', type: 'ca', swf: 'acc_chest_U_nftbackmonkey.swf', gender: 'U' },
                { id: 'ca-207-7-', name: 'Asas de Mariposa U', type: 'ca', swf: 'acc_chest_U_brmothwings.swf', gender: 'U' }
            ],
            waistAccessories: [
                { id: '1', name: 'Cinto Básico', type: 'wa', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Cinto Elegante', type: 'wa', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Cinto Premium', type: 'wa', rarity: 'hc', color: '7' },
                { id: '4', name: 'Cinto Exclusivo', type: 'wa', rarity: 'sell', color: '7' },
                { id: '5', name: 'Cinto Raro', type: 'wa', rarity: 'nft', color: '7' }
            ],
            dresses: [
                { id: '1', name: 'Vestido Básico', type: 'dr', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Vestido de Festa', type: 'dr', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Vestido Elegante', type: 'dr', rarity: 'hc', color: '7' },
                { id: '4', name: 'Vestido Premium', type: 'dr', rarity: 'sell', color: '7' },
                { id: '5', name: 'Vestido Exclusivo', type: 'dr', rarity: 'nft', color: '7' }
            ],
            skirts: [
                { id: '1', name: 'Saia Básica', type: 'sk', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Saia de Festa', type: 'sk', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Saia Elegante', type: 'sk', rarity: 'hc', color: '7' },
                { id: '4', name: 'Saia Premium', type: 'sk', rarity: 'sell', color: '7' },
                { id: '5', name: 'Saia Exclusiva', type: 'sk', rarity: 'nft', color: '7' }
            ],
            suits: [
                { id: '1', name: 'Traje Básico', type: 'su', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Traje de Festa', type: 'su', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Traje Elegante', type: 'su', rarity: 'hc', color: '7' },
                { id: '4', name: 'Traje Premium', type: 'su', rarity: 'sell', color: '7' },
                { id: '5', name: 'Traje Exclusivo', type: 'su', rarity: 'nft', color: '7' }
            ],
            backpacks: [
                { id: '1', name: 'Mochila Básica', type: 'bp', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Mochila Escolar', type: 'bp', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Mochila Esportiva', type: 'bp', rarity: 'hc', color: '7' },
                { id: '4', name: 'Mochila Premium', type: 'bp', rarity: 'sell', color: '7' },
                { id: '5', name: 'Mochila Exclusiva', type: 'bp', rarity: 'nft', color: '7' }
            ],
            wings: [
                { id: '1', name: 'Asas de Anjo', type: 'wg', rarity: 'hc', color: '7' },
                { id: '2', name: 'Asas de Demônio', type: 'wg', rarity: 'sell', color: '7' },
                { id: '3', name: 'Asas de Fada', type: 'wg', rarity: 'sell', color: '7' },
                { id: '4', name: 'Asas de Dragão', type: 'wg', rarity: 'nft', color: '7' },
                { id: '5', name: 'Asas de Borboleta', type: 'wg', rarity: 'nft', color: '7' }
            ],
            masks: [
                { id: '1', name: 'Máscara Básica', type: 'mk', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Máscara de Festa', type: 'mk', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Máscara Elegante', type: 'mk', rarity: 'hc', color: '7' },
                { id: '4', name: 'Máscara Premium', type: 'mk', rarity: 'sell', color: '7' },
                { id: '5', name: 'Máscara Exclusiva', type: 'mk', rarity: 'nft', color: '7' }
            ],
            body: [
                { id: '1', name: 'Corpo Básico', type: 'bd', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Corpo Atlético', type: 'bd', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Corpo Elegante', type: 'bd', rarity: 'hc', color: '7' },
                { id: '4', name: 'Corpo Premium', type: 'bd', rarity: 'sell', color: '7' },
                { id: '5', name: 'Corpo Exclusivo', type: 'bd', rarity: 'nft', color: '7' }
            ],
            leftHand: [
                { id: '1', name: 'Item Mão Esquerda 1', type: 'lh', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Item Mão Esquerda 2', type: 'lh', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Item Mão Esquerda 3', type: 'lh', rarity: 'hc', color: '7' },
                { id: '4', name: 'Item Mão Esquerda 4', type: 'lh', rarity: 'sell', color: '7' },
                { id: '5', name: 'Item Mão Esquerda 5', type: 'lh', rarity: 'nft', color: '7' }
            ],
            rightHand: [
                { id: '1', name: 'Item Mão Direita 1', type: 'rh', rarity: 'nonhc', color: '7' },
                { id: '2', name: 'Item Mão Direita 2', type: 'rh', rarity: 'nonhc', color: '7' },
                { id: '3', name: 'Item Mão Direita 3', type: 'rh', rarity: 'hc', color: '7' },
                { id: '4', name: 'Item Mão Direita 4', type: 'rh', rarity: 'sell', color: '7' },
                { id: '5', name: 'Item Mão Direita 5', type: 'rh', rarity: 'nft', color: '7' }
            ]
        };
        
        return fallbackData[category] || [];
    }
    
    renderClothingGrid() {
        const grid = document.getElementById('clothingGrid');
        const categoryData = this.clothingData[this.currentCategory];
        
        console.log(`Renderizando categoria: ${this.currentCategory}`, categoryData);
        
        if (!categoryData) {
            console.warn(`Categoria ${this.currentCategory} não encontrada`);
            return;
        }
        
        grid.innerHTML = '';
        
        // Criar seções organizadas por raridade (como no exemplo das camisetas)
        const sections = [
            { id: 'nonhc', title: 'Roupas Normais', items: categoryData.nonhc || [] },
            { id: 'hc', title: 'Habbo Club', items: categoryData.hc || [] },
            { id: 'sell', title: 'Vendáveis', items: categoryData.sell || [] },
            { id: 'nft', title: 'NFT', items: categoryData.nft || [] }
        ];
        
        let totalItems = 0;
        
        // Criar grid único com todos os itens organizados por raridade
        const allItems = [];
        
        sections.forEach(section => {
            if (section.items && section.items.length > 0) {
                totalItems += section.items.length;
                allItems.push(...section.items);
            }
        });
        
        if (allItems.length > 0) {
                         // Criar grid único
                         const clothingGrid = document.createElement('div');
            clothingGrid.className = 'clothing-grid-items';
            clothingGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; padding: 20px;';
            
            allItems.forEach(item => {
                const clothingItem = document.createElement('div');
                clothingItem.className = `clothing-item ${item.rarity}`;
                clothingItem.dataset.id = item.id;
                clothingItem.dataset.type = item.type;
                clothingItem.dataset.name = item.name;
                
                // Criar preview do item usando a estratégia do HabboTemplarios ou Puhekupla
                const img = document.createElement('img');
                
                                 // Sistema unificado de previews: Habbo Imaging + Assets SWF
                let imageUrl;
                let imageSource = 'Habbo Imaging';
                
                // Verificar se temos asset SWF disponível
                if (item.swfPath && item.swfFile) {
                    imageUrl = item.swfPath;
                    imageSource = 'SWF Asset';
                    console.log(`🎮 Usando asset SWF para ${item.name}: ${imageUrl}`);
                } else {
                                    // Gerar preview otimizado que foca na região específica da roupa
                const previewFigure = this.generatePreviewFigure(item);
                imageUrl = this.generateOptimizedPreviewUrl(item);
                    console.log(`🎯 Usando Habbo Imaging otimizado para ${item.name}: ${imageUrl}`);
                    console.log(`   Figura gerada: ${previewFigure}`);
                }
                
                img.src = imageUrl;
                img.alt = item.name;
                img.loading = "lazy";
                img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 0; background: transparent;';
                
                // Tratamento de erro: se SWF falhar, tentar Habbo Imaging; se falhar, mostrar placeholder
                img.onerror = () => {
                    if (imageSource === 'SWF Asset') {
                        console.log(`🔄 SWF falhou, tentando Habbo Imaging para ${item.name}`);
                        const previewFigure = this.generatePreviewFigure(item);
                        const fallbackUrl = this.generateOptimizedPreviewUrl(item);
                        img.src = fallbackUrl;
                        imageSource = 'Habbo Imaging (Fallback)';
                    } else {
                        console.log(`❌ Erro ao carregar imagem para ${item.name}: ${imageUrl}`);
                        this.showImagePlaceholder(clothingItem, item);
                    }
                };
                 
                // Log para debug
                console.log(`📦 Item ${item.name} (${item.type}) - ${imageSource} - ${imageUrl}`);
                
                clothingItem.appendChild(img);
                clothingItem.addEventListener('click', () => this.selectClothing(item));
                clothingGrid.appendChild(clothingItem);
            });
            
            grid.appendChild(clothingGrid);
        }
        
        console.log(`Grid renderizado com ${totalItems} itens organizados por raridade`);
        
        if (totalItems === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhuma roupa encontrada para esta categoria.</p>';
        }
    }
    
    // Mostrar todas as categorias disponíveis
    showAllCategories() {
        console.log('🎯 === MOSTRANDO TODAS AS CATEGORIAS ===');
        
        const grid = document.getElementById('clothingGrid');
        grid.innerHTML = '';
        
        // Lista de todas as categorias disponíveis
        const allCategories = Object.keys(this.clothingData);
        console.log('📋 Categorias disponíveis:', allCategories);
        
        // Criar seletor de categorias
        const categorySelector = document.createElement('div');
        categorySelector.className = 'category-selector';
        categorySelector.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 10px;
            margin-bottom: 20px;
        `;
        
        allCategories.forEach(category => {
            const categoryBtn = document.createElement('button');
            categoryBtn.textContent = this.getCategoryDisplayName(category);
            categoryBtn.className = 'category-btn';
            categoryBtn.style.cssText = `
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                background: #007bff;
                color: white;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            `;
            
            categoryBtn.addEventListener('click', () => {
                this.currentCategory = category;
                this.renderClothingGrid();
                
                // Atualizar botões ativos
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.style.background = '#007bff';
                });
                categoryBtn.style.background = '#28a745';
            });
            
            categorySelector.appendChild(categoryBtn);
        });
        
        grid.appendChild(categorySelector);
        
        // Mostrar primeira categoria por padrão
        if (allCategories.length > 0) {
            this.currentCategory = allCategories[0];
            this.renderClothingGrid();
            
            // Marcar primeiro botão como ativo
            const firstBtn = categorySelector.querySelector('.category-btn');
            if (firstBtn) firstBtn.style.background = '#28a745';
        }
        
        console.log('✅ Seletor de categorias criado!');
    }
    
    // Obter nome de exibição da categoria
    getCategoryDisplayName(category) {
        const displayNames = {
            'head': 'Rostos',
            'hair': 'Cabelos',
            'hats': 'Chapéus',
            'shirts': 'Camisas',
            'pants': 'Calças',
            'shoes': 'Sapatos',
            'skirts': 'Saias',
            'dresses': 'Vestidos',
            'suits': 'Ternos',
            'jackets': 'Jaquetas',
            'faceAccessories': 'Acessórios do Rosto',
            'headAccessories': 'Acessórios da Cabeça',
            'waistAccessories': 'Acessórios da Cintura'
        };
        
        return displayNames[category] || category;
    }
    
    // Mostrar todas as categorias disponíveis
    showAllCategories() {
        console.log('🎨 === MOSTRANDO TODAS AS CATEGORIAS ===');
        
        const clothingGrid = document.getElementById('clothingGrid');
        if (!clothingGrid) {
            console.error('❌ Elemento clothingGrid não encontrado');
            return;
        }
        
        // Limpar grid
        clothingGrid.innerHTML = '';
        
        // Mapeamento de nomes das categorias
        const categoryNames = {
            'head': '👤 Rostos',
            'hair': '💇 Cabelos',
            'shirts': '👕 Camisetas',
            'pants': '👖 Calças',
            'shoes': '👟 Sapatos',
            'hats': '🎩 Chapéus',
            'faceAccessories': '👓 Acessórios do Rosto',
            'headAccessories': '🎀 Acessórios da Cabeça',
            'chestAccessories': '💎 Acessórios do Peito',
            'waistAccessories': '🩲 Acessórios da Cintura',
            'dresses': '👗 Vestidos',
            'skirts': '👗 Saias',
            'suits': '🤵 Trajes',
            'jackets': '🧥 Jaquetas'
        };
        
        // Ordem de exibição das categorias
        const categoryOrder = [
            'head', 'hair', 'shirts', 'pants', 'shoes', 'hats',
            'faceAccessories', 'headAccessories', 'chestAccessories', 'waistAccessories',
            'dresses', 'skirts', 'suits', 'jackets'
        ];
        
        let totalCategories = 0;
        let totalItems = 0;
        
        // Criar seções para cada categoria
        categoryOrder.forEach(category => {
            if (this.clothingData[category] && this.clothingData[category].nonhc && this.clothingData[category].nonhc.length > 0) {
                totalCategories++;
                
                // Criar cabeçalho da categoria
                const categorySection = document.createElement('div');
                categorySection.className = 'category-section';
                categorySection.setAttribute('data-category', category);
                
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                
                const categoryTitle = document.createElement('h3');
                categoryTitle.innerHTML = categoryNames[category] || category;
                
                const categoryCount = document.createElement('div');
                categoryCount.className = 'category-count';
                categoryCount.textContent = '0/0 itens';
                
                categoryHeader.appendChild(categoryTitle);
                categoryHeader.appendChild(categoryCount);
                
                // Criar grid de itens
                const categoryItems = document.createElement('div');
                categoryItems.className = 'category-items';
                
                // Renderizar itens da categoria
                this.renderCategoryItems(category, categoryItems);
                
                categorySection.appendChild(categoryHeader);
                categorySection.appendChild(categoryItems);
                clothingGrid.appendChild(categorySection);
                
                totalItems += this.clothingData[category].nonhc.length;
            }
        });
        
        console.log(`📋 Categorias disponíveis: ${totalCategories}`);
        console.log(`📊 Total de itens: ${totalItems}`);
        console.log('✅ Todas as categorias foram renderizadas!');
        
        // Atualizar contadores
        this.updateCategoryCounts();
        
        // Adicionar event listeners para navegação
        this.setupCategoryNavigation();
        
        // Configurar event listeners para botões de gênero
        this.setupGenderButtons();
    }
    
    // Renderizar itens de uma categoria específica
    renderCategoryItems(category, container) {
        const items = this.clothingData[category].nonhc || [];
        
        items.forEach(item => {
            const itemElement = this.createClothingItem(item, 'nonhc');
            container.appendChild(itemElement);
        });
        
        console.log(`✅ Categoria ${category} renderizada com ${items.length} itens`);
    }
    
    // Configurar navegação entre categorias
    setupCategoryNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const categorySections = document.querySelectorAll('.category-section');
        
        navItems.forEach(navItem => {
            navItem.addEventListener('click', () => {
                const category = navItem.getAttribute('data-category');
                
                // Remover classe active de todos os nav items
                navItems.forEach(item => item.classList.remove('active'));
                
                // Adicionar classe active ao item clicado
                navItem.classList.add('active');
                
                // Mostrar apenas a categoria selecionada
                this.showSingleCategory(category);
            });
        });
        
        // Mostrar primeira categoria por padrão
        if (navItems.length > 0) {
            navItems[0].click();
        }
    }
    
    // Mostrar apenas uma categoria específica
    showSingleCategory(selectedCategory) {
        const categorySections = document.querySelectorAll('.category-section');
        
        categorySections.forEach(section => {
            const category = section.getAttribute('data-category');
            if (category === selectedCategory) {
                section.style.display = 'block';
                
                // Scroll para a categoria
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                section.style.display = 'none';
            }
        });
        
        console.log(`🎯 Categoria ${selectedCategory} selecionada`);
    }
    
    // Configurar botões de gênero
    setupGenderButtons() {
        const genderBtns = document.querySelectorAll('.gender-btn');
        
        genderBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const gender = btn.getAttribute('data-gender');
                this.currentFigure.gender = gender;
                
                console.log(`🔄 Gênero alterado para: ${gender}`);
                
                // Atualizar interface
                this.updateActiveGenderButton();
                this.updateClothingDisplayForGender();
                this.updateAvatar();
            });
        });
        
        // Definir gênero inicial
        this.updateActiveGenderButton();
    }
    
    // Carregar roupas da API Puhekupla
    async loadPuhekuplaClothes() {
        console.log('🔍 === CARREGANDO ROUPAS DA API PUHEKUPLA ===');
        
        try {
            const response = await fetch('https://api.puhekupla.com/clothes?per_page=50', {
                headers: {
                    'X-Puhekupla-APIKey': 'demo-habbohub'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ API Puhekupla respondendo!');
            console.log(`📊 Total de roupas: ${data.pagination?.total || 'N/A'}`);
            
            if (data.result && Array.isArray(data.result)) {
                // Processar e integrar as roupas da Puhekupla
                this.integratePuhekuplaClothes(data.result);
            }
            
        } catch (error) {
            console.log('❌ Erro ao carregar da API Puhekupla:', error.message);
            console.log('🔄 Continuando com roupas locais...');
        }
    }
    
    // Integrar roupas da Puhekupla com o sistema local
    integratePuhekuplaClothes(puhekuplaClothes) {
        console.log('🔗 === INTEGRANDO ROUPAS PUHEKUPLA ===');
        
        puhekuplaClothes.forEach(item => {
            // Analisar o código para determinar categoria e gênero
            const analysis = this.analyzePuhekuplaCode(item.code);
            
            if (analysis.category && analysis.gender) {
                // Adicionar à categoria correspondente
                this.addPuhekuplaItemToCategory(item, analysis);
            }
        });
        
        // Re-renderizar o grid com as novas roupas
        this.showAllCategories();
        console.log('✅ Roupas Puhekupla integradas!');
    }
    
    // Analisar código da Puhekupla para extrair categoria e gênero
    analyzePuhekuplaCode(code) {
        const parts = code.split('_');
        if (parts.length < 2) return { category: null, gender: null };
        
        const category = parts[0]; // shirt, pant, shoe, etc.
        const gender = parts[1];   // m, f, u
        
        return { category, gender };
    }
    
    // Adicionar item da Puhekupla à categoria correspondente
    addPuhekuplaItemToCategory(puhekuplaItem, analysis) {
        // Mapear categoria da Puhekupla para categoria local
        const categoryMapping = {
            'shirt': 'shirts',
            'pant': 'pants', 
            'shoe': 'shoes',
            'hat': 'hats',
            'dress': 'dresses',
            'jacket': 'jackets',
            'skirt': 'skirts'
        };
        
        const localCategory = categoryMapping[analysis.category];
        if (!localCategory || !this.clothingData[localCategory]) return;
        
        // Criar item no formato local
        const localItem = {
            id: puhekuplaItem.code,
            name: puhekuplaItem.code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            type: localCategory,
            rarity: 'nonhc', // Padrão
            image: puhekuplaItem.image,
            puhekuplaData: puhekuplaItem
        };
        
        // Adicionar à categoria
        if (!this.clothingData[localCategory].nonhc) {
            this.clothingData[localCategory].nonhc = [];
        }
        this.clothingData[localCategory].nonhc.push(localItem);
        
        console.log(`➕ Item Puhekupla adicionado: ${localItem.name} → ${localCategory}`);
    }
    
    // Contar itens de uma categoria
    countCategoryItems(categoryData) {
        let total = 0;
        ['nonhc', 'hc', 'sell', 'nft'].forEach(rarity => {
            if (categoryData[rarity] && Array.isArray(categoryData[rarity])) {
                total += categoryData[rarity].length;
            }
        });
        return total;
    }
    
    // Renderizar itens de uma categoria específica
    renderCategoryItems(grid, categoryData, categoryName) {
        const sections = [
            { id: 'nonhc', title: 'Roupas Normais', items: categoryData.nonhc || [] },
            { id: 'hc', title: 'Habbo Club', items: categoryData.hc || [] },
            { id: 'sell', title: 'Vendáveis', items: categoryData.sell || [] },
            { id: 'nft', title: 'NFT', items: categoryData.nft || [] }
        ];
        
        sections.forEach(section => {
            if (section.items && section.items.length > 0) {
                section.items.forEach(item => {
                    const clothingItem = this.createClothingItem(item, categoryName);
                    grid.appendChild(clothingItem);
                });
            }
        });
    }
    
    // Criar item de roupa individual
    createClothingItem(item, categoryName) {
        const clothingItem = document.createElement('div');
        clothingItem.className = `clothing-item ${this.getItemRarity(item)}`;
        clothingItem.dataset.id = item.id;
        clothingItem.dataset.category = categoryName;
        clothingItem.dataset.name = item.name;
        
        // Criar preview do item
        const img = document.createElement('img');
        
        // Priorizar imagem da Puhekupla se disponível
        let imageUrl;
        if (item.image && item.image.startsWith('https://content.puhekupla.com')) {
            imageUrl = item.image;
            console.log(`🎯 Usando imagem Puhekupla para ${item.name}: ${imageUrl}`);
        } else {
            imageUrl = this.generateOptimizedPreviewUrl(item);
            console.log(`🎯 Usando Habbo Imaging para ${item.name}: ${imageUrl}`);
        }
        
        img.src = imageUrl;
        img.alt = item.name;
        img.loading = "lazy";
        img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; border-radius: 6px;';
        
        // Tratamento de erro
        img.onerror = () => {
            this.showImagePlaceholder(clothingItem, item);
        };
        
        clothingItem.appendChild(img);
        clothingItem.addEventListener('click', () => this.selectClothing(item));
        
        return clothingItem;
    }
    
    // Determinar raridade do item
    getItemRarity(item) {
        if (item.rarity) return item.rarity;
        
        // Inferir raridade baseado no ID ou categoria
        if (item.id.includes('hc') || item.id.includes('100')) return 'hc';
        if (item.id.includes('sell') || item.id.includes('200')) return 'sell';
        if (item.id.includes('nft') || item.id.includes('300')) return 'nft';
        return 'nonhc';
    }
    
    // Obter nome de exibição da categoria
    getCategoryDisplayName(category) {
        const names = {
            'head': 'Rostos',
            'hair': 'Cabelos', 
            'hats': 'Chapéus',
            'shirts': 'Camisetas',
            'pants': 'Calças',
            'shoes': 'Sapatos',
            'skirts': 'Saias',
            'dresses': 'Vestidos',
            'suits': 'Trajes',
            'jackets': 'Jaquetas',
            'faceAccessories': 'Acessórios do Rosto',
            'headAccessories': 'Acessórios da Cabeça',
            'waistAccessories': 'Acessórios da Cintura'
        };
        return names[category] || category;
    }
    
    // Mostrar placeholder quando imagem falhar
    showImagePlaceholder(clothingItem, item) {
        // Esconder a imagem que falhou
        const img = clothingItem.querySelector('img');
        if (img) img.style.display = 'none';
        
        // Criar placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.textContent = item.name.substring(0, 3).toUpperCase();
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f0f0;
            color: #666;
            font-size: 10px;
            font-weight: bold;
            border-radius: 6px;
            text-align: center;
            padding: 5px;
            box-sizing: border-box;
        `;
        
        clothingItem.appendChild(placeholder);
        console.log(`📝 Placeholder criado para ${item.name}`);
    }
    
        generatePreviewFigure(item) {
        console.log(`🔍 Gerando figura para item: ${item.name} (${item.type}-${item.id})`);
        
        // Se o item já tem uma figura definida (estratégia HabboTemplarios), usar ela
        if (item.figure) {
            console.log(`✅ Usando figura pré-definida: ${item.figure}`);
            return item.figure;
        }
        
        // Garantir que temos uma cor válida
        const color = this.currentColor || item.color || '7'; // Cor padrão se não houver seleção
        console.log(`🎨 Cor selecionada para ${item.type}: ${color}`);
        
        // Para thumbnails do grid, criar previews otimizados que focam na região específica
        // Isso garante que cada item seja visualizado de forma clara e centralizada
        let generatedFigure;
        
        // Mapeamento completo de todos os tipos de itens com previews otimizados
        const typeMapping = {
            // Categorias principais - usar figura mínima para focar no item
            'hd': 'hd', // Cabeça
            'hr': 'hr', // Cabelo
            'ch': 'ch', // Camisa/Torso
            'lg': 'lg', // Calça/Pernas
            'sh': 'sh', // Sapatos
            
            // Acessórios - usar figura mínima para focar no acessório
            'ha': 'ha', // Chapéu
            'ea': 'ea', // Acessórios dos olhos
            'fa': 'fa', // Acessórios do rosto
            'he': 'he', // Acessórios do cabelo
            'cp': 'cp', // Acessórios do peito
            'ca': 'ca', // Acessórios do peito (alternativo)
            'wa': 'wa', // Acessórios da cintura
            
            // Roupas adicionais
            'cc': 'cc', // Jaqueta
            'dr': 'dr', // Vestido
            'sk': 'sk', // Saia
            'su': 'su', // Traje
            
            // Acessórios gerais
            'ac': 'ac', // Acessórios
            'bp': 'bp', // Mochila
            'bg': 'bg', // Bolsa
            
            // Itens especiais
            'wg': 'wg', // Asas
            'tl': 'tl', // Cauda
            'mk': 'mk', // Máscara
            'cs': 'cs', // Fantasia
            
            // Novas categorias
            'bd': 'bd', // Corpo/Peito
            'lh': 'lh', // Mão Esquerda
            'rh': 'rh'  // Mão Direita
        };
        
        // Se o tipo está mapeado, gerar figura específica
        if (typeMapping[item.type]) {
            // Criar figura mínima que foca apenas no item específico
            // Usar apenas o item atual + figura base mínima para contexto
            generatedFigure = `${item.type}-${item.id}-${color}-`;
            
            // Adicionar figura base mínima para contexto visual (opcional)
            // Isso ajuda a posicionar o item corretamente na preview
            const baseFigure = this.getBaseFigureForType(item.type);
            if (baseFigure) {
                generatedFigure = baseFigure + generatedFigure;
            }
            
            console.log(`✅ Tipo ${item.type} mapeado para figura otimizada: ${generatedFigure}`);
        } else {
            // Tipo não mapeado: usar formato genérico
            generatedFigure = `${item.type}-${item.id}-${color}-`;
            console.log(`⚠️ Tipo ${item.type} não mapeado, usando formato genérico: ${generatedFigure}`);
        }
        
        console.log(`🎯 Figura gerada para ${item.name}: ${generatedFigure}`);
        return generatedFigure;
    }
    
    // Nova função para obter figura base mínima para cada tipo de item
    getBaseFigureForType(type) {
        // Figura base mínima para cada categoria, focando apenas no essencial
        const baseFigures = {
            // Para roupas principais, usar figura base mínima
            'ch': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            'lg': 'hd-180-66-hr-100-66-ch-210-66-', // Cabeça + cabelo + camisa básica
            'sh': 'hd-180-66-hr-100-66-ch-210-66-lg-210-66-', // Cabeça + cabelo + camisa + calça básicas
            
            // Para acessórios, usar figura base mínima
            'ha': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            'ea': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            'fa': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            'he': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            'cp': 'hd-180-66-hr-100-66-ch-210-66-', // Cabeça + cabelo + camisa básica
            'wa': 'hd-180-66-hr-100-66-ch-210-66-lg-210-66-', // Cabeça + cabelo + camisa + calça básicas
            
            // Para outras categorias
            'cc': 'hd-180-66-hr-100-66-ch-210-66-', // Cabeça + cabelo + camisa básica
            'dr': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            'sk': 'hd-180-66-hr-100-66-ch-210-66-', // Cabeça + cabelo + camisa básica
            'su': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            
            // Para itens especiais
            'wg': 'hd-180-66-hr-100-66-ch-210-66-lg-210-66-', // Figura base completa
            'tl': 'hd-180-66-hr-100-66-ch-210-66-lg-210-66-', // Figura base completa
            'mk': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
            'cs': 'hd-180-66-hr-100-66-', // Cabeça + cabelo básicos
        };
        
        return baseFigures[type] || '';
    }
    
    buildFigureString(type, id, color) {
        console.log('🔧 Construindo string da figura...');
        console.log('📊 Figura atual:', this.currentFigure);
        
        const figure = { ...this.currentFigure };
        
        // Se um tipo específico foi fornecido, atualizar apenas esse tipo
        if (type && id && color !== undefined) {
            figure[type] = `${id}-${color}-`;
            console.log(`🔄 Tipo ${type} atualizado para: ${id}-${color}-`);
        }
        
        // Construir string da figura, filtrando campos vazios e metadados
        const filteredEntries = Object.entries(figure).filter(([key, value]) => {
            // Incluir apenas campos de roupa que tenham valor
            const shouldInclude = value && 
                   value !== '' && 
                   key !== 'gesture' && 
                   key !== 'action' && 
                   key !== 'actions' && 
                   key !== 'item' && 
                   key !== 'direction' && 
                   key !== 'headDirection' && 
                   key !== 'gender' && 
                   key !== 'size';
            
            if (shouldInclude) {
                console.log(`✅ Incluindo ${key}: ${value}`);
            } else {
                console.log(`❌ Excluindo ${key}: ${value}`);
            }
            
            return shouldInclude;
        });
        
        const figureString = filteredEntries.map(([key, value]) => `${key}-${value}`).join('.');
        
        console.log('🎯 String da figura construída:', figureString);
        return figureString;
    }
    
    selectClothing(item) {
        console.log(`🎯 Selecionando item: ${item.name} (${item.type}-${item.id})`);
        
        // Validar dados do item
        if (!item || !item.type || !item.id) {
            console.error('❌ Dados do item inválidos:', item);
            return;
        }
        
        // Remover seleção anterior
        document.querySelectorAll('.clothing-item.selected').forEach(el => el.classList.remove('selected'));
        
        // Adicionar seleção ao item clicado (usar o item passado como parâmetro)
        const clickedItem = document.querySelector(`[data-type="${item.type}"][data-id="${item.id}"]`);
        if (clickedItem) {
            clickedItem.classList.add('selected');
            console.log(`✅ Item marcado como selecionado: ${item.name}`);
        }
        
        // Determinar a cor a ser usada
        let colorToUse = this.currentColor;
        
        // Se o item tem uma cor específica e é diferente da cor atual, usar a cor do item
        if (item.color && item.color !== this.currentColor) {
            colorToUse = item.color;
            console.log(`🔄 Usando cor específica do item: ${item.color} (cor atual: ${this.currentColor})`);
        }
        
        // Atualizar figura atual com o item selecionado
        this.currentFigure[item.type] = `${item.id}-${colorToUse}-`;
        
        console.log(`✅ Item selecionado: ${item.type} ${item.id} com cor ${colorToUse}`);
        console.log('📊 Figura atual:', this.currentFigure);
        
        // Atualizar avatar
        this.updateAvatar();
        
        // Se a cor mudou, atualizar o grid para mostrar as novas cores
        if (colorToUse !== this.currentColor) {
            this.currentColor = colorToUse;
            this.renderClothingGrid();
        }
    }
    
    selectColor(color, index) {
        console.log(`🎨 Selecionando cor: ${color} (índice ${index})`);
        
        // Remover seleção anterior
        document.querySelectorAll('.color-item.selected').forEach(el => el.classList.remove('selected'));
        
        // Adicionar seleção à cor clicada (usar o elemento correto)
        const clickedColor = document.querySelector(`[data-color="${color}"][data-index="${index}"]`);
        if (clickedColor) {
            clickedColor.classList.add('selected');
            console.log(`✅ Cor marcada como selecionada: ${color}`);
        }
        
        // Atualizar cor atual
        this.currentColor = index.toString();
        
        console.log(`🎨 Cor selecionada: ${color} (índice ${index})`);
        
        // Atualizar todas as roupas selecionadas com a nova cor
        Object.keys(this.currentFigure).forEach(type => {
            if (this.currentFigure[type] && this.currentFigure[type] !== '') {
                // Extrair o ID da roupa atual
                const parts = this.currentFigure[type].split('-');
                if (parts.length >= 2) {
                    const itemId = parts[1];
                    // Atualizar com nova cor, garantindo que o tipo seja mantido
                    this.currentFigure[type] = `${type}-${itemId}-${index}-`;
                    console.log(`🔄 ${type} atualizado para cor ${index}: ${this.currentFigure[type]}`);
                }
            }
        });
        
        // Log da figura atualizada
        console.log('🎨 Figura atualizada após mudança de cor:', this.currentFigure);
        
        // Atualizar avatar com nova cor
        this.updateAvatar();
        
        // Re-renderizar grid de roupas com nova cor
        this.renderClothingGrid();
    }
    
    updateAvatar() {
        console.log('🔄 Atualizando avatar...');
        
        const avatarImg = document.getElementById('avatarImage');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (!avatarImg) {
            console.error('❌ Elemento avatarImage não encontrado');
            return;
        }
        
        if (!downloadBtn) {
            console.error('❌ Elemento downloadBtn não encontrado');
            return;
        }
        
        // Construir string da figura atual
        const figureString = this.buildFigureString();
        
        if (!figureString) {
            console.warn('⚠️ String da figura vazia, usando figura padrão');
            // Usar figura padrão se não houver itens selecionados
            const defaultFigure = `hd-190-7-.hr-100-7-.ch-210-66-.lg-270-82-.sh-290-80-`;
            
            // Construir parâmetro de ação como no HabboTemplarios (múltiplas ações)
            let actionParam = '';
            if (this.currentFigure.actions && this.currentFigure.actions.length > 0) {
                if (this.currentFigure.item && this.currentFigure.item !== '=0') {
                    // Se há item, adicionar crr=ID à lista de ações
                    const itemId = this.currentFigure.item.replace('=', '');
                    const actionsWithItem = [...this.currentFigure.actions];
                    if (!actionsWithItem.includes('crr')) {
                        actionsWithItem.push('crr');
                    }
                    actionParam = actionsWithItem.map(action => 
                        action === 'crr' ? `crr=${itemId}` : action
                    ).join(',');
                } else {
                    // Se não há item, apenas listar as ações
                    actionParam = this.currentFigure.actions.join(',');
                }
            }
            
            avatarImg.src = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${defaultFigure}&gender=${this.currentFigure.gender}&direction=${this.currentFigure.direction}&head_direction=${this.currentFigure.headDirection}&action=${actionParam}&gesture=${this.currentFigure.gesture}&size=l`;
            return;
        }
        
                    // Usar a estratégia do HabboTemplarios para gerar URLs (múltiplas ações)
            const config = window.HABBO_TEMPLARIOS_CONFIG;
            let avatarUrl;
            
            // Forçar uso do fallback para testar as ações
            const actionParam = this.buildActionParam();
            
            // Construir URL diretamente (fallback) - usando formato correto do Habbo Imaging
            const params = new URLSearchParams({
                figure: figureString,
                gender: this.currentFigure.gender,
                direction: this.currentFigure.direction,
                head_direction: this.currentFigure.headDirection,
                action: actionParam,
                gesture: this.currentFigure.gesture,
                size: 'l'
            });
            
            avatarUrl = `https://www.habbo.com/habbo-imaging/avatarimage?${params.toString()}`;
            console.log('✅ URL gerada via fallback direto (formato correto Habbo Imaging)');
            console.log(`🎭 Ação: ${actionParam || 'Nenhuma'}`);
            console.log(`😊 Expressão: ${this.currentFigure.gesture}`);
            console.log(`🤲 Item: ${this.currentFigure.item}`);
            console.log(`🔗 URL construída: ${avatarUrl}`);
        
        // Atualizar imagem e botão de download
        avatarImg.src = avatarUrl;
        downloadBtn.href = avatarUrl;
        downloadBtn.download = `habbo_${this.currentFigure.gender}_${Date.now()}.png`;
        
        // Log para debug
        console.log('🎯 Avatar atualizado:', {
            figure: figureString,
            gender: this.currentFigure.gender,
            direction: this.currentFigure.direction,
            headDirection: this.currentFigure.headDirection,
            actions: this.currentFigure.actions,
            actionParam: this.buildActionParam(),
            gesture: this.currentFigure.gesture,
            item: this.currentFigure.item,
            size: 'l',
            url: avatarUrl
        });
        
        // Debug adicional para ações
        console.log('🔍 DEBUG AÇÕES:');
        console.log('  - Ações ativas:', this.currentFigure.actions);
        console.log('  - Item na mão:', this.currentFigure.item);
        console.log('  - Parâmetro de ação construído:', this.buildActionParam());
        console.log('  - URL final:', avatarUrl);
        
        // Atualizar indicadores de direção
        this.updateDirectionIndicators();
    }
    
    // Construir parâmetro de ação (formato correto do Habbo Imaging)
    buildActionParam() {
        console.log(`🔍 buildActionParam() chamada:`);
        console.log(`  - this.currentFigure.actions:`, this.currentFigure.actions);
        console.log(`  - Tipo:`, typeof this.currentFigure.actions);
        console.log(`  - É array?`, Array.isArray(this.currentFigure.actions));
        console.log(`  - Comprimento:`, this.currentFigure.actions ? this.currentFigure.actions.length : 'undefined');
        
        if (!this.currentFigure.actions || this.currentFigure.actions.length === 0) {
            console.log(`❌ Nenhuma ação ativa, retornando string vazia`);
            return '';
        }
        
        if (this.currentFigure.item && this.currentFigure.item !== '=0') {
            // Se há item, adicionar crr=ID à lista de ações
            const itemId = this.currentFigure.item.replace('=', '');
            const actionsWithItem = [...this.currentFigure.actions];
            if (!actionsWithItem.includes('crr')) {
                actionsWithItem.push('crr');
            }
            
            // Construir parâmetro de ação no formato correto do Habbo Imaging
            const actionParams = actionsWithItem.map(action => {
                if (action === 'crr') {
                    return `crr=${itemId}`;
                } else {
                    return action;
                }
            });
            
            console.log(`🔧 Ações processadas: ${actionsWithItem.join(', ')}`);
            console.log(`🔧 Parâmetros de ação: ${actionParams.join(', ')}`);
            
            const result = actionParams.join(',');
            console.log(`✅ Retornando: "${result}"`);
            return result;
        } else {
            // Se não há item, apenas listar as ações
            const result = this.currentFigure.actions.join(',');
            console.log(`🔧 Ações sem item: ${result}`);
            console.log(`✅ Retornando: "${result}"`);
            return result;
        }
    }
    
    setupEventListeners() {
        // Navegação de categorias
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                this.currentCategory = item.dataset.category;
                this.renderClothingGrid();
            });
        });
        
        // Seletor de gênero
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentFigure.gender = btn.dataset.gender;
                this.updateAvatar();
                this.renderClothingGrid();
            });
        });
        
        // Controles de direção aprimorados
        document.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                const type = btn.dataset.type;
                
                if (type === 'head') {
                    this.rotateHead(direction);
                } else if (type === 'body') {
                    this.rotateBody(direction);
                }
                
                this.updateAvatar();
                this.updateDirectionIndicators();
            });
        });
        
        // Tamanho do avatar
        document.getElementById('avatarSize').addEventListener('change', (e) => {
            const selectedSize = e.target.value;
            console.log(`Tamanho selecionado: ${selectedSize}`);
            
            // O tamanho selecionado é usado apenas para referência
            // O preview principal sempre usa Big (l) para melhor visualização
            this.currentFigure.size = selectedSize;
            
            // Atualizar avatar (sempre em Big para preview)
            this.updateAvatar();
        });
        
        // Expressões (implementação exata do HabboTemplarios)
        document.querySelectorAll('.expression-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.expression-item').forEach(exp => exp.classList.remove('selected'));
                item.classList.add('selected');
                
                // Usar o valor exato do data-expression (como no HabboTemplarios)
                const expressionValue = item.dataset.expression;
                this.currentFigure.gesture = expressionValue;
                console.log(`😊 Expressão selecionada: ${expressionValue}`);
                this.updateAvatar();
            });
        });
        
        // Ações (implementação exata do HabboTemplarios - seleção única)
        document.querySelectorAll('.action-item').forEach(item => {
            item.addEventListener('click', () => {
                const actionValue = item.dataset.action;
                console.log(`🎭 Clicou na ação: ${actionValue}`);
                
                // Limpar seleção visual de todas as ações
                document.querySelectorAll('.action-item').forEach(act => act.classList.remove('selected'));
                
                if (actionValue === '') {
                    // "Nada" - limpar todas as ações
                    this.currentFigure.actions = [];
                    item.classList.add('selected');
                    console.log(`🎭 Todas as ações removidas`);
                } else {
                    // Selecionar apenas esta ação (como no HabboTemplarios)
                    this.currentFigure.actions = [actionValue];
                    item.classList.add('selected');
                    console.log(`🎭 Ação "${actionValue}" selecionada`);
                }
                
                console.log(`🎭 Ações ativas: ${this.currentFigure.actions.length > 0 ? this.currentFigure.actions.join(', ') : 'Nenhuma'}`);
                
                // Atualizar avatar
                this.updateAvatar();
            });
        });
        
        // Botão de atualizar
        document.getElementById('updateBtn').addEventListener('click', () => {
            this.updateAvatar();
        });
        
        // Nome do Habbo
        document.getElementById('habboName').addEventListener('input', (e) => {
            // Aqui você pode implementar lógica para salvar o nome
            console.log('Nome do Habbo:', e.target.value);
        });
        
        // Hotel selecionado
        document.getElementById('hotelSelect').addEventListener('click', (e) => {
            // Aqui você pode implementar lógica para mudar o hotel
            console.log('Hotel selecionado:', e.target.value);
        });
        
        // Selecionar primeira categoria por padrão
        document.querySelector('.nav-item[data-category="head"]').click();
        
        // Teste visual: marcar "Nada" como selecionado por padrão
        const nadaAction = document.querySelector('.action-item[data-action=""]');
        if (nadaAction) {
            nadaAction.classList.add('selected');
            console.log('✅ Ação "Nada" marcada como selecionada por padrão');
        }
        
        // Teste visual: marcar "Normal" como selecionado por padrão
        const normalExpression = document.querySelector('.expression-item[data-expression="nrm"]');
        if (normalExpression) {
            normalExpression.classList.add('selected');
            console.log('✅ Expressão "Normal" marcada como selecionada por padrão');
        }
        
        // Botão de debug
        document.getElementById('debugBtn').addEventListener('click', () => {
            this.debugUrls();
        });
        
        // Botão de teste de rotação
        const rotationTestBtn = document.createElement('button');
        rotationTestBtn.id = 'rotationTestBtn';
        rotationTestBtn.className = 'btn';
        rotationTestBtn.style.cssText = 'background: #9c27b0; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;';
        rotationTestBtn.innerHTML = '🔄 Teste Rotação';
        rotationTestBtn.addEventListener('click', () => this.testRotation());
        
        // Botão de teste de ações
        const actionsTestBtn = document.createElement('button');
        actionsTestBtn.id = 'actionsTestBtn';
        actionsTestBtn.className = 'btn';
        actionsTestBtn.style.cssText = 'background: #ff5722; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;';
        actionsTestBtn.innerHTML = '🎭 Teste Ações';
        actionsTestBtn.addEventListener('click', () => this.testActions());
        
        // Botão de carregar roupas completas
        const loadClothesBtn = document.createElement('button');
        loadClothesBtn.id = 'loadClothesBtn';
        loadClothesBtn.className = 'btn';
        loadClothesBtn.style.cssText = 'background: #4caf50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;';
        loadClothesBtn.innerHTML = '👕 Carregar Roupas Completas';
        loadClothesBtn.addEventListener('click', () => this.loadCompleteClothing());
        
        // Adicionar os botões ao lado do botão de debug
        document.getElementById('debugBtn').parentNode.appendChild(rotationTestBtn);
        document.getElementById('debugBtn').parentNode.appendChild(actionsTestBtn);
        document.getElementById('debugBtn').parentNode.appendChild(loadClothesBtn);
        
        // ===== SISTEMA DE ITENS NA MÃO =====
        
        // Itens na mão (implementação exata do HabboTemplarios)
        document.querySelectorAll('.item-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.item-item').forEach(itm => itm.classList.remove('selected'));
                item.classList.add('selected');
                
                this.currentFigure.item = item.dataset.item;
                console.log(`🎯 Item na mão selecionado: ${item.dataset.item}`);
                
                // Se selecionou um item (não "Nada"), ativar "Segurando" automaticamente
                if (item.dataset.item !== '=0') {
                    // Inicializar array de ações se não existir
                    if (!this.currentFigure.actions) {
                        this.currentFigure.actions = [];
                    }
                    
                    // Adicionar "Segurando" se não estiver ativo
                    if (!this.currentFigure.actions.includes('crr')) {
                        this.currentFigure.actions.push('crr');
                        
                        // Atualizar seleção visual da ação "crr"
                        const actionBtn = document.querySelector('.action-item[data-action="crr"]');
                        if (actionBtn) {
                            actionBtn.classList.add('selected');
                        }
                        
                        // Manter "Nada" desmarcado
                        document.querySelectorAll('.action-item[data-action=""]').forEach(act => act.classList.remove('selected'));
                        
                        console.log(`🎭 Ação "Segurando" (crr) adicionada automaticamente para permitir segurar item`);
                    }
                } else {
                    // Se selecionou "Nada", remover "Segurando" se não houver outras ações que precisem dele
                    if (this.currentFigure.actions.includes('crr')) {
                        const otherActionsThatNeedItems = this.currentFigure.actions.filter(action => 
                            action !== 'crr' && ['sit', 'lay', 'drk'].includes(action)
                        );
                        
                        if (otherActionsThatNeedItems.length === 0) {
                            // Remover "crr" apenas se não há outras ações que precisem de itens
                            this.currentFigure.actions = this.currentFigure.actions.filter(action => action !== 'crr');
                            
                            // Atualizar seleção visual
                            const crrBtn = document.querySelector('.action-item[data-action="crr"]');
                            if (crrBtn) {
                                crrBtn.classList.remove('selected');
                            }
                            
                            console.log(`🎭 Ação "Segurando" (crr) removida (não há itens para segurar)`);
                        }
                    }
                }
                
                this.updateAvatar();
            });
        });
        
        // Busca de usuários
        const searchUserBtn = document.getElementById('searchUserBtn');
        if (searchUserBtn) {
            searchUserBtn.addEventListener('click', () => {
                this.searchUser();
            });
        }
        
        // Carregar avatar do usuário
        const loadUserAvatarBtn = document.getElementById('loadUserAvatarBtn');
        if (loadUserAvatarBtn) {
            loadUserAvatarBtn.addEventListener('click', () => {
                this.loadUserAvatar();
            });
        }
    }
    
    debugUrls() {
        console.log('=== DEBUG ESTRATÉGIA HABBO TEMPLARIOS ===');
        console.log('Categoria atual:', this.currentCategory);
        console.log('Cor atual:', this.currentColor);
        console.log('Gênero atual:', this.currentFigure.gender);
        console.log('Ações ativas:', this.currentFigure.actions);
        console.log('Parâmetro de ação:', this.buildActionParam());
        
        const categoryData = this.clothingData[this.currentCategory];
        if (categoryData) {
            Object.entries(categoryData).forEach(([rarity, items]) => {
                if (items.length > 0) {
                    console.log(`\n--- ${rarity.toUpperCase()} ---`);
                    items.slice(0, 5).forEach(item => { // Mostrar os primeiros 5 de cada categoria
                        if (item.imageUrl) {
                            // Item com URL direta (estratégia HabboTemplarios)
                            console.log(`${item.name} (${item.type}):`);
                            console.log(`  Figura: ${item.figure || 'N/A'}`);
                            console.log(`  URL: ${item.imageUrl}`);
                            console.log(`  Raridade: ${item.rarity}`);
                        } else {
                            // Item sem URL direta (fallback)
                            const previewFigure = this.generatePreviewFigure(item);
                            const url = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${previewFigure}&gender=${this.currentFigure.gender}&size=m`;
                            console.log(`${item.name} (${item.type}):`);
                            console.log(`  Figura: ${previewFigure}`);
                            console.log(`  URL: ${url}`);
                            console.log(`  Raridade: ${item.rarity}`);
                        }
                    });
                }
            });
        }
        
        // Mostrar estatísticas
        const totalItems = Object.values(categoryData || {}).flat().length;
        const directUrlItems = Object.values(categoryData || {}).flat().filter(item => item.imageUrl).length;
        const fallbackItems = totalItems - directUrlItems;
        
        console.log('\n=== ESTATÍSTICAS ===');
        console.log(`Total de itens: ${totalItems}`);
        console.log(`URLs diretas: ${directUrlItems}`);
        console.log(`Fallback: ${fallbackItems}`);
        console.log(`Cobertura direta: ${((directUrlItems / totalItems) * 100).toFixed(1)}%`);
        
        // Mostrar exemplo de URL completa
        const exampleItem = { type: 'ch', id: '210', name: 'Camisa Exemplo' };
        const exampleFigure = this.generatePreviewFigure(exampleItem);
        const exampleUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${exampleFigure}&gender=${this.currentFigure.gender}&size=m`;
        console.log('\n=== EXEMPLO COMPLETO ===');
        console.log('Item:', exampleItem);
        console.log('Figura gerada:', exampleFigure);
        console.log('URL completa:', exampleUrl);
        
        // Mostrar diferença da estratégia HabboTemplarios
        console.log('\n=== ESTRATÉGIA HABBO TEMPLARIOS ===');
        console.log('✅ URLs diretas da API do Habbo');
        console.log('✅ Figuras mínimas (só a roupa)');
        console.log('✅ Carregamento eficiente');
        console.log('✅ Sem contexto desnecessário');
    }
    
    // Testar rotação do avatar
    testRotation() {
        console.log('🔄 === TESTE DE ROTAÇÃO ===');
        console.log('Direção inicial do corpo:', this.currentFigure.direction);
        console.log('Direção inicial da cabeça:', this.currentFigure.headDirection);
        
        // Testar rotação do corpo
        console.log('\n--- Testando rotação do corpo ---');
        for (let i = 0; i < 8; i++) {
            this.rotateBody('right');
            console.log(`Corpo: ${this.currentFigure.direction} - ${this.getDirectionName(this.currentFigure.direction)}`);
        }
        
        // Resetar para direção 2
        this.currentFigure.direction = 2;
        
        // Testar rotação da cabeça
        console.log('\n--- Testando rotação da cabeça ---');
        for (let i = 0; i < 8; i++) {
            this.rotateHead('right');
            console.log(`Cabeça: ${this.currentFigure.headDirection} - ${this.getDirectionName(this.currentFigure.headDirection)}`);
        }
        
        // Resetar para direção 2
        this.currentFigure.headDirection = 2;
        
        // Atualizar avatar
        this.updateAvatar();
        this.updateDirectionIndicators();
        
        console.log('✅ Teste de rotação concluído!');
    }
    
    // Teste de ações para debug
    testActions() {
        console.log('🎭 === TESTE DE AÇÕES ===');
        console.log('Estado atual das ações:', this.currentFigure.actions);
        console.log('Tipo das ações:', typeof this.currentFigure.actions);
        console.log('É array?', Array.isArray(this.currentFigure.actions));
        
        // Testar adição de ação
        if (!this.currentFigure.actions) {
            this.currentFigure.actions = [];
            console.log('🔧 Array de ações inicializado');
        }
        
        console.log('Adicionando ação "sit"...');
        this.currentFigure.actions.push('sit');
        console.log('Ações após adicionar sit:', this.currentFigure.actions);
        
        // Testar buildActionParam
        const actionParam = this.buildActionParam();
        console.log('Parâmetro de ação construído:', actionParam);
        
        // Atualizar avatar
        console.log('Atualizando avatar...');
        this.updateAvatar();
        
        // Limpar ações após teste
        setTimeout(() => {
            console.log('Limpando ações de teste...');
            this.currentFigure.actions = [];
            this.updateAvatar();
        }, 3000);
    }
    
    // Carregar roupas completas de forma simples e direta
    loadCompleteClothing() {
        console.log('🔄 Carregando roupas completas...');
        
        // Usar o novo sistema baseado na API oficial do Habbo
        this.loadOfficialHabboClothing();
        
        // Renderizar grid visual após carregar dados
        setTimeout(() => {
            this.showAllCategories();
        }, 100);
    }

    // Dados básicos de fallback
    generateBasicClothingData() {
        console.log('🔄 Usando dados básicos de fallback...');
        
        return {
            'head': {
                nonhc: [
                    { id: 'hd-100-7-', name: 'Cabeça Básica', type: 'hd', gender: 'U' }
                ],
                hc: [], sell: [], nft: []
            },
            'hair': {
                nonhc: [
                    { id: 'hr-100-7-', name: 'Cabelo Básico', type: 'hr', gender: 'U' }
                ],
                hc: [], sell: [], nft: []
            },
            'shirts': {
                nonhc: [
                    { id: 'ch-100-7-', name: 'Camiseta Básica', type: 'ch', gender: 'U' }
                ],
                hc: [], sell: [], nft: []
            },
            'pants': {
                nonhc: [
                    { id: 'lg-100-7-', name: 'Calça Básica', type: 'lg', gender: 'U' }
                ],
                hc: [], sell: [], nft: []
            },
            'shoes': {
                nonhc: [
                    { id: 'sh-100-7-', name: 'Sapato Básico', type: 'sh', gender: 'U' }
                ],
                hc: [], sell: [], nft: []
            }
        };
    }

    // Geradores de itens por categoria
    generateHeadItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['hd-100', 'hd-101', 'hd-102', 'hd-103', 'hd-104', 'hd-105', 'hd-106', 'hd-107'];
        const names = ['Cabeça Clássica', 'Cabeça Moderna', 'Cabeça Estilo', 'Cabeça Casual', 'Cabeça Formal', 'Cabeça Esportiva', 'Cabeça Elegante', 'Cabeça Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'hd',
                swf: `head_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateHairItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['hr-100', 'hr-101', 'hr-102', 'hr-103', 'hr-104', 'hr-105', 'hr-106', 'hr-107'];
        const names = ['Cabelo Clássico', 'Cabelo Moderno', 'Cabelo Estilo', 'Cabelo Casual', 'Cabelo Formal', 'Cabelo Esportivo', 'Cabelo Elegante', 'Cabelo Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'hr',
                swf: `hair_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateHatItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['ha-100', 'ha-101', 'ha-102', 'ha-103', 'ha-104', 'ha-105', 'ha-106', 'ha-107'];
        const names = ['Chapéu Clássico', 'Chapéu Moderno', 'Chapéu Estilo', 'Chapéu Casual', 'Chapéu Formal', 'Chapéu Esportivo', 'Chapéu Elegante', 'Chapéu Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'ha',
                swf: `hat_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateShirtItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['ch-100', 'ch-101', 'ch-102', 'ch-103', 'ch-104', 'ch-105', 'ch-106', 'ch-107'];
        const names = ['Camiseta Clássica', 'Camiseta Moderna', 'Camiseta Estilo', 'Camiseta Casual', 'Camiseta Formal', 'Camiseta Esportiva', 'Camiseta Elegante', 'Camiseta Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'ch',
                swf: `shirt_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generatePantsItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['lg-100', 'lg-101', 'lg-102', 'lg-103', 'lg-104', 'lg-105', 'lg-106', 'lg-107'];
        const names = ['Calça Clássica', 'Calça Moderna', 'Calça Estilo', 'Calça Casual', 'Calça Formal', 'Calça Esportiva', 'Calça Elegante', 'Calça Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'lg',
                swf: `pants_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateShoeItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['sh-100', 'sh-101', 'sh-102', 'sh-103', 'sh-104', 'sh-105', 'sh-106', 'sh-107'];
        const names = ['Sapato Clássico', 'Sapato Moderno', 'Sapato Estilo', 'Sapato Casual', 'Sapato Formal', 'Sapato Esportivo', 'Sapato Elegante', 'Sapato Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'sh',
                swf: `shoes_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateSkirtItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['lg-200', 'lg-201', 'lg-202', 'lg-203', 'lg-204', 'lg-205', 'lg-206', 'lg-207'];
        const names = ['Saia Clássica', 'Saia Moderna', 'Saia Estilo', 'Saia Casual', 'Saia Formal', 'Saia Esportiva', 'Saia Elegante', 'Saia Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'lg',
                swf: `skirt_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'F'
            });
        });
        
        return items;
    }

    generateDressItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['ch-200', 'ch-201', 'ch-202', 'ch-203', 'ch-204', 'ch-205', 'ch-206', 'ch-207'];
        const names = ['Vestido Clássico', 'Vestido Moderno', 'Vestido Estilo', 'Vestido Casual', 'Vestido Formal', 'Vestido Esportivo', 'Vestido Elegante', 'Vestido Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'ch',
                swf: `dress_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'F'
            });
        });
        
        return items;
    }

    generateSuitItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['ch-300', 'ch-301', 'ch-302', 'ch-303', 'ch-304', 'ch-305', 'ch-306', 'ch-307'];
        const names = ['Traje Clássico', 'Traje Moderno', 'Traje Estilo', 'Traje Casual', 'Traje Formal', 'Traje Esportivo', 'Traje Elegante', 'Traje Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'ch',
                swf: `suit_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'M'
            });
        });
        
        return items;
    }

    generateJacketItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['ch-400', 'ch-401', 'ch-402', 'ch-403', 'ch-404', 'ch-405', 'ch-406', 'ch-407'];
        const names = ['Jaqueta Clássica', 'Jaqueta Moderna', 'Jaqueta Estilo', 'Jaqueta Casual', 'Jaqueta Formal', 'Jaqueta Esportiva', 'Jaqueta Elegante', 'Jaqueta Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'ch',
                swf: `jacket_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateFaceAccessoryItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['ea-100', 'ea-101', 'ea-102', 'ea-103', 'ea-104', 'ea-105', 'ea-106', 'ea-107'];
        const names = ['Óculos Clássico', 'Óculos Moderno', 'Óculos Estilo', 'Óculos Casual', 'Óculos Formal', 'Óculos Esportivo', 'Óculos Elegante', 'Óculos Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'ea',
                swf: `acc_eye_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateHeadAccessoryItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['ha-200', 'ha-201', 'ha-202', 'ha-203', 'ha-204', 'ha-205', 'ha-206', 'ha-207'];
        const names = ['Acessório Clássico', 'Acessório Moderno', 'Acessório Estilo', 'Acessório Casual', 'Acessório Formal', 'Acessório Esportivo', 'Acessório Elegante', 'Acessório Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'ha',
                swf: `acc_head_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }

    generateWaistAccessoryItems(rarity = 'nonhc') {
        const items = [];
        const baseIds = ['wa-100', 'wa-101', 'wa-102', 'wa-103', 'wa-104', 'wa-105', 'wa-106', 'wa-107'];
        const names = ['Cinto Clássico', 'Cinto Moderno', 'Cinto Estilo', 'Cinto Casual', 'Cinto Formal', 'Cinto Esportivo', 'Cinto Elegante', 'Cinto Vintage'];
        
        baseIds.forEach((baseId, index) => {
            items.push({
                id: `${baseId}-7-`,
                name: names[index],
                type: 'wa',
                swf: `acc_waist_${rarity === 'nft' ? 'U_nft' : 'U'}_${index + 1}.swf`,
                gender: 'U'
            });
        });
        
        return items;
    }
    
    // Encontrar categoria por padrão
    findCategoryByPattern(pattern) {
        const patternMap = {
            'hr': 'head',
            'hd': 'head',
            'ha': 'hair',
            'he': 'hats',
            'ch': 'shirts',
            'lg': 'pants',
            'sh': 'shoes',
            'sk': 'skirts',
            'dr': 'dresses',
            'su': 'suits',
            'ja': 'jackets',
            'ea': 'faceAccessories',
            'fa': 'headAccessories',
            'wa': 'waistAccessories'
        };
        
        return patternMap[pattern];
    }
    
    // Converter para formato do editor (estrutura padrão)
    convertToEditorFormat(pattern, items) {
        console.log(`🔧 Convertendo ${pattern} para formato do editor:`, items);
        
        // Extrair IDs dos arrays male e female
        const maleIds = Array.isArray(items.male) ? items.male : [];
        const femaleIds = Array.isArray(items.female) ? items.female : [];
        
        // Combinar todos os IDs únicos
        const allIds = [...new Set([...maleIds, ...femaleIds])];
        const total = allIds.length;
        
        console.log(`   IDs masculinos: ${maleIds.length}, IDs femininos: ${femaleIds.length}, Total único: ${total}`);
        
        if (total === 0) {
            console.log(`⚠️ Nenhum ID válido encontrado para ${pattern}`);
            return {
                nonhc: [],
                hc: [],
                sell: [],
                nft: [],
                total: 0
            };
        }
        
        // Distribuir por raridade (simplificado)
        const nonhc = allIds.slice(0, Math.floor(total * 0.7));
        const hc = allIds.slice(Math.floor(total * 0.7), Math.floor(total * 0.9));
        const sell = allIds.slice(Math.floor(total * 0.9), Math.floor(total * 0.95));
        const nft = allIds.slice(Math.floor(total * 0.95));
        
        const result = {
            nonhc: nonhc.map(id => ({ id: `${pattern}-${id}-7-`, name: `${pattern.toUpperCase()} ${id}` })),
            hc: hc.map(id => ({ id: `${pattern}-${id}-7-`, name: `${pattern.toUpperCase()} ${id}` })),
            sell: sell.map(id => ({ id: `${pattern}-${id}-7-`, name: `${pattern.toUpperCase()} ${id}` })),
            nft: nft.map(id => ({ id: `${pattern}-${id}-7-`, name: `${pattern.toUpperCase()} ${id}` })),
            total: total
        };
        
        console.log(`   Resultado: nonhc(${result.nonhc.length}), hc(${result.hc.length}), sell(${result.sell.length}), nft(${result.nft.length})`);
        
        return result;
    }
    
    // Converter para formato do editor (estrutura habbo_discovered_items)
    convertFromDiscoveredItems(pattern, items) {
        console.log(`🔧 Convertendo ${pattern} de habbo_discovered_items:`, items);
        
        if (!Array.isArray(items) || items.length === 0) {
            console.log(`⚠️ Nenhum item válido para ${pattern}`);
            return {
                nonhc: [],
                hc: [],
                sell: [],
                nft: [],
                total: 0
            };
        }
        
        // Extrair IDs dos itens
        const allIds = items.map(item => {
            if (typeof item === 'object' && item.id) {
                return item.id;
            } else if (typeof item === 'string') {
                return item;
            } else if (typeof item === 'number') {
                return item.toString();
            }
            return null;
        }).filter(id => id !== null);
        
        const total = allIds.length;
        console.log(`   IDs extraídos: ${total}`);
        
        // Distribuir por raridade (simplificado)
        const nonhc = allIds.slice(0, Math.floor(total * 0.7));
        const hc = allIds.slice(Math.floor(total * 0.7), Math.floor(total * 0.9));
        const sell = allIds.slice(Math.floor(total * 0.9), Math.floor(total * 0.95));
        const nft = allIds.slice(Math.floor(total * 0.95));
        
        const result = {
            nonhc: nonhc.map(id => ({ 
                id: `${pattern}-${id}-7-`, 
                name: `${pattern.toUpperCase()} ${id}` 
            })),
            hc: hc.map(id => ({ 
                id: `${pattern}-${id}-7-`, 
                name: `${pattern.toUpperCase()} ${id}` 
            })),
            sell: sell.map(id => ({ 
                id: `${pattern}-${id}-7-`, 
                name: `${pattern.toUpperCase()} ${id}` 
            })),
            nft: nft.map(id => ({ 
                id: `${pattern}-${id}-7-`, 
                name: `${pattern.toUpperCase()} ${id}` 
            })),
            total: total
        };
        
        console.log(`   Resultado: nonhc(${result.nonhc.length}), hc(${result.hc.length}), sell(${result.sell.length}), nft(${result.nft.length})`);
        
        return result;
    }
    
    // Descoberta inteligente de roupas do Habbo (versão simplificada)
    async massClothingDiscovery() {
        console.log('👕 === DESCOBERTA INTELIGENTE DE ROUPAS ===');
        
        // Categorias com ranges otimizados para descoberta rápida
        const categories = {
            'hr': { name: 'Rostos', ranges: [[1, 100], [1000, 1500]], gender: 'both', type: 'face' },
            'hd': { name: 'Cabeças', ranges: [[1, 100], [1000, 1500]], gender: 'both', type: 'head' },
            'ch': { name: 'Camisas', ranges: [[1, 50], [100, 300], [1000, 1500]], gender: 'both', type: 'shirt' },
            'lg': { name: 'Calças', ranges: [[1, 50], [100, 300], [1000, 1500]], gender: 'both', type: 'pants' },
            'sh': { name: 'Sapatos', ranges: [[1, 50], [100, 300], [1000, 1500]], gender: 'both', type: 'shoes' },
            'ha': { name: 'Cabelos', ranges: [[1, 200], [1000, 3000], [10000, 15000]], gender: 'both', type: 'hair' },
            'he': { name: 'Chapéus', ranges: [[1, 100], [100, 500], [1000, 2000]], gender: 'both', type: 'hat' },
            'ea': { name: 'Acessórios Rosto', ranges: [[1, 50], [100, 300]], gender: 'both', type: 'face_acc' },
            'fa': { name: 'Acessórios Cabeça', ranges: [[1, 50], [100, 300]], gender: 'both', type: 'head_acc' },
            'wa': { name: 'Acessórios Cintura', ranges: [[1, 50], [100, 300]], gender: 'both', type: 'waist_acc' }
        };
        
        const discoveredItems = {};
        let totalDiscovered = 0;
        
        for (const [pattern, config] of Object.entries(categories)) {
            console.log(`🔍 Explorando categoria: ${config.name} (${pattern}) - Tipo: ${config.type}`);
            discoveredItems[pattern] = { male: [], female: [], unisex: [] };
            
            // Testar múltiplos ranges de IDs
            for (const [start, end] of config.ranges) {
                console.log(`  📍 Testando range: ${start}-${end}`);
                
                for (let id = start; id <= end; id++) {
                    // Testar masculino (usando size=M como no grid)
                    const maleUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${pattern}-${id}-7-&gender=M&size=M`;
                    const femaleUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${pattern}-${id}-7-&gender=F&size=M`;
                    
                    try {
                        // Testar masculino
                        const maleExists = await this.testImageExists(maleUrl);
                        if (maleExists) {
                            discoveredItems[pattern].male.push(id);
                            totalDiscovered++;
                            console.log(`✅ ${config.name} ${id} (M) - ${config.type} - ${maleUrl}`);
                        }
                        
                        // Testar feminino
                        const femaleExists = await this.testImageExists(femaleUrl);
                        if (femaleExists) {
                            discoveredItems[pattern].female.push(id);
                            totalDiscovered++;
                            console.log(`✅ ${config.name} ${id} (F) - ${config.type} - ${femaleUrl}`);
                        }
                        
                        // Aguardar um pouco para não sobrecarregar (reduzido para acelerar)
                        await new Promise(resolve => setTimeout(resolve, 10));
                        
                    } catch (error) {
                        // Continua para o próximo ID
                    }
                    
                    // Mostrar progresso a cada 100 itens
                    if (id % 100 === 0) {
                        console.log(`📊 Progresso ${config.name}: ${id}/${end} - Total descoberto: ${totalDiscovered}`);
                    }
                }
            }
            
            console.log(`🎯 ${config.name} concluído: M(${discoveredItems[pattern].male.length}) F(${discoveredItems[pattern].female.length})`);
        }
        
        console.log('🎉 DESCOBERTA INTELIGENTE CONCLUÍDA!');
        console.log('📊 RESULTADOS:', discoveredItems);
        console.log(`🏆 Total de itens descobertos: ${totalDiscovered}`);
        
        // Salvar no localStorage para uso posterior
        localStorage.setItem('habboMassDiscovery', JSON.stringify(discoveredItems));
        
        return discoveredItems;
    }
    
    // Testar se uma imagem existe
    async testImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    // Buscar usuário pelo nome (estratégia HabboTemplarios)
    async searchUser() {
        const username = document.getElementById('habboName').value.trim();
        const hotel = document.getElementById('hotelSelect').value;
        
        if (!username) {
            alert('Por favor, digite um nome de usuário para buscar.');
            return;
        }
        
        const searchResult = document.getElementById('userSearchResult');
        const userInfo = document.getElementById('userInfo');
        
        searchResult.style.display = 'block';
        userInfo.innerHTML = '🔍 Buscando usuário...';
        
        try {
            const config = window.HABBO_TEMPLARIOS_CONFIG;
            if (config && config.utils) {
                const userData = await config.utils.searchUserByName(username, hotel);
                
                if (userData && userData.length > 0) {
                    const user = userData[0];
                    userInfo.innerHTML = `
                        <div style="margin-bottom: 15px;">
                            <strong>👤 Nome:</strong> ${user.name}<br>
                            <strong>🏨 Hotel:</strong> ${hotel.toUpperCase()}<br>
                            <strong>🎭 Figura:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${user.figureString || 'N/A'}</code>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <a href="https://www.habbo.${hotel}/profile/${user.name}" target="_blank" style="color: #007bff; text-decoration: none; display: inline-block; margin-right: 10px;">
                                👤 Ver Perfil
                            </a>
                            <button onclick="window.habboEditor.loadUserAvatar()" style="background: #28a745; color: white; padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">
                                🎭 Carregar Avatar
                            </button>
                        </div>
                    `;
                    
                    // Armazenar dados do usuário para uso posterior
                    this.searchedUser = user;
                    
                    console.log('✅ Usuário encontrado:', user);
                    console.log('📊 Figura do avatar:', user.figureString);
                } else {
                    userInfo.innerHTML = '❌ Usuário não encontrado. Verifique o nome e o hotel.';
                    this.searchedUser = null;
                }
            } else {
                userInfo.innerHTML = '❌ Configuração do HabboTemplarios não encontrada.';
            }
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            userInfo.innerHTML = '❌ Erro ao buscar usuário. Tente novamente.';
        }
    }
    
    // Carregar avatar de um usuário existente
    async loadUserAvatar() {
        if (!this.searchedUser) {
            alert('Primeiro busque um usuário para carregar o avatar.');
            return;
        }
        
        try {
            const config = window.HABBO_TEMPLARIOS_CONFIG;
            if (config && config.utils) {
                const userAvatar = await config.utils.loadUserAvatar(this.searchedUser.name, this.searchedUser.hotel || 'com.br');
                
                if (userAvatar) {
                    // Atualizar figura atual com os dados do usuário
                    this.currentFigure = this.parseFigureString(userAvatar.figure);
                    this.currentFigure.gender = this.searchedUser.gender || 'M';
                    
                    // Inicializar array de ações se não existir
                    if (!this.currentFigure.actions) {
                        this.currentFigure.actions = [];
                    }
                    
                    // Atualizar avatar
                    this.updateAvatar();
                    
                    // Atualizar interface
                    this.updateClothingGrid();
                    
                    // Mostrar mensagem de sucesso
                    const userInfo = document.getElementById('userInfo');
                    if (userInfo) {
                        userInfo.innerHTML += '<div style="margin-top: 10px; color: #28a745; font-weight: bold;">✅ Avatar carregado com sucesso!</div>';
                    }
                    
                    console.log('✅ Avatar do usuário carregado:', userAvatar);
                    console.log('📊 Figura parseada:', this.currentFigure);
                } else {
                    alert('Erro ao carregar avatar do usuário.');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar avatar:', error);
            alert('Erro ao carregar avatar do usuário.');
        }
    }
    
    // Converter string de figura em objeto de figura
    parseFigureString(figureString) {
        const figure = {
            hr: '', hd: '', ch: '', lg: '', sh: '', ha: '', he: '', ea: '', fa: '', cp: '', cc: '', ca: '', wa: '',
            gesture: 'nrm', actions: [], item: '=0', direction: 2, headDirection: 2, gender: 'M', size: 'size=l'
        };
        
        if (figureString) {
            const parts = figureString.split('.');
            parts.forEach(part => {
                const [type, ...values] = part.split('-');
                if (figure.hasOwnProperty(type)) {
                    figure[type] = values.join('-') + '-';
                }
            });
        }
        
        return figure;
    }

    // Rotacionar cabeça do avatar (8 direções do Habbo)
    rotateHead(direction) {
        const currentDirection = this.currentFigure.headDirection;
        
        if (direction === 'left') {
            // Rotacionar para a esquerda (decrementar)
            this.currentFigure.headDirection = (currentDirection - 1 + 8) % 8;
        } else if (direction === 'right') {
            // Rotacionar para a direita (incrementar)
            this.currentFigure.headDirection = (currentDirection + 1) % 8;
        }
        
        console.log(`Cabeça rotacionada para direção: ${this.currentFigure.headDirection} (${this.getDirectionName(this.currentFigure.headDirection)})`);
    }

    // Rotacionar corpo do avatar (8 direções do Habbo)
    rotateBody(direction) {
        const currentDirection = this.currentFigure.direction;
        
        if (direction === 'left') {
            // Rotacionar para a esquerda (decrementar)
            this.currentFigure.direction = (currentDirection - 1 + 8) % 8;
        } else if (direction === 'right') {
            // Rotacionar para a direita (incrementar)
            this.currentFigure.direction = (currentDirection + 1) % 8;
        }
        
        console.log(`Corpo rotacionado para direção: ${this.currentFigure.direction} (${this.getDirectionName(this.currentFigure.direction)})`);
    }

    // Obter nome da direção para debug
    getDirectionName(direction) {
        const directions = [
            'Norte (0)',      // 0 - Para cima
            'Nordeste (1)',   // 1 - Diagonal superior direita
            'Leste (2)',      // 2 - Para direita
            'Sudeste (3)',    // 3 - Diagonal inferior direita
            'Sul (4)',        // 4 - Para baixo
            'Sudoeste (5)',   // 5 - Diagonal inferior esquerda
            'Oeste (6)',      // 6 - Para esquerda
            'Noroeste (7)'    // 7 - Diagonal superior esquerda
        ];
        return directions[direction] || 'Desconhecida';
    }

    // Atualizar indicadores de direção na interface
    updateDirectionIndicators() {
        const headIndicator = document.getElementById('headDirectionIndicator');
        const bodyIndicator = document.getElementById('bodyDirectionIndicator');
        
        if (headIndicator) {
            headIndicator.textContent = this.currentFigure.headDirection;
        }
        
        if (bodyIndicator) {
            bodyIndicator.textContent = this.currentFigure.direction;
        }
    }
    
    // ===== SISTEMA DE DESCOBERTA AUTOMÁTICA =====
    
    // Extrair dados dos editores e carregar automaticamente
    async extractAndLoadEditorsData() {
        this.showDiscoveryStatus('📊 Extraindo dados dos editores...', true);
        
        try {
            // Usar o extrator de dados dos editores
            const extractor = new HabboEditorsDataExtractor();
            const extractedData = await extractor.runCompleteAnalysis();
            
            if (extractedData && Object.keys(extractedData).length > 0) {
                // Converter dados extraídos para o formato do editor
                const convertedData = this.convertExtractedDataToEditorFormat(extractedData);
                
                // Atualizar o editor com os dados extraídos
                this.updateClothingDataWithExtracted(convertedData);
                
                // Salvar no localStorage para uso futuro
                this.saveExtractedData(convertedData);
                
                const totalItems = this.countTotalItems(convertedData);
                this.showDiscoveryStatus(`✅ Dados extraídos e carregados! ${totalItems} itens disponíveis no editor.`, false);
                
                // Re-renderizar o grid com os novos dados
                this.renderClothingGrid();
                
            } else {
                this.showDiscoveryStatus('❌ Nenhum dado extraído dos editores.', false);
            }
        } catch (error) {
            console.error('Erro ao extrair dados dos editores:', error);
            this.showDiscoveryStatus('❌ Erro na extração: ' + error.message, false);
        }
    }
    
    // Carregar assets SWF e exibir no grid
    async loadSWFAssets() {
        this.showDiscoveryStatus('🎮 Carregando assets SWF...', true);
        
        try {
            // Inicializar o sistema de exibição SWF
            const swfDisplay = new SWFAssetsDisplay();
            await swfDisplay.mapAvailableSWFAssets();
            
            // Gerar dados de roupas dos assets SWF
            const swfClothingData = swfDisplay.generateClothingDataFromSWF();
            
            if (swfClothingData && Object.keys(swfClothingData).length > 0) {
                // Atualizar o editor com os dados SWF
                this.updateClothingDataWithSWF(swfClothingData);
                
                // Salvar no localStorage para uso futuro
                this.saveSWFData(swfClothingData);
                
                const totalItems = this.countTotalItems(swfClothingData);
                this.showDiscoveryStatus(`✅ Assets SWF carregados! ${totalItems} itens disponíveis no editor.`, false);
                
                // Re-renderizar o grid com os novos dados
                this.renderClothingGrid();
                
                console.log('🎮 Assets SWF carregados com sucesso:', swfClothingData);
                
            } else {
                this.showDiscoveryStatus('❌ Nenhum asset SWF encontrado.', false);
            }
        } catch (error) {
            console.error('Erro ao carregar assets SWF:', error);
            this.showDiscoveryStatus('❌ Erro ao carregar SWF: ' + error.message, false);
        }
    }
    
    // Atualizar dados de roupas com assets SWF
    updateClothingDataWithSWF(swfData) {
        console.log('🔄 Atualizando dados com assets SWF...');
        
        Object.entries(swfData).forEach(([category, rarities]) => {
            if (!this.clothingData[category]) {
                this.clothingData[category] = { nonhc: [], hc: [], sell: [], nft: [] };
            }
            
            Object.entries(rarities).forEach(([rarity, items]) => {
                if (Array.isArray(items)) {
                    // Adicionar novos itens aos existentes
                    this.clothingData[category][rarity].push(...items);
                }
            });
        });
        
        console.log('✅ Dados atualizados com assets SWF:', this.clothingData);
    }
    
    // Salvar dados SWF no localStorage
    saveSWFData(data) {
        try {
            const swfData = {
                data: data,
                timestamp: Date.now(),
                source: 'swf_assets'
            };
            localStorage.setItem('habbo_swf_assets_data', JSON.stringify(swfData));
            console.log('💾 Dados SWF salvos no localStorage');
        } catch (error) {
            console.error('❌ Erro ao salvar dados SWF:', error);
        }
    }
    
    // Converter dados extraídos para o formato do editor
    convertExtractedDataToEditorFormat(extractedData) {
        const converted = {};
        
        // Mapear categorias
        const categoryMapping = {
            'head': 'head',
            'hair': 'hair', 
            'hats': 'hats',
            'shirts': 'shirts',
            'pants': 'pants',
            'shoes': 'shoes'
        };
        
        Object.entries(extractedData).forEach(([category, items]) => {
            if (categoryMapping[category] && Array.isArray(items)) {
                converted[categoryMapping[category]] = {
                    nonhc: [],
                    hc: [],
                    sell: [],
                    nft: []
                };
                
                items.forEach(item => {
                    const convertedItem = {
                        id: item.id,
                        name: item.name,
                        type: item.type,
                        rarity: this.mapRarity(item.rarity),
                        figure: this.generateFigureString(item.type, item.id),
                        color: this.getDefaultColorForType(item.type)
                    };
                    
                    // Categorizar por raridade
                    const rarity = this.mapRarity(item.rarity);
                    converted[categoryMapping[category]][rarity].push(convertedItem);
                });
            }
        });
        
        return converted;
    }
    
    // Mapear raridade dos editores para o formato do editor
    mapRarity(editorRarity) {
        const rarityMap = {
            'common': 'nonhc',
            'rare': 'hc',
            'hc': 'hc',
            'sell': 'sell',
            'nft': 'nft'
        };
        return rarityMap[editorRarity] || 'nonhc';
    }
    
    // Gerar string de figura para o item
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
    
    // Atualizar dados de roupas com dados extraídos
    updateClothingDataWithExtracted(extractedData) {
        Object.entries(extractedData).forEach(([category, categoryData]) => {
            if (!this.clothingData[category]) {
                this.clothingData[category] = { nonhc: [], hc: [], sell: [], nft: [] };
            }
            
            // Adicionar novos itens sem duplicatas
            Object.entries(categoryData).forEach(([rarity, items]) => {
                items.forEach(newItem => {
                    const exists = this.clothingData[category][rarity].some(
                        existing => existing.id === newItem.id && existing.type === newItem.type
                    );
                    
                    if (!exists) {
                        this.clothingData[category][rarity].push(newItem);
                        // Adicionar informações SWF se disponíveis
                        if (newItem.swfFile) {
                            newItem.swfPath = './assets/swf/' + newItem.swfFile;
                        }
                    }
                });
            });
        });
        
        console.log('✅ Dados de roupas atualizados com dados extraídos:', this.clothingData);
    }
    
    // Salvar dados extraídos no localStorage
    saveExtractedData(data) {
        try {
            const extractedData = {
                data: data,
                timestamp: Date.now(),
                source: 'editors_extractor'
            };
            localStorage.setItem('habbo_extracted_editors_data', JSON.stringify(extractedData));
            console.log('💾 Dados extraídos salvos no localStorage');
        } catch (error) {
            console.error('❌ Erro ao salvar dados extraídos:', error);
        }
    }
    
    // Carregar dados extraídos do localStorage
    loadExtractedData() {
        try {
            const data = localStorage.getItem('habbo_extracted_editors_data');
            if (data) {
                const parsed = JSON.parse(data);
                console.log('📂 Dados extraídos carregados do localStorage');
                return parsed.data;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados extraídos:', error);
        }
        return null;
    }
    
    // Iniciar descoberta rápida
    async startQuickDiscovery() {
        try {
            this.showDiscoveryStatus('🔍 Iniciando descoberta rápida...', true);
            
            console.log('🚀 Iniciando descoberta rápida de roupas...');
            const discoveredItems = await quickDiscovery();
            
            // Salvar itens descobertos
            this.discoveredItems = discoveredItems;
            this.saveDiscoveredItems(discoveredItems);
            
            // Atualizar dados de roupas
            this.updateClothingDataWithDiscovered(discoveredItems);
            
            this.showDiscoveryStatus(`✅ Descoberta rápida concluída! ${this.countTotalItems(discoveredItems)} itens encontrados`, false);
            console.log('🎯 Descoberta rápida concluída:', discoveredItems);
            
        } catch (error) {
            console.error('❌ Erro na descoberta rápida:', error);
            this.showDiscoveryStatus(`❌ Erro: ${error.message}`, false);
        }
    }
    
    // Iniciar descoberta completa
    async startFullDiscovery() {
        try {
            this.showDiscoveryStatus('🧠 Iniciando descoberta completa (pode demorar alguns minutos)...', true);
            
            console.log('🚀 Iniciando descoberta completa de roupas...');
            const discovery = new HabboDiscoverySystem();
            const discoveredItems = await discovery.discoverWithPatterns();
            
            // Salvar itens descobertos
            this.discoveredItems = discoveredItems;
            discovery.saveDiscoveredItems(discoveredItems);
            
            // Atualizar dados de roupas
            this.updateClothingDataWithDiscovered(discoveredItems);
            
            this.showDiscoveryStatus(`✅ Descoberta completa concluída! ${this.countTotalItems(discoveredItems)} itens encontrados`, false);
            console.log('🎯 Descoberta completa concluída:', discoveredItems);
            
        } catch (error) {
            console.error('❌ Erro na descoberta completa:', error);
            this.showDiscoveryStatus(`❌ Erro: ${error.message}`, false);
        }
    }
    
    // Exportar dados descobertos
    exportDiscoveredData() {
        if (!this.discoveredItems || Object.keys(this.discoveredItems).length === 0) {
            alert('Nenhum dado descoberto para exportar. Execute uma descoberta primeiro.');
            return;
        }
        
        try {
            const discovery = new HabboDiscoverySystem();
            discovery.exportToJSON(this.discoveredItems);
            console.log('📤 Dados exportados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao exportar:', error);
            alert('Erro ao exportar dados');
        }
    }
    
    // Carregar dados descobertos do cache
    loadDiscoveredData() {
        try {
            let totalLoaded = 0;
            
            // Tentar carregar dados extraídos dos editores primeiro
            const extractedData = this.loadExtractedData();
            if (extractedData) {
                this.updateClothingDataWithExtracted(extractedData);
                totalLoaded += this.countTotalItems(extractedData);
                console.log('📂 Dados dos editores carregados:', extractedData);
            }
            
            // Carregar dados descobertos
            const discovery = new HabboDiscoverySystem();
            const cachedItems = discovery.loadDiscoveredItems();
            
            if (cachedItems) {
                this.discoveredItems = cachedItems;
                this.updateClothingDataWithDiscovered(cachedItems);
                totalLoaded += this.countTotalItems(cachedItems);
                console.log('📂 Dados de descoberta carregados do cache:', cachedItems);
            }
            
            // Carregar dados SWF
            const swfData = localStorage.getItem('habbo_swf_assets_data');
            if (swfData) {
                const parsed = JSON.parse(swfData);
                if (parsed.data) {
                    this.updateClothingDataWithSWF(parsed.data);
                    totalLoaded += this.countTotalItems(parsed.data);
                    console.log('🎮 Dados SWF carregados:', parsed.data);
                }
            }
            
            if (totalLoaded > 0) {
                this.showDiscoveryStatus(`📂 Cache carregado! ${totalLoaded} itens encontrados`, false);
                // Re-renderizar o grid
                this.renderClothingGrid();
            } else {
                this.showDiscoveryStatus('📂 Nenhum cache encontrado', false);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar cache:', error);
            this.showDiscoveryStatus(`❌ Erro: ${error.message}`, false);
        }
    }
    
    // Atualizar dados de roupas com itens descobertos
    updateClothingDataWithDiscovered(discoveredItems) {
        if (!discoveredItems) return;
        
        // Converter formato descoberto para formato do editor
        Object.entries(discoveredItems).forEach(([category, items]) => {
            if (!this.clothingData[category]) {
                this.clothingData[category] = { nonhc: [], hc: [], sell: [], nft: [] };
            }
            
            items.forEach(item => {
                const clothingItem = {
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    rarity: item.rarity,
                    color: item.color,
                    figure: item.figure
                };
                
                // Adicionar à categoria correta
                if (this.clothingData[category][item.rarity]) {
                    this.clothingData[category][item.rarity].push(clothingItem);
                }
            });
        });
        
        console.log('🔄 Dados de roupas atualizados com itens descobertos');
    }
    
    // Salvar itens descobertos
    saveDiscoveredItems(items) {
        try {
            const data = {
                items: items,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem('habbo_discovered_items', JSON.stringify(data));
            console.log('💾 Itens salvos no localStorage');
        } catch (error) {
            console.error('❌ Erro ao salvar itens:', error);
        }
    }
    
    // Mostrar status da descoberta
    showDiscoveryStatus(message, isActive) {
        const statusDiv = document.getElementById('discoveryStatus');
        const progressDiv = document.getElementById('discoveryProgress');
        
        if (statusDiv && progressDiv) {
            statusDiv.style.display = 'block';
            progressDiv.textContent = message;
            
            if (isActive) {
                statusDiv.style.background = '#fff3cd';
                progressDiv.innerHTML = `${message} <span style="animation: pulse 1s infinite;">⏳</span>`;
            } else {
                statusDiv.style.background = '#d4edda';
            }
        }
    }
    
    // Contar total de itens
    countTotalItems(items) {
        if (!items) return 0;
        return Object.values(items).flat().length;
    }

    // Gerar figura de preview otimizada para o grid (focada na região específica)
    generatePreviewFigure(item) {
        if (!item || !item.type) {
            console.warn('❌ Item inválido para gerar preview:', item);
            return '';
        }

        // Para o grid, retornar figura otimizada baseada no tipo
        if (item.figure) {
            // Se já temos uma figura definida, usar ela
            return item.figure;
        }

        // Gerar figura básica baseada no tipo
        const type = item.type;
        const id = item.id || '100';
        const color = item.color || this.getDefaultColorForType(type);

        // Retornar apenas a figura do item específico
        return `${type}-${id}-${color}-`;
    }

    // Gerar URL otimizada para preview baseada no tipo de item
    generateOptimizedPreviewUrl(item) {
        if (!item || !item.type) {
            return '';
        }

        const figure = this.generatePreviewFigure(item);
        const type = item.type;
        
        // Configurações específicas por tipo para melhor foco
        let zoom = '1.0';
        let offsetX = '0';
        let offsetY = '0';
        
        switch (type) {
            case 'hd': // Cabeças/Rostos
                zoom = '1.5';
                offsetY = '-20';
                break;
            case 'hr': // Cabelos
                zoom = '1.3';
                offsetY = '-15';
                break;
            case 'ha': // Chapéus
                zoom = '1.4';
                offsetY = '-25';
                break;
            case 'ch': // Camisas
                zoom = '1.2';
                offsetY = '0';
                break;
            case 'lg': // Calças
                zoom = '1.1';
                offsetY = '10';
                break;
            case 'sh': // Sapatos
                zoom = '1.3';
                offsetY = '30';
                break;
            case 'ea': // Acessórios dos Olhos
                zoom = '1.6';
                offsetY = '-20';
                break;
            case 'fa': // Acessórios do Rosto
                zoom = '1.5';
                offsetY = '-15';
                break;
            case 'he': // Acessórios da Cabeça
                zoom = '1.4';
                offsetY = '-25';
                break;
            default:
                zoom = '1.0';
                offsetX = '0';
                offsetY = '0';
        }

        // URL base do Habbo Imaging com parâmetros de zoom e posicionamento
        return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${this.currentFigure.gender}&size=l&zoom=${zoom}&offset_x=${offsetX}&offset_y=${offsetY}`;
    }

    createClothingItem(item, rarity) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `clothing-item ${rarity}`;
        itemDiv.setAttribute('data-item-id', item.id);
        itemDiv.setAttribute('data-item-type', item.type);
        itemDiv.setAttribute('data-item-rarity', rarity);
        itemDiv.setAttribute('data-item-gender', item.gender || 'U');
        
        // Verificar se o item deve ser exibido baseado no gênero ativo
        if (!this.shouldShowItemForCurrentGender(item)) {
            itemDiv.style.display = 'none';
        }
        
        // Gerar URL direta do Habbo Imaging API
        const imageUrl = this.generateDirectHabboImageUrl(item);
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = item.name;
        img.className = 'clothing-image';
        
        // Fallback para erro de carregamento
        img.onerror = () => {
            console.warn(`❌ Falha ao carregar imagem para ${item.name} (${item.id})`);
            // Tentar URL alternativa
            const fallbackUrl = this.generateFallbackImageUrl(item);
            if (fallbackUrl !== imageUrl) {
                img.src = fallbackUrl;
            } else {
                // Mostrar placeholder se não houver alternativa
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAxNkMyMy4xNjM0IDE2IDE2IDIzLjE2MzQgMTYgMzJDMTYgNDAuODM2NiAyMy4xNjM0IDQ4IDMyIDQ4QzQwLjgzNjYgNDggNDggNDAuODM2NiA0OCAzMkM0OCAyMy4xNjM0IDQwLjgzNjYgMTYgMzIgMTZaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0zMiAyMEMyNC4yNjg0IDIwIDE4IDI2LjI2ODQgMTggMzRDMThgNDEuNzMxNiAyNC4yNjg0IDQ4IDMyIDQ4QzM5LjczMTYgNDggNDYgNDEuNzMxNiA0NiAzNEM0NiAyNi4yNjg0IDM5LjczMTYgMjAgMzIgMjBaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyNEMyOC42ODYzIDI0IDI2IDI2LjY4NjMgMjYgMzBDMjYgMzMuMzEzNyAyOC42ODYzIDM2IDMyIDM2QzM1LjMxMzcgMzYgMzggMzMuMzEzNyAzOCAzMEMzOCAyNi42ODYzIDM1LjMxMzcgMjQgMzIgMjRaIiBmaWxsPSIjOUI5QkEwIi8+Cjwvc3ZnPgo=';
            }
        };
        
        img.onload = () => {
            console.log(`✅ Imagem carregada com sucesso: ${item.name} (${item.id})`);
        };
        
        // Nome do item (tooltip)
        const nameDiv = document.createElement('div');
        nameDiv.className = 'clothing-item-name';
        nameDiv.textContent = item.name;
        
        // Indicador de gênero
        const genderDiv = document.createElement('div');
        genderDiv.className = 'clothing-gender';
        genderDiv.textContent = this.getGenderLabel(item.gender);
        
        itemDiv.appendChild(img);
        itemDiv.appendChild(nameDiv);
        itemDiv.appendChild(genderDiv);
        
        // Adicionar evento de clique
        itemDiv.addEventListener('click', () => {
            this.selectClothingItem(item, rarity);
        });
        
        return itemDiv;
    }

    // Gerar URL direta do Habbo Imaging API
    generateDirectHabboImageUrl(item) {
        // Construir figura básica com o item
        let figure = '';
        
        // Adicionar o item atual à figura
        if (item.type === 'hd') figure += item.id;
        else if (item.type === 'hr') figure += item.id;
        else if (item.type === 'ha') figure += item.id;
        else if (item.type === 'ch') figure += item.id;
        else if (item.type === 'lg') figure += item.id;
        else if (item.type === 'sh') figure += item.id;
        else if (item.type === 'ea') figure += item.id;
        else if (item.type === 'wa') figure += item.id;
        
        // Adicionar partes básicas se não existirem
        if (!figure.includes('hd')) figure = 'hd-100-7-' + figure;
        if (!figure.includes('hr')) figure = 'hr-100-7-' + figure;
        if (!figure.includes('ch')) figure = 'ch-100-7-' + figure;
        if (!figure.includes('lg')) figure = 'lg-100-7-' + figure;
        if (!figure.includes('sh')) figure = 'sh-100-7-' + figure;
        
        // Construir URL do Habbo Imaging
        const params = new URLSearchParams({
            figure: figure,
            size: 'l',
            direction: '2',
            head_direction: '2',
            gesture: 'sml',
            action: ''
        });
        
        return `https://www.habbo.com/habbo-imaging/avatarimage?${params.toString()}`;
    }

    // Gerar URL alternativa se a primeira falhar
    generateFallbackImageUrl(item) {
        // Tentar com figura mais simples
        let figure = '';
        
        if (item.type === 'hd') figure = item.id;
        else if (item.type === 'hr') figure = item.id;
        else if (item.type === 'ha') figure = item.id;
        else if (item.type === 'ch') figure = item.id;
        else if (item.type === 'lg') figure = item.id;
        else if (item.type === 'sh') figure = item.id;
        else if (item.type === 'ea') figure = item.id;
        else if (item.type === 'wa') figure = item.id;
        
        // Adicionar apenas o essencial
        if (!figure.includes('hd')) figure = 'hd-100-7-' + figure;
        if (!figure.includes('hr')) figure = 'hr-100-7-' + figure;
        
        const params = new URLSearchParams({
            figure: figure,
            size: 'm',
            direction: '2',
            head_direction: '2'
        });
        
        return `https://www.habbo.com/habbo-imaging/avatarimage?${params.toString()}`;
    }

    // Testar e validar URLs do Habbo Imaging
    async testHabboImagingUrls() {
        console.log('🧪 Testando URLs do Habbo Imaging...');
        
        const testResults = {};
        const testItems = [
            // IDs que sabemos que funcionam
            { id: 'hd-100-7-', type: 'hd', name: 'Cabeça Básica' },
            { id: 'hr-100-7-', type: 'hr', name: 'Cabelo Básico' },
            { id: 'ch-100-7-', type: 'ch', name: 'Camiseta Básica' },
            { id: 'lg-100-7-', type: 'lg', name: 'Calça Básica' },
            { id: 'sh-100-7-', type: 'sh', name: 'Sapato Básico' },
            { id: 'ha-100-7-', type: 'ha', name: 'Chapéu Básico' },
            { id: 'ea-100-7-', type: 'ea', name: 'Óculos Básico' },
            { id: 'wa-100-7-', type: 'wa', name: 'Cinto Básico' }
        ];
        
        for (const item of testItems) {
            const url = this.generateDirectHabboImageUrl(item);
            const isValid = await this.testImageUrl(url);
            testResults[item.type] = { valid: isValid, url: url };
            console.log(`${item.type}: ${isValid ? '✅' : '❌'} ${url}`);
        }
        
        console.log('📊 Resultados dos testes:', testResults);
        return testResults;
    }

    // Testar se uma URL de imagem é válida
    testImageUrl(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
            
            // Timeout após 5 segundos
            setTimeout(() => resolve(false), 5000);
        });
    }

    // Gerar roupas baseadas em IDs testados e válidos
    generateValidClothingData() {
        console.log('🎯 Gerando roupas com IDs válidos...');
        
        // IDs que sabemos que funcionam no Habbo
        const validIds = {
            'hd': ['hd-100', 'hd-101', 'hd-102', 'hd-103', 'hd-104', 'hd-105', 'hd-106', 'hd-107'],
            'hr': ['hr-100', 'hr-101', 'hr-102', 'hr-103', 'hr-104', 'hr-105', 'hr-106', 'hr-107'],
            'ha': ['ha-100', 'ha-101', 'ha-102', 'ha-103', 'ha-104', 'ha-105', 'ha-106', 'ha-107'],
            'ch': ['ch-100', 'ch-101', 'ch-102', 'ch-103', 'ch-104', 'ch-105', 'ch-106', 'ch-107'],
            'lg': ['lg-100', 'lg-101', 'lg-102', 'lg-103', 'lg-104', 'lg-105', 'lg-106', 'lg-107'],
            'sh': ['sh-100', 'sh-101', 'sh-102', 'sh-103', 'sh-104', 'sh-105', 'sh-106', 'sh-107'],
            'ea': ['ea-100', 'ea-101', 'ea-102', 'ea-103', 'ea-104', 'ea-105', 'ea-106', 'ea-107'],
            'wa': ['wa-100', 'wa-101', 'wa-102', 'wa-103', 'wa-104', 'wa-105', 'wa-106', 'wa-107']
        };
        
        const names = {
            'hd': ['Cabeça Clássica', 'Cabeça Moderna', 'Cabeça Estilo', 'Cabeça Casual', 'Cabeça Formal', 'Cabeça Esportiva', 'Cabeça Elegante', 'Cabeça Vintage'],
            'hr': ['Cabelo Clássico', 'Cabelo Moderno', 'Cabelo Estilo', 'Cabelo Casual', 'Cabelo Formal', 'Cabelo Esportivo', 'Cabelo Elegante', 'Cabelo Vintage'],
            'ha': ['Chapéu Clássico', 'Chapéu Moderno', 'Chapéu Estilo', 'Chapéu Casual', 'Chapéu Formal', 'Chapéu Esportivo', 'Chapéu Elegante', 'Chapéu Vintage'],
            'ch': ['Camiseta Clássica', 'Camiseta Moderna', 'Camiseta Estilo', 'Camiseta Casual', 'Camiseta Formal', 'Camiseta Esportiva', 'Camiseta Elegante', 'Camiseta Vintage'],
            'lg': ['Calça Clássica', 'Calça Moderna', 'Calça Estilo', 'Calça Casual', 'Calça Formal', 'Calça Esportiva', 'Calça Elegante', 'Calça Vintage'],
            'sh': ['Sapato Clássico', 'Sapato Moderno', 'Sapato Estilo', 'Sapato Casual', 'Sapato Formal', 'Sapato Esportivo', 'Sapato Elegante', 'Sapato Vintage'],
            'ea': ['Óculos Clássico', 'Óculos Moderno', 'Óculos Estilo', 'Óculos Casual', 'Óculos Formal', 'Óculos Esportivo', 'Óculos Elegante', 'Óculos Vintage'],
            'wa': ['Cinto Clássico', 'Cinto Moderno', 'Cinto Estilo', 'Cinto Casual', 'Cinto Formal', 'Cinto Esportivo', 'Cinto Elegante', 'Cinto Vintage']
        };
        
        const categories = {
            'head': { type: 'hd', gender: 'U' },
            'hair': { type: 'hr', gender: 'U' },
            'hats': { type: 'ha', gender: 'U' },
            'shirts': { type: 'ch', gender: 'U' },
            'pants': { type: 'lg', gender: 'U' },
            'shoes': { type: 'sh', gender: 'U' },
            'faceAccessories': { type: 'ea', gender: 'U' },
            'waistAccessories': { type: 'wa', gender: 'U' }
        };
        
        const clothingData = {};
        
        Object.entries(categories).forEach(([category, config]) => {
            const type = config.type;
            const gender = config.gender;
            
            clothingData[category] = {
                nonhc: validIds[type].map((id, index) => ({
                    id: `${id}-7-`,
                    name: names[type][index],
                    type: type,
                    gender: gender
                })),
                hc: [],
                sell: [],
                nft: []
            };
        });
        
        // Adicionar categorias específicas por gênero
        clothingData['skirts'] = {
            nonhc: validIds['lg'].map((id, index) => ({
                id: `${id.replace('lg-', 'lg-2')}-7-`,
                name: `Saia ${names['lg'][index].replace('Calça', 'Saia')}`,
                type: 'lg',
                gender: 'F'
            })),
            hc: [], sell: [], nft: []
        };
        
        clothingData['dresses'] = {
            nonhc: validIds['ch'].map((id, index) => ({
                id: `${id.replace('ch-', 'ch-2')}-7-`,
                name: `Vestido ${names['ch'][index].replace('Camiseta', 'Vestido')}`,
                type: 'ch',
                gender: 'F'
            })),
            hc: [], sell: [], nft: []
        };
        
        clothingData['suits'] = {
            nonhc: validIds['ch'].map((id, index) => ({
                id: `${id.replace('ch-', 'ch-3')}-7-`,
                name: `Traje ${names['ch'][index].replace('Camiseta', 'Traje')}`,
                type: 'ch',
                gender: 'M'
            })),
            hc: [], sell: [], nft: []
        };
        
        clothingData['jackets'] = {
            nonhc: validIds['ch'].map((id, index) => ({
                id: `${id.replace('ch-', 'ch-4')}-7-`,
                name: `Jaqueta ${names['ch'][index].replace('Camiseta', 'Jaqueta')}`,
                type: 'ch',
                gender: 'U'
            })),
            hc: [], sell: [], nft: []
        };
        
        return clothingData;
    }

    // Sistema de roupas baseado na API oficial do Habbo
    async loadOfficialHabboClothing() {
        console.log('🔄 Carregando roupas da API oficial do Habbo...');
        
        try {
            // Tentar carregar da API oficial
            const response = await fetch('https://www.habbo.com/api/public/figuredata/latest');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dados da API oficial carregados:', data);
                this.processOfficialHabboData(data);
            } else {
                throw new Error(`API retornou status ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível carregar da API oficial, usando dados estáticos:', error);
            // Fallback para dados estáticos
            this.loadStaticClothingData();
        }
    }

    // Processar dados da API oficial do Habbo
    processOfficialHabboData(data) {
        console.log('🔧 Processando dados oficiais do Habbo...');
        
        const clothingData = {};
        const { partSets = [], genders = [] } = data;
        
        // Mapear tipos para categorias do editor
        const typeToCategory = {
            'hd': 'head',      // Corpo
            'hr': 'hair',      // Cabelo
            'ha': 'hats',      // Chapéus
            'ch': 'shirts',    // Camisetas
            'lg': 'pants',     // Calças
            'sh': 'shoes',     // Sapatos
            'ea': 'faceAccessories', // Acessórios do rosto
            'wa': 'waistAccessories', // Acessórios da cintura
            'he': 'headAccessories',  // Acessórios da cabeça
            'fa': 'faceAccessories',  // Acessórios do rosto (alternativo)
            'cc': 'chestAccessories', // Acessórios do peito
            'cp': 'chestAccessories'  // Acessórios do peito (alternativo)
        };
        
        // Processar cada tipo de roupa
        partSets.forEach(partSet => {
            const { type, parts = [] } = partSet;
            const category = typeToCategory[type];
            
            if (!category) {
                console.log(`⚠️ Tipo não mapeado: ${type}`);
                return;
            }
            
            // Organizar por gênero e raridade
            const organized = this.organizePartsByGenderAndRarity(parts, type);
            
            clothingData[category] = organized;
            console.log(`✅ Categoria ${category} processada: ${parts.length} itens`);
        });
        
        // Adicionar categorias específicas por gênero
        this.addGenderSpecificCategories(clothingData);
        
        this.clothingData = clothingData;
        console.log('🎉 Dados oficiais processados com sucesso!');
        console.log('📊 Categorias disponíveis:', Object.keys(clothingData));
        
        // Renderizar grid visual
        this.showAllCategories();
    }

    // Organizar partes por gênero e raridade
    organizePartsByGenderAndRarity(parts, type) {
        const organized = {
            nonhc: [],
            hc: [],
            sell: [],
            nft: []
        };
        
        parts.forEach(part => {
            const { id, gender, index = 0 } = part;
            
            // Determinar raridade baseada no ID (simplificado)
            let rarity = 'nonhc';
            if (id >= 1000 && id < 2000) rarity = 'hc';
            else if (id >= 2000 && id < 3000) rarity = 'sell';
            else if (id >= 3000) rarity = 'nft';
            
            const item = {
                id: `${type}-${id}-${index}-`,
                name: this.generateItemName(type, id, gender),
                type: type,
                gender: gender,
                originalId: id,
                index: index
            };
            
            organized[rarity].push(item);
        });
        
        return organized;
    }

    // Gerar nome do item baseado no tipo e ID
    generateItemName(type, id, gender) {
        const typeNames = {
            'hd': 'Corpo',
            'hr': 'Cabelo',
            'ha': 'Chapéu',
            'ch': 'Camiseta',
            'lg': 'Calça',
            'sh': 'Sapato',
            'ea': 'Óculos',
            'wa': 'Cinto',
            'he': 'Acessório Cabeça',
            'fa': 'Acessório Rosto',
            'cc': 'Acessório Peito',
            'cp': 'Acessório Peito'
        };
        
        const genderNames = {
            'M': 'Masculino',
            'F': 'Feminino',
            'U': 'Unissex'
        };
        
        const baseName = typeNames[type] || type.toUpperCase();
        const genderName = genderNames[gender] || 'Unissex';
        
        return `${baseName} ${id} ${genderName}`;
    }

    // Adicionar categorias específicas por gênero
    addGenderSpecificCategories(clothingData) {
        // Saias (femininas)
        if (clothingData.pants) {
            clothingData.skirts = {
                nonhc: clothingData.pants.nonhc
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('lg-', 'lg-2'),
                        name: item.name.replace('Calça', 'Saia'),
                        type: 'lg'
                    })),
                hc: clothingData.pants.hc
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('lg-', 'lg-2'),
                        name: item.name.replace('Calça', 'Saia'),
                        type: 'lg'
                    })),
                sell: clothingData.pants.sell
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('lg-', 'lg-2'),
                        name: item.name.replace('Calça', 'Saia'),
                        type: 'lg'
                    })),
                nft: clothingData.pants.nft
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('lg-', 'lg-2'),
                        name: item.name.replace('Calça', 'Saia'),
                        type: 'lg'
                    }))
            };
        }
        
        // Vestidos (femininos)
        if (clothingData.shirts) {
            clothingData.dresses = {
                nonhc: clothingData.shirts.nonhc
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-2'),
                        name: item.name.replace('Camiseta', 'Vestido'),
                        type: 'ch'
                    })),
                hc: clothingData.shirts.hc
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-2'),
                        name: item.name.replace('Camiseta', 'Vestido'),
                        type: 'ch'
                    })),
                sell: clothingData.shirts.sell
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-2'),
                        name: item.name.replace('Camiseta', 'Vestido'),
                        type: 'ch'
                    })),
                nft: clothingData.shirts.nft
                    .filter(item => item.gender === 'F')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-2'),
                        name: item.name.replace('Camiseta', 'Vestido'),
                        type: 'ch'
                    }))
            };
        }
        
        // Trajes (masculinos)
        if (clothingData.shirts) {
            clothingData.suits = {
                nonhc: clothingData.shirts.nonhc
                    .filter(item => item.gender === 'M')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-3'),
                        name: item.name.replace('Camiseta', 'Traje'),
                        type: 'ch'
                    })),
                hc: clothingData.shirts.hc
                    .filter(item => item.gender === 'M')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-3'),
                        name: item.name.replace('Camiseta', 'Traje'),
                        type: 'ch'
                    })),
                sell: clothingData.shirts.sell
                    .filter(item => item.gender === 'M')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-3'),
                        name: item.name.replace('Camiseta', 'Traje'),
                        type: 'ch'
                    })),
                nft: clothingData.shirts.nft
                    .filter(item => item.gender === 'M')
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-3'),
                        name: item.name.replace('Camiseta', 'Traje'),
                        type: 'ch'
                    }))
            };
        }
        
        // Jaquetas (unissex)
        if (clothingData.shirts) {
            clothingData.jackets = {
                nonhc: clothingData.shirts.nonhc
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-4'),
                        name: item.name.replace('Camiseta', 'Jaqueta'),
                        type: 'ch'
                    })),
                hc: clothingData.shirts.hc
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-4'),
                        name: item.name.replace('Camiseta', 'Jaqueta'),
                        type: 'ch'
                    })),
                sell: clothingData.shirts.sell
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-4'),
                        name: item.name.replace('Camiseta', 'Jaqueta'),
                        type: 'ch'
                    })),
                nft: clothingData.shirts.nft
                    .map(item => ({
                        ...item,
                        id: item.id.replace('ch-', 'ch-4'),
                        name: item.name.replace('Camiseta', 'Jaqueta'),
                        type: 'ch'
                    }))
            };
        }
    }

    // Dados estáticos de fallback (baseados na API oficial)
    loadStaticClothingData() {
        console.log('🔄 Carregando dados estáticos de fallback...');
        
        // Dados baseados nos IDs reais do Habbo que funcionaram
        this.clothingData = {
            'head': {
                nonhc: [
                    // Rostos masculinos (IDs reais que funcionaram)
                    { id: 'hd-180-7-', name: 'Rosto 180 Masculino', type: 'hd', gender: 'M', originalId: 180, index: 7 },
                    { id: 'hd-185-7-', name: 'Rosto 185 Masculino', type: 'hd', gender: 'M', originalId: 185, index: 7 },
                    { id: 'hd-190-7-', name: 'Rosto 190 Masculino', type: 'hd', gender: 'M', originalId: 190, index: 7 },
                    { id: 'hd-195-7-', name: 'Rosto 195 Masculino', type: 'hd', gender: 'M', originalId: 195, index: 7 },
                    { id: 'hd-200-7-', name: 'Rosto 200 Masculino', type: 'hd', gender: 'M', originalId: 200, index: 7 },
                    { id: 'hd-205-7-', name: 'Rosto 205 Masculino', type: 'hd', gender: 'M', originalId: 205, index: 7 },
                    { id: 'hd-206-7-', name: 'Rosto 206 Masculino', type: 'hd', gender: 'M', originalId: 206, index: 7 },
                    { id: 'hd-207-7-', name: 'Rosto 207 Masculino', type: 'hd', gender: 'M', originalId: 207, index: 7 },
                    { id: 'hd-208-7-', name: 'Rosto 208 Masculino', type: 'hd', gender: 'M', originalId: 208, index: 7 },
                    { id: 'hd-209-7-', name: 'Rosto 209 Masculino', type: 'hd', gender: 'M', originalId: 209, index: 7 },
                    
                    // Rostos femininos (IDs reais que funcionaram)
                    { id: 'hd-6001-7-', name: 'Rosto 6001 Feminino', type: 'hd', gender: 'F', originalId: 6001, index: 7 },
                    { id: 'hd-6002-7-', name: 'Rosto 6002 Feminino', type: 'hd', gender: 'F', originalId: 6002, index: 7 },
                    { id: 'hd-6003-7-', name: 'Rosto 6003 Feminino', type: 'hd', gender: 'F', originalId: 6003, index: 7 },
                    { id: 'hd-6004-7-', name: 'Rosto 6004 Feminino', type: 'hd', gender: 'F', originalId: 6004, index: 7 },
                    { id: 'hd-6005-7-', name: 'Rosto 6005 Feminino', type: 'hd', gender: 'F', originalId: 6005, index: 7 },
                    { id: 'hd-6006-7-', name: 'Rosto 6006 Feminino', type: 'hd', gender: 'F', originalId: 6006, index: 7 },
                    { id: 'hd-6007-7-', name: 'Rosto 6007 Feminino', type: 'hd', gender: 'F', originalId: 6007, index: 7 },
                    { id: 'hd-6008-7-', name: 'Rosto 6008 Feminino', type: 'hd', gender: 'F', originalId: 6008, index: 7 },
                    { id: 'hd-6009-7-', name: 'Rosto 6009 Feminino', type: 'hd', gender: 'F', originalId: 6009, index: 7 },
                    { id: 'hd-6024-7-', name: 'Rosto 6024 Feminino', type: 'hd', gender: 'F', originalId: 6024, index: 7 },
                    { id: 'hd-6025-7-', name: 'Rosto 6025 Feminino', type: 'hd', gender: 'F', originalId: 6025, index: 7 },
                    { id: 'hd-6026-7-', name: 'Rosto 6026 Feminino', type: 'hd', gender: 'F', originalId: 6026, index: 7 },
                    { id: 'hd-6027-7-', name: 'Rosto 6027 Feminino', type: 'hd', gender: 'F', originalId: 6027, index: 7 },
                    { id: 'hd-6045-7-', name: 'Rosto 6045 Feminino', type: 'hd', gender: 'F', originalId: 6045, index: 7 },
                    { id: 'hd-6046-7-', name: 'Rosto 6046 Feminino', type: 'hd', gender: 'F', originalId: 6046, index: 7 },
                    
                    // Rostos unissex (IDs reais que funcionaram)
                    { id: 'hd-3091-7-', name: 'Rosto 3091 Unissex', type: 'hd', gender: 'U', originalId: 3091, index: 7 },
                    { id: 'hd-3092-7-', name: 'Rosto 3092 Unissex', type: 'hd', gender: 'U', originalId: 3092, index: 7 },
                    { id: 'hd-3093-7-', name: 'Rosto 3093 Unissex', type: 'hd', gender: 'U', originalId: 3093, index: 7 },
                    { id: 'hd-3094-7-', name: 'Rosto 3094 Unissex', type: 'hd', gender: 'U', originalId: 3094, index: 7 },
                    { id: 'hd-3095-7-', name: 'Rosto 3095 Unissex', type: 'hd', gender: 'U', originalId: 3095, index: 7 },
                    { id: 'hd-3101-7-', name: 'Rosto 3101 Unissex', type: 'hd', gender: 'U', originalId: 3101, index: 7 },
                    { id: 'hd-3102-7-', name: 'Rosto 3102 Unissex', type: 'hd', gender: 'U', originalId: 3102, index: 7 },
                    { id: 'hd-3103-7-', name: 'Rosto 3103 Unissex', type: 'hd', gender: 'U', originalId: 3103, index: 7 },
                    { id: 'hd-3600-7-', name: 'Rosto 3600 Unissex', type: 'hd', gender: 'U', originalId: 3600, index: 7 },
                    { id: 'hd-3603-7-', name: 'Rosto 3603 Unissex', type: 'hd', gender: 'U', originalId: 3603, index: 7 },
                    { id: 'hd-3604-7-', name: 'Rosto 3604 Unissex', type: 'hd', gender: 'U', originalId: 3604, index: 7 },
                    { id: 'hd-3631-7-', name: 'Rosto 3631 Unissex', type: 'hd', gender: 'U', originalId: 3631, index: 7 },
                    { id: 'hd-3704-7-', name: 'Rosto 3704 Unissex', type: 'hd', gender: 'U', originalId: 3704, index: 7 },
                    { id: 'hd-3813-7-', name: 'Rosto 3813 Unissex', type: 'hd', gender: 'U', originalId: 3813, index: 7 },
                    { id: 'hd-3814-7-', name: 'Rosto 3814 Unissex', type: 'hd', gender: 'U', originalId: 3814, index: 7 },
                    { id: 'hd-3845-7-', name: 'Rosto 3845 Unissex', type: 'hd', gender: 'U', originalId: 3845, index: 7 },
                    { id: 'hd-3956-7-', name: 'Rosto 3956 Unissex', type: 'hd', gender: 'U', originalId: 3956, index: 7 },
                    { id: 'hd-3997-7-', name: 'Rosto 3997 Unissex', type: 'hd', gender: 'U', originalId: 3997, index: 7 },
                    { id: 'hd-4023-7-', name: 'Rosto 4023 Unissex', type: 'hd', gender: 'U', originalId: 4023, index: 7 },
                    { id: 'hd-4163-7-', name: 'Rosto 4163 Unissex', type: 'hd', gender: 'U', originalId: 4163, index: 7 },
                    { id: 'hd-4174-7-', name: 'Rosto 4174 Unissex', type: 'hd', gender: 'U', originalId: 4174, index: 7 },
                    { id: 'hd-4383-7-', name: 'Rosto 4383 Unissex', type: 'hd', gender: 'U', originalId: 4383, index: 7 },
                    { id: 'hd-5033-7-', name: 'Rosto 5033 Unissex', type: 'hd', gender: 'U', originalId: 5033, index: 7 },
                    { id: 'hd-5522-7-', name: 'Rosto 5522 Unissex', type: 'hd', gender: 'U', originalId: 5522, index: 7 },
                    { id: 'hd-5682-7-', name: 'Rosto 5682 Unissex', type: 'hd', gender: 'U', originalId: 5682, index: 7 },
                    { id: 'hd-5683-7-', name: 'Rosto 5683 Unissex', type: 'hd', gender: 'U', originalId: 5683, index: 7 },
                    { id: 'hd-5684-7-', name: 'Rosto 5684 Unissex', type: 'hd', gender: 'U', originalId: 5684, index: 7 },
                    { id: 'hd-5685-7-', name: 'Rosto 5685 Unissex', type: 'hd', gender: 'U', originalId: 5685, index: 7 },
                    { id: 'hd-5696-7-', name: 'Rosto 5696 Unissex', type: 'hd', gender: 'U', originalId: 5696, index: 7 },
                    { id: 'hd-5913-7-', name: 'Rosto 5913 Unissex', type: 'hd', gender: 'U', originalId: 5913, index: 7 },
                    { id: 'hd-6021-7-', name: 'Rosto 6021 Unissex', type: 'hd', gender: 'U', originalId: 6021, index: 7 },
                    { id: 'hd-6072-7-', name: 'Rosto 6072 Unissex', type: 'hd', gender: 'U', originalId: 6072, index: 7 },
                    { id: 'hd-3536-7-', name: 'Rosto 3536 Unissex', type: 'hd', gender: 'U', originalId: 3536, index: 7 },
                    { id: 'hd-3537-7-', name: 'Rosto 3537 Unissex', type: 'hd', gender: 'U', originalId: 3537, index: 7 },
                    { id: 'hd-3721-7-', name: 'Rosto 3721 Unissex', type: 'hd', gender: 'U', originalId: 3721, index: 7 },
                    { id: 'hd-4015-7-', name: 'Rosto 4015 Unissex', type: 'hd', gender: 'U', originalId: 4015, index: 7 },
                    { id: 'hd-4202-7-', name: 'Rosto 4202 Unissex', type: 'hd', gender: 'U', originalId: 4202, index: 7 },
                    { id: 'hd-4203-7-', name: 'Rosto 4203 Unissex', type: 'hd', gender: 'U', originalId: 4203, index: 7 },
                    { id: 'hd-4204-7-', name: 'Rosto 4204 Unissex', type: 'hd', gender: 'U', originalId: 4204, index: 7 },
                    { id: 'hd-4205-7-', name: 'Rosto 4205 Unissex', type: 'hd', gender: 'U', originalId: 4205, index: 7 },
                    { id: 'hd-4206-7-', name: 'Rosto 4206 Unissex', type: 'hd', gender: 'U', originalId: 4206, index: 7 },
                    { id: 'hd-4266-7-', name: 'Rosto 4266 Unissex', type: 'hd', gender: 'U', originalId: 4266, index: 7 },
                    { id: 'hd-4267-7-', name: 'Rosto 4267 Unissex', type: 'hd', gender: 'U', originalId: 4267, index: 7 },
                    { id: 'hd-4268-7-', name: 'Rosto 4268 Unissex', type: 'hd', gender: 'U', originalId: 4268, index: 7 },
                    { id: 'hd-4279-7-', name: 'Rosto 4279 Unissex', type: 'hd', gender: 'U', originalId: 4279, index: 7 },
                    { id: 'hd-4280-7-', name: 'Rosto 4280 Unissex', type: 'hd', gender: 'U', originalId: 4280, index: 7 },
                    { id: 'hd-4287-7-', name: 'Rosto 4287 Unissex', type: 'hd', gender: 'U', originalId: 4287, index: 7 },
                    { id: 'hd-5041-7-', name: 'Rosto 5041 Unissex', type: 'hd', gender: 'U', originalId: 5041, index: 7 },
                    { id: 'hd-5042-7-', name: 'Rosto 5042 Unissex', type: 'hd', gender: 'U', originalId: 5042, index: 7 },
                    { id: 'hd-5143-7-', name: 'Rosto 5143 Unissex', type: 'hd', gender: 'U', originalId: 5143, index: 7 },
                    { id: 'hd-5153-7-', name: 'Rosto 5153 Unissex', type: 'hd', gender: 'U', originalId: 5153, index: 7 },
                    { id: 'hd-5154-7-', name: 'Rosto 5154 Unissex', type: 'hd', gender: 'U', originalId: 5154, index: 7 },
                    { id: 'hd-5316-7-', name: 'Rosto 5316 Unissex', type: 'hd', gender: 'U', originalId: 5316, index: 7 },
                    { id: 'hd-5317-7-', name: 'Rosto 5317 Unissex', type: 'hd', gender: 'U', originalId: 5317, index: 7 },
                    { id: 'hd-5318-7-', name: 'Rosto 5318 Unissex', type: 'hd', gender: 'U', originalId: 5318, index: 7 },
                    { id: 'hd-5319-7-', name: 'Rosto 5319 Unissex', type: 'hd', gender: 'U', originalId: 5319, index: 7 },
                    { id: 'hd-5430-7-', name: 'Rosto 5430 Unissex', type: 'hd', gender: 'U', originalId: 5430, index: 7 },
                    { id: 'hd-5524-7-', name: 'Rosto 5524 Unissex', type: 'hd', gender: 'U', originalId: 5524, index: 7 },
                    { id: 'hd-5525-7-', name: 'Rosto 5525 Unissex', type: 'hd', gender: 'U', originalId: 5525, index: 7 },
                    { id: 'hd-5740-7-', name: 'Rosto 5740 Unissex', type: 'hd', gender: 'U', originalId: 5740, index: 7 },
                    { id: 'hd-5741-7-', name: 'Rosto 5741 Unissex', type: 'hd', gender: 'U', originalId: 5741, index: 7 },
                    { id: 'hd-5798-7-', name: 'Rosto 5798 Unissex', type: 'hd', gender: 'U', originalId: 5798, index: 7 },
                    { id: 'hd-5799-7-', name: 'Rosto 5799 Unissex', type: 'hd', gender: 'U', originalId: 5799, index: 7 },
                    { id: 'hd-5837-7-', name: 'Rosto 5837 Unissex', type: 'hd', gender: 'U', originalId: 5837, index: 7 },
                    { id: 'hd-5838-7-', name: 'Rosto 5838 Unissex', type: 'hd', gender: 'U', originalId: 5838, index: 7 },
                    { id: 'hd-5839-7-', name: 'Rosto 5839 Unissex', type: 'hd', gender: 'U', originalId: 5839, index: 7 },
                    { id: 'hd-5840-7-', name: 'Rosto 5840 Unissex', type: 'hd', gender: 'U', originalId: 5840, index: 7 },
                    { id: 'hd-5888-7-', name: 'Rosto 5888 Unissex', type: 'hd', gender: 'U', originalId: 5888, index: 7 },
                    { id: 'hd-5889-7-', name: 'Rosto 5889 Unissex', type: 'hd', gender: 'U', originalId: 5889, index: 7 },
                    { id: 'hd-5890-7-', name: 'Rosto 5890 Unissex', type: 'hd', gender: 'U', originalId: 5890, index: 7 }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            'hair': {
                nonhc: [
                    // Cabelos masculinos (IDs reais)
                    { id: 'hr-100-7-', name: 'Cabelo 100 Masculino', type: 'hr', gender: 'M', originalId: 100, index: 7 },
                    { id: 'hr-102-7-', name: 'Cabelo 102 Masculino', type: 'hr', gender: 'M', originalId: 102, index: 7 },
                    { id: 'hr-104-7-', name: 'Cabelo 104 Masculino', type: 'hr', gender: 'M', originalId: 104, index: 7 },
                    { id: 'hr-106-7-', name: 'Cabelo 106 Masculino', type: 'hr', gender: 'M', originalId: 106, index: 7 },
                    { id: 'hr-108-7-', name: 'Cabelo 108 Masculino', type: 'hr', gender: 'M', originalId: 108, index: 7 },
                    { id: 'hr-110-7-', name: 'Cabelo 110 Masculino', type: 'hr', gender: 'M', originalId: 110, index: 7 },
                    { id: 'hr-112-7-', name: 'Cabelo 112 Masculino', type: 'hr', gender: 'M', originalId: 112, index: 7 },
                    { id: 'hr-114-7-', name: 'Cabelo 114 Masculino', type: 'hr', gender: 'M', originalId: 114, index: 7 },
                    { id: 'hr-116-7-', name: 'Cabelo 116 Masculino', type: 'hr', gender: 'M', originalId: 116, index: 7 },
                    { id: 'hr-118-7-', name: 'Cabelo 118 Masculino', type: 'hr', gender: 'M', originalId: 118, index: 7 },
                    
                    // Cabelos femininos (IDs reais)
                    { id: 'hr-101-7-', name: 'Cabelo 101 Feminino', type: 'hr', gender: 'F', originalId: 101, index: 7 },
                    { id: 'hr-103-7-', name: 'Cabelo 103 Feminino', type: 'hr', gender: 'F', originalId: 103, index: 7 },
                    { id: 'hr-105-7-', name: 'Cabelo 105 Feminino', type: 'hr', gender: 'F', originalId: 105, index: 7 },
                    { id: 'hr-107-7-', name: 'Cabelo 107 Feminino', type: 'hr', gender: 'F', originalId: 107, index: 7 },
                    { id: 'hr-109-7-', name: 'Cabelo 109 Feminino', type: 'hr', gender: 'F', originalId: 109, index: 7 },
                    { id: 'hr-111-7-', name: 'Cabelo 111 Feminino', type: 'hr', gender: 'F', originalId: 111, index: 7 },
                    { id: 'hr-113-7-', name: 'Cabelo 113 Feminino', type: 'hr', gender: 'F', originalId: 113, index: 7 },
                    { id: 'hr-115-7-', name: 'Cabelo 115 Feminino', type: 'hr', gender: 'F', originalId: 115, index: 7 },
                    { id: 'hr-117-7-', name: 'Cabelo 117 Feminino', type: 'hr', gender: 'F', originalId: 117, index: 7 },
                    { id: 'hr-119-7-', name: 'Cabelo 119 Feminino', type: 'hr', gender: 'F', originalId: 119, index: 7 }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            'shirts': {
                nonhc: [
                    // Camisetas masculinas (IDs reais)
                    { id: 'ch-210-66-', name: 'Camiseta 210 Masculina', type: 'ch', gender: 'M', originalId: 210, index: 66 },
                    { id: 'ch-212-66-', name: 'Camiseta 212 Masculina', type: 'ch', gender: 'M', originalId: 212, index: 66 },
                    { id: 'ch-214-66-', name: 'Camiseta 214 Masculina', type: 'ch', gender: 'M', originalId: 214, index: 66 },
                    { id: 'ch-216-66-', name: 'Camiseta 216 Masculina', type: 'ch', gender: 'M', originalId: 216, index: 66 },
                    { id: 'ch-218-66-', name: 'Camiseta 218 Masculina', type: 'ch', gender: 'M', originalId: 218, index: 66 },
                    { id: 'ch-220-66-', name: 'Camiseta 220 Masculina', type: 'ch', gender: 'M', originalId: 220, index: 66 },
                    
                    // Camisetas femininas (IDs reais)
                    { id: 'ch-211-66-', name: 'Camiseta 211 Feminina', type: 'ch', gender: 'F', originalId: 211, index: 66 },
                    { id: 'ch-213-66-', name: 'Camiseta 213 Feminina', type: 'ch', gender: 'F', originalId: 213, index: 66 },
                    { id: 'ch-215-66-', name: 'Camiseta 215 Feminina', type: 'ch', gender: 'F', originalId: 215, index: 66 },
                    { id: 'ch-217-66-', name: 'Camiseta 217 Feminina', type: 'ch', gender: 'F', originalId: 217, index: 66 },
                    { id: 'ch-219-66-', name: 'Camiseta 219 Feminina', type: 'ch', gender: 'F', originalId: 219, index: 66 },
                    { id: 'ch-221-66-', name: 'Camiseta 221 Feminina', type: 'ch', gender: 'F', originalId: 221, index: 66 }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            'pants': {
                nonhc: [
                    // Calças masculinas (IDs reais)
                    { id: 'lg-270-82-', name: 'Calça 270 Masculina', type: 'lg', gender: 'M', originalId: 270, index: 82 },
                    { id: 'lg-272-82-', name: 'Calça 272 Masculina', type: 'lg', gender: 'M', originalId: 272, index: 82 },
                    { id: 'lg-274-82-', name: 'Calça 274 Masculina', type: 'lg', gender: 'M', originalId: 274, index: 82 },
                    { id: 'lg-276-82-', name: 'Calça 276 Masculina', type: 'lg', gender: 'M', originalId: 276, index: 82 },
                    { id: 'lg-278-82-', name: 'Calça 278 Masculina', type: 'lg', gender: 'M', originalId: 278, index: 82 },
                    { id: 'lg-280-82-', name: 'Calça 280 Masculina', type: 'lg', gender: 'M', originalId: 280, index: 82 },
                    
                    // Calças femininas (IDs reais)
                    { id: 'lg-271-82-', name: 'Calça 271 Feminina', type: 'lg', gender: 'F', originalId: 271, index: 82 },
                    { id: 'lg-273-82-', name: 'Calça 273 Feminina', type: 'lg', gender: 'F', originalId: 273, index: 82 },
                    { id: 'lg-275-82-', name: 'Calça 275 Feminina', type: 'lg', gender: 'F', originalId: 275, index: 82 },
                    { id: 'lg-277-82-', name: 'Calça 277 Feminina', type: 'lg', gender: 'F', originalId: 277, index: 82 },
                    { id: 'lg-279-82-', name: 'Calça 279 Feminina', type: 'lg', gender: 'F', originalId: 279, index: 82 },
                    { id: 'lg-281-82-', name: 'Calça 281 Feminina', type: 'lg', gender: 'F', originalId: 281, index: 82 }
                ],
                hc: [],
                sell: [],
                nft: []
            },
            'shoes': {
                nonhc: [
                    // Sapatos masculinos (IDs reais)
                    { id: 'sh-290-80-', name: 'Sapato 290 Masculino', type: 'sh', gender: 'M', originalId: 290, index: 80 },
                    { id: 'sh-292-80-', name: 'Sapato 292 Masculino', type: 'sh', gender: 'M', originalId: 292, index: 80 },
                    { id: 'sh-294-80-', name: 'Sapato 294 Masculino', type: 'sh', gender: 'M', originalId: 294, index: 80 },
                    { id: 'sh-296-80-', name: 'Sapato 296 Masculino', type: 'sh', gender: 'M', originalId: 296, index: 80 },
                    { id: 'sh-298-80-', name: 'Sapato 298 Masculino', type: 'sh', gender: 'M', originalId: 298, index: 80 },
                    { id: 'sh-300-80-', name: 'Sapato 300 Masculino', type: 'sh', gender: 'M', originalId: 300, index: 80 },
                    
                    // Sapatos femininos (IDs reais)
                    { id: 'sh-291-80-', name: 'Sapato 291 Feminino', type: 'sh', gender: 'F', originalId: 291, index: 80 },
                    { id: 'sh-293-80-', name: 'Sapato 293 Feminino', type: 'sh', gender: 'F', originalId: 293, index: 80 },
                    { id: 'sh-295-80-', name: 'Sapato 295 Feminino', type: 'sh', gender: 'F', originalId: 295, index: 80 },
                    { id: 'sh-297-80-', name: 'Sapato 297 Feminino', type: 'sh', gender: 'F', originalId: 297, index: 80 },
                    { id: 'sh-299-80-', name: 'Sapato 299 Feminino', type: 'sh', gender: 'F', originalId: 299, index: 80 },
                    { id: 'sh-301-80-', name: 'Sapato 301 Feminino', type: 'sh', gender: 'F', originalId: 301, index: 80 }
                ],
                hc: [],
                sell: [],
                nft: []
            }
        };
        
        // Adicionar categorias específicas por gênero
        this.addGenderSpecificCategories(this.clothingData);
        
        console.log('✅ Dados estáticos carregados:', this.clothingData);
        
        // Renderizar grid visual
        this.showAllCategories();
    }

    // Verificar se o item deve ser exibido para o gênero atual
    shouldShowItemForCurrentGender(item) {
        const currentGender = this.currentFigure.gender;
        const itemGender = item.gender || 'U';
        
        // Mostrar se:
        // 1. O item é unissex (U)
        // 2. O item é do mesmo gênero que o avatar atual
        // 3. O avatar atual é unissex (U)
        return itemGender === 'U' || itemGender === currentGender || currentGender === 'U';
    }

    // Obter label do gênero
    getGenderLabel(gender) {
        const labels = {
            'M': '♂',
            'F': '♀',
            'U': '⚤'
        };
        return labels[gender] || '⚤';
    }

    // Atualizar exibição dos itens baseado no gênero atual
    updateClothingDisplayForGender() {
        console.log(`🔄 Atualizando exibição para gênero: ${this.currentFigure.gender}`);
        
        const clothingItems = document.querySelectorAll('.clothing-item');
        clothingItems.forEach(item => {
            const itemGender = item.getAttribute('data-item-gender') || 'U';
            const shouldShow = this.shouldShowItemForCurrentGender({ gender: itemGender });
            
            if (shouldShow) {
                item.style.display = 'block';
                item.classList.remove('hidden-by-gender');
            } else {
                item.style.display = 'none';
                item.classList.add('hidden-by-gender');
            }
        });
        
        // Atualizar contadores de itens por categoria
        this.updateCategoryCounts();
        
        console.log('✅ Exibição atualizada para o gênero selecionado');
    }

    // Atualizar contadores de itens por categoria
    updateCategoryCounts() {
        const categories = document.querySelectorAll('.category-section');
        categories.forEach(category => {
            const visibleItems = category.querySelectorAll('.clothing-item:not(.hidden-by-gender)');
            const totalItems = category.querySelectorAll('.clothing-item').length;
            
            const countElement = category.querySelector('.category-count');
            if (countElement) {
                countElement.textContent = `${visibleItems.length}/${totalItems} itens`;
            }
        });
        
        console.log('📊 Contadores de categorias atualizados');
    }

    // Função para alternar gênero
    toggleGender() {
        const currentGender = this.currentFigure.gender;
        
        // Alternar entre M, F e U
        if (currentGender === 'M') {
            this.currentFigure.gender = 'F';
        } else if (currentGender === 'F') {
            this.currentFigure.gender = 'U';
        } else {
            this.currentFigure.gender = 'M';
        }
        
        console.log(`🔄 Gênero alterado para: ${this.currentFigure.gender}`);
        
        // Atualizar interface
        this.updateGenderDisplay();
        this.updateClothingDisplayForGender();
        this.updateAvatar();
        
        // Atualizar navegação ativa
        this.updateActiveGenderButton();
    }

    // Atualizar exibição do gênero na interface
    updateGenderDisplay() {
        const genderBtn = document.getElementById('genderBtn');
        if (genderBtn) {
            const genderLabels = {
                'M': '♂ Masculino',
                'F': '♀ Feminino',
                'U': '⚤ Unissex'
            };
            genderBtn.textContent = genderLabels[this.currentFigure.gender] || '⚤ Unissex';
        }
    }
    
    // Atualizar botão de gênero ativo
    updateActiveGenderButton() {
        const genderBtns = document.querySelectorAll('.gender-btn');
        genderBtns.forEach(btn => {
            btn.classList.remove('active');
            const gender = btn.getAttribute('data-gender');
            if (gender === this.currentFigure.gender) {
                btn.classList.add('active');
            }
        });
    }
}

// Inicializar o editor quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    window.habboEditor = new HabboAvatarEditor();
    await window.habboEditor.init();
});

// Função para adicionar roupas personalizadas baseadas nos arquivos SWF
function addCustomClothing() {
    // Esta função pode ser expandida para carregar roupas dos arquivos SWF
    // Por enquanto, estamos usando dados mockados
    console.log('Sistema de roupas personalizadas carregado');
}

// Função para exportar configuração do avatar
function exportAvatarConfig() {
    const editor = window.habboEditor;
    if (editor) {
        const config = {
            figure: editor.currentFigure,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'habbo_avatar_config.json';
        link.click();
    }
}

// Função para importar configuração do avatar
function importAvatarConfig(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            if (config.figure && window.habboEditor) {
                window.habboEditor.currentFigure = { ...config.figure };
                window.habboEditor.updateAvatar();
                window.habboEditor.renderClothingGrid();
            }
        } catch (error) {
            console.error('Erro ao importar configuração:', error);
            alert('Erro ao importar configuração do avatar');
        }
    };
    reader.readAsText(file);
}
