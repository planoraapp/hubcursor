# 🚀 Guia de Otimização do Game.js - NRPG

## 📊 Problemas Identificados

Baseado nos logs do console, identifiquei os seguintes problemas de performance:

1. **Texturas duplicadas**: A textura de grama está sendo criada 2 vezes
2. **Logs excessivos**: Muitos `console.log` a cada frame (60x por segundo!)
3. **Falta de cache**: Texturas sendo recriadas desnecessariamente
4. **Favicon 404**: Erro de recurso não encontrado

## ✅ Soluções Rápidas (Aplicar Imediatamente)

### 1. Remover/Comentar Logs em Produção

No seu `game.js`, encontre e **comente** ou **remova** estes logs:

```javascript
// ❌ REMOVER ESTES:
console.log('Textura de grama criada:', texture);
console.log('Canvas da textura:', canvas);
console.log('Material de grama criado:', material);
console.log('Terreno de grama criado:', mesh);
console.log('Carro pos:', x, y);  // Este roda 60x por segundo!
console.log('Carro rot:', rotation);
console.log('Câmera pos:', camX, camY);
```

**Substitua por logs condicionais:**

```javascript
// ✅ USAR ISTO:
const DEBUG = window.location.hostname === 'localhost';

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

// Agora use:
debugLog('Textura de grama criada:', texture);
debugLog('Carro pos:', x, y);
```

### 2. Implementar Cache de Texturas

**ANTES (Problema):**
```javascript
function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  // ... criar textura
  return new THREE.CanvasTexture(canvas);
}

// Chamado múltiplas vezes = múltiplas texturas idênticas!
const texture1 = createGrassTexture();
const texture2 = createGrassTexture(); // ❌ Duplicado!
```

**DEPOIS (Solução):**
```javascript
// No topo do arquivo, criar cache global
const TEXTURE_CACHE = {};

function getGrassTexture() {
  if (!TEXTURE_CACHE.grass) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Criar textura de grama
    ctx.fillStyle = '#4a7c2c';
    ctx.fillRect(0, 0, 256, 256);
    
    // Adicionar variação
    for (let i = 0; i < 100; i++) {
      const brightness = Math.random() * 0.3;
      ctx.fillStyle = `rgba(74, 124, 44, ${brightness})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    TEXTURE_CACHE.grass = texture;
    console.log('✅ Textura de grama criada e cacheada');
  }
  
  return TEXTURE_CACHE.grass;
}

// Agora sempre use:
const grassTexture = getGrassTexture(); // ✅ Sempre retorna a mesma instância
```

### 3. Otimizar Renderer

**Encontre onde o renderer é criado e adicione estas configurações:**

```javascript
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: false,              // ✅ Desabilitar para melhor FPS
  powerPreference: 'high-performance',
  precision: 'lowp',             // ✅ Baixa precisão = mais rápido
  stencil: false,
  depth: true
});

// Limitar pixel ratio (importante para mobile!)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Desabilitar sombras se não estiver usando
renderer.shadowMap.enabled = false;
```

### 4. Throttle nos Logs de Posição

**ANTES:**
```javascript
function update() {
  // Isto roda 60x por segundo!
  console.log('Carro pos:', car.position.x, car.position.y);
  console.log('Carro rot:', car.rotation.z);
  console.log('Câmera pos:', camera.position.x, camera.position.y);
}
```

**DEPOIS:**
```javascript
let lastLogTime = 0;
const LOG_INTERVAL = 1000; // Log apenas 1x por segundo

function update() {
  const now = Date.now();
  
  if (DEBUG && now - lastLogTime > LOG_INTERVAL) {
    console.log('Carro pos:', car.position.x.toFixed(2), car.position.y.toFixed(2));
    console.log('Carro rot:', car.rotation.z.toFixed(2));
    console.log('Câmera pos:', camera.position.x.toFixed(2), camera.position.y.toFixed(2));
    lastLogTime = now;
  }
}
```

### 5. Reduzir Complexidade do Terreno

**Se o terreno tiver muitos segmentos:**

```javascript
// ❌ ANTES: Muito detalhado
const geometry = new THREE.PlaneGeometry(1000, 1000, 128, 128); // 16,384 faces!

// ✅ DEPOIS: Otimizado
const geometry = new THREE.PlaneGeometry(1000, 1000, 32, 32);   // 1,024 faces
```

### 6. Corrigir Favicon 404

Adicione um favicon ao seu projeto:

1. Baixe um ícone `.ico` ou crie um
2. Coloque em `public/favicon.ico`
3. Ou adicione no `index.html`:

```html
<link rel="icon" type="image/png" href="/favicon.png">
```

## 🎯 Implementação Completa Recomendada

Aqui está um exemplo de como estruturar seu game.js de forma otimizada:

```javascript
// ============================================
// CONFIGURAÇÕES GLOBAIS
// ============================================
const DEBUG = window.location.hostname === 'localhost';
const TEXTURE_CACHE = {};
const PERFORMANCE_CONFIG = {
  maxPixelRatio: 2,
  terrainSegments: 32,
  textureSize: 256,
  targetFPS: 60,
  logInterval: 1000
};

