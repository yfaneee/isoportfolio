// Collision and boundary system for the isometric world
import { isOnElevator, getElevatorHeight } from './elevatorSystem';
import { SOCIAL_SLABS, SOCIAL_WALL_EXTENSION_DEPTH, WEBSITE_SLABS, WORK_PLATFORM_END_Z } from '../data/InteractionZones';

const GRID_SIZE = 1.5;
const spatialGrid: Map<number, Platform[]> = new Map();
let gridInitialized = false;

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
  
  // SOCIAL LINK BUTTONS - On top of the tall wall
  ...SOCIAL_SLABS.map((slab): Platform => (
    { minX: slab.x - 0.45, maxX: slab.x + 0.45, minZ: slab.z - 0.45, maxZ: slab.z + 0.45, y: 3.43, type: 'floor' }
  )),
  
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
  
  // TALL WALL BLOCKS - Top surface (walkable on top of the highest blocks), including the social links extension
  { minX: -3.75, maxX: 3.45, minZ: -12.35 - SOCIAL_WALL_EXTENSION_DEPTH, maxZ: -11.55, y: 3.25, type: 'floor' },
  
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
  
  // OUTLINE BUTTON SLABS - one in front of each billboard
  ...WEBSITE_SLABS.map((slab): Platform => (
    { minX: slab.x - 0.45, maxX: slab.x + 0.45, minZ: slab.z - 0.45, maxZ: slab.z + 0.45, y: -2.48, type: 'floor' }
  )),

  // WORK PLATFORM - collision length follows WORK_PLATFORM_ROWS
  { minX: -1.5 - 0.75, maxX: 1.5 + 0.75, minZ: 7.7 - 0.75, maxZ: WORK_PLATFORM_END_Z - 0.05 + 0.75, y: -2.6, type: 'floor' },
  
];

// Numeric cell key, so lookups don't build strings every frame
const cellKey = (gx: number, gz: number) => (gx + 4096) * 8192 + (gz + 4096);

// Initialize spatial grid for fast collision detection
function initializeSpatialGrid() {
  if (gridInitialized) return;

  spatialGrid.clear();

  // Platforms are pushed in list order, so each cell keeps the list's priority (stairs before floors)
  for (const platform of platforms) {
    // Calculate which grid cells this platform overlaps
    const minGridX = Math.floor(platform.minX / GRID_SIZE);
    const maxGridX = Math.floor(platform.maxX / GRID_SIZE);
    const minGridZ = Math.floor(platform.minZ / GRID_SIZE);
    const maxGridZ = Math.floor(platform.maxZ / GRID_SIZE);

    for (let gx = minGridX; gx <= maxGridX; gx++) {
      for (let gz = minGridZ; gz <= maxGridZ; gz++) {
        const key = cellKey(gx, gz);
        let cell = spatialGrid.get(key);
        if (!cell) {
          cell = [];
          spatialGrid.set(key, cell);
        }
        cell.push(platform);
      }
    }
  }

  gridInitialized = true;
}

// Build the spatial grid up front so the first step doesn't pay for it
export function preloadCommonPlatforms(): void {
  initializeSpatialGrid();
}

// Helper function: Check if a point is inside a triangle using barycentric coordinates
function isPointInTriangle(px: number, pz: number, v0: {x: number, z: number}, v1: {x: number, z: number}, v2: {x: number, z: number}): boolean {
  const area = 0.5 * (-v1.z * v2.x + v0.z * (-v1.x + v2.x) + v0.x * (v1.z - v2.z) + v1.x * v2.z);
  const s = 1 / (2 * area) * (v0.z * v2.x - v0.x * v2.z + (v2.z - v0.z) * px + (v0.x - v2.x) * pz);
  const t = 1 / (2 * area) * (v0.x * v1.z - v0.z * v1.x + (v0.z - v1.z) * px + (v1.x - v0.x) * pz);
  return s >= 0 && t >= 0 && (1 - s - t) >= 0;
}

const containsPoint = (platform: Platform, x: number, z: number): boolean => {
  if (x < platform.minX || x > platform.maxX || z < platform.minZ || z > platform.maxZ) return false;
  const tri = platform.triangleVertices;
  if (platform.type === 'triangle' && tri && tri.length === 3) {
    return isPointInTriangle(x, z, tri[0], tri[1], tri[2]);
  }
  return true;
};

// The highest-priority platform under a point (elevator not included). Any platform that
// contains the point overlaps the point's grid cell, so that one cell is all we need to scan.
export function getPlatformAt(x: number, z: number): Platform | null {
  initializeSpatialGrid();
  const cell = spatialGrid.get(cellKey(Math.floor(x / GRID_SIZE), Math.floor(z / GRID_SIZE)));
  if (!cell) return null;
  for (let i = 0; i < cell.length; i++) {
    if (containsPoint(cell[i], x, z)) return cell[i];
  }
  return null;
}

// Check if a position is on any platform and return the platform height (exact, no caching)
export function getHeightAtPosition(x: number, z: number): number | null {
  if (isOnElevator(x, z)) return getElevatorHeight();
  const platform = getPlatformAt(x, z);
  return platform ? platform.y : null;
}

