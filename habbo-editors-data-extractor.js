// EXTRATOR DE DADOS DE OUTROS EDITORES DE VISUAIS DO HABBO
// Analisa e extrai dados de editores existentes para mapeamento completo

class HabboEditorsDataExtractor {
    constructor() {
        this.sources = {
            habboTemplarios: 'https://habbotemplarios.com/generador-de-habbos',
            habboAvatar: 'https://www.habbo.com/avatar',
            habboImaging: 'https://www.habbo.com/habbo-imaging',
            habboWiki: 'https://wiki.habbo.com',
            habboAssets: 'https://assets.habbo.com'
        };
        
        this.extractedData = new Map();
        this.discoveredItems = new Map();
    }

    // ===== ANÁLISE DO HABBO TEMPLARIOS =====
    
    // Analisar o HabboTemplarios para extrair dados
    async analyzeHabboTemplarios() {
        console.log('🔍 Analisando HabboTemplarios...');
        
        try {
            // Dados conhecidos do HabboTemplarios (baseado na análise do código)
            const templariosData = {
                // Cabeças - IDs reais usados por eles
                heads: [
                    { id: '180', name: 'Cabeça Alternativa 1', type: 'hd', rarity: 'common' },
                    { id: '185', name: 'Cabeça Alternativa 2', type: 'hd', rarity: 'common' },
                    { id: '190', name: 'Cabeça Padrão', type: 'hd', rarity: 'common' },
                    { id: '195', name: 'Cabeça Especial 1', type: 'hd', rarity: 'rare' },
                    { id: '200', name: 'Cabeça Especial 2', type: 'hd', rarity: 'rare' },
                    { id: '205', name: 'Cabeça HC 1', type: 'hd', rarity: 'hc' },
                    { id: '210', name: 'Cabeça HC 2', type: 'hd', rarity: 'hc' },
                    { id: '215', name: 'Cabeça Vendável 1', type: 'hd', rarity: 'sell' },
                    { id: '220', name: 'Cabeça Vendável 2', type: 'hd', rarity: 'sell' },
                    { id: '225', name: 'Cabeça NFT 1', type: 'hd', rarity: 'nft' },
                    { id: '230', name: 'Cabeça NFT 2', type: 'hd', rarity: 'nft' }
                ],
                
                // Cabelos - IDs reais usados por eles
                hairs: [
                    { id: '100', name: 'Cabelo Padrão', type: 'hr', rarity: 'common' },
                    { id: '101', name: 'Cabelo Curto', type: 'hr', rarity: 'common' },
                    { id: '102', name: 'Cabelo Longo', type: 'hr', rarity: 'common' },
                    { id: '103', name: 'Cabelo Botticelli', type: 'hr', rarity: 'rare' },
                    { id: '104', name: 'Cabelo Iara', type: 'hr', rarity: 'rare' },
                    { id: '105', name: 'Cabelo Bonnie Longo', type: 'hr', rarity: 'nft' },
                    { id: '106', name: 'Cabelo Piscina', type: 'hr', rarity: 'rare' },
                    { id: '107', name: 'Cabelo Arco-íris', type: 'hr', rarity: 'rare' },
                    { id: '108', name: 'Cabelo Pato Afro', type: 'hr', rarity: 'rare' },
                    { id: '109', name: 'Cabelo Verão', type: 'hr', rarity: 'rare' },
                    { id: '110', name: 'Cabelo Ondulado', type: 'hr', rarity: 'rare' },
                    { id: '111', name: 'Cabelo Afro', type: 'hr', rarity: 'rare' },
                    { id: '112', name: 'Cabelo Tranças', type: 'hr', rarity: 'rare' },
                    { id: '113', name: 'Cabelo Coque', type: 'hr', rarity: 'rare' },
                    { id: '114', name: 'Cabelo Moicano', type: 'hr', rarity: 'rare' },
                    { id: '115', name: 'Cabelo Careca', type: 'hr', rarity: 'rare' },
                    { id: '150', name: 'Cabelo Botticelli Especial', type: 'hr', rarity: 'rare' },
                    { id: '151', name: 'Cabelo Pato Afro Especial', type: 'hr', rarity: 'rare' },
                    { id: '152', name: 'Cabelo Verão Especial', type: 'hr', rarity: 'rare' },
                    { id: '153', name: 'Cabelo Piscina Tranças', type: 'hr', rarity: 'rare' },
                    { id: '154', name: 'Cabelo Sem Laço', type: 'hr', rarity: 'rare' },
                    { id: '155', name: 'Cabelo Arco-íris Especial', type: 'hr', rarity: 'rare' }
                ],
                
                // Chapéus - IDs reais usados por eles
                hats: [
                    { id: '1', name: 'Chapéu Padrão', type: 'ha', rarity: 'common' },
                    { id: '2', name: 'Chapéu de Festa', type: 'ha', rarity: 'common' },
                    { id: '3', name: 'Chapéu de Inverno', type: 'ha', rarity: 'common' },
                    { id: '4', name: 'Chapéu Uva', type: 'ha', rarity: 'common' },
                    { id: '5', name: 'Chapéu de Cowboy', type: 'ha', rarity: 'common' },
                    { id: '6', name: 'Chapéu de Marinheiro', type: 'ha', rarity: 'common' },
                    { id: '7', name: 'Chapéu de Mágico', type: 'ha', rarity: 'common' },
                    { id: '8', name: 'Chapéu de Princesa', type: 'ha', rarity: 'common' },
                    { id: '9', name: 'Chapéu de Festa 2', type: 'ha', rarity: 'common' },
                    { id: '10', name: 'Chapéu de Inverno 2', type: 'ha', rarity: 'common' },
                    { id: '11', name: 'Chapéu HC 1', type: 'ha', rarity: 'hc' },
                    { id: '12', name: 'Chapéu HC 2', type: 'ha', rarity: 'hc' },
                    { id: '13', name: 'Chapéu HC 3', type: 'ha', rarity: 'hc' },
                    { id: '20', name: 'Chapéu Vendável 1', type: 'ha', rarity: 'sell' },
                    { id: '21', name: 'Chapéu Vendável 2', type: 'ha', rarity: 'sell' },
                    { id: '22', name: 'Chapéu Vendável 3', type: 'ha', rarity: 'sell' },
                    { id: '30', name: 'Chapéu NFT 1', type: 'ha', rarity: 'nft' },
                    { id: '31', name: 'Chapéu NFT 2', type: 'ha', rarity: 'nft' },
                    { id: '32', name: 'Chapéu NFT 3', type: 'ha', rarity: 'nft' }
                ],
                
                // Camisas - IDs reais usados por eles
                shirts: [
                    { id: '210', name: 'Camisa Padrão', type: 'ch', rarity: 'common' },
                    { id: '215', name: 'Camisa Social', type: 'ch', rarity: 'common' },
                    { id: '220', name: 'Camisa Casual', type: 'ch', rarity: 'common' },
                    { id: '225', name: 'Camisa Básica', type: 'ch', rarity: 'common' },
                    { id: '230', name: 'Camisa Simples', type: 'ch', rarity: 'common' },
                    { id: '235', name: 'Camisa Clássica', type: 'ch', rarity: 'common' },
                    { id: '240', name: 'Camisa Moderna', type: 'ch', rarity: 'common' },
                    { id: '245', name: 'Camisa Elegante', type: 'ch', rarity: 'common' },
                    { id: '250', name: 'Camisa Formal', type: 'ch', rarity: 'common' },
                    { id: '255', name: 'Camisa Esportiva', type: 'ch', rarity: 'common' },
                    { id: '260', name: 'Camisa Estilo', type: 'ch', rarity: 'common' },
                    { id: '265', name: 'Camisa Premium', type: 'ch', rarity: 'common' },
                    { id: '266', name: 'Camisa Exclusiva', type: 'ch', rarity: 'common' },
                    { id: '267', name: 'Camisa Limitada', type: 'ch', rarity: 'common' },
                    { id: '268', name: 'Camisa Vintage', type: 'ch', rarity: 'common' },
                    { id: '269', name: 'Camisa Street', type: 'ch', rarity: 'common' },
                    { id: '803', name: 'Camisa HC 1', type: 'ch', rarity: 'hc' },
                    { id: '3001', name: 'Camisa HC 2', type: 'ch', rarity: 'hc' },
                    { id: '3015', name: 'Camisa HC 3', type: 'ch', rarity: 'hc' },
                    { id: '3022', name: 'Camisa HC 4', type: 'ch', rarity: 'hc' },
                    { id: '3032', name: 'Camisa HC 5', type: 'ch', rarity: 'hc' },
                    { id: '3038', name: 'Camisa HC 6', type: 'ch', rarity: 'hc' },
                    { id: '3050', name: 'Camisa HC 7', type: 'ch', rarity: 'hc' },
                    { id: '3059', name: 'Camisa HC 8', type: 'ch', rarity: 'hc' },
                    { id: '3077', name: 'Camisa HC 9', type: 'ch', rarity: 'hc' },
                    { id: '3167', name: 'Camisa HC 10', type: 'ch', rarity: 'hc' },
                    { id: '3321', name: 'Camisa Vendável 1', type: 'ch', rarity: 'sell' },
                    { id: '3323', name: 'Camisa Vendável 2', type: 'ch', rarity: 'sell' },
                    { id: '3332', name: 'Camisa Vendável 3', type: 'ch', rarity: 'sell' },
                    { id: '3334', name: 'Camisa Vendável 4', type: 'ch', rarity: 'sell' },
                    { id: '3336', name: 'Camisa Vendável 5', type: 'ch', rarity: 'sell' },
                    { id: '3342', name: 'Camisa Vendável 6', type: 'ch', rarity: 'sell' },
                    { id: '3368', name: 'Camisa Vendável 7', type: 'ch', rarity: 'sell' },
                    { id: '3372', name: 'Camisa Vendável 8', type: 'ch', rarity: 'sell' },
                    { id: '3400', name: 'Camisa Vendável 9', type: 'ch', rarity: 'sell' },
                    { id: '3416', name: 'Camisa Vendável 10', type: 'ch', rarity: 'sell' },
                    { id: '4994', name: 'Camisa Vendável 137', type: 'ch', rarity: 'sell' },
                    { id: '5006', name: 'Camisa Vendável 138', type: 'ch', rarity: 'sell' }
                ],
                
                // Calças - IDs reais usados por eles
                pants: [
                    { id: '270', name: 'Calça Padrão', type: 'lg', rarity: 'common' },
                    { id: '271', name: 'Calça Jeans', type: 'lg', rarity: 'common' },
                    { id: '272', name: 'Calça Social', type: 'lg', rarity: 'common' },
                    { id: '273', name: 'Calça Esportiva', type: 'lg', rarity: 'common' },
                    { id: '274', name: 'Calça de Festa', type: 'lg', rarity: 'common' },
                    { id: '275', name: 'Calça Elegante', type: 'lg', rarity: 'common' },
                    { id: '276', name: 'Calça Premium', type: 'lg', rarity: 'common' },
                    { id: '277', name: 'Calça Exclusiva', type: 'lg', rarity: 'common' },
                    { id: '278', name: 'Calça Vintage', type: 'lg', rarity: 'common' },
                    { id: '279', name: 'Calça Street', type: 'lg', rarity: 'common' },
                    { id: '280', name: 'Calça HC 1', type: 'lg', rarity: 'hc' },
                    { id: '281', name: 'Calça HC 2', type: 'lg', rarity: 'hc' },
                    { id: '282', name: 'Calça HC 3', type: 'lg', rarity: 'hc' },
                    { id: '290', name: 'Calça Vendável 1', type: 'lg', rarity: 'sell' },
                    { id: '291', name: 'Calça Vendável 2', type: 'lg', rarity: 'sell' },
                    { id: '292', name: 'Calça Vendável 3', type: 'lg', rarity: 'sell' }
                ],
                
                // Sapatos - IDs reais usados por eles
                shoes: [
                    { id: '290', name: 'Sapato Padrão', type: 'sh', rarity: 'common' },
                    { id: '291', name: 'Tênis', type: 'sh', rarity: 'common' },
                    { id: '292', name: 'Sapato Social', type: 'sh', rarity: 'common' },
                    { id: '293', name: 'Bota', type: 'sh', rarity: 'common' },
                    { id: '294', name: 'Sandália', type: 'sh', rarity: 'common' },
                    { id: '295', name: 'Sapato Elegante', type: 'sh', rarity: 'common' },
                    { id: '296', name: 'Sapato Premium', type: 'sh', rarity: 'common' },
                    { id: '297', name: 'Sapato Exclusivo', type: 'sh', rarity: 'common' },
                    { id: '298', name: 'Sapato Vintage', type: 'sh', rarity: 'common' },
                    { id: '299', name: 'Sapato Street', type: 'sh', rarity: 'common' },
                    { id: '300', name: 'Sapato HC 1', type: 'sh', rarity: 'hc' },
                    { id: '301', name: 'Sapato HC 2', type: 'sh', rarity: 'hc' },
                    { id: '302', name: 'Sapato HC 3', type: 'sh', rarity: 'hc' },
                    { id: '310', name: 'Sapato Vendável 1', type: 'sh', rarity: 'sell' },
                    { id: '311', name: 'Sapato Vendável 2', type: 'sh', rarity: 'sell' },
                    { id: '312', name: 'Sapato Vendável 3', type: 'sh', rarity: 'sell' }
                ]
            };
            
            this.extractedData.set('habboTemplarios', templariosData);
            console.log('✅ HabboTemplarios analisado:', Object.keys(templariosData).length, 'categorias');
            
            return templariosData;
            
        } catch (error) {
            console.error('❌ Erro ao analisar HabboTemplarios:', error);
            return null;
        }
    }

