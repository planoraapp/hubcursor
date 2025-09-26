// Cloudflare R2 Configuration
export const R2_CONFIG = {
  // Configuração do Cloudflare R2
  accountId: 'bc052560bd9ab3ff936afd0013f1ecaa',
  accessKeyId: import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  bucketName: 'habbohub-trax',
  publicUrl: import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-af1b3571db674d6bbef76bd60d2423d3.r2.dev',
  s3ApiUrl: 'https://bc052560bd9ab3ff936afd0013f1ecaa.r2.cloudflarestorage.com/habbohub-trax',
};

// Função para fazer upload de arquivos para o R2
export async function uploadToR2(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  const response = await fetch('/api/upload-r2', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Falha no upload para R2');
  }

  const data = await response.json();
  return data.url;
}

// Função para obter URL pública de um arquivo
export function getR2PublicUrl(path: string): string {
  return `${R2_CONFIG.publicUrl}/${path}`;
}

// URLs dos samples de áudio do TraxMachine
export const TRAX_SAMPLES = {
  // Sound Set 1 - DJ Fuse's Duck Funk
  '1-1': 'trax/samples/sound_machine_sample_1.mp3',
  '1-2': 'trax/samples/sound_machine_sample_2.mp3',
  '1-3': 'trax/samples/sound_machine_sample_3.mp3',
  '1-4': 'trax/samples/sound_machine_sample_4.mp3',
  '1-5': 'trax/samples/sound_machine_sample_5.mp3',
  '1-6': 'trax/samples/sound_machine_sample_6.mp3',
  '1-7': 'trax/samples/sound_machine_sample_7.mp3',
  '1-8': 'trax/samples/sound_machine_sample_8.mp3',
  '1-9': 'trax/samples/sound_machine_sample_9.mp3',
  
  // Sound Set 2 - DJ Fuse's Habbo Theme
  '2-1': 'trax/samples/sound_machine_sample_10.mp3',
  '2-2': 'trax/samples/sound_machine_sample_11.mp3',
  '2-3': 'trax/samples/sound_machine_sample_12.mp3',
  '2-4': 'trax/samples/sound_machine_sample_13.mp3',
  '2-5': 'trax/samples/sound_machine_sample_14.mp3',
  '2-6': 'trax/samples/sound_machine_sample_15.mp3',
  '2-7': 'trax/samples/sound_machine_sample_16.mp3',
  '2-8': 'trax/samples/sound_machine_sample_17.mp3',
  '2-9': 'trax/samples/sound_machine_sample_18.mp3',
  
  // Adicione mais conforme necessário...
};

// Função para obter URL de um sample específico
export function getTraxSampleUrl(collectionId: number, sampleId: number): string {
  const key = `${collectionId}-${sampleId}`;
  const path = TRAX_SAMPLES[key as keyof typeof TRAX_SAMPLES];
  return path ? getR2PublicUrl(path) : '';
}