import React, { useState, useEffect, useRef } from 'react';
import EmotionDetector from './EmotionDetector';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  mood: 'happy' | 'sad' | 'angry' | 'neutral' | 'relaxed' | 'energetic';
}

const sampleTracks: Track[] = [
  { id: '1', title: 'Happy Song', artist: 'Artist 1', url: '/path/to/happy-song.mp3', mood: 'happy' },
  { id: '2', title: 'Sad Melody', artist: 'Artist 2', url: '/path/to/sad-melody.mp3', mood: 'sad' },
  { id: '3', title: 'Angry Rock', artist: 'Artist 3', url: '/path/to/angry-rock.mp3', mood: 'angry' },
  { id: '4', title: 'Calm Jazz', artist: 'Artist 4', url: '/path/to/calm-jazz.mp3', mood: 'neutral' },
  { id: '5', title: 'Relaxing Nature', artist: 'Artist 5', url: '/path/to/relaxing-nature.mp3', mood: 'relaxed' },
  { id: '6', title: 'Energetic Pop', artist: 'Artist 6', url: '/path/to/energetic-pop.mp3', mood: 'energetic' },
  // 添加更多歌曲...
];

const MusicPlayer: React.FC = () => {
  const [currentEmotion, setCurrentEmotion] = useState<string>('');
  const [tracks] = useState<Track[]>(sampleTracks);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEmotionDetected = (emotion: string) => {
    console.log(`Detected emotion: ${emotion}`);
    setCurrentEmotion(emotion);
    const emotionPlaylist = getEmotionPlaylist(emotion);
    if (emotionPlaylist.length > 0) {
      const track = selectTrack(emotionPlaylist);
      setCurrentTrack(track);
      playTrack(track);
    }
  };

  const getEmotionPlaylist = (emotion: string): Track[] => {
    switch (emotion) {
      case 'happy':
        return tracks.filter(track => track.mood === 'happy' || track.mood === 'energetic');
      case 'sad':
        return tracks.filter(track => track.mood === 'sad' || track.mood === 'relaxed');
      case 'angry':
        return tracks.filter(track => track.mood === 'angry' || track.mood === 'energetic');
      case 'neutral':
      default:
        return tracks.filter(track => track.mood === 'neutral' || track.mood === 'relaxed');
    }
  };

  const selectTrack = (playlist: Track[]): Track => {
    const unplayedTracks = playlist.filter(track => !playHistory.includes(track.id));
    if (unplayedTracks.length > 0) {
      const selectedTrack = unplayedTracks[Math.floor(Math.random() * unplayedTracks.length)];
      setPlayHistory(prev => [...prev, selectedTrack.id]);
      return selectedTrack;
    } else {
      // 如果所有歌曲都播放过，重置历史记录并随机选择
      setPlayHistory([]);
      return playlist[Math.floor(Math.random() * playlist.length)];
    }
  };

  const playTrack = (track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTrack = () => {
    if (currentTrack) {
      const currentPlaylist = getEmotionPlaylist(currentEmotion);
      const nextTrack = selectTrack(currentPlaylist);
      setCurrentTrack(nextTrack);
      playTrack(nextTrack);
    }
  };

  const selectSpecificTrack = (track: Track) => {
    setCurrentTrack(track);
    playTrack(track);
  };

  return (
    <div>
      <EmotionDetector onEmotionDetected={handleEmotionDetected} />
      <div>
        <h2>Current Emotion: {currentEmotion}</h2>
        {currentTrack && (
          <div>
            <h3>Now Playing: {currentTrack.title} by {currentTrack.artist}</h3>
            <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={skipTrack}>Skip</button>
          </div>
        )}
        <audio ref={audioRef} />
      </div>
      <div>
        <h3>All Tracks:</h3>
        <ul>
          {tracks.map(track => (
            <li key={track.id} onClick={() => selectSpecificTrack(track)}>
              {track.title} - {track.artist} ({track.mood})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MusicPlayer;