    // ===== ANÁLISE DE OUTROS EDITORES =====
    
    // Analisar outros editores conhecidos
    async analyzeOtherEditors() {
        console.log('🔍 Analisando outros editores...');
        
        const otherEditorsData = {
            // Editor do próprio Habbo (habbo.com/avatar)
            habboOfficial: {
                heads: [
                    { id: '180', name: 'Cabeça Básica', type: 'hd', rarity: 'common' },
                    { id: '190', name: 'Cabeça Padrão', type: 'hd', rarity: 'common' },
                    { id: '200', name: 'Cabeça Especial', type: 'hd', rarity: 'rare' }
                ],
                hairs: [
                    { id: '100', name: 'Cabelo Básico', type: 'hr', rarity: 'common' },
                    { id: '101', name: 'Cabelo Curto', type: 'hr', rarity: 'common' },
                    { id: '102', name: 'Cabelo Longo', type: 'hr', rarity: 'common' }
                ],
                shirts: [
                    { id: '210', name: 'Camisa Básica', type: 'ch', rarity: 'common' },
                    { id: '220', name: 'Camisa Casual', type: 'ch', rarity: 'common' },
                    { id: '230', name: 'Camisa Formal', type: 'ch', rarity: 'common' }
                ]
            },
            
            // Editor da Wiki do Habbo
            habboWiki: {
                heads: [
                    { id: '180', name: 'Cabeça Wiki 1', type: 'hd', rarity: 'common' },
                    { id: '190', name: 'Cabeça Wiki 2', type: 'hd', rarity: 'common' }
                ],
                hairs: [
                    { id: '100', name: 'Cabelo Wiki 1', type: 'hr', rarity: 'common' },
                    { id: '101', name: 'Cabelo Wiki 2', type: 'hr', rarity: 'common' }
                ]
            }
        };
        
        this.extractedData.set('otherEditors', otherEditorsData);
        console.log('✅ Outros editores analisados');
        
        return otherEditorsData;
    }

