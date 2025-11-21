// Collision and boundary system for the isometric world
import { isOnElevator, getElevatorHeight } from './elevatorSystem';

const GRID_SIZE = 1.5; 
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
  staircaseId?: string; 
}

//Define staircase boundaries
interface Staircase {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
  steps: Platform[];
}

const staircases: Staircase[] = [
  // LEFT STAIRS TO TALL WALL
  {
    id: 'left-wall',
    minX: -3.75,
    maxX: -2.25,
    minZ: -10.8,
    maxZ: -7.3,
    minY: 0.85,
    maxY: 3.25,
    steps: []
  },
  // MIDDLE STAIRS TO SECOND WALL
  {
    id: 'middle-wall',
    minX: -0.75,
    maxX: 0.75,
    minZ: -9.45,
    maxZ: -7.55,
    minY: 0.65,
    maxY: 1.75,
    steps: []
  },
  // STAIRS TO LEARNING OUTCOMES PLATFORM
  {
    id: 'learning-outcomes',
    minX: -6.6,
    maxX: -1.65,
    minZ: -0.75,
    maxZ: 0.85,
    minY: 0.45,
    maxY: 3.0,
    steps: []
  },
  // DOWNWARD STAIRS
  {
    id: 'downward',
    minX: -0.75,
    maxX: 0.75,
    minZ: 2.05,
    maxZ: 7.05,
    minY: -2.6,
    maxY: -0.2,
    steps: []
  }
];

