// Collision and boundary system for the isometric world
import { isOnElevator, getElevatorHeight, triggerElevator } from './elevatorSystem';

// Performance optimization: Spatial grid for fast platform lookups
const GRID_SIZE = 3; // Grid cell size (3x3 units per cell)
const spatialGrid: Map<string, Platform[]> = new Map();
let gridInitialized = false;

// Force reset grid when platforms change
export function resetSpatialGrid() {
  gridInitialized = false;
  spatialGrid.clear();
}

export interface Platform {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number; 
  type: 'floor' | 'stair' | 'triangle';
  stairDirection?: 'north' | 'south' | 'east' | 'west';
  triangleVertices?: { x: number; z: number }[];
}

// Define all walkable areas - STAIRS FIRST (they override floors beneath them)
export const platforms: Platform[] = [
  // LEFT STAIRS TO TALL WALL (10 steps on left side) 
  { minX: -3.75, maxX: -2.25, minZ: -8.1, maxZ: -7.3, y: 0.85, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -8.4, maxZ: -7.6, y: 1.15, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -8.7, maxZ: -7.9, y: 1.45, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -9.0, maxZ: -8.2, y: 1.85, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -9.3, maxZ: -8.5, y: 2.25, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -9.6, maxZ: -8.8, y: 2.65, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -9.9, maxZ: -9.1, y: 2.85, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -10.2, maxZ: -9.4, y: 3.05, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -10.5, maxZ: -9.7, y: 3.15, type: 'stair', stairDirection: 'south' },
  { minX: -3.75, maxX: -2.25, minZ: -10.8, maxZ: -10, y: 3.25, type: 'stair', stairDirection: 'south' },
  
  // CONNECTION from left stairs to tall wall blocks
  { minX: -3.75, maxX: -2.25, minZ: -11.55, maxZ: -10.8, y: 3.25, type: 'floor' },
  
  // MIDDLE STAIRS TO SECOND WALL (5 steps in center) - Going SOUTH (negative Z)
  { minX: -0.75, maxX: 0.75, minZ: -8.25, maxZ: -7.55, y: 0.65, type: 'stair', stairDirection: 'south' },
  { minX: -0.75, maxX: 0.75, minZ: -8.55, maxZ: -7.85, y: 0.95, type: 'stair', stairDirection: 'south' },
  { minX: -0.75, maxX: 0.75, minZ: -8.85, maxZ: -8.15, y: 1.25, type: 'stair', stairDirection: 'south' },
  { minX: -0.75, maxX: 0.75, minZ: -9.15, maxZ: -8.45, y: 1.55, type: 'stair', stairDirection: 'south' },
  { minX: -0.75, maxX: 0.75, minZ: -9.45, maxZ: -8.75, y: 1.75, type: 'stair', stairDirection: 'south' },
  
  // CONNECTION from middle stairs to second wall blocks
  { minX: -0.75, maxX: 0.75, minZ: -9.6, maxZ: -9.45, y: 1.6, type: 'floor' },
  
  // STAIRS TO LEARNING OUTCOMES PLATFORM (9 steps going WEST)
  { minX: -2.55, maxX: -1.65, minZ: -0.75, maxZ: 0.85, y: 0.45, type: 'stair', stairDirection: 'west' },
  { minX: -2.85, maxX: -2.05, minZ: -0.75, maxZ: 0.85, y: 0.75, type: 'stair', stairDirection: 'west' },
  { minX: -3.15, maxX: -2.25, minZ: -0.75, maxZ: 0.85, y: 1.05, type: 'stair', stairDirection: 'west' },
  { minX: -3.6, maxX: -2.7, minZ: -0.75, maxZ: 0.85, y: 1.35, type: 'stair', stairDirection: 'west' },
  { minX: -4.05, maxX: -3.15, minZ: -0.75, maxZ: 0.85, y: 1.65, type: 'stair', stairDirection: 'west' },
  { minX: -4.5, maxX: -3.6, minZ: -0.75, maxZ: 0.85, y: 1.95, type: 'stair', stairDirection: 'west' },
  { minX: -4.95, maxX: -4.05, minZ: -0.75, maxZ: 0.85, y: 2.25, type: 'stair', stairDirection: 'west' },
  { minX: -5.4, maxX: -4.5, minZ: -0.75, maxZ: 0.85, y: 2.55, type: 'stair', stairDirection: 'west' },
  { minX: -5.85, maxX: -5.4, minZ: -0.75, maxZ: 0.85, y: 2.85, type: 'stair', stairDirection: 'west' },
  { minX: -6.6, maxX: -5.85, minZ: -0.75, maxZ: 0.85, y: 3, type: 'stair', stairDirection: 'west' },

  
  // NOW THE FLOORS 
  
  // BONE-WHITE SLAB - Central slab on the 3x3 grid (HIGHER PRIORITY - placed first)
  { minX: 0 - 0.50, maxX: 0 + 0.50, minZ: 0 - 0.50, maxZ: 0 + 0.50, y: 0.22, type: 'floor' },
  
  // HIGH-BLOCK SLAB - On the high block
  { minX: 3 - 0.45, maxX: 3 + 0.45, minZ: -12 - 0.45, maxZ: -12 + 0.45, y: 3.43, type: 'floor' },
  
  // 5 STAIRCASE SLABS - On the impossible staircase
  { minX: -10.625 - 0.45, maxX: -10.625 + 0.45, minZ: 1.5 - 0.45, maxZ: 1.5 + 0.45, y: 3.74, type: 'floor' },
  { minX: -13.625 - 0.45, maxX: -13.625 + 0.45, minZ: 1.5 - 0.45, maxZ: 1.5 + 0.45, y: 4.22, type: 'floor' },
  { minX: -13.625 - 0.45, maxX: -13.625 + 0.45, minZ: -1.5 - 0.45, maxZ: -1.5 + 0.45, y: 4.73, type: 'floor' },
  { minX: -10.625 - 0.45, maxX: -10.625 + 0.45, minZ: -1.5 - 0.45, maxZ: -1.5 + 0.45, y: 5.23, type: 'floor' },
  { minX: -7.625 - 0.45, maxX: -7.625 + 0.45, minZ: -1.5 - 0.45, maxZ: -1.5 + 0.45, y: 5.73, type: 'floor' },
  
  // SMALLER-BLOCK SLAB - On the smaller block
  { minX: -1.5 - 0.45, maxX: -1.5 + 0.45, minZ: -10.4 - 0.45, maxZ: -10.4 + 0.45, y: 1.78, type: 'floor' },
  
  // ARTWORK-PLATFORM SLAB - On the octagonal platform
  { minX: 10.50 - 0.45, maxX: 10.50 + 0.45, minZ: -0.01 - 0.45, maxZ: -0.01 + 0.45, y: -1.90, type: 'floor' },
  
  // 3x3 MAIN GRID - Starting area
  { minX: -2.25, maxX: 2.25, minZ: -2.25, maxZ: 2.25, y: 0.1, type: 'floor' },
  
  // EXTENSION FLOOR 1 - Single connecting floor (south)
  { minX: -0.75, maxX: 0.75, minZ: -3.75, maxZ: -2.25, y: 0.1, type: 'floor' },
  
  // EXTENSION FLOOR 2 - Second connecting floor (south)
  { minX: -0.75, maxX: 0.75, minZ: -5.25, maxZ: -3.75, y: 0.1, type: 'floor' },
  
  // EXTENSION FLOORS TO ARTWORK PLATFORM (east) - Two floors extending right
  { minX: 3.0 - 0.75, maxX: 3.0 + 0.75, minZ: -0.75, maxZ: 0.75, y: 0.1, type: 'floor' }, 
  
  // LOWER ARTWORK PLATFORM (octagonal platform at y=-2.1)b
  { minX: 6.0 - 0.75, maxX: 6.0 + 0.75, minZ: -0.75, maxZ: 0.75, y: -2, type: 'floor' },
  { minX: 7.5 - 0.75, maxX: 7.5 + 0.75, minZ: -0.75, maxZ: 0.75, y: -2, type: 'floor' }, 
  
  // Octagonal platform floors extending from octBaseX = 7.5
  { minX: 9.0 - 0.75, maxX: 9.0 + 0.75, minZ: -0.75, maxZ: 0.75, y: -2, type: 'floor' }, 
  { minX: 10.5 - 0.75, maxX: 10.5 + 0.75, minZ: -0.75, maxZ: 0.75, y: -2, type: 'floor' }, 
  { minX: 12.0 - 0.75, maxX: 12.0 + 0.75, minZ: -0.75, maxZ: 0.75, y: -2, type: 'floor' }, 
  { minX: 10.5 - 0.75, maxX: 10.5 + 0.75, minZ: 1.5 - 0.75, maxZ: 1.5 + 0.75, y: -2, type: 'floor' }, 
  { minX: 10.5 - 0.75, maxX: 10.5 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.5 + 0.75, y: -2, type: 'floor' }, 
  
  // Octagonal platform triangles (4 triangles filling gaps)
  { minX: 9.0, maxX: 10.5, minZ: 0, maxZ: 1.5, y: -2, type: 'triangle',
    triangleVertices: [{x: 10.5, z: 0}, {x: 9.0, z: 0}, {x: 10.5, z: 1.5}] }, 
  { minX: 9.0, maxX: 10.5, minZ: -1.5, maxZ: 0, y: -2, type: 'triangle',
    triangleVertices: [{x: 10.5, z: 0}, {x: 9.0, z: 0}, {x: 10.5, z: -1.5}] },
  { minX: 10.5, maxX: 12.0, minZ: 0, maxZ: 1.5, y: -2, type: 'triangle',
    triangleVertices: [{x: 10.5, z: 0}, {x: 12.0, z: 1.5}, {x: 12.0, z: 0}] }, 
  { minX: 10.5, maxX: 12.0, minZ: -1.5, maxZ: 0, y: -2, type: 'triangle',
    triangleVertices: [{x: 10.5, z: 0}, {x: 12.0, z: -1.5}, {x: 12.0, z: 0}] }, 
  
  // 5x5 GRID FLOOR - Extended to include stair access areas
  { minX: -3.75, maxX: 3.55, minZ: -9.3, maxZ: -5.25, y: 0.1, type: 'floor' },
  
  // SECOND WALL BLOCKS - Medium height wall (smaller tall blocks)
  { minX: -3.75, maxX: 3.55, minZ: -10.4, maxZ: -9.6, y: 1.6, type: 'floor' },
  
  // TALL WALL BLOCKS - Top surface (walkable on top of the highest blocks)
  { minX: -3.75, maxX: 3.45, minZ: -12.35, maxZ: -11.55, y: 3.25, type: 'floor' },
  
  // NEW 5x3 RECTANGULAR RAMP PLATFORM - Learning Outcomes 
  // Connecting floor between stairs and platform
  { minX: -7.26 - 0.75, maxX: -7.26 + 0.75, minZ: 0 - 0.75, maxZ: 0 + 0.75, y: 3.1, type: 'floor' },
  { minX: -7.56 - 0.75, maxX: -7.66 + 0.75, minZ: 0 - 0.75, maxZ: 1.5 + 0.75, y: 3.1, type: 'floor' },
  
  // 5x3 Ramp platform floors (perimeter only, with hole in middle) - REVERSED
  { minX: -9.1 - 0.75, maxX: -9 + 0.75, minZ: 1.5 - 0.75, maxZ: 1.5 + 0.75, y: 3.35, type: 'floor' },
  { minX: -10.56 - 0.75, maxX: -10.5 + 0.75, minZ: 1.5 - 0.75, maxZ: 1.5 + 0.75, y: 3.6, type: 'floor' },
  { minX: -12.1 - 0.75, maxX: -12 + 0.75, minZ: 1.5 - 0.75, maxZ: 1.5 + 0.75, y: 3.86, type: 'floor' },
  { minX: -13.62 - 0.75, maxX: -13.50 + 0.75, minZ: 1.5 - 0.75, maxZ: 1.5 + 0.75, y: 4.1, type: 'floor' },
  
  // Right edge (x=4) - 3 floors with increasing height
  { minX: -13.66 - 0.75, maxX: -13.66 + 0.75, minZ: 0 - 0.75, maxZ: 0 + 0.83, y: 4.35, type: 'floor' },
  { minX: -13.66 - 0.75, maxX: -13.66 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.42 + 0.75, y: 4.6, type: 'floor' },
  
  // Top edge (z=2) - 4 floors collision boundaries
  { minX: -12.25 - 0.75, maxX: -12.15 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.5 + 0.75, y: 4.85, type: 'floor' },
  { minX: -10.75 - 0.75, maxX: -10.65 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.5 + 0.75, y: 5.10, type: 'floor' },
  { minX: -9.25 - 0.75, maxX: -9.22 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.5 + 0.75, y: 5.35, type: 'floor' },
  { minX: -7.75 - 0.75, maxX: -7.82 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.5 + 0.75, y: 5.55, type: 'floor' },
  
  // DOWNWARD STAIRS - Three sets of 3 stairs each (fixed collision boundaries)
  // First set of downward stairs
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 2.80 - 0.75, maxZ: 2.70 + 0.75, y: -0.2, type: 'floor' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 3.1 - 0.75, maxZ: 3.1 + 0.75, y: -0.47, type: 'floor' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 3.55 - 0.75, maxZ: 3.55 + 0.75, y: -0.8, type: 'floor' },
  
  // Second set of downward stairs
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4 - 0.75, maxZ: 4 + 0.75, y: -1.1, type: 'floor' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4.45 - 0.75, maxZ: 4.45 + 0.75, y: -1.4, type: 'floor' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4.90 - 0.75, maxZ: 4.90 + 0.75, y: -1.7, type: 'floor' },
  
  // Third set of downward stairs
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 5.35 - 0.75, maxZ: 5.35 + 0.75, y: -2.0, type: 'floor' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 5.80 - 0.75, maxZ: 5.80 + 0.75, y: -2.3, type: 'floor' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 6.25 - 0.75, maxZ: 6.25 + 0.75, y: -2.6, type: 'floor' },
  
  // PROJECT SLABS on 18x3 platform (4 interactive slabs) - MUST BE BEFORE 18x3 PLATFORM for priority
  { minX: -1 - 0.45, maxX: -1 + 0.45, minZ: 7.65 + 2 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 2 * 1.5 - 1.5 + 0.45, y: -2.47, type: 'floor' },  
  { minX: -1 - 0.45, maxX: -1 + 0.45, minZ: 7.65 + 7 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 7 * 1.5 - 1.5 + 0.45, y: -2.48, type: 'floor' }, 
  { minX: -1 - 0.45, maxX: -1 + 0.45, minZ: 7.65 + 12 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 12 * 1.5 - 1.5 + 0.45, y: -2.48, type: 'floor' },
  { minX: -1 - 0.45, maxX: -1 + 0.45, minZ: 7.65 + 17 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 17 * 1.5 - 1.5 + 0.45, y: -2.48, type: 'floor' },
  
  // 18x3 PLATFORM -
  { minX: -1.5 - 0.75, maxX: 1.5 + 0.75, minZ: 7.7 - 0.75, maxZ: 33.1 + 0.75, y: -2.6, type: 'floor' }, 
  
];

