// Elevator system for the shift platform

export interface Elevator {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  topY: number;
  bottomY: number;
  currentY: number;
  isMoving: boolean;
  wasOnElevator: boolean;
}

// Define the shift elevator between upper and lower artwork platforms
export const shiftElevator: Elevator = {
  minX: 4.5 - 0.75, 
  maxX: 4.5 + 0.75,  
  minZ: -0.75,
  maxZ: 0.75,
  topY: 0.1,     
  bottomY: -2, 
  currentY: 0.1,  
  isMoving: false,
  wasOnElevator: false,
};

// Check if a position is on the elevator
export function isOnElevator(x: number, z: number): boolean {
  const onElevator = (
    x >= shiftElevator.minX &&
    x <= shiftElevator.maxX &&
    z >= shiftElevator.minZ &&
    z <= shiftElevator.maxZ
  );
  
  return onElevator;
}

// Trigger elevator movement - toggles between top and bottom
export function triggerElevator(): void {
  if (!shiftElevator.isMoving) {
    // Toggle between top and bottom instantly
    shiftElevator.currentY = shiftElevator.currentY === shiftElevator.topY 
      ? shiftElevator.bottomY 
      : shiftElevator.topY;
  }
}

// Get current elevator height
export function getElevatorHeight(): number {
  return shiftElevator.currentY;
}