// Define all walkable areas - STAIRS FIRST (they override floors beneath them)
export const platforms: Platform[] = [
  // LEFT STAIRS TO TALL WALL (19 steps - doubled for smoother movement) 
  { minX: -3.75, maxX: -2.25, minZ: -7.7, maxZ: -7.3, y: 0.45, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -7.85, maxZ: -7.45, y: 0.60, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -8, maxZ: -7.6, y: 0.75, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -8.15, maxZ: -7.75, y: 0.90, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -8.3, maxZ: -7.9, y: 1.05, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -8.45, maxZ: -8.05, y: 1.20, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -8.6, maxZ: -8.2, y: 1.35, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -8.75, maxZ: -8.35, y: 1.50, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -8.9, maxZ: -8.5, y: 1.65, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -9.05, maxZ: -8.65, y: 1.80, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -9.2, maxZ: -8.8, y: 1.95, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -9.35, maxZ: -8.95, y: 2.10, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -9.5, maxZ: -9.1, y: 2.25, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -9.65, maxZ: -9.25, y: 2.40, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -9.8, maxZ: -9.4, y: 2.55, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -9.95, maxZ: -9.55, y: 2.70, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -10.1, maxZ: -9.7, y: 2.85, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -10.25, maxZ: -9.85, y: 3.00, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  { minX: -3.75, maxX: -2.25, minZ: -11.4, maxZ: -10, y: 3.15, type: 'stair', stairDirection: 'south', staircaseId: 'left-wall' },
  
  // CONNECTION from left stairs to tall wall blocks
  { minX: -3.75, maxX: -2.25, minZ: -11.55, maxZ: -10.8, y: 3.25, type: 'floor' },
  
  // MIDDLE STAIRS TO SECOND WALL (9 steps - doubled for smoother movement) - Going SOUTH (negative Z)
  { minX: -0.75, maxX: 0.75, minZ: -7.9, maxZ: -7.45, y: 0.45, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -8.05, maxZ: -7.625, y: 0.60, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -8.2, maxZ: -7.8, y: 0.75, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -8.35, maxZ: -7.95, y: 0.90, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -8.5, maxZ: -8.1, y: 1.05, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -8.65, maxZ: -8.25, y: 1.20, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -8.8, maxZ: -8.4, y: 1.35, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -8.9, maxZ: -8.55, y: 1.50, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  { minX: -0.75, maxX: 0.75, minZ: -9.6, maxZ: -8.7, y: 1.65, type: 'stair', stairDirection: 'south', staircaseId: 'middle-wall' },
  
  // CONNECTION from middle stairs to second wall blocks
  { minX: -0.75, maxX: 0.75, minZ: -9.6, maxZ: -9.45, y: 1.6, type: 'floor' },
  
  // STAIRS TO LEARNING OUTCOMES PLATFORM (17 steps - doubled for smoother movement) going WEST
  { minX: -2.25, maxX: -1.75, minZ: -0.75, maxZ: 0.75, y: 0.45, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -2.475, maxX: -1.975, minZ: -0.75, maxZ: 0.75, y: 0.60, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -2.7, maxX: -2.2, minZ: -0.75, maxZ: 0.75, y: 0.75, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -2.925, maxX: -2.425, minZ: -0.75, maxZ: 0.75, y: 0.90, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -3.15, maxX: -2.65, minZ: -0.75, maxZ: 0.75, y: 1.05, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -3.375, maxX: -2.875, minZ: -0.75, maxZ: 0.75, y: 1.20, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -3.6, maxX: -3.1, minZ: -0.75, maxZ: 0.75, y: 1.35, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -3.825, maxX: -3.325, minZ: -0.75, maxZ: 0.75, y: 1.50, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -4.05, maxX: -3.55, minZ: -0.75, maxZ: 0.75, y: 1.65, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -4.275, maxX: -3.775, minZ: -0.75, maxZ: 0.75, y: 1.80, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -4.5, maxX: -4, minZ: -0.75, maxZ: 0.75, y: 1.95, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -4.725, maxX: -4.225, minZ: -0.75, maxZ: 0.75, y: 2.10, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -4.95, maxX: -4.45, minZ: -0.75, maxZ: 0.75, y: 2.25, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -5.175, maxX: -4.675, minZ: -0.75, maxZ: 0.75, y: 2.40, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -5.4, maxX: -4.9, minZ: -0.75, maxZ: 0.75, y: 2.55, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -5.7, maxX: -5.125, minZ: -0.75, maxZ: 0.75, y: 2.70, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },
  { minX: -7, maxX: -5.35, minZ: -0.75, maxZ: 0.75, y: 2.85, type: 'stair', stairDirection: 'west', staircaseId: 'learning-outcomes' },

  
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
  
  // DOWNWARD STAIRS - Doubled for smoother movement (17 steps total)
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 2.80 - 0.75, maxZ: 2.6 + 0.75, y: -0.2, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 3.8 - 0.75, maxZ: 2.825 + 0.75, y: -0.335, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4.05 - 0.75, maxZ: 3.05 + 0.75, y: -0.47, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4.275 - 0.75, maxZ: 3.275 + 0.75, y: -0.635, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4.50 - 0.75, maxZ: 3.5 + 0.75, y: -0.8, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4.725 - 0.75, maxZ: 3.725 + 0.75, y: -0.95, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 4.95 - 0.75, maxZ: 3.95 + 0.75, y: -1.1, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 5.175 - 0.75, maxZ: 4.175 + 0.75, y: -1.25, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 5.4 - 0.75, maxZ: 4.4 + 0.75, y: -1.4, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 5.625 - 0.75, maxZ: 4.625 + 0.75, y: -1.55, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 5.85 - 0.75, maxZ: 4.85 + 0.75, y: -1.7, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 6.075 - 0.75, maxZ: 5.075 + 0.75, y: -1.85, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 6.3 - 0.75, maxZ: 5.3 + 0.75, y: -2.0, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 6.525 - 0.75, maxZ: 5.525 + 0.75, y: -2.15, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 6.75 - 0.75, maxZ: 5.75 + 0.75, y: -2.3, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 6.975 - 0.75, maxZ: 5.975 + 0.75, y: -2.45, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  { minX: 0 - 0.75, maxX: 0 + 0.75, minZ: 7.2 - 0.75, maxZ: 6.2 + 0.75, y: -2.6, type: 'stair', stairDirection: 'south', staircaseId: 'downward' },
  
  // PROJECT SLABS on 18x3 platform (4 interactive slabs) - MOVED SOUTH towards platform edge
  { minX: 1.2 - 0.45, maxX: 1.2 + 0.45, minZ: 7.65 + 2 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 2 * 1.5 - 1.5 + 0.45, y: -2.47, type: 'floor' },  
  { minX: 1.2 - 0.45, maxX: 1.2 + 0.45, minZ: 7.65 + 7 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 7 * 1.5 - 1.5 + 0.45, y: -2.48, type: 'floor' }, 
  { minX: 1.2 - 0.45, maxX: 1.2 + 0.45, minZ: 7.65 + 12 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 12 * 1.5 - 1.5 + 0.45, y: -2.48, type: 'floor' },
  { minX: 1.2 - 0.45, maxX: 1.2 + 0.45, minZ: 7.65 + 17 * 1.5 - 1.5 - 0.45, maxZ: 7.65 + 17 * 1.5 - 1.5 + 0.45, y: -2.48, type: 'floor' },
  
  // NEW OUTLINE BUTTON SLABS for website interaction - positioned in front of billboards
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

// Pre-calculate common platform lookups with expanded coverage
const commonPlatforms = new Map<string, Platform[]>();
export function preloadCommonPlatforms(): void {
  initializeSpatialGrid();
  // Expanded common positions to cover more of the world
  const commonPositions = [
    [0, 0], [1.5, 0], [0, 1.5], [-1.5, 0], [0, -1.5],
    [3, 0], [0, 3], [-3, 0], [0, -3], [1.5, 1.5],
    [-1.5, -1.5], [4.5, 0], [0, 4.5], [-4.5, 0], [0, -4.5],
    // Key interactive areas
    [-1.5, -10.4], [3, -12], [10.5, 0], [-10.625, 1.5], [-13.625, 1.5]
  ];
  
  for (const [x, z] of commonPositions) {
    const key = `${Math.round(x * 100) / 100},${Math.round(z * 100) / 100}`;
    if (!commonPlatforms.has(key)) {
      commonPlatforms.set(key, getPlatformsNear(x, z));
    }
  }
  
  // Also preload height cache for these positions
  for (const [x, z] of commonPositions) {
    getHeightAtPosition(x, z);
  }
}

// Get platforms near a position using spatial grid - optimized neighbor checking
function getPlatformsNear(x: number, z: number): Platform[] {
  initializeSpatialGrid();
  
  const gridX = Math.floor(x / GRID_SIZE);
  const gridZ = Math.floor(z / GRID_SIZE);
  
  // Start with current cell
  const currentKey = `${gridX},${gridZ}`;
  const platforms: Platform[] = [];
  const currentPlatforms = spatialGrid.get(currentKey);
  
  if (currentPlatforms) {
    platforms.push(...currentPlatforms);
  }
  
  // Only check neighbors if we're near cell edges (optimization)
  const cellCenterX = (gridX + 0.5) * GRID_SIZE;
  const cellCenterZ = (gridZ + 0.5) * GRID_SIZE;
  const distFromCenterX = Math.abs(x - cellCenterX);
  const distFromCenterZ = Math.abs(z - cellCenterZ);
  
  if (distFromCenterX > GRID_SIZE * 0.3 || distFromCenterZ > GRID_SIZE * 0.3) {
    const neighborCells = [
      `${gridX-1},${gridZ}`,
      `${gridX+1},${gridZ}`,
      `${gridX},${gridZ-1}`,
      `${gridX},${gridZ+1}`
    ];
    
    for (const key of neighborCells) {
      const cellPlatforms = spatialGrid.get(key);
      if (cellPlatforms) {
        platforms.push(...cellPlatforms);
      }
    }
  }
  
  return platforms;
}

// Optimized cache for recent position lookups with improved performance
const positionCache = new Map<string, { height: number | null, timestamp: number, accessCount: number }>();
const CACHE_DURATION = 300; 
const CLEANUP_THRESHOLD = 1200; 

let lastCacheCleanup = 0;
function cleanupCache() {
  const now = Date.now();
  // Only cleanup every 90 seconds (reduced frequency)
  if (now - lastCacheCleanup < 90000) return; 
  
  lastCacheCleanup = now;
  
  if (positionCache.size < CLEANUP_THRESHOLD) return;
  
  // Improved LRU-style cleanup with better scoring
  const entries = Array.from(positionCache.entries());
  // Prioritize recently accessed and frequently accessed entries
  entries.sort((a, b) => {
    const ageA = now - a[1].timestamp;
    const ageB = now - b[1].timestamp;
    const scoreA = a[1].accessCount / (ageA / 1000 + 1); 
    const scoreB = b[1].accessCount / (ageB / 1000 + 1);
    return scoreA - scoreB; 
  });
  
  // Remove bottom 25% of entries (less aggressive)
  const toRemove = Math.floor(entries.length * 0.25);
  
  for (let i = 0; i < toRemove; i++) {
    positionCache.delete(entries[i][0]);
  }
  
  // Reset access counts for remaining entries to prevent overflow
  positionCache.forEach((value) => {
    value.accessCount = Math.max(1, Math.floor(value.accessCount * 0.85));
  });
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
  // Use cache with reduced precision for better hit rate 
  const cacheKey = `${Math.round(x * 10) / 10},${Math.round(z * 10) / 10}`;
  const now = Date.now();
  const cached = positionCache.get(cacheKey);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    cached.accessCount++;
    // Don't update timestamp on every hit to reduce write operations
    if (now - cached.timestamp > CACHE_DURATION * 0.5) {
      cached.timestamp = now;
    }
    return cached.height;
  }
  
  // Cleanup cache only when significantly over threshold
  if (positionCache.size > CLEANUP_THRESHOLD + 200) {
    cleanupCache();
  }
  
  // First check if on elevator 
  if (isOnElevator(x, z)) {
    const height = getElevatorHeight();
    positionCache.set(cacheKey, { height, timestamp: now, accessCount: 1 });
    return height;
  }
  
  const nearbyPlatforms = getPlatformsNear(x, z);
  
  // Early exit if no nearby platforms
  if (nearbyPlatforms.length === 0) {
    positionCache.set(cacheKey, { height: null, timestamp: now, accessCount: 1 });
    return null;
  }
  
  for (const platform of nearbyPlatforms) {
    // First check bounding box
    if (x >= platform.minX && x <= platform.maxX &&
        z >= platform.minZ && z <= platform.maxZ) {
      
      if (platform.type === 'triangle' && platform.triangleVertices && platform.triangleVertices.length === 3) {
        if (isPointInTriangle(x, z, platform.triangleVertices[0], platform.triangleVertices[1], platform.triangleVertices[2])) {
          positionCache.set(cacheKey, { height: platform.y, timestamp: now, accessCount: 1 });
          return platform.y;
        }
      } else {
        positionCache.set(cacheKey, { height: platform.y, timestamp: now, accessCount: 1 });
        return platform.y;
      }
    }
  }
  
  positionCache.set(cacheKey, { height: null, timestamp: now, accessCount: 1 });
  return null; 
}

// Check if character is on a staircase
function getStaircaseAt(x: number, z: number, y: number): Staircase | null {
  for (const staircase of staircases) {
    if (x >= staircase.minX && x <= staircase.maxX &&
        z >= staircase.minZ && z <= staircase.maxZ &&
        y >= staircase.minY - 0.5 && y <= staircase.maxY + 0.5) {
      return staircase;
    }
  }
  return null;
}

// Clamp position to staircase bounds
function clampToStaircase(x: number, z: number, staircase: Staircase): { x: number; z: number } {
  return {
    x: Math.max(staircase.minX, Math.min(staircase.maxX, x)),
    z: Math.max(staircase.minZ, Math.min(staircase.maxZ, z))
  };
}

// Constrain position to stay within platform boundaries
export function constrainToPlatform(
  newX: number, 
  newZ: number, 
  currentY: number,
  currentX: number,
  currentZ: number
): { x: number; y: number; z: number; onPlatform: boolean; slideX?: number; slideZ?: number } {
  
  const currentHeight = getHeightAtPosition(currentX, currentZ);
  if (currentHeight === null) {
    console.warn('Character in invalid position, blocking movement', { currentX, currentZ });
    return { x: currentX, y: currentY, z: currentZ, onPlatform: true };
  } 

  // First check if trying to move onto the elevator
  if (isOnElevator(newX, newZ)) {
    const elevatorY = getElevatorHeight();
    const heightDiff = Math.abs(elevatorY - currentY);
    
    if (heightDiff <= 1.5) {
      return { x: newX, y: elevatorY, z: newZ, onPlatform: true };
    }
  }
  
  // ========== NEW STAIRCASE SYSTEM ==========
  const currentStaircase = getStaircaseAt(currentX, currentZ, currentY);
  
  if (currentStaircase) {
    // Check if trying to exit the staircase
    const isExiting = newX < currentStaircase.minX || newX > currentStaircase.maxX ||
                      newZ < currentStaircase.minZ || newZ > currentStaircase.maxZ;
    
    if (isExiting) {
      const exitHeight = getHeightAtPosition(newX, newZ);
      
      if (exitHeight !== null) {
        const heightDiff = Math.abs(exitHeight - currentY);
        
        if (heightDiff <= 0.5) {
          return { x: newX, y: exitHeight, z: newZ, onPlatform: true };
        }
      }
      
      return { x: currentX, y: currentY, z: currentZ, onPlatform: true };
    }
    
    // Still within staircase 
    const clampedPos = clampToStaircase(newX, newZ, currentStaircase);
    const targetHeight = getHeightAtPosition(clampedPos.x, clampedPos.z);
    
    if (targetHeight !== null) {
      const heightDiff = Math.abs(targetHeight - currentY);
      
      if (heightDiff <= 0.5) {
        return { x: clampedPos.x, y: targetHeight, z: clampedPos.z, onPlatform: true };
      }
    }
    
    // If height difference too large, block movement
    return { x: currentX, y: currentY, z: currentZ, onPlatform: true };
  }
  
  // ========== REGULAR PLATFORM SYSTEM (non-stairs) ==========
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
    // If trying to enter a staircase
    if (targetPlatform.type === 'stair' && targetPlatform.staircaseId) {
      const staircaseId = targetPlatform.staircaseId;
      const targetStaircase = staircases.find(s => s.id === staircaseId);
      
      if (targetStaircase) {
        const heightDiff = Math.abs(targetPlatform.y - currentY);
        
        // Only allow entering stairs if at the entrance
        if (heightDiff > 0.5) {
          return { x: currentX, y: currentY, z: currentZ, onPlatform: true };
        }
      }
    }
    
    const heightDiff = Math.abs(targetPlatform.y - currentY);
    
    // Allow reasonable height changes
    if (heightDiff <= 2.0) {
      return { x: newX, y: targetPlatform.y, z: newZ, onPlatform: true };
    } else {
      return { x: currentX, y: currentY, z: currentZ, onPlatform: true };
    }
  }
  
  // Try to stay on current platform if possible
  const currentPlatforms = getPlatformsNear(currentX, currentZ);
  const currentPlatform = currentPlatforms.find(platform => {
    if (currentX >= platform.minX && currentX <= platform.maxX &&
        currentZ >= platform.minZ && currentZ <= platform.maxZ) {
      
      // For triangles, check precise collision
      if (platform.type === 'triangle' && platform.triangleVertices && platform.triangleVertices.length === 3) {
        return isPointInTriangle(currentX, currentZ, platform.triangleVertices[0], platform.triangleVertices[1], platform.triangleVertices[2]);
      }
      return true;
    }
    return false;
  });
  
  if (currentPlatform) {
    const moveX = newX - currentX;
    const moveZ = newZ - currentZ;
    
    // Try sliding along X axis 
    const slideX = currentX + moveX;
    const slideZ = currentZ;
    
    // Check if sliding along X is valid and stays on current platform
    if (slideX >= currentPlatform.minX && slideX <= currentPlatform.maxX &&
        slideZ >= currentPlatform.minZ && slideZ <= currentPlatform.maxZ) {
      
      // For triangles, check precise collision
      if (currentPlatform.type === 'triangle' && currentPlatform.triangleVertices && currentPlatform.triangleVertices.length === 3) {
        if (isPointInTriangle(slideX, slideZ, currentPlatform.triangleVertices[0], currentPlatform.triangleVertices[1], currentPlatform.triangleVertices[2])) {
          return { x: slideX, y: currentY, z: slideZ, onPlatform: true, slideX: moveX, slideZ: 0 };
        }
      } else {
        return { x: slideX, y: currentY, z: slideZ, onPlatform: true, slideX: moveX, slideZ: 0 };
      }
    }
    
    // Try sliding along Z axis (keep Z movement, zero X movement)
    const slideX2 = currentX;
    const slideZ2 = currentZ + moveZ;
    
    // Check if sliding along Z is valid and stays on current platform
    if (slideX2 >= currentPlatform.minX && slideX2 <= currentPlatform.maxX &&
        slideZ2 >= currentPlatform.minZ && slideZ2 <= currentPlatform.maxZ) {
      
      // For triangles, check precise collision
      if (currentPlatform.type === 'triangle' && currentPlatform.triangleVertices && currentPlatform.triangleVertices.length === 3) {
        if (isPointInTriangle(slideX2, slideZ2, currentPlatform.triangleVertices[0], currentPlatform.triangleVertices[1], currentPlatform.triangleVertices[2])) {
          return { x: slideX2, y: currentY, z: slideZ2, onPlatform: true, slideX: 0, slideZ: moveZ };
        }
      } else {
        return { x: slideX2, y: currentY, z: slideZ2, onPlatform: true, slideX: 0, slideZ: moveZ };
      }
    }
    
    // If neither sliding direction works, just don't move (invisible wall effect)
    return { x: currentX, y: currentY, z: currentZ, onPlatform: true };
  }
  
  // If we're not on any platform, don't allow any movement
  return { x: currentX, y: currentY, z: currentZ, onPlatform: true };
}

export function smoothHeightTransition(currentY: number, targetY: number, delta: number): number {
  const diff = targetY - currentY;
  const absDiff = Math.abs(diff);
  
  // Snap instantly if very close to prevent micro-twitching
  if (absDiff < 0.006) {
    return targetY;
  }
  
  const isClimbingUp = diff > 0;
  const transitionSpeed = isClimbingUp ? 12 : 8; 
  
  // Simple lerp with adjusted speed
  const lerpFactor = Math.min(1.0, delta * transitionSpeed);
  return currentY + diff * lerpFactor;
}