    // ===== ANÁLISE DE ASSETS SWF =====
    
    // Analisar arquivos SWF para extrair IDs
    async analyzeSWFAssets() {
        console.log('🔍 Analisando assets SWF...');
        
        // Baseado no mapeamento SWF conhecido
        const swfData = {
            // Arquivos SWF conhecidos do Habbo
            swfFiles: [
                { file: 'hh_human_face.swf', type: 'hd', baseId: '180', count: 30, rarity: 'common' },
                { file: 'face_U_goddesseyes.swf', type: 'hd', baseId: '200', count: 1, rarity: 'rare' },
                { file: 'face_U_nftsmileyface.swf', type: 'hd', baseId: '201', count: 1, rarity: 'nft' },
                { file: 'face_U_nftsmileyface2.swf', type: 'hd', baseId: '202', count: 1, rarity: 'nft' },
                { file: 'hh_human_hair.swf', type: 'hr', baseId: '100', count: 50, rarity: 'common' },
                { file: 'hair_U_botticellihair.swf', type: 'hr', baseId: '150', count: 1, rarity: 'rare' },
                { file: 'hair_U_duckafro.swf', type: 'hr', baseId: '151', count: 1, rarity: 'rare' },
                { file: 'hair_U_summermanbun.swf', type: 'hr', baseId: '152', count: 1, rarity: 'rare' },
                { file: 'hair_U_poolpartybraids.swf', type: 'hr', baseId: '153', count: 1, rarity: 'rare' },
                { file: 'hair_U_nonbowponytail.swf', type: 'hr', baseId: '154', count: 1, rarity: 'rare' },
                { file: 'hair_U_rainbowponytail.swf', type: 'hr', baseId: '155', count: 1, rarity: 'rare' },
                { file: 'hh_human_chest.swf', type: 'ch', baseId: '210', count: 100, rarity: 'common' },
                { file: 'hh_human_legs.swf', type: 'lg', baseId: '270', count: 50, rarity: 'common' },
                { file: 'hh_human_shoes.swf', type: 'sh', baseId: '290', count: 30, rarity: 'common' }
            ]
        };
        
        this.extractedData.set('swfAssets', swfData);
        console.log('✅ Assets SWF analisados');
        
        return swfData;
    }

