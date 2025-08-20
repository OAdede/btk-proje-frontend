# Webamp Sound Player Integration

## Overview
This project now uses **Webamp** - a complete reimplementation of Winamp 2 in HTML5 and JavaScript with full skin support. This replaces the custom-built sound player with the authentic Winamp experience.

## Features
- **Authentic Winamp Interface**: Complete replica of the classic Winamp 2 interface
- **Multiple Windows**: Main player, equalizer, playlist, and Milkdrop visualizations
- **File Support**: MP3, WAV, OGG, M4A, and more audio formats
- **Drag & Drop**: Drop audio files directly onto the player
- **Playlist Management**: Full playlist editing capabilities
- **Visualizations**: Built-in Milkdrop visualizations
- **Keyboard Shortcuts**: All classic Winamp keyboard shortcuts
- **Skin Support**: Full Winamp skin compatibility
- **Equalizer**: 10-band equalizer with presets

## How It Works
1. **Dynamic Import**: Webamp is dynamically imported to avoid SSR issues
2. **Browser Compatibility**: Automatically checks if Webamp is supported
3. **Container Rendering**: Webamp renders itself as a child of the body element
4. **Initial Tracks**: Comes with 5 sample tracks pre-loaded
5. **Auto-cleanup**: Properly disposes of Webamp instance on component unmount

## Configuration
The Webamp instance is configured with:
- Initial tracks from your `/sounds/` directory
- All features enabled (equalizer, playlist, visualizations, etc.)
- Classic Winamp window layout
- File upload and drag & drop enabled

## File Structure
```
/sounds/
├── music1.mp3
├── music2.mp3
├── notification.mp3
├── alarm.mp3
└── nature.mp3
```

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- **Not supported**: Internet Explorer

## Installation
Webamp is already included in your `package.json`:
```json
{
  "dependencies": {
    "webamp": "^2.2.0"
  }
}
```

## Usage
The sound player will automatically appear in your TopNav component. Users can:
1. **Play/Pause**: Use the main player controls
2. **Add Files**: Drag & drop audio files or use the file menu
3. **Manage Playlist**: Edit, reorder, and save playlists
4. **Adjust Audio**: Use the 10-band equalizer
5. **View Visualizations**: Enable Milkdrop visualizations
6. **Keyboard Shortcuts**: Use classic Winamp shortcuts

## Customization
You can modify the Webamp configuration in `SoundPlayer.jsx`:
- Change initial tracks
- Modify window layout
- Enable/disable features
- Add custom skins
- Configure equalizer presets

## Troubleshooting
- If Webamp fails to load, check browser console for errors
- Ensure audio files are accessible from the `/sounds/` directory
- Verify that the webamp package is properly installed
- Check browser compatibility

## Resources
- [Webamp Documentation](https://docs.webamp.org/)
- [Webamp GitHub Repository](https://github.com/captbaritone/webamp)
- [Winamp Skins](https://skins.webamp.org/)

## License
Webamp is released under the MIT License. See the [Webamp repository](https://github.com/captbaritone/webamp) for details.