// Initialize spatial grid for fast collision detection
function initializeSpatialGrid() {
  if (gridInitialized) return;
  
  spatialGrid.clear();
  
  for (const platform of platforms) {
    // Calculate which grid cells this platform overlaps
    const minGridX = Math.floor(platform.minX / GRID_SIZE);
    const maxGridX = Math.floor(platform.maxX / GRID_SIZE);
    const minGridZ = Math.floor(platform.minZ / GRID_SIZE);
    const maxGridZ = Math.floor(platform.maxZ / GRID_SIZE);
    
    for (let gx = minGridX; gx <= maxGridX; gx++) {
      for (let gz = minGridZ; gz <= maxGridZ; gz++) {
        const key = `${gx},${gz}`;
        if (!spatialGrid.has(key)) {
          spatialGrid.set(key, []);
        }
        spatialGrid.get(key)!.push(platform);
      }
    }
  }
  
  gridInitialized = true;
}

// Public warmup to avoid first-use jank
export function warmupCollisionSystem(): void {
  initializeSpatialGrid();
  // Prime a few cache positions around origin and common areas
  const samplePoints: Array<[number, number]> = [
    [0, 0],
    [1.5, 0],
    [0, -3.0],
    [3.0, 0],
    [-3.0, 0],
    [0, 1.5],
    [-1.5, 0],
    [0, 3.0],
    [1.5, 1.5],
    [-1.5, -1.5],
  ];
  for (const [x, z] of samplePoints) {
    // Intentionally ignore result; this fills caches
    getHeightAtPosition(x, z);
  }
}

