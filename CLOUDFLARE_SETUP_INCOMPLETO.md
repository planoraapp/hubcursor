# 🔧 Cloudflare R2 - Configuração Parcial

## ✅ **O que já foi configurado:**
- ✅ Account ID: `bc052560bd9ab3ff936afd0013f1ecaa`
- ✅ Bucket Name: `habbohub-trax`
- ✅ S3 API URL: `https://bc052560bd9ab3ff936afd0013f1ecaa.r2.cloudflarestorage.com/habbohub-trax`

## ⚠️ **O que ainda precisa ser feito:**

### **1. Criar API Token:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique em **"Create Token"**
3. Use o template **"Custom token"**
4. Permissões: **R2:Edit** para todos os recursos
5. Copie o **Access Key ID** e **Secret Access Key**

### **2. Obter Public URL:**
1. Vá para: https://dash.cloudflare.com/bc052560bd9ab3ff936afd0013f1ecaa/r2/default/buckets/habbohub-trax
2. Clique em **"Settings"** no bucket
3. Copie a **"Public URL"** (algo como `https://pub-xxxxx.r2.dev`)

### **3. Adicionar variáveis de ambiente:**
Crie um arquivo `.env.local` na raiz do projeto com:
```bash
VITE_CLOUDFLARE_R2_ACCESS_KEY_ID=seu_access_key_aqui
VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY=sua_secret_key_aqui
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## 🎵 **Após configurar:**
- O TraxMachine funcionará com áudio real
- Upload de samples funcionará
- CDN global ativo

**Status**: ⚠️ Configuração parcial - precisa das credenciais de API
