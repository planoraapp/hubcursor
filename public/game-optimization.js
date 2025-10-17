/**
 * 🚀 OTIMIZAÇÕES PARA GAME.JS - HABBO HUB
 * Adicione estas otimizações ao seu game.js para melhorar performance
 */

// ============================================
// 1. REMOVER LOGS DESNECESSÁRIOS EM PRODUÇÃO
// ============================================
// Substitua todos os console.log por esta função:
const debugLog = (...args) => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(...args);
  }
};

// ============================================
// 2. CACHE DE TEXTURAS
// ============================================
const textureCache = new Map();

function getOrCreateTexture(key, createFn) {
  if (textureCache.has(key)) {
    debugLog(`✅ Textura '${key}' carregada do cache`);
    return textureCache.get(key);
  }
  
  const texture = createFn();
  textureCache.set(key, texture);
  debugLog(`🆕 Textura '${key}' criada e cacheada`);
  return texture;
}

// Exemplo de uso:
// const grassTexture = getOrCreateTexture('grass', () => {
//   const canvas = document.createElement('canvas');
//   canvas.width = 256;
//   canvas.height = 256;
//   const ctx = canvas.getContext('2d');
//   // ... criar textura
//   return new THREE.CanvasTexture(canvas);
// });

// ============================================
// 3. OTIMIZAÇÃO DO RENDERER
// ============================================
function createOptimizedRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: false, // Desabilitar antialiasing para melhor performance
    powerPreference: 'high-performance',
    precision: 'lowp', // Baixa precisão para mobile
    stencil: false,
    depth: true,
    logarithmicDepthBuffer: false
  });
  
  // Configurações de performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar pixel ratio
  renderer.shadowMap.enabled = false; // Desabilitar sombras se não necessário
  
  return renderer;
}

// ============================================
// 4. OTIMIZAÇÃO DE GEOMETRIAS
// ============================================
function createOptimizedTerrain(width, height, segments = 32) {
  // Usar menos segmentos para melhor performance
  const geometry = new THREE.PlaneGeometry(
    width, 
    height, 
    Math.min(segments, 32), // Limitar segmentos
    Math.min(segments, 32)
  );
  
  // Computar normais apenas uma vez
  geometry.computeVertexNormals();
  
  return geometry;
}

// ============================================
// 5. POOLING DE OBJETOS
// ============================================
class ObjectPool {
  constructor(createFn, initialSize = 10) {
    this.createFn = createFn;
    this.available = [];
    this.inUse = new Set();
    
    // Pré-criar objetos
    for (let i = 0; i < initialSize; i++) {
      this.available.push(createFn());
    }
  }
  
  acquire() {
    let obj;
    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.createFn();
    }
    this.inUse.add(obj);
    return obj;
  }
  
  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.available.push(obj);
      // Reset objeto para reutilização
      if (obj.position) obj.position.set(0, 0, 0);
      if (obj.rotation) obj.rotation.set(0, 0, 0);
      if (obj.scale) obj.scale.set(1, 1, 1);
    }
  }
}

// ============================================
// 6. THROTTLE PARA UPDATES
// ============================================
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

// Exemplo: Atualizar posição do carro com throttle
// const updateCarPosition = throttle((x, y, rot) => {
//   debugLog(`Carro pos: ${x} ${y}`);
//   debugLog(`Carro rot: ${rot}`);
// }, 100); // Atualizar no máximo a cada 100ms

// ============================================
// 7. OTIMIZAÇÃO DO LOOP DE ANIMAÇÃO
// ============================================
let lastFrameTime = performance.now();
const targetFPS = 60;
const frameDelay = 1000 / targetFPS;

function optimizedAnimationLoop(updateFn, renderFn) {
  function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;
    
    // Limitar FPS para economizar recursos
    if (deltaTime < frameDelay) {
      return;
    }
    
    lastFrameTime = currentTime - (deltaTime % frameDelay);
    
    // Update
    updateFn(deltaTime / 1000); // Passar delta em segundos
    
    // Render
    renderFn();
  }
  
  animate();
}

