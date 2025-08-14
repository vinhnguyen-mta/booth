import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { fullscreenManager } from '../utils/fullscreen';
import { useAppStore } from '../store/useAppStore';

interface FullscreenButtonProps {
  className?: string;
  language: 'en' | 'vi';
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  className = '',
  language
}) => {
  // UPDATE: Use global state for fullscreen
  const { isFullscreen, setFullscreen } = useAppStore();

  useEffect(() => {
    // UPDATE: Sync fullscreen manager with global state
    fullscreenManager.options = {
      onEnter: () => setFullscreen(true),
      onExit: () => setFullscreen(false),
      onError: (error) => {
        console.error('Fullscreen error:', error);
        alert(language === 'vi' 
          ? 'Không thể chuyển chế độ toàn màn hình' 
          : 'Cannot enter fullscreen mode'
        );
      }
    };

    // UPDATE: Set state callback for synchronization
    fullscreenManager.setStateCallback(setFullscreen);
    
    // UPDATE: Sync initial state
    const currentState = fullscreenManager.getIsFullscreen();
    if (currentState !== isFullscreen) {
      setFullscreen(currentState);
    }

    return () => {
      // Cleanup on unmount
      if (isFullscreen) {
        fullscreenManager.exit();
      }
    };
  }, [language, isFullscreen, setFullscreen]);

  const handleToggle = async () => {
    try {
      await fullscreenManager.toggle();
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md ${className}`}
      title={isFullscreen 
        ? (language === 'vi' ? 'Thoát toàn màn hình (ESC)' : 'Exit fullscreen (ESC)')
        : (language === 'vi' ? 'Chế độ toàn màn hình' : 'Enter fullscreen')
      }
    >
      {isFullscreen ? (
        <>
          <Minimize className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'vi' ? 'Thoát' : 'Exit'}
          </span>
        </>
      ) : (
        <>
          <Maximize className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'vi' ? 'Toàn màn hình' : 'Fullscreen'}
          </span>
        </>
      )}
    </button>
  );
};