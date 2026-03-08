import { useNavigate } from 'react-router-dom';

export default function EglenceMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center py-10 px-5 relative z-10 min-h-screen">
      <div className="text-center mb-8">
        <div className="title-grand text-3xl md:text-5xl leading-tight">🎮 EĞLENCE ATÖLYESİ</div>
        <div className="title-divider"></div>
      </div>

      <div className="max-w-[500px] w-full mx-auto mt-8 flex flex-col gap-4">
        <button 
          onClick={() => navigate('/games/eglence/kelime')} 
          className="btn-gold w-full py-5 text-lg"
        >
          🎯 Efsane Kelime Oyunu
        </button>
        
        <button onClick={() => navigate('/')} className="back-nav mt-8 self-center">
          ← Ana Menü
        </button>
      </div>
    </div>
  );
}
