// ===== DETECÇÃO INTELIGENTE DE GÊNERO POR ANÁLISE VISUAL =====
// Sistema que analisa imagens para detectar diferenças entre M/F

class SmartGenderDetection {
    constructor() {
        this.cache = new Map();
        this.analysisQueue = [];
        this.isAnalyzing = false;
    }

    // Analisar imagem para detectar gênero baseado em características visuais
    async analyzeImageForGender(imageUrl, itemType, itemId) {
        const cacheKey = `${itemType}-${itemId}`;
        
        // Verificar cache primeiro
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Criar imagem para análise
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            const result = await new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        const gender = this.analyzeImageContent(img, itemType);
                        this.cache.set(cacheKey, gender);
                        resolve(gender);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => reject(new Error('Falha ao carregar imagem'));
                img.src = imageUrl;
            });

            return result;
        } catch (error) {
            console.warn(`⚠️ Falha na análise de ${itemType}-${itemId}:`, error);
            // Fallback para detecção baseada em ID
            return this.fallbackGenderDetection(itemId, itemType);
        }
    }

    // Analisar conteúdo da imagem para detectar características de gênero
    analyzeImageContent(img, itemType) {
        if (itemType === 'ch') { // Corpo
            return this.analyzeBodyImage(img);
        } else if (itemType === 'hr') { // Cabelo
            return this.analyzeHairImage(img);
        } else if (itemType === 'hd') { // Rosto
            return this.analyzeHeadImage(img);
        }
        
        return 'M'; // Padrão
    }

    // Analisar imagem do corpo para detectar seios
    analyzeBodyImage(img) {
        // Criar canvas para análise
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Definir tamanho do canvas
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Desenhar imagem no canvas
        ctx.drawImage(img, 0, 0);
        
        // Obter dados da imagem
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Análise simples baseada em padrões de cor e forma
        // Esta é uma implementação básica - pode ser melhorada com ML
        
        // Verificar se há diferenças significativas na parte superior (seios)
        const hasFemaleCharacteristics = this.detectFemaleBodyCharacteristics(data, canvas.width, canvas.height);
        
        return hasFemaleCharacteristics ? 'F' : 'M';
    }

    // Detectar características femininas no corpo
    detectFemaleBodyCharacteristics(imageData, width, height) {
        const data = imageData.data;
        
        // Área de análise (parte superior do corpo)
        const startY = Math.floor(height * 0.2); // 20% do topo
        const endY = Math.floor(height * 0.6);   // 60% do topo
        const centerX = Math.floor(width * 0.5); // Centro horizontal
        
        let leftBreastArea = 0;
        let rightBreastArea = 0;
        
        // Analisar área esquerda (seio esquerdo)
        for (let y = startY; y < endY; y++) {
            for (let x = centerX - 20; x < centerX; x++) {
                if (x >= 0 && x < width) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    // Detectar se há variação de cor (indicando forma)
                    if (this.isSkinTone(r, g, b)) {
                        leftBreastArea++;
                    }
                }
            }
        }
        
        // Analisar área direita (seio direito)
        for (let y = startY; y < endY; y++) {
            for (let x = centerX; x < centerX + 20; x++) {
                if (x >= 0 && x < width) {
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    
                    if (this.isSkinTone(r, g, b)) {
                        rightBreastArea++;
                    }
                }
            }
        }
        
        // Se ambas as áreas têm pixels suficientes, provavelmente é feminino
        const minBreastArea = 50; // Ajustar conforme necessário
        return leftBreastArea > minBreastArea && rightBreastArea > minBreastArea;
    }

    // Verificar se a cor é tom de pele
    isSkinTone(r, g, b) {
        // Tons de pele têm características específicas
        // R > G > B (vermelho dominante)
        // Diferença entre R e B deve ser significativa
        return r > g && g > b && (r - b) > 30 && r > 150;
    }

    // Analisar imagem do cabelo
    analyzeHairImage(img) {
        // Para cabelos, usar detecção baseada em ID conhecidos
        // Esta função pode ser expandida para análise visual mais avançada
        return 'M'; // Padrão
    }

    // Analisar imagem do rosto
    analyzeHeadImage(img) {
        // Para rostos, usar detecção baseada em ID conhecidos
        // Esta função pode ser expandida para análise de características faciais
        return 'M'; // Padrão
    }

    // Detecção de fallback baseada em ID
    fallbackGenderDetection(itemId, itemType) {
        const numId = parseInt(itemId);
        
        switch (itemType) {
            case 'ch': // Corpo
                // Corpos femininos geralmente têm IDs 200+
                if (numId >= 200 && numId < 1000) return 'F';
                if (numId < 200) return 'M';
                // Para IDs altos, usar padrão alternado
                return numId % 2 === 0 ? 'F' : 'M';
                
            case 'hr': // Cabelo
                // Cabelos femininos conhecidos
                const femaleHairIds = ['677', '678', '832', '833', '834', '835', '836', '838', '839', '840'];
                if (femaleHairIds.includes(itemId)) return 'F';
                // Cabelos masculinos conhecidos
                const maleHairIds = ['100', '101', '102', '103', '104', '105', '106', '107', '108', '109'];
                if (maleHairIds.includes(itemId)) return 'M';
                // Padrão baseado em ID
                return numId >= 600 ? 'F' : 'M';
                
            case 'hd': // Rosto
                // Rostos femininos conhecidos
                const femaleHeadIds = ['600', '605', '610', '615', '620', '625', '626', '627', '628', '629'];
                if (femaleHeadIds.includes(itemId)) return 'F';
                // Rostos masculinos conhecidos
                const maleHeadIds = ['190', '191', '192', '193', '194', '195', '196', '197', '198', '199'];
                if (maleHeadIds.includes(itemId)) return 'M';
                // Padrão baseado em ID
                return numId >= 600 ? 'F' : 'M';
                
            default:
                return 'M';
        }
    }

    // Detecção em lote para melhor performance
    async batchAnalyze(items) {
        const results = [];
        
        for (const item of items) {
            try {
                const gender = await this.analyzeImageForGender(
                    item.imageUrl, 
                    item.type, 
                    item.id
                );
                
                results.push({
                    ...item,
                    detectedGender: gender
                });
                
                // Pequena pausa para não sobrecarregar
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.warn(`⚠️ Erro na análise de ${item.type}-${item.id}:`, error);
                results.push({
                    ...item,
                    detectedGender: this.fallbackGenderDetection(item.id, item.type)
                });
            }
        }
        
        return results;
    }

    // Limpar cache
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache de análise limpo');
    }

    // Obter estatísticas do cache
    getCacheStats() {
        return {
            total: this.cache.size,
            male: Array.from(this.cache.values()).filter(g => g === 'M').length,
            female: Array.from(this.cache.values()).filter(g => g === 'F').length
        };
    }
}

// ===== FUNÇÕES DE UTILIDADE GLOBAIS =====

// Detecção inteligente de gênero
async function smartDetectGender(itemId, itemType, imageUrl = null) {
    if (!window.smartGenderDetection) {
        window.smartGenderDetection = new SmartGenderDetection();
    }
    
    // Se não tiver URL da imagem, gerar uma
    if (!imageUrl) {
        imageUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${itemType}-${itemId}-1-&gender=M&size=m`;
    }
    
    return await window.smartGenderDetection.analyzeImageForGender(imageUrl, itemType, itemId);
}

// Detecção rápida (sem análise de imagem)
function quickDetectGender(itemId, itemType) {
    if (!window.smartGenderDetection) {
        window.smartGenderDetection = new SmartGenderDetection();
    }
    
    return window.smartGenderDetection.fallbackGenderDetection(itemId, itemType);
}

// Exportar para uso global
window.SmartGenderDetection = SmartGenderDetection;
window.smartDetectGender = smartDetectGender;
window.quickDetectGender = quickDetectGender;
