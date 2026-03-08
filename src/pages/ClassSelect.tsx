import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu, getBaseGrade, getCourseName, COURSE_NAMES } from '../utils/helpers';

export default function ClassSelect({ game }: { game: 'harf' | 'cark' | 'kapisma' }) {
  const navigate = useNavigate();
  const { data } = useApp();

  const availableCourses = Object.keys(COURSE_NAMES).sort((a, b) => {
    const gradeA = parseInt(getBaseGrade(a));
    const gradeB = parseInt(getBaseGrade(b));
    if (gradeA !== gradeB) return gradeA - gradeB;
    return a.localeCompare(b);
  });

  const titles = {
    harf: 'HARF HARF TARİH',
    cark: 'ZAMANIN ÇARKI',
    kapisma: 'TARİH KAPIŞMASI'
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-5 relative z-10 min-h-screen">
      <div className="text-center mb-8">
        <div className="title-grand text-3xl md:text-5xl leading-tight">{titles[game]}</div>
        <div className="title-divider"></div>
        <div className="font-sans italic text-text-light/80 tracking-wider mt-2 text-lg">Dersinizi seçiniz</div>
      </div>

      <div className="flex flex-col gap-4 justify-center mt-8 w-full max-w-xl">
        {availableCourses.map(courseId => (
          <button 
            key={courseId}
            onClick={() => navigate(`/games/${game}/unite/${courseId}`)}
            className="btn-gold px-9 py-5 text-lg w-full"
          >
            {getCourseName(courseId)}
          </button>
        ))}
      </div>

      <button onClick={() => navigate('/')} className="back-nav mt-12">
        ← Ana Menü
      </button>
    </div>
  );
}
