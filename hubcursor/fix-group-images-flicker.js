/**
 * Solução para o problema de flicker das imagens de grupos no Habbo Hub
 * Baseada no mesmo padrão usado para as fotos dos quartos
 * Este arquivo resolve o problema de imagens que piscam durante o carregamento
 */

// Cache para imagens pré-carregadas
const imageCache = new Map();

// URLs base para badges de grupos (baseado no external_variables.txt)
const GROUP_BADGE_URLS = {
    // URL principal do badge (linha 206 do external_variables.txt)
    badge: (imagerdata) => `https://www.habbo.com.br/habbo-imaging/badge/${imagerdata}.gif`,
    
    // URL do logo preenchido (linha 214 do external_variables.txt) 
    badgeFill: (imagerdata) => `https://www.habbo.com.br/habbo-imaging/badge-fill/${imagerdata}.gif`,
    
    // Fallbacks para diferentes servidores
    fallbacks: [
        (imagerdata) => `https://images.habbo.com/c_images/album1584/${imagerdata}.gif`,
        (imagerdata) => `https://www.habbo.com/habbo-imaging/badge/${imagerdata}.png`,
        (imagerdata) => `https://images.habbo.com/c_images/Badgeparts/${imagerdata}.gif`
    ]
};

/**
 * Função para mapear grupos com URLs de imagem (similar ao padrão das fotos dos quartos)
 * Baseada na linha 389 do site-javascript.js:
 * a.map(l=>({id:l.id||l.photoId||String(Math.random()),url:l.url||l.photoUrl||l.previewUrl||l.thumbnailUrl||l.imageUrl||l.src||"",takenOn:l.takenOn||l.createdAt||l.timestamp||new Date().toISOString()})).filter(l=>l.url)
 */
function mapGroupsWithImages(groups) {
    if (!groups || !Array.isArray(groups)) {
        console.warn('[Group Images] No groups found or invalid groups array');
        return [];
    }
    
    return groups.map(g => ({
        // ID com fallback (mesmo padrão das fotos)
        id: g.id || g.groupId || g.badgeCode || String(Math.random()),
        
        // Nome do grupo
        name: g.name || g.groupName || 'Grupo sem nome',
        
        // URL da imagem com múltiplos fallbacks (mesmo padrão das fotos)
        badgeUrl: g.badgeUrl || 
                  g.badge || 
                  g.imageUrl || 
                  g.thumbnailUrl || 
                  g.previewUrl || 
                  g.src || 
                  (g.badgeCode ? GROUP_BADGE_URLS.badge(g.badgeCode) : '') ||
                  (g.imagerdata ? GROUP_BADGE_URLS.badge(g.imagerdata) : '') ||
                  '',
        
        // Dados adicionais
        description: g.description || '',
        memberCount: g.memberCount || g.members || 0,
        type: g.type || 'normal',
        
        // Timestamp (mesmo padrão das fotos)
        createdAt: g.createdAt || g.created || g.timestamp || new Date().toISOString(),
        
        // Dados originais para fallback
        originalData: g
    })).filter(g => g.badgeUrl); // Filtrar apenas grupos com URL válida (mesmo padrão das fotos)
}

/**
 * Função para pré-carregar imagens de grupos com fallbacks
 */
function preloadGroupImages(groups) {
    if (!groups || !Array.isArray(groups)) return Promise.resolve();
    
    const mappedGroups = mapGroupsWithImages(groups);
    
    const preloadPromises = mappedGroups.map(group => {
        return new Promise((resolve) => {
            if (imageCache.has(group.badgeUrl)) {
                resolve(group);
                return;
            }
            
            const img = new Image();
            let fallbackIndex = 0;
            
            const tryLoadImage = (url) => {
                img.onload = () => {
                    imageCache.set(group.badgeUrl, img);
                    console.log(`✅ [Group Images] Loaded: ${group.name} - ${url}`);
                    resolve(group);
                };
                
                img.onerror = () => {
                    console.warn(`❌ [Group Images] Failed to load: ${group.name} - ${url}`);
                    
                    // Tentar fallbacks baseados no badgeCode/imagerdata
                    if (fallbackIndex < GROUP_BADGE_URLS.fallbacks.length) {
                        const badgeCode = group.originalData.badgeCode || group.originalData.imagerdata;
                        if (badgeCode) {
                            const fallbackUrl = GROUP_BADGE_URLS.fallbacks[fallbackIndex](badgeCode);
                            fallbackIndex++;
                            console.log(`🔄 [Group Images] Trying fallback ${fallbackIndex}: ${fallbackUrl}`);
                            tryLoadImage(fallbackUrl);
                            return;
                        }
                    }
                    
                    // Se todos os fallbacks falharam, marcar como erro no cache
                    imageCache.set(group.badgeUrl, null);
                    console.error(`❌ [Group Images] All fallbacks failed for: ${group.name}`);
                    resolve(group);
                };
                
                img.src = url;
            };
            
            // Começar com a URL principal
            tryLoadImage(group.badgeUrl);
        });
    });
    
    return Promise.all(preloadPromises);
}

/**
 * Função para criar placeholder de carregamento para grupos
 */
