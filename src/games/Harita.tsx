import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  { q: "Malazgirt Meydan Muharebesi'nin yapıldığı yer neresidir?", x: 80, y: 45 },
  { q: "Osmanlı Devleti'nin kurulduğu Söğüt neresidir?", x: 25, y: 35 },
  { q: "Büyük Taarruz'un başladığı Kocatepe nerededir?", x: 30, y: 50 },
];

export default function Harita() {
  const { addScore } = useAuth();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [clickedPos, setClickedPos] = useState<{x: number, y: number} | null>(null);
  const [result, setResult] = useState<{points: number, distance: number} | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const currentQ = QUESTIONS[currentIndex];

  const handleMapClick = (e: React.MouseEvent) => {
    if (result || !mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setClickedPos({ x, y });
    
    const dx = (x - currentQ.x) * 8;
    const dy = (y - currentQ.y) * 4;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    let points = 0;
    if (distance <= 30) points = 1000;
    else if (distance <= 80) points = 500;
    
    setResult({ points, distance });
    setScore(s => s + points);
  };

  const nextQuestion = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
      setClickedPos(null);
      setResult(null);
    } else {
      addScore(score);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="text-lg font-bold text-stone-500">Soru {currentIndex + 1} / {QUESTIONS.length}</div>
        <div className="text-lg font-bold text-stone-500">Toplam Puan: {score}</div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 text-center">
        <h2 className="text-2xl font-medium text-stone-800 mb-8">{currentQ.q}</h2>
        
        <div 
          ref={mapRef}
          onClick={handleMapClick}
          className="relative w-full aspect-[2/1] bg-blue-50 border-2 border-stone-200 rounded-xl overflow-hidden cursor-crosshair mb-8"
          style={{
            backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Turkey_location_map.svg/1024px-Turkey_location_map.svg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {clickedPos && (
            <div 
              className="absolute w-4 h-4 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-md"
              style={{ left: `${clickedPos.x}%`, top: `${clickedPos.y}%` }}
            />
          )}
          {result && (
            <div 
              className="absolute w-6 h-6 bg-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-md animate-ping"
              style={{ left: `${currentQ.x}%`, top: `${currentQ.y}%` }}
            />
          )}
        </div>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="text-2xl font-bold mb-2">
              {result.points === 1000 ? '🎯 Tam İsabet!' : result.points === 500 ? '📍 Yakın!' : '❌ Uzak!'}
            </div>
            <div className="text-stone-600 mb-6">Kazanılan Puan: <span className="font-bold text-amber-600">{result.points}</span></div>
            <button 
              onClick={nextQuestion}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              {currentIndex < QUESTIONS.length - 1 ? 'Sıradaki Soru' : 'Oyunu Bitir'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
