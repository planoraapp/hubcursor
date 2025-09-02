# Verificar se estamos no diretório correto
pwd

# Executar o script PowerShell
.\extrair-dados-templarios.ps1

# Verificar se o script está rodando
Get-Process | Where-Object {$_.ProcessName -like "*chrome*" -or $_.ProcessName -like "*msedge*"}

## 📋 **PRÓXIMOS PASSOS:**

1. **Aguarde o navegador abrir** (pode demorar alguns segundos)
2. **Quando o site carregar**, pressione **F12** para abrir o console
3. **Cole o script JavaScript** no console

## 📝 **SCRIPT PARA COLAR NO CONSOLE:**

Quando o site carregar, cole este script no console do navegador (F12):

```javascript
// Cole este script no console do navegador
(function() {
  console.log(' Iniciando extração de dados do HabboTemplarios...');
  
  // Procurar por dados no JavaScript
  const scripts = document.querySelectorAll('script');
  let palettesJSON = null;
  let setsJSON = null;
  
  for (let script of scripts) {
    const content = script.textContent || script.innerText;
    
    if (content.includes('palettesJSON') && content.includes('setsJSON')) {
      console.log('✅ Script encontrado, extraindo dados...');
      
      // Extrair palettesJSON
      const paletteMatch = content.match(/palettesJSON\s*=\s*({[\s\S]*?});/);
      if (paletteMatch) {
        try {
          palettesJSON = JSON.parse(paletteMatch[1]);
          console.log('✅ palettesJSON extraído:', Object.keys(palettesJSON).length, 'paletas');
        } catch (e) {
          console.log('❌ Erro ao extrair palettesJSON:', e);
        }
      }
      
      // Extrair setsJSON
      const setsMatch = content.match(/setsJSON\s*=\s*(\[[\s\S]*?\])/);
      if (setsMatch) {
        try {
          setsJSON = JSON.parse(setsMatch[1]);
          console.log('✅ setsJSON extraído:', setsJSON.length, 'categorias');
        } catch (e) {
          console.log('❌ Erro ao extrair setsJSON:', e);
        }
      }
      
      break;
    }
  }
  
  if (palettesJSON && setsJSON) {
    // Contar itens
    let totalItems = 0;
    const categoryStats = {};
    
    setsJSON.forEach(categorySet => {
      const category = categorySet.type;
      const itemCount = Object.keys(categorySet.sets).length;
      categoryStats[category] = itemCount;
      totalItems += itemCount;
    });
    
    console.log('📊 Estatísticas:');
    console.log(`- Total de itens: ${totalItems}`);
    console.log(`- Total de categorias: ${Object.keys(categoryStats).length}`);
    console.table(categoryStats);
    
    // Salvar no localStorage
    const data = { palettesJSON, setsJSON, stats: { totalItems, categories: categoryStats } };
    localStorage.setItem('habboTemplariosData', JSON.stringify(data));
    
    console.log('✅ Dados salvos no localStorage!');
    console.log('💾 Use localStorage.getItem("habboTemplariosData") para acessar');
    
    return data;
  } else {
    console.log('❌ Dados não encontrados');
    return null;
  }
})();
```

**Me diga se o navegador abriu e se conseguiu executar o script no console!**

## 📋 **PRÓXIMOS PASSOS:**

1. **Aguarde o navegador abrir** (pode demorar alguns segundos)
2. **Quando o site carregar**, pressione **F12** para abrir o console
3. **Cole o script JavaScript** no console

## 📝 **SCRIPT PARA COLAR NO CONSOLE:**

Quando o site carregar, cole este script no console do navegador (F12):

```javascript
// Cole este script no console do navegador
(function() {
  console.log(' Iniciando extração de dados do HabboTemplarios...');
  
  // Procurar por dados no JavaScript
  const scripts = document.querySelectorAll('script');
  let palettesJSON = null;
  let setsJSON = null;
  
  for (let script of scripts) {
    const content = script.textContent || script.innerText;
    
    if (content.includes('palettesJSON') && content.includes('setsJSON')) {
      console.log('✅ Script encontrado, extraindo dados...');
      
      // Extrair palettesJSON
      const paletteMatch = content.match(/palettesJSON\s*=\s*({[\s\S]*?});/);
      if (paletteMatch) {
        try {
          palettesJSON = JSON.parse(paletteMatch[1]);
          console.log('✅ palettesJSON extraído:', Object.keys(palettesJSON).length, 'paletas');
        } catch (e) {
          console.log('❌ Erro ao extrair palettesJSON:', e);
        }
      }
      
      // Extrair setsJSON
      const setsMatch = content.match(/setsJSON\s*=\s*(\[[\s\S]*?\])/);
      if (setsMatch) {
        try {
          setsJSON = JSON.parse(setsMatch[1]);
          console.log('✅ setsJSON extraído:', setsJSON.length, 'categorias');
        } catch (e) {
          console.log('❌ Erro ao extrair setsJSON:', e);
        }
      }
      
      break;
    }
  }
  
  if (palettesJSON && setsJSON) {
    // Contar itens
    let totalItems = 0;
    const categoryStats = {};
    
    setsJSON.forEach(categorySet => {
      const category = categorySet.type;
      const itemCount = Object.keys(categorySet.sets).length;
      categoryStats[category] = itemCount;
      totalItems += itemCount;
    });
    
    console.log('📊 Estatísticas:');
    console.log(`- Total de itens: ${totalItems}`);
    console.log(`- Total de categorias: ${Object.keys(categoryStats).length}`);
    console.table(categoryStats);
    
    // Salvar no localStorage
    const data = { palettesJSON, setsJSON, stats: { totalItems, categories: categoryStats } };
    localStorage.setItem('habboTemplariosData', JSON.stringify(data));
    
    console.log('✅ Dados salvos no localStorage!');
    console.log('💾 Use localStorage.getItem("habboTemplariosData") para acessar');
    
    return data;
  } else {
    console.log('❌ Dados não encontrados');
    return null;
  }
})();
```

**Me diga se o navegador abriu e se conseguiu executar o script no console!**