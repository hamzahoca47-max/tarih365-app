import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu, getBaseGrade } from '../utils/helpers';

const SOUNDS = {
  drumroll: 'https://cdn.pixabay.com/audio/2021/08/09/audio_88447e769f.mp3',
  click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78390a304f.mp3'
};

export default function KapismaLobby() {
  const navigate = useNavigate();
  const { course, sube, unite } = useParams();
  const { data, musicEnabled } = useApp();

  const playSound = (type: keyof typeof SOUNDS) => {
    if (!musicEnabled) return;
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const grup = course || getSinifGrubu(sube || '');
  const baseGrade = getBaseGrade(grup);
  
  let teamAName = 'TAKIM A';
  let teamBName = 'TAKIM B';

  if (grup === '12-cagdas') {
    teamAName = 'MİHVER';
    teamBName = 'MÜTTEFİK';
  } else if (grup === '11-tkm') {
    teamAName = 'BOZOKLAR';
    teamBName = 'ÜÇOKLAR';
  } else {
    teamAName = baseGrade === '11' ? 'REFORMCULAR' : 'Kuva-yı Milliye';
    teamBName = baseGrade === '11' ? 'MERKANTALİSTLER' : 'Müdafaa-i Hukuk';
  }

  const handleReveal = () => {
    setIsRevealing(true);
    playSound('drumroll');
    const students = [...(data.siniflar[sube || ''] || [])].sort(() => Math.random() - 0.5);
    
    const tA: string[] = [];
    const tB: string[] = [];
    
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < students.length) {
        if (idx % 2 === 0) {
          tA.push(students[idx]);
          setTeamA([...tA]);
          playSound('click');
        } else {
          tB.push(students[idx]);
          setTeamB([...tB]);
          playSound('click');
        }
        idx++;
      } else {
        clearInterval(interval);
        setIsRevealing(false);
        setIsReady(true);
      }
    }, 150);
  };

  const handleStart = () => {
    navigate(`/games/kapisma/play/${course}/${encodeURIComponent(sube || '')}/${unite}`, {
      state: { teamA, teamB, teamAName, teamBName }
    });
  };

  return (
    <div className="flex flex-col items-center py-5 px-5 relative z-10 min-h-screen w-full">
      <div className="text-center mb-4">
        <div className="title-grand text-2xl">TAKIM KURULUMU</div>
        <div className="title-divider"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-[1000px] mt-4 min-h-[500px]">
        {/* Team A */}
        <div className="flex-1 bg-black/30 rounded-lg p-3 border border-[#3498db]/40 overflow-y-auto">
          <div className="font-serif text-sm tracking-widest text-center pb-2 mb-2 border-b border-white/10 text-[#3498db]">
            ⚔️ {teamAName}
          </div>
          {teamA.length === 0 && !isRevealing && (
            <div className="text-[13px] text-text-light/40 italic p-2 text-center">TAKIMLARI KUR butonuna basın</div>
          )}
          {teamA.map((p, i) => (
            <div key={i} className="py-1.5 px-2.5 my-1 bg-white/5 rounded text-[13px] font-serif flex justify-between animate-[fadeIn_0.3s_ease_forwards]">
              {sube === 'MİSAFİR' ? `${p} Numara` : p}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-center items-center gap-3 w-full md:w-[190px] shrink-0">
          {!isReady && (
            <button 
              onClick={handleReveal} 
              disabled={isRevealing}
              className="btn-gold w-full py-4 text-[15px]"
            >
              {isRevealing ? 'KURULUYOR...' : '🎲 TAKIMLARI KUR'}
            </button>
          )}
          {isReady && (
            <button 
              onClick={handleStart}
              className="btn-teal w-full py-4 text-[15px] animate-[pulseBig_2s_infinite]"
            >
              🔥 MÜCADELEYİ BAŞLAT
            </button>
          )}
          <button onClick={() => navigate(`/games/kapisma/sube/${grup}/${unite}`)} className="back-nav w-full">
            ← Geri
          </button>
        </div>

        {/* Team B */}
        <div className="flex-1 bg-black/30 rounded-lg p-3 border border-[#e74c3c]/40 overflow-y-auto">
          <div className="font-serif text-sm tracking-widest text-center pb-2 mb-2 border-b border-white/10 text-[#e74c3c]">
            🐎 {teamBName}
          </div>
          {teamB.map((p, i) => (
            <div key={i} className="py-1.5 px-2.5 my-1 bg-white/5 rounded text-[13px] font-serif flex justify-between animate-[fadeIn_0.3s_ease_forwards]">
              {sube === 'MİSAFİR' ? `${p} Numara` : p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
