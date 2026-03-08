import { useNavigate, useParams } from 'react-router-dom';
import { getCourseName } from '../utils/helpers';

export default function UniteSelect({ game }: { game: 'harf' | 'cark' | 'kapisma' }) {
  const navigate = useNavigate();
  const { grup } = useParams();

  const uniteler = ['1', '2', '3', '4', '5', 'genel'];

  return (
    <div className="flex flex-col items-center justify-center py-10 px-5 relative z-10 min-h-screen">
      <div className="text-center mb-8">
        <div className="title-grand text-2xl md:text-4xl leading-tight">{getCourseName(grup || '').toUpperCase()} — ÜNİTE SEÇİMİ</div>
        <div className="title-divider"></div>
        <div className="font-sans italic text-text-light/80 tracking-wider mt-2 text-lg">Hangi üniteyi çalışmak istersiniz?</div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mt-8 max-w-3xl">
        {uniteler.map(u => (
          <button 
            key={u}
            onClick={() => navigate(`/games/${game}/sube/${grup}/${u}`)}
            className="btn-gold px-9 py-5 text-lg"
          >
            {u === 'genel' ? '📚 TÜM ÜNİTELER' : `${u}. Ünite`}
          </button>
        ))}
      </div>

      <button onClick={() => navigate(`/games/${game}`)} className="back-nav mt-12">
        ← Geri
      </button>
    </div>
  );
}
