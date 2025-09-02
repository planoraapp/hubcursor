// 🎯 INTEGRAÇÃO AUTOMÁTICA - HABBO HUB
// Sistema que se integra automaticamente ao Habbo Hub existente
// Adiciona fotos dos quartos nos banners sem necessidade de inclusão manual

(function() {
    'use strict';
    
    console.log('🚀 Sistema de integração automática - Habbo Hub - Inicializando...');
    
    // Sistema de integração automática
    class HabboHubAutoIntegration {
        constructor() {
            this.isIntegrated = false;
            this.roomPhotoSystem = null;
            this.init();
        }
        
        init() {
            // Aguarda o Habbo Hub estar carregado
            this.waitForHabboHub();
        }
        
        waitForHabboHub() {
            // Verifica se o Habbo Hub já está carregado
            if (this.isHabboHubLoaded()) {
                this.integrate();
            } else {
                // Aguarda o carregamento
                this.observeHabboHubLoading();
            }
        }
        
        isHabboHubLoaded() {
            // Verifica se os elementos do Habbo Hub estão presentes
            return document.querySelector('.bg-gray-900') !== null || 
                   document.querySelector('[data-component-name="div"]') !== null ||
                   window.location.href.includes('/console');
        }
        
        observeHabboHubLoading() {
            // Observa mudanças no DOM para detectar quando o Habbo Hub carrega
            const observer = new MutationObserver((mutations) => {
                if (this.isHabboHubLoaded() && !this.isIntegrated) {
                    this.integrate();
                    observer.disconnect();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout de segurança
            setTimeout(() => {
                if (!this.isIntegrated) {
                    console.log('⏰ Timeout - Tentando integrar mesmo assim...');
                    this.integrate();
                }
            }, 5000);
        }
        
        integrate() {
            if (this.isIntegrated) return;
            
            console.log('🔗 Integrando ao Habbo Hub...');
            
            // Cria e inicializa o sistema de fotos dos quartos
            this.roomPhotoSystem = new RoomPhotoSystem();
            
            // Marca como integrado
            this.isIntegrated = true;
            
            // Adiciona ao objeto global do Habbo Hub
            this.addToHabboHub();
            
            console.log('✅ Integração automática concluída!');
        }
        
        addToHabboHub() {
            // Adiciona o sistema ao objeto global do Habbo Hub
            if (window.HabboHub) {
                window.HabboHub.roomPhotos = this.roomPhotoSystem;
                console.log('🎯 Sistema adicionado ao window.HabboHub.roomPhotos');
            } else {
                // Cria o objeto se não existir
                window.HabboHub = {
                    roomPhotos: this.roomPhotoSystem
                };
                console.log('🎯 Objeto HabboHub criado com sistema de fotos');
            }
            
            // Adiciona também ao objeto global
            window.roomPhotos = this.roomPhotoSystem;
        }
    }
    
    // Sistema de fotos dos quartos
    class RoomPhotoSystem {
        constructor() {
            this.isActive = false;
            this.photoContainers = new Map();
            this.init();
        }
        
        init() {
            console.log('🏠 Sistema de fotos dos quartos - Inicializando...');
            
            // Aguarda um pouco para garantir que os componentes React carregaram
            setTimeout(() => {
                this.start();
            }, 1000);
        }
        
        start() {
            this.isActive = true;
            this.addPhotosToExistingRooms();
            this.observeDOMChanges();
            this.monitorURLChanges();
            
            console.log('✅ Sistema de fotos dos quartos ativado!');
        }
        
        addPhotosToExistingRooms() {
            // Procura por todos os banners de quartos
            const roomBanners = this.findRoomBanners();
            
            console.log(` Encontrados ${roomBanners.length} banners de quartos`);
            
            roomBanners.forEach((banner, index) => {
                if (!banner.dataset.photosAdded) {
                    this.addPhotoToBanner(banner, index);
                }
            });
        }
        
        findRoomBanners() {
            // Estratégias mais específicas para encontrar banners de quartos reais
            const selectors = [
                // Procura por elementos que contenham informações de quartos
                '[data-component-name="div"]:has(.font-medium, .text-lg, h3, h4, h5, h6)',
                '.bg-white\\/10.rounded.border.border-black:has(.font-medium, .text-lg)',
                '.modal-content [data-component-name="div"]:has(.font-medium)',
                // Procura por elementos com texto que pareça nome de quarto
                '[data-component-name="div"]:has([class*="font-medium"]:not(:empty))',
                // Procura por elementos que contenham links para quartos
                '[data-component-name="div"]:has(a[href*="room"])',
                // Procura por elementos com estrutura de quarto
                '.bg-gray-900 [data-component-name="div"]:has([class*="text-"])'
            ];
            
            let banners = [];
            let processedElements = new Set();
            
            selectors.forEach(selector => {
                try {
                    const found = document.querySelectorAll(selector);
                    found.forEach(element => {
                        // Verifica se o elemento parece realmente ser um banner de quarto
                        if (this.isValidRoomBanner(element) && !processedElements.has(element)) {
                            banners.push(element);
                            processedElements.add(element);
                        }
                    });
                } catch (e) {
                    // Ignora erros de selector
                }
            });
            
            // Filtra apenas elementos que realmente parecem ser quartos
            banners = banners.filter(banner => this.isValidRoomBanner(banner));
            
            console.log(`🔍 Encontrados ${banners.length} banners válidos de quartos`);
            return banners;
        }
        
        isValidRoomBanner(element) {
            // Verifica se o elemento realmente parece ser um banner de quarto
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
        
        addPhotoToBanner(banner, index) {
            // Marca como processado
            banner.dataset.photosAdded = 'true';
            
            // Extrai informações do quarto
            const roomName = this.extractRoomName(banner);
            
            // Só adiciona foto se conseguiu extrair um nome válido
            if (roomName && roomName.length > 2) {
                const roomId = this.generateRoomId(roomName, index);
                
                // Cria o container da foto
                const photoContainer = this.createPhotoContainer(roomId, roomName);
                
                // Adiciona a foto ao canto superior direito do banner
                banner.style.position = 'relative';
                banner.appendChild(photoContainer);
                
                // Armazena referência
                this.photoContainers.set(banner, photoContainer);
                
                console.log(`✅ Foto adicionada ao quarto: "${roomName}"`);
            } else {
                console.log(`⚠️ Banner ignorado - nome inválido: "${roomName || 'null'}"`);
                // Remove a marcação para permitir reprocessamento
                delete banner.dataset.photosAdded;
            }
        }
        
        createPhotoContainer(roomId, roomName) {
            const container = document.createElement('div');
            container.className = 'habbo-hub-room-photo';
            container.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                width: 60px;
                height: 60px;
                border-radius: 8px;
                overflow: hidden;
                border: 2px solid #007acc;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                background: linear-gradient(135deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                transition: all 0.3s ease;
                cursor: pointer;
            `;
            
            // Cria a imagem da foto do quarto
            const photo = document.createElement('img');
            photo.className = 'room-photo';
            photo.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            `;
            
            // Tenta carregar a foto do quarto
            photo.src = `/habbo-imaging/room/${roomId}`;
            
            // Fallback se a foto não carregar
            photo.onerror = () => {
                this.createFallbackPhoto(container, roomName);
            };
            
            // Hover effect
            container.addEventListener('mouseenter', () => {
                photo.style.transform = 'scale(1.1)';
                container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                container.style.transform = 'scale(1.05)';
            });
            
            container.addEventListener('mouseleave', () => {
                photo.style.transform = 'scale(1)';
                container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                container.style.transform = 'scale(1)';
            });
            
            // Click para abrir o quarto (se possível)
            container.addEventListener('click', () => {
                this.handleRoomPhotoClick(roomName, roomId);
            });
            
            // Adiciona tooltip
            container.title = `Foto do quarto: ${roomName}`;
            
            container.appendChild(photo);
            return container;
        }
        
        createFallbackPhoto(container, roomName) {
            // Remove a imagem quebrada
            const brokenImg = container.querySelector('img');
            if (brokenImg) brokenImg.remove();
            
            // Cria um fallback com ícone e nome
            container.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: white;
                    font-family: Arial, sans-serif;
                    font-size: 10px;
                    line-height: 1.2;
                    padding: 4px;
                ">
                    <div style="font-size: 20px; margin-bottom: 2px;">🏠</div>
                    <div style="font-weight: bold;">${roomName.substring(0, 8)}</div>
                </div>
            `;
            
            // Adiciona estilo de fallback
            container.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
            container.style.borderColor = '#dee2e6';
        }
        
        extractRoomName(banner) {
            // Estratégias mais inteligentes para extrair o nome do quarto
            const selectors = [
                // Selectors específicos para nomes de quartos
                '.font-medium.text-white',
                '.text-lg.font-bold',
                '.font-semibold',
                '.font-bold',
                '[class*="font-medium"]',
                '[class*="font-bold"]',
                'h3, h4, h5, h6',
                // Procura por elementos com texto que pareça nome
                '[class*="text-"]:not([class*="text-gray"]):not([class*="text-sm"]):not([class*="text-xs"])',
                // Procura por spans ou divs com texto
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
                            const score = this.calculateNameScore(text);
                            
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
            
            // Se não encontrou nada bom, tenta extrair do texto geral do banner
            if (!bestMatch || bestScore < 0.5) {
                const allText = banner.textContent.trim();
                const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                
                for (const line of lines) {
                    const score = this.calculateNameScore(line);
                    if (score > bestScore && score > 0.3) {
                        bestScore = score;
                        bestMatch = line;
                    }
                }
            }
            
            // Retorna o melhor match encontrado ou null se não for válido
            if (bestMatch && bestScore > 0.3) {
                return bestMatch;
            }
            
            return null;
        }
        
        calculateNameScore(text) {
            if (!text || text.length < 3) return 0;
            
            let score = 0;
            
            // Pontua por comprimento adequado (3-50 caracteres)
            if (text.length >= 3 && text.length <= 50) score += 0.3;
            
            // Pontua por conter apenas caracteres válidos
            if (/^[A-Za-zÀ-ÿ0-9\s\-_\.]+$/.test(text)) score += 0.2;
            
            // Pontua por não conter texto genérico
            const genericTexts = ['quarto', 'room', 'loading', 'carregando', 'error', 'erro', 'undefined', 'null', 'click', 'clique'];
            if (!genericTexts.some(generic => text.toLowerCase().includes(generic))) score += 0.3;
            
            // Pontua por conter palavras que parecem nomes de quartos
            const roomWords = ['casa', 'house', 'hotel', 'palace', 'castle', 'villa', 'mansion', 'apartment', 'flat'];
            if (roomWords.some(word => text.toLowerCase().includes(word))) score += 0.2;
            
            // Pontua por ter capitalização adequada
            if (/^[A-Z]/.test(text)) score += 0.1;
            
            // Pontua por não ter muitas palavras (nomes de quartos geralmente são curtos)
            const wordCount = text.split(/\s+/).length;
            if (wordCount <= 5) score += 0.1;
            
            return Math.min(score, 1.0);
        }
        
        generateRoomId(roomName, index) {
            // Gera um ID único baseado no nome e índice
            const sanitizedName = roomName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return `${sanitizedName}-${index + 1}`;
        }
        
        handleRoomPhotoClick(roomName, roomId) {
            console.log(`🖱️ Foto clicada: ${roomName} (${roomId})`);
            
            // Aqui você pode adicionar lógica para abrir o quarto
            // Por exemplo, navegar para a página do quarto ou abrir um modal
            
            // Por enquanto, apenas mostra uma mensagem
            this.showNotification(`Quarto: ${roomName}`, 'Clique na foto para ver detalhes do quarto');
        }
        
        showNotification(title, message) {
            // Cria uma notificação temporária
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007acc;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: Arial, sans-serif;
                max-width: 300px;
            `;
            
            notification.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
                <div style="font-size: 14px;">${message}</div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove após 3 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
        }
        
        observeDOMChanges() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.querySelector) {
                            // Verifica por novos banners de quartos
                            const newBanners = this.findRoomBanners();
                            newBanners.forEach((banner, index) => {
                                if (!banner.dataset.photosAdded) {
                                    this.addPhotoToBanner(banner, index);
                                }
                            });
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        monitorURLChanges() {
            let currentUrl = window.location.href;
            setInterval(() => {
                if (window.location.href !== currentUrl) {
                    currentUrl = window.location.href;
                    if (currentUrl.includes('/console')) {
                        console.log('🔄 Nova página detectada, aplicando sistema de fotos...');
                        setTimeout(() => this.reloadAllPhotos(), 1000);
                    }
                }
            }, 1000);
        }
        
        // Função para recarregar todas as fotos
        reloadAllPhotos() {
            console.log('🔄 Recarregando todas as fotos dos quartos...');
            
            // Remove todas as fotos existentes
            this.photoContainers.forEach((container) => {
                if (container.parentNode) {
                    container.remove();
                }
            });
            
            this.photoContainers.clear();
            
            // Remove marcações
            document.querySelectorAll('[data-photos-added]').forEach(banner => {
                delete banner.dataset.photosAdded;
            });
            
            // Adiciona novamente
            this.addPhotosToExistingRooms();
        }
        
        // Função para mostrar estatísticas
        getStats() {
            const totalBanners = this.findRoomBanners().length;
            const totalPhotos = this.photoContainers.size;
            
            return {
                totalBanners,
                totalPhotos,
                coverage: totalBanners > 0 ? Math.round(totalPhotos/totalBanners*100) : 0
            };
        }
        
        // Função para ativar/desativar
        toggle() {
            if (this.isActive) {
                this.deactivate();
            } else {
                this.activate();
            }
        }
        
        activate() {
            if (this.isActive) return;
            
            this.isActive = true;
            this.start();
            console.log('✅ Sistema de fotos ativado');
        }
        
        deactivate() {
            if (!this.isActive) return;
            
            this.isActive = false;
            
            // Remove todas as fotos
            this.photoContainers.forEach((container) => {
                if (container.parentNode) {
                    container.remove();
                }
            });
            
            this.photoContainers.clear();
            
            // Remove marcações
            document.querySelectorAll('[data-photos-added]').forEach(banner => {
                delete banner.dataset.photosAdded;
            });
            
            console.log('⏸️ Sistema de fotos desativado');
        }
    }
    
    // Inicializa a integração automática
    const habboHubIntegration = new HabboHubAutoIntegration();
    
    // Adiciona comandos úteis ao console
    window.habboHubPhotos = {
        integration: habboHubIntegration,
        system: habboHubIntegration.roomPhotoSystem,
        
        // Recarrega todas as fotos
        reload: () => habboHubIntegration.roomPhotoSystem?.reloadAllPhotos(),
        
        // Mostra estatísticas
        stats: () => {
            const stats = habboHubIntegration.roomPhotoSystem?.getStats();
            if (stats) {
                console.log(`📊 Estatísticas do Habbo Hub:`);
                console.log(`  - Total de banners: ${stats.totalBanners}`);
                console.log(`  - Total de fotos: ${stats.totalPhotos}`);
                console.log(`  - Cobertura: ${stats.coverage}%`);
            } else {
                console.log('❌ Sistema não está integrado ainda');
            }
        },
        
        // Ativa/desativa o sistema
        toggle: () => habboHubIntegration.roomPhotoSystem?.toggle(),
        
        // Status do sistema
        status: () => {
            const isActive = habboHubIntegration.roomPhotoSystem?.isActive;
            console.log(`📊 Status do sistema: ${isActive ? '✅ Ativo' : '⏸️ Inativo'}`);
            return isActive;
        }
    };
    
    console.log('🎉 Sistema de integração automática inicializado!');
    console.log('🔗 Aguardando o Habbo Hub carregar para integração automática...');
    console.log('💡 Comandos disponíveis: window.habboHubPhotos.stats(), .reload(), .toggle(), .status()');
    
})();
