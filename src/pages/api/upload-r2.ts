import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuração do cliente S3 para Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, path } = req.body;
    
    if (!file || !path) {
      return res.status(400).json({ error: 'File and path are required' });
    }

    // Upload para R2
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: path,
      Body: file,
      ContentType: file.type || 'audio/mpeg',
    });

    await s3Client.send(command);

    // Retorna a URL pública
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${path}`;
    
    res.status(200).json({ 
      success: true, 
      url: publicUrl,
      path: path 
    });
  } catch (error) {
    console.error('Erro no upload para R2:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Limite para arquivos de áudio
    },
  },
};