function createGroupPlaceholder(group) {
    const placeholder = document.createElement('div');
    placeholder.className = 'group-placeholder loading';
    placeholder.innerHTML = `
        <div class="group-placeholder-content">
            <div class="group-placeholder-image">
                <div class="loading-spinner"></div>
            </div>
            <div class="group-placeholder-text">
                <div class="group-placeholder-name">Carregando...</div>
            </div>
        </div>
    `;
    
    return placeholder;
}

/**
 * Função para renderizar grupo com imagem carregada
 */
function renderGroupWithImage(group, container) {
    const groupElement = document.createElement('div');
    groupElement.className = 'group-item loaded';
    groupElement.setAttribute('data-group-id', group.id);
    
    const cachedImage = imageCache.get(group.badgeUrl);
    
    if (cachedImage === null) {
        // Imagem falhou ao carregar - mostrar fallback
        groupElement.innerHTML = `
            <div class="group-item-content">
                <div class="group-item-image error">
                    <div class="group-fallback-icon">👥</div>
                </div>
                <div class="group-item-text">
                    <div class="group-item-name">${group.name}</div>
                </div>
            </div>
        `;
    } else {
        // Imagem carregada com sucesso
        groupElement.innerHTML = `
            <div class="group-item-content">
                <div class="group-item-image">
                    <img src="${group.badgeUrl}" 
                         alt="${group.name}" 
                         class="group-badge-image"
                         loading="lazy"
                         onError="this.parentElement.innerHTML='<div class=\\"group-fallback-icon\\">👥</div>'"
                    />
                </div>
                <div class="group-item-text">
                    <div class="group-item-name">${group.name}</div>
                    ${group.memberCount ? `<div class="group-member-count">${group.memberCount} membros</div>` : ''}
                </div>
            </div>
        `;
    }
    
    // Aplicar transição suave
    groupElement.style.opacity = '0';
    container.appendChild(groupElement);
    
    // Fade in
    requestAnimationFrame(() => {
        groupElement.style.transition = 'opacity 0.3s ease-in-out';
        groupElement.style.opacity = '1';
    });
    
    return groupElement;
}

/**
 * Função principal para renderizar grupos sem flicker
 */
async function renderGroupsWithoutFlicker(groups, container) {
    if (!container) {
        console.error('[Group Images] Container not found');
        return;
    }
    
    console.log(`🔄 [Group Images] Rendering ${groups.length} groups...`);
    
    // Mapear grupos com URLs corretas
    const mappedGroups = mapGroupsWithImages(groups);
    
    // Limpar container
    container.innerHTML = '';
    
    // Criar placeholders imediatamente (evita layout shift)
    mappedGroups.forEach(group => {
        const placeholder = createGroupPlaceholder(group);
        container.appendChild(placeholder);
    });
    
    // Pré-carregar todas as imagens
    const loadedGroups = await preloadGroupImages(mappedGroups);
    
    // Substituir placeholders por grupos carregados
    const placeholders = container.querySelectorAll('.group-placeholder');
    
    loadedGroups.forEach((group, index) => {
        const placeholder = placeholders[index];
        if (placeholder) {
            const groupElement = renderGroupWithImage(group, container);
            
            // Remover placeholder após transição
            setTimeout(() => {
                if (placeholder.parentNode) {
                    placeholder.remove();
                }
            }, 300);
        }
    });
    
    console.log(`✅ [Group Images] Rendered ${loadedGroups.length} groups successfully`);
}

/**
 * Interceptar chamadas de API de grupos para aplicar o fix automaticamente
 */
function interceptGroupsAPI() {
    // Interceptar fetch para APIs de grupos
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
        const response = await originalFetch.apply(this, args);
        
        // Verificar se é uma resposta de API de grupos
        const url = args[0];
        if (typeof url === 'string' && (
            url.includes('/api/public/users') || 
            url.includes('/profile/') ||
            url.includes('groups')
        )) {
            try {
                const clonedResponse = response.clone();
                const data = await clonedResponse.json();
                
                // Se contém grupos, pré-carregar as imagens
                if (data && (data.groups || Array.isArray(data))) {
                    const groupsArray = data.groups || (Array.isArray(data) ? data : []);
                    if (groupsArray.length > 0) {
                        console.log(`🔄 [Group Images] Intercepted API call, pre-loading ${groupsArray.length} group images...`);
                        preloadGroupImages(groupsArray);
                    }
                }
            } catch (e) {
                // Ignorar erros de parsing - não é JSON ou não contém grupos
            }
        }
        
        return response;
    };
}

/**
 * Função para aplicar estilos CSS necessários
 */
