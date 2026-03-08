import { useLocation, useNavigate } from 'react-router-dom';
import { getRank } from '../utils/helpers';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { score = 0, player = '', breakdown = '' } = location.state || {};
  const rank = getRank(score);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-5 relative z-10 min-h-screen text-center">
      <div className="title-grand text-4xl md:text-5xl mb-4">OYUN BİTTİ</div>
      <div className="title-divider"></div>
      
      <div className="font-serif text-lg text-text-light mb-2">{player}</div>
      
      <div className="font-serif text-6xl md:text-[110px] font-black text-gold drop-shadow-[0_0_60px_rgba(201,168,76,0.5)] leading-none my-5">
        {score}
      </div>
      
      <div className="font-serif text-xl text-teal-light my-2.5 drop-shadow-[0_0_20px_rgba(26,188,156,0.4)]">
        {rank}
      </div>
      
      <div className="mt-5 font-sans italic text-text-light/60 whitespace-pre-line">
        {breakdown}
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <button onClick={() => navigate('/')} className="btn-gold px-8 py-4 text-base">
          🏠 Ana Menü
        </button>
        <button onClick={() => navigate(-1)} className="btn-teal px-8 py-4 text-base">
          ↺ Tekrar Oyna
        </button>
      </div>
    </div>
  );
}
