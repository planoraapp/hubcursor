const fs = require('fs');
const path = require('path');

const backupData = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const files = [
    'src/data/badge-codes.json',
    'src/data/badge-categories.json'
  ];
  
  files.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    if (fs.existsSync(sourcePath)) {
      const backupPath = path.join(backupDir, `${path.basename(file)}.${timestamp}`);
      fs.copyFileSync(sourcePath, backupPath);
      console.log(`Backup criado: ${backupPath}`);
    }
  });
  
  // Limpar backups antigos (manter apenas os últimos 7)
  const backupFiles = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .reverse();
    
  if (backupFiles.length > 7) {
    backupFiles.slice(7).forEach(file => {
      fs.unlinkSync(path.join(backupDir, file));
      console.log(`Backup antigo removido: ${file}`);
    });
  }
};

if (require.main === module) {
  backupData();
}

module.exports = { backupData };