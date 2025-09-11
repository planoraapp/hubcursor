# 🚀 Configuração do Cloudflare R2 para TraxMachine

## 📋 **Passo a Passo:**

### **1. Criar conta no Cloudflare R2:**
1. Acesse: https://dash.cloudflare.com/
2. Vá em **R2 Object Storage**
3. Clique em **Create bucket**
4. Nome do bucket: `habbohub-trax`

### **2. Criar API Token:**
1. Vá em **Manage R2 API tokens**
2. Clique em **Create API token**
3. Permissões: **Object Read & Write**
4. Anote as credenciais geradas

### **3. Configurar Custom Domain (Opcional):**
1. Vá em **Settings** do bucket
2. **Custom Domains** > **Connect Domain**
3. Use um subdomínio como: `trax.seusite.com`

### **4. Adicionar variáveis no Vercel:**
```bash
# No painel do Vercel > Settings > Environment Variables:

CLOUDFLARE_ACCOUNT_ID=seu_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=sua_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=sua_secret_key
CLOUDFLARE_R2_BUCKET_NAME=habbohub-trax
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### **5. Upload dos arquivos de áudio:**
```bash
# Use o script que vou criar para fazer upload automático
npm run upload-trax-samples
```

## 💰 **Custos:**
- **0-10GB**: GRÁTIS
- **10GB+**: $0.015/GB/mês
- **Sem taxas de download**

## 🎵 **Estrutura de arquivos no R2:**
```
habbohub-trax/
├── trax/
│   ├── samples/
│   │   ├── sound_machine_sample_1.mp3
│   │   ├── sound_machine_sample_2.mp3
│   │   └── ...
│   └── collections/
│       ├── 01.gif
│       ├── 02.gif
│       └── ...
```

## ✅ **Próximos passos:**
1. Configure as variáveis de ambiente
2. Execute o script de upload
3. Teste o TraxMachine com áudio real!