// ---------------------------------------------------------------------------
// Visual ground height. Stairs are flat steps for collision, but the character
// should glide up them like a ramp, so near a staircase the height is averaged
// over a short window along the stair's axis (a box filter turns steps into a slope).
// ---------------------------------------------------------------------------

const RAMP_SAMPLE_OFFSETS = [-0.12, -0.06, 0.06, 0.12];
const RAMP_MAX_STEP = 0.5; // same limit the collision uses for stepping on and off stairs

interface StairZone { minX: number; maxX: number; minZ: number; maxZ: number; axis: 'x' | 'z' }

const stairZones: StairZone[] = staircases.map(staircase => {
  const steps = platforms.filter(p => p.staircaseId === staircase.id);
  const dir = steps[0]?.stairDirection;
  const margin = 0.15;
  return {
    minX: Math.min(staircase.minX, ...steps.map(s => s.minX)) - margin,
    maxX: Math.max(staircase.maxX, ...steps.map(s => s.maxX)) + margin,
    minZ: Math.min(staircase.minZ, ...steps.map(s => s.minZ)) - margin,
    maxZ: Math.max(staircase.maxZ, ...steps.map(s => s.maxZ)) + margin,
    axis: dir === 'east' || dir === 'west' ? 'x' : 'z'
  };
});

export function getVisualGroundHeight(x: number, z: number, groundY: number): number {
  if (isOnElevator(x, z)) return groundY;

  let axis: 'x' | 'z' | null = null;
  for (const zone of stairZones) {
    if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
      axis = zone.axis;
      break;
    }
  }
  if (!axis) return groundY;

  let sum = groundY;
  let count = 1;
  for (const offset of RAMP_SAMPLE_OFFSETS) {
    const platform = axis === 'x' ? getPlatformAt(x + offset, z) : getPlatformAt(x, z + offset);
    if (platform && Math.abs(platform.y - groundY) <= RAMP_MAX_STEP) {
      sum += platform.y;
      count++;
    }
  }
  return sum / count;
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

export interface MoveResult {
  x: number;
  y: number;
  z: number;
  // Which axes actually moved (false = blocked, so the caller can drop that part of its velocity)
  movedX: boolean;
  movedZ: boolean;
}

// Where a single move from (currentX, currentZ) to (newX, newZ) ends up, or null when it's blocked
function tryMove(
  newX: number,
  newZ: number,
  currentY: number,
  currentX: number,
  currentZ: number
): { x: number; y: number; z: number } | null {
  // Stepping onto the elevator
  if (isOnElevator(newX, newZ)) {
    const elevatorY = getElevatorHeight();
    if (Math.abs(elevatorY - currentY) <= 1.5) {
      return { x: newX, y: elevatorY, z: newZ };
    }
  }

  // On a staircase: stay inside it, or step off where the height lines up
  const currentStaircase = getStaircaseAt(currentX, currentZ, currentY);
  if (currentStaircase) {
    const isExiting = newX < currentStaircase.minX || newX > currentStaircase.maxX ||
                      newZ < currentStaircase.minZ || newZ > currentStaircase.maxZ;

    if (isExiting) {
      const exitHeight = getHeightAtPosition(newX, newZ);
      if (exitHeight !== null && Math.abs(exitHeight - currentY) <= 0.5) {
        return { x: newX, y: exitHeight, z: newZ };
      }
      return null;
    }

    const clampedPos = clampToStaircase(newX, newZ, currentStaircase);
    const targetHeight = getHeightAtPosition(clampedPos.x, clampedPos.z);
    if (targetHeight !== null && Math.abs(targetHeight - currentY) <= 0.5) {
      return { x: clampedPos.x, y: targetHeight, z: clampedPos.z };
    }
    return null;
  }

  // Regular platforms
  const targetPlatform = getPlatformAt(newX, newZ);
  if (!targetPlatform) return null;

  const heightDiff = Math.abs(targetPlatform.y - currentY);

  // Stairs can only be entered at their ends, where the step height lines up
  if (targetPlatform.type === 'stair' && targetPlatform.staircaseId && heightDiff > 0.5) {
    return null;
  }

  return heightDiff <= 2.0 ? { x: newX, y: targetPlatform.y, z: newZ } : null;
}

// Constrain position to stay within platform boundaries. When the full move is blocked
// the character slides along whichever axis is still free, so edges and corners don't snag.
export function constrainToPlatform(
  newX: number,
  newZ: number,
  currentY: number,
  currentX: number,
  currentZ: number
): MoveResult {
  const blocked: MoveResult = { x: currentX, y: currentY, z: currentZ, movedX: false, movedZ: false };

  if (getHeightAtPosition(currentX, currentZ) === null) {
    return blocked;
  }

  const full = tryMove(newX, newZ, currentY, currentX, currentZ);
  if (full) {
    return { ...full, movedX: full.x !== currentX, movedZ: full.z !== currentZ };
  }

  if (newX !== currentX) {
    const slideX = tryMove(newX, currentZ, currentY, currentX, currentZ);
    if (slideX) return { ...slideX, movedX: slideX.x !== currentX, movedZ: false };
  }

  if (newZ !== currentZ) {
    const slideZ = tryMove(currentX, newZ, currentY, currentX, currentZ);
    if (slideZ) return { ...slideZ, movedX: false, movedZ: slideZ.z !== currentZ };
  }

  return blocked;
}
