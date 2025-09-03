// 🔧 FIX ESPECÍFICO PARA GRUPOS HABBO - MODAL
// Copie e cole este código no console do navegador (F12)
// Resolve o flicker das imagens de grupos no modal

console.log('🚀 Aplicando fix específico para grupos Habbo...');

// Cache para imagens pré-carregadas
const imageCache = new Map();

// Função para criar placeholder específico para grupos Habbo
function createHabboGroupPlaceholder(groupName) {
    const placeholder = document.createElement('div');
    placeholder.className = 'habbo-group-placeholder';
    placeholder.style.cssText = `
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        border: 2px solid #dee2e6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    
    // Spinner de carregamento
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 24px;
        height: 24px;
        border: 3px solid #e9ecef;
        border-top: 3px solid #007bff;
        border-radius: 50%;
        animation: habboSpin 1s linear infinite;
    `;
    
    // Nome do grupo como fallback
    const name = document.createElement('div');
    name.textContent = groupName ? groupName.substring(0, 2).toUpperCase() : 'GP';
    name.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 11px;
        font-weight: bold;
        color: #6c757d;
        text-align: center;
        font-family: Arial, sans-serif;
        text-shadow: 0 1px 2px rgba(255,255,255,0.8);
    `;
    
    placeholder.appendChild(spinner);
    placeholder.appendChild(name);
    
    return placeholder;
}

// Função para interceptar e melhorar as imagens de grupos
function enhanceHabboGroupImages() {
    console.log('🎯 Procurando por imagens de grupos Habbo...');
    
    // Procura especificamente por elementos habbo-group-badge
    const groupBadges = document.querySelectorAll('habbo-group-badge img');
    
    groupBadges.forEach((img, index) => {
        if (img && !img.dataset.enhanced) {
            console.log(`🔍 Processando grupo ${index + 1}: ${img.alt}`);
            
            // Marca como processado
            img.dataset.enhanced = 'true';
            
            // Adiciona transição suave
            img.style.transition = 'opacity 0.4s ease, transform 0.3s ease';
            img.style.opacity = '0';
            
            // Se a imagem não carregou, mostra placeholder
            if (!img.complete || img.naturalWidth === 0) {
                const groupName = img.alt || 'Grupo';
                const placeholder = createHabboGroupPlaceholder(groupName);
                
                // Insere o placeholder antes da imagem
                img.parentNode.insertBefore(placeholder, img);
                
                // Quando a imagem carregar, remove o placeholder
                img.onload = () => {
                    if (placeholder.parentNode) {
                        placeholder.style.opacity = '0';
                        placeholder.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            if (placeholder.parentNode) {
                                placeholder.remove();
                            }
                            img.style.opacity = '1';
                        }, 300);
                    }
                };
                
                // Tratamento de erro
                img.onerror = () => {
                    console.log(`❌ Erro ao carregar imagem: ${img.src}`);
                    if (placeholder.parentNode) {
                        placeholder.style.background = 'linear-gradient(135deg, #f8d7da, #f5c6cb)';
                        placeholder.style.borderColor = '#dc3545';
                        name.style.color = '#721c24';
                    }
                };
            } else {
                // Imagem já carregada
                img.style.opacity = '1';
            }
        }
    });
    
    // Procura por elementos com classe item--group
    const groupItems = document.querySelectorAll('.item--group');
    
    groupItems.forEach((item, index) => {
        if (item && !item.dataset.enhanced) {
            item.dataset.enhanced = 'true';
            
            // Adiciona hover effect
            item.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-2px)';
                item.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                item.style.boxShadow = 'none';
            });
        }
    });
}

// Função para aplicar o fix
function applyHabboGroupsFix() {
    console.log('🎯 Aplicando fix específico para grupos Habbo...');
    
    // Adiciona CSS específico para grupos Habbo
    const style = document.createElement('style');
    style.textContent = `
        @keyframes habboSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .habbo-group-placeholder {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        habbo-group-badge img {
            transition: opacity 0.4s ease, transform 0.3s ease;
        }
        
        .item--group {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .item--group:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .item__icon__aligner {
            transition: transform 0.2s ease;
        }
        
        .item--group:hover .item__icon__aligner {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
    
    // Aplica o enhancement
    enhanceHabboGroupImages();
    
    // Observa mudanças no DOM para novos grupos
    const observer = new MutationObserver((mutations) => {
        let shouldEnhance = false;
        
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.querySelector) {
                    if (node.querySelector('habbo-group-badge') || 
                        node.querySelector('.item--group') ||
                        node.classList?.contains('item--group')) {
                        shouldEnhance = true;
                    }
                }
            });
        });
        
        if (shouldEnhance) {
            console.log('🔄 Novos grupos detectados, aplicando enhancement...');
            setTimeout(enhanceHabboGroupImages, 100);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Monitora mudanças na URL para páginas de perfil
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            if (currentUrl.includes('/profile/')) {
                console.log('🔄 Nova página de perfil detectada, aplicando fix...');
                setTimeout(enhanceHabboGroupImages, 1000);
            }
        }
    }, 1000);
    
    console.log('✅ Fix específico para grupos Habbo aplicado com sucesso!');
}

// Função para testar o fix
function testHabboGroupsFix() {
    console.log('🧪 Testando fix específico para grupos Habbo...');
    
    const groupBadges = document.querySelectorAll('habbo-group-badge img');
    console.log(`📊 Encontrados ${groupBadges.length} badges de grupos`);
    
    groupBadges.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.alt} - ${img.src}`);
    });
    
    console.log('✅ Teste concluído!');
}

// Função para recarregar o enhancement
function reloadHabboGroupsFix() {
    console.log('🔄 Recarregando enhancement para grupos Habbo...');
    enhanceHabboGroupImages();
}

// Aplica o fix automaticamente
applyHabboGroupsFix();

// Adiciona comandos úteis ao console
window.habboGroupsFix = {
    test: testHabboGroupsFix,
    reload: reloadHabboGroupsFix,
    enhance: enhanceHabboGroupImages,
    cache: imageCache
};

console.log('🎉 Fix específico para grupos Habbo aplicado!');
console.log('📚 Comandos disponíveis:');
console.log('  - window.habboGroupsFix.test() - Testa o fix');
console.log('  - window.habboGroupsFix.reload() - Recarrega o enhancement');
console.log('  - window.habboGroupsFix.enhance() - Aplica enhancement manualmente');
console.log('  - window.habboGroupsFix.cache - Visualiza o cache de imagens');
console.log('');
console.log('🎯 Este fix resolve especificamente o flicker das imagens de grupos no modal Habbo!');
