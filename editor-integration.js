// Integração do Editor HabboTemplarios com o HTML
import React from 'react';
import { createRoot } from 'react-dom/client';
import HabboTemplariosStyleEditor from './src/components/HabboTemplariosStyleEditor.tsx';

// Função para inicializar o editor
function initializeHabboTemplariosEditor() {
    const editorRoot = document.getElementById('habbo-templarios-editor-root');
    
    if (editorRoot) {
        const root = createRoot(editorRoot);
        root.render(React.createElement(HabboTemplariosStyleEditor));
    }
}

// Inicializar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHabboTemplariosEditor);
} else {
    initializeHabboTemplariosEditor();
}

// Exportar para uso global se necessário
window.initializeHabboTemplariosEditor = initializeHabboTemplariosEditor;
