import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface CameraControllerProps {
  targetPosition: [number, number, number];
  introComplete: boolean;
  onIntroComplete: () => void;
}

const CameraController: React.FC<CameraControllerProps> = ({ 
  targetPosition, 
  introComplete,
  onIntroComplete 
}) => {
  const { camera } = useThree();
  const introTimeRef = useRef(0);
  const introDuration = 3;

  useFrame((state, delta) => {
    if (!introComplete) {
      // Intro animation
      introTimeRef.current += delta;
      const t = Math.min(introTimeRef.current / introDuration, 1);
      
      const eased = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Animate camera from far to close
      // Start: (0, 40, 40), End: (6, 5, 6) - matching follow camera
      camera.position.set(
        0 + eased * 6,
        40 - eased * (40 - 5),
        40 - eased * (40 - 6)
      );
      camera.lookAt(0, 0, 0);
      
      if (t >= 1) {
        onIntroComplete();
      }
    } else {
      // Camera moves WITH character, maintaining isometric offset - closer zoom
      const offset = 6;
      camera.position.set(
        targetPosition[0] + 6,
        targetPosition[1] + 5,
        targetPosition[2] + 6
      );
      
      // Look at the character
      camera.lookAt(targetPosition[0], targetPosition[1], targetPosition[2]);
    }
  });

  return null;
};

// Easing function for smooth intro animation
function easeInOutCubic(t: number): number {
  return t < 0.5 
    ? 4 * t * t * t 
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default CameraController;

