// Shared definitions for interactive slabs, so positions/URLs/labels live in one place

export const SLAB_HALF_SIZE = 0.45;

export const isWithinSlab = (x: number, z: number, slabX: number, slabZ: number): boolean =>
  x >= slabX - SLAB_HALF_SIZE && x <= slabX + SLAB_HALF_SIZE &&
  z >= slabZ - SLAB_HALF_SIZE && z <= slabZ + SLAB_HALF_SIZE;

export const findSlabAt = <T extends { x: number; z: number }>(slabs: readonly T[], x: number, z: number): T | undefined =>
  slabs.find(slab => isWithinSlab(x, z, slab.x, slab.z));

export const isOnMiddleSlab = (x: number, z: number): boolean => isWithinSlab(x, z, 0, 0);

// Work area platform (3 wide, WORK_PLATFORM_ROWS long), extending south from the downward stairs
export const WORK_ROW_SPACING = 1.5;
export const WORK_PLATFORM_START_Z = 7.65;
export const WORK_PLATFORM_ROWS = 33;
export const WORK_PLATFORM_END_Z = WORK_PLATFORM_START_Z + (WORK_PLATFORM_ROWS - 1) * WORK_ROW_SPACING;

// A project is shown either as a live website or as documentation:
// - url:  the floor button opens the site in a new tab, clicking the billboard zooms in and embeds the site
// - docs: the floor button and the billboard both zoom in and show the documentation
interface WorkProject {
  label: string;
  url?: string;
  docs?: string;
}

export interface BillboardDef extends WorkProject {
  key: string;
  row: number;     // platform row the billboard stands on (one every 5 rows)
}

const WORK_PROJECTS: WorkProject[] = [
  { label: 'SideSkin Platform', url: 'https://side-skin-next.vercel.app/' },
  { label: 'Omnival Website', url: 'https://www.omnival.ro/' },
  { label: 'SpookSlot 3DGS', docs: 'Lorem ipsum' },
  { label: 'RestrictionsMap', docs: 'Lorem ipsum' },
  { label: 'Holleman Website', url: 'https://www.holleman.ro/' },
  { label: 'ITL Website', url: 'https://itl-website-five.vercel.app/en' },
  { label: 'Holleman App', docs: 'Lorem ipsum' }
];

export const BILLBOARDS: BillboardDef[] = WORK_PROJECTS.map((project, i) => ({
  ...project,
  key: `billboard${i + 1}`,
  row: 2 + i * 5
}));

// Floor button in front of each billboard
export const WEBSITE_SLABS = BILLBOARDS.map((billboard, i) => ({
  id: `website-${i + 1}`,
  x: -1,
  z: WORK_PLATFORM_START_Z + (billboard.row - 1) * WORK_ROW_SPACING,
  billboardKey: billboard.key,
  label: billboard.label,
  url: billboard.url
}));

export const openInNewTab = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Social link buttons on top of the tall wall (Socials & Passion area), left corner / center / right corner
export type SocialKind = 'github' | 'linkedin' | 'email';

export const SOCIAL_WALL_TOP_Y = 3.2 / 1.83 + 3.2 / 2; // top surface of the tall wall blocks (see WallBlocks)
export const SOCIAL_WALL_EXTENSION_DEPTH = 0.75;       // how far the wall top was extended backwards (-z)
const SOCIAL_ROW_Z = -12 - SOCIAL_WALL_EXTENSION_DEPTH / 2; // centered on the extended top

export const SOCIAL_SLABS: { id: string; kind: SocialKind; x: number; z: number; label: string; url?: string }[] = [
  { id: 'social-github', kind: 'github', x: -2.85, z: SOCIAL_ROW_Z, label: 'GitHub', url: 'https://github.com/yfaneee' },
  { id: 'social-linkedin', kind: 'linkedin', x: 0, z: SOCIAL_ROW_Z, label: 'LinkedIn', url: 'https://www.linkedin.com/in/luca-stefan-tomescu-9513732ba/' },
  { id: 'social-email', kind: 'email', x: 2.85, z: SOCIAL_ROW_Z, label: 'Email', url: 'mailto:lucastefan.tomescu@gmail.com' }
];

export const openSocialLink = (url?: string) => {
  if (!url) return;
  if (url.startsWith('mailto:')) {
    window.location.href = url; // hands off to the mail client without leaving a blank tab
  } else {
    openInNewTab(url);
  }
};

export const getBillboard = (key: string) => BILLBOARDS.find(billboard => billboard.key === key);

// Learning outcome slab id -> teleport location / content key
export const LO_SLAB_TARGETS: Record<string, { location: string; contentKey: string }> = {
  lo1: { location: 'conceptualize', contentKey: 'staircase-slab-1' },
  lo2: { location: 'transferable', contentKey: 'staircase-slab-2' },
  lo3: { location: 'creative', contentKey: 'staircase-slab-3' },
  lo4: { location: 'professional', contentKey: 'staircase-slab-4' },
  lo5: { location: 'leadership', contentKey: 'staircase-slab-5' }
};

// Other clickable slabs that teleport and open content
export const CONTENT_SLAB_TARGETS: Record<string, { location: string; contentKey: string }> = {
  'smaller-block': { location: 'ironfilms', contentKey: 'smaller-block-slab' },
  artwork: { location: 'artwork', contentKey: 'artwork-platform-slab' }
};

// Text shown when hovering a slab with the mouse
export const getSlabHoverText = (slabId: string): string => {
  if (LO_SLAB_TARGETS[slabId]) {
    return slabId.slice(2);
  } else if (slabId.startsWith('website-')) {
    return WEBSITE_SLABS.find(slab => slab.id === slabId)?.label || 'View Portfolio';
  } else if (slabId === 'main-slab') {
    return 'Open Menu';
  } else if (slabId.startsWith('social-')) {
    return SOCIAL_SLABS.find(slab => slab.id === slabId)?.label || 'Social';
  } else if (slabId === 'smaller-block') {
    return '7';
  } else if (slabId === 'artwork') {
    return 'Artwork';
  }
  return 'Interact';
};

// Text shown when the character stands on a slab
export const getSlabPromptText = (slabType?: string): string => {
  switch (slabType) {
    case 'main': return 'Menu';
    case 'lo1': return '1';
    case 'lo2': return '2';
    case 'lo3': return '3';
    case 'lo4': return '4';
    case 'lo5': return '5';
    case 'smaller-block': return '7';
    case 'artwork': return 'Artwork Gallery';
    case 'elevator': return 'Use Elevator';
    default:
      if (slabType?.startsWith('social-')) {
        return SOCIAL_SLABS.find(slab => slab.id === slabType)?.label || 'Interact';
      }
      if (slabType?.startsWith('website-')) {
        return WEBSITE_SLABS.find(slab => slab.id === slabType)?.label || 'Interact';
      }
      return 'Interact';
  }
};
