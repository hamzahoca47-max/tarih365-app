import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX } from 'lucide-react';

const BackgroundMusic: React.FC = () => {
  const { musicEnabled, setMusicEnabled } = useApp();
  const audioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);

  // Müzik listesi - Sayfaya göre farklı müzikler çalabiliriz
  const tracks = {
    default: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73456.mp3', // Ambient History
    game: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3', // Epic Cinematic
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // %30 ses seviyesi ideal
      
      const isCarkPage = location.pathname.includes('/cark/play');
      
      if (musicEnabled && !isCarkPage) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(error => {
            console.log("Autoplay blocked or failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [musicEnabled, location.pathname]);

  // Sayfa değişiminde müziği güncelleme (opsiyonel)
  useEffect(() => {
    if (audioRef.current) {
      const isCarkPage = location.pathname.includes('/cark/play');
      const isGamePage = location.pathname.includes('/play/');
      const targetSrc = isGamePage ? tracks.game : tracks.default;
      
      if (isCarkPage) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current.src !== targetSrc) {
          audioRef.current.src = targetSrc;
        }
        if (musicEnabled) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    }
  }, [location.pathname, musicEnabled]);

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2">
      <button
        onClick={toggleMusic}
        className="w-10 h-10 rounded-full bg-black/40 border border-gold/30 backdrop-blur-md flex items-center justify-center text-gold-light hover:bg-black/60 hover:border-gold transition-all shadow-lg"
        title={musicEnabled ? "Müziği Kapat" : "Müziği Aç"}
      >
        {musicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
      
      <audio
        ref={audioRef}
        loop
        preload="auto"
      />
      
      {/* İlk etkileşim uyarısı (Safari/Chrome autoplay kısıtlaması için) */}
      {!isPlaying && musicEnabled && (
        <div className="absolute bottom-12 right-0 bg-black/80 text-gold-light text-[10px] px-2 py-1 rounded border border-gold/20 whitespace-nowrap animate-pulse">
          Müziği başlatmak için bir yere tıklayın
        </div>
      )}
    </div>
  );
};

export default BackgroundMusic;