// ============================================
// UTILITÁRIOS
// ============================================
function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

let lastLogTime = 0;
function throttledLog(message, ...args) {
  const now = Date.now();
  if (DEBUG && now - lastLogTime > PERFORMANCE_CONFIG.logInterval) {
    console.log(message, ...args);
    lastLogTime = now;
  }
}

// ============================================
// CACHE DE TEXTURAS
// ============================================
function getGrassTexture() {
  if (!TEXTURE_CACHE.grass) {
    const canvas = document.createElement('canvas');
    canvas.width = PERFORMANCE_CONFIG.textureSize;
    canvas.height = PERFORMANCE_CONFIG.textureSize;
    const ctx = canvas.getContext('2d');
    
    // Base verde
    ctx.fillStyle = '#4a7c2c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Variação de cor
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${60 + Math.random() * 20}, ${100 + Math.random() * 40}, ${40 + Math.random() * 20}, 0.3)`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    TEXTURE_CACHE.grass = texture;
    debugLog('✅ Textura de grama criada:', texture);
  }
  
  return TEXTURE_CACHE.grass;
}

// ============================================
// INICIALIZAÇÃO DO JOGO
// ============================================
class Game {
  constructor() {
    this.initRenderer();
    this.initScene();
    this.initTerrain();
    this.initCar();
    this.initCamera();
    this.start();
  }
  
  initRenderer() {
    const canvas = document.getElementById('gameCanvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'lowp',
      stencil: false,
      depth: true
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, PERFORMANCE_CONFIG.maxPixelRatio));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    
    debugLog('✅ Renderer criado');
  }
  
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Azul céu
    debugLog('✅ Cena criada');
  }
  
  initTerrain() {
    const grassTexture = getGrassTexture(); // ✅ Usa cache
    
    const geometry = new THREE.PlaneGeometry(
      1000, 
      1000, 
      PERFORMANCE_CONFIG.terrainSegments, 
      PERFORMANCE_CONFIG.terrainSegments
    );
    
    const material = new THREE.MeshBasicMaterial({ 
      map: grassTexture,
      side: THREE.DoubleSide
    });
    
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2;
    this.scene.add(this.terrain);
    
    debugLog('✅ Terreno criado');
  }
  
  initCar() {
    // Criar carro
    const carGeometry = new THREE.BoxGeometry(2, 1, 4);
    const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.car = new THREE.Mesh(carGeometry, carMaterial);
    this.car.position.y = 0.5;
    this.scene.add(this.car);
    
    debugLog('✅ Carro criado');
  }
  
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 10, -30);
    this.camera.lookAt(0, 0, 0);
    
    debugLog('✅ Câmera criada');
  }
  
  update(deltaTime) {
    // Atualizar física do carro
    // ...
    
    // Log throttled
    throttledLog(
      'Posições:',
      `Carro: (${this.car.position.x.toFixed(1)}, ${this.car.position.y.toFixed(1)})`,
      `Rot: ${this.car.rotation.z.toFixed(2)}`,
      `Câmera: (${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)})`
    );
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  start() {
    debugLog('✅ Jogo iniciado!');
    
    let lastTime = performance.now();
    const frameDelay = 1000 / PERFORMANCE_CONFIG.targetFPS;
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      // Limitar FPS
      if (deltaTime < frameDelay) return;
      
      lastTime = currentTime - (deltaTime % frameDelay);
      
      this.update(deltaTime / 1000);
      this.render();
    };
    
    animate();
  }
}

// ============================================
// INICIAR JOGO
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  console.log('🎮 Game initialized:', game);
});
```

## 📈 Resultados Esperados

Após aplicar estas otimizações:

- ✅ **FPS mais estável** (60 FPS consistente)
- ✅ **Menos uso de memória** (texturas não duplicadas)
- ✅ **Console limpo** (logs apenas em desenvolvimento)
- ✅ **Carregamento mais rápido** (menos criação de objetos)
- ✅ **Melhor performance mobile** (pixel ratio limitado)

## 🔍 Checklist de Otimização

- [ ] Remover/comentar `console.log` em loops de animação
- [ ] Implementar cache de texturas
- [ ] Configurar renderer otimizado
- [ ] Reduzir segmentos do terreno (32x32 máximo)
- [ ] Limitar pixel ratio a 2
- [ ] Desabilitar antialiasing
- [ ] Desabilitar sombras (se não usar)
- [ ] Implementar throttle nos logs
- [ ] Adicionar favicon
- [ ] Testar em dispositivos mobile

## 🎯 Próximos Passos

1. **Aplicar as mudanças acima no seu game.js**
2. **Testar no localhost** (logs devem aparecer)
3. **Testar em produção** (logs não devem aparecer)
4. **Monitorar FPS** com Chrome DevTools (F12 > Performance)
5. **Ajustar `terrainSegments`** se ainda houver lag

## 📞 Suporte

Se ainda houver lag após estas otimizações:

1. Reduza `terrainSegments` para 16
2. Reduza `textureSize` para 128
3. Considere usar `THREE.InstancedMesh` para objetos repetidos
4. Implemente LOD (Level of Detail) para objetos distantes

---

**Criado para HabboHub - NRPG Game Optimization** 🚀

