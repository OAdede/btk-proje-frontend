import React, { useEffect, useRef } from 'react';
import './SoundPlayer.css';

const SoundPlayer = () => {
  const webampRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Dynamically import Webamp to avoid SSR issues
    const initWebamp = async () => {
      try {
        const Webamp = (await import('webamp')).default;
        
        // Check if Webamp is supported in this browser
        if (!Webamp.browserIsSupported()) {
          console.warn('Webamp is not supported in this browser');
          return;
        }

        // Create Webamp instance with configuration
        const webamp = new Webamp({
          initialTracks: [
            {
              url: '/sounds/music1.mp3',
              duration: 5,
              metaData: {
                artist: 'Sample Artist',
                title: 'Sample Track 1',
                album: 'Sample Album',
              },
            },
            {
              url: '/sounds/music2.mp3',
              duration: 5,
              metaData: {
                artist: 'Sample Artist',
                title: 'Sample Track 2',
                album: 'Sample Album',
              },
            },
            {
              url: '/sounds/notification.mp3',
              duration: 5,
              metaData: {
                artist: 'System',
                title: 'Notification Sound',
                album: 'System Sounds',
              },
            },
            {
              url: '/sounds/alarm.mp3',
              duration: 5,
              metaData: {
                artist: 'System',
                title: 'Alarm',
                album: 'System Sounds',
              },
            },
            {
              url: '/sounds/nature.mp3',
              duration: 5,
              metaData: {
                artist: 'Nature',
                title: 'Nature Sound',
                album: 'Ambient',
              },
            },
          ],
          __initialWindowLayout: {
            main: { position: { x: 0, y: 0 } },
            equalizer: { position: { x: 0, y: 116 } },
            playlist: { position: { x: 0, y: 232 }, size: [0, 4] },
            milkdrop: { position: { x: 275, y: 0 }, size: [1, 0] },
          },
          // Enable file dropping
          enableDragging: true,
          // Enable file uploads
          enableFileUpload: true,
          // Enable playlist editing
          enablePlaylistEditing: true,
          // Enable keyboard shortcuts
          enableKeyboardShortcuts: true,
          // Enable visualizations
          enableVisualizations: true,
          // Enable equalizer
          enableEqualizer: true,
          // Enable playlist
          enablePlaylist: true,
          // Enable milkdrop (visualization)
          enableMilkdrop: true,
        });

        // Store reference to webamp instance
        webampRef.current = webamp;

        // Render Webamp when ready
        webamp.renderWhenReady(containerRef.current).then(() => {
          console.log('Webamp rendered successfully!');
        });

        // Cleanup function
        return () => {
          if (webampRef.current) {
            webampRef.current.dispose();
          }
        };
      } catch (error) {
        console.error('Failed to initialize Webamp:', error);
      }
    };

    initWebamp();
  }, []);

  return (
    <div className="sound-player-container">
      {/* Webamp container - Webamp will render itself as a child of body */}
      <div 
        ref={containerRef} 
        id="webamp-container"
        className="webamp-container"
        style={{
          width: '100%',
          height: '400px',
          position: 'relative',
          zIndex: 1000
        }}
      />
      
      {/* Fallback message if Webamp fails to load */}
      <div className="webamp-fallback" style={{ display: 'none' }}>
        <p>Webamp failed to load. Please refresh the page or check your browser compatibility.</p>
      </div>
    </div>
  );
};

export default SoundPlayer;