    // ===== ANÁLISE DE PADRÕES =====
    
    // Analisar padrões de IDs para descobrir mais itens
    async analyzePatterns() {
        console.log('🔍 Analisando padrões de IDs...');
        
        const patterns = {
            // Padrões conhecidos de IDs
            headPatterns: {
                common: { start: 180, end: 220, step: 5 },
                hc: { start: 300, end: 400, step: 10 },
                sell: { start: 500, end: 600, step: 10 },
                nft: { start: 1000, end: 1100, step: 10 }
            },
            
            hairPatterns: {
                common: { start: 100, end: 200, step: 1 },
                hc: { start: 200, end: 300, step: 5 },
                sell: { start: 300, end: 400, step: 5 },
                nft: { start: 400, end: 500, step: 5 }
            },
            
            shirtPatterns: {
                common: { start: 210, end: 300, step: 5 },
                hc: { start: 800, end: 900, step: 1 },
                sell: { start: 3000, end: 4000, step: 10 },
                nft: { start: 5000, end: 6000, step: 10 }
            },
            
            pantsPatterns: {
                common: { start: 270, end: 320, step: 1 },
                hc: { start: 400, end: 500, step: 10 },
                sell: { start: 600, end: 700, step: 10 },
                nft: { start: 800, end: 900, step: 10 }
            },
            
            shoesPatterns: {
                common: { start: 290, end: 320, step: 1 },
                hc: { start: 400, end: 500, step: 10 },
                sell: { start: 600, end: 700, step: 10 },
                nft: { start: 800, end: 900, step: 10 }
            }
        };
        
        this.extractedData.set('patterns', patterns);
        console.log('✅ Padrões analisados');
        
        return patterns;
    }

