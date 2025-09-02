// 🔧 FIX FLICKER IMAGENS DE GRUPOS - HABBO HUB
// Copie e cole este código no console do navegador (F12)

console.log('🚀 Aplicando fix para flicker das imagens de grupos...');

// Cache para imagens pré-carregadas
const imageCache = new Map();

// URLs base para badges de grupos
const GROUP_BADGE_URLS = {
    badge: (imagerdata) => `https://www.habbo.com.br/habbo-imaging/badge/${imagerdata}.gif`,
    badgeFill: (imagerdata) => `https://www.habbo.com.br/habbo-imaging/badge-fill/${imagerdata}.gif`,
    fallback: (imagerdata) => `https://images.habbo.com/c_images/album1584/${imagerdata}.gif`
};

// Função para pré-carregar imagens de grupos
function preloadGroupImages(groups) {
    if (!groups || !Array.isArray(groups)) return;
    
    groups.forEach(group => {
        if (group.badgeUrl && !imageCache.has(group.badgeUrl)) {
            const img = new Image();
            img.onload = () => {
                imageCache.set(group.badgeUrl, img);
                console.log(`✅ Imagem pré-carregada: ${group.badgeUrl}`);
            };
            img.onerror = () => {
                imageCache.set(group.badgeUrl, null);
                console.log(`❌ Erro ao carregar: ${group.badgeUrl}`);
            };
            img.src = group.badgeUrl;
        }
    });
}

// Função para criar placeholder de carregamento
function createLoadingPlaceholder(group) {
    const placeholder = document.createElement('div');
    placeholder.className = 'group-badge-placeholder';
    placeholder.style.cssText = `
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 5px;
        position: relative;
        overflow: hidden;
    `;
    
    // Spinner de carregamento
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid #ccc;
        border-top: 2px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    // Nome do grupo como fallback
    const name = document.createElement('div');
    name.textContent = group.name ? group.name.substring(0, 2).toUpperCase() : 'GP';
    name.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: bold;
        color: #666;
        text-align: center;
    `;
    
    placeholder.appendChild(spinner);
    placeholder.appendChild(name);
    
    return placeholder;
}

// Função para substituir placeholders por imagens reais
function replacePlaceholders() {
    const placeholders = document.querySelectorAll('.group-badge-placeholder');
    
    placeholders.forEach(placeholder => {
        const groupData = placeholder.dataset.group;
        if (groupData) {
            try {
                const group = JSON.parse(groupData);
                const img = document.createElement('img');
                img.src = group.badgeUrl;
                img.alt = group.name || 'Grupo';
                img.style.cssText = `
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    object-fit: cover;
                    transition: opacity 0.3s ease;
                `;
                
                img.onload = () => {
                    placeholder.style.opacity = '0';
                    setTimeout(() => {
                        placeholder.parentNode.replaceChild(img, placeholder);
                        img.style.opacity = '1';
                    }, 300);
                };
                
                img.onerror = () => {
                    // Fallback para imagem padrão
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4wNTEgMjUgMzggMTkuMDUxIDM4IDEyQzM4IDQuOTQ5IDMyLjA1MSAtMSAyNSAtMUMxNy45NDkgLTEgMTIgNC45NDkgMTIgMTJDMTIgMTkuMDUxIDE3Ljk0OSAyNSAyNSAyNVoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
                };
            } catch (e) {
                console.error('Erro ao processar dados do grupo:', e);
            }
        }
    });
}

// Função para interceptar e melhorar a renderização de grupos
function enhanceGroupRendering() {
    // Aguarda o carregamento da página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceGroupRendering);
        return;
    }
    
    // Procura por elementos de grupos existentes
    const groupElements = document.querySelectorAll('[class*="group"], [id*="group"], [data-group]');
    
    groupElements.forEach(element => {
        if (element.querySelector('img')) {
            const img = element.querySelector('img');
            const groupName = element.textContent.trim() || 'Grupo';
            
            // Adiciona transição suave
            img.style.transition = 'opacity 0.3s ease';
            
            // Se a imagem não carregou, mostra placeholder
            if (!img.complete || img.naturalWidth === 0) {
                const placeholder = createLoadingPlaceholder({ name: groupName });
                element.appendChild(placeholder);
                
                img.onload = () => {
                    if (placeholder.parentNode) {
                        placeholder.style.opacity = '0';
                        setTimeout(() => placeholder.remove(), 300);
                    }
                };
            }
        }
    });
    
    // Observa mudanças no DOM para novos grupos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.querySelector) {
                    const newGroups = node.querySelectorAll('[class*="group"], [id*="group"], [data-group]');
                    if (newGroups.length > 0) {
                        enhanceGroupRendering();
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Função para aplicar o fix
function applyGroupImagesFix() {
    console.log('🎯 Aplicando fix para imagens de grupos...');
    
    // Adiciona CSS para transições suaves
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .group-badge-placeholder {
            transition: opacity 0.3s ease;
        }
        
        img[src*="badge"], img[src*="group"] {
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Aplica o enhancement
    enhanceGroupRendering();
    
    // Monitora mudanças na URL para páginas de perfil
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            if (currentUrl.includes('/profile/')) {
                console.log('🔄 Nova página de perfil detectada, aplicando fix...');
                setTimeout(enhanceGroupRendering, 1000);
            }
        }
    }, 1000);
    
    console.log('✅ Fix aplicado com sucesso!');
}

// Aplica o fix automaticamente
applyGroupImagesFix();

// Função para testar o fix
function testGroupImagesFix() {
    console.log('🧪 Testando fix das imagens de grupos...');
    
    // Simula grupos para teste
    const testGroups = [
        { name: 'Teste 1', badgeUrl: 'https://www.habbo.com.br/habbo-imaging/badge/test1.gif' },
        { name: 'Teste 2', badgeUrl: 'https://www.habbo.com.br/habbo-imaging/badge/test2.gif' }
    ];
    
    preloadGroupImages(testGroups);
    console.log('✅ Teste concluído!');
}

// Adiciona comandos úteis ao console
window.groupImagesFix = {
    test: testGroupImagesFix,
    reload: enhanceGroupRendering,
    cache: imageCache,
    urls: GROUP_BADGE_URLS
};

console.log('🎉 Fix aplicado! Use window.groupImagesFix para comandos úteis.');
console.log('📚 Comandos disponíveis:');
console.log('  - window.groupImagesFix.test() - Testa o fix');
console.log('  - window.groupImagesFix.reload() - Recarrega o enhancement');
console.log('  - window.groupImagesFix.cache - Visualiza o cache de imagens');
console.log('  - window.groupImagesFix.urls - Visualiza as URLs dos badges');
