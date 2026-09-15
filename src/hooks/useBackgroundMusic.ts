import { useState, useRef, useCallback, useEffect } from 'react';

const PLAYLIST = [
  '/music/Baguira.mp3',
  '/music/Boy.mp3',
  '/music/Sudo.mp3'
];

/**
 * Background music playlist: autoplay attempt on load, looping through songs,
 * play/pause toggle, and a start function for the first user interaction.
 */
export function useBackgroundMusic(trackSongPlayed: (songIndex: number) => void) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMusicPlayingRef = useRef(false);
  const currentSongIndexRef = useRef(0);

  // Start music on user interaction (bypasses autoplay restrictions)
  const startMusic = useCallback(() => {
    if (audioRef.current && !isMusicPlayingRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsMusicPlaying(true);
          isMusicPlayingRef.current = true;
          // Track first song
          trackSongPlayed(0);
        }).catch((error) => {
          console.log('Audio playback failed:', error);
        });
      }
    }
  }, [trackSongPlayed]);

  // Toggle music handler
  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
        isMusicPlayingRef.current = false;
      } else {
        audioRef.current.play();
        setIsMusicPlaying(true);
        isMusicPlayingRef.current = true;
      }
    }
  }, [isMusicPlaying]);

  // Initialize music on app start
  useEffect(() => {
    audioRef.current = new Audio(PLAYLIST[0]);
    audioRef.current.volume = 0.5;

    // Handle song end
    const handleSongEnd = () => {
      currentSongIndexRef.current = (currentSongIndexRef.current + 1) % PLAYLIST.length;
      if (audioRef.current) {
        audioRef.current.src = PLAYLIST[currentSongIndexRef.current];
        // Use ref to get current playing state
        if (isMusicPlayingRef.current) {
          audioRef.current.play().then(() => {
            // Track song when it starts playing
            trackSongPlayed(currentSongIndexRef.current);
          }).catch(() => {
            // Ignore play errors
          });
        }
      }
    };

    audioRef.current.addEventListener('ended', handleSongEnd);

    // Try to autoplay (may be blocked by browser)
    audioRef.current.play().then(() => {
      setIsMusicPlaying(true);
      isMusicPlayingRef.current = true;
      // Track first song
      trackSongPlayed(0);
    }).catch(() => {
      // music will start when user clicks START button
      setIsMusicPlaying(false);
      isMusicPlayingRef.current = false;
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleSongEnd);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [trackSongPlayed]);

  return { isMusicPlaying, toggleMusic, startMusic };
}
