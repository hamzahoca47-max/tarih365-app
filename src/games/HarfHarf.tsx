import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  { q: "Osmanlı'da ilk düzenli ordu", a: "YAYA" },
  { q: "Anadolu Selçuklu Devleti'nin kurucusu", a: "SÜLEYMAN" },
  { q: "İstanbul'u fetheden padişah", a: "MEHMED" },
  { q: "Mısır seferine çıkan padişah", a: "YAVUZ" },
  { q: "Osmanlı'da medeni kanun", a: "MECELLE" },
  { q: "Lale Devri'nin ünlü şairi", a: "NEDİM" },
  { q: "Cumhuriyetin ilan edildiği şehir", a: "ANKARA" },
  { q: "İlk kadın tarihçimiz", a: "AFETİNAN" },
  { q: "Preveze Deniz Zaferi kahramanı", a: "BARBAROS" },
  { q: "Osmanlı'nın son başkenti", a: "İSTANBUL" },
  { q: "Milli Mücadele'nin başladığı şehir", a: "SAMSUN" },
  { q: "İlk Türk matbaasını kuran", a: "İBRAHİM" },
];

function getQuestions() {
  return [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
}

export default function HarfHarf() {
  const { addScore } = useAuth();
  const navigate = useNavigate();
  
  const [questions] = useState(getQuestions());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameState, setGameState] = useState<'playing' | 'answering' | 'finished'>('playing');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerTimeLeft, setAnswerTimeLeft] = useState(30);
  const [gameScore, setGameScore] = useState(0);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'answering' && answerTimeLeft > 0) {
      const timer = setInterval(() => setAnswerTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (answerTimeLeft === 0 && gameState === 'answering') {
      handleWrongAnswer();
    }
  }, [gameState, answerTimeLeft]);

  const handleGetLetter = () => {
    if (gameState !== 'playing') return;
    const unrevealed = Array.from({length: currentQ.a.length}, (_, i) => i).filter(i => !revealedIndices.includes(i));
    if (unrevealed.length > 0) {
      const randomIdx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedIndices([...revealedIndices, randomIdx]);
    }
  };

  const startAnswering = () => {
    setGameState('answering');
    setAnswerTimeLeft(30);
  };

  const submitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const normalize = (s: string) => s.toLocaleUpperCase('tr-TR').replace(/\s/g, '');
    
    if (normalize(userAnswer) === normalize(currentQ.a)) {
      const points = (currentQ.a.length - revealedIndices.length) * 100;
      setGameScore(s => s + points);
      nextQuestion();
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    const penalty = revealedIndices.length * 100;
    setGameScore(s => s - penalty);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setRevealedIndices([]);
      setUserAnswer('');
      setGameState('playing');
    } else {
      setGameState('finished');
    }
  };

  const finishGame = () => {
    const timeBonus = timeLeft * 10;
    const finalScore = gameScore + timeBonus;
    addScore(finalScore > 0 ? finalScore : 0);
    navigate('/dashboard');
  };

  if (gameState === 'finished') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">Oyun Bitti!</h2>
        <div className="text-2xl mb-4">Oyun Puanı: <span className="font-bold text-amber-600">{gameScore}</span></div>
        <div className="text-xl mb-8">Süre Bonusu: <span className="font-bold text-emerald-600">+{timeLeft * 10}</span></div>
        <div className="text-3xl font-bold mb-8">Toplam: {gameScore + (timeLeft * 10)} Puan</div>
        <button onClick={finishGame} className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors">
          Ana Ekrana Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="text-lg font-bold text-stone-500">Soru {currentIndex + 1} / 10</div>
        <div className="text-2xl font-mono font-bold text-amber-600">{timeLeft} sn</div>
        <div className="text-lg font-bold text-stone-500">Puan: {gameScore}</div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 text-center mb-8">
        <h2 className="text-2xl font-medium text-stone-800 mb-12">{currentQ.q}</h2>
        
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {currentQ.a.split('').map((char, i) => (
            <div 
              key={i} 
              className="w-12 h-16 bg-stone-100 border-2 border-stone-300 rounded-lg flex items-center justify-center text-3xl font-bold text-stone-900 shadow-inner"
            >
              {revealedIndices.includes(i) ? char : ''}
            </div>
          ))}
        </div>

        {gameState === 'playing' ? (
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleGetLetter}
              disabled={revealedIndices.length === currentQ.a.length}
              className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              Harf Al
            </button>
            <button 
              onClick={startAnswering}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
            >
              Cevapla
            </button>
          </div>
        ) : (
          <form onSubmit={submitAnswer} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-amber-500 rounded-xl text-xl text-center outline-none uppercase font-bold"
                placeholder="Cevabınız..."
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 rounded-xl">
                Gönder
              </button>
            </div>
            <div className="mt-4 text-sm font-bold text-red-500">Kalan Süre: {answerTimeLeft} sn</div>
          </form>
        )}
      </div>
    </div>
  );
}
