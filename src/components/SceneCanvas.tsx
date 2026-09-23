import React from 'react';
import { Canvas } from '@react-three/fiber';
import IsometricScene from './IsometricScene';
import { MAX_PIXEL_RATIO } from '../utils/renderSettings';

type IsometricSceneProps = React.ComponentProps<typeof IsometricScene>;

type SceneCanvasProps = IsometricSceneProps & {
  introProgress: number;
};

/**
 * The Three.js canvas with the isometric world and its sky.
 * Memoized so HUD/overlay state changes in the app don't re-render the 3D scene;
 * callbacks passed in should be stable (see useStableCallback).
 */
const SceneCanvas: React.FC<SceneCanvasProps> = React.memo((props) => {
  const { characterControllerRef, introProgress } = props;

  return (
    <>
      {/* Three.js Canvas for the isometric world - always visible. It paints its own
          sky (sky/SkyBackdrop), grain included, so nothing behind it shows through. */}
      <Canvas
        camera={{
          position: [10, 10, 10],
          fov: 50
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          precision: 'highp',
          logarithmicDepthBuffer: false,
          outputColorSpace: 'srgb'
        }}
        dpr={[1, MAX_PIXEL_RATIO]}
        performance={{
          min: 0.5,
          max: 1.0,
          debounce: 200
        }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100vw',
          height: '100vh',
          background: 'transparent',
          // Drop the CSS filter once the intro is done so the browser doesn't filter the canvas every frame
          filter: introProgress < 1 ? `brightness(${0.7 + 0.3 * introProgress})` : 'none',
          touchAction: 'none',
          pointerEvents: 'auto'
        }}
        onTouchStart={(e) => {
          if (e.target !== e.currentTarget || !characterControllerRef.current) return;

          const touch = e.touches[0];
          const controlZoneHeight = window.innerHeight * 0.35;
          const isInControlZone =
            touch.clientY > window.innerHeight - controlZoneHeight;

          if (isInControlZone) return;

          e.preventDefault();
          characterControllerRef.current.handleTouch(touch);
        }}
        onTouchEnd={(e) => {
          if (e.target === e.currentTarget && characterControllerRef.current) {
            e.preventDefault();
            characterControllerRef.current.stopMovement();
          }
        }}
        onTouchMove={(e) => {
          if (e.target === e.currentTarget && characterControllerRef.current) {
            e.preventDefault();
            characterControllerRef.current.handleTouch(e.touches[0]);
          }
        }}
      >
        <IsometricScene {...props} />
      </Canvas>
    </>
  );
});

export default SceneCanvas;
