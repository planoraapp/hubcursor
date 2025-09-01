// SISTEMA DE DESCOBERTA AUTOMÁTICA DE ROUPAS DO HABBO
// Descobre todas as roupas disponíveis testando IDs sequenciais

class HabboDiscoverySystem {
    constructor() {
        this.discoveredItems = new Map();
        this.testingQueue = [];
        this.isDiscovering = false;
        this.maxConcurrentTests = 5;
        this.testTimeout = 3000;
        this.batchSize = 100;
    }

    // ===== SISTEMA DE DESCOBERTA AUTOMÁTICA =====
    
    // Descobrir todas as roupas de uma categoria
    async discoverCategory(category, type, startId = 1, endId = 5000) {
        console.log(`🔍 Iniciando descoberta da categoria: ${category} (${type})`);
        console.log(`📊 Testando IDs de ${startId} até ${endId}`);
        
        const discoveredItems = [];
        const batches = this.createBatches(startId, endId, this.batchSize);
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`📦 Processando lote ${i + 1}/${batches.length} (IDs ${batch[0]}-${batch[batch.length - 1]})`);
            
            const batchResults = await this.testBatch(type, batch, category);
            discoveredItems.push(...batchResults);
            
            // Pequena pausa entre lotes para não sobrecarregar
            await this.delay(100);
        }
        
        console.log(`✅ Descoberta concluída para ${category}: ${discoveredItems.length} itens encontrados`);
        return discoveredItems;
    }

    // Criar lotes de IDs para testar
    createBatches(startId, endId, batchSize) {
        const batches = [];
        for (let i = startId; i <= endId; i += batchSize) {
            const batch = [];
            for (let j = i; j < Math.min(i + batchSize, endId + 1); j++) {
                batch.push(j);
            }
            batches.push(batch);
        }
        return batches;
    }

    // Testar um lote de IDs
    async testBatch(type, ids, category) {
        const promises = ids.map(id => this.testItem(type, id, category));
        const results = await Promise.allSettled(promises);
        
        const validItems = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
        
        return validItems;
    }

    // Testar um item específico
    async testItem(type, id, category) {
        try {
            // Testar com cor padrão (7)
            const figure = `${type}-${id}-7-`;
            const testUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=M&size=m`;
            
            const isValid = await this.testImageUrl(testUrl);
            
            if (isValid) {
                const item = {
                    id: id.toString(),
                    name: this.generateItemName(category, type, id),
                    type: type,
                    rarity: this.determineRarity(id),
                    color: '7',
                    figure: figure,
                    category: category
                };
                
                console.log(`✅ Item descoberto: ${type}-${id} (${item.name})`);
                return item;
            }
            
            return null;
        } catch (error) {
            console.warn(`❌ Erro ao testar ${type}-${id}:`, error.message);
            return null;
        }
    }

    // Testar se uma URL de imagem é válida
    async testImageUrl(url) {
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                img.onload = null;
                img.onerror = null;
                resolve(false);
            }, this.testTimeout);
            
            img.onload = () => {
                clearTimeout(timeout);
                // Verificar se a imagem não é um placeholder ou erro
                const isValid = this.isValidImage(img);
                resolve(isValid);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            
            img.src = url;
        });
    }

    // Verificar se a imagem é válida (não placeholder)
    isValidImage(img) {
        try {
            // Verificar dimensões mínimas
            if (img.width < 50 || img.height < 50) return false;
            
            // Verificar se não é uma imagem de erro padrão
            // (pode ser implementado com análise de pixels)
            
            return true;
        } catch (error) {
            return false;
        }
    }

    // Gerar nome para o item
    generateItemName(category, type, id) {
        const categoryNames = {
            'head': 'Cabeça',
            'hair': 'Cabelo',
            'shirts': 'Camisa',
            'pants': 'Calça',
            'shoes': 'Sapato',
            'hats': 'Chapéu'
        };
        
        const baseName = categoryNames[category] || 'Item';
        return `${baseName} ${id}`;
    }

    // Determinar raridade baseada no ID
    determineRarity(id) {
        const numId = parseInt(id);
        
        // IDs baixos são geralmente comuns
        if (numId <= 300) return 'nonhc';
        
        // IDs médios são geralmente HC
        if (numId <= 1000) return 'hc';
        
        // IDs altos são geralmente vendáveis
        if (numId <= 5000) return 'sell';
        
        // IDs muito altos são geralmente NFT
        return 'nft';
    }

    // ===== SISTEMA DE DESCOBERTA INTELIGENTE =====
    
    // Descobrir usando padrões conhecidos
    async discoverWithPatterns() {
        console.log('🧠 Iniciando descoberta inteligente com padrões...');
        
        const patterns = [
            // Padrões de cabeças
            { type: 'hd', range: [180, 220], category: 'head' },
            
            // Padrões de cabelos
            { type: 'hr', range: [100, 500], category: 'hair' },
            
            // Padrões de camisas
            { type: 'ch', range: [210, 5000], category: 'shirts' },
            
            // Padrões de calças
            { type: 'lg', range: [270, 500], category: 'pants' },
            
            // Padrões de sapatos
            { type: 'sh', range: [290, 500], category: 'shoes' },
            
            // Padrões de chapéus
            { type: 'ha', range: [1, 100], category: 'hats' }
        ];
        
        const allItems = {};
        
        for (const pattern of patterns) {
            console.log(`🔍 Testando padrão: ${pattern.type} (${pattern.range[0]}-${pattern.range[1]})`);
            const items = await this.discoverCategory(
                pattern.category, 
                pattern.type, 
                pattern.range[0], 
                pattern.range[1]
            );
            allItems[pattern.category] = items;
        }
        
        return allItems;
    }

    // ===== SISTEMA DE CACHE E PERSISTÊNCIA =====
    
    // Salvar itens descobertos no localStorage
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

    // Carregar itens descobertos do localStorage
    loadDiscoveredItems() {
        try {
            const data = localStorage.getItem('habbo_discovered_items');
            if (data) {
                const parsed = JSON.parse(data);
                console.log('📂 Itens carregados do localStorage');
                return parsed.items;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar itens:', error);
        }
        return null;
    }

    // ===== UTILITÁRIOS =====
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Exportar dados descobertos
    exportToJSON(items) {
        const data = {
            discoveredItems: items,
            timestamp: new Date().toISOString(),
            totalItems: Object.values(items).flat().length,
            categories: Object.keys(items)
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `habbo_discovered_items_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// ===== FUNÇÕES DE DESCOBERTA RÁPIDA =====

// Descobrir roupas populares rapidamente
async function quickDiscovery() {
    const discovery = new HabboDiscoverySystem();
    
    // Testar apenas IDs conhecidos como populares
    const popularIds = {
        'hd': [180, 185, 190, 195, 200, 205, 210, 215, 220],
        'hr': [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115],
        'ch': [210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 260, 265, 266, 267, 268, 269],
        'lg': [270, 271, 272, 273, 274, 275, 276, 277, 278, 279],
        'sh': [290, 291, 292, 293, 294, 295, 296, 297, 298, 299],
        'ha': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    };
    
    const results = {};
    
    for (const [type, ids] of Object.entries(popularIds)) {
        const category = getCategoryFromType(type);
        console.log(`🔍 Testando ${category} (${type})...`);
        
        const items = [];
        for (const id of ids) {
            const item = await discovery.testItem(type, id, category);
            if (item) items.push(item);
        }
        
        results[category] = items;
        console.log(`✅ ${category}: ${items.length} itens encontrados`);
    }
    
    return results;
}

// Obter categoria a partir do tipo
function getCategoryFromType(type) {
    const typeMap = {
        'hd': 'head',
        'hr': 'hair',
        'ch': 'shirts',
        'lg': 'pants',
        'sh': 'shoes',
        'ha': 'hats'
    };
    return typeMap[type] || 'unknown';
}

// ===== EXPORTAÇÃO =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        HabboDiscoverySystem, 
        quickDiscovery,
        getCategoryFromType
    };
} else {
    window.HabboDiscoverySystem = HabboDiscoverySystem;
    window.quickDiscovery = quickDiscovery;
    window.getCategoryFromType = getCategoryFromType;
}
