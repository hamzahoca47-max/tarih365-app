import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu, getBaseGrade, getCourseName } from '../utils/helpers';

export default function SubeSelect({ game }: { game: 'harf' | 'cark' | 'kapisma' }) {
  const navigate = useNavigate();
  const { grup, unite } = useParams();
  const { data, user, activeSchoolPin, setActiveSchoolPin } = useApp();
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinValue, setPinValue] = useState('');

  const baseGrade = getBaseGrade(grup || '');
  const subeler = Object.keys(data.siniflar)
    .filter(s => getSinifGrubu(s) === baseGrade && s !== 'MİSAFİR')
    .sort((a, b) => a.localeCompare(b, 'tr'));

  const handleSelect = (sube: string) => {
    if (sube === 'MİSAFİR') {
      if (game === 'harf') navigate(`/games/harf/student/${grup}/${encodeURIComponent(sube)}/${unite}`);
      else if (game === 'cark') navigate(`/games/cark/play/${grup}/${encodeURIComponent(sube)}/${unite}`);
      else if (game === 'kapisma') navigate(`/games/kapisma/lobby/${grup}/${encodeURIComponent(sube)}/${unite}`);
      return;
    }

    if (game === 'harf') navigate(`/games/harf/student/${grup}/${encodeURIComponent(sube)}/${unite}`);
    else if (game === 'cark') navigate(`/games/cark/play/${grup}/${encodeURIComponent(sube)}/${unite}`);
    else if (game === 'kapisma') navigate(`/games/kapisma/lobby/${grup}/${encodeURIComponent(sube)}/${unite}`);
  };

  const handlePinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pinValue.trim()) {
      localStorage.setItem('dta_active_school_pin', pinValue.trim());
      setActiveSchoolPin(pinValue.trim());
      setShowPinInput(false);
      setPinValue('');
    }
  };

  const handleClearPin = () => {
    localStorage.removeItem('dta_active_school_pin');
    setActiveSchoolPin(null);
  };

  if (subeler.length === 0 && !data.siniflar['MİSAFİR']) {
    // If no subeler and no misafir, just use the grup name as the sube
    handleSelect(grup || '');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-5 relative z-10 min-h-screen">
      <div className="text-center mb-8">
        <div className="title-grand text-2xl md:text-4xl leading-tight">
          {getCourseName(grup || '').toUpperCase()} ({unite === 'genel' ? 'Tüm Üniteler' : `${unite}. Ünite`}) — ŞUBE SEÇİMİ
        </div>
        <div className="title-divider"></div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mt-8 max-w-3xl">
        <button 
          onClick={() => handleSelect('MİSAFİR')}
          className="btn-gold px-9 py-5 text-lg bg-emerald-900/40 border-emerald-500/50 hover:bg-emerald-800/60"
        >
          Hızlı Başlat (Misafir Modu)
        </button>
        {subeler.map(sube => (
          <button 
            key={sube}
            onClick={() => handleSelect(sube)}
            className="btn-gold px-9 py-5 text-lg"
          >
            {sube}
          </button>
        ))}
      </div>

      {!user && (
        <div className="mt-12 flex flex-col items-center">
          {activeSchoolPin ? (
            <div className="text-center">
              <p className="text-emerald-400/80 text-sm mb-2">✅ Okul şifresi aktif: {activeSchoolPin}</p>
              <button onClick={handleClearPin} className="text-xs text-text-light/50 hover:text-crimson underline">
                Şifreyi Kaldır
              </button>
            </div>
          ) : (
            <>
              {!showPinInput ? (
                <button 
                  onClick={() => setShowPinInput(true)}
                  className="text-sm text-gold-light/70 hover:text-gold underline decoration-gold/30 underline-offset-4"
                >
                  Okul Şifresi ile Sınıf Listelerini Getir
                </button>
              ) : (
                <form onSubmit={handlePinSubmit} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Okul Şifresi" 
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    className="bg-black/40 border border-gold/30 rounded px-3 py-1.5 text-sm text-text-light focus:outline-none focus:border-gold w-32"
                    autoFocus
                  />
                  <button type="submit" className="bg-gold/20 text-gold-light px-3 py-1.5 rounded text-sm hover:bg-gold/30 border border-gold/30">
                    Onayla
                  </button>
                  <button type="button" onClick={() => setShowPinInput(false)} className="text-text-light/50 hover:text-text-light px-2">
                    ✕
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}

      <button onClick={() => navigate(`/games/${game}/unite/${grup}`)} className="back-nav mt-12">
        ← Ünite Seçimine Dön
      </button>
    </div>
  );
}
