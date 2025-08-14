import React from 'react';
import { motion } from 'framer-motion';
import { LanguageToggle } from './LanguageToggle';
//import { FullscreenButton } from './FullscreenButton';
import { useAppStore } from '../store/useAppStore';
import { fullscreenManager } from '../utils/fullscreen';

interface LayoutProps {
  children: React.ReactNode;
  showLanguageToggle?: boolean;
 // showFullscreenButton?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showLanguageToggle = true,
 // showFullscreenButton = true
}) => {
  const { language, isFullscreen } = useAppStore();

  // UPDATE: Maintain fullscreen state across navigation
  React.useEffect(() => {
    // Maintain fullscreen state across page navigation
    const maintainFullscreen = () => {
      const currentFullscreenState = fullscreenManager.getIsFullscreen();
      
      if (isFullscreen && !currentFullscreenState) {
        // Re-enter fullscreen if state says we should be in fullscreen
        setTimeout(() => {
          fullscreenManager.enter().catch(console.error);
        }, 100);
      }
    };

    // Check on mount and when visibility changes
    maintainFullscreen();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        maintainFullscreen();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFullscreen]);

  // UPDATE: Prevent fullscreen exit on navigation
  React.useEffect(() => {
    if (isFullscreen) {
      const preventExit = (e: KeyboardEvent) => {
        // Allow ESC to exit fullscreen, but maintain state
        if (e.key === 'Escape') {
          // Let the browser handle ESC, but don't prevent it
          return;
        }
        
        // Prevent other keys that might exit fullscreen
        if (e.key === 'F11' || (e.altKey && e.key === 'Tab')) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('keydown', preventExit);
      
      return () => {
        document.removeEventListener('keydown', preventExit);
      };
    }
  }, [isFullscreen]);

  return (
    <div className={`step-container h-full bg-gradient-to-br from-gray-50 via-white to-pink-50 relative ${
      isFullscreen ? 'fullscreen-layout' : ''
    }`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>
      
      {/* Top controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {showLanguageToggle && <LanguageToggle />}
        {/*{showFullscreenButton && <FullscreenButton language={language} />}*/}
      </div>
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative z-10 h-full flex flex-col"
      >
        {children}
      </motion.main>
    </div>
  );
};