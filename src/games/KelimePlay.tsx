import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const SOUNDS = {
  correct: 'https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3',
  wrong: 'https://cdn.pixabay.com/audio/2021/08/04/audio_3e6699296f.mp3',
  click: 'https://cdn.pixabay.com/audio/2022/03/15/audio_78390a304f.mp3',
  joker: 'https://cdn.pixabay.com/audio/2022/02/08/audio_a07f46f798.mp3',
  pass: 'https://cdn.pixabay.com/audio/2023/06/17/audio_b15847f831.mp3'
};

export default function KelimePlay() {
  const navigate = useNavigate();
  const { data, musicEnabled } = useApp();

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
  const [timeLeft, setTimeLeft] = useState(100);
  const [isRunning, setIsRunning] = useState(true);
  const [lettersTaken, setLettersTaken] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

  useEffect(() => {
    const pool = data.eglenceSorular?.kelime || [];
    if (pool.length === 0) {
      alert('Henüz kelime sorusu eklenmemiş!\nAdmin Paneli → Eğlence Atölyesi → Soru Ekle');
      navigate('/games/eglence');
      return;
    }
    
    // Pick 10 random questions
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
    setQuestions(shuffled);
  }, [data, navigate]);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0 && gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
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
  }, [isRunning, timeLeft, gameState]);

  const currentQ = questions[currentQIndex];

  const handleRevealLetter = () => {
    if (!currentQ || gameState !== 'playing' || !isRunning) return;
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
    if (!currentQ || gameState !== 'playing' || !isRunning) return;
    if (!window.confirm('Joker kullanmak istiyor musunuz?\n\nTüm harfler açılacak ama puan alamayacaksınız.')) return;
    playSound('joker');
    
    const answer = currentQ.c.toUpperCase();
    const allIndices = Array.from({ length: answer.length }, (_, i) => i);
    setRevealedIndices(allIndices);
    
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handlePass = () => {
    if (!window.confirm('Bu soruyu pas geçmek istediğinizden emin misiniz?\n(Puan kazanamazsınız)')) return;
    playSound('pass');
    handleNextQuestion();
  };

  const handleGuess = (index: number) => {
    if (revealedIndices.includes(index) || !isRunning || gameState !== 'playing') return;
    
    const newRevealed = [...revealedIndices, index];
    setRevealedIndices(newRevealed);
    
    const answer = currentQ.c.toUpperCase();
    const totalChars = answer.replace(/ /g, '').length;
    
    if (newRevealed.length === totalChars) {
      // Word completed
      const points = Math.max(0, 100 + (timeLeft * 2) - (lettersTaken * 10));
      setScore(prev => prev + points);
      playSound('correct');
      
      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setRevealedIndices([]);
      setLettersTaken(0);
    } else {
      setGameState('finished');
    }
  };

  const handleQuit = () => {
    if (!window.confirm('Oyunu bitirmek istediğinizden emin misiniz?')) return;
    setGameState('finished');
  };

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-5 relative z-10 min-h-screen text-center">
        <div className="title-grand text-4xl md:text-5xl mb-4">OYUN BİTTİ</div>
        <div className="title-divider"></div>
        <div className="font-serif text-3xl text-gold my-5">Toplam Puan: {score}</div>
        <div className="text-text-light/70 mb-8">Tamamlanan Soru: {currentQIndex}/{questions.length}</div>
        <button onClick={() => navigate('/games/eglence')} className="btn-gold px-8 py-4">
          Eğlence Menüsüne Dön
        </button>
      </div>
    );
  }

  if (!currentQ) return <div className="text-center py-20">Yükleniyor...</div>;

  const answerChars = currentQ.c.toUpperCase().split('');

  return (
    <div className="flex flex-col items-center py-5 px-5 relative z-10 min-h-screen w-full">
      <div className="w-full max-w-[900px]">
        {/* Header */}
        <div className="flex justify-between items-center w-full bg-black/40 border border-gold/20 rounded-lg py-3 px-5 mb-4">
          <div>
            <span className="text-xs text-text-light/50 block tracking-widest">SKOR</span>
            <div className="font-serif text-3xl text-gold drop-shadow-[0_0_20px_rgba(201,168,76,0.4)]">{score}</div>
          </div>
          <div className="text-center">
            <span className="text-xs text-text-light/50 block tracking-widest">SORU</span>
            <div className="font-serif text-lg text-gold">{currentQIndex + 1}/{questions.length}</div>
          </div>
          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-serif text-2xl font-black bg-black/60 transition-colors duration-300 ${timeLeft <= 20 ? 'text-crimson border-crimson animate-[timerPulse_1s_infinite]' : 'text-gold border-gold-dark'}`}>
            {timeLeft}
          </div>
        </div>

        {/* Question */}
        <div className="w-full bg-gradient-to-br from-white/5 to-black/30 border border-gold/25 border-l-4 border-l-gold rounded-lg py-7 px-8 text-lg md:text-2xl min-h-[110px] flex items-center justify-center text-center leading-relaxed shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-8">
          {currentQ.s}
        </div>

        {/* Letters */}
        <div className="flex flex-wrap gap-2 justify-center my-5">
          {answerChars.map((char: string, i: number) => {
            if (char === ' ') return <div key={i} className="w-10 h-14 invisible"></div>;
            const isRevealed = revealedIndices.includes(i);
            return (
              <div 
                key={i} 
                onClick={() => handleGuess(i)}
                className={`w-[52px] h-[58px] flex items-center justify-center text-3xl font-black font-serif rounded-md shadow-[0_3px_8px_rgba(0,0,0,0.4)] transition-all duration-200 border-b-[5px] ${isRevealed ? 'bg-parchment text-text-dark border-[#c8b89a] cursor-default' : 'bg-[#3a3020] text-transparent border-[#2a2010] cursor-pointer hover:bg-[#4a4030]'}`}
              >
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center max-w-[700px] mx-auto mb-5">
          <button onClick={() => setIsRunning(!isRunning)} className="flex-1 min-w-[140px] py-3.5 px-2 text-sm text-center text-white font-serif font-bold rounded-md tracking-wider" style={{ background: 'linear-gradient(135deg,#e67e22,#d35400)' }}>
            {isRunning ? '⏸ SÜREYİ DURDUR' : '▶ DEVAM'}
          </button>
          <button onClick={handleRevealLetter} className="flex-1 min-w-[140px] py-3.5 px-2 text-sm text-center text-white font-serif font-bold rounded-md tracking-wider" style={{ background: 'linear-gradient(135deg,#3498db,#2980b9)' }}>
            💡 HARF AL
          </button>
          <button onClick={handleJoker} className="flex-1 min-w-[140px] py-3.5 px-2 text-sm text-center text-white font-serif font-bold rounded-md tracking-wider" style={{ background: 'linear-gradient(135deg,#9b59b6,#8e44ad)' }}>
            🃏 JOKER
          </button>
          <button onClick={handlePass} className="flex-1 min-w-[140px] py-3.5 px-2 text-sm text-center text-white font-serif font-bold rounded-md tracking-wider" style={{ background: 'linear-gradient(135deg,#95a5a6,#7f8c8d)' }}>
            ⏭️ PAS
          </button>
        </div>

        <div className="text-center mt-8">
          <button onClick={handleQuit} className="back-nav">🏁 Oyunu Bitir</button>
        </div>
      </div>
    </div>
  );
}