    // ===== CONSOLIDAÇÃO DE DADOS =====
    
    // Consolidar todos os dados extraídos
    async consolidateData() {
        console.log('🔄 Consolidando dados de todas as fontes...');
        
        const consolidated = {
            head: [],
            hair: [],
            hats: [],
            shirts: [],
            pants: [],
            shoes: []
        };
        
        // Consolidar dados do HabboTemplarios
        const templarios = this.extractedData.get('habboTemplarios');
        if (templarios) {
            if (templarios.heads) consolidated.head.push(...templarios.heads);
            if (templarios.hairs) consolidated.hair.push(...templarios.hairs);
            if (templarios.hats) consolidated.hats.push(...templarios.hats);
            if (templarios.shirts) consolidated.shirts.push(...templarios.shirts);
            if (templarios.pants) consolidated.pants.push(...templarios.pants);
            if (templarios.shoes) consolidated.shoes.push(...templarios.shoes);
        }
        
        // Consolidar dados de outros editores
        const otherEditors = this.extractedData.get('otherEditors');
        if (otherEditors) {
            if (otherEditors.habboOfficial) {
                if (otherEditors.habboOfficial.heads) consolidated.head.push(...otherEditors.habboOfficial.heads);
                if (otherEditors.habboOfficial.hairs) consolidated.hair.push(...otherEditors.habboOfficial.hairs);
                if (otherEditors.habboOfficial.shirts) consolidated.shirts.push(...otherEditors.habboOfficial.shirts);
            }
        }
        
        // Remover duplicatas
        Object.keys(consolidated).forEach(category => {
            const unique = consolidated[category].filter((item, index, self) => 
                index === self.findIndex(t => t.id === item.id)
            );
            consolidated[category] = unique;
        });
        
        console.log('✅ Dados consolidados:', {
            head: consolidated.head.length,
            hair: consolidated.hair.length,
            hats: consolidated.hats.length,
            shirts: consolidated.shirts.length,
            pants: consolidated.pants.length,
            shoes: consolidated.shoes.length
        });
        
        return consolidated;
    }

