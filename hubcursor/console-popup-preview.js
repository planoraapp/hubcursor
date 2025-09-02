// 🎯 CONSOLE POPUP PREVIEW - HABBO HUB
// Sistema de popup dentro do console para exibir miniaturas
// Copie e cole este código no console do navegador (F12)

console.log('🚀 Inicializando sistema de popup preview no console...');

// Sistema de popup do console
class ConsolePopup {
    constructor() {
        this.isOpen = false;
        this.currentPopup = null;
        this.init();
    }
    
    init() {
        // Cria o container do popup
        this.createPopupContainer();
        
        // Adiciona estilos CSS
        this.addStyles();
        
        // Adiciona listeners para fechar ao clicar fora
        this.addEventListeners();
        
        console.log('✅ Sistema de popup inicializado!');
    }
    
    createPopupContainer() {
        // Container principal do popup
        this.container = document.createElement('div');
        this.container.id = 'console-popup-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 999999;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        `;
        
        // Popup interno
        this.popup = document.createElement('div');
        this.popup.id = 'console-popup';
        this.popup.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1e1e1e;
            border: 2px solid #007acc;
            border-radius: 8px;
            padding: 20px;
            min-width: 300px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
            color: #ffffff;
        `;
        
        // Header do popup
        this.header = document.createElement('div');
        this.header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
        `;
        
        // Título
        this.title = document.createElement('h3');
        this.title.style.cssText = `
            margin: 0;
            color: #007acc;
            font-size: 16px;
            font-weight: bold;
        `;
        
        // Botão fechar
        this.closeBtn = document.createElement('button');
        this.closeBtn.innerHTML = '✕';
        this.closeBtn.style.cssText = `
            background: #333;
            border: 1px solid #555;
            color: #fff;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
        `;
        this.closeBtn.onclick = () => this.close();
        
        // Conteúdo
        this.content = document.createElement('div');
        this.content.id = 'console-popup-content';
        
        // Monta o popup
        this.header.appendChild(this.title);
        this.header.appendChild(this.closeBtn);
        this.popup.appendChild(this.header);
        this.popup.appendChild(this.content);
        this.container.appendChild(this.popup);
        
        document.body.appendChild(this.container);
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #console-popup-container {
                backdrop-filter: blur(4px);
            }
            
            #console-popup::-webkit-scrollbar {
                width: 8px;
            }
            
            #console-popup::-webkit-scrollbar-track {
                background: #2d2d2d;
                border-radius: 4px;
            }
            
            #console-popup::-webkit-scrollbar-thumb {
                background: #007acc;
                border-radius: 4px;
            }
            
            #console-popup::-webkit-scrollbar-thumb:hover {
                background: #005a9e;
            }
            
            .console-popup-item {
                display: flex;
                align-items: center;
                padding: 10px;
                margin: 5px 0;
                background: #2d2d2d;
                border-radius: 6px;
                border-left: 3px solid #007acc;
                transition: all 0.2s ease;
            }
            
            .console-popup-item:hover {
                background: #3d3d3d;
                transform: translateX(5px);
            }
            
            .console-popup-thumbnail {
                width: 50px;
                height: 50px;
                border-radius: 6px;
                margin-right: 15px;
                object-fit: cover;
                border: 2px solid #007acc;
            }
            
            .console-popup-info h4 {
                margin: 0 0 5px 0;
                color: #007acc;
                font-size: 14px;
            }
            
            .console-popup-info p {
                margin: 0;
                color: #ccc;
                font-size: 12px;
                line-height: 1.4;
            }
            
            .console-popup-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px;
                color: #007acc;
            }
            
            .console-popup-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #333;
                border-top: 2px solid #007acc;
                border-radius: 50%;
                animation: consoleSpin 1s linear infinite;
                margin-right: 10px;
            }
            
            @keyframes consoleSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    addEventListeners() {
        // Fecha ao clicar fora
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });
        
        // Fecha com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    show(title, content) {
        this.title.textContent = title;
        this.content.innerHTML = content;
        this.container.style.display = 'block';
        this.isOpen = true;
        
        // Foca no popup
        setTimeout(() => {
            this.popup.focus();
        }, 100);
    }
    
    close() {
        this.container.style.display = 'none';
        this.isOpen = false;
        this.currentPopup = null;
    }
    
    showLoading(message = 'Carregando...') {
        const loadingContent = `
            <div class="console-popup-loading">
                <div class="console-popup-spinner"></div>
                <span>${message}</span>
            </div>
        `;
        this.show('Carregando...', loadingContent);
    }
}

