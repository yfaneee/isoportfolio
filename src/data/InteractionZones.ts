// Shared definitions for interactive slabs, so positions/URLs/labels live in one place
import { contentData } from './ContentData';

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

// A block of written documentation shown on a billboard
export interface DocsImage {
  src: string;
  caption: string;
}

export interface DocsSection {
  heading: string;
  paragraphs?: string[];
  points?: string[];
  images?: DocsImage[];
  phones?: DocsImage[]; // portrait phone screenshots, shown in a narrower grid
}

export interface ProjectDocs {
  title: string;
  intro: string;
  sections?: DocsSection[];
}

// A project is shown either as a live website or as documentation:
// - url:  the floor button opens the site in a new tab, clicking the billboard zooms in and embeds the site
// - docs: the floor button and the billboard both zoom in and show the documentation
interface WorkProject {
  label: string;
  url?: string;
  docs?: ProjectDocs;
}

const SPOOKSLOT_DOCS: ProjectDocs = {
  title: 'SpookSlot 3DGS',
  intro:
    'A digital heritage project for Boldly-XR and the Efteling: reconstructing the Spookslot, the haunted castle demolished in 2022, with 3D Gaussian Splatting. The available material was never captured with photogrammetry in mind, so the project plan was built around a second deliverable, a website logging the entire process. Whether the reconstruction ended in a working virtual tour or not, the outcome stays valid: a documented result covering what worked, what did not, and why.',
  sections: [
    {
      heading: 'The reconstruction work',
      paragraphs: [
        'Ten documented attempts, each narrowing down what the dataset could actually support. The archive held 5,794 photographs shot across three light levels, taken as visual reference for a modelling team rather than as a capture set, which meant mixed exposure, motion blur and close-ups with almost no frame overlap.'
      ],
      points: [
        'Rebuilt the pipeline around Nerfstudio and COLMAP, swapping in SuperPoint/SuperGlue matching to cope with the dark, low-texture interior',
        'Unprojected 360\u00b0 equirectangular captures into pinhole views, lifting the registration rate from 15% to 94.76% and producing the first complete corridor scan',
        'Reached the first genuinely successful reconstruction on a set of near-8K Opera photographs, after isolating an orientation-consistency bug in Postshot',
        'Benchmarked single-panorama methods (SPAG-4D, PanSplat, Pano2Room) against the classic SfM route, documenting why feed-forward models broke on a fixed-position dataset'
      ],
      images: [
        { src: '/images/spookslot/FirstRender.webp', caption: 'Attempt 1, the first render in Postshot, with noise and blur straight out of the archive images' },
        { src: '/images/spookslot/EntranceScan.webp', caption: 'Attempt 2, the entrance rebuilt from frames extracted out of video footage' },
        { src: '/images/spookslot/OperaScan.webp', caption: 'Attempt 4, the first successful scan, from near-8K Opera photographs' },
        { src: '/images/spookslot/CorridorScan.webp', caption: 'Attempt 5, the corridor, from 360° captures unprojected into pinhole views' }
      ]
    },
    {
      heading: 'Designing the site',
      paragraphs: [
        'After researching design patterns and pinning down the scope, I started on wireframes and tested them with a co-worker, who agreed that keeping the flow simple was the right call. The site has one purpose: give a clear overview of the progress and process, nothing more.',
        'For the visual identity I pulled colours from a reference image of the Center Opera inside the Spookslot, so the atmosphere of the space carries into the website itself.'
      ],
      points: [
        'Home: a hero section with two buttons leading to Collection or About, plus a gallery of images from the process',
        'Collection: a grid of card-based items, each with a short description and a representative image',
        'About: a longer description of the project, followed by the software and tools used, presented as cards with the tool icon and how it was used'
      ],
      images: [
        { src: '/images/spookslot/Wireframes.webp', caption: 'First wireframes: home, collection and about' }
      ]
    },
    {
      heading: 'Feedback and iterations',
      paragraphs: [
        'I gathered feedback from my mentor and a UI/UX specialist at Boldly. The response was positive, with a few mandatory changes.'
      ],
      points: [
        'Drop the repository link from the footer, the project holds confidential data, so the codebase stays private',
        'Design a mobile version, including a burger menu for smaller screens',
        'Make the Collection button the primary call to action, larger and more prominent than About',
        'A second round added a hint that mobile users can tap images to expand them, and darker background images for text readability',
        'A fourth iteration added a guide page, after a review of the project plan showed one was missing'
      ],
      images: [
        { src: '/images/spookslot/Prototype.webp', caption: 'Third iteration: the desktop homepage and the mobile screens' }
      ]
    },
    {
      heading: 'Design patterns',
      points: [
        'Card pattern: each scan attempt is its own card showing title, short description, tags and status, with the full write-up one action away. Progressive disclosure keeps the overview scannable',
        'Hero pattern: the homepage opens with a headline, a short project description and two calls to action, communicating the purpose immediately',
        'Visual hierarchy: a consistent type scale, colour contrast and spatial grouping guide the eye from headline to description to action, following the Gestalt principles of proximity, similarity and figure-ground'
      ]
    },
    {
      heading: 'Building and testing with the real users',
      paragraphs: [
        'Once the prototype was done I realised the feedback I was getting, however useful, was not coming from the people who would actually use the site: the 3D team at Boldly. So I started building the real thing early and kept it updated in parallel with the research, every new development reflected on the site as it happened. Sharing it in the company Discord made proper usability testing possible with the right audience.',
        'A brainstorming session on making the site easier to use led to an AI assistant trained on everything the website contains, so it can answer questions about the work and the Gaussian Splatting workflow and point people to the right part of the documentation.',
        'The guide page walks through the full capture-to-splat pipeline: preparing the dataset, camera settings, rendering and exporting, editing and engine implementation. So the company can produce a high-quality result on the next assignment without relearning it.'
      ],
      images: [
        { src: '/images/spookslot/GuidePage.webp', caption: 'The guide page: the capture-to-splat pipeline in collapsible sections' }
      ]
    },
    {
      heading: 'Reflection',
      paragraphs: [
        'This reinforced how much a well-defined scope is worth from the start. The mission was never only to show my process, it was to leave Boldly-XR something actionable: a guide that lets them take on future assignments with the right knowledge and tools, instead of being limited the way they were four years ago when they first took on the Spookslot.',
        'Moving from prototype feedback to testing a live, content-heavy site with the actual audience also made me far more careful about structure and clarity. If the content is there but hard to navigate or too dense to digest, it loses its value, which is why the site had to work as a tool, not just exist as a deliverable.'
      ]
    }
  ]
};

export interface BillboardDef extends WorkProject {
  key: string;
  row: number;     // platform row the billboard stands on (one every 5 rows)
}

const RESTRICTIONS_MAP_DOCS: ProjectDocs = {
  title: 'RestrictionsMap',
  intro:
    'An interactive map of every traffic restriction on the Romanian national road network, built for a haulage company that plans abnormal-load transports. The official restrictions are published as four documents a dispatcher has to read by hand; this turns them into ~8,400 positions on a map that can be filtered by the lorry actually making the trip, rebuilds the route printed on a transport authorisation, and sends the finished line to the driver\u2019s phone.',
  sections: [
    {
      heading: 'Getting the data onto a map',
      paragraphs: [
        'CESTRIN publishes four documents: mass and dimensions, temporary, maximum total mass, and permanent, as Excel-exported HTML with nested headers in windows-1252. The clean layouts parse deterministically; the nested ones need a documented heuristic, and any row it is unsure about is flagged for review rather than guessed at.',
        'Each restriction states a road and a kilometre, not a coordinate. Those resolve through ANDNET, the same authority that issues the restrictions, so positions land on the official km posts. The access token rotates, so it is discovered at runtime from a public page; when the service refuses, rows stay pending instead of being marked failed, \u201Cthe service would not talk to us\u201D is not \u201Cthis km post does not exist\u201D.'
      ],
      points: [
        'ANDNET resolves only to whole kilometres, so a second pass walks each position along the road to its actual kilometre. That took the share of lines whose drawn length matches their stated span from 74% to 88%',
        'Long restrictions are sampled every kilometre and snapped onto OSM road geometry, so a closed stretch follows the road instead of cutting across it as a straight chord',
        'The ~27,000 cached km-post lookups cost about three hours of throttled requests, so that cache is committed to the repository and a fresh clone rebuilds the whole database without a single call to ANDNET'
      ],
      images: [
        { src: '/images/restrictionsmap/Map.webp', caption: 'The four restriction types on the map, with the filters and the lorry\u2019s dimensions on the left' }
      ]
    },
    {
      heading: 'Filtering for the lorry in front of you',
      paragraphs: [
        'A dispatcher does not care about 8,400 restrictions, only the ones that would stop this transport. Entering the mass, width, height, length and the individual axle masses and spacings marks everything the vehicle exceeds in red, and the panel can hide the rest entirely.',
        'Axle spacing is the one input worth typing carefully: it decides how axles group, and the grouping decides both whether a per-metre limit applies and what the authorisation costs.'
      ]
    },
    {
      heading: 'Rebuilding the route from an authorisation',
      paragraphs: [
        'An authorisation prints its route as a list of nodes from the issuer\u2019s own network graph, each naming the road used to reach it. Pasted in or dropped in as a PDF, that becomes a drawn route with a GPX export.',
        'Restrictions are deliberately not avoided here. The permit was issued over exactly these roads, so routing around a bridge it already covers would produce a different route from the approved one, the GPX says as much in its own description.'
      ],
      points: [
        'Localities resolve through Nominatim, with the bracketed county separating the five places sharing a name',
        'Junctions exist in no public dataset, so they are computed: every OSM way tagged with one road against every way tagged with the other, at widening tolerances, because many are one road ending on another and some are grade-separated with slip roads carrying neither code',
        'Where a pair of roads meets twice (the two ends of a bypass) the candidate that fits between its neighbours in the route wins; the electronic authorisation states each hop\u2019s distance, which settles it by arithmetic instead of a plausibility threshold',
        'Everything resolved is cached under the node\u2019s own name, so the next authorisation naming that junction resolves without touching the network. Internal bypass codes that appear in no public data are pinned once by hand and known from then on',
        'Nothing is ever refused outright: whatever cannot be interpreted becomes a node to place on the map by hand, and stays placed for every future authorisation'
      ],
      images: [
        { src: '/images/restrictionsmap/AstRoute.webp', caption: 'A route rebuilt from an authorisation, 26 of 27 nodes located and the last one left to pin by hand' }
      ]
    },
    {
      heading: 'Reading the PDF in the browser',
      paragraphs: [
        'Roughly 70% of authorisations arrive as scans, so the reader tries the embedded text layer first and falls back to OCR. All of it runs client-side: a 6 MB scan never leaves the machine it was opened on.'
      ],
      points: [
        'One sample document rendered forever despite being a single page holding one JPEG, since a scan is that JPEG, it is now pulled straight out of the file when rendering stalls, and reads in 24 seconds instead of never',
        'OCR damages road codes and almost nothing else: of ~700 characters read from one authorisation, four were wrong and all four were in codes. Codes have a rigid shape, so they are repaired, but only ever to a code that is actually valid',
        'The extracted text always lands in a box for review before anything is routed. A misread code that happens to name a real road would send a lorry down it without complaint'
      ]
    },
    {
      heading: 'Sending the route to the lorry',
      paragraphs: [
        'The GPX export only solved half the hand-off: a dispatcher could produce a file the truck navigation understands, and then had to get it onto a driver\u2019s phone, which in practice meant asking a driver to save an attachment and open it in another app. A route is now sent to a licence plate instead, and the driver\u2019s own app shows it to whoever is in that lorry.'
      ],
      points: [
        'Plates are typed in by a dispatcher and never created automatically. A plate that appears by itself is a typo, and a typo is a lorry whose driver finds nothing',
        'The line that is sent is the line on screen. Where a dispatcher chose between candidates or pinned a node by hand, that choice is what reaches the cab',
        'A sent route stores its finished track rather than the inputs it came from, so a driver already given a route does not have it change under him when the routing data moves on',
        'Every point carries a speed limit, with bends detected from bearing change, because comparing speed against the limit at the nearest point is the phone\u2019s whole job'
      ],
      images: [
        { src: '/images/restrictionsmap/Fleet.webp', caption: 'The fleet page: plates a dispatcher can send to, and the routes already sent' }
      ]
    },
    {
      heading: 'Keeping it honest',
      paragraphs: [
        'The map regenerates itself nightly, which means a run that quietly achieves nothing is the real risk. Every document is compared by content hash first, so a day where nothing changed costs seconds, and every run ends by asserting that the newest document held is the one that should exist today; a scraper that silently finds nothing looks exactly like a month where nothing was published.',
        'The limitations are written down next to the feature rather than left implied: 608 restrictions in force are not on the map at all, because they carry no kilometre or a road code the geocoder does not know, and they are neither drawn nor avoided. That belongs on the record, since moving a restriction decides where a lorry is told it may drive.'
      ]
    }
  ]
};

