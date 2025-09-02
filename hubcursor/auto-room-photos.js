// 🎯 QUARTOS COM FOTOS - HABBO HUB
// Sistema automático para adicionar fotos dos quartos diretamente nos banners
// Executa automaticamente na página /console

(function() {
    'use strict';
    
    console.log('🚀 Sistema de fotos nos banners dos quartos - Inicializando automaticamente...');
    
    // Sistema para adicionar fotos aos banners dos quartos
    class RoomPhotoBanner {
        constructor() {
            this.init();
        }
        
        init() {
            // Aguarda o DOM estar completamente carregado
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        }
        
        start() {
            console.log('🎯 Procurando por banners de quartos...');
            
            // Aguarda um pouco para garantir que os componentes React carregaram
            setTimeout(() => {
                this.addPhotosToExistingRooms();
                this.observeDOMChanges();
                console.log('✅ Sistema de fotos nos banners inicializado automaticamente!');
            }, 1000);
        }
        
        addPhotosToExistingRooms() {
            // Procura por todos os banners de quartos
            const roomBanners = document.querySelectorAll('.bg-white\\/10.rounded.border.border-black');
            
            console.log(` Encontrados ${roomBanners.length} banners de quartos`);
            
            roomBanners.forEach((banner, index) => {
                if (!banner.dataset.photosAdded) {
                    this.addPhotoToBanner(banner, index);
                }
            });
        }
        
        addPhotoToBanner(banner, index) {
            // Marca como processado
            banner.dataset.photosAdded = 'true';
            
            // Extrai informações do quarto
            const roomName = this.extractRoomName(banner);
            const roomId = this.generateRoomId(roomName, index);
            
            // Cria o container da foto
            const photoContainer = this.createPhotoContainer(roomId, roomName);
            
            // Adiciona a foto ao canto superior direito do banner
            banner.style.position = 'relative';
            banner.appendChild(photoContainer);
            
            console.log(` Foto adicionada ao quarto: ${roomName}`);
        }
        
        createPhotoContainer(roomId, roomName) {
            const container = document.createElement('div');
            container.className = 'room-photo-container';
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
            return banner.querySelector('.font-medium.text-white')?.textContent?.trim() || 
                   banner.querySelector('[class*="font-medium"]')?.textContent?.trim() ||
                   'Quarto';
        }
        
        generateRoomId(roomName, index) {
            // Gera um ID único baseado no nome e índice
            const sanitizedName = roomName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return `${sanitizedName}-${index + 1}`;
        }
        
        observeDOMChanges() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.querySelector) {
                            // Verifica por novos banners de quartos
                            if (node.querySelector('.bg-white\\/10.rounded.border.border-black')) {
                                node.querySelectorAll('.bg-white\\/10.rounded.border.border-black').forEach((banner, index) => {
                                    if (!banner.dataset.photosAdded) {
                                        this.addPhotoToBanner(banner, index);
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
        }
        
        // Função para recarregar todas as fotos
        reloadAllPhotos() {
            console.log('🔄 Recarregando todas as fotos dos quartos...');
            
            // Remove todas as fotos existentes
            document.querySelectorAll('.room-photo-container').forEach(container => {
                container.remove();
            });
            
            // Remove marcações
            document.querySelectorAll('[data-photos-added]').forEach(banner => {
                delete banner.dataset.photosAdded;
            });
            
            // Adiciona novamente
            this.addPhotosToExistingRooms();
        }
    }
    
    // Inicializa o sistema automaticamente
    const roomPhotoBanner = new RoomPhotoBanner();
    
    // Adiciona comandos úteis ao console (opcional)
    window.roomPhotos = {
        system: roomPhotoBanner,
        
        // Recarrega todas as fotos
        reload: () => roomPhotoBanner.reloadAllPhotos(),
        
        // Mostra estatísticas
        stats: () => {
            const totalBanners = document.querySelectorAll('.bg-white\\/10.rounded.border.border-black').length;
            const totalPhotos = document.querySelectorAll('.room-photo-container').length;
            console.log(`📊 Estatísticas:`);
            console.log(`  - Total de banners: ${totalBanners}`);
            console.log(`  - Total de fotos: ${totalPhotos}`);
            console.log(`  - Cobertura: ${totalPhotos}/${totalBanners} (${Math.round(totalPhotos/totalBanners*100)}%)`);
        }
    };
    
    // Monitora mudanças na URL para aplicar em diferentes páginas
    let currentUrl = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            if (currentUrl.includes('/console')) {
                console.log('🔄 Nova página detectada, aplicando sistema de fotos...');
                setTimeout(() => roomPhotoBanner.reloadAllPhotos(), 1000);
            }
        }
    }, 1000);
    
    console.log('🎉 Sistema de fotos nos banners ativado automaticamente!');
    console.log(' As fotos dos quartos agora aparecem nos cantos dos banners!');
    console.log('💡 Comandos disponíveis: window.roomPhotos.reload() e window.roomPhotos.stats()');
    
})();
