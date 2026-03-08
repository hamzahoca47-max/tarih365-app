import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SoruKartlari() {
  const { data } = useApp();
  const [module, setModule] = useState<'harf' | 'cark' | 'eglence'>('harf');
  const [sinif, setSinif] = useState<string>('');
  const [unite, setUnite] = useState<string>('');

  // We need to get the list of available classes and units based on the selected module
  const availableClasses = module === 'harf' 
    ? Object.keys(data.sorular || {}) 
    : module === 'cark' 
      ? Object.keys(data.carkSinifSorular || {}) 
      : [];

  // Sort classes
  availableClasses.sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const currentSinif = availableClasses.includes(sinif) ? sinif : (availableClasses[0] || '');

  const availableUnits = module === 'harf' && currentSinif
    ? Object.keys(data.sorular[currentSinif] || {})
    : module === 'cark' && currentSinif
      ? Object.keys(data.carkSinifSorular[currentSinif] || {})
      : [];

  availableUnits.sort((a, b) => parseInt(a) - parseInt(b));
  
  // Add 'genel' option to the beginning if there are units
  if (availableUnits.length > 0 && !availableUnits.includes('genel')) {
    availableUnits.unshift('genel');
  }

  const currentUnite = availableUnits.includes(unite) ? unite : (availableUnits[0] || '');

  let questionsToDisplay: any[] = [];

  if (module === 'harf' && currentSinif && currentUnite) {
    if (currentUnite === 'genel') {
      Object.values(data.sorular[currentSinif] || {}).forEach(arr => {
        if (Array.isArray(arr)) questionsToDisplay.push(...arr);
      });
    } else {
      const arr = data.sorular[currentSinif]?.[currentUnite];
      questionsToDisplay = Array.isArray(arr) ? arr : [];
    }
  } else if (module === 'cark' && currentSinif && currentUnite) {
    if (currentUnite === 'genel') {
      Object.values(data.carkSinifSorular[currentSinif] || {}).forEach(arr => {
        if (Array.isArray(arr)) questionsToDisplay.push(...arr);
      });
    } else {
      const arr = data.carkSinifSorular[currentSinif]?.[currentUnite];
      questionsToDisplay = Array.isArray(arr) ? arr : [];
    }
  } else if (module === 'eglence') {
    const arr = data.eglenceSorular?.kelime;
    questionsToDisplay = Array.isArray(arr) ? arr : [];
  }

  if (!Array.isArray(questionsToDisplay)) {
    questionsToDisplay = [];
  }

  const handlePrint = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        const content = questionsToDisplay.map((q, idx) => `
          <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; border-radius: 8px;">
            <div style="font-family: sans-serif; font-size: 16px; margin-bottom: 10px;">
              <strong>Soru ${idx + 1}:</strong> ${module === 'cark' ? q.q : q.s}
            </div>
            <div style="font-family: serif; font-size: 18px; font-weight: bold;">
              Cevap: ${module === 'cark' ? q.a : q.c}
            </div>
          </div>
        `).join('');

        const moduleName = module === 'harf' ? 'Harf Harf / Tarih Kapışması' : module === 'cark' ? 'Zamanın Çarkı' : 'Eğlence Atölyesi';

        printWindow.document.write(`
          <html>
            <head>
              <title>Soru Kartları - Yazdır</title>
              <style>
                @media print {
                  body { -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
              <h2 style="font-family: serif; text-align: center; margin-bottom: 30px;">
                Soru-Cevap Kartları<br/>
                <small style="font-size: 16px; font-family: sans-serif; font-weight: normal; color: #666;">
                  Modül: ${moduleName} ${currentSinif ? `| Sınıf: ${currentSinif}. Sınıf` : ''} ${currentUnite ? `| Ünite: ${currentUnite === 'genel' ? 'Genel' : currentUnite + '. Ünite'}` : ''}
                </small>
              </h2>
              ${content}
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    // Optional: window.close() after printing
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback if popup blocked
        alert('Yazdırma penceresi açılamadı. Lütfen tarayıcınızın açılır pencere (popup) engelleyicisini kapatın veya uygulamayı yeni sekmede açarak tekrar deneyin.');
        window.print();
      }
    } catch (e) {
      console.error('Print error:', e);
      alert('Yazdırma işlemi sırasında bir hata oluştu. Lütfen uygulamayı yeni sekmede açarak tekrar deneyin.');
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center justify-start py-10 px-5 relative z-10 min-h-screen">
      <div className="w-full max-w-[900px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-gold">Soru-Cevap Kartları</h1>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="btn-gold py-2 px-4 text-sm flex items-center gap-2">
              🖨️ Yazdır
            </button>
            <Link to="/" className="back-nav !mt-0">Ana Menü</Link>
          </div>
        </div>

        <div className="bg-black/40 border border-gold/20 rounded-lg p-5 mb-8 flex flex-wrap gap-4 items-end print:hidden">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-text-light/50 uppercase font-serif tracking-widest mb-2">Modül</label>
            <select 
              value={module} 
              onChange={(e) => {
                setModule(e.target.value as any);
                setSinif('');
                setUnite('');
              }}
              className="w-full bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5"
            >
              <option value="harf" className="bg-deep text-text-light">Harf Harf / Tarih Kapışması</option>
              <option value="cark" className="bg-deep text-text-light">Zamanın Çarkı</option>
              <option value="eglence" className="bg-deep text-text-light">Eğlence Atölyesi (Kelime)</option>
            </select>
          </div>

          {module !== 'eglence' && (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-text-light/50 uppercase font-serif tracking-widest mb-2">Sınıf</label>
                <select 
                  value={currentSinif} 
                  onChange={(e) => {
                    setSinif(e.target.value);
                    setUnite('');
                  }}
                  className="w-full bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5"
                >
                  {availableClasses.length === 0 && <option value="" className="bg-deep text-text-light">Sınıf Yok</option>}
                  {availableClasses.map(c => (
                    <option key={c} value={c} className="bg-deep text-text-light">{c}. Sınıf</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-text-light/50 uppercase font-serif tracking-widest mb-2">Ünite</label>
                <select 
                  value={currentUnite} 
                  onChange={(e) => setUnite(e.target.value)}
                  className="w-full bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5"
                >
                  {availableUnits.length === 0 && <option value="" className="bg-deep text-text-light">Ünite Yok</option>}
                  {availableUnits.map(u => (
                    <option key={u} value={u} className="bg-deep text-text-light">{u === 'genel' ? 'Genel (Tüm Üniteler)' : `${u}. Ünite`}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-2">
          {questionsToDisplay.length === 0 ? (
            <div className="col-span-full text-center py-10 text-text-light/50 font-serif italic print:hidden">
              Bu kategori için henüz soru bulunmuyor.
            </div>
          ) : (
            questionsToDisplay.map((q, idx) => (
              <div key={idx} className="bg-white/5 border border-gold/20 rounded-lg p-5 flex flex-col justify-between hover:bg-white/10 transition-colors print:border-black/20 print:bg-white print:text-black print:break-inside-avoid">
                <div className="text-text-light/90 font-sans text-[15px] leading-relaxed mb-4 print:text-black">
                  <span className="font-bold mr-2 text-gold print:text-black">Soru {idx + 1}:</span>
                  {module === 'cark' ? q.q : q.s}
                </div>
                <div className="font-serif text-lg font-bold text-gold border-t border-gold/20 pt-3 mt-auto print:text-black print:border-black/20">
                  Cevap: {module === 'cark' ? q.a : q.c}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
