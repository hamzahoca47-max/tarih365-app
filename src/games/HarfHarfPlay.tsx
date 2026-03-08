import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu, getRank } from '../utils/helpers';

const SOUNDS = {
  correct: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  wrong: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3e6699296f.mp3',
  click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78390a304f.mp3'
};

export default function HarfHarfPlay() {
  const navigate = useNavigate();
  const { course, sube, unite, student } = useParams();
  const { data, addScore, musicEnabled } = useApp();

  const playSound = (type: keyof typeof SOUNDS) => {
    if (!musicEnabled) return;
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [mainTimeLeft, setMainTimeLeft] = useState(100);
  const [answerTimeLeft, setAnswerTimeLeft] = useState(20);
  const [jokerUsed, setJokerUsed] = useState(false);
  const [lettersTaken, setLettersTaken] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'answering' | 'answered' | 'finished'>('playing');

  // Load questions on mount
  useEffect(() => {
    const grup = course || getSinifGrubu(sube || '');
    let pool: any[] = [];
    
    if (data.sorular && data.sorular[grup]) {
      if (unite === 'genel') {
        Object.values(data.sorular[grup]).forEach(arr => {
          if (Array.isArray(arr)) pool.push(...arr);
        });
      } else if (Array.isArray(data.sorular[grup][unite || ''])) {
        pool = [...data.sorular[grup][unite || '']];
      }
    }

    if (pool.length === 0) {
      alert('Bu ünite için soru bulunamadı!');
      navigate('/');
      return;
    }

    // Categorize pool based on answer length (excluding spaces)
    const cokKolay: any[] = [];
    const kolay: any[] = [];
    const orta: any[] = [];
    const zor: any[] = [];

    pool.forEach(q => {
      const len = (q.c || '').replace(/ /g, '').length;
      if (len <= 5) cokKolay.push(q);
      else if (len <= 7) kolay.push(q);
      else if (len <= 9) orta.push(q);
      else zor.push(q);
    });

    const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);
    const shuffledCokKolay = shuffle(cokKolay);
    const shuffledKolay = shuffle(kolay);
    const shuffledOrta = shuffle(orta);
    const shuffledZor = shuffle(zor);

    const selectedQuestions: any[] = [];
    
    // Helper to pick one question from preferred categories in order
    const pickQuestion = (preferred: any[][]) => {
      for (const cat of preferred) {
        if (cat.length > 0) {
          return cat.pop();
        }
      }
      return null;
    };

    // 1. Çok Kolay (Very Easy)
    const q1 = pickQuestion([shuffledCokKolay, shuffledKolay, shuffledOrta, shuffledZor]);
    if (q1) selectedQuestions.push(q1);
    
    // 2. Kolay (Easy)
    const q2 = pickQuestion([shuffledKolay, shuffledCokKolay, shuffledOrta, shuffledZor]);
    if (q2) selectedQuestions.push(q2);

    // 3. Orta (Medium)
    const q3 = pickQuestion([shuffledOrta, shuffledZor, shuffledKolay, shuffledCokKolay]);
    if (q3) selectedQuestions.push(q3);

    // 4. Zor (Hard)
    const q4 = pickQuestion([shuffledZor, shuffledOrta, shuffledKolay, shuffledCokKolay]);
    if (q4) selectedQuestions.push(q4);

    // Fill remaining if needed (e.g. pool < 4)
    const remaining = [...shuffledCokKolay, ...shuffledKolay, ...shuffledOrta, ...shuffledZor];
    while (selectedQuestions.length < 4 && remaining.length > 0) {
      selectedQuestions.push(remaining.pop());
    }

    // Final shuffle so the order of difficulties is random
    const finalQuestions = shuffle(selectedQuestions).slice(0, 4);
    setQuestions(finalQuestions);
  }, [sube, unite, data.sorular, navigate]);

  // Main timer
  useEffect(() => {
    let timer: any;
    if (mainTimeLeft > 0 && gameState === 'playing') {
      timer = setInterval(() => {
        setMainTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mainTimeLeft, gameState]);

  // Answer timer
  useEffect(() => {
    let timer: any;
    if (answerTimeLeft > 0 && gameState === 'answering') {
      timer = setInterval(() => {
        setAnswerTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleWrong(); // Time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [answerTimeLeft, gameState]);

  const currentQ = questions[currentQIndex];

  const handleRevealLetter = () => {
    if (!currentQ || gameState !== 'playing') return;
    const answer = currentQ.c.toUpperCase();
    const hidden = [];
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] !== ' ' && !revealedIndices.includes(i)) hidden.push(i);
    }
    if (hidden.length === 0) return;
    
    const pick = hidden[Math.floor(Math.random() * hidden.length)];
    setRevealedIndices(prev => [...prev, pick]);
    setLettersTaken(prev => prev + 1);
    playSound('click');
  };

  const handleJoker = () => {
    if (jokerUsed || !currentQ || gameState !== 'playing') return;
    setJokerUsed(true);
    
    const answer = currentQ.c.toUpperCase();
    const hidden = [];
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] !== ' ' && !revealedIndices.includes(i)) hidden.push(i);
    }
    
    const toReveal = hidden.slice(0, Math.min(2, hidden.length));
    setRevealedIndices(prev => [...prev, ...toReveal]);
  };

  const handleAnswerClick = () => {
    if (gameState !== 'playing') return;
    setGameState('answering');
    setAnswerTimeLeft(20);
  };

  const handleCorrect = () => {
    if (!currentQ) return;
    playSound('correct');
    const answer = currentQ.c.toUpperCase();
    const points = (answer.replace(/ /g, '').length - lettersTaken) * 100;
    setScore(prev => prev + Math.max(0, points));
    
    // Reveal all
    const allIndices = Array.from({ length: answer.length }, (_, i) => i);
    setRevealedIndices(allIndices);
    setGameState('answered');
  };

  const handleWrong = () => {
    if (!currentQ) return;
    playSound('wrong');
    // Optionally deduct points here if wrong, but usually it's just 0 points gained.
    // The prompt says "Söyleyemezse cevap otomatik açılır."
    const answer = currentQ.c.toUpperCase();
    const allIndices = Array.from({ length: answer.length }, (_, i) => i);
    setRevealedIndices(allIndices);
    setGameState('answered');
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setRevealedIndices([]);
      setLettersTaken(0);
      setGameState('playing');
    } else {
      setGameState('finished');
    }
  };

  const finishGame = () => {
    const bonus = mainTimeLeft * 10;
    const total = score + bonus;
    if (sube && student && total > 0) {
      addScore(sube, student, 'harf', total);
    }
    const displayPlayer = sube === 'MİSAFİR' ? `${student} Numaralı Öğrenci` : student;
    navigate('/games/result', { state: { score: total, player: displayPlayer, breakdown: `Soru Puanı: ${score} + Süre Bonusu: ${bonus} (+${mainTimeLeft} sn × 10)` } });
  };

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState]);

  if (gameState === 'finished') {
    return null;
  }

  if (!currentQ) return <div className="text-center py-20">Yükleniyor...</div>;

  const answerChars = currentQ.c.toUpperCase().split('');

  return (
    <div className="flex flex-col items-center py-5 px-5 relative z-10 min-h-screen">
      <div className="w-full max-w-[900px]">
        {/* Header */}
        <div className="flex justify-between items-center w-full bg-black/40 border border-gold/20 rounded-lg py-3 px-5 mb-4">
          <div>
            <span className="text-xs text-text-light/50 block tracking-widest">YARIŞMACI</span>
            <div className="font-serif text-base text-teal-light">{sube === 'MİSAFİR' ? `${student} Numara` : student}</div>
          </div>
          <div className="text-center">
            <span className="text-xs text-text-light/50 block tracking-widest">SKOR</span>
            <div className="font-serif text-3xl text-gold drop-shadow-[0_0_20px_rgba(201,168,76,0.4)]">{score}</div>
          </div>
          <div className="text-center">
            <span className="text-xs text-text-light/50 block tracking-widest">SORU</span>
            <div className="font-serif text-lg text-gold">{currentQIndex + 1}/{questions.length}</div>
          </div>
          <div className="flex gap-4">
            {gameState === 'answering' && (
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-serif text-2xl font-black bg-black/60 transition-colors duration-300 text-crimson border-crimson animate-[timerPulse_0.5s_infinite]`}>
                {answerTimeLeft}
              </div>
            )}
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-serif text-2xl font-black bg-black/60 transition-colors duration-300 ${mainTimeLeft <= 20 ? 'text-crimson border-crimson animate-[timerPulse_1s_infinite]' : 'text-gold border-gold-dark'} ${gameState === 'answering' ? 'opacity-50' : ''}`}>
              {mainTimeLeft}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-black font-bold px-4 py-1 rounded-full text-sm shadow-md z-10">
            Soru Değeri: {(answerChars.filter(c => c !== ' ').length - lettersTaken) * 100} Puan
          </div>
          <div className="w-full bg-gradient-to-br from-white/5 to-black/30 border border-gold/25 border-l-4 border-l-gold rounded-lg py-7 px-8 text-lg md:text-2xl min-h-[110px] flex items-center justify-center text-center leading-relaxed shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-8 mt-4">
            {currentQ.s}
          </div>
        </div>

        {/* Letters */}
        <div className="flex flex-wrap gap-2 justify-center my-5">
          {answerChars.map((char, i) => {
            if (char === ' ') return <div key={i} className="w-10 h-14 invisible"></div>;
            const isRevealed = revealedIndices.includes(i);
            return (
              <div 
                key={i} 
                className={`w-[52px] h-[58px] flex items-center justify-center text-3xl font-black font-serif rounded-md shadow-[0_3px_8px_rgba(0,0,0,0.4)] transition-all duration-200 border-b-[5px] ${isRevealed ? 'bg-parchment text-text-dark border-[#c8b89a] animate-[popLetter_0.3s_cubic-bezier(0.17,0.67,0.12,0.99)]' : 'bg-[#3a3020] text-transparent border-[#2a2010]'}`}
              >
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        {gameState === 'playing' && (
          <div className="grid grid-cols-3 gap-3 w-full mt-8 max-w-2xl mx-auto">
            <button onClick={handleAnswerClick} className="btn-teal py-4 px-2 text-lg text-center font-bold">
              ✋ CEVAPLA
            </button>
            <button onClick={handleRevealLetter} disabled={revealedIndices.length >= answerChars.filter(c => c !== ' ').length} className="btn-gold py-4 px-2 text-lg text-center font-bold">
              🔤 HARF AL
            </button>
            <button onClick={handleJoker} disabled={jokerUsed} className="py-4 px-2 text-lg text-center text-white font-serif font-bold rounded-md tracking-wider disabled:opacity-50" style={{ background: 'linear-gradient(135deg,#5a2d8a,#8e44ad)' }}>
              🃏 JOKER
            </button>
          </div>
        )}

        {gameState === 'answering' && (
          <div className="grid grid-cols-2 gap-4 w-full mt-8 max-w-xl mx-auto">
            <button onClick={handleCorrect} className="py-4 px-2 text-lg text-center text-white font-serif font-bold rounded-md tracking-wider shadow-[0_0_15px_rgba(39,174,96,0.5)]" style={{ background: 'linear-gradient(135deg,#1a5a2a,#27ae60)' }}>
              🏆 DOĞRU (DESTAN YAZDI)
            </button>
            <button onClick={handleWrong} className="btn-crimson py-4 px-2 text-lg text-center font-bold shadow-[0_0_15px_rgba(192,57,43,0.5)]">
              💔 YANLIŞ (SAĞLIK OLSUN)
            </button>
          </div>
        )}

        {gameState === 'answered' && (
          <div className="flex justify-center gap-3 mt-8">
            <button onClick={handleNextQuestion} className="btn-teal py-3 px-7 text-lg">
              → SONRAKİ SORU
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <button onClick={() => navigate('/')} className="back-nav">🏠 Ana Menü</button>
        </div>
      </div>
    </div>
  );
}
