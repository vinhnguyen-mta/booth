// Fullscreen Utility
// Handles fullscreen mode with proper event management

export interface FullscreenOptions {
  element?: HTMLElement;
  onEnter?: () => void;
  onExit?: () => void;
  onError?: (error: Error) => void;
}

export class FullscreenManager {
  private isFullscreen = false;
  private element: HTMLElement;
  private options: FullscreenOptions;
  private boundHandleChange: () => void;
  private boundHandleError: (event: Event) => void;
  private stateCallback?: (isFullscreen: boolean) => void;

  constructor(options: FullscreenOptions = {}) {
    this.element = options.element || document.documentElement;
    this.options = options;
    
    // Bind event handlers
    this.boundHandleChange = this.handleFullscreenChange.bind(this);
    this.boundHandleError = this.handleFullscreenError.bind(this);
    
    // Add event listeners
    this.addEventListeners();
  }

  // UPDATE: Set callback for state synchronization
  setStateCallback(callback: (isFullscreen: boolean) => void) {
    this.stateCallback = callback;
  }

  private addEventListeners(): void {
    document.addEventListener('fullscreenchange', this.boundHandleChange);
    document.addEventListener('webkitfullscreenchange', this.boundHandleChange);
    document.addEventListener('mozfullscreenchange', this.boundHandleChange);
    document.addEventListener('MSFullscreenChange', this.boundHandleChange);

    document.addEventListener('fullscreenerror', this.boundHandleError);
    document.addEventListener('webkitfullscreenerror', this.boundHandleError);
    document.addEventListener('mozfullscreenerror', this.boundHandleError);
    document.addEventListener('MSFullscreenError', this.boundHandleError);

    // Handle ESC key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isFullscreen) {
        this.exit();
      }
    });
  }

  private removeEventListeners(): void {
    document.removeEventListener('fullscreenchange', this.boundHandleChange);
    document.removeEventListener('webkitfullscreenchange', this.boundHandleChange);
    document.removeEventListener('mozfullscreenchange', this.boundHandleChange);
    document.removeEventListener('MSFullscreenChange', this.boundHandleChange);

    document.removeEventListener('fullscreenerror', this.boundHandleError);
    document.removeEventListener('webkitfullscreenerror', this.boundHandleError);
    document.removeEventListener('mozfullscreenerror', this.boundHandleError);
    document.removeEventListener('MSFullscreenError', this.boundHandleError);
  }

  private handleFullscreenChange(): void {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isCurrentlyFullscreen !== this.isFullscreen) {
      this.isFullscreen = isCurrentlyFullscreen;
      
      // UPDATE: Sync with global state
      this.stateCallback?.(this.isFullscreen);
      
      if (this.isFullscreen) {
        this.options.onEnter?.();
        this.applyFullscreenStyles();
      } else {
        this.options.onExit?.();
        this.removeFullscreenStyles();
      }
    }
  }

  private handleFullscreenError(event: Event): void {
    const error = new Error('Fullscreen request failed');
    this.options.onError?.(error);
  }

  private applyFullscreenStyles(): void {
    // Hide scrollbars and prevent interaction with browser UI
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Add fullscreen class for custom styling
    document.body.classList.add('fullscreen-mode');
    
    // Prevent context menu and selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Prevent page zoom and scaling
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Add CSS to prevent tab switching (limited effectiveness)
    const style = document.createElement('style');
    style.id = 'fullscreen-styles';
    style.textContent = `
      .fullscreen-mode {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 999999 !important;
        background: inherit !important;
      }
      
      .fullscreen-mode * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      .fullscreen-mode .step-container {
        height: 100vh !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }

  private removeFullscreenStyles(): void {
    // Restore scrollbars
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    // Remove fullscreen class
    document.body.classList.remove('fullscreen-mode');
    
    // Restore selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    // Restore viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
    
    // Remove custom styles
    const style = document.getElementById('fullscreen-styles');
    if (style) {
      style.remove();
    }
  }

  async enter(): Promise<void> {
    // Kiểm tra trạng thái DOM thực tế
    if (this.isFullscreen) return;

    try {
      if (this.element.requestFullscreen) {
        await this.element.requestFullscreen();
      } else if ((this.element as any).webkitRequestFullscreen) {
        await (this.element as any).webkitRequestFullscreen();
      } else if ((this.element as any).mozRequestFullScreen) {
        await (this.element as any).mozRequestFullScreen();
      } else if ((this.element as any).msRequestFullscreen) {
        await (this.element as any).msRequestFullscreen();
      } else {
        throw new Error('Fullscreen API not supported');
      }
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  async exit(): Promise<void> {
    // Chỉ thoát nếu thực sự đang fullscreen
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    
    if (!isCurrentlyFullscreen) return;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  toggle(): Promise<void> {
    return this.isFullscreen ? this.exit() : this.enter();
  }

  getIsFullscreen(): boolean {
    return this.isFullscreen;
  }

  destroy(): void {
    this.removeEventListeners();
    if (this.isFullscreen) {
      this.exit();
    }
  }
}

// Export singleton instance
export const fullscreenManager = new FullscreenManager();