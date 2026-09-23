// ============================================================================
// NIGHT LANTERNS
// Where the lanterns settle at night. Heights come from the floor heights in
// collisionSystem.ts. They keep to the far (-x / -z) edges of the platforms: the
// camera looks from +x+z, so a lantern on the near side would float between the
// camera and the character.
// ============================================================================

export interface LanternPlacement {
  x: number;
  z: number;
  y: number;    // where the lantern hangs
  drop: number; // how far down the surface it lights is (length of its light shaft)
}

const HANG_HEIGHT = 1.75;

const overFloor = (x: number, z: number, floorY: number, height = HANG_HEIGHT): LanternPlacement =>
  ({ x, z, y: floorY + height, drop: height });

// Work platform: along its far edge, halfway between the billboards
const WORK_FLOOR_Y = -2.6;
const WORK_EDGE_X = -2.55;
const WORK_LANTERN_Z = [7.9, 12.9, 20.4, 27.9, 35.4, 42.9, 50.4, 55.6];

export const LANTERNS: LanternPlacement[] = [
  // Main platform
  overFloor(-1.9, -1.9, 0.1),
  overFloor(1.9, -1.9, 0.1),
  overFloor(-1.9, 1.9, 0.1),

  // Back platform and the walls behind it
  overFloor(0, -5.3, 0.1),             // right where the walkway from the main platform ends
  overFloor(3.1, -8.9, 0.1),
  overFloor(3.1, -10.0, 1.6),
  overFloor(-1.5, -10.4, 1.78, 1.6),   // over the 3DGS slab
  overFloor(-4.2, -9.6, 2.2),          // beside the stairs up the tall wall

  // Top of the tall wall, behind the social buttons
  overFloor(-1.45, -12.95, 3.25, 1.6),
  overFloor(1.45, -12.95, 3.25, 1.6),

  // Past portfolios staircase: one over the landing where the stairs arrive, then
  // one straight over each portfolio slab (directly above never hides the character)
  overFloor(-7.26, 0, 3.1),
  overFloor(-10.625, 1.5, 3.74),   // First Portfolio
  overFloor(-13.625, 1.5, 4.22),   // Spotify Portfolio
  overFloor(-13.625, -1.5, 4.73),  // Space Portfolio
  overFloor(-10.625, -1.5, 5.23),  // Castle Portfolio
  overFloor(-7.625, -1.5, 5.73),   // Isometric Portfolio

  // Stairs down from the main platform
  overFloor(-1.4, 5.0, -1.3),
  overFloor(4.5, -1.35, -0.95),

  // Artwork platform
  overFloor(6.0, -1.2, -2),
  overFloor(8.25, -1.2, -2),
  overFloor(11.75, -1.9, -2),
  overFloor(9.25, 1.9, -2),

  // Work platform
  ...WORK_LANTERN_Z.map(z => overFloor(WORK_EDGE_X, z, WORK_FLOOR_Y))
];
