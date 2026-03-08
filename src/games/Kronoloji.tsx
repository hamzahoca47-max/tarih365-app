import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';

const EVENTS = [
  { id: 1, text: "Kavimler Göçü", year: 375 },
  { id: 2, text: "Malazgirt Meydan Muharebesi", year: 1071 },
  { id: 3, text: "İstanbul'un Fethi", year: 1453 },
  { id: 4, text: "Fransız İhtilali", year: 1789 },
  { id: 5, text: "Cumhuriyetin İlanı", year: 1923 },
];

export default function Kronoloji() {
  const { addScore } = useAuth();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([...EVENTS].sort(() => Math.random() - 0.5));
  const [timeLeft, setTimeLeft] = useState(30);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setLives(l => l - 1);
      if (lives > 1) {
        setTimeLeft(30);
      } else {
        setGameState('lost');
      }
    }
  }, [timeLeft, gameState, lives]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (gameState !== 'playing') return;
    const newItems = [...items];
    if (direction === 'up' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'down' && index < items.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    }
    setItems(newItems);
  };

  const checkOrder = () => {
    const isCorrect = items.every((item, i) => {
      if (i === 0) return true;
      return item.year >= items[i - 1].year;
    });

    if (isCorrect) {
      setGameState('won');
    } else {
      setLives(l => l - 1);
      if (lives <= 1) {
        setGameState('lost');
      }
    }
  };

  const finishGame = () => {
    if (gameState === 'won') {
      addScore(1000 + (timeLeft * 10));
    }
    navigate('/dashboard');
  };

  if (gameState !== 'playing') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-3xl shadow-sm border border-stone-200">
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">
          {gameState === 'won' ? 'Tebrikler!' : 'Oyun Bitti!'}
        </h2>
        <p className="text-xl text-stone-600 mb-8">
          {gameState === 'won' 
            ? `Doğru sıralama! Kazanılan Puan: ${1000 + (timeLeft * 10)}` 
            : 'Doğru sıralamayı bulamadınız.'}
        </p>
        <button onClick={finishGame} className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-stone-800 transition-colors">
          Ana Ekrana Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex gap-2">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? 'bg-red-500' : 'bg-stone-200'}`} />
          ))}
        </div>
        <div className="text-2xl font-mono font-bold text-amber-600">{timeLeft} sn</div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-medium text-stone-800 mb-6 text-center">Olayları eskiden yeniye doğru sıralayın.</h2>
        
        <div className="space-y-3 mb-8">
          {items.map((item, index) => (
            <motion.div 
              layout
              key={item.id}
              className="flex items-center justify-between bg-stone-50 border border-stone-200 p-4 rounded-xl"
            >
              <span className="font-medium text-stone-800">{item.text}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === items.length - 1}
                  className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 disabled:opacity-50"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={checkOrder}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
        >
          Sıralamayı Kontrol Et
        </button>
      </div>
    </div>
  );
}
