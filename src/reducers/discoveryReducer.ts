// Reducer for managing all discovery/tutorial related state
export interface DiscoveryState {
  showLocationDiscovery: boolean;
  showProjectStudioDiscovery: boolean;
  hasVisitedProjectStudio: boolean;
  showLearningOutcomesDiscovery: boolean;
  hasVisitedLearningOutcomes: boolean;
  showArtworkDiscovery: boolean;
  hasVisitedArtwork: boolean;
  showWorkDiscovery: boolean;
  hasVisitedWork: boolean;
  showAllLocationsDiscovered: boolean;
  hasShownAllLocationsDiscovered: boolean;
}

export type DiscoveryAction =
  | { type: 'SHOW_LOCATION_DISCOVERY'; payload: boolean }
  | { type: 'VISIT_PROJECT_STUDIO' }
  | { type: 'SHOW_PROJECT_STUDIO_DISCOVERY'; payload: boolean }
  | { type: 'VISIT_LEARNING_OUTCOMES' }
  | { type: 'SHOW_LEARNING_OUTCOMES_DISCOVERY'; payload: boolean }
  | { type: 'VISIT_ARTWORK' }
  | { type: 'SHOW_ARTWORK_DISCOVERY'; payload: boolean }
  | { type: 'VISIT_WORK' }
  | { type: 'SHOW_WORK_DISCOVERY'; payload: boolean }
  | { type: 'SHOW_ALL_LOCATIONS_DISCOVERED' }
  | { type: 'DISMISS_ALL_LOCATIONS_DISCOVERED' }
  | { type: 'RESET_DISCOVERIES' };

export const initialDiscoveryState: DiscoveryState = {
  showLocationDiscovery: false,
  showProjectStudioDiscovery: false,
  hasVisitedProjectStudio: false,
  showLearningOutcomesDiscovery: false,
  hasVisitedLearningOutcomes: false,
  showArtworkDiscovery: false,
  hasVisitedArtwork: false,
  showWorkDiscovery: false,
  hasVisitedWork: false,
  showAllLocationsDiscovered: false,
  hasShownAllLocationsDiscovered: false,
};

export function discoveryReducer(state: DiscoveryState, action: DiscoveryAction): DiscoveryState {
  switch (action.type) {
    case 'SHOW_LOCATION_DISCOVERY':
      return { ...state, showLocationDiscovery: action.payload };
    
    case 'VISIT_PROJECT_STUDIO':
      return { ...state, hasVisitedProjectStudio: true };
    
    case 'SHOW_PROJECT_STUDIO_DISCOVERY':
      return { ...state, showProjectStudioDiscovery: action.payload };
    
    case 'VISIT_LEARNING_OUTCOMES':
      return { ...state, hasVisitedLearningOutcomes: true };
    
    case 'SHOW_LEARNING_OUTCOMES_DISCOVERY':
      return { ...state, showLearningOutcomesDiscovery: action.payload };
    
    case 'VISIT_ARTWORK':
      return { ...state, hasVisitedArtwork: true };
    
    case 'SHOW_ARTWORK_DISCOVERY':
      return { ...state, showArtworkDiscovery: action.payload };
    
    case 'VISIT_WORK':
      return { ...state, hasVisitedWork: true };
    
    case 'SHOW_WORK_DISCOVERY':
      return { ...state, showWorkDiscovery: action.payload };
    
    case 'SHOW_ALL_LOCATIONS_DISCOVERED':
      return { 
        ...state, 
        showAllLocationsDiscovered: true, 
        hasShownAllLocationsDiscovered: true 
      };
    
    case 'DISMISS_ALL_LOCATIONS_DISCOVERED':
      return { ...state, showAllLocationsDiscovered: false };
    
    case 'RESET_DISCOVERIES':
      return initialDiscoveryState;
    
    default:
      return state;
  }
}

