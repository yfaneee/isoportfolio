import React from 'react';
import { useGLTF } from '@react-three/drei';
import AnimatedTrain from './AnimatedTrain';

interface TrainSystemProps {
  isVisible?: boolean;
}

const TrainSystem: React.FC<TrainSystemProps> = ({ isVisible = true }) => {
  // Load track models at component level
  const cornerLarge = useGLTF('/train/railroad-rail-corner-large.glb');
  const cornerSmall = useGLTF('/train/railroad-rail-corner-small.glb');
  const straightTrack = useGLTF('/train/railroad-rail-straight.glb');

  if (!isVisible) return null;

  return (
    <group name="train-system">
      {/* Animated electric train  */}
      <AnimatedTrain speed={5} />
      
      {/* Northwest corner */}
      <primitive 
        object={cornerLarge.scene.clone()} 
        position={[-18, 2, -15]}
        rotation={[0, Math.PI / 1, 0]}
        scale={1}
      />

      <group position={[-13.9, 1.99, -19]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0.2, 0, 0]}
          scale={1}
        />
      </group>

      <group position={[-10, 1.2, -19]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0.2, 0, 0]}
          scale={1}
        />
      </group>

      <group position={[-6.1, 0.4, -19]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0.2, 0, 0]}
          scale={1}
        />
      </group>

      <group position={[-2.2, -0.4, -19]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0.2, 0, 0]}
          scale={1}
        />
      </group>

      <group position={[1, -1.05, -19]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0.2, 0, 0]}
          scale={1}
        />
      </group>

      <group position={[4.6, -1.8, -19.01]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={cornerSmall.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={1}
        />
      </group>

      
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 2, -11]}
        rotation={[0, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 2, -7]}
        rotation={[0, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 2, -3]}
        rotation={[0, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 2, 1]}
        rotation={[0, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 2, 5]}
        rotation={[0, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 1.6, 9]}
        rotation={[0.1, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 1, 13]}
        rotation={[0.15, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[-18, 0.25, 16.9]}
        rotation={[0.19, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={cornerLarge.scene.clone()} 
        position={[-14, -0.5, 20.8]}
        rotation={[0.19, Math.PI / -2, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[5.7, -1.5, 16.7]}
        rotation={[0, Math.PI / 1, 0]}
        scale={1}
      />

      <primitive 
        object={straightTrack.scene.clone()} 
        position={[5.7, -1.5, 12.7]}
        rotation={[-0.1, Math.PI / 1.01, 0]}
        scale={1}
      />
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[5.82, -1.9, 8.7]}
        rotation={[-0.2, Math.PI / 1.01, 0]}
        scale={1}
      />
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[5.95, -2.7, 4.7]}
        rotation={[-0.3, Math.PI / 1.01, 0]}
        scale={1}
      />
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[6.07, -3.8, 1.1]}
        rotation={[-0.2, Math.PI / 1.01, 0]}
        scale={1}
      />
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[6.2, -4.5, -2.4]}
        rotation={[-0.1, Math.PI / 1, 0]}
        scale={1}
      />
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[6.35, -2.6, -13]}
        rotation={[0.2, Math.PI / 1.02, 0]}
        scale={1}
      />
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[6.23, -3.78, -9.2]}
        rotation={[0.3, Math.PI / 1.01, 0]}
        scale={1}
      />
      <primitive 
        object={straightTrack.scene.clone()} 
        position={[6.22, -4.9, -5.8]}
        rotation={[0.32, Math.PI / 1.001, 0]}
        scale={1}
      />

      {/* Tilted down track piece */}
      <group position={[-13.9, -0.52, 20.8]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0.15, 0, 0.2]}
          scale={1}
        />
      </group>

      <group position={[-10, -1.1, 20.75]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[0.17, 0, 0.14]}
          scale={1}
        />
      </group>

      <group position={[-6.3, -1.74, 20.7]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[-0.03, 0, 0.09]}
          scale={1}
        />
      </group>

      <group position={[-2.32, -1.62, 20.61]} rotation={[0, Math.PI / 2, 0]}>
        <primitive 
          object={straightTrack.scene.clone()} 
          position={[0, 0, 0]}
          rotation={[-0.05, 0, 0]}
          scale={1}
        />
      </group>

      <primitive 
        object={cornerLarge.scene.clone()} 
        position={[5.7, -1.5, 16.59]}
        rotation={[-0.02, 0, 0]}
        scale={1}
      />
    </group>
 
  );
};

// Preload track models
useGLTF.preload('/train/railroad-rail-straight.glb');
useGLTF.preload('/train/railroad-rail-corner-large.glb');
useGLTF.preload('/train/railroad-rail-corner-small.glb');

export default TrainSystem;

