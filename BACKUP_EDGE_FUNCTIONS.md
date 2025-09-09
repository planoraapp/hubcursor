# 🔄 BACKUP DAS EDGE FUNCTIONS - HABBO HUB

## 📅 Data do Backup: $(Get-Date -Format "dd/MM/yyyy HH:mm")

## 🗂️ Edge Functions para REMOVER (42 funções obsoletas)

### ❌ Funções Duplicadas/Redundantes
- `habbo-feed` (usar `habbo-feed-optimized`)
- `habbo-figuredata` (usar `get-real-habbo-data`)
- `get-habbo-figures` (usar `get-real-habbo-data`)
- `get-habbo-official-data` (usar `get-real-habbo-data`)
- `get-official-habbo-assets` (usar `habbo-real-assets`)
- `get-official-habbo-clothing` (usar `unified-clothing-api`)

### ❌ Funções de Teste/Desenvolvimento
- `create-beebop-test-account`
- `setup-beebop-admin`
- `templarios-scraper`
- `templarios-figuredata`

### ❌ Funções de Sistema Interno Obsoletas
- `habbo-badges-scraper`
- `habbo-badges-storage`
- `habbo-badges-validator`
- `habbo-change-detector`
- `habbo-change-scheduler`

### ❌ APIs Externas Obsoletas
- `habbo-emotion-badges`
- `habbo-emotion-clothing`
- `habbo-emotion-furnis`
- `puhekupla-proxy`

### ❌ Sistema de Notícias Obsoleto
- `habbo-news-scraper`
- `habbo-hotel-feed`
- `habbo-hotel-general-feed`

## ✅ Edge Functions para MANTER (20 funções essenciais)

### 🔐 Autenticação e Usuários
- `verify-and-register-via-motto`
- `habbo-user-search`
- `habbo-complete-profile`
- `habbo-auth`

### 🎨 Dados de Roupas e Avatar
- `get-real-habbo-data`
- `unified-clothing-api`
- `habbo-real-assets`
- `flash-assets-clothing`

### 🏆 Sistema de Badges
- `real-badges-system`
- `habbo-assets-badges`
- `habbo-api-badges`
- `habbo-discover-by-badges`

### 📸 Sistema de Fotos
- `habbo-photo-discovery`
- `habbo-photos-scraper`
- `test-habbo-photos`

### 🏠 Sistema de Homes
- `sync-home-assets`
- `habbo-friends-photos`

### 📊 Feed e Atividades
- `habbo-widgets-proxy`
- `habbo-feed-optimized`
- `habbo-friends-activities-direct`
- `habbo-daily-activities-tracker`

### 🏪 Marketplace
- `habbo-market-history`
- `habbo-official-ticker`

## 🚨 IMPORTANTE
Este backup foi criado antes da limpeza. Se alguma funcionalidade parar de funcionar, 
consulte este arquivo para restaurar as funções necessárias.
