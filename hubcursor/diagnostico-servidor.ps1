# Diagnóstico e inicialização do servidor local (PowerShell)
# Executar a partir da pasta 'hubcursor'

param(
  [int]$Port = 8080
)

function Test-ProjectFolder {
  if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json não encontrado. Execute na pasta 'hubcursor'." -ForegroundColor Red
    exit 1
  }
  Write-Host "✅ package.json encontrado." -ForegroundColor Green
}

function Test-NodeRuntime {
  try {
    $nv = node --version
    $npmv = npm --version
    Write-Host "✅ Node.js: $nv  |  npm: $npmv" -ForegroundColor Green
  } catch {
    Write-Host "❌ Node.js/npm não encontrados. Instale em https://nodejs.org/" -ForegroundColor Red
    exit 1
  }
}

function Install-Dependencies {
  if (Test-Path "node_modules") {
    Write-Host "✅ Dependências já instaladas." -ForegroundColor Green
  } else {
    Write-Host "📦 Instalando dependências (npm install)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
      Write-Host "❌ Falha ao instalar dependências." -ForegroundColor Red
      exit 1
    }
    Write-Host "✅ Dependências instaladas." -ForegroundColor Green
  }
}

function Test-EnvFile {
  if (Test-Path ".env") {
    Write-Host "✅ .env encontrado." -ForegroundColor Green
  } else {
    Write-Host "⚠️ .env não encontrado. Crie o arquivo .env com suas variáveis (VITE_SUPABASE_URL/ANON_KEY etc.)." -ForegroundColor Yellow
    # Exemplo (descomentando, cria um esqueleto vazio):
    # @"
    # VITE_SUPABASE_URL=
    # VITE_SUPABASE_ANON_KEY=
    # VITE_APP_ENV=development
    # "@ | Out-File -FilePath ".env" -Encoding UTF8
  }
}

function Clear-PortUse {
  param([int]$Port)
  Write-Host "🔎 Verificando uso da porta $Port..." -ForegroundColor Cyan
  $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
  if ($conns) {
    Write-Host "⚠️ Porta $Port em uso. Encerrando processos..." -ForegroundColor Yellow
    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
      try {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Encerrado PID $procId" -ForegroundColor Green
      } catch {
        Write-Host "⚠️ Não foi possível encerrar PID $procId" -ForegroundColor Yellow
      }
    }
    Start-Sleep -Seconds 2
  } else {
    Write-Host "✅ Porta $Port está livre." -ForegroundColor Green
  }
}

function Test-Build {
  Write-Host "🧪 Testando build (vite build)..." -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erros no build. Corrija antes de iniciar o dev server." -ForegroundColor Red
    exit 1
  }
  Write-Host "✅ Build OK." -ForegroundColor Green
}

function Start-Dev {
  Write-Host "🚀 Iniciando servidor (npm run dev)..." -ForegroundColor Green
  Write-Host "👉 Acesse: http://localhost:$Port" -ForegroundColor Yellow
  Write-Host "👉 Editor: http://localhost:$Port/ferramentas/avatar-editor" -ForegroundColor Yellow
  npm run dev
}

# Execução
Test-ProjectFolder
Test-NodeRuntime
Install-Dependencies
Test-EnvFile
Clear-PortUse -Port $Port
# Test-Build   # (opcional) descomente se quiser forçar build antes
Start-Dev

interface ClothingItem {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  category: string;
  subcategory?: string;
  rarity: 'FREE' | 'HC' | 'SPECIAL';
  colorable: boolean;
  colors?: string[];
  previewUrl: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  genderFilter: boolean;
  colorable: boolean;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  icon: string;
  items: ClothingItem[];
}
