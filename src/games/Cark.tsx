import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SLICES = [
  { label: '100 Puan', type: 'points', value: 100, color: '#f59e0b' },
  { label: 'Pas', type: 'pas', value: 0, color: '#6b7280' },
  { label: '200 Puan', type: 'points', value: 200, color: '#10b981' },
  { label: 'İflas', type: 'iflas', value: 0, color: '#ef4444' },
  { label: '300 Puan', type: 'points', value: 300, color: '#3b82f6' },
  { label: 'X2', type: 'x2', value: 0, color: '#8b5cf6' },
  { label: 'Joker', type: 'joker', value: 0, color: '#ec4899' },
  { label: '100 Puan', type: 'points', value: 100, color: '#f59e0b' },
];

const QUESTIONS: Record<number, {q: string, a: string[], correct: number}> = {
  100: { q: "Türkiye Cumhuriyeti'nin kurucusu kimdir?", a: ["İsmet İnönü", "Mustafa Kemal Atatürk", "Fevzi Çakmak", "Kazım Karabekir"], correct: 1 },
  200: { q: "Osmanlı Devleti hangi antlaşma ile fiilen sona ermiştir?", a: ["Sevr", "Lozan", "Mondros", "Mudanya"], correct: 2 },
  300: { q: "Kavimler Göçü'nü başlatan Türk devleti hangisidir?", a: ["Asya Hun", "Avrupa Hun", "Göktürk", "Uygur"], correct: 0 },
};

export default function Cark() {
  const { addScore } = useAuth();
  const navigate = useNavigate();
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSlice, setCurrentSlice] = useState<typeof SLICES[0] | null>(null);
  
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(90);
  const [score, setScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [hasJoker, setHasJoker] = useState(false);
  
  const [activeQuestion, setActiveQuestion] = useState<typeof QUESTIONS[0] | null>(null);
  const [gameState, setGameState] = useState<'spinning' | 'question' | 'finished'>('spinning');

  useEffect(() => {
    if (timeLeft > 0 && gameState !== 'finished') {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState !== 'finished') {
      setGameState('finished');
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (lives <= 0) {
      setGameState('finished');
    }
  }, [lives]);

  const spinWheel = () => {
    if (isSpinning || gameState !== 'spinning') return;
    setIsSpinning(true);
    
    const spins = 5;
    const sliceAngle = 360 / SLICES.length;
    const randomSlice = Math.floor(Math.random() * SLICES.length);
    
    const targetRotation = rotation + (spins * 360) + (randomSlice * sliceAngle) + (sliceAngle / 2);
    
    setRotation(targetRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      const landedSlice = SLICES[(SLICES.length - randomSlice) % SLICES.length];
      setCurrentSlice(landedSlice);
      handleLandedSlice(landedSlice);
    }, 3000);
  };

  const handleLandedSlice = (slice: typeof SLICES[0]) => {
    if (slice.type === 'points') {
      setActiveQuestion(QUESTIONS[slice.value]);
      setGameState('question');
    } else if (slice.type === 'pas') {
      setTimeout(() => setCurrentSlice(null), 2000);
    } else if (slice.type === 'iflas') {
      setScore(0);
      setMultiplier(1);
      setTimeout(() => setCurrentSlice(null), 2000);
    } else if (slice.type === 'x2') {
      setMultiplier(m => m * 2);
      setTimeout(() => setCurrentSlice(null), 2000);
    } else if (slice.type === 'joker') {
      setHasJoker(true);
      setTimeout(() => setCurrentSlice(null), 2000);
    }
  };

  const handleAnswer = (idx: number) => {
    if (!activeQuestion) return;
    
    if (idx === activeQuestion.correct) {
      setScore(s => s + (currentSlice!.value * multiplier));
      setMultiplier(1);
    } else {
      if (hasJoker) {
        setHasJoker(false);
      } else {
        setLives(l => l - 1);
      }
    }
    
    setActiveQuestion(null);
    setCurrentSlice(null);
    setGameState('spinning');
  };

  const finishGame = () => {
    addScore(score);
    navigate('/dashboard');
  };

  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">Oyun Bitti!</h2>
        <div className="text-3xl font-bold mb-8">Kazanılan Puan: <span className="text-amber-600">{score}</span></div>
        <button onClick={finishGame} className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors">
          Ana Ekrana Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex gap-2">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-red-500' : 'bg-stone-200'}`} />
          ))}
        </div>
        <div className="text-2xl font-mono font-bold text-amber-600">{timeLeft} sn</div>
        <div className="flex items-center gap-4">
          {multiplier > 1 && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">X{multiplier}</span>}
          {hasJoker && <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded font-bold">Joker</span>}
          <div className="text-lg font-bold text-stone-500">Puan: {score}</div>
        </div>
      </div>

      {gameState === 'spinning' && (
        <div className="flex flex-col items-center justify-center bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
          <div className="relative w-80 h-80 mb-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-stone-900 z-10" />
            
            <div 
              className="w-full h-full rounded-full border-4 border-stone-900 overflow-hidden relative transition-transform"
              style={{ 
                transform: `rotate(${rotation}deg)`, 
                transitionDuration: isSpinning ? '3s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              {SLICES.map((slice, i) => {
                const angle = 360 / SLICES.length;
                return (
                  <div 
                    key={i}
                    className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
                    style={{
                      transform: `rotate(${i * angle}deg) skewY(${90 - angle}deg)`,
                      backgroundColor: slice.color,
                    }}
                  >
                    <div 
                      className="absolute bottom-0 left-0 w-full text-white font-bold text-sm text-center"
                      style={{
                        transform: `skewY(${-(90 - angle)}deg) rotate(${angle / 2}deg) translateY(-80px)`,
                      }}
                    >
                      {slice.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {currentSlice && !isSpinning && (
            <div className="text-2xl font-bold mb-6 text-stone-900">
              Gelen: <span style={{color: currentSlice.color}}>{currentSlice.label}</span>
            </div>
          )}

          <button 
            onClick={spinWheel}
            disabled={isSpinning}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-12 rounded-full text-xl transition-colors shadow-lg disabled:opacity-50"
          >
            Çarkı Çevir
          </button>
        </div>
      )}

      {gameState === 'question' && activeQuestion && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
          <h2 className="text-2xl font-medium text-stone-800 mb-8 text-center">{activeQuestion.q}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeQuestion.a.map((ans, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium py-4 px-6 rounded-xl transition-colors text-lg text-left"
              >
                {String.fromCharCode(65 + i)}) {ans}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
