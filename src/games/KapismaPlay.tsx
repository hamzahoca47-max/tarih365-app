import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu } from '../utils/helpers';

const SOUNDS = {
  correct: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  wrong: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3e6699296f.mp3',
  click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78390a304f.mp3',
  vs: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
  spin: 'https://cdn.pixabay.com/audio/2021/11/25/audio_103348882b.mp3'
};

export default function KapismaPlay() {
  const navigate = useNavigate();
  const { course, sube, unite } = useParams();
  const location = useLocation();
  const { data, addScore, musicEnabled } = useApp();

  const playSound = (type: keyof typeof SOUNDS) => {
    if (!musicEnabled) return;
    const audio = new Audio(SOUNDS[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const { teamA = [], teamB = [], teamAName = 'TAKIM A', teamBName = 'TAKIM B' } = location.state || {};

  const [bagA, setBagA] = useState<string[]>([...teamA]);
  const [bagB, setBagB] = useState<string[]>([...teamB]);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [currentA, setCurrentA] = useState<string>('');
  const [currentB, setCurrentB] = useState<string>('');
  const [activeQ, setActiveQ] = useState<any>(null);
  const [turn, setTurn] = useState<'A' | 'B'>('A');
  
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [lettersTaken, setLettersTaken] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [answerTimeLeft, setAnswerTimeLeft] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [gameState, setGameState] = useState<'vs' | 'playing' | 'answering' | 'answered'>('vs');

  useEffect(() => {
    if (!teamA.length || !teamB.length) {
      navigate('/');
      return;
    }

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
      alert('Soru bulunamadı!');
      navigate('/');
      return;
    }

    // Group questions by length to create fair pairs for Team A and Team B
    const byLength: Record<number, any[]> = {};
    pool.forEach(q => {
      const len = (q.c || '').replace(/ /g, '').length;
      if (!byLength[len]) byLength[len] = [];
      byLength[len].push(q);
    });

    const pairedQuestions: any[] = [];
    Object.keys(byLength).forEach(lenStr => {
      const len = parseInt(lenStr);
      const qs = byLength[len].sort(() => Math.random() - 0.5);
      while (qs.length >= 2) {
        pairedQuestions.push(qs.pop());
        pairedQuestions.push(qs.pop());
      }
    });

    let finalQuestions = pairedQuestions.length > 0 ? pairedQuestions : [...pool].sort(() => Math.random() - 0.5);
    
    // Shuffle the pairs (keeping pairs together)
    const pairs = [];
    for (let i = 0; i < finalQuestions.length; i += 2) {
      if (finalQuestions[i+1]) {
        pairs.push([finalQuestions[i], finalQuestions[i+1]]);
      }
    }
    pairs.sort(() => Math.random() - 0.5);
    const flatQuestions = pairs.flat();

    setQuestions(flatQuestions);
    
    // Use the pool directly to pick the first question
    pickNextPlayers([...teamA], [...teamB], flatQuestions);
  }, []);

  const pickNextPlayers = (bA: string[], bB: string[], currentQuestions: any[] = questions) => {
    let newBagA = [...bA];
    let newBagB = [...bB];
    
    if (!newBagA.length) newBagA = [...teamA];
    if (!newBagB.length) newBagB = [...teamB];
    
    const idxA = Math.floor(Math.random() * newBagA.length);
    const pA = newBagA.splice(idxA, 1)[0];
    
    const idxB = Math.floor(Math.random() * newBagB.length);
    const pB = newBagB.splice(idxB, 1)[0];
    
    setBagA(newBagA);
    setBagB(newBagB);
    setGameState('vs');
    setTurn('A');
    playSound('spin');
    
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      setCurrentA(teamA[Math.floor(Math.random() * teamA.length)]);
      setCurrentB(teamB[Math.floor(Math.random() * teamB.length)]);
      spinCount++;
      
      if (spinCount > 20) {
        clearInterval(spinInterval);
        setCurrentA(pA);
        setCurrentB(pB);
        playSound('vs');
        
        // Simulate VS screen delay
        setTimeout(() => {
          loadNextQuestion(currentQuestions);
        }, 2000);
      }
    }, 100);
  };

  const loadNextQuestion = (currentQuestions: any[] = questions) => {
    if (currentQuestions.length === 0) return;
    
    // Simple logic: just pick the next question
    const q = currentQuestions[0];
    const newQs = [...currentQuestions];
    newQs.push(newQs.shift()); // rotate
    setQuestions(newQs);
    
    setActiveQ(q);
    setRevealedIndices([]);
    setLettersTaken(0);
    setTimeLeft(60);
    setIsRunning(true);
    setGameState('playing');
  };

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0 && gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, gameState]);

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

  const handleAnswerClick = () => {
    if (gameState !== 'playing') return;
    setIsRunning(false);
    setGameState('answering');
    setAnswerTimeLeft(20);
  };

  const handleRevealLetter = () => {
    if (!activeQ || gameState !== 'playing') return;
    playSound('click');
    const answer = activeQ.c.toUpperCase();
    const hidden = [];
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] !== ' ' && !revealedIndices.includes(i)) hidden.push(i);
    }
    if (hidden.length === 0) return;
    
    const pick = hidden[Math.floor(Math.random() * hidden.length)];
    setRevealedIndices(prev => [...prev, pick]);
    setLettersTaken(prev => prev + 1);
  };

  const handleCorrect = () => {
    if (!activeQ) return;
    playSound('correct');
    setIsRunning(false);
    setGameState('answered');
    
    const answer = activeQ.c.toUpperCase();
    const points = Math.max(0, (answer.replace(/ /g, '').length - lettersTaken) * 100);
    
    if (turn === 'A') {
      setScores(s => ({ ...s, a: s.a + points }));
      if (sube && currentA) addScore(sube, currentA, 'kap', points);
    } else {
      setScores(s => ({ ...s, b: s.b + points }));
      if (sube && currentB) addScore(sube, currentB, 'kap', points);
    }
    
    const allIndices = Array.from({ length: answer.length }, (_, i) => i);
    setRevealedIndices(allIndices);
  };

  const handleWrong = () => {
    if (!activeQ) return;
    playSound('wrong');
    setIsRunning(false);
    const answer = activeQ.c.toUpperCase();
    const allIndices = Array.from({ length: answer.length }, (_, i) => i);
    setRevealedIndices(allIndices);
    setGameState('answered');
  };

  const handleNext = () => {
    if (turn === 'A') {
      setTurn('B');
      loadNextQuestion();
    } else {
      pickNextPlayers(bagA, bagB);
    }
  };

  const handlePenalty = (team: 'a' | 'b') => {
    if (team === 'a') setScores(s => ({ ...s, a: Math.max(0, s.a - 50) }));
    else setScores(s => ({ ...s, b: Math.max(0, s.b - 50) }));
  };

  if (gameState === 'vs') {
    return (
      <div className="fixed inset-0 z-[200] bg-deep flex flex-col items-center justify-center gap-8">
        <h2 className="font-serif text-text-light text-xl tracking-[0.2em] opacity-70">SIRADAKİ EŞLEŞME BELİRLENİYOR...</h2>
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10">
          <div className="w-[220px] h-[130px] bg-white/5 border-4 border-[#3498db]/60 rounded-xl flex flex-col items-center justify-center gap-2">
            <div className="font-serif text-[11px] tracking-[0.2em] opacity-70">{teamAName}</div>
            <div className="font-serif text-2xl font-bold text-[#3498db]">{currentA ? (sube === 'MİSAFİR' ? `${currentA} Numara` : currentA) : '?'}</div>
          </div>
          <div className="font-serif text-7xl font-black text-gold italic drop-shadow-[4px_4px_0_var(--color-crimson),0_0_40px_rgba(201,168,76,0.5)]">
            VS
          </div>
          <div className="w-[220px] h-[130px] bg-white/5 border-4 border-[#e74c3c]/60 rounded-xl flex flex-col items-center justify-center gap-2">
            <div className="font-serif text-[11px] tracking-[0.2em] opacity-70">{teamBName}</div>
            <div className="font-serif text-2xl font-bold text-[#e74c3c]">{currentB ? (sube === 'MİSAFİR' ? `${currentB} Numara` : currentB) : '?'}</div>
          </div>
        </div>
      </div>
    );
  }

  const answerChars = activeQ ? activeQ.c.toUpperCase().split('') : [];

  return (
    <div className="flex flex-col items-center relative z-10 min-h-screen w-full bg-deep">
      {/* Scoreboard */}
      <div className="flex h-20 w-full sticky top-0 z-[100] bg-deep/95 border-b-2 border-gold-dark shadow-[0_5px_20px_rgba(0,0,0,0.7)]">
        <div className={`flex-1 flex flex-col items-center justify-center p-1.5 transition-colors duration-300 ${turn === 'A' ? 'bg-[#3498db]/40 border-b-4 border-gold' : 'bg-[#3498db]/15'}`}>
          <div className="font-serif text-[11px] tracking-[0.1em] opacity-80">⚔️ {teamAName}</div>
          <div className="font-serif text-3xl font-black text-gold leading-none">{scores.a}</div>
          <button onClick={() => handlePenalty('a')} className="bg-black/40 text-text-light/50 text-[10px] py-0.5 px-2.5 rounded-full border border-white/10 mt-1 font-serif tracking-widest hover:bg-crimson hover:text-white">⚠️ GÜRÜLTÜ (-50)</button>
        </div>
        
        <div className="hidden md:flex w-[200px] items-center justify-center bg-black/60 border-x border-gold/20">
          <div className="w-[60px] h-[60px] rounded-full border-2 border-gold-dark flex items-center justify-center text-2xl bg-[radial-gradient(circle,rgba(201,168,76,0.15)_0%,transparent_70%)]">
            🏛️
          </div>
        </div>
        
        <div className={`flex-1 flex flex-col items-center justify-center p-1.5 transition-colors duration-300 ${turn === 'B' ? 'bg-[#e74c3c]/40 border-b-4 border-gold' : 'bg-[#e74c3c]/15'}`}>
          <div className="font-serif text-[11px] tracking-[0.1em] opacity-80">🐎 {teamBName}</div>
          <div className="font-serif text-3xl font-black text-gold leading-none">{scores.b}</div>
          <button onClick={() => handlePenalty('b')} className="bg-black/40 text-text-light/50 text-[10px] py-0.5 px-2.5 rounded-full border border-white/10 mt-1 font-serif tracking-widest hover:bg-crimson hover:text-white">⚠️ GÜRÜLTÜ (-50)</button>
        </div>
      </div>

      {/* Game Area */}
      <div className="p-5 flex flex-col items-center w-full">
        <div className="flex justify-between items-center w-full max-w-[850px] bg-black/40 border border-gold/20 rounded-lg py-3 px-5 mb-4">
          <div className="font-serif text-lg text-gold">
            ⚔️ {currentA ? (sube === 'MİSAFİR' ? `${currentA} Numara` : currentA) : ''} {turn === 'A' ? '← CEVAPLIYOR' : ''}  |  🐎 {currentB ? (sube === 'MİSAFİR' ? `${currentB} Numara` : currentB) : ''} {turn === 'B' ? '← CEVAPLIYOR' : ''}
          </div>
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-serif text-2xl font-black bg-black/60 transition-colors duration-300 ${timeLeft <= 15 ? 'text-crimson border-crimson animate-[timerPulse_1s_infinite]' : 'text-gold border-gold-dark'}`}>
            {timeLeft}
          </div>
        </div>

        <div className="w-full max-w-[850px] bg-gradient-to-br from-white/5 to-black/30 border border-gold/25 border-l-4 border-l-gold rounded-lg py-7 px-8 text-lg md:text-2xl min-h-[110px] flex items-center justify-center text-center leading-relaxed shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-5">
          {activeQ ? activeQ.s : 'Oyun başlatılıyor...'}
        </div>

        <div className="flex flex-wrap gap-2 justify-center my-5 w-full max-w-[850px]">
          {answerChars.map((char: string, i: number) => {
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-[850px] mt-4">
          <button onClick={handleAnswerClick} disabled={gameState !== 'playing'} className="btn-teal py-3.5 px-2 text-sm text-center">
            ⏱ CEVAPLA (20sn)
          </button>
          <button onClick={handleRevealLetter} disabled={revealedIndices.length >= answerChars.filter((c: string) => c !== ' ').length || gameState !== 'playing'} className="btn-gold py-3.5 px-2 text-sm text-center">
            🔤 HARF AL
          </button>
          
          {gameState === 'playing' || gameState === 'answering' ? (
            <>
              <button onClick={handleCorrect} className="py-3.5 px-2 text-sm text-center text-white font-serif font-bold rounded-md tracking-wider" style={{ background: 'linear-gradient(135deg,#1a5a2a,#27ae60)' }}>
                🏆 DESTAN YAZDI
              </button>
              <button onClick={handleWrong} className="btn-crimson py-3.5 px-2 text-sm text-center">
                💔 SAĞLIK OLSUN
              </button>
            </>
          ) : (
            <button onClick={handleNext} className="col-span-2 py-3.5 px-2 text-sm text-center text-white font-serif font-bold rounded-md tracking-wider" style={{ background: 'linear-gradient(135deg,#2980b9,#3498db)' }}>
              ▶️ İLERİ
            </button>
          )}
        </div>

        {gameState === 'answering' && (
          <div className="mt-6 text-center animate-pulse">
            <div className="text-xl text-text-light/70 mb-2">Cevaplama Süresi</div>
            <div className="text-5xl font-black text-crimson drop-shadow-[0_0_15px_rgba(231,76,60,0.6)]">
              {answerTimeLeft}
            </div>
          </div>
        )}

        <div className="text-center mt-8 flex justify-center gap-3">
          <button onClick={() => pickNextPlayers(bagA, bagB)} className="btn-teal py-3 px-7">
            → YENİ EŞLEŞME
          </button>
          <button onClick={() => navigate('/')} className="back-nav !mt-0">Ana Menü</button>
        </div>
      </div>
    </div>
  );
}
