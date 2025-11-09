// Reducer for managing billboard interaction state
export interface BillboardState {
  isHoveringBillboard: boolean;
  isBillboardFullscreen: boolean;
  showWebsiteOverlay: boolean;
  currentWebsiteUrl: string;
  currentBillboardKey: string;
  triggerBillboardExit: boolean;
}

export type BillboardAction =
  | { type: 'HOVER_BILLBOARD'; payload: { isHovering: boolean; billboardKey?: string } }
  | { type: 'ENTER_FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' }
  | { type: 'SHOW_WEBSITE'; payload: { url: string; billboardKey: string } }
  | { type: 'HIDE_WEBSITE' }
  | { type: 'TRIGGER_EXIT' }
  | { type: 'EXIT_COMPLETE' }
  | { type: 'RESET_BILLBOARD' };

export const initialBillboardState: BillboardState = {
  isHoveringBillboard: false,
  isBillboardFullscreen: false,
  showWebsiteOverlay: false,
  currentWebsiteUrl: '',
  currentBillboardKey: '',
  triggerBillboardExit: false,
};

export function billboardReducer(state: BillboardState, action: BillboardAction): BillboardState {
  switch (action.type) {
    case 'HOVER_BILLBOARD':
      return {
        ...state,
        isHoveringBillboard: action.payload.isHovering,
        currentBillboardKey: action.payload.billboardKey || state.currentBillboardKey,
      };
    
    case 'ENTER_FULLSCREEN':
      return { ...state, isBillboardFullscreen: true };
    
    case 'EXIT_FULLSCREEN':
      return { ...state, isBillboardFullscreen: false };
    
    case 'SHOW_WEBSITE':
      return {
        ...state,
        showWebsiteOverlay: true,
        currentWebsiteUrl: action.payload.url,
        currentBillboardKey: action.payload.billboardKey,
      };
    
    case 'HIDE_WEBSITE':
      return {
        ...state,
        showWebsiteOverlay: false,
        currentWebsiteUrl: '',
        triggerBillboardExit: true,
      };
    
    case 'TRIGGER_EXIT':
      return { ...state, triggerBillboardExit: true };
    
    case 'EXIT_COMPLETE':
      return { 
        ...state, 
        triggerBillboardExit: false,
        isBillboardFullscreen: false 
      };
    
    case 'RESET_BILLBOARD':
      return initialBillboardState;
    
    default:
      return state;
  }
}

