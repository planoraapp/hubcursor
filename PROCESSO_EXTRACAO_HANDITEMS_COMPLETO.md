# Processo Completo de Extração de Handitems

## 📋 **Visão Geral**
Este documento descreve o processo completo para extrair, processar e implementar imagens reais de handitems do Habbo, substituindo os placeholders atuais.

## 🎯 **Objetivo**
- Extrair imagens reais de handitems dos assets oficiais do Habbo
- Substituir placeholders por imagens funcionais
- Criar sistema automático de descoberta e exibição

## 🛠️ **Ferramentas Utilizadas**

### 1. **habbo-downloader (Higoka)**
- **GitHub:** https://github.com/higoka/habbo-downloader
- **Função:** Baixar assets oficiais do Habbo
- **Comandos principais:**
  - `hdl -c gordon -d com.br` - Baixa arquivos Gordon (SWF)
  - `hdl -c gamedata -d com.br` - Baixa dados do jogo
  - `hdl -c furnitures -d com.br` - Baixa mobílias

### 2. **JPEXS Free Flash Decompiler**
- **Site:** https://www.free-decompiler.com/flash/
- **Função:** Extrair imagens dos arquivos SWF
- **Versão:** v21.1.0 (recomendada)

## 📁 **Estrutura de Arquivos**

```
public/
├── handitems/                    # Diretório principal dos handitems
│   ├── gordon/                   # Assets baixados via habbo-downloader
│   │   └── hh_human_item.swf     # Arquivo principal dos handitems
│   ├── gamedata/                 # Dados do jogo
│   │   └── external_flash_texts.txt
│   ├── furnitures/               # Mobílias
│   ├── images/                   # Imagens extraídas
│   │   ├── drk/                  # UseItems (para beber)
│   │   ├── crr/                  # CarryItems (para carregar)
│   │   └── preview/              # Previews
│   └── handitems.json            # Lista de handitems extraída
```

## 🔄 **Processo de Extração**

### **Fase 1: Preparação**
1. **Instalar habbo-downloader**
   ```bash
   npm install -g habbo-downloader
   ```

2. **Verificar instalação**
   ```bash
   habbo-downloader --version
   ```

### **Fase 2: Download dos Assets**
1. **Executar script de extração**
   ```bash
   node scripts/auto-extract-handitems.cjs
   ```

2. **Verificar arquivos baixados**
   - `hh_human_item.swf` em `public/handitems/gordon/`
   - `external_flash_texts.txt` em `public/handitems/gamedata/`

### **Fase 3: Extração de Imagens**
1. **Abrir JPEXS Free Flash Decompiler**
2. **Carregar arquivo:** `public/handitems/gordon/hh_human_item.swf`
3. **Exportar imagens:**
   - Selecionar "Exportar todas as partes"
   - Marcar apenas "imagens" formato "PNG/GIF/JPEG"
   - Salvar em `public/handitems/images/`

### **Fase 4: Organização das Imagens**
1. **Separar por tipo:**
   - `drk` - UseItems (para beber)
   - `crr` - CarryItems (para carregar)
2. **Renomear arquivos:**
   - `drk0.png`, `drk1.png`, etc.
   - `crr0.png`, `crr1.png`, etc.

### **Fase 5: Implementação no Sistema**
1. **Atualizar HanditemImageService**
2. **Modificar URLs para usar imagens locais**
3. **Implementar fallback para imagens não encontradas**

## 📊 **Mapeamento de Handitems**

### **Formato do external_flash_texts:**
```
handitem0=Nenhum
handitem1=Chá Refrescante
handitem2=Suco
handitem3=Cenoura
handitem4=Sorvete de Baunilha
...
handitem266=Último Item
```

### **Tipos de Handitems:**
- **UseItem (drk):** Itens para beber (bebidas, sucos, etc.)
- **CarryItem (crr):** Itens para carregar (objetos, ferramentas, etc.)

## 🔧 **Configurações do Sistema**

### **1. HanditemImageService**
```typescript
// Prioridade de fontes:
1. Imagens locais extraídas
2. Imagens conhecidas (Imgur)
3. Placeholder padrão
```

### **2. Estrutura de URLs**
```typescript
// Padrão de URLs:
- UseItem: /assets/handitems/images/drk/{id}.png
- CarryItem: /assets/handitems/images/crr/{id}.png
- Preview: /assets/handitems/images/preview/{id}.png
```

## 📈 **Monitoramento e Manutenção**

### **Verificação de Integridade**
- Script para verificar imagens faltantes
- Relatório de handitems sem imagem
- Atualização automática quando novos handitems são adicionados

### **Atualizações Futuras**
- Re-executar extração quando Habbo atualizar
- Manter sincronização com external_flash_texts
- Backup das imagens extraídas

## 🚨 **Troubleshooting**

### **Problemas Comuns:**
1. **habbo-downloader não encontrado**
   - Solução: `npm install -g habbo-downloader`

2. **Arquivo SWF não encontrado**
   - Verificar se build está correta
   - Tentar hotel diferente (com.br, com, etc.)

3. **Imagens não extraídas**
   - Verificar se JPEXS está na versão correta
   - Tentar exportar apenas imagens PNG

4. **Imagens não exibidas**
   - Verificar caminhos das URLs
   - Verificar permissões de arquivo

## 📝 **Logs e Debugging**

### **Arquivos de Log:**
- `handitems-extraction.log` - Log da extração
- `handitems-mapping.json` - Mapeamento ID -> Imagem
- `handitems-errors.json` - Handitems sem imagem

### **Comandos de Debug:**
```bash
# Verificar handitems extraídos
node scripts/check-handitems.cjs

# Verificar imagens faltantes
node scripts/check-missing-images.cjs

# Regenerar mapeamento
node scripts/regenerate-mapping.cjs
```

## ✅ **Checklist de Implementação**

- [ ] Instalar habbo-downloader
- [ ] Executar script de extração
- [ ] Baixar arquivo hh_human_item.swf
- [ ] Extrair imagens com JPEXS
- [ ] Organizar imagens por tipo (drk/crr)
- [ ] Atualizar HanditemImageService
- [ ] Testar exibição na interface
- [ ] Implementar fallbacks
- [ ] Documentar mapeamentos
- [ ] Criar scripts de manutenção

## 🎉 **Resultado Esperado**

Após a implementação completa:
- ✅ 267 handitems com imagens reais
- ✅ Sistema automático de descoberta
- ✅ Fallbacks para imagens faltantes
- ✅ Interface funcional na aba "Catálogo Unificado"
- ✅ Sistema de manutenção automatizado

---

**Última atualização:** $(date)
**Versão:** 1.0
**Status:** Em implementação