function applyGroupImageStyles() {
    const styles = `
        <style id="group-images-fix-styles">
            /* Placeholders de carregamento */
            .group-placeholder {
                display: flex;
                align-items: center;
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                margin: 4px 0;
                min-height: 60px;
            }
            
            .group-placeholder-content {
                display: flex;
                align-items: center;
                width: 100%;
            }
            
            .group-placeholder-image {
                width: 44px;
                height: 44px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
            }
            
            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .group-placeholder-text {
                flex: 1;
            }
            
            .group-placeholder-name {
                height: 16px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
            
            /* Grupos carregados */
            .group-item {
                display: flex;
                align-items: center;
                padding: 8px;
                border-radius: 8px;
                margin: 4px 0;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .group-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-1px);
            }
            
            .group-item-content {
                display: flex;
                align-items: center;
                width: 100%;
            }
            
            .group-item-image {
                width: 44px;
                height: 44px;
                margin-right: 12px;
                border-radius: 6px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .group-badge-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                transition: transform 0.2s ease;
            }
            
            .group-item:hover .group-badge-image {
                transform: scale(1.05);
            }
            
            .group-item-image.error {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .group-fallback-icon {
                font-size: 20px;
                opacity: 0.7;
            }
            
            .group-item-text {
                flex: 1;
                min-width: 0;
            }
            
            .group-item-name {
                font-weight: 600;
                color: #fff;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .group-member-count {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            /* Transições suaves */
            .group-item.loaded {
                animation: fadeInUp 0.3s ease-out;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Estados de carregamento específicos */
            .groups-container.loading {
                position: relative;
            }
            
            .groups-container.loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 255, 255, 0.1) 50%, 
                    transparent 100%);
                animation: shimmer 2s infinite;
                pointer-events: none;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        </style>
    `;
    
    // Remover estilos existentes se houver
    const existingStyles = document.getElementById('group-images-fix-styles');
    if (existingStyles) {
        existingStyles.remove();
    }
    
    // Adicionar novos estilos
    document.head.insertAdjacentHTML('beforeend', styles);
}

/**
 * Função para monitorar mudanças no DOM e aplicar o fix automaticamente
 */
function observeGroupsContainer() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Procurar por containers de grupos
                    const groupContainers = node.querySelectorAll ? 
                        node.querySelectorAll('[class*="group"], [class*="badge"], [data-testid*="group"]') : 
                        [];
                    
                    if (groupContainers.length > 0) {
                        console.log(`🔍 [Group Images] Found ${groupContainers.length} potential group containers`);
                        
                        groupContainers.forEach(container => {
                            // Verificar se contém imagens de grupos
                            const groupImages = container.querySelectorAll('img[src*="badge"], img[src*="group"]');
                            if (groupImages.length > 0) {
                                console.log(`🔧 [Group Images] Applying fix to container with ${groupImages.length} group images`);
                                applyFlickerFixToContainer(container);
                            }
                        });
                    }
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return observer;
}

/**
 * Aplicar fix de flicker a um container específico
 */
function applyFlickerFixToContainer(container) {
    const images = container.querySelectorAll('img[src*="badge"], img[src*="group"]');
    
    images.forEach(img => {
        // Se a imagem ainda não foi carregada
        if (!img.complete) {
            // Criar placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'group-image-placeholder';
            placeholder.style.cssText = `
                width: ${img.offsetWidth || 44}px;
                height: ${img.offsetHeight || 44}px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            `;
            
            placeholder.innerHTML = '<div class="loading-spinner"></div>';
            
            // Substituir imagem por placeholder temporariamente
            img.style.display = 'none';
            img.parentNode.insertBefore(placeholder, img);
            
            // Quando a imagem carregar
            img.onload = () => {
                img.style.display = '';
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                placeholder.remove();
                
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
            };
            
            // Se a imagem falhar
            img.onerror = () => {
                placeholder.innerHTML = '<div class="group-fallback-icon">👥</div>';
                placeholder.style.background = 'rgba(255, 255, 255, 0.2)';
            };
        }
    });
}

/**
 * Inicializar o sistema de fix de grupos
 */
function initGroupImagesFix() {
    console.log('🚀 [Group Images] Initializing group images flicker fix...');
    
    // Aplicar estilos CSS
    applyGroupImageStyles();
    
    // Interceptar APIs
    interceptGroupsAPI();
    
    // Observar mudanças no DOM
    const observer = observeGroupsContainer();
    
    // Aplicar fix a grupos já existentes na página
    const existingGroupContainers = document.querySelectorAll('[class*="group"], [class*="badge"]');
    existingGroupContainers.forEach(container => {
        const groupImages = container.querySelectorAll('img[src*="badge"], img[src*="group"]');
        if (groupImages.length > 0) {
            console.log(`🔧 [Group Images] Applying fix to existing container with ${groupImages.length} images`);
            applyFlickerFixToContainer(container);
        }
    });
    
    console.log('✅ [Group Images] Group images flicker fix initialized successfully');
    
    return {
        observer,
        destroy: () => {
            observer.disconnect();
            const styles = document.getElementById('group-images-fix-styles');
            if (styles) styles.remove();
            console.log('🗑️ [Group Images] Fix destroyed');
        }
    };
}

// Auto-inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGroupImagesFix);
} else {
    initGroupImagesFix();
}

// Exportar funções para uso manual
window.GroupImagesFix = {
    init: initGroupImagesFix,
    mapGroupsWithImages,
    preloadGroupImages,
    renderGroupsWithoutFlicker,
    GROUP_BADGE_URLS
};

console.log('📦 [Group Images] Fix loaded and ready!');
