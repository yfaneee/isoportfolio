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
      camera.position.set(
        0 + eased * 10,
        25 - eased * 17,
        25 - eased * 15
      );
      camera.lookAt(0, 0, 0);
      
      if (t >= 1) {
        onIntroComplete();
      }
    } else {
      // Camera moves WITH character, maintaining isometric offset
      camera.position.set(
        targetPosition[0] + 10,
        targetPosition[1] + 8,
        targetPosition[2] + 10
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

