# Isometric Portfolio

Welcome to my interactive 3D portfolio! Navigate through my work and projects using the menu to quickly jump to different sections, or explore by walking around the world. Each platform contains information about my work.

## Features

- Interactive layout with collision system
- Rideable animated train system
- Full achievement system with persistence
- 4 playable characters
- Interactive billboards with full website
- Isometric world with dynamic camera
- Location discovery system
- Dual Mobile Control System + WASD for PC
- Elevator physics system
- Gaussian Splatting 3D viewer
- Masonry Artwork grid
- Animated skyscraper
- Music playlist

## Project Structure

isoportfolio/
│
├── 📂 public/                          # Static assets
│   ├── 📂 models/                      # 3D character models (.glb)
│   │   ├── character-d/h/l/r.glb      # 4 playable characters
│   │   ├── git.glb                     # Interactive GitHub icon
│   │   └── Textures/                   # Character textures
│   │
│   ├── 📂 train/                       # Train system assets
│   │   ├── railroad-rail-*.glb         # Track pieces (curves, ramps, etc.)
│   │   └── train-electric-bullet-*.glb # 3-car train models
│   │
│   ├── 📂 gsplat/                      # Gaussian Splat 3D data
│   │   └── Achterom/point_cloud.ply    # Photogrammetry model
│   │
│   ├── 📂 images/                      # UI & content images
│   │   ├── artwork/                    # Portfolio artwork gallery
│   │   ├── examples/                   # Learning outcome examples
│   │   ├── menu/                       # SVG icons for UI
│   │   └── meshpics/                   # 3D render previews
│   │
│   ├── 📂 pdfs/                        # Learning outcome documents
│   │   ├── lo1/ lo2/ lo3/ lo4/ lo5/   # Organized by outcome
│   │   └── CV documents
│   │
│   ├── 📂 music/                       # Background music playlist
│   │   └── Baguira.mp3, Boy.mp3, Sudo.mp3
│   │
│   ├── 📂 fonts/                       # Custom typography
│   └── 📂 docs/                        # Research & workflow docs
│
├── 📂 src/
│   ├── 📂 components/                  # React components
│   │   ├── 🎮 Character System
│   │   │   ├── Character.tsx           # Character rendering & animation
│   │   │   ├── CharacterController.tsx # Movement & physics
│   │   │   ├── CharacterSelection.tsx  # Character picker UI
│   │   │   └── CameraController.tsx    # Camera follow system
│   │   │
│   │   ├── 🌍 World & Scene
│   │   │   ├── IsometricScene.tsx      # Main 3D scene setup
│   │   │   ├── IsometricWorldOptimized.tsx # World geometry & platforms
│   │   │   ├── TrainSystem.tsx         # Rideable train logic
│   │   │   └── AnimatedTrain.tsx       # Train animation
│   │   │
│   │   ├── 🎯 Interactables
│   │   │   ├── InteractiveBillboard.tsx    # Project showcase billboards
│   │   │   ├── InteractiveSlab.tsx         # Clickable platforms
│   │   │   └── InteractiveOutlineButton.tsx # Hover effects
│   │   │
│   │   ├── 💬 UI & Overlays
│   │   │   ├── MenuOverlay.tsx         # Main navigation menu
│   │   │   ├── Content.tsx             # Learning outcome viewer
│   │   │   ├── WebsiteOverlay.tsx      # Embedded website viewer
│   │   │   ├── InteractionOverlay.tsx  # "Press SPACE" prompts
│   │   │   ├── TopHUD.tsx              # Location/navigation HUD
│   │   │   └── UI.tsx                  # Base UI container
│   │   │
│   │   ├── 🏆 Notifications
│   │   │   ├── AchievementNotification.tsx # Achievement popups
│   │   │   └── LocationDiscovery.tsx       # "Area discovered" alerts
│   │   │
│   │   ├── 📱 Mobile Controls
│   │   │   ├── MobileDpad.tsx          # Touch D-pad
│   │   │   ├── MobileInteractButton.tsx # Mobile interact button
│   │   │   ├── RotatePhoneScreen.tsx   # Portrait mode warning
│   │   │   └── AddToHomeScreenPrompt.tsx # PWA install prompt
│   │   │
│   │   ├── 🎨 Special Effects
│   │   │   ├── GSplatViewer.tsx        # Gaussian Splat 3D viewer
│   │   │   ├── ClickSpark.tsx          # Click particle effects
│   │   │   ├── LoadingScreen.tsx       # Initial loader
│   │   │   └── StarBorder.tsx          # Animated borders
│   │   │
│   │   └── 🛠️ Utilities
│   │       ├── GPUPerformanceMonitor.tsx # Performance tracking
│   │       ├── PlatformDebugger.tsx      # Dev tools
│   │       └── ControlsUI.tsx            # Keyboard help overlay
│   │
│   ├── 📂 contexts/
│   │   └── AchievementContext.tsx      # Achievement state management
│   │
│   ├── 📂 hooks/
│   │   └── useCharacterControls.ts     # Character control logic
│   │
│   ├── 📂 reducers/                    # State reducers
│   │   ├── billboardReducer.ts         # Billboard state
│   │   ├── characterAnimationReducer.ts # Animation state
│   │   └── discoveryReducer.ts         # Location discovery
│   │
│   ├── 📂 utils/                       # Core systems
│   │   ├── collisionSystem.ts          # Physics & collision detection
│   │   ├── elevatorSystem.ts           # Elevator mechanics
│   │   ├── frameRateOptimizer.ts       # Performance optimization
│   │   └── texturePreloader.ts         # Asset preloading
│   │
│   ├── 📂 data/
│   │   └── ContentData.ts              # Content configuration
│   │
│   ├── 📂 styles/
│   │   └── fonts.css                   # Font imports
│   │
│   └── 📂 types/
│       └── gaussian-splats-3d.d.ts     # TypeScript definitions
│
├── 📄 package.json                     # Dependencies
├── 📄 tsconfig.json                    # TypeScript config
└── 📄 README.md                        # You're writing this! 🎉

