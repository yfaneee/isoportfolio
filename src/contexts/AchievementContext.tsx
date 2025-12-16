import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

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
  // Track visited locations 
  const [visitedLocations, setVisitedLocations] = useState<Set<string>>(new Set());
  
  // Track opened content tabs
  const [openedContentTabs, setOpenedContentTabs] = useState<Set<string>>(new Set());
  
  // Track gsplat viewer usage
  const [hasUsedGSplat, setHasUsedGSplat] = useState(false);
  
  // Track opened billboards 
  const [openedBillboards, setOpenedBillboards] = useState<Set<string>>(new Set());
  
  // Track played songs 
  const [playedSongs, setPlayedSongs] = useState<Set<number>>(new Set());
  
  // Track newly unlocked achievements
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<string | null>(null);
  
  // Track previously unlocked achievements to detect new unlocks
  const [previouslyUnlocked, setPreviouslyUnlocked] = useState<Set<string>>(new Set());

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

  // Define achievements
  const achievements: Achievement[] = [
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
  ];

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
        clearNewlyUnlocked
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

