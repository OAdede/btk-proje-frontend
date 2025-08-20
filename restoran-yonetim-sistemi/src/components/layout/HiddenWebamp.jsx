import React, { useEffect, useRef, useState } from 'react';
import './HiddenWebamp.css';

const HiddenWebamp = () => {
  const webampRef = useRef(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [typedKeys, setTypedKeys] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleKeyPress = (event) => {
      // Add the pressed key to our buffer
      const newTypedKeys = typedKeys + event.key.toLowerCase();
      setTypedKeys(newTypedKeys);

             // Check if "makenoise" is in the buffer
       if (newTypedKeys.includes('makenoise')) {
         setShowConfirmPopup(true);
         setTypedKeys(''); // Reset the buffer
       }

      // Keep only the last 20 characters to prevent memory issues
      if (newTypedKeys.length > 20) {
        setTypedKeys(newTypedKeys.slice(-20));
      }

      // Clear the buffer after 3 seconds of inactivity
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setTypedKeys('');
      }, 3000);
    };

    

    document.addEventListener('keydown', handleKeyPress);

         return () => {
       document.removeEventListener('keydown', handleKeyPress);
       clearTimeout(timeoutId);
     };
  }, [typedKeys]);

  const initWebamp = async () => {
    try {
      const Webamp = (await import('webamp')).default;
      
      // Check if Webamp is supported in this browser
      if (!Webamp.browserIsSupported()) {
        console.warn('Webamp is not supported in this browser');
        return;
      }

               // Load user-added music from localStorage
         const userMusic = JSON.parse(localStorage.getItem('webampMusic') || '[]');
         
         // Create Webamp instance with configuration
         const webamp = new Webamp({
           initialTracks: [
             // Default tracks
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
             // User-added tracks
             ...userMusic.map(music => ({
               url: music.file,
               duration: 0, // Will be auto-detected
               metaData: {
                 artist: 'User',
                 title: music.name,
                 album: 'User Added Music',
               },
             })),
           ],
        __initialWindowLayout: {
          main: { position: { x: 100, y: 100 } },
          equalizer: { position: { x: 100, y: 216 } },
          playlist: { position: { x: 100, y: 332 }, size: [0, 4] },
          milkdrop: { position: { x: 375, y: 100 }, size: [1, 0] },
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
        console.log('Hidden Webamp rendered successfully!');
      });

    } catch (error) {
      console.error('Failed to initialize Hidden Webamp:', error);
    }
  };

  const handleConfirmYes = () => {
    setShowConfirmPopup(false);
    setIsVisible(true);
    // Initialize Webamp after a short delay to ensure DOM is ready
    setTimeout(() => {
      initWebamp();
    }, 100);
  };

  const handleConfirmNo = () => {
    setShowConfirmPopup(false);
  };

  const handleClose = () => {
    // Don't dispose of Webamp, just hide the overlay
    // This allows music to continue playing in the background
    setIsVisible(false);
  };

  const handleCloseCompletely = () => {
    // This function completely closes Webamp and stops all music
    if (webampRef.current) {
      webampRef.current.dispose();
      webampRef.current = null;
    }
    setIsVisible(false);
  };

  const handleAddMusic = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      // Show loading message
      alert(`Adding ${files.length} music file(s)... This may take a moment for large files.`);
      
      // Store files in localStorage for persistence
      const existingMusic = JSON.parse(localStorage.getItem('webampMusic') || '[]');
      
      // Convert files to base64 for permanent storage
      const newMusic = await Promise.all(files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: Date.now() + Math.random(),
              name: file.name.replace(/\.[^/.]+$/, ''),
              file: reader.result, // This is the base64 string
              category: 'User Added',
              fileSize: file.size,
              fileType: file.type
            });
          };
          reader.readAsDataURL(file); // Convert to base64
        });
      }));

      const updatedMusic = [...existingMusic, ...newMusic];
      localStorage.setItem('webampMusic', JSON.stringify(updatedMusic));

      // If Webamp is already loaded, add tracks to it
      if (webampRef.current) {
        const tracks = newMusic.map(music => ({
          url: music.file, // base64 string works as URL
          duration: 0, // Will be auto-detected
          metaData: {
            artist: 'User',
            title: music.name,
            album: 'User Added Music',
          },
        }));

        webampRef.current.appendTracks(tracks);
      }

      // Show success message
      alert(`${files.length} music file(s) added successfully and saved permanently!`);
      
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error adding music:', error);
      alert('Error adding music files. Please try again.');
    }
  };

  const handleRemoveMusic = (musicId) => {
    try {
      const existingMusic = JSON.parse(localStorage.getItem('webampMusic') || '[]');
      const updatedMusic = existingMusic.filter(music => music.id !== musicId);
      localStorage.setItem('webampMusic', JSON.stringify(updatedMusic));
      
      // If Webamp is loaded, we need to reload it to reflect changes
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
        initWebamp();
      }
      
      alert('Music removed successfully!');
    } catch (error) {
      console.error('Error removing music:', error);
      alert('Error removing music. Please try again.');
    }
  };

  if (!isVisible) {
    return (
      <>
        {/* Confirmation Popup */}
        {showConfirmPopup && (
          <div className="confirm-popup-overlay">
            <div className="confirm-popup">
              <h3>🎵 Hidden Webamp Player</h3>
              <p>Are you sure you want to open the hidden music player?</p>
              <div className="confirm-buttons">
                <button className="confirm-yes" onClick={handleConfirmYes}>
                  Yes, Open Webamp!
                </button>
                <button className="confirm-no" onClick={handleConfirmNo}>
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        

      </>
    );
  }

  return (
    <div className="hidden-webamp-overlay">
      <div className="hidden-webamp-container">
                 <div className="hidden-webamp-header">
           <h3>🎵 Hidden Webamp Player</h3>
                       <div className="header-controls">
              <label className="add-music-btn">
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleAddMusic}
                  style={{ display: 'none' }}
                />
                📁 Add Music
              </label>
              <button className="stop-music-btn" onClick={handleCloseCompletely} title="Stop all music and close Webamp">
                ⏹️ Stop Music
              </button>
              <button className="close-btn" onClick={handleClose} title="Hide menu (music continues playing)">
                ✕
              </button>
            </div>
         </div>
        
        <div 
          ref={containerRef} 
          id="hidden-webamp-container"
          className="hidden-webamp-content"
        />
        
                 <div className="hidden-webamp-footer">
           <div className="music-management">
             <h4>🎵 Your Music Library</h4>
             <div className="music-list">
               {(() => {
                 const userMusic = JSON.parse(localStorage.getItem('webampMusic') || '[]');
                 if (userMusic.length === 0) {
                   return <p className="no-music">No music added yet. Use "📁 Add Music" to get started!</p>;
                 }
                 return userMusic.map(music => (
                   <div key={music.id} className="music-item">
                     <span className="music-name">{music.name}</span>
                     <span className="music-size">({Math.round(music.fileSize / 1024)} KB)</span>
                     <button 
                       className="remove-music-btn" 
                       onClick={() => handleRemoveMusic(music.id)}
                       title="Remove this music"
                     >
                       🗑️
                     </button>
                   </div>
                 ));
               })()}
             </div>
           </div>
           <p>🎮 Secret unlocked! Type "makenoise" anywhere to reveal this player again.</p>
         </div>
      </div>
    </div>
  );
};

export default HiddenWebamp;
