// Reducer for managing character magical transition animations
export interface CharacterAnimationState {
  opacity: number;
  scale: number;
  rotationY: number;
  positionOffset: [number, number, number];
}

export type CharacterAnimationAction =
  | { type: 'UPDATE_ALL'; payload: Partial<CharacterAnimationState> }
  | { type: 'SET_OPACITY'; payload: number }
  | { type: 'SET_SCALE'; payload: number }
  | { type: 'SET_ROTATION_Y'; payload: number }
  | { type: 'SET_POSITION_OFFSET'; payload: [number, number, number] }
  | { type: 'RESET_ANIMATION' };

export const initialCharacterAnimationState: CharacterAnimationState = {
  opacity: 1,
  scale: 1,
  rotationY: 0,
  positionOffset: [0, 0, 0],
};

export function characterAnimationReducer(
  state: CharacterAnimationState,
  action: CharacterAnimationAction
): CharacterAnimationState {
  switch (action.type) {
    case 'UPDATE_ALL':
      // Batch update multiple properties at once
      return { ...state, ...action.payload };
    
    case 'SET_OPACITY':
      return { ...state, opacity: action.payload };
    
    case 'SET_SCALE':
      return { ...state, scale: action.payload };
    
    case 'SET_ROTATION_Y':
      return { ...state, rotationY: action.payload };
    
    case 'SET_POSITION_OFFSET':
      return { ...state, positionOffset: action.payload };
    
    case 'RESET_ANIMATION':
      return initialCharacterAnimationState;
    
    default:
      return state;
  }
}

