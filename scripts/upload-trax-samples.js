const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configuração do cliente S3 para Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Função para fazer upload de um arquivo
async function uploadFile(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: 'audio/mpeg',
    });

    await s3Client.send(command);
    console.log(`✅ Uploaded: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${key}:`, error.message);
    return false;
  }
}

// Função principal
async function uploadTraxSamples() {
  console.log('🚀 Iniciando upload dos samples do TraxMachine...');
  
  // Verificar variáveis de ambiente
  const requiredEnvVars = [
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Variável de ambiente ${envVar} não encontrada!`);
      console.log('📝 Configure as variáveis no arquivo .env.local');
      process.exit(1);
    }
  }

  // Lista de samples para upload (você pode adicionar mais)
  const samples = [
    { file: 'sound_machine_sample_1.mp3', key: 'trax/samples/sound_machine_sample_1.mp3' },
    { file: 'sound_machine_sample_2.mp3', key: 'trax/samples/sound_machine_sample_2.mp3' },
    { file: 'sound_machine_sample_3.mp3', key: 'trax/samples/sound_machine_sample_3.mp3' },
    // Adicione mais samples conforme necessário
  ];

  let successCount = 0;
  let totalCount = samples.length;

  for (const sample of samples) {
    const filePath = path.join(__dirname, '..', 'public', 'trax-samples', sample.file);
    
    if (fs.existsSync(filePath)) {
      const success = await uploadFile(filePath, sample.key);
      if (success) successCount++;
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${sample.file}`);
    }
  }

  console.log(`\n📊 Upload concluído: ${successCount}/${totalCount} arquivos enviados`);
  
  if (successCount > 0) {
    console.log('🎉 Samples do TraxMachine enviados com sucesso!');
    console.log(`🔗 URL base: ${process.env.CLOUDFLARE_R2_PUBLIC_URL}`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  uploadTraxSamples().catch(console.error);
}

module.exports = { uploadTraxSamples };