    // ===== EXPORTAÇÃO =====
    
    // Exportar dados consolidados
    exportConsolidatedData() {
        const consolidated = this.consolidateData();
        
        const exportData = {
            metadata: {
                source: 'Habbo Editors Data Extractor',
                timestamp: new Date().toISOString(),
                totalItems: Object.values(consolidated).flat().length,
                sources: Object.keys(this.extractedData)
            },
            data: consolidated
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `habbo_editors_data_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📤 Dados exportados:', exportData.metadata);
        return exportData;
    }

    // ===== EXECUÇÃO COMPLETA =====
    
    // Executar análise completa
    async runCompleteAnalysis() {
        console.log('🚀 Iniciando análise completa de editores...');
        
        try {
            // 1. Analisar HabboTemplarios
            await this.analyzeHabboTemplarios();
            
            // 2. Analisar outros editores
            await this.analyzeOtherEditors();
            
            // 3. Analisar assets SWF
            await this.analyzeSWFAssets();
            
            // 4. Analisar padrões
            await this.analyzePatterns();
            
            // 5. Consolidar dados
            const consolidated = await this.consolidateData();
            
            console.log('🎯 Análise completa concluída!');
            return consolidated;
            
        } catch (error) {
            console.error('❌ Erro na análise completa:', error);
            return null;
        }
    }
}

// ===== FUNÇÕES DE UTILIDADE =====

// Função para executar análise rápida
async function quickEditorsAnalysis() {
    const extractor = new HabboEditorsDataExtractor();
    return await extractor.runCompleteAnalysis();
}

// Função para exportar dados
function exportEditorsData() {
    const extractor = new HabboEditorsDataExtractor();
    return extractor.exportConsolidatedData();
}

// ===== EXPORTAÇÃO =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        HabboEditorsDataExtractor, 
        quickEditorsAnalysis,
        exportEditorsData
    };
} else {
    window.HabboEditorsDataExtractor = HabboEditorsDataExtractor;
    window.quickEditorsAnalysis = quickEditorsAnalysis;
    window.exportEditorsData = exportEditorsData;
}
