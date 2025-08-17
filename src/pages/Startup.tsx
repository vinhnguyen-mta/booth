import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import styles from './Startup.module.css';

export const Startup: React.FC = () => {
  const navigate = useNavigate();
  
  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => {
          // Navigate to landing page after fullscreen
          setTimeout(() => {
            navigate('/password');
          }, 500);
        })
        .catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
          // Navigate anyway if fullscreen fails
          navigate('/password');
        });
    } else {
      // Fallback if fullscreen is not supported
      navigate('/password');
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.fullscreenPrompt}>
          <button 
            onClick={handleFullscreen}
            className={styles.fullscreenButton}
            aria-label="Full Màn Hình"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="blue" strokeWidth="2" fill="none">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            <span style={{ color: 'blue' }}>Full Màn Hình</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Startup;