const HOLLEMAN_APP_DOCS: ProjectDocs = {
  title: 'Holleman App',
  intro:
    'A phone app for the drivers of a heavy haulage company, with a web viewer for the office. It started as one thing, a route loaded into the app and a way for dispatch to see what the driver actually did on it, and then grew every time the office asked for the next piece of paper to stop being paper. Forms came first, then trip and incident reports, then an inventory of what each lorry is carrying. Built with React Native and Expo, with Firebase behind both halves.',
  sections: [
    {
      heading: 'Where it started: the route and the speed alarm',
      paragraphs: [
        'An abnormal load is driven on an approved route at a speed that is written down in advance, so the app carries the route and watches the speed against it. Routes reach the phone three ways: compiled into the app for the corridors the company runs constantly, imported as a GPX file the driver picks himself, or sent straight from the dispatcher\u2019s restrictions map to a licence plate.',
        'A sent route arrives with a speed limit on every single point rather than one number for the whole trip, so the alarm tightens through the bends and relaxes on the straight. The driver cannot change it, because it was typed for this load.'
      ],
      points: [
        'GPS readings worse than 15 m of accuracy are thrown away, anything under 3 km/h counts as stopped, and speed is averaged over the last three readings, because raw phone GPS produces violations that never happened',
        'Bends are found from bearing change along the route, and the approach to a bend counts as part of it, so the limit drops before the driver is already in the corner',
        'Tracking continues in the background, since a driver is not going to leave the app open on screen for nine hours',
        'Every reading is logged, not just the violations, so the office sees the whole trip rather than a list of accusations'
      ],
      phones: [
        { src: '/images/hollemanapp/RouteReady.webp', caption: 'A route loaded and the speed alarm armed, waiting to start' },
        { src: '/images/hollemanapp/Navigating.webp', caption: 'Turn by turn on the route, with live speed beside it' }
      ],
      images: [
        { src: '/images/hollemanapp/WebReport.webp', caption: 'The office view: the driven route, each violation pinned, and the full speed log underneath' }
      ]
    },
    {
      heading: 'Then the forms',
      paragraphs: [
        'The checks a driver already had to do on paper moved into the app, one form at a time. A maintenance report walks through eleven questions and starts by asking which seat the person filling it in was in, because a truck driver, an escort driver and a steering operator are not checking the same vehicle. A handover protocol records the trailer number and whether each document is present or missing, with the camera right there to photograph the certificate. A pre departure checklist covers the rest.',
        'Every answer is a large tappable button rather than a text field, since these get filled in standing next to a lorry, often in the rain.'
      ],
      phones: [
        { src: '/images/hollemanapp/FormsMenu.webp', caption: 'The three forms a driver can open' },
        { src: '/images/hollemanapp/FormMaintenance.webp', caption: 'The maintenance form asks first which role is filling it in' },
        { src: '/images/hollemanapp/FormHandover.webp', caption: 'Vehicle handover: documents present or missing, photographed on the spot' }
      ]
    },
    {
      heading: 'Then the reports',
      paragraphs: [
        'Two kinds. A trip report documents the load itself across three stages: photographs before loading, photographs of the loaded lorry, and the delivery at the far end. The stages are deliberately separate, so a driver can close the app between them and pick it up hours later, which is what actually happens on a two day transport.',
        'An incident report covers everything else that can go wrong, sorted by what kind of incident it is before any detail is asked for. A transport incident takes the plate, a description and photographs of the damage. The other categories cover quality, health, safety, environment, complaints and suggestions, and harassment and discrimination, so nothing has to be squeezed into a category it does not belong in.'
      ],
      phones: [
        { src: '/images/hollemanapp/CursaNew.webp', caption: 'A new trip report, three stages that can be finished days apart' },
        { src: '/images/hollemanapp/IncidentTypes.webp', caption: 'Incident types, chosen before any detail is asked for' },
        { src: '/images/hollemanapp/IncidentForm.webp', caption: 'A transport incident: plate, description and photographs' }
      ]
    },
    {
      heading: 'And finally the inventory',
      paragraphs: [
        'Each lorry carries a long list of equipment, 83 items on the one in the screenshot, from radio antennas and convoy banners to cables, jacks and fuel cards. The driver picks his plate, counts, and submits.',
        'The office side is the half that makes it useful. It holds a current state per vehicle next to what the driver last counted, so a disagreement is visible rather than buried, and any correction an administrator makes is marked as theirs. The driver\u2019s number and the office\u2019s number are kept apart on purpose, because overwriting one with the other would lose the very thing the list is for.'
      ],
      phones: [
        { src: '/images/hollemanapp/InventorySelect.webp', caption: 'Step one, pick the lorry' },
        { src: '/images/hollemanapp/InventoryCount.webp', caption: 'Step two, count the 83 items on board' }
      ],
      images: [
        { src: '/images/hollemanapp/InventoryAdmin.webp', caption: 'The office view: what the driver counted, what the vehicle currently holds, and which rows an administrator changed' }
      ]
    },
    {
      heading: 'All of it comes out as a PDF',
      paragraphs: [
        'Everything that goes into the app comes back out as a document the office can file, send on or print. The speed report draws the driven route on a map, flags the violations and then prints the entire log, which on a long trip runs to 82 pages and two thousand readings. The trip report comes out with the photographs from all three stages in order and the delivery paperwork at the back.',
        'This is the part that decided whether any of the rest got used. A form that only lives inside an app is a form the office still has to copy out by hand.'
      ],
      images: [
        { src: '/images/hollemanapp/PdfSpeedReport.webp', caption: 'A speed report: route, violations, then every reading, 82 pages of it' },
        { src: '/images/hollemanapp/PdfCursaReport.webp', caption: 'A trip report with the photographs from each stage and the paperwork at the back' }
      ]
    },
    {
      heading: 'What it turned into',
      paragraphs: [
        'Nothing here was designed as a suite. Each part arrived because something on paper was slowing the office down, and it was built to replace that one thing. What holds it together is that they all end the same way, as a document with a lorry\u2019s plate on it, filed against the vehicle it belongs to.',
        'Keeping each piece narrow is what made it possible to keep adding. The speed tracker knew nothing about forms, and the forms knew nothing about inventory, so a new section was a new screen and a new collection rather than a change to anything a driver was already relying on.'
      ]
    }
  ]
};

