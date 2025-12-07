declare module '@mkkellogg/gaussian-splats-3d' {
  export interface ViewerOptions {
    cameraUp?: [number, number, number];
    initialCameraPosition?: [number, number, number];
    initialCameraLookAt?: [number, number, number];
    rootElement?: HTMLElement;
    sharedMemoryForWorkers?: boolean;
    dynamicScene?: boolean;
    selfDrivenMode?: boolean;
    useBuiltInControls?: boolean;
    controlOptions?: {
      enableDamping?: boolean;
      dampingFactor?: number;
      enableZoom?: boolean;
      enableRotate?: boolean;
      enablePan?: boolean;
      enableKeyboardControls?: boolean;
    };
  }

  export interface SplatSceneOptions {
    splatAlphaRemovalThreshold?: number;
    showLoadingUI?: boolean;
    progressiveLoad?: boolean;
    onProgress?: (percent: number) => void;
  }

  export class Viewer {
    constructor(options?: ViewerOptions);
    addSplatScene(url: string, options?: SplatSceneOptions): Promise<void>;
    start(): void;
    dispose(): void;
    renderer?: { setSize: (width: number, height: number) => void };
    camera?: { aspect: number; updateProjectionMatrix: () => void };
    controls?: { reset: () => void };
  }
}