// Sistema de preview para diferentes tipos de conteúdo
class ContentPreview {
    constructor(popup) {
        this.popup = popup;
        this.cache = new Map();
    }
    
    // Preview de grupos
    async showGroupPreview(groupElement) {
        try {
            const groupName = this.extractGroupName(groupElement);
            const groupCode = this.extractGroupCode(groupElement);
            
            if (!groupCode) {
                this.popup.show('Erro', 'Não foi possível identificar o código do grupo.');
                return;
            }
            
            this.popup.showLoading('Carregando informações do grupo...');
            
            // Busca informações do grupo
            const groupInfo = await this.fetchGroupInfo(groupCode);
            
            const content = `
                <div class="console-popup-item">
                    <img src="/habbo-imaging/badge/${groupCode}.gif" 
                         alt="${groupName}" 
                         class="console-popup-thumbnail"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMkQyRDJEIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4wNTEgMjUgMzggMTkuMDUxIDM4IDEyQzM4IDQuOTQ5IDMyLjA1MSAtMSAyNSAtMUMxNy45NDkgLTEgMTIgNC45NDkgMTIgMTJDMTIgMTkuMDUxIDE3Ljk0OSAyNSAyNSAyNVoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+'">
                    <div class="console-popup-info">
                        <h4>${groupName}</h4>
                        <p><strong>Código:</strong> ${groupCode}</p>
                        <p><strong>Tipo:</strong> Grupo</p>
                        ${groupInfo.description ? `<p><strong>Descrição:</strong> ${groupInfo.description}</p>` : ''}
                        ${groupInfo.memberCount ? `<p><strong>Membros:</strong> ${groupInfo.memberCount}</p>` : ''}
                    </div>
                </div>
            `;
            
            this.popup.show(`Preview do Grupo: ${groupName}`, content);
            
        } catch (error) {
            console.error('Erro ao mostrar preview do grupo:', error);
            this.popup.show('Erro', 'Erro ao carregar informações do grupo.');
        }
    }
    
    // Preview de quartos
    async showRoomPreview(roomElement) {
        try {
            const roomName = this.extractRoomName(roomElement);
            const roomId = this.extractRoomId(roomElement);
            
            if (!roomId) {
                this.popup.show('Erro', 'Não foi possível identificar o ID do quarto.');
                return;
            }
            
            this.popup.showLoading('Carregando informações do quarto...');
            
            // Busca informações do quarto
            const roomInfo = await this.fetchRoomInfo(roomId);
            
            const content = `
                <div class="console-popup-item">
                    <img src="/habbo-imaging/room/${roomId}" 
                         alt="${roomName}" 
                         class="console-popup-thumbnail"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMkQyRDJEIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4wNTEgMjUgMzggMTkuMDUxIDM4IDEyQzM4IDQuOTQ5IDMyLjA1MSAtMSAyNSAtMUMxNy45NDkgLTEgMTIgNC45NDkgMTIgMTJDMTIgMTkuMDUxIDE3Ljk0OSAyNSAyNSAyNVoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+'">
                    <div class="console-popup-info">
                        <h4>${roomName}</h4>
                        <p><strong>ID:</strong> ${roomId}</p>
                        <p><strong>Tipo:</strong> Quarto</p>
                        ${roomInfo.description ? `<p><strong>Descrição:</strong> ${roomInfo.description}</p>` : ''}
                        ${roomInfo.owner ? `<p><strong>Dono:</strong> ${roomInfo.owner}</p>` : ''}
                    </div>
                </div>
            `;
            
            this.popup.show(`Preview do Quarto: ${roomName}`, content);
            
        } catch (error) {
            console.error('Erro ao mostrar preview do quarto:', error);
            this.popup.show('Erro', 'Erro ao carregar informações do quarto.');
        }
    }
    
