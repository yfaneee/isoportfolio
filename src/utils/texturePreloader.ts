import * as THREE from 'three';

// Texture cache for preloaded textures
const textureCache = new Map<string, THREE.Texture>();

// Billboard texture paths
export const BILLBOARD_TEXTURES = {
  billboard1: '/images/castleportfolio.png',
  billboard2: '/images/hollemanproj.png',
  billboard3: '/images/spaceportfolio.png',
  billboard4: '/images/spotifyfolio.png',
} as const;

// Configure texture for optimal performance
function configureTexture(texture: THREE.Texture): THREE.Texture {
  // Enable mipmaps for smoother scaling
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter; 
  texture.magFilter = THREE.LinearFilter;
  
  // Proper wrapping
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  
  // Anisotropic filtering for better quality at angles
  texture.anisotropy = 4; 
  
  texture.flipY = true;
  texture.needsUpdate = true;
  
  return texture;
}

// Preload all billboard textures
export function preloadBillboardTextures(): Promise<void> {
  const loader = new THREE.TextureLoader();
  const promises: Promise<void>[] = [];

  Object.entries(BILLBOARD_TEXTURES).forEach(([key, path]) => {
    // Skip if already cached
    if (textureCache.has(key)) {
      return;
    }

    const promise = new Promise<void>((resolve, reject) => {
      loader.load(
        path,
        (texture) => {
          configureTexture(texture);
          textureCache.set(key, texture);
          console.log(`✓ Preloaded texture: ${key}`);
          resolve();
        },
        undefined,
        (error) => {
          console.error(`Failed to preload texture ${key}:`, error);
          reject(error);
        }
      );
    });

    promises.push(promise);
  });

  return Promise.all(promises).then(() => {
    console.log('✓ All billboard textures preloaded');
  });
}

// Get preloaded texture (or load on-demand if not cached)
export function getBillboardTexture(billboardKey: string): THREE.Texture | null {
  const cached = textureCache.get(billboardKey);
  if (cached) {
    return cached.clone(); // Return a clone to prevent shared state issues
  }

  // Fallback: load on-demand if preloading failed
  const path = BILLBOARD_TEXTURES[billboardKey as keyof typeof BILLBOARD_TEXTURES];
  if (!path) {
    console.warn(`No texture path found for ${billboardKey}`);
    return null;
  }

  const loader = new THREE.TextureLoader();
  const texture = loader.load(path);
  configureTexture(texture);
  textureCache.set(billboardKey, texture);
  
  return texture;
}

// Dispose all cached textures (for cleanup)
export function disposeBillboardTextures(): void {
  textureCache.forEach((texture, key) => {
    texture.dispose();
    console.log(`Disposed texture: ${key}`);
  });
  textureCache.clear();
}

// Get texture from cache without cloning (for cases where you don't modify it)
export function getBillboardTextureShared(billboardKey: string): THREE.Texture | null {
  return textureCache.get(billboardKey) || null;
}