const WORK_PROJECTS: WorkProject[] = [
  { label: 'SideSkin Platform', url: 'https://side-skin-next.vercel.app/' },
  { label: 'Omnival Website', url: 'https://www.omnival.ro/' },
  { label: 'SpookSlot 3DGS', docs: SPOOKSLOT_DOCS },
  { label: 'RestrictionsMap', docs: RESTRICTIONS_MAP_DOCS },
  { label: 'Holleman Website', url: 'https://www.holleman.ro/' },
  { label: 'ITL Website', url: 'https://itl-website-five.vercel.app/en' },
  { label: 'Holleman App', docs: HOLLEMAN_APP_DOCS }
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

// Web3Forms access key for the contact popup (https://web3forms.com). It is meant to be public.
// While empty, the popup offers a direct email link instead of the form.
export const WEB3FORMS_ACCESS_KEY = 'e7ff1e19-c7db-4561-8002-24f0476f95b8';
export const CONTACT_EMAIL = 'lucastefan.tomescu@gmail.com';

export const SOCIAL_SLABS: {
  id: string;
  kind: SocialKind;
  x: number;
  z: number;
  label: string;
  url?: string;
  opensContactForm?: boolean;
}[] = [
  { id: 'social-github', kind: 'github', x: -2.85, z: SOCIAL_ROW_Z, label: 'GitHub', url: 'https://github.com/yfaneee' },
  { id: 'social-linkedin', kind: 'linkedin', x: 0, z: SOCIAL_ROW_Z, label: 'LinkedIn', url: 'https://www.linkedin.com/in/luca-stefan-tomescu-9513732ba/' },
  { id: 'social-email', kind: 'email', x: 2.85, z: SOCIAL_ROW_Z, label: 'Email', opensContactForm: true }
];

export const openSocialLink = (url?: string) => {
  if (url) openInNewTab(url);
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
    return contentData[LO_SLAB_TARGETS[slabId].contentKey]?.title || slabId.slice(2);
  } else if (slabId.startsWith('website-')) {
    return WEBSITE_SLABS.find(slab => slab.id === slabId)?.label || 'View Portfolio';
  } else if (slabId === 'main-slab') {
    return 'Open Menu';
  } else if (slabId.startsWith('social-')) {
    return SOCIAL_SLABS.find(slab => slab.id === slabId)?.label || 'Social';
  } else if (slabId === 'smaller-block') {
    return contentData['smaller-block-slab']?.title || '3DGS';
  } else if (slabId === 'artwork') {
    return 'Artwork';
  }
  return 'Interact';
};

// Text shown when the character stands on a slab
export const getSlabPromptText = (slabType?: string): string => {
  switch (slabType) {
    case 'main': return 'Menu';
    case 'smaller-block': return contentData['smaller-block-slab']?.title || '3DGS';
    case 'artwork': return 'Artwork Gallery';
    case 'elevator': return 'Use Elevator';
    default:
      if (slabType && LO_SLAB_TARGETS[slabType]) {
        return contentData[LO_SLAB_TARGETS[slabType].contentKey]?.title || slabType.slice(2);
      }
      if (slabType?.startsWith('social-')) {
        return SOCIAL_SLABS.find(slab => slab.id === slabType)?.label || 'Interact';
      }
      if (slabType?.startsWith('website-')) {
        return WEBSITE_SLABS.find(slab => slab.id === slabType)?.label || 'Interact';
      }
      return 'Interact';
  }
};
