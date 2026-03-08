import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getSinifGrubu, getCourseName } from '../utils/helpers';

export default function Admin() {
  const navigate = useNavigate();
  const { data, setData, importData, isAdmin, isSuperAdmin, loading, user, login } = useApp();

  const [activeTab, setActiveTab] = useState('sorular');
  const [selectedModule, setSelectedModule] = useState<'harf' | 'cark' | 'kelime'>('harf');
  const [deleteClassTarget, setDeleteClassTarget] = useState('');
  const [puanlarClass, setPuanlarClass] = useState('');
  // Kaldırıldı: const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Kaldırıldı: const [password, setPassword] = useState('');
  // Kaldırıldı: const [loginError, setLoginError] = useState('');

  // Soru Bankası State
  const [newQSinif, setNewQSinif] = useState('12');
  const [newQUnite, setNewQUnite] = useState('genel');
  const [newQCevap, setNewQCevap] = useState('');
  const [newQSoru, setNewQSoru] = useState('');
  const [bulkQText, setBulkQText] = useState('');
  const [filterQSinif, setFilterQSinif] = useState('12');
  const [filterQUnite, setFilterQUnite] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  // Sınıf Listeleri State
  const [newClassName, setNewClassName] = useState('');
  const [editClass, setEditClass] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [bulkStudents, setBulkStudents] = useState('');

  // Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    const available = Object.keys(data.siniflar);
    if (available.length > 0) {
      if (!available.includes(editClass)) setEditClass(available[0]);
      if (!available.includes(deleteClassTarget)) setDeleteClassTarget(available[0]);
    }
  }, [data.siniflar, editClass, deleteClassTarget]);

  useEffect(() => {
    const baseGroups = ["9", "10", "11", "11-tkm", "12", "12-cagdas"];
    const existingGroups = Object.keys(data.siniflar).map(getSinifGrubu);
    const available = Array.from(new Set([...baseGroups, ...existingGroups]));
    
    if (available.length > 0) {
      if (!available.includes(newQSinif)) setNewQSinif(available[0]);
      if (!available.includes(filterQSinif)) setFilterQSinif(available[0]);
    }
  }, [data.siniflar, newQSinif, filterQSinif]);

  const handleAddSoru = () => {
    if ((selectedModule !== 'kelime' && !newQSinif) || !newQCevap || !newQSoru) {
      alert('Tüm alanları doldurun!');
      return;
    }
    if ((selectedModule === 'harf' || selectedModule === 'kelime') && newQCevap.length < 2) {
      alert('Cevap en az 2 harf olmalıdır!');
      return;
    }

    setData(prev => {
      const newData = { ...prev };
      if (selectedModule === 'kelime') {
        newData.eglenceSorular = { ...newData.eglenceSorular };
        if (!newData.eglenceSorular.kelime) newData.eglenceSorular.kelime = [];
        newData.eglenceSorular.kelime = [...newData.eglenceSorular.kelime, { c: newQCevap.toUpperCase(), s: newQSoru }];
      } else if (selectedModule === 'harf') {
        newData.sorular = { ...newData.sorular };
        if (!newData.sorular[newQSinif]) newData.sorular[newQSinif] = {};
        newData.sorular[newQSinif] = { ...newData.sorular[newQSinif] };
        if (!newData.sorular[newQSinif][newQUnite]) newData.sorular[newQSinif][newQUnite] = [];
        newData.sorular[newQSinif][newQUnite] = [...newData.sorular[newQSinif][newQUnite], { c: newQCevap.toUpperCase(), s: newQSoru }];
      } else {
        newData.carkSinifSorular = { ...newData.carkSinifSorular };
        if (!newData.carkSinifSorular[newQSinif]) newData.carkSinifSorular[newQSinif] = {};
        newData.carkSinifSorular[newQSinif] = { ...newData.carkSinifSorular[newQSinif] };
        if (!newData.carkSinifSorular[newQSinif][newQUnite]) newData.carkSinifSorular[newQSinif][newQUnite] = [];
        const newId = Date.now() % 10000;
        newData.carkSinifSorular[newQSinif][newQUnite] = [...newData.carkSinifSorular[newQSinif][newQUnite], { id: newId, q: newQSoru, a: newQCevap }];
      }
      return newData;
    });

    setNewQCevap('');
    setNewQSoru('');
    alert('Soru eklendi!');
  };

  const handleBulkAddSoru = () => {
    if ((selectedModule !== 'kelime' && !newQSinif) || !bulkQText) {
      alert('Sınıf seçin ve soru metni girin!');
      return;
    }

    const lines = bulkQText.split(/\r?\n|\r/).filter(l => l.trim());
    if (!lines.length) return;

    let added = 0;
    const newQuestions: any[] = [];

    lines.forEach(line => {
      let parts;
      if (line.includes('|')) parts = line.split('|');
      else if (line.includes(';')) parts = line.split(';');
      else if (line.includes('\t')) parts = line.split('\t');
      else return;

      if (parts.length >= 2) {
        if (selectedModule === 'harf' || selectedModule === 'kelime') {
          const c = parts[0].trim().toUpperCase();
          const s = parts.slice(1).join('|').trim();
          if (c.length >= 2 && s) {
            newQuestions.push({ c, s });
            added++;
          }
        } else {
          const a = parts[0].trim();
          const q = parts.slice(1).join('|').trim();
          if (a && q) {
            newQuestions.push({ id: (Date.now() % 10000) + added, q, a });
            added++;
          }
        }
      }
    });

    setData(prev => {
      const newData = { ...prev };
      if (selectedModule === 'kelime') {
        newData.eglenceSorular = { ...newData.eglenceSorular };
        if (!newData.eglenceSorular.kelime) newData.eglenceSorular.kelime = [];
        newData.eglenceSorular.kelime = [...newData.eglenceSorular.kelime, ...newQuestions];
      } else if (selectedModule === 'harf') {
        newData.sorular = { ...newData.sorular };
        if (!newData.sorular[newQSinif]) newData.sorular[newQSinif] = {};
        newData.sorular[newQSinif] = { ...newData.sorular[newQSinif] };
        if (!newData.sorular[newQSinif][newQUnite]) newData.sorular[newQSinif][newQUnite] = [];
        newData.sorular[newQSinif][newQUnite] = [...newData.sorular[newQSinif][newQUnite], ...newQuestions];
      } else {
        newData.carkSinifSorular = { ...newData.carkSinifSorular };
        if (!newData.carkSinifSorular[newQSinif]) newData.carkSinifSorular[newQSinif] = {};
        newData.carkSinifSorular[newQSinif] = { ...newData.carkSinifSorular[newQSinif] };
        if (!newData.carkSinifSorular[newQSinif][newQUnite]) newData.carkSinifSorular[newQSinif][newQUnite] = [];
        newData.carkSinifSorular[newQSinif][newQUnite] = [...newData.carkSinifSorular[newQSinif][newQUnite], ...newQuestions];
      }
      return newData;
    });

    setBulkQText('');
    alert(`${added} soru eklendi!`);
  };

  const handleDeleteSoru = (grup: string, unite: string, idx: number) => {
    console.log('handleDeleteSoru attempt:', { grup, unite, idx, module: selectedModule });
    
    setConfirmModal({
      isOpen: true,
      title: 'Soruyu Sil',
      message: 'Bu soruyu silmek istediğinizden emin misiniz?',
      onConfirm: () => {
        setData(prev => {
          console.log('handleDeleteSoru inside setData callback');
          const next = { ...prev };
          
          if (selectedModule === 'kelime') {
            const newKelime = [...(prev.eglenceSorular?.kelime || [])];
            newKelime.splice(idx, 1);
            next.eglenceSorular = { ...prev.eglenceSorular, kelime: newKelime };
          } else if (selectedModule === 'harf') {
            if (!prev.sorular[grup] || !prev.sorular[grup][unite]) {
              console.warn('Soru bulunamadı (harf):', { grup, unite, availableGroups: Object.keys(prev.sorular) });
              return prev;
            }
            const newSorular = { ...prev.sorular };
            const newGrup = { ...newSorular[grup] };
            const originalCount = newGrup[unite].length;
            newGrup[unite] = newGrup[unite].filter((_, i) => i !== idx);
            console.log(`Deleted soru at index ${idx}. Count: ${originalCount} -> ${newGrup[unite].length}`);
            newSorular[grup] = newGrup;
            next.sorular = newSorular;
          } else {
            if (!prev.carkSinifSorular[grup] || !prev.carkSinifSorular[grup][unite]) {
              console.warn('Soru bulunamadı (cark):', { grup, unite, availableGroups: Object.keys(prev.carkSinifSorular) });
              return prev;
            }
            const newCark = { ...prev.carkSinifSorular };
            const newGrup = { ...newCark[grup] };
            const originalCount = newGrup[unite].length;
            newGrup[unite] = newGrup[unite].filter((_, i) => i !== idx);
            console.log(`Deleted soru at index ${idx}. Count: ${originalCount} -> ${newGrup[unite].length}`);
            newCark[grup] = newGrup;
            next.carkSinifSorular = newCark;
          }
          
          return next;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetStudentScore = (sinif: string, ogrenci: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Puanı Sıfırla',
      message: `${ogrenci} adlı öğrencinin tüm puanlarını sıfırlamak istediğinizden emin misiniz?`,
      onConfirm: () => {
        setData(prev => {
          const next = { ...prev };
          if (next.skorlar[sinif] && next.skorlar[sinif][ogrenci]) {
            next.skorlar = { ...next.skorlar };
            next.skorlar[sinif] = { ...next.skorlar[sinif] };
            delete next.skorlar[sinif][ogrenci];
          }
          return next;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetClassScores = (sinif: string) => {
    if (!sinif) return;
    setConfirmModal({
      isOpen: true,
      title: 'Sınıf Puanlarını Sıfırla',
      message: `${sinif} sınıfındaki TÜM öğrencilerin puanlarını sıfırlamak istediğinizden emin misiniz?`,
      onConfirm: () => {
        setData(prev => {
          const next = { ...prev };
          if (next.skorlar[sinif]) {
            next.skorlar = { ...next.skorlar };
            delete next.skorlar[sinif];
          }
          return next;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteAllFilteredQuestions = () => {
    const unitText = filterQUnite === 'all' ? 'TÜM ünitelerdeki' : `${filterQUnite}. ünitedeki`;
    const classText = getCourseName(filterQSinif);
    
    setConfirmModal({
      isOpen: true,
      title: 'Toplu Soru Sil',
      message: selectedModule === 'kelime' ? 'Efsane Kelimeler modülündeki TÜM soruları silmek istediğinizden emin misiniz?' : `${classText} sınıfındaki ${unitText} TÜM soruları silmek istediğinizden emin misiniz?`,
      onConfirm: () => {
        setData(prev => {
          const next = { ...prev };
          if (selectedModule === 'kelime') {
            next.eglenceSorular = { ...next.eglenceSorular, kelime: [] };
          } else if (selectedModule === 'harf') {
            next.sorular = { ...next.sorular };
            if (next.sorular[filterQSinif]) {
              next.sorular[filterQSinif] = { ...next.sorular[filterQSinif] };
              if (filterQUnite === 'all') {
                next.sorular[filterQSinif] = {};
              } else {
                next.sorular[filterQSinif][filterQUnite] = [];
              }
            }
          } else {
            next.carkSinifSorular = { ...next.carkSinifSorular };
            if (next.carkSinifSorular[filterQSinif]) {
              next.carkSinifSorular[filterQSinif] = { ...next.carkSinifSorular[filterQSinif] };
              if (filterQUnite === 'all') {
                next.carkSinifSorular[filterQSinif] = {};
              } else {
                next.carkSinifSorular[filterQSinif][filterQUnite] = [];
              }
            }
          }
          return next;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddClass = () => {
    if (!newClassName) return;
    if (data.siniflar[newClassName]) {
      alert('Bu sınıf zaten mevcut!');
      return;
    }
    setData(prev => ({
      ...prev,
      siniflar: { ...prev.siniflar, [newClassName]: [] }
    }));
    setNewClassName('');
    alert('Sınıf eklendi!');
  };

  const handleQuickClass = () => {
    const name = prompt('Sınıf adı girin (örn: 10/A):');
    if (!name) return;
    if (data.siniflar[name]) {
      alert('Bu sınıf zaten mevcut!');
      return;
    }
    const students = Array.from({ length: 40 }, (_, i) => `${i + 1}`);
    setData(prev => ({
      ...prev,
      siniflar: { ...prev.siniflar, [name]: students }
    }));
    alert(`${name} sınıfı 1-40 arası numaralarla oluşturuldu!`);
  };

  const handleDeleteClass = (className: string) => {
    console.log('handleDeleteClass attempt:', className);
    if (!className) return;

    setConfirmModal({
      isOpen: true,
      title: 'Sınıfı Sil',
      message: `"${className}" sınıfını ve tüm öğrencilerini silmek istediğinizden emin misiniz?`,
      onConfirm: () => {
        setData(prev => {
          console.log('handleDeleteClass inside setData callback for:', className);
          if (!prev.siniflar[className]) {
            console.warn('Sınıf state içinde bulunamadı:', className);
            return prev;
          }
          const newSiniflar = { ...prev.siniflar };
          delete newSiniflar[className];
          
          const newSkorlar = { ...prev.skorlar };
          delete newSkorlar[className];
          
          console.log('Class deleted from state object');
          return { ...prev, siniflar: newSiniflar, skorlar: newSkorlar };
        });
        
        if (deleteClassTarget === className) {
          setDeleteClassTarget('');
        }
        if (editClass === className) {
          setEditClass('');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddStudent = () => {
    if (!editClass || !newStudentName) return;
    if (data.siniflar[editClass].includes(newStudentName)) {
      alert('Bu öğrenci zaten listede!');
      return;
    }
    setData(prev => {
      const newData = { ...prev, siniflar: { ...prev.siniflar } };
      newData.siniflar[editClass] = [...newData.siniflar[editClass], newStudentName];
      return newData;
    });
    setNewStudentName('');
  };

  const handleBulkAddStudents = () => {
    if (!editClass || !bulkStudents) return;
    const lines = bulkStudents.split(/\r?\n|\r/).map(l => l.trim()).filter(l => l);
    
    setData(prev => {
      const newData = { ...prev, siniflar: { ...prev.siniflar } };
      const currentStudents = [...newData.siniflar[editClass]];
      lines.forEach(name => {
        if (!currentStudents.includes(name)) {
          currentStudents.push(name);
        }
      });
      newData.siniflar[editClass] = currentStudents;
      return newData;
    });
    setBulkStudents('');
    alert('Öğrenciler eklendi!');
  };

  const handleDeleteStudent = (className: string, idx: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Öğrenciyi Sil',
      message: 'Öğrenciyi silmek istediğinizden emin misiniz?',
      onConfirm: () => {
        setData(prev => {
          const newSiniflar = { ...prev.siniflar };
          newSiniflar[className] = newSiniflar[className].filter((_, i) => i !== idx);
          return { ...prev, siniflar: newSiniflar };
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tarih_atolyesi_yedek.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [showJson, setShowJson] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        importData(imported);
        alert('Veriler başarıyla içe aktarıldı!');
      } catch (err) {
        alert('İçe aktarma hatası: Geçersiz JSON dosyası.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Tüm Verileri Sıfırla',
      message: 'TÜM verileri varsayılan ayarlara döndürmek istediğinizden emin misiniz? Mevcut tüm değişiklikleriniz silinecektir!',
      onConfirm: () => {
        localStorage.removeItem('dta_data');
        window.location.reload();
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0d12]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-[#0a0d12]/95 flex items-center justify-center z-[8888] flex-col gap-5">
        <div className="bg-white/5 border border-gold/20 rounded-xl p-10 md:p-12 text-center max-w-[420px] w-[90%]">
          <div className="text-5xl mb-3">🔐</div>
          <div className="font-serif text-xl text-gold mb-1.5">Giriş Yapmanız Gerekiyor</div>
          <div className="text-[13px] text-text-light/60 mb-6 leading-relaxed">
            Yönetici paneline erişmek ve kendi sınıflarınızı oluşturmak için giriş yapmalısınız.
          </div>
          
          <div className="flex flex-col gap-3 justify-center">
            <button onClick={login} className="btn-gold py-3 px-7 text-[13px] flex items-center justify-center gap-2">
              <span>🔑</span> Google ile Giriş Yap
            </button>
            <button onClick={() => navigate('/')} className="bg-white/5 border border-white/10 text-text-light/70 text-[13px] py-3 px-5 rounded font-serif hover:bg-white/10 hover:text-text-light transition-colors">Ana Sayfaya Dön</button>
          </div>
        </div>
      </div>
    );
  }

  const baseGroups = ["9", "10", "11", "11-tkm", "12", "12-cagdas"];
  const existingGroups = Object.keys(data.siniflar).map(getSinifGrubu);
  const gruplar = Array.from(new Set([...baseGroups, ...existingGroups])).sort((a, b) => a.localeCompare(b, 'tr'));

  return (
    <div className="min-h-screen bg-[#0a0d12] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-[240px] min-h-auto md:min-h-screen bg-gradient-to-b from-[#0f1318] to-[#0a0d12] border-b md:border-b-0 md:border-r border-gold/15 flex flex-col py-6 shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="px-5 pb-5 border-b border-gold/10 mb-4 text-center relative">
          <button onClick={() => navigate('/')} className="absolute left-4 top-2 text-xl opacity-60 hover:opacity-100 transition-opacity bg-white/5 p-2 rounded-full border border-white/10" title="Ana Menüye Dön">
            🏠
          </button>
          <div className="text-4xl mb-1.5">🏛️</div>
          <div className="font-serif text-[13px] text-gold tracking-widest leading-relaxed">YÖNETİCİ PANELİ</div>
          <div className="text-[10px] text-text-light/35 tracking-widest mt-0.5">Tarih365</div>
        </div>

        <div className="flex overflow-x-auto md:flex-col px-2 md:px-0">
          <div className="text-[10px] tracking-[0.2em] text-text-light/30 px-5 pt-1.5 pb-1 uppercase font-serif hidden md:block">İÇERİK</div>
          <button onClick={() => setActiveTab('sorular')} className={`flex items-center gap-2.5 py-2.5 px-5 w-auto md:w-full text-sm font-sans border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'sorular' ? 'bg-gold/10 text-gold border-gold' : 'bg-transparent text-text-light/55 border-transparent hover:bg-gold/5 hover:text-text-light'}`}>
            <span className="text-base shrink-0">📝</span><span className="hidden md:inline">Soru Bankası</span>
          </button>
          <button onClick={() => setActiveTab('siniflar')} className={`flex items-center gap-2.5 py-2.5 px-5 w-auto md:w-full text-sm font-sans border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'siniflar' ? 'bg-gold/10 text-gold border-gold' : 'bg-transparent text-text-light/55 border-transparent hover:bg-gold/5 hover:text-text-light'}`}>
            <span className="text-base shrink-0">👥</span><span className="hidden md:inline">Sınıf Listeleri</span>
          </button>
          <button onClick={() => setActiveTab('puanlar')} className={`flex items-center gap-2.5 py-2.5 px-5 w-auto md:w-full text-sm font-sans border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'puanlar' ? 'bg-gold/10 text-gold border-gold' : 'bg-transparent text-text-light/55 border-transparent hover:bg-gold/5 hover:text-text-light'}`}>
            <span className="text-base shrink-0">🏆</span><span className="hidden md:inline">Puan Tablosu</span>
          </button>
          <button onClick={() => setActiveTab('gorunum')} className={`flex items-center gap-2.5 py-2.5 px-5 w-auto md:w-full text-sm font-sans border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'gorunum' ? 'bg-gold/10 text-gold border-gold' : 'bg-transparent text-text-light/55 border-transparent hover:bg-gold/5 hover:text-text-light'}`}>
            <span className="text-base shrink-0">🎨</span><span className="hidden md:inline">Görünüm</span>
          </button>
          <button onClick={() => setActiveTab('export')} className={`flex items-center gap-2.5 py-2.5 px-5 w-auto md:w-full text-sm font-sans border-b-2 md:border-b-0 md:border-l-4 transition-all whitespace-nowrap ${activeTab === 'export' ? 'bg-gold/10 text-gold border-gold' : 'bg-transparent text-text-light/55 border-transparent hover:bg-gold/5 hover:text-text-light'}`}>
            <span className="text-base shrink-0">💾</span><span className="hidden md:inline">Dışa/İçe Aktar</span>
          </button>
        </div>

        <div className="mt-4 md:mt-auto p-5 border-t border-gold/10">
          <button onClick={() => navigate('/')} className="w-full p-2.5 bg-white/5 border border-white/10 text-text-light/80 rounded text-[13px] font-serif tracking-wider hover:bg-white/10 hover:text-text-light transition-colors flex items-center justify-center gap-2">
            <span>🏠</span> Ana Menüye Dön
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 min-w-0">
        
        {/* SORU BANKASI */}
        {activeTab === 'sorular' && (
          <div>
            <div className="font-serif text-2xl text-gold mb-1">📝 Soru Bankası</div>
            <div className="text-sm text-text-light/45 mb-7 italic">
              {isSuperAdmin 
                ? "Her modüle ve sınıfa ait soruları yönetin, yeni soru ekleyin veya mevcutları silin." 
                : "Hamza Hoca tarafından hazırlanan soru havuzunu görüntülüyorsunuz. Sorular tüm öğretmenler için ortaktır."}
            </div>

            <div className="flex gap-2 mb-6 border-b border-gold/20 pb-2">
              <button 
                onClick={() => setSelectedModule('harf')} 
                className={`px-4 py-2 rounded-t-md font-serif text-sm transition-colors ${selectedModule === 'harf' ? 'bg-gold/20 text-gold border-b-2 border-gold' : 'text-text-light/60 hover:bg-white/5'}`}
              >
                Harf Harf Tarih / Kapışma
              </button>
              <button 
                onClick={() => setSelectedModule('cark')} 
                className={`px-4 py-2 rounded-t-md font-serif text-sm transition-colors ${selectedModule === 'cark' ? 'bg-gold/20 text-gold border-b-2 border-gold' : 'text-text-light/60 hover:bg-white/5'}`}
              >
                Zamanın Çarkı
              </button>
              <button 
                onClick={() => setSelectedModule('kelime')} 
                className={`px-4 py-2 rounded-t-md font-serif text-sm transition-colors ${selectedModule === 'kelime' ? 'bg-gold/20 text-gold border-b-2 border-gold' : 'text-text-light/60 hover:bg-white/5'}`}
              >
                Efsane Kelimeler
              </button>
            </div>

            {isSuperAdmin ? (
              <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
                <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                  ➕ Yeni Soru Ekle
                </div>
                <div className="flex flex-wrap gap-3 mb-3.5">
                  {selectedModule !== 'kelime' && (
                    <>
                      <div className="flex flex-col gap-1 flex-1 min-w-[120px] max-w-[150px]">
                        <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Sınıf Grubu</label>
                        <select value={newQSinif} onChange={e => setNewQSinif(e.target.value)} className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5">
                          {gruplar.map(g => <option key={g} value={g} className="bg-[#0f1318] text-text-light">{getCourseName(g)}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-[120px] max-w-[140px]">
                        <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Ünite</label>
                        <select value={newQUnite} onChange={e => setNewQUnite(e.target.value)} className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5">
                          <option value="1" className="bg-[#0f1318] text-text-light">1. Ünite</option>
                          <option value="2" className="bg-[#0f1318] text-text-light">2. Ünite</option>
                          <option value="3" className="bg-[#0f1318] text-text-light">3. Ünite</option>
                          <option value="4" className="bg-[#0f1318] text-text-light">4. Ünite</option>
                          <option value="5" className="bg-[#0f1318] text-text-light">5. Ünite</option>
                          <option value="genel" className="bg-[#0f1318] text-text-light">Genel</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-1 flex-1 min-w-[160px] max-w-[200px]">
                    <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Cevap {selectedModule === 'harf' || selectedModule === 'kelime' ? '(Büyük Harf)' : ''}</label>
                    <input type="text" value={newQCevap} onChange={e => setNewQCevap(selectedModule === 'harf' || selectedModule === 'kelime' ? e.target.value.toUpperCase() : e.target.value)} placeholder="ÖRNEK" className={`bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5 ${selectedModule === 'harf' || selectedModule === 'kelime' ? 'uppercase' : ''}`} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Soru Metni</label>
                  <textarea value={newQSoru} onChange={e => setNewQSoru(e.target.value)} placeholder="Soruyu buraya yazın..." className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5 min-h-[80px] resize-y"></textarea>
                </div>
                <button onClick={handleAddSoru} className="btn-gold py-2.5 px-5 text-[13px]">✔ Soruyu Ekle</button>
              </div>
            ) : (
              <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-6 text-gold-light text-sm italic">
                💡 Soru ekleme ve silme yetkisi sadece Hamza Hoca'ya aittir. Diğer öğretmenler mevcut havuzu kullanabilir.
              </div>
            )}

            {isSuperAdmin && (
              <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
                <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                  📥 Toplu Soru Ekle
                </div>
                
                {selectedModule !== 'kelime' && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex flex-col gap-1 flex-1 min-w-[120px] max-w-[150px]">
                      <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Sınıf Grubu</label>
                      <select value={newQSinif} onChange={e => setNewQSinif(e.target.value)} className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5">
                        {gruplar.map(g => <option key={g} value={g} className="bg-[#0f1318] text-text-light">{getCourseName(g)}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-[120px] max-w-[140px]">
                      <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Ünite</label>
                      <select value={newQUnite} onChange={e => setNewQUnite(e.target.value)} className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5">
                        <option value="1" className="bg-[#0f1318] text-text-light">1. Ünite</option>
                        <option value="2" className="bg-[#0f1318] text-text-light">2. Ünite</option>
                        <option value="3" className="bg-[#0f1318] text-text-light">3. Ünite</option>
                        <option value="4" className="bg-[#0f1318] text-text-light">4. Ünite</option>
                        <option value="5" className="bg-[#0f1318] text-text-light">5. Ünite</option>
                        <option value="genel" className="bg-[#0f1318] text-text-light">Genel</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">
                    Her satıra bir soru (Format: Cevap | Soru Metni)
                  </label>
                  <textarea 
                    value={bulkQText} 
                    onChange={e => setBulkQText(e.target.value)} 
                    placeholder="CEVAP | Soru metni buraya gelecek...&#10;DİĞER CEVAP | İkinci soru metni..." 
                    className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5 min-h-[120px] resize-y"
                  ></textarea>
                </div>
                <button onClick={handleBulkAddSoru} className="bg-white/5 border border-white/10 text-text-light/70 text-[13px] py-2 px-4 rounded font-serif hover:bg-white/10 hover:text-text-light transition-colors self-start">
                  📥 Toplu Ekle
                </button>
              </div>
            )}

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <span>📋 Mevcut Sorular</span>
                  {isSuperAdmin && (
                    <button 
                      onClick={handleDeleteAllFilteredQuestions}
                      className="text-[10px] bg-crimson/20 border border-crimson/40 text-[#e88] px-2 py-1 rounded hover:bg-crimson/40 transition-colors font-serif tracking-wider"
                    >
                      🗑️ Filtrelenenleri Sil
                    </button>
                  )}
                </div>
                {selectedModule !== 'kelime' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-text-light/40">Sınıf:</span>
                    <select value={filterQSinif} onChange={e => setFilterQSinif(e.target.value)} className="bg-white/5 border border-gold/20 text-text-light py-1.5 px-2.5 rounded font-sans text-[13px] outline-none">
                      {gruplar.map(g => <option key={g} value={g} className="bg-[#0f1318] text-text-light">{getCourseName(g)}</option>)}
                    </select>
                    <span className="text-xs text-text-light/40 ml-2">Ünite:</span>
                    <select value={filterQUnite} onChange={e => setFilterQUnite(e.target.value)} className="bg-white/5 border border-gold/20 text-text-light py-1.5 px-2.5 rounded font-sans text-[13px] outline-none">
                      <option value="all" className="bg-[#0f1318] text-text-light">Tümü</option>
                      <option value="1" className="bg-[#0f1318] text-text-light">1. Ünite</option>
                      <option value="2" className="bg-[#0f1318] text-text-light">2. Ünite</option>
                      <option value="3" className="bg-[#0f1318] text-text-light">3. Ünite</option>
                      <option value="4" className="bg-[#0f1318] text-text-light">4. Ünite</option>
                      <option value="5" className="bg-[#0f1318] text-text-light">5. Ünite</option>
                      <option value="genel" className="bg-[#0f1318] text-text-light">Genel</option>
                    </select>
                  </div>
                )}
              </div>
              
              <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 Soru veya cevap ara..." className="w-full max-w-[360px] bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5 mb-3" />
              
              <div className="overflow-x-auto rounded-md">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="bg-gold/10 font-serif text-[11px] tracking-widest text-gold py-2.5 px-3.5 text-left border-b border-gold/15 whitespace-nowrap">#</th>
                      <th className="bg-gold/10 font-serif text-[11px] tracking-widest text-gold py-2.5 px-3.5 text-left border-b border-gold/15 whitespace-nowrap">ÜNİTE</th>
                      <th className="bg-gold/10 font-serif text-[11px] tracking-widest text-gold py-2.5 px-3.5 text-left border-b border-gold/15 whitespace-nowrap">CEVAP</th>
                      <th className="bg-gold/10 font-serif text-[11px] tracking-widest text-gold py-2.5 px-3.5 text-left border-b border-gold/15 whitespace-nowrap">SORU METNİ</th>
                      <th className="bg-gold/10 font-serif text-[11px] tracking-widest text-gold py-2.5 px-3.5 text-left border-b border-gold/15 whitespace-nowrap">İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let list: any[] = [];
                      if (selectedModule === 'kelime') {
                        list = (data.eglenceSorular?.kelime || []).map((q, i) => ({ ...q, unite: 'Genel', originalIndex: i }));
                      } else {
                        const sinifSorular = selectedModule === 'harf' ? (data.sorular[filterQSinif] || {}) : (data.carkSinifSorular[filterQSinif] || {});
                        if (filterQUnite === 'all') {
                          Object.entries(sinifSorular).forEach(([u, qs]) => {
                            if (Array.isArray(qs)) {
                              list.push(...qs.map((q, i) => ({ ...q, unite: u, originalIndex: i })));
                            }
                          });
                        } else {
                          const qs = sinifSorular[filterQUnite] || [];
                          if (Array.isArray(qs)) {
                            list = qs.map((q, i) => ({ ...q, unite: filterQUnite, originalIndex: i }));
                          }
                        }
                      }
                      
                      if (searchQ) {
                        const s = searchQ.toLowerCase();
                        list = list.filter(q => {
                          const c = selectedModule === 'cark' ? q.a : q.c;
                          const qText = selectedModule === 'cark' ? q.q : q.s;
                          return c.toLowerCase().includes(s) || qText.toLowerCase().includes(s);
                        });
                      }
                      
                      return list.map((q, idx) => {
                        const c = selectedModule === 'cark' ? q.a : q.c;
                        const qText = selectedModule === 'cark' ? q.q : q.s;
                        return (
                          <tr key={`${q.unite}-${idx}`} className="hover:bg-gold/5">
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-text-light/35">{idx + 1}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5"><span className="text-gold/60 text-[11px]">{q.unite}. Ünite</span></td>
                            <td className="py-2.5 px-3.5 border-b border-white/5 font-serif text-xs text-gold tracking-wider whitespace-nowrap">{c}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-text-light/80 max-w-[380px] truncate" title={qText}>{qText}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5">
                              {isSuperAdmin && (
                                <button onClick={() => handleDeleteSoru(filterQSinif, q.unite, q.originalIndex)} className="bg-crimson/30 border border-crimson/50 text-[#e88] text-xs py-1 px-3 rounded font-serif hover:bg-crimson/60 hover:text-[#ffaaaa]">Sil</button>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SINIF LİSTELERİ */}
        {activeTab === 'siniflar' && (
          <div>
            <div className="font-serif text-2xl text-gold mb-1">👥 Sınıf Listeleri</div>
            <div className="text-sm text-text-light/45 mb-7 italic">Sınıf ekle/sil, öğrenci ekle/çıkar.</div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 mb-6 text-emerald-200/80 text-sm italic flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <strong>İpucu:</strong> Sınıf listesi yüklemekle uğraşmak istemiyorsanız, oyun başlatırken <strong>"Hızlı Başlat (Misafir Modu)"</strong> seçeneğini kullanabilirsiniz. 
                Bu modda 1'den 40'a kadar numaralar oluşturulur, çarktan çıkan numaraya göre sınıf listenizdeki öğrenciyi tahtaya kaldırabilirsiniz. Puanlar kaydedilmez.
              </div>
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center justify-between">
                <span>🏫 Yeni Sınıf Ekle</span>
                <button onClick={handleQuickClass} className="text-[10px] bg-gold/10 border border-gold/30 text-gold px-3 py-1.5 rounded hover:bg-gold/20 transition-all font-serif tracking-wider">
                  ⚡ Hızlı Sınıf Oluştur (1-40)
                </button>
              </div>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Sınıf Adı (örn: 10/A, Genel Kültür)</label>
                  <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="12/A" className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5" />
                </div>
                <button onClick={handleAddClass} className="btn-gold py-2.5 px-5 text-[13px]">➕ Sınıf Ekle</button>
              </div>
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center justify-between">
                <span>🏫 Mevcut Sınıflar</span>
                <span className="text-xs text-text-light/40">{Object.keys(data.siniflar).length} Sınıf</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(data.siniflar).sort((a, b) => a.localeCompare(b, 'tr')).map(s => (
                  <div key={s} className="flex items-center justify-between bg-white/5 border border-gold/10 p-3 rounded-md group">
                    <span className="text-sm font-serif text-gold-light">{s}</span>
                    <button 
                      onClick={() => handleDeleteClass(s)}
                      className="opacity-0 group-hover:opacity-100 bg-crimson/20 text-crimson text-[10px] px-2 py-1 rounded border border-crimson/30 hover:bg-crimson/40 transition-all"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                👤 Öğrenci Ekle / Çıkar
              </div>
              <div className="flex flex-wrap gap-3 items-end mb-4">
                <div className="flex flex-col gap-1 flex-1 min-w-[150px] max-w-[220px]">
                  <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Sınıf Seç</label>
                  <select value={editClass} onChange={e => setEditClass(e.target.value)} className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5">
                    {Object.keys(data.siniflar).sort((a, b) => a.localeCompare(b, 'tr')).map(s => <option key={s} value={s} className="bg-[#0f1318] text-text-light">{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                  <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Öğrenci Adı</label>
                  <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddStudent()} placeholder="Ad Soyad" className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5" />
                </div>
                <button onClick={handleAddStudent} className="btn-gold py-2.5 px-5 text-[13px]">➕ Ekle</button>
              </div>
              
              <div className="flex flex-col gap-1 mb-3">
                <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Toplu Öğrenci Ekle (Her satıra bir isim)</label>
                <textarea value={bulkStudents} onChange={e => setBulkStudents(e.target.value)} placeholder="Ahmet Yılmaz&#10;Fatma Kaya" className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5 min-h-[90px] resize-y"></textarea>
                <button onClick={handleBulkAddStudents} className="bg-white/5 border border-white/10 text-text-light/70 text-[13px] py-2 px-4 rounded font-serif hover:bg-white/10 hover:text-text-light transition-colors self-start mt-2">📥 Toplu Ekle</button>
              </div>

              <div className="mt-4">
                {editClass && data.siniflar[editClass]?.length === 0 && (
                  <div className="text-text-light/30 text-[13px] italic p-2">Bu sınıfta henüz öğrenci yok.</div>
                )}
                {editClass && data.siniflar[editClass]?.map((student, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-2 px-3 my-1 bg-white/5 rounded border border-gold/10">
                    <span className="text-text-light/30 w-7 text-xs">{idx + 1}.</span>
                    <span className="flex-1 text-sm">{student}</span>
                    <button onClick={() => handleDeleteStudent(editClass, idx)} className="bg-crimson/30 border border-crimson/50 text-[#e88] text-[11px] py-1 px-2.5 rounded font-serif hover:bg-crimson/60 hover:text-[#ffaaaa]">Sil</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-[#e88] mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                ⚠️ Sınıf Sil (Hızlı Seçim)
              </div>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1 flex-1 min-w-[150px] max-w-[220px]">
                  <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Silinecek Sınıf</label>
                  <select 
                    value={deleteClassTarget}
                    onChange={e => setDeleteClassTarget(e.target.value)}
                    className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5"
                  >
                    {Object.keys(data.siniflar).sort((a, b) => a.localeCompare(b, 'tr')).map(s => <option key={s} value={s} className="bg-[#0f1318] text-text-light">{s}</option>)}
                  </select>
                </div>
                <button onClick={() => handleDeleteClass(deleteClassTarget)} className="bg-crimson/30 border border-crimson/50 text-[#e88] text-[13px] py-2.5 px-4 rounded font-serif hover:bg-crimson/60 hover:text-[#ffaaaa]">🗑️ Sınıfı Sil</button>
              </div>
              <div className="text-xs text-[#e88]/50 mt-1.5">⚠️ Bu işlem geri alınamaz. Sınıfa ait tüm öğrenci verisi de silinir.</div>
            </div>
          </div>
        )}

        {/* PUAN TABLOSU */}
        {activeTab === 'puanlar' && (
          <div>
            <div className="font-serif text-2xl text-gold mb-1">🏆 Puan Tablosu</div>
            <div className="text-sm text-text-light/45 mb-7 italic">Öğrenci puanlarını görüntüleyin ve sıfırlayın.</div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="flex flex-wrap gap-3 items-end mb-6">
                <div className="flex flex-col gap-1 flex-1 min-w-[150px] max-w-[220px]">
                  <label className="text-[11px] tracking-widest text-text-light/50 uppercase font-serif">Sınıf Seç</label>
                  <select 
                    value={puanlarClass} 
                    onChange={e => setPuanlarClass(e.target.value)} 
                    className="bg-white/5 border border-gold/20 text-text-light p-2.5 rounded font-sans text-[15px] outline-none focus:border-gold focus:bg-gold/5"
                  >
                    <option value="" className="bg-[#0f1318] text-text-light">Sınıf Seçin...</option>
                    {Object.keys(data.siniflar).sort((a, b) => a.localeCompare(b, 'tr')).map(s => <option key={s} value={s} className="bg-[#0f1318] text-text-light">{s}</option>)}
                  </select>
                </div>
                {puanlarClass && (
                  <button 
                    onClick={() => handleResetClassScores(puanlarClass)} 
                    className="bg-crimson/20 border border-crimson/40 text-crimson text-[13px] py-2.5 px-4 rounded font-serif hover:bg-crimson/40 transition-colors ml-auto"
                  >
                    🗑️ Bu Sınıfın Tüm Puanlarını Sıfırla
                  </button>
                )}
              </div>

              {puanlarClass && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="py-3 px-3.5 border-b border-gold/20 text-[11px] tracking-widest text-gold/70 uppercase font-serif font-normal">Öğrenci</th>
                        <th className="py-3 px-3.5 border-b border-gold/20 text-[11px] tracking-widest text-gold/70 uppercase font-serif font-normal text-center">Harf</th>
                        <th className="py-3 px-3.5 border-b border-gold/20 text-[11px] tracking-widest text-gold/70 uppercase font-serif font-normal text-center">Çark</th>
                        <th className="py-3 px-3.5 border-b border-gold/20 text-[11px] tracking-widest text-gold/70 uppercase font-serif font-normal text-center">Kapışma</th>
                        <th className="py-3 px-3.5 border-b border-gold/20 text-[11px] tracking-widest text-gold/70 uppercase font-serif font-normal text-center">Toplam</th>
                        <th className="py-3 px-3.5 border-b border-gold/20 text-[11px] tracking-widest text-gold/70 uppercase font-serif font-normal text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.siniflar[puanlarClass] || []).map((ogrenci, idx) => {
                        const skorObj = data.skorlar[puanlarClass]?.[ogrenci] || { harf: 0, cark: 0, kap: 0 };
                        const total = (skorObj.harf || 0) + (skorObj.cark || 0) + (skorObj.kap || 0);
                        return (
                          <tr key={idx} className="hover:bg-gold/5">
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-sm">{ogrenci}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-sm text-center text-text-light/70">{skorObj.harf || 0}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-sm text-center text-text-light/70">{skorObj.cark || 0}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-sm text-center text-text-light/70">{skorObj.kap || 0}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-sm text-center font-bold text-gold">{total}</td>
                            <td className="py-2.5 px-3.5 border-b border-white/5 text-right">
                              <button 
                                onClick={() => handleResetStudentScore(puanlarClass, ogrenci)} 
                                className="bg-crimson/30 border border-crimson/50 text-[#e88] text-xs py-1 px-3 rounded font-serif hover:bg-crimson/60 hover:text-[#ffaaaa]"
                                disabled={total === 0}
                                style={{ opacity: total === 0 ? 0.3 : 1, cursor: total === 0 ? 'not-allowed' : 'pointer' }}
                              >
                                Sıfırla
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!data.siniflar[puanlarClass] || data.siniflar[puanlarClass].length === 0) && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-text-light/40 text-sm italic">Bu sınıfta öğrenci bulunmuyor.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GÖRÜNÜM AYARLARI */}
        {activeTab === 'gorunum' && (
          <div>
            <div className="font-serif text-2xl text-gold mb-1">⚙️ Uygulama Ayarları</div>
            <div className="text-sm text-text-light/45 mb-7 italic">Uygulamanın görünümünü ve paylaşım ayarlarını kişiselleştirin.</div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                🔑 Okul Şifresi (Sınıf Listelerini Paylaşma)
              </div>
              <p className="text-sm text-text-light/60 mb-3.5 leading-relaxed">
                Aynı okuldaki zümre öğretmenlerinizin sizin eklediğiniz sınıf listelerine ulaşabilmesi için bir şifre belirleyin. 
                Öğretmenler ana ekranda bu şifreyi girerek listelerinize erişebilirler.
              </p>
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  placeholder="Örn: 1453" 
                  value={data.settings?.schoolPin || ''}
                  onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, schoolPin: e.target.value } }))}
                  className="bg-black/40 border border-gold/30 rounded px-4 py-2 text-text-light focus:outline-none focus:border-gold w-full max-w-xs"
                />
                <p className="text-xs text-emerald-400/80">
                  {data.settings?.schoolPin ? `Şu anki şifre: ${data.settings.schoolPin}` : 'Şifre belirlenmedi. Listeleriniz sadece size özel.'}
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                🖼️ Logo Ayarı
              </div>
              <p className="text-sm text-text-light/60 mb-3.5 leading-relaxed">
                Ekranın sol üst köşesinde görünecek logoyu yükleyin. Şeffaf arka planlı PNG önerilir.
              </p>
              <div className="flex flex-col gap-4">
                {data.settings?.logoUrl && (
                  <div className="relative w-32 h-32 bg-black/20 rounded border border-gold/20 flex items-center justify-center p-2">
                    <img src={data.settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, logoUrl: '' } }))}
                      className="absolute -top-2 -right-2 bg-crimson text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-crimson/80"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Dosya boyutu çok büyük! Lütfen 5MB altında bir görsel yükleyin.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setData(prev => ({ ...prev, settings: { ...prev.settings, logoUrl: event.target?.result as string } }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="text-text-light/70 text-[13px]" 
                />
              </div>
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                🎭 Maskot / Karakter Ayarı
              </div>
              <p className="text-sm text-text-light/60 mb-3.5 leading-relaxed">
                Ekranın sağ alt köşesinde görünecek karikatürize fotoğrafınızı veya maskotunuzu yükleyin. Şeffaf arka planlı PNG önerilir.
              </p>
              <div className="flex flex-col gap-4">
                {data.settings?.mascotUrl && (
                  <div className="relative w-32 h-32 bg-black/20 rounded border border-gold/20 flex items-center justify-center p-2">
                    <img src={data.settings.mascotUrl} alt="Mascot" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, mascotUrl: '' } }))}
                      className="absolute -top-2 -right-2 bg-crimson text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-crimson/80"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Dosya boyutu çok büyük! Lütfen 5MB altında bir görsel yükleyin.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setData(prev => ({ ...prev, settings: { ...prev.settings, mascotUrl: event.target?.result as string } }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="text-text-light/70 text-[13px]" 
                />
              </div>
            </div>
          </div>
        )}

        {/* DIŞA/İÇE AKTAR */}
        {activeTab === 'export' && (
          <div>
            <div className="font-serif text-2xl text-gold mb-1">💾 Dışa / İçe Aktarma</div>
            <div className="text-sm text-text-light/45 mb-7 italic">Tüm verileri JSON olarak indirin veya yükleyin.</div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                📤 Tüm Verileri Dışa Aktar
              </div>
              <p className="text-sm text-text-light/60 mb-3.5 leading-relaxed">
                Aşağıdaki butona tıklayarak tüm sınıf listelerini ve soru bankalarını JSON dosyası olarak indirin.
                Bu dosyayı bir yedek olarak saklayabilirsiniz.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExport} className="btn-gold py-2.5 px-5 text-[13px]">⬇️ JSON Olarak İndir</button>
                <button onClick={() => setShowJson(!showJson)} className="bg-white/5 border border-white/10 text-text-light/70 py-2.5 px-5 text-[13px] rounded hover:bg-white/10 transition-colors">
                  {showJson ? '👁️ Kodu Gizle' : '📋 Veri Kodunu Göster'}
                </button>
              </div>

              {showJson && (
                <div className="mt-4">
                  <div className="text-[11px] text-gold/50 mb-2 uppercase tracking-widest">Aşağıdaki kodu kopyalayıp bir dosyaya kaydedebilirsiniz:</div>
                  <textarea 
                    readOnly 
                    value={JSON.stringify(data, null, 2)} 
                    className="w-full h-[200px] bg-black/40 border border-gold/20 text-gold/80 p-3 rounded font-mono text-xs outline-none"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  ></textarea>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-gold-light mb-4 pb-2.5 border-b border-gold/10 flex items-center gap-2">
                📥 Veri İçe Aktar (JSON)
              </div>
              <p className="text-sm text-text-light/60 mb-3.5 leading-relaxed">
                Daha önce dışa aktardığınız JSON dosyasını yükleyin. <strong className="text-[#e88]">Mevcut veriler üzerine yazılır!</strong>
              </p>
              <input type="file" accept=".json" onChange={handleImport} className="text-text-light/70 text-[13px] mb-3" />
              <div className="text-xs text-[#e88]/40 mt-1">⚠️ İçe aktarma öncesinde mevcut verilerinizi yedeklemeniz önerilir.</div>
            </div>

            <div className="bg-white/5 border border-gold/10 rounded-lg p-6 mb-6">
              <div className="font-serif text-sm text-crimson mb-4 pb-2.5 border-b border-crimson/20 flex items-center gap-2">
                🚨 Fabrika Ayarlarına Dön
              </div>
              <p className="text-sm text-text-light/60 mb-3.5 leading-relaxed">
                Tüm verileri (sınıflar, sorular, skorlar) silip uygulamanın ilk haline dönmek için aşağıdaki butonu kullanın. 
                <strong className="text-crimson"> Bu işlem geri alınamaz!</strong>
              </p>
              <button onClick={handleResetData} className="bg-crimson/20 border border-crimson/40 text-crimson py-2.5 px-5 text-[13px] rounded hover:bg-crimson/40 transition-colors">🔥 Tüm Verileri Sıfırla</button>
            </div>
          </div>
        )}

      </main>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f1318] border border-gold/30 rounded-xl max-w-[400px] w-full p-6 shadow-2xl shadow-gold/10">
            <div className="font-serif text-xl text-gold mb-2">{confirmModal.title}</div>
            <p className="text-text-light/70 text-sm mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded text-sm text-text-light/50 hover:text-text-light transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 rounded bg-crimson text-white text-sm font-serif hover:bg-crimson/80 transition-colors"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