// Pre-calculate common platform lookups
const commonPlatforms = new Map<string, Platform[]>();
export function preloadCommonPlatforms(): void {
  initializeSpatialGrid();
  const commonPositions = [
    [0, 0], [1.5, 0], [0, 1.5], [-1.5, 0], [0, -1.5],
    [3, 0], [0, 3], [-3, 0], [0, -3], [1.5, 1.5]
  ];
  
  for (const [x, z] of commonPositions) {
    const key = `${Math.round(x * 100) / 100},${Math.round(z * 100) / 100}`;
    if (!commonPlatforms.has(key)) {
      commonPlatforms.set(key, getPlatformsNear(x, z));
    }
  }
}

// Get platforms near a position using spatial grid
function getPlatformsNear(x: number, z: number): Platform[] {
  initializeSpatialGrid();
  
  const gridX = Math.floor(x / GRID_SIZE);
  const gridZ = Math.floor(z / GRID_SIZE);
  const key = `${gridX},${gridZ}`;
  
  return spatialGrid.get(key) || [];
}

// Cache for recent position lookups
const positionCache = new Map<string, { height: number | null, timestamp: number }>();
const CACHE_DURATION = 100; 
const MAX_CACHE_SIZE = 1000; 

// Clean old cache entries periodically
let lastCacheCleanup = 0;
function cleanupCache() {
  const now = Date.now();
  if (now - lastCacheCleanup < 5000) return; 
  
  lastCacheCleanup = now;
  const entries = Array.from(positionCache.entries());
  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_DURATION * 10) { 
      positionCache.delete(key);
    }
  }
  
  // If still too large, remove oldest entries
  if (positionCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(positionCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, positionCache.size - MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => positionCache.delete(key));
  }
}