## Installation 

Prerequisites
Node.js (v16 or higher)
npm 

Getting Started
Clone the repository
   git clone https://github.com/yourusername/isoportfolio.git   cd isoportfolio
Install dependencies
   npm install
Start the development server
   npm start
Open in browser
   http://localhost:3000

## Roadmap

✅ Completed (Current Version)
Core Systems
✅ Full 3D isometric world with React Three Fiber
✅ Physics-based collision detection system
✅ Dynamic camera controller with smooth transitions
✅ Performance optimization (frame rate optimizer, texture preloading)
✅ Mobile-responsive design with custom touch controls
Character System
✅ 4 playable characters with unique models
✅ Character selection screen
✅ Smooth character animations (idle, walk, run)
✅ WASD + Arrow key controls
✅ Character teleportation between locations
Interactive Features
✅ Rideable train system with boarding/exit mechanics
✅ Functional elevator with pressure plates
✅ Interactive billboards with website overlay
✅ Clickable platforms for content navigation
✅ Q/E navigation with magic teleport effects
✅ GitHub repository integration (3D models)
Content & UI
✅ 5 Learning Outcome content sections
✅ Gaussian Splat 3D viewer (photogrammetry)
✅ Menu system with navigation
✅ Achievement system (5 achievements)
✅ Location discovery notifications
✅ Top HUD with location tracking
✅ Interaction prompts (SPACE to interact)
Mobile Experience
✅ Custom D-pad controls
✅ Mobile interact button
✅ PWA support (Add to Home Screen)
✅ Portrait mode rotation prompt
✅ Touch-optimized UI
Audio & Polish
✅ Background music system (3-song playlist)
✅ Music toggle controls
✅ Click spark particle effects
✅ Animated skyscraper with window lighting
✅ Custom fonts and styling
✅ Loading screen with progress

🚧 In Progress / Planned
📚 Phase 1: Documentation (Priority: High)

🏃 Phase 2: Parkour System (Priority: High)

🎵 Phase 3: Enhanced Music System (Priority: Medium)

## Screenshot

<img width="1331" height="620" alt="Screenshot (173)" src="https://github.com/user-attachments/assets/8f80691a-eebc-4793-a4f7-9621e2ef4468" />


