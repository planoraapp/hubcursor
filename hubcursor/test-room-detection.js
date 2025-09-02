// 🧪 TESTE DE DETECÇÃO DE QUARTOS - HABBO HUB
// Script para testar se o sistema está detectando corretamente os quartos
// Execute no console para ver o que está sendo detectado

console.log('🧪 Iniciando teste de detecção de quartos...');

// Função para testar a detecção
function testRoomDetection() {
    console.log('🔍 Testando detecção de quartos...');
    
    // Testa os selectors que estamos usando
    const testSelectors = [
        '[data-component-name="div"]:has(.font-medium, .text-lg, h3, h4, h5, h6)',
        '.bg-white\\/10.rounded.border.border-black:has(.font-medium, .text-lg)',
        '.modal-content [data-component-name="div"]:has(.font-medium)',
        '[data-component-name="div"]:has([class*="font-medium"]:not(:empty))',
        '[data-component-name="div"]:has(a[href*="room"])',
        '.bg-gray-900 [data-component-name="div"]:has([class*="text-"])'
    ];
    
    console.log('📋 Selectors sendo testados:');
    testSelectors.forEach((selector, index) => {
        try {
            const found = document.querySelectorAll(selector);
            console.log(`  ${index + 1}. ${selector}: ${found.length} elementos`);
            
            // Mostra os primeiros 3 elementos encontrados
            Array.from(found).slice(0, 3).forEach((element, elemIndex) => {
                const text = element.textContent?.trim().substring(0, 50) || 'Sem texto';
                console.log(`     ${elemIndex + 1}. "${text}"`);
            });
        } catch (e) {
            console.log(`  ${index + 1}. ${selector}: ERRO - ${e.message}`);
        }
    });
    
    // Testa a função de validação
    console.log('\n🔍 Testando validação de banners...');
    
    const allDivs = document.querySelectorAll('[data-component-name="div"]');
    console.log(`📊 Total de divs com data-component-name: ${allDivs.length}`);
    
    let validBanners = 0;
    let invalidBanners = 0;
    
    allDivs.forEach((div, index) => {
        if (index < 10) { // Testa apenas os primeiros 10
            const text = div.textContent?.trim().substring(0, 30) || '';
            const isValid = isValidRoomBanner(div);
            
            if (isValid) {
                validBanners++;
                console.log(`✅ ${index + 1}. VÁLIDO: "${text}"`);
            } else {
                invalidBanners++;
                console.log(`❌ ${index + 1}. INVÁLIDO: "${text}"`);
            }
        }
    });
    
    console.log(`\n📊 Resumo: ${validBanners} banners válidos, ${invalidBanners} inválidos`);
}

// Função de validação (cópia da do sistema principal)
function isValidRoomBanner(element) {
    if (!element || !element.textContent) return false;
    
    const text = element.textContent.trim();
    if (text.length < 3 || text.length > 100) return false;
    
    // Verifica se contém texto que parece nome de quarto
    const hasRoomName = /^[A-Za-zÀ-ÿ0-9\s\-_\.]+$/.test(text);
    if (!hasRoomName) return false;
    
    // Verifica se não é apenas texto genérico
    const genericTexts = ['quarto', 'room', 'loading', 'carregando', 'error', 'erro', 'undefined', 'null'];
    if (genericTexts.some(generic => text.toLowerCase().includes(generic))) return false;
    
    // Verifica se tem estrutura visual adequada
    const hasVisualStructure = element.querySelector('.font-medium, .text-lg, h3, h4, h5, h6, [class*="font-"]');
    if (!hasVisualStructure) return false;
    
    return true;
}

// Função para testar extração de nomes
function testNameExtraction() {
    console.log('\n🔍 Testando extração de nomes...');
    
    const banners = document.querySelectorAll('[data-component-name="div"]');
    
    banners.forEach((banner, index) => {
        if (index < 5) { // Testa apenas os primeiros 5
            const name = extractRoomName(banner);
            const text = banner.textContent?.trim().substring(0, 30) || '';
            
            console.log(`${index + 1}. Banner: "${text}"`);
            console.log(`   Nome extraído: "${name}"`);
            console.log('   ---');
        }
    });
}

// Função de extração de nomes (cópia da do sistema principal)
function extractRoomName(banner) {
    const selectors = [
        '.font-medium.text-white',
        '.text-lg.font-bold',
        '.font-semibold',
        '.font-bold',
        '[class*="font-medium"]',
        '[class*="font-bold"]',
        'h3, h4, h5, h6',
        '[class*="text-"]:not([class*="text-gray"]):not([class*="text-sm"]):not([class*="text-xs"])',
        'span:not([class*="text-gray"]):not([class*="text-sm"]):not([class*="text-xs"])',
        'div:not([class*="text-gray"]):not([class*="text-sm"]):not([class*="text-xs"])'
    ];
    
    let bestMatch = null;
    let bestScore = 0;
    
    selectors.forEach(selector => {
        try {
            const elements = banner.querySelectorAll(selector);
            elements.forEach(element => {
                if (element && element.textContent) {
                    const text = element.textContent.trim();
                    const score = calculateNameScore(text);
                    
                    if (score > bestScore && score > 0.5) {
                        bestScore = score;
                        bestMatch = text;
                    }
                }
            });
        } catch (e) {
            // Ignora erros de selector
        }
    });
    
    if (!bestMatch || bestScore < 0.5) {
        const allText = banner.textContent.trim();
        const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        for (const line of lines) {
            const score = calculateNameScore(line);
            if (score > bestScore && score > 0.3) {
                bestScore = score;
                bestMatch = line;
            }
        }
    }
    
    if (bestMatch && bestScore > 0.3) {
        return bestMatch;
    }
    
    return null;
}

// Função de pontuação (cópia da do sistema principal)
function calculateNameScore(text) {
    if (!text || text.length < 3) return 0;
    
    let score = 0;
    
    if (text.length >= 3 && text.length <= 50) score += 0.3;
    if (/^[A-Za-zÀ-ÿ0-9\s\-_\.]+$/.test(text)) score += 0.2;
    
    const genericTexts = ['quarto', 'room', 'loading', 'carregando', 'error', 'erro', 'undefined', 'null', 'click', 'clique'];
    if (!genericTexts.some(generic => text.toLowerCase().includes(generic))) score += 0.3;
    
    const roomWords = ['casa', 'house', 'hotel', 'palace', 'castle', 'villa', 'mansion', 'apartment', 'flat'];
    if (roomWords.some(word => text.toLowerCase().includes(word))) score += 0.2;
    
    if (/^[A-Z]/.test(text)) score += 0.1;
    
    const wordCount = text.split(/\s+/).length;
    if (wordCount <= 5) score += 0.1;
    
    return Math.min(score, 1.0);
}

// Executa os testes
testRoomDetection();
testNameExtraction();

console.log('\n🎯 Teste concluído! Use estas funções para debug:');
console.log('  - testRoomDetection() - Testa detecção de quartos');
console.log('  - testNameExtraction() - Testa extração de nomes');
console.log('  - isValidRoomBanner(element) - Valida um elemento específico');
console.log('  - extractRoomName(banner) - Extrai nome de um banner específico');
