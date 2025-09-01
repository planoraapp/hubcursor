// ===== INTEGRAÇÃO COM HABBO WIDGETS API =====
// Sistema para carregar roupas da API do habbowidgets
// e melhorar o suporte a gêneros (M/F)

class HabboWidgetsIntegration {
    constructor() {
        this.baseUrl = 'https://api.habboemotion.com/public/clothings';
        this.cache = new Map();
        this.genderCache = {
            M: new Map(), // Cache para roupas masculinas
            F: new Map()  // Cache para roupas femininas
        };
        this.currentGender = 'M';
        this.maxItems = 200; // Máximo permitido pela API
    }

    // Carregar roupas da API do habbowidgets
    async loadClothingsFromAPI(limit = 50) {
        try {
            const url = `${this.baseUrl}/new/${Math.min(limit, this.maxItems)}`;
            console.log(`🔄 Carregando roupas da API: ${url}`);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Roupas carregadas da API: ${data.length} itens`);
            
            // Processar e categorizar as roupas
            const categorizedClothings = this.categorizeClothings(data);
            
            // Salvar no cache
            this.cache.set('api', categorizedClothings);
            
            return categorizedClothings;
        } catch (error) {
            console.error('❌ Erro ao carregar da API:', error);
            return null;
        }
    }

    // Categorizar roupas por tipo e gênero
    categorizeClothings(clothings) {
        const categories = {
            head: { M: [], F: [] },
            hair: { M: [], F: [] },
            shirts: { M: [], F: [] },
            pants: { M: [], F: [] },
            shoes: { M: [], F: [] },
            dresses: { M: [], F: [] },
            accessories: { M: [], F: [] },
            hats: { M: [], F: [] },
            jackets: { M: [], F: [] },
            body: { M: [], F: [] }
        };

        clothings.forEach(item => {
            if (item.figure && item.name) {
                // Extrair tipo e gênero da figura
                const figureParts = item.figure.split('-');
                if (figureParts.length >= 2) {
                    const type = figureParts[0];
                    const id = figureParts[1];
                    const gender = this.detectGenderFromFigure(item.figure);
                    
                    const clothingItem = {
                        id: id,
                        name: item.name,
                        type: type,
                        figure: item.figure,
                        gender: gender,
                        rarity: this.detectRarity(item),
                        imageUrl: this.generateImageUrl(item.figure, gender)
                    };

                    // Adicionar à categoria apropriada
                    if (categories[type]) {
                        categories[type][gender].push(clothingItem);
                    } else if (categories.accessories[gender]) {
                        categories.accessories[gender].push(clothingItem);
                    }
                }
            }
        });

        return categories;
    }

    // Detectar gênero baseado na figura
    detectGenderFromFigure(figure) {
        // Padrões comuns para identificar gênero
        if (figure.includes('hr-') || figure.includes('hd-')) {
            // Para cabelos e rostos, verificar se é feminino
            // Alguns IDs específicos são femininos
            const id = figure.split('-')[1];
            const femaleIds = ['677', '678', '832', '833', '834', '835', '836', '838', '839', '840'];
            return femaleIds.includes(id) ? 'F' : 'M';
        }
        
        // Padrão padrão
        return 'M';
    }

    // Detectar raridade baseado no nome ou ID
    detectRarity(item) {
        const name = item.name.toLowerCase();
        const id = item.id;
        
        if (name.includes('nft') || name.includes('test_nft')) return 'nft';
        if (name.includes('raro') || name.includes('rare')) return 'raro';
        if (name.includes('ltd') || name.includes('limited')) return 'ltd';
        if (name.includes('club') || name.includes('hc')) return 'club';
        if (name.includes('sellable') || name.includes('sell')) return 'sellable';
        
        return 'nonhc';
    }

    // Gerar URL da imagem
    generateImageUrl(figure, gender) {
        return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${gender}&size=m`;
    }

    // Carregar roupas específicas por gênero
    async loadClothingsByGender(gender, category = null) {
        this.currentGender = gender;
        
        // Verificar cache primeiro
        if (this.genderCache[gender].has(category || 'all')) {
            console.log(`📦 Retornando do cache: ${gender} - ${category || 'all'}`);
            return this.genderCache[gender].get(category || 'all');
        }

        // Carregar da API se não estiver em cache
        const clothings = await this.loadClothingsFromAPI(100);
        if (!clothings) return null;

        // Filtrar por gênero e categoria
        let filteredClothings = [];
        if (category && clothings[category]) {
            filteredClothings = clothings[category][gender] || [];
        } else {
            // Todas as categorias
            Object.values(clothings).forEach(cat => {
                if (cat[gender]) {
                    filteredClothings.push(...cat[gender]);
                }
            });
        }

        // Salvar no cache
        this.genderCache[gender].set(category || 'all', filteredClothings);
        
        console.log(`✅ Roupas carregadas para ${gender}: ${filteredClothings.length} itens`);
        return filteredClothings;
    }

    // Buscar roupas por termo
    searchClothings(query, gender = null) {
        const searchGender = gender || this.currentGender;
        const results = [];
        
        this.genderCache[searchGender].forEach((clothings, category) => {
            clothings.forEach(item => {
                if (item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.id.includes(query)) {
                    results.push({ ...item, category });
                }
            });
        });
        
        return results;
    }

    // Obter estatísticas das roupas
    getClothingStats() {
        const stats = {
            M: { total: 0, categories: {} },
            F: { total: 0, categories: {} }
        };

        ['M', 'F'].forEach(gender => {
            this.genderCache[gender].forEach((clothings, category) => {
                if (!stats[gender].categories[category]) {
                    stats[gender].categories[category] = 0;
                }
                stats[gender].categories[category] = clothings.length;
                stats[gender].total += clothings.length;
            });
        });

        return stats;
    }

    // Limpar cache
    clearCache() {
        this.cache.clear();
        this.genderCache.M.clear();
        this.genderCache.F.clear();
        console.log('🗑️ Cache limpo');
    }

    // Exportar dados para formato compatível com o editor
    exportForEditor(gender = null) {
        const targetGender = gender || this.currentGender;
        const exportData = {
            gender: targetGender,
            timestamp: new Date().toISOString(),
            clothings: []
        };

        this.genderCache[targetGender].forEach((clothings, category) => {
            clothings.forEach(item => {
                exportData.clothings.push({
                    ...item,
                    category,
                    editorFormat: this.convertToEditorFormat(item)
                });
            });
        });

        return exportData;
    }

    // Converter para formato do editor
    convertToEditorFormat(item) {
        return {
            id: item.id,
            name: item.name,
            type: item.type,
            figure: item.figure,
            gender: item.gender,
            rarity: item.rarity,
            imageUrl: item.imageUrl,
            category: item.category || 'unknown'
        };
    }
}

// ===== SISTEMA DE SUPORTE A GÊNEROS =====
class GenderSupportSystem {
    constructor() {
        this.currentGender = 'M';
        this.genderSpecificData = {
            M: {}, // Dados específicos masculinos
            F: {}  // Dados específicos femininos
        };
        this.genderMappings = {
            // Mapeamentos específicos por gênero
            head: {
                M: { defaultColor: '7', defaultId: '190' },
                F: { defaultColor: '1', defaultId: '600' }
            },
            hair: {
                M: { defaultColor: '33', defaultId: '100' },
                F: { defaultColor: '33', defaultId: '515' }
            },
            body: {
                M: { defaultColor: '66', defaultId: '210' },
                F: { defaultColor: '66', defaultId: '210' }
            }
        };
    }