    // Preview de emblemas
    async showBadgePreview(badgeElement) {
        try {
            const badgeName = this.extractBadgeName(badgeElement);
            const badgeCode = this.extractBadgeCode(badgeElement);
            
            if (!badgeCode) {
                this.popup.show('Erro', 'Não foi possível identificar o código do emblema.');
                return;
            }
            
            this.popup.showLoading('Carregando informações do emblema...');
            
            const content = `
                <div class="console-popup-item">
                    <img src="/habbo-imaging/badge/${badgeCode}.gif" 
                         alt="${badgeName}" 
                         class="console-popup-thumbnail"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMkQyRDJEIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4wNTEgMjUgMzggMTkuMDUxIDM4IDEyQzM4IDQuOTQ5IDMyLjA1MSAtMSAyNSAtMUMxNy45NDkgLTEgMTIgNC45NDkgMTIgMTJDMTIgMTkuMDUxIDE3Ljk0OSAyNSAyNSAyNVoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+'">
                    <div class="console-popup-info">
                        <h4>${badgeName}</h4>
                        <p><strong>Código:</strong> ${badgeCode}</p>
                        <p><strong>Tipo:</strong> Emblema</p>
                        <p><strong>URL:</strong> /habbo-imaging/badge/${badgeCode}.gif</p>
                    </div>
                </div>
            `;
            
            this.popup.show(`Preview do Emblema: ${badgeName}`, content);
            
        } catch (error) {
            console.error('Erro ao mostrar preview do emblema:', error);
            this.popup.show('Erro', 'Erro ao carregar informações do emblema.');
        }
    }
    
    // Funções auxiliares para extrair informações
    extractGroupName(element) {
        return element.querySelector('.item__title')?.textContent?.trim() || 
               element.querySelector('[name]')?.getAttribute('name') || 
               'Grupo Desconhecido';
    }
    
    extractGroupCode(element) {
        return element.querySelector('habbo-group-badge')?.getAttribute('code') ||
               element.querySelector('img[src*="badge"]')?.src?.match(/badge\/([^\/]+)\.gif/)?.[1] ||
               null;
    }
    
    extractRoomName(element) {
        return element.querySelector('.item__title')?.textContent?.trim() || 
               element.querySelector('[title]')?.getAttribute('title') || 
               'Quarto Desconhecido';
    }
    
    extractRoomId(element) {
        return element.querySelector('a[href*="room"]')?.href?.match(/room=([^&]+)/)?.[1] ||
               element.querySelector('[data-room-id]')?.getAttribute('data-room-id') ||
               null;
    }
    
    extractBadgeName(element) {
        return element.querySelector('img')?.alt || 
               element.querySelector('[title]')?.getAttribute('title') || 
               'Emblema Desconhecido';
    }
    
    extractBadgeCode(element) {
        return element.querySelector('img[src*="badge"]')?.src?.match(/badge\/([^\/]+)\.gif/)?.[1] ||
               null;
    }
    
    // Funções para buscar informações adicionais (simuladas)
    async fetchGroupInfo(groupCode) {
        // Simula busca de informações do grupo
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    description: 'Descrição do grupo carregada dinamicamente',
                    memberCount: Math.floor(Math.random() * 1000) + 1
                });
            }, 500);
        });
    }
    
    async fetchRoomInfo(roomId) {
        // Simula busca de informações do quarto
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    description: 'Quarto decorado com mobiliário exclusivo',
                    owner: 'Usuário Habbo'
                });
            }, 500);
        });
    }
}

// Sistema principal
class ConsolePreviewSystem {
    constructor() {
        this.popup = new ConsolePopup();
        this.preview = new ContentPreview(this.popup);
        this.init();
    }
    
