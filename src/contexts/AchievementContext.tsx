import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  iconPath: string;
}

interface AchievementContextType {
  achievements: Achievement[];
  trackLocationVisit: (location: string) => void;
  trackContentTabOpen: (tabId: string) => void;
  trackGSplatViewerUsage: () => void;
  trackBillboardOpen: (billboardKey: string) => void;
  trackSongPlayed: (songIndex: number) => void;
  newlyUnlockedAchievement: string | null;
  clearNewlyUnlocked: () => void;
  resetAchievements: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
};

interface AchievementProviderProps {
  children: ReactNode;
}

export const AchievementProvider: React.FC<AchievementProviderProps> = ({ children }) => {
  // Load saved progress from localStorage
  const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert arrays back to Sets
        if (Array.isArray(parsed)) {
          return new Set(parsed) as T;
        }
        return parsed as T;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };

  // Track visited locations 
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(() => 
    loadFromLocalStorage('achievement_visitedLocations', new Set())
  );
  
  // Track opened content tabs
  const [openedContentTabs, setOpenedContentTabs] = useState<Set<string>>(() =>
    loadFromLocalStorage('achievement_openedContentTabs', new Set())
  );
  
  // Track gsplat viewer usage
  const [hasUsedGSplat, setHasUsedGSplat] = useState(() =>
    loadFromLocalStorage('achievement_hasUsedGSplat', false)
  );
  
  // Track opened billboards 
  const [openedBillboards, setOpenedBillboards] = useState<Set<string>>(() =>
    loadFromLocalStorage('achievement_openedBillboards', new Set())
  );
  
  // Track played songs 
  const [playedSongs, setPlayedSongs] = useState<Set<number>>(() =>
    loadFromLocalStorage('achievement_playedSongs', new Set())
  );
  
  // Track newly unlocked achievements
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<string | null>(null);
  
  // Track previously unlocked achievements to detect new unlocks
  const [previouslyUnlocked, setPreviouslyUnlocked] = useState<Set<string>>(() =>
    loadFromLocalStorage('achievement_previouslyUnlocked', new Set())
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('achievement_visitedLocations', JSON.stringify(Array.from(visitedLocations)));
  }, [visitedLocations]);

  useEffect(() => {
    localStorage.setItem('achievement_openedContentTabs', JSON.stringify(Array.from(openedContentTabs)));
  }, [openedContentTabs]);

  useEffect(() => {
    localStorage.setItem('achievement_hasUsedGSplat', JSON.stringify(hasUsedGSplat));
  }, [hasUsedGSplat]);

  useEffect(() => {
    localStorage.setItem('achievement_openedBillboards', JSON.stringify(Array.from(openedBillboards)));
  }, [openedBillboards]);

  useEffect(() => {
    localStorage.setItem('achievement_playedSongs', JSON.stringify(Array.from(playedSongs)));
  }, [playedSongs]);

  useEffect(() => {
    localStorage.setItem('achievement_previouslyUnlocked', JSON.stringify(Array.from(previouslyUnlocked)));
  }, [previouslyUnlocked]);

  const trackLocationVisit = useCallback((location: string) => {
    setVisitedLocations(prev => {
      const newSet = new Set(prev);
      newSet.add(location);
      return newSet;
    });
  }, []);

  const trackContentTabOpen = useCallback((tabId: string) => {
    setOpenedContentTabs(prev => {
      const newSet = new Set(prev);
      newSet.add(tabId);
      return newSet;
    });
  }, []);

  const trackGSplatViewerUsage = useCallback(() => {
    setHasUsedGSplat(true);
  }, []);

  const trackBillboardOpen = useCallback((billboardKey: string) => {
    setOpenedBillboards(prev => {
      const newSet = new Set(prev);
      newSet.add(billboardKey);
      return newSet;
    });
  }, []);

  const trackSongPlayed = useCallback((songIndex: number) => {
    setPlayedSongs(prev => {
      const newSet = new Set(prev);
      newSet.add(songIndex);
      return newSet;
    });
  }, []);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlockedAchievement(null);
  }, []);

  const resetAchievements = useCallback(() => {
    // Clear all achievement data
    setVisitedLocations(new Set());
    setOpenedContentTabs(new Set());
    setHasUsedGSplat(false);
    setOpenedBillboards(new Set());
    setPlayedSongs(new Set());
    setPreviouslyUnlocked(new Set());
    setNewlyUnlockedAchievement(null);
    
    // Clear localStorage
    localStorage.removeItem('achievement_visitedLocations');
    localStorage.removeItem('achievement_openedContentTabs');
    localStorage.removeItem('achievement_hasUsedGSplat');
    localStorage.removeItem('achievement_openedBillboards');
    localStorage.removeItem('achievement_playedSongs');
    localStorage.removeItem('achievement_previouslyUnlocked');
  }, []);

  // Define achievements 
  const achievements: Achievement[] = useMemo(() => [
    {
      id: 'location-explorer',
      title: 'Location Explorer',
      description: 'Discover all 4 locations in the portfolio world',
      isUnlocked: visitedLocations.size >= 4,
      progress: visitedLocations.size,
      maxProgress: 4,
      iconPath: '/images/menu/location.svg'
    },
    {
      id: 'content-master',
      title: 'Content Master',
      description: 'Open all 5 Learning Outcome content tabs',
      isUnlocked: openedContentTabs.size >= 5,
      progress: openedContentTabs.size,
      maxProgress: 5,
      iconPath: '/images/menu/content.svg'
    },
    {
      id: 'gsplat-enthusiast',
      title: '3D Enthusiast',
      description: 'Use the Gaussian Splat 3D viewer',
      isUnlocked: hasUsedGSplat,
      progress: hasUsedGSplat ? 1 : 0,
      maxProgress: 1,
      iconPath: '/images/menu/gsplat.svg'
    },
    {
      id: 'project-viewer',
      title: 'Project Viewer',
      description: 'View all 4 projects from the billboards',
      isUnlocked: openedBillboards.size >= 4,
      progress: openedBillboards.size,
      maxProgress: 4,
      iconPath: '/images/menu/projectview.svg'
    },
    {
      id: 'music-lover',
      title: 'Music Lover',
      description: 'Listen to all 3 songs in the playlist',
      isUnlocked: playedSongs.size >= 3,
      progress: playedSongs.size,
      maxProgress: 3,
      iconPath: '/images/menu/music.svg'
    }
  ], [visitedLocations.size, openedContentTabs.size, hasUsedGSplat, openedBillboards.size, playedSongs.size]);

  // Detect newly unlocked achievements
  useEffect(() => {
    achievements.forEach(achievement => {
      if (achievement.isUnlocked && !previouslyUnlocked.has(achievement.id)) {
        // Achievement just unlocked!
        // Add 3 second delay for Location Explorer to avoid overlap with 4th location notification
        const delay = achievement.id === 'location-explorer' ? 3000 : 0;
        
        setTimeout(() => {
          setNewlyUnlockedAchievement(achievement.title);
        }, delay);
        
        setPreviouslyUnlocked(prev => {
          const newSet = new Set(prev);
          newSet.add(achievement.id);
          return newSet;
        });
      }
    });
  }, [achievements, previouslyUnlocked]);

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        trackLocationVisit,
        trackContentTabOpen,
        trackGSplatViewerUsage,
        trackBillboardOpen,
        trackSongPlayed,
        newlyUnlockedAchievement,
        clearNewlyUnlocked,
        resetAchievements
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

