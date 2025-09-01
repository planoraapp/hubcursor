# 🎭 Suporte a Gêneros - Editor Habbo

## 📋 Visão Geral

Este sistema implementa suporte completo para gêneros masculino (M) e feminino (F) no editor de visuais do Habbo, incluindo integração com a API do habbowidgets.com para carregamento automático de roupas.

## ✨ Funcionalidades Principais

### 1. 🔄 Sistema de Gêneros
- **Seleção de Gênero**: Botões para alternar entre masculino e feminino
- **Dados Específicos**: Configurações específicas para cada gênero
- **Interface Adaptativa**: UI que se adapta ao gênero selecionado

### 2. 🔌 Integração com Habbo Widgets API
- **API Automática**: Carregamento de roupas da API `https://api.habboemotion.com/public/clothings/new`
- **Cache Inteligente**: Sistema de cache para melhor performance
- **Limite Configurável**: Suporte até 200 itens (máximo da API)

### 3. 📊 Categorização Automática
- **Por Tipo**: Cabelos, rostos, camisas, calças, etc.
- **Por Raridade**: Club, sellable, LTD, raro, NFT, nonHC
- **Por Gênero**: Separação automática entre M/F

## 🗂️ Arquivos do Sistema

### Core
- `habbo-widgets-integration.js` - Sistema principal de integração
- `gender-specific-config.js` - Configurações específicas por gênero
- `hubeditor.html` - Editor principal atualizado

### Demonstração
- `demo-gender-support.html` - Arquivo de demonstração das funcionalidades

## 🚀 Como Usar

### 1. Seleção de Gênero
```javascript
// Mudar para feminino
window.genderSupport.changeGender('F');

// Mudar para masculino
window.genderSupport.changeGender('M');
```

### 2. Carregar da API
```javascript
// Carregar 50 roupas da API
const clothings = await window.habboWidgets.loadClothingsFromAPI(50);

// Carregar roupas específicas por gênero
const femaleClothings = await window.habboWidgets.loadClothingsByGender('F');
```

### 3. Acessar Dados Específicos
```javascript
// Obter cabelos femininos club
const clubHair = getGenderSpecificClothing('F', 'hair', 'club');

// Verificar se item é específico do gênero
const isFemale = isGenderSpecificItem('677', 'hair', 'F');
```

## 📊 Dados Específicos Femininos

### Cabelos (hr)
- **Club/HC**: 677, 678, 832, 833, 834, 835, 836, 838, 839, 840...
- **Sellable**: 3322, 3325, 3339, 3369, 3370, 3377, 3386...
- **LTD**: 5445
- **Raro**: 3602, 3625, 3706, 3707, 3731, 3733...
- **NFT**: 4269, 4270, 5039, 5040, 5124, 5125...
- **NonHC**: 155, 500, 505, 510, 515, 520, 530...

### Rostos (hd)
- **Club/HC**: 3096, 3097, 3098, 3099, 3100, 3104, 3105, 3106
- **Sellable**: 3600, 3603, 3604, 3631, 3704, 3813, 3814...
- **Raro**: 3536, 3537, 3721, 4015
- **NFT**: 4202, 4203, 4204, 4205, 4206, 4266, 4267...
- **NonHC**: 600, 605, 610, 615, 620, 625, 626, 627, 628, 629

## 🔧 Configuração

### 1. Incluir Scripts
```html
<script src="gender-specific-config.js"></script>
<script src="habbo-widgets-integration.js"></script>
```

### 2. Inicialização Automática
```javascript
// O sistema se inicializa automaticamente
document.addEventListener('DOMContentLoaded', function() {
    // Sistemas já estão disponíveis globalmente
    console.log(window.habboWidgets); // API integration
    console.log(window.genderSupport); // Gender support
});
```

## 📈 Estatísticas e Monitoramento

### Obter Estatísticas
```javascript
const stats = window.habboWidgets.getClothingStats();
console.log(`Total masculino: ${stats.M.total}`);
console.log(`Total feminino: ${stats.F.total}`);
```

### Log de Atividades
```javascript
// O sistema registra automaticamente todas as operações
// Verificar console do navegador para logs detalhados
```

## 🎯 Casos de Uso

### 1. Editor de Visuais
- Carregar roupas específicas por gênero
- Alternar entre masculino/feminino
- Aplicar configurações padrão por gênero

### 2. Sistema de Descoberta
- Descobrir novas roupas da API
- Categorizar automaticamente por gênero
- Exportar dados para uso externo

### 3. Cache e Performance
- Cache inteligente por gênero
- Carregamento sob demanda
- Limpeza automática de cache

## 🔍 Debug e Troubleshooting

### Verificar Status da API
```javascript
// Testar conexão com a API
const testResult = await window.habboWidgets.loadClothingsFromAPI(5);
console.log('API Status:', testResult ? '✅ Funcionando' : '❌ Falha');
```

### Limpar Cache
```javascript
// Limpar cache em caso de problemas
window.habboWidgets.clearCache();
```

### Verificar Configurações
```javascript
// Verificar configurações de gênero
console.log('Config feminina:', GENDER_SPECIFIC_CONFIG.hair.F);
```

## 🚧 Limitações Conhecidas

1. **API Rate Limit**: Máximo de 200 itens por requisição
2. **Detecção de Gênero**: Baseada em padrões conhecidos (pode não ser 100% precisa)
3. **Cache Local**: Dados são armazenados apenas no navegador

## 🔮 Próximas Melhorias

- [ ] Suporte a mais categorias de roupas
- [ ] Sistema de sincronização com servidor
- [ ] Interface de administração para configurações
- [ ] Suporte a múltiplos idiomas
- [ ] Sistema de backup automático

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar console do navegador para erros
2. Testar com arquivo de demonstração
3. Verificar conectividade com a API
4. Limpar cache e tentar novamente

---

**Desenvolvido para Editor Habbo Hub** 🎮
**Versão**: 1.0.0
**Última Atualização**: Agosto 2025
