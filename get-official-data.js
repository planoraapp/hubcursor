// Obter dados oficiais do habbo-downloader
const fetchData = async () => {
  try {
    console.log('Obtendo dados oficiais...');
    const response = await fetch('https://raw.githubusercontent.com/higoka/habbo-downloader/main/resource/gamedata/figuredata.xml');
    const xmlText = await response.text();
    
    // Parse XML básico (sem dependências)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const result = {};
    const setTypes = xmlDoc.querySelectorAll('settype');
    
    setTypes.forEach(setType => {
      const type = setType.getAttribute('type');
      const sets = setType.querySelectorAll('set');
      
      result[type] = [];
      
      sets.forEach(set => {
        if (set.getAttribute('selectable') === '1') {
          const colors = [];
          const colorNodes = set.querySelectorAll('color');
          colorNodes.forEach(color => {
            colors.push(color.getAttribute('id'));
          });
          
          result[type].push({
            id: set.getAttribute('id'),
            gender: set.getAttribute('gender') || 'U',
            club: set.getAttribute('club') || '0',
            colorable: set.getAttribute('colorable') === '1',
            colors: colors.length > 0 ? colors : ['1']
          });
        }
      });
    });
    
    // Salvar resultado
    console.log('Dados processados:', Object.keys(result).length, 'tipos');
    return JSON.stringify(result, null, 2);
    
  } catch (error) {
    console.error('Erro:', error);
    return null;
  }
};

// Executar e exibir resultado
fetchData().then(data => {
  if (data) {
    console.log('DADOS OBTIDOS - COPIE E COLE NO figuredata.json:');
    console.log(data);
  }
});