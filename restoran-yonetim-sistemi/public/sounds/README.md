# Sound Files Directory

This directory contains sound files for the restaurant management system's sound player.

## How to Add Sound Files

1. **Supported Formats**: MP3, WAV, OGG, M4A
2. **File Naming**: Use descriptive names like `background-music.mp3`, `notification-sound.wav`
3. **File Size**: Keep files under 10MB for optimal performance
4. **Quality**: Use 128kbps or higher for music, 64kbps for notification sounds

## Current Sample Files

The system includes these sample sound files:
- `music1.mp3` - Background music 1
- `music2.mp3` - Background music 2  
- `notification.mp3` - Notification sound
- `alarm.mp3` - Alarm sound
- `nature.mp3` - Ambient nature sounds

## Adding Your Own Sounds

1. Place your sound files in this directory
2. Update the `soundFiles` array in `SoundPlayer.jsx` to include your new files
3. Make sure the file paths match exactly

## Example Update

```javascript
const soundFiles = [
  { id: 1, name: 'Your Music', file: '/sounds/your-music.mp3', category: 'Müzik' },
  // ... other sounds
];
```

## Browser Compatibility

- Modern browsers support most audio formats
- For maximum compatibility, use MP3 format
- Some browsers may require user interaction before playing audio
