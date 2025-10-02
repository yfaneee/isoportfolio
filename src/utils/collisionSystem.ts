// Collision and boundary system for the isometric world
import { isOnElevator, getElevatorHeight, triggerElevator } from './elevatorSystem';

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
  { minX: -3.15, maxX: -2.25, minZ: -0.75, maxZ: 0.85, y: 1.05, type: 'stair', stairDirection: 'west' },
  { minX: -3.6, maxX: -2.7, minZ: -0.75, maxZ: 0.85, y: 1.35, type: 'stair', stairDirection: 'west' },
  { minX: -4.05, maxX: -3.15, minZ: -0.75, maxZ: 0.85, y: 1.65, type: 'stair', stairDirection: 'west' },
  { minX: -4.5, maxX: -3.6, minZ: -0.75, maxZ: 0.85, y: 1.95, type: 'stair', stairDirection: 'west' },
  { minX: -4.95, maxX: -4.05, minZ: -0.75, maxZ: 0.85, y: 2.25, type: 'stair', stairDirection: 'west' },
  { minX: -5.4, maxX: -4.5, minZ: -0.75, maxZ: 0.85, y: 2.55, type: 'stair', stairDirection: 'west' },
  { minX: -5.85, maxX: -5.4, minZ: -0.75, maxZ: 0.85, y: 2.85, type: 'stair', stairDirection: 'west' },
  { minX: -6.3, maxX: -5.85, minZ: -0.75, maxZ: 0.85, y: 3.15, type: 'stair', stairDirection: 'west' },
  { minX: -6.75, maxX: -6.3, minZ: -0.75, maxZ: 0.85, y: 3.25, type: 'stair', stairDirection: 'west' },
  
  // NOW THE FLOORS 
  
  // 3x3 MAIN GRID - Starting area
  { minX: -2.25, maxX: 2.25, minZ: -2.25, maxZ: 2.25, y: 0.1, type: 'floor' },
  
  // EXTENSION FLOOR 1 - Single connecting floor (south)
  { minX: -0.75, maxX: 0.75, minZ: -3.75, maxZ: -2.25, y: 0.1, type: 'floor' },
  
  // EXTENSION FLOOR 2 - Second connecting floor (south)
  { minX: -0.75, maxX: 0.75, minZ: -5.25, maxZ: -3.75, y: 0.1, type: 'floor' },
  
  // EXTENSION FLOORS TO ARTWORK PLATFORM (east) - Two floors extending right
  { minX: 3.0 - 0.75, maxX: 3.0 + 0.75, minZ: -0.75, maxZ: 0.75, y: 0.1, type: 'floor' }, 
  // floor-from-6-2 at x=4.5 is the ELEVATOR - handled by elevatorSystem.ts!
  
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
  { minX: -3.55, maxX: 3.55, minZ: -9.3, maxZ: -5.25, y: 0.1, type: 'floor' },
  
  // SECOND WALL BLOCKS - Medium height wall (smaller tall blocks)
  { minX: -3.75, maxX: 3.55, minZ: -10.4, maxZ: -9.6, y: 1.6, type: 'floor' },
  
  // TALL WALL BLOCKS - Top surface (walkable on top of the highest blocks)
  { minX: -3.75, maxX: 3.45, minZ: -12.35, maxZ: -11.55, y: 3.25, type: 'floor' },
  
  // LEARNING OUTCOMES PLATFORM - 
  { minX: -7.08 - 0.75, maxX: -7.08 + 0.75, minZ: 0 - 0.75, maxZ: 0 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -8.58 - 0.75, maxX: -8.58 + 0.75, minZ: 0 - 0.75, maxZ: 0 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -8.58 - 0.75, maxX: -8.58 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.5 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -8.58 - 0.75, maxX: -8.58 + 0.75, minZ: 1.5 - 0.75, maxZ: 1.5 + 0.75, y: 3.1, type: 'floor' }, 
  
  // Triangles (RIGHT ANGLE triangles, 1.5 units on two sides) - from learningOutcomesPlatform.triangles
  { minX: -8.58, maxX: -7.08, minZ: 0, maxZ: 1.5, y: 3.1, type: 'triangle', 
    triangleVertices: [{x: -7.08, z: 0}, {x: -8.58, z: 0}, {x: -7.08, z: 1.5}] },
  { minX: -8.58, maxX: -7.08, minZ: -1.5, maxZ: 0, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -7.08, z: 0}, {x: -8.58, z: 0}, {x: -7.08, z: -1.5}] }, 
  { minX: -10.08, maxX: -8.58, minZ: 1.5, maxZ: 3.0, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -8.58, z: 1.5}, {x: -10.08, z: 3.0}, {x: -8.58, z: 3.0}] }, 
  { minX: -10.08, maxX: -8.58, minZ: -3.0, maxZ: -1.5, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -8.58, z: -1.5}, {x: -10.08, z: -3.0}, {x: -8.58, z: -3.0}] },
  { minX: -11.58, maxX: -10.08, minZ: 3.0, maxZ: 4.5, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -10.08, z: 3.0}, {x: -11.58, z: 4.5}, {x: -10.08, z: 4.5}] }, 
  { minX: -11.58, maxX: -10.08, minZ: -4.5, maxZ: -3.0, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -10.08, z: -3.0}, {x: -11.58, z: -4.5}, {x: -10.08, z: -4.5}] },
  
  // Fill floors (2 tiles) - from learningOutcomesPlatform.fillFloors
  { minX: -10.08 - 0.75, maxX: -10.08 + 0.75, minZ: 3.0 - 0.75, maxZ: 3.0 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -10.08 - 0.75, maxX: -10.08 + 0.75, minZ: -3.0 - 0.75, maxZ: -3.0 + 0.75, y: 3.1, type: 'floor' }, 
  
  // Extension floors (4 tiles) - from learningOutcomesPlatform.extensionFloors
  { minX: -11.58 - 0.75, maxX: -11.58 + 0.75, minZ: 4.5 - 0.75, maxZ: 4.5 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -11.58 - 0.75, maxX: -11.58 + 0.75, minZ: 3.0 - 0.75, maxZ: 3.0 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -11.58 - 0.75, maxX: -11.58 + 0.75, minZ: -4.5 - 0.75, maxZ: -4.5 + 0.75, y: 3.1, type: 'floor' },
  { minX: -11.58 - 0.75, maxX: -11.58 + 0.75, minZ: -3.0 - 0.75, maxZ: -3.0 + 0.75, y: 3.1, type: 'floor' },
  
  // Continuation pattern floors - from learningOutcomesPlatform.continuationPattern (only 'floor' type)
  { minX: -13.08 - 0.75, maxX: -13.08 + 0.75, minZ: 3.0 - 0.75, maxZ: 3.0 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -14.58 - 0.75, maxX: -14.58 + 0.75, minZ: 1.5 - 0.75, maxZ: 1.5 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -14.58 - 0.75, maxX: -14.58 + 0.75, minZ: 0 - 0.75, maxZ: 0 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -16.08 - 0.75, maxX: -16.08 + 0.75, minZ: 0 - 0.75, maxZ: 0 + 0.75, y: 3.1, type: 'floor' }, 
  { minX: -14.58 - 0.75, maxX: -14.58 + 0.75, minZ: -1.5 - 0.75, maxZ: -1.5 + 0.75, y: 3.1, type: 'floor' },
  { minX: -13.08 - 0.75, maxX: -13.08 + 0.75, minZ: -3.0 - 0.75, maxZ: -3.0 + 0.75, y: 3.1, type: 'floor' }, 
  
  // Continuation pattern triangles - from learningOutcomesPlatform.continuationPattern (only 'triangle' type)
  { minX: -13.08, maxX: -11.58, minZ: 3.0, maxZ: 4.5, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -11.58, z: 3.0}, {x: -13.08, z: 4.5}, {x: -13.08, z: 3.0}] },
  { minX: -14.58, maxX: -13.08, minZ: 1.5, maxZ: 3.0, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -13.08, z: 1.5}, {x: -14.58, z: 3.0}, {x: -14.58, z: 1.5}] }, 
  { minX: -16.08, maxX: -14.58, minZ: 0, maxZ: 1.5, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -14.58, z: 0}, {x: -16.08, z: 1.5}, {x: -16.08, z: 0}] }, 
  { minX: -14.58, maxX: -13.08, minZ: 1.5, maxZ: 3.0, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -13.08, z: 3.0}, {x: -14.58, z: 1.5}, {x: -13.08, z: 1.5}] },
  { minX: -16.08, maxX: -14.58, minZ: -1.5, maxZ: 0, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -14.58, z: 0}, {x: -16.08, z: -1.5}, {x: -16.08, z: 0}] }, 
  { minX: -14.58, maxX: -13.08, minZ: -3.0, maxZ: -1.5, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -13.08, z: -1.5}, {x: -14.58, z: -3.0}, {x: -14.58, z: -1.5}] }, 
  { minX: -13.08, maxX: -11.58, minZ: -4.5, maxZ: -3.0, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -11.58, z: -3.0}, {x: -13.08, z: -4.5}, {x: -13.08, z: -3.0}] }, 
  { minX: -14.58, maxX: -13.08, minZ: -3.0, maxZ: -1.5, y: 3.1, type: 'triangle',
    triangleVertices: [{x: -13.08, z: -3.0}, {x: -14.58, z: -1.5}, {x: -13.08, z: -1.5}] },
];

