import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu, getRutbe } from '../utils/helpers';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { data } = useApp();

  const [sinifFilter, setSinifFilter] = useState<string>('all');
  const [gameFilter, setGameFilter] = useState<'all' | 'harf' | 'cark' | 'kap'>('all');

  const levels = Array.from(new Set(Object.keys(data.siniflar).map(getSinifGrubu))).sort();

  const getFilteredEntries = () => {
    let allScores: any[] = [];
    let sinifList = Object.keys(data.siniflar);

    sinifList.forEach(sinif => {
      (data.siniflar[sinif] || []).forEach(ogrenci => {
        const skorObj = data.skorlar[sinif]?.[ogrenci] || { harf: 0, cark: 0, kap: 0 };
        let puan = 0;
        if (gameFilter === 'all') puan = (skorObj.harf || 0) + (skorObj.cark || 0) + (skorObj.kap || 0);
        else if (gameFilter === 'harf') puan = skorObj.harf || 0;
        else if (gameFilter === 'cark') puan = skorObj.cark || 0;
        else if (gameFilter === 'kap') puan = skorObj.kap || 0;
        
        allScores.push({ ogrenci, sinif, puan, skorObj, grade: getSinifGrubu(sinif) });
      });
    });

    // Sort all scores descending
    allScores.sort((a, b) => b.puan - a.puan);

    // Calculate ranks
    const classRanks: Record<string, number> = {};
    const gradeRanks: Record<string, number> = {};

    allScores.forEach(e => {
      if (e.puan > 0) {
        if (!classRanks[e.sinif]) classRanks[e.sinif] = 1;
        else classRanks[e.sinif]++;
        
        if (!gradeRanks[e.grade]) gradeRanks[e.grade] = 1;
        else gradeRanks[e.grade]++;

        e.classRank = classRanks[e.sinif];
        e.gradeRank = gradeRanks[e.grade];
      }
    });

    let entries = allScores;
    if (sinifFilter !== 'all') {
      entries = entries.filter(e => e.grade === sinifFilter);
    }

    return entries.filter(e => e.puan > 0);
  };

  const entries = getFilteredEntries();

  return (
    <div className="flex flex-col min-h-screen bg-deep">
      {/* Header */}
      <div className="bg-gradient-to-b from-gold/10 to-transparent border-b border-gold/15 py-7 px-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-gold tracking-wider">🏆 Puan Tablosu & Rütbeler</h1>
          <p className="text-sm text-text-light/40 italic mt-1">Birikimli toplam puanlar • Tüm oyunlar dahil</p>
        </div>
        <button onClick={() => navigate('/')} className="back-nav !mt-0">← Ana Menü</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 py-4 px-8 border-b border-gold/10 bg-black/20">
        <span className="text-[11px] tracking-widest text-text-light/35 font-serif mr-1">SINIF:</span>
        <button 
          onClick={() => setSinifFilter('all')} 
          className={`px-4 py-1.5 rounded-full font-serif text-xs tracking-wider border transition-all duration-200 ${sinifFilter === 'all' ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-gold/20 text-text-light/55 hover:border-gold hover:text-text-light'}`}
        >
          Tümü
        </button>
        {levels.map(level => (
          <button 
            key={level}
            onClick={() => setSinifFilter(level)} 
            className={`px-4 py-1.5 rounded-full font-serif text-xs tracking-wider border transition-all duration-200 ${sinifFilter === level ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-gold/20 text-text-light/55 hover:border-gold hover:text-text-light'}`}
          >
            {level}. Sınıf
          </button>
        ))}

        <div className="w-px h-6 bg-gold/15 mx-1.5"></div>

        <span className="text-[11px] tracking-widest text-text-light/35 font-serif mr-1">OYUN:</span>
        <button 
          onClick={() => setGameFilter('all')} 
          className={`px-4 py-1.5 rounded-full font-serif text-xs tracking-wider border transition-all duration-200 ${gameFilter === 'all' ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-gold/20 text-text-light/55 hover:border-gold hover:text-text-light'}`}
        >
          Toplam
        </button>
        <button 
          onClick={() => setGameFilter('harf')} 
          className={`px-4 py-1.5 rounded-full font-serif text-xs tracking-wider border transition-all duration-200 ${gameFilter === 'harf' ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-gold/20 text-text-light/55 hover:border-gold hover:text-text-light'}`}
        >
          📜 Harf Harf
        </button>
        <button 
          onClick={() => setGameFilter('cark')} 
          className={`px-4 py-1.5 rounded-full font-serif text-xs tracking-wider border transition-all duration-200 ${gameFilter === 'cark' ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-gold/20 text-text-light/55 hover:border-gold hover:text-text-light'}`}
        >
          🎡 Çark
        </button>
        <button 
          onClick={() => setGameFilter('kap')} 
          className={`px-4 py-1.5 rounded-full font-serif text-xs tracking-wider border transition-all duration-200 ${gameFilter === 'kap' ? 'bg-gold/15 border-gold text-gold' : 'bg-white/5 border-gold/20 text-text-light/55 hover:border-gold hover:text-text-light'}`}
        >
          ⚔️ Kapışma
        </button>
      </div>

      {/* Body */}
      <div className="p-6 md:p-8 flex-1 w-full max-w-[900px] mx-auto">
        {entries.length === 0 ? (
          <div className="text-center py-16 text-text-light/25 italic text-sm">
            <div className="text-5xl mb-3">🏛️</div>
            <p>Henüz hiç puan kaydedilmemiş.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {entries.map((e, i) => {
              const rutbe = getRutbe(e.puan);
              const isTop3 = i < 3;
              const posClass = i === 0 ? 'text-gold' : i === 1 ? 'text-[#c0c0c0]' : i === 2 ? 'text-[#b0663d]' : 'text-text-light/30';
              const rowClass = i === 0 ? 'bg-gold/10 border-gold/25' : i === 1 ? 'bg-[#c0c0c0]/5 border-[#c0c0c0]/15' : i === 2 ? 'bg-[#b0663d]/5 border-[#b0663d]/15' : 'bg-white/5 border-gold/10 hover:bg-gold/5 hover:border-gold/15';
              const posIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

              return (
                <div key={`${e.sinif}-${e.ogrenci}`} className={`flex items-center gap-3.5 p-3 px-4 rounded-md border transition-all duration-200 ${rowClass}`}>
                  <div className={`font-serif text-base font-bold min-w-[32px] text-center ${posClass}`}>{posIcon}</div>
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-lg border border-gold/20 shrink-0">
                    {rutbe.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[15px] text-text-light whitespace-nowrap overflow-hidden text-ellipsis">{e.ogrenci}</div>
                    <div className="text-[11px] text-text-light/40 mt-0.5 tracking-wider">
                      {e.sinif} (Sınıf İçi: {e.classRank}.) · {e.grade}. Sınıflar Arası: {e.gradeRank}. <span className="hidden sm:inline-flex gap-2 ml-1">
                        <span className="text-[11px] py-0.5 px-2 rounded-full bg-white/5 border border-white/10 text-text-light/50">📜 {(e.skorObj.harf || 0).toLocaleString('tr-TR')}</span>
                        <span className="text-[11px] py-0.5 px-2 rounded-full bg-white/5 border border-white/10 text-text-light/50">🎡 {(e.skorObj.cark || 0).toLocaleString('tr-TR')}</span>
                        <span className="text-[11px] py-0.5 px-2 rounded-full bg-white/5 border border-white/10 text-text-light/50">⚔️ {(e.skorObj.kap || 0).toLocaleString('tr-TR')}</span>
                      </span>
                    </div>
                  </div>
                  <div className="font-serif text-[10px] py-1 px-2.5 rounded-full bg-gold/10 border border-gold/20 text-gold whitespace-nowrap tracking-wider hidden sm:block">
                    {rutbe.icon} {rutbe.ad}
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="font-serif text-xl font-bold text-gold leading-none">{e.puan.toLocaleString('tr-TR')}</div>
                    <div className="text-[11px] text-text-light/35 mt-0.5">puan</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