    // Mudar gênero atual
    changeGender(gender) {
        if (gender !== 'M' && gender !== 'F') return false;
        
        this.currentGender = gender;
        console.log(`🔄 Gênero alterado para: ${gender}`);
        
        // Atualizar interface
        this.updateGenderUI();
        
        // Carregar roupas específicas do gênero
        this.loadGenderSpecificClothings();
        
        return true;
    }

    // Atualizar interface do gênero
    updateGenderUI() {
        // Atualizar botões de gênero
        document.querySelectorAll('.gender-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.gender === this.currentGender) {
                btn.classList.add('active');
            }
        });

        // Atualizar indicador visual
        const genderIndicator = document.querySelector('.gender-selector');
        if (genderIndicator) {
            genderIndicator.dataset.currentGender = this.currentGender;
        }
    }

    // Carregar roupas específicas do gênero
    async loadGenderSpecificClothings() {
        if (window.habboWidgets) {
            const clothings = await window.habboWidgets.loadClothingsByGender(this.currentGender);
            if (clothings) {
                this.displayGenderSpecificClothings(clothings);
            }
        }
    }

    // Exibir roupas específicas do gênero
    displayGenderSpecificClothings(clothings) {
        const grid = document.getElementById('clothingGrid');
        if (!grid) return;

        // Limpar grid atual
        grid.innerHTML = '';

        // Agrupar por categoria
        const categories = {};
        clothings.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        // Criar seções por categoria
        Object.entries(categories).forEach(([category, items]) => {
            const categorySection = document.createElement('div');
            categorySection.className = 'clothing-category';
            categorySection.innerHTML = `
                <h4>${this.getCategoryDisplayName(category)} (${items.length})</h4>
                <div class="clothing-items">
                    ${items.map(item => this.createClothingItemHTML(item)).join('')}
                </div>
            `;
            grid.appendChild(categorySection);
        });
    }

    // Obter nome de exibição da categoria
    getCategoryDisplayName(category) {
        const names = {
            head: 'Rostos',
            hair: 'Cabelos',
            shirts: 'Camisas',
            pants: 'Calças',
            shoes: 'Sapatos',
            dresses: 'Vestidos',
            accessories: 'Acessórios',
            hats: 'Chapéus',
            jackets: 'Jaquetas',
            body: 'Corpos'
        };
        return names[category] || category;
    }

    // Criar HTML do item de roupa
    createClothingItemHTML(item) {
        const rarityClass = item.rarity || 'nonhc';
        return `
            <div class="clothes-object ${item.type} ${rarityClass}" 
                 data-clothing="${item.id}" 
                 data-type="${item.type}"
                 data-gender="${item.gender}"
                 title="${item.name}"
                 style="background-image: url('${item.imageUrl}')">
            </div>
        `;
    }

    // Obter configuração padrão para o gênero
    getDefaultConfig(gender, category) {
        const config = this.genderMappings[category];
        if (config && config[gender]) {
            return config[gender];
        }
        return { defaultColor: '1', defaultId: '100' };
    }

    // Aplicar configuração de gênero ao avatar
    applyGenderToAvatar() {
        const config = this.getDefaultConfig(this.currentGender, 'head');
        
        // Atualizar figura do avatar
        if (window.avatarEditor) {
            window.avatarEditor.updateFigurePart('hd', config.defaultId, config.defaultColor);
        }
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar integração com habbowidgets
    window.habboWidgets = new HabboWidgetsIntegration();
    
    // Inicializar sistema de suporte a gêneros
    window.genderSupport = new GenderSupportSystem();
    
    // Configurar eventos de mudança de gênero
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const gender = this.dataset.gender;
            window.genderSupport.changeGender(gender);
        });
    });
    
    // Carregar roupas iniciais
    if (window.habboWidgets) {
        window.habboWidgets.loadClothingsFromAPI(50).then(() => {
            console.log('✅ Sistema de integração inicializado');
        });
    }
});

// ===== EXPORTAÇÃO PARA USO GLOBAL =====
window.HabboWidgetsIntegration = HabboWidgetsIntegration;
window.GenderSupportSystem = GenderSupportSystem;
