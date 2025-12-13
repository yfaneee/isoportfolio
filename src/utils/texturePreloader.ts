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

// Optimize texture for GPU performance
function configureTexture(texture: THREE.Texture, isHighPriority: boolean = true): THREE.Texture {
  // Enable mipmaps for GPU-accelerated filtering
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter; 
  texture.magFilter = THREE.LinearFilter;
  
  // Proper wrapping
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  texture.anisotropy = 16; 
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  
  // Enable GPU-side color space conversion
  texture.colorSpace = THREE.SRGBColorSpace;
  
  texture.flipY = true;
  texture.needsUpdate = true;
  
  // For high-priority textures, mark for immediate GPU upload
  if (isHighPriority) {
    texture.matrixAutoUpdate = false; 
  }
  
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
    // All billboard textures preloaded successfully
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
  textureCache.forEach((texture) => {
    texture.dispose();
  });
  textureCache.clear();
}

// Get texture from cache without cloning (for cases where you don't modify it)
export function getBillboardTextureShared(billboardKey: string): THREE.Texture | null {
  return textureCache.get(billboardKey) || null;
}

