import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu } from '../utils/helpers';

const SOUNDS = {
  spin: 'https://cdn.pixabay.com/audio/2021/11/25/audio_103348882b.mp3',
  correct: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  wrong: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3e6699296f.mp3',
  click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78390a304f.mp3',
  tick: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78390a304f.mp3' // Using click as tick
};

const SPECIAL_SLICES = [
  { isSpecial: true, action: 'iflas', label: 'İFLAS', color: '#000000', uid: 's_iflas' },
  { isSpecial: true, action: 'tekrar', label: 'TEKRAR', color: '#d35400', uid: 's_tekrar' },
  { isSpecial: true, action: 'extra50', label: '+50', color: '#27ae60', uid: 's_extra50' }
];

export default function CarkPlay() {
  const navigate = useNavigate();
  const { course, sube, unite } = useParams();
  const { data, addScore, musicEnabled } = useApp();

  const playSound = (type: keyof typeof SOUNDS) => {
    if (!musicEnabled) return;
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [bagA, setBagA] = useState<string[]>([]);
  const [bagB, setBagB] = useState<string[]>([]);
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');
  const [currentPlayer, setCurrentPlayer] = useState<string>('—');
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [wheelItems, setWheelItems] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carkColors = ['#8b1a1a','#1a6b6b','#8a6a1a','#1a3a6b','#4a1a6b','#1a5a1a','#6b3a1a'];

  // Initialize
  useEffect(() => {
    const grup = course || getSinifGrubu(sube || '');
    const students = [...(data.siniflar[sube || ''] || [])].sort(() => Math.random() - 0.5);
    
    const tA: string[] = [];
    const tB: string[] = [];
    students.forEach((p, i) => {
      if (i % 2 === 0) tA.push(p);
      else tB.push(p);
    });
    
    setTeamA(tA);
    setTeamB(tB);
    setBagA([...tA]);
    setBagB([...tB]);

    let pool: any[] = [];
    if (data.carkSinifSorular && data.carkSinifSorular[grup]) {
      if (unite === 'genel') {
        Object.values(data.carkSinifSorular[grup]).forEach(arr => {
          if (Array.isArray(arr)) pool.push(...arr);
        });
      } else if (Array.isArray(data.carkSinifSorular[grup][unite || ''])) {
        pool = [...data.carkSinifSorular[grup][unite || '']];
      }
    }
    
    if (pool.length === 0 && Array.isArray(data.carkSorular)) {
      pool = [...data.carkSorular];
    }

    const items = pool.map(q => ({ ...q, type: 'question', uid: `q_${q.id}` }));
    items.push(...SPECIAL_SLICES);
    items.sort(() => Math.random() - 0.5);

    setWheelItems(items);
    selectNextPlayer(tA, tB, [...tA], [...tB], 'A');
  }, [sube, unite, data]);

  const selectNextPlayer = (tA: string[], tB: string[], bA: string[], bB: string[], team: 'A' | 'B') => {
    let pool = team === 'A' ? bA : bB;
    const full = team === 'A' ? tA : tB;
    
    if (!pool.length) {
      pool = [...full];
      if (team === 'A') setBagA(pool);
      else setBagB(pool);
    }
    
    if (!pool.length) {
      setCurrentPlayer('(Oyuncu Yok)');
      return;
    }
    
    const idx = Math.floor(Math.random() * pool.length);
    const player = pool[idx];
    pool.splice(idx, 1);
    
    if (team === 'A') setBagA([...pool]);
    else setBagB([...pool]);
    
    setCurrentPlayer(player);
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = wheelItems.length;
    const cx = 250, cy = 250, r = 230;
    ctx.clearRect(0, 0, 500, 500);
    
    if (!n) {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Cinzel,serif';
      ctx.textAlign = 'center';
      ctx.fillText('SORU BİTTİ!', cx, cy);
      return;
    }
    
    const arc = (2 * Math.PI) / n;
    let qIndex = 1;
    
    for (let i = 0; i < n; i++) {
      const item = wheelItems[i];
      const a = i * arc;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a, a + arc);
      ctx.lineTo(cx, cy);
      ctx.fillStyle = item.isSpecial ? item.color : carkColors[i % carkColors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a + arc / 2);
      ctx.textAlign = 'right';
      
      if (item.isSpecial) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(item.label, r - 18, 5);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.font = 'bold 18px Cinzel,serif';
        ctx.fillText(qIndex.toString(), r - 18, 6);
        item._displayNum = qIndex;
        qIndex++;
      }
      
      ctx.restore();
    }
    
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, 2 * Math.PI);
    ctx.fillStyle = '#0d0b07';
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,168,76,.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel();
  }, [wheelItems]);

  const spinWheel = () => {
    if (isSpinning || wheelItems.length === 0) return;
    
    setIsSpinning(true);
    setActiveItem(null);
    setShowAnswer(false);
    playSound('spin');
    
    // Simulate wheel ticking
    let startTime = Date.now();
    const duration = 4000;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        if (musicEnabled) {
          const audio = new Audio(SOUNDS.tick);
          audio.volume = 0.2;
          audio.play().catch(() => {});
        }
        const progress = elapsed / duration;
        const nextDelay = 30 + (progress * progress * 300);
        setTimeout(tick, nextDelay);
      }
    };
    tick();
    
    const extra = Math.floor(Math.random() * 360) + 720;
    const newRot = rotation + extra;
    setRotation(newRot);
    
    setTimeout(() => {
      setIsSpinning(false);
      const n = wheelItems.length;
      if (n > 0) {
        const sliceDeg = 360 / n;
        const actual = (360 - (newRot % 360)) % 360;
        const idx = Math.min(Math.floor(actual / sliceDeg), n - 1);
        setActiveItem({ ...wheelItems[idx], _idx: idx });
      }
    }, 4100);
  };

  const nextTurn = () => {
    setActiveItem(null);
    setShowAnswer(false);
    setRotation(0);
    
    const nextTeam = currentTeam === 'A' ? 'B' : 'A';
    setCurrentTeam(nextTeam);
    selectNextPlayer(teamA, teamB, bagA, bagB, nextTeam);
  };

  const handleSpecialAction = (action: string) => {
    if (action === 'iflas') {
      playSound('wrong');
      if (currentTeam === 'A') setScores(s => ({ ...s, a: 0 }));
      else setScores(s => ({ ...s, b: 0 }));
      nextTurn();
    } else if (action === 'tekrar') {
      playSound('correct');
      setActiveItem(null);
      setRotation(0);
    } else if (action === 'extra50') {
      playSound('correct');
      if (currentTeam === 'A') setScores(s => ({ ...s, a: s.a + 50 }));
      else setScores(s => ({ ...s, b: s.b + 50 }));
      if (sube && currentPlayer) {
        addScore(sube, currentPlayer, 'cark', 50);
      }
      nextTurn();
    }
  };

  const handleScore = (correct: boolean) => {
    if (correct) {
      playSound('correct');
      if (currentTeam === 'A') setScores(s => ({ ...s, a: s.a + 10 }));
      else setScores(s => ({ ...s, b: s.b + 10 }));
      
      if (sube && currentPlayer) {
        addScore(sube, currentPlayer, 'cark', 10);
      }
    } else {
      playSound('wrong');
    }
    
    if (activeItem && activeItem.type === 'question') {
      setWheelItems(prev => prev.filter(item => item.uid !== activeItem.uid));
    }
    
    nextTurn();
  };

  return (
    <div className="flex flex-col items-center py-5 px-4 relative z-10 min-h-screen w-full max-w-[1100px] mx-auto">
      <div className="text-center mb-3">
        <div className="title-grand text-3xl">ZAMANIN ÇARKI</div>
      </div>

      <div className="flex gap-5 justify-center w-full mb-4">
        <div className={`bg-black/40 border rounded-lg py-3.5 px-6 text-center min-w-[120px] transition-all duration-300 ${currentTeam === 'A' ? 'border-gold shadow-[0_0_20px_rgba(201,168,76,0.2)] scale-105' : 'border-gold/20'}`}>
          <div className="font-serif text-xs tracking-widest text-text-light/60">TAKIM A</div>
          <div className="font-serif text-4xl text-gold font-black">{scores.a}</div>
        </div>
        
        <div className="bg-black/50 border-2 border-gold rounded-full py-3 px-7 text-center animate-[borderPulse_2s_infinite]">
          <div className="text-xs text-text-light/50 tracking-widest">SIRADAKİ YARIŞMACI</div>
          <div className="font-serif text-2xl text-teal-light font-bold">{sube === 'MİSAFİR' && currentPlayer !== '—' ? `${currentPlayer} Numara` : currentPlayer}</div>
        </div>
        
        <div className={`bg-black/40 border rounded-lg py-3.5 px-6 text-center min-w-[120px] transition-all duration-300 ${currentTeam === 'B' ? 'border-gold shadow-[0_0_20px_rgba(201,168,76,0.2)] scale-105' : 'border-gold/20'}`}>
          <div className="font-serif text-xs tracking-widest text-text-light/60">TAKIM B</div>
          <div className="font-serif text-4xl text-gold font-black">{scores.b}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center w-full mt-4">
        {/* Wheel */}
        <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] shrink-0">
          <canvas 
            ref={canvasRef} 
            width="500" 
            height="500" 
            className="w-full h-full"
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transition: isSpinning ? 'transform 4s cubic-bezier(.17,.67,.12,.99)' : 'none' 
            }}
          />
          <div className="absolute top-1/2 -right-5 -translate-y-1/2 w-0 h-0 border-y-[18px] border-y-transparent border-r-[36px] border-r-crimson drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"></div>
          <button 
            onClick={spinWheel} 
            disabled={isSpinning || wheelItems.length === 0}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-full border-4 border-deep font-serif font-black text-sm text-text-dark shadow-[0_0_20px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.5)] z-10 tracking-wide disabled:opacity-50"
            style={{ background: 'radial-gradient(circle, #fff 0%, #e8dcc8 100%)' }}
          >
            ÇEVİR
          </button>
        </div>

        {/* Question Card */}
        <div className="flex-1 min-w-[300px] max-w-[550px] flex flex-col gap-4">
          <div className={`bg-gradient-to-br from-white/5 to-black/35 border rounded-xl p-6 min-h-[280px] flex flex-col justify-between transition-all duration-500 ${activeItem ? 'opacity-100 blur-0 border-gold shadow-[0_0_30px_rgba(201,168,76,0.15)]' : 'opacity-50 blur-[2px] border-gold/25'}`}>
            
            {activeItem?.isSpecial ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-4">
                <div className="text-4xl font-black mb-4" style={{ color: activeItem.color === '#000000' ? '#ff4444' : activeItem.color }}>
                  {activeItem.label}
                </div>
                <div className="text-lg md:text-xl text-text-light/90 mb-8">
                  {activeItem.action === 'iflas' && 'Eyvah! Tüm puanlarınızı kaybettiniz.'}
                  {activeItem.action === 'tekrar' && 'Şanslısınız! Tekrar çevirme hakkı kazandınız.'}
                  {activeItem.action === 'extra50' && 'Tebrikler! Ekstra 50 puan kazandınız.'}
                </div>
                <button 
                  onClick={() => handleSpecialAction(activeItem.action)} 
                  className="btn-gold py-3 px-8 w-full max-w-[200px] mx-auto"
                >
                  {activeItem.action === 'tekrar' ? 'TEKRAR ÇEVİR' : 'DEVAM ET'}
                </button>
              </div>
            ) : (
              <>
                <div className="bg-crimson text-white py-1 px-4 rounded-full font-serif text-sm self-start mb-3">
                  {activeItem ? `SORU ${activeItem._displayNum}` : 'Hazır?'}
                </div>
                
                <div className="text-base md:text-xl font-semibold leading-relaxed flex-1 flex items-center justify-center text-center">
                  {activeItem ? activeItem.q : 'Çarkı çevirerek sorunuzu belirleyin!'}
                </div>
                
                {showAnswer && activeItem && (
                  <div className="bg-[#27ae60]/15 border border-[#27ae60] rounded-lg p-3.5 mt-3 text-base leading-relaxed">
                    {activeItem.a}
                  </div>
                )}
                
                <div className="flex gap-2.5 flex-wrap justify-center mt-3.5">
                  {activeItem && !showAnswer && (
                    <button onClick={() => setShowAnswer(true)} className="btn-teal w-full py-3">
                      CEVABI GÖSTER
                    </button>
                  )}
                  {activeItem && showAnswer && (
                    <>
                      <button onClick={() => handleScore(true)} className="btn-gold py-3 px-5 flex-1">✔ DOĞRU</button>
                      <button onClick={() => handleScore(false)} className="btn-crimson py-3 px-5 flex-1">✖ YANLIŞ</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          
          <button onClick={() => navigate('/')} className="back-nav self-center">← Ana Menü</button>
        </div>
      </div>
    </div>
  );
}
