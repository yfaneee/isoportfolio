import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import * as THREE from 'three';
import './GSplatViewer.css';

// Default camera settings
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(-3, -2, -3);
const DEFAULT_CAMERA_LOOK_AT = new THREE.Vector3(3, 1, 3);

interface GSplatViewerProps {
  plyUrl: string;
  className?: string;
  onLoad?: () => void;
}

const GSplatViewer: React.FC<GSplatViewerProps> = ({ plyUrl, className = '', onLoad }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    if (!containerRef.current || isLoading || isLoaded) return;

    setIsLoading(true);
    setError(null);
    setLoadProgress(0);

    try {
      // Create the viewer with orbit controls (mouse only)
      const viewer = new GaussianSplats3D.Viewer({
        cameraUp: [0, -1, 0],
        initialCameraPosition: [-3, -2, -3],
        initialCameraLookAt: [3, 1, 3],
        rootElement: containerRef.current,
        sharedMemoryForWorkers: false,
        dynamicScene: false,
        selfDrivenMode: true,
        useBuiltInControls: true,
        // Disable keyboard controls to avoid WASD conflict
        controlOptions: {
          enableDamping: true,
          dampingFactor: 0.1,
          enableZoom: true,
          enableRotate: true,
          enablePan: true,
          // These disable keyboard controls
          enableKeyboardControls: false,
        }
      });

      viewerRef.current = viewer;

      // Add the splat scene with progress callback
      await viewer.addSplatScene(plyUrl, {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        progressiveLoad: true,
        onProgress: (percent: number) => {
          setLoadProgress(Math.round(percent));
        }
      });

      // Start the viewer
      viewer.start();
      
      setIsLoaded(true);
      setIsLoading(false);
      
      // Call onLoad callback after a short delay for smooth experience
      setTimeout(() => {
        onLoad?.();
      }, 1000);
    } catch (err) {
      console.error('Failed to load GSplat model:', err);
      setError('Failed to load 3D model. Please try again.');
      setIsLoading(false);
    }
  }, [plyUrl, isLoading, isLoaded, onLoad]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const viewer = viewerRef.current;
      if (viewer) {
        viewerRef.current = null;
        
        try {
          viewer.stop?.();
        } catch (e) {

        }
        
        setTimeout(() => {
          try {
            if (viewer.renderer) {
              viewer.renderer.dispose();
            }
            if (viewer.splatMesh) {
              viewer.splatMesh.dispose?.();
            }
          } catch (e) {
          }
        }, 0);
      }
    };
  }, []);

  // Handle container resize
  useEffect(() => {
    if (!viewerRef.current || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (viewerRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        viewerRef.current.renderer?.setSize(width, height);
        if (viewerRef.current.camera) {
          viewerRef.current.camera.aspect = width / height;
          viewerRef.current.camera.updateProjectionMatrix();
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isLoaded]);

  const resetCamera = useCallback(() => {
    if (viewerRef.current) {
      const viewer = viewerRef.current;
      
      // Set camera position
      if (viewer.camera) {
        viewer.camera.position.copy(DEFAULT_CAMERA_POSITION);
        viewer.camera.lookAt(DEFAULT_CAMERA_LOOK_AT);
        viewer.camera.updateProjectionMatrix();
      }
      
      // Update controls target
      if (viewer.controls) {
        viewer.controls.target.copy(DEFAULT_CAMERA_LOOK_AT);
        viewer.controls.update();
      }
    }
  }, []);

  return (
    <div className={`gsplat-viewer-wrapper ${className}`}>
      {!isLoaded && !isLoading && (
        <div className="gsplat-load-prompt">
          <div className="gsplat-load-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" /> 
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className="gsplat-load-title">3D Gaussian Splat</h3>
          <p className="gsplat-load-description">
            Achterom Corner - Eindhoven (~90MB)
          </p>
          <button className="gsplat-load-button" onClick={loadModel}>
            <span className="gsplat-load-button-icon">▶</span>
            Load 3D Model
          </button>
        </div>
      )}

      {isLoading && (
        <div className="gsplat-loading">
          <div className="gsplat-loading-spinner" />
          <p className="gsplat-loading-text">Loading 3D model...</p>
          <div className="gsplat-progress-bar">
            <div 
              className="gsplat-progress-fill" 
              style={{ width: `${loadProgress}%` }} 
            />
          </div>
          <p className="gsplat-progress-text">{loadProgress}%</p>
        </div>
      )}

      {error && (
        <div className="gsplat-error">
          <p>{error}</p>
          <button className="gsplat-retry-button" onClick={loadModel}>
            Try Again
          </button>
        </div>
      )}

      <div 
        ref={containerRef} 
        className={`gsplat-canvas-container ${isLoaded ? 'visible' : ''}`}
      />

      {isLoaded && (
        <div className="gsplat-controls-hint">
          <span>Drag to rotate • Scroll to zoom • Right-click to pan</span>
          <button className="gsplat-reset-button" onClick={resetCamera}>
            Reset View
          </button>
        </div>
      )}
    </div>
  );
};

export default GSplatViewer;