// Helper function: Check if a point is inside a triangle using barycentric coordinates
function isPointInTriangle(px: number, pz: number, v0: {x: number, z: number}, v1: {x: number, z: number}, v2: {x: number, z: number}): boolean {
  const area = 0.5 * (-v1.z * v2.x + v0.z * (-v1.x + v2.x) + v0.x * (v1.z - v2.z) + v1.x * v2.z);
  const s = 1 / (2 * area) * (v0.z * v2.x - v0.x * v2.z + (v2.z - v0.z) * px + (v0.x - v2.x) * pz);
  const t = 1 / (2 * area) * (v0.x * v1.z - v0.z * v1.x + (v0.z - v1.z) * px + (v1.x - v0.x) * pz);
  return s >= 0 && t >= 0 && (1 - s - t) >= 0;
}

// Check if a position is on any platform and return the platform height
export function getHeightAtPosition(x: number, z: number): number | null {
  // First check if on elevator - elevator takes priority
  if (isOnElevator(x, z)) {
    return getElevatorHeight();
  }
  
  for (const platform of platforms) {
    // First check bounding box
    if (x >= platform.minX && x <= platform.maxX &&
        z >= platform.minZ && z <= platform.maxZ) {
      
      // If it's a triangle, do precise triangle collision check
      if (platform.type === 'triangle' && platform.triangleVertices && platform.triangleVertices.length === 3) {
        if (isPointInTriangle(x, z, platform.triangleVertices[0], platform.triangleVertices[1], platform.triangleVertices[2])) {
          return platform.y;
        }
      } else {
        // For rectangles/stairs, bounding box check is enough
        return platform.y;
      }
    }
  }
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
  
  // Find the platform at the new position
  let targetPlatform: Platform | null = null;
  for (const platform of platforms) {
    if (newX >= platform.minX && newX <= platform.maxX &&
        newZ >= platform.minZ && newZ <= platform.maxZ) {
      targetPlatform = platform;
      break;
    }
  }
  
  if (targetPlatform) {
    // If it's a stair, check if we're approaching from the correct direction (or opposite for going down)
    if (targetPlatform.type === 'stair' && targetPlatform.stairDirection) {
      const movementZ = newZ - currentZ;
      const movementX = newX - currentX;
      
      // Check if movement is primarily along the stair axis (up OR down), NOT from the sides
      const validDirection = 
        (targetPlatform.stairDirection === 'south' && Math.abs(movementZ) > Math.abs(movementX) * 2) || 
        (targetPlatform.stairDirection === 'north' && Math.abs(movementZ) > Math.abs(movementX) * 2) || 
        (targetPlatform.stairDirection === 'east' && Math.abs(movementX) > Math.abs(movementZ) * 2) ||   
        (targetPlatform.stairDirection === 'west' && Math.abs(movementX) > Math.abs(movementZ) * 2);   
      
      if (!validDirection) {
        // Trying to climb stairs from wrong direction (perpendicular/diagonal) - block movement
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
  const transitionSpeed = 3; 
  const diff = targetY - currentY;
  
  if (Math.abs(diff) < 0.01) {
    return targetY;
  }
  
  return currentY + Math.sign(diff) * Math.min(Math.abs(diff), transitionSpeed * delta);
}