    init() {
        console.log('🎯 Inicializando sistema de preview no console...');
        
        // Adiciona listeners para botões de ação rápida
        this.addQuickActionListeners();
        
        // Observa mudanças no DOM
        this.observeDOMChanges();
        
        console.log('✅ Sistema de preview inicializado!');
    }
    
    addQuickActionListeners() {
        // Adiciona listeners para elementos existentes
        this.addListenersToExistingElements();
        
        // Adiciona listeners para elementos futuros
        this.observeDOMChanges();
    }
    
    addListenersToExistingElements() {
        // Grupos
        document.querySelectorAll('.item--group, habbo-group-badge').forEach(element => {
            this.addPreviewListener(element, 'group');
        });
        
        // Quartos
        document.querySelectorAll('.item--room, a[href*="room"]').forEach(element => {
            this.addPreviewListener(element, 'room');
        });
        
        // Emblemas
        document.querySelectorAll('img[src*="badge"]').forEach(element => {
            this.addPreviewListener(element, 'badge');
        });
    }
    
    addPreviewListener(element, type) {
        if (element.dataset.previewAdded) return;
        
        element.dataset.previewAdded = 'true';
        element.style.cursor = 'pointer';
        
        element.addEventListener('click', (e) => {
            // Previne navegação se for um link
            if (element.tagName === 'A' || element.closest('a')) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            // Mostra preview baseado no tipo
            switch (type) {
                case 'group':
                    this.preview.showGroupPreview(element);
                    break;
                case 'room':
                    this.preview.showRoomPreview(element);
                    break;
                case 'badge':
                    this.preview.showBadgePreview(element);
                    break;
            }
        });
        
        // Adiciona tooltip
        element.title = `Clique para ver preview (${type})`;
    }
    
    observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.querySelector) {
                        // Verifica por novos elementos
                        if (node.querySelector('.item--group, habbo-group-badge')) {
                            node.querySelectorAll('.item--group, habbo-group-badge').forEach(element => {
                                this.addPreviewListener(element, 'group');
                            });
                        }
                        
                        if (node.querySelector('.item--room, a[href*="room"]')) {
                            node.querySelectorAll('.item--room, a[href*="room"]').forEach(element => {
                                this.addPreviewListener(element, 'room');
                            });
                        }
                        
                        if (node.querySelector('img[src*="badge"]')) {
                            node.querySelectorAll('img[src*="badge"]').forEach(element => {
                                this.addPreviewListener(element, 'badge');
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
}

// Inicializa o sistema
const consolePreviewSystem = new ConsolePreviewSystem();

// Adiciona comandos úteis ao console
window.consolePreview = {
    popup: consolePreviewSystem.popup,
    preview: consolePreviewSystem.preview,
    system: consolePreviewSystem,
    
    // Comandos de teste
    testGroup: () => {
        const testElement = document.querySelector('.item--group');
        if (testElement) {
            consolePreviewSystem.preview.showGroupPreview(testElement);
        } else {
            console.log('❌ Nenhum grupo encontrado para teste');
        }
    },
    
    testRoom: () => {
        const testElement = document.querySelector('a[href*="room"]');
        if (testElement) {
            consolePreviewSystem.preview.showRoomPreview(testElement);
        } else {
            console.log('❌ Nenhum quarto encontrado para teste');
        }
    },
    
    testBadge: () => {
        const testElement = document.querySelector('img[src*="badge"]');
        if (testElement) {
            consolePreviewSystem.preview.showBadgePreview(testElement);
        } else {
            console.log('❌ Nenhum emblema encontrado para teste');
        }
    }
};

console.log('🎉 Sistema de preview no console ativado!');
console.log('📚 Comandos disponíveis:');
console.log('  - window.consolePreview.testGroup() - Testa preview de grupo');
console.log('  - window.consolePreview.testRoom() - Testa preview de quarto');
console.log('  - window.consolePreview.testBadge() - Testa preview de emblema');
console.log('  - window.consolePreview.popup - Acesso direto ao popup');
console.log('');
console.log('🎯 Clique em qualquer grupo, quarto ou emblema para ver o preview!');
console.log('💡 O popup fecha ao clicar fora ou pressionar ESC');
