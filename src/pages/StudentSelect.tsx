import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu } from '../utils/helpers';

export default function StudentSelect() {
  const navigate = useNavigate();
  const { course, sube, unite } = useParams();
  const { data, musicEnabled } = useApp();
  
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [completedStudents, setCompletedStudents] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const students = sube === 'MİSAFİR' 
    ? Array.from({ length: 40 }, (_, i) => `${i + 1}`)
    : (data.siniflar[sube || ''] || []);

  const startRandomSelection = () => {
    if (isSpinning) return;
    
    const availableStudents = students.filter(s => !completedStudents.includes(s));
    if (availableStudents.length === 0) return;

    setIsSpinning(true);
    setSelectedStudent(null);
    
    let spin = 0;
    const maxSpins = 30 + Math.floor(Math.random() * 10);
    
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      const studentName = availableStudents[randomIndex];
      const actualIndex = students.indexOf(studentName);
      
      setHighlightedIndex(actualIndex);

      if (musicEnabled) {
        const tick = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_78390a304f.mp3');
        tick.volume = 0.2;
        tick.play().catch(() => {});
      }
      
      spin++;
      if (spin >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        setSelectedStudent(studentName);
        
        if (musicEnabled) {
          const tada = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3');
          tada.volume = 0.5;
          tada.play().catch(() => {});
        }
      }
    }, 100);
  };

  const handleStartGame = (student: string) => {
    if (!completedStudents.includes(student)) {
      setCompletedStudents(prev => [...prev, student]);
    }
    navigate(`/games/harf/play/${course}/${encodeURIComponent(sube || '')}/${unite}/${encodeURIComponent(student)}`);
  };

  return (
    <div className="flex flex-col items-center py-10 px-5 relative z-10 min-h-screen w-full max-w-[1000px] mx-auto">
      <div className="text-center mb-6">
        <div className="title-grand text-2xl md:text-3xl leading-tight">{sube} – YARIŞMACI SEÇİMİ</div>
        <div className="title-divider"></div>
      </div>

      <div className="font-serif text-2xl text-gold min-h-[36px] my-3 text-center drop-shadow-[0_0_20px_rgba(201,168,76,0.5)]">
        {isSpinning ? 'Dönüyor...' : selectedStudent ? (sube === 'MİSAFİR' ? `${selectedStudent} Numaralı Öğrenci yarışıyor!` : `${selectedStudent} yarışıyor!`) : '—'}
      </div>

      <button 
        onClick={selectedStudent && !isSpinning ? () => handleStartGame(selectedStudent) : startRandomSelection}
        disabled={isSpinning || students.length === completedStudents.length}
        className={`px-7 py-3 text-base mt-2 ${selectedStudent && !isSpinning ? 'btn-teal' : isSpinning ? 'btn-crimson' : 'btn-gold'}`}
      >
        {isSpinning ? 'Seçiliyor...' : selectedStudent ? (sube === 'MİSAFİR' ? `✔ ${selectedStudent} Numara – BAŞLAT` : `✔ ${selectedStudent} – BAŞLAT`) : '🎲 Rastgele Seç'}
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 w-full mt-8">
        {students.map((student, index) => {
          const isCompleted = completedStudents.includes(student);
          const isHighlighted = highlightedIndex === index;
          const isSelected = selectedStudent === student;

          return (
            <button
              key={index}
              onClick={() => {
                if (!isSpinning && !isCompleted) {
                  setSelectedStudent(student);
                  setHighlightedIndex(index);
                }
              }}
              disabled={isCompleted || isSpinning}
              className={`
                px-2 py-3 rounded-md text-[13px] font-serif text-center tracking-wide transition-all duration-200
                ${isCompleted ? 'bg-[#27ae60]/15 border-[#27ae60] opacity-50 line-through' : 
                  isSelected || isHighlighted ? 'bg-gold/35 border-gold-light text-text-dark scale-105' : 
                  'bg-gold/5 border-gold/20 text-text-light hover:bg-gold/20 hover:border-gold hover:text-gold-light'}
                border
              `}
            >
              {student}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 justify-center mt-8">
        <button onClick={startRandomSelection} disabled={isSpinning} className="btn-gold px-6 py-3 text-sm">
          🔄 Tekrar Seç
        </button>
        <button onClick={() => navigate(`/games/harf/sube/${course}/${unite}`)} className="back-nav !mt-0">
          ← Şube Seç
        </button>
      </div>
    </div>
  );
}