// ============================================
// 8. FRUSTUM CULLING MANUAL
// ============================================
function updateVisibility(camera, objects) {
  const frustum = new THREE.Frustum();
  const cameraViewProjectionMatrix = new THREE.Matrix4();
  
  camera.updateMatrixWorld();
  cameraViewProjectionMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
  
  objects.forEach(obj => {
    obj.visible = frustum.intersectsObject(obj);
  });
}

// ============================================
// 9. DISPOSE DE RECURSOS
// ============================================
function disposeObject(object) {
  if (object.geometry) {
    object.geometry.dispose();
  }
  
  if (object.material) {
    if (Array.isArray(object.material)) {
      object.material.forEach(material => disposeMaterial(material));
    } else {
      disposeMaterial(object.material);
    }
  }
  
  if (object.texture) {
    object.texture.dispose();
  }
}

function disposeMaterial(material) {
  if (material.map) material.map.dispose();
  if (material.lightMap) material.lightMap.dispose();
  if (material.bumpMap) material.bumpMap.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.specularMap) material.specularMap.dispose();
  if (material.envMap) material.envMap.dispose();
  material.dispose();
}

// ============================================
// 10. CONFIGURAÇÕES RECOMENDADAS
// ============================================
const PERFORMANCE_CONFIG = {
  // Renderer
  antialias: false,
  shadowsEnabled: false,
  maxPixelRatio: 2,
  
  // Geometria
  maxTerrainSegments: 32,
  
  // Texturas
  maxTextureSize: 512, // Reduzir de 1024 para 512
  anisotropy: 1, // Desabilitar anisotropic filtering
  
  // FPS
  targetFPS: 60,
  
  // Logs
  enableDebugLogs: false, // Desabilitar em produção
  
  // Physics
  physicsSteps: 1, // Reduzir steps de física
  
  // Camera
  farPlane: 1000, // Reduzir distância de renderização
};

// ============================================
// EXEMPLO DE IMPLEMENTAÇÃO COMPLETA
// ============================================
/*
class OptimizedGame {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, PERFORMANCE_CONFIG.farPlane);
    this.renderer = createOptimizedRenderer(document.getElementById('gameCanvas'));
    
    // Cache de texturas
    this.textures = new Map();
    
    // Pool de objetos
    this.particlePool = new ObjectPool(() => new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial()
    ), 50);
    
    this.init();
  }
  
  init() {
    // Criar terreno otimizado
    const grassTexture = getOrCreateTexture('grass', () => this.createGrassTexture());
    const terrain = createOptimizedTerrain(1000, 1000, 32);
    const material = new THREE.MeshBasicMaterial({ map: grassTexture });
    const ground = new THREE.Mesh(terrain, material);
    this.scene.add(ground);
    
    // Iniciar loop otimizado
    optimizedAnimationLoop(
      (deltaTime) => this.update(deltaTime),
      () => this.render()
    );
  }
  
  createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Criar textura de grama
    ctx.fillStyle = '#4a7c2c';
    ctx.fillRect(0, 0, 256, 256);
    
    // Adicionar variação
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${60 + Math.random() * 20}, ${100 + Math.random() * 40}, ${40 + Math.random() * 20}, 0.3)`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    return texture;
  }
  
  update(deltaTime) {
    // Atualizar física, posições, etc.
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
*/

// ============================================
// EXPORTAR PARA USO GLOBAL
// ============================================
if (typeof window !== 'undefined') {
  window.GameOptimization = {
    debugLog,
    getOrCreateTexture,
    createOptimizedRenderer,
    createOptimizedTerrain,
    ObjectPool,
    throttle,
    optimizedAnimationLoop,
    updateVisibility,
    disposeObject,
    PERFORMANCE_CONFIG,
    textureCache
  };
  
  console.log('🚀 Game Optimization Utils carregados!');
}