// Helper function: Check if a point is inside a triangle using barycentric coordinates
function isPointInTriangle(px: number, pz: number, v0: {x: number, z: number}, v1: {x: number, z: number}, v2: {x: number, z: number}): boolean {
  const area = 0.5 * (-v1.z * v2.x + v0.z * (-v1.x + v2.x) + v0.x * (v1.z - v2.z) + v1.x * v2.z);
  const s = 1 / (2 * area) * (v0.z * v2.x - v0.x * v2.z + (v2.z - v0.z) * px + (v0.x - v2.x) * pz);
  const t = 1 / (2 * area) * (v0.x * v1.z - v0.z * v1.x + (v0.z - v1.z) * px + (v1.x - v0.x) * pz);
  return s >= 0 && t >= 0 && (1 - s - t) >= 0;
}

// Check if a position is on any platform and return the platform height
export function getHeightAtPosition(x: number, z: number): number | null {
  cleanupCache();
  
  // Check cache first (round to 2 decimal places for cache key)
  const cacheKey = `${Math.round(x * 100) / 100},${Math.round(z * 100) / 100}`;
  const now = Date.now();
  const cached = positionCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.height;
  }
  
  // First check if on elevator - elevator takes priority
  if (isOnElevator(x, z)) {
    const height = getElevatorHeight();
    positionCache.set(cacheKey, { height, timestamp: now });
    return height;
  }
  
  const nearbyPlatforms = getPlatformsNear(x, z);
  
  for (const platform of nearbyPlatforms) {
    // First check bounding box
    if (x >= platform.minX && x <= platform.maxX &&
        z >= platform.minZ && z <= platform.maxZ) {
      
      // If it's a triangle, do precise triangle collision check
      if (platform.type === 'triangle' && platform.triangleVertices && platform.triangleVertices.length === 3) {
        if (isPointInTriangle(x, z, platform.triangleVertices[0], platform.triangleVertices[1], platform.triangleVertices[2])) {
          positionCache.set(cacheKey, { height: platform.y, timestamp: now });
          return platform.y;
        }
      } else {
        // For rectangles/stairs, bounding box check is enough
        positionCache.set(cacheKey, { height: platform.y, timestamp: now });
        return platform.y;
      }
    }
  }
  
  positionCache.set(cacheKey, { height: null, timestamp: now });
  return null; 
}

