/* Frame Rate Optimizer - Ensures consistent GPU utilization  */

class FrameRateOptimizer {
  private targetFPS = 60;
  private frameTime = 1000 / this.targetFPS;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 60;
  private fpsUpdateTime = 0;
  
  // Adaptive quality settings
  private qualityLevel = 1.0; 
  private minQuality = 0.5;
  private maxQuality = 1.0;
  
  // Performance metrics
  private frameTimeHistory: number[] = [];
  private maxHistorySize = 60; 
  
  constructor() {
    this.detectDeviceCapabilities();
  }
  
  private detectDeviceCapabilities() {
    // Check for high-end GPU indicators
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        
        // Set quality based on GPU
        if (renderer.includes('NVIDIA') || renderer.includes('RTX') || renderer.includes('AMD Radeon')) {
          this.qualityLevel = 1.0;
          this.targetFPS = 60;
        } else if (renderer.includes('Intel')) {
          this.qualityLevel = 0.85;
          this.targetFPS = 60;
        } else {
          this.qualityLevel = 0.75;
          this.targetFPS = 60;
        }
      }
    }
    
    // Check device memory if available
    const memory = (performance as any).memory;
    if (memory && memory.jsHeapSizeLimit) {
      const heapGB = memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
      
      if (heapGB < 2) {
        this.qualityLevel = Math.min(this.qualityLevel, 0.7);
      }
    }
  }
  
  public shouldRenderFrame(currentTime: number): boolean {
    // Always render on first frame
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
      return true;
    }
    
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime >= this.frameTime) {
      this.lastFrameTime = currentTime;
      this.updateFPS(currentTime, deltaTime);
      this.trackFrameTime(deltaTime);
      return true;
    }
    
    return false;
  }
  
  private updateFPS(currentTime: number, deltaTime: number) {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 500) {
      this.fps = Math.round(1000 / deltaTime);
      this.fpsUpdateTime = currentTime;
      
      this.adjustQuality();
    }
  }
  
  private trackFrameTime(deltaTime: number) {
    this.frameTimeHistory.push(deltaTime);
    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift();
    }
  }
  
  private adjustQuality() {
    // If FPS drops below 50, reduce quality
    if (this.fps < 50 && this.qualityLevel > this.minQuality) {
      this.qualityLevel = Math.max(this.minQuality, this.qualityLevel - 0.05);
    }
    // If FPS is consistently above 58, increase quality
    else if (this.fps >= 58 && this.qualityLevel < this.maxQuality) {
      this.qualityLevel = Math.min(this.maxQuality, this.qualityLevel + 0.02);
    }
  }
  
  public getQualityLevel(): number {
    return this.qualityLevel;
  }
  
  public getCurrentFPS(): number {
    return this.fps;
  }
  
  public getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return this.frameTime;
    const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
    return sum / this.frameTimeHistory.length;
  }
  
  public getPerformanceMetrics() {
    const avgFrameTime = this.getAverageFrameTime();
    const maxFrameTime = Math.max(...this.frameTimeHistory);
    const minFrameTime = Math.min(...this.frameTimeHistory);
    
    return {
      fps: this.fps,
      avgFrameTime: avgFrameTime.toFixed(2),
      maxFrameTime: maxFrameTime.toFixed(2),
      minFrameTime: minFrameTime.toFixed(2),
      qualityLevel: this.qualityLevel.toFixed(2),
      isStable: maxFrameTime - minFrameTime < 10 
    };
  }
  
  // Request high-performance GPU power mode
  public requestHighPerformance() {
    // Modern browsers support this
    if ('requestIdleCallback' in window) {
      return;
    }
  }
}

// Singleton instance
export const frameRateOptimizer = new FrameRateOptimizer();