// Constrain position to stay within platform boundaries
export function constrainToPlatform(
  newX: number, 
  newZ: number, 
  currentY: number,
  currentX: number,
  currentZ: number
): { x: number; y: number; z: number; onPlatform: boolean } {
  
  // First check if trying to move onto the elevator
  if (isOnElevator(newX, newZ)) {
    const elevatorY = getElevatorHeight();
    const heightDiff = Math.abs(elevatorY - currentY);
    
    if (heightDiff <= 1.5) {
      return { x: newX, y: elevatorY, z: newZ, onPlatform: true };
    }
  }
  
  // Use spatial grid to find nearby platforms only
  const nearbyPlatforms = getPlatformsNear(newX, newZ);
  let targetPlatform: Platform | null = null;
  
  for (const platform of nearbyPlatforms) {
    if (newX >= platform.minX && newX <= platform.maxX &&
        newZ >= platform.minZ && newZ <= platform.maxZ) {
      
      // For triangles, check precise collision
      if (platform.type === 'triangle' && platform.triangleVertices && platform.triangleVertices.length === 3) {
        if (!isPointInTriangle(newX, newZ, platform.triangleVertices[0], platform.triangleVertices[1], platform.triangleVertices[2])) {
          continue; 
        }
      }
      
      targetPlatform = platform;
      break;
    }
  }
  
  if (targetPlatform) {
    // If it's a stair, check if we're approaching from the correct direction (or opposite for going down)
    if (targetPlatform.type === 'stair' && targetPlatform.stairDirection) {
      const movementZ = newZ - currentZ;
      const movementX = newX - currentX;
      
      const validDirection = 
        (targetPlatform.stairDirection === 'south' && Math.abs(movementZ) > Math.abs(movementX) * 2) || 
        (targetPlatform.stairDirection === 'north' && Math.abs(movementZ) > Math.abs(movementX) * 2) || 
        (targetPlatform.stairDirection === 'east' && Math.abs(movementX) > Math.abs(movementZ) * 2) ||   
        (targetPlatform.stairDirection === 'west' && Math.abs(movementX) > Math.abs(movementZ) * 2);   
      
      if (!validDirection) {
        return { x: currentX, y: currentY, z: currentZ, onPlatform: false };
      }
    }
    
    const heightDiff = Math.abs(targetPlatform.y - currentY);
    
    if (heightDiff <= 1.5) {
      return { x: newX, y: targetPlatform.y, z: newZ, onPlatform: true };
    }
  }
  
  // If not on a platform or height change too large, don't allow movement
  return { x: newX, y: currentY, z: newZ, onPlatform: false };
}

// Smooth height transition for stairs
export function smoothHeightTransition(currentY: number, targetY: number, delta: number): number {
  const transitionSpeed = 8; 
  const diff = targetY - currentY;
  
  if (Math.abs(diff) < 0.01) {
    return targetY;
  }
  
  return currentY + Math.sign(diff) * Math.min(Math.abs(diff), transitionSpeed * delta);
}
