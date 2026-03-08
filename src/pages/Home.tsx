import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { user, isAdmin, login, logout, loading } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ornate">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start py-10 px-5 relative z-10 min-h-screen">
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        {user ? (
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 rounded-full border border-gold/20">
            <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-gold/50" referrerPolicy="no-referrer" />
            <div className="hidden md:block text-xs text-gold-light font-serif mr-1">
              {user.displayName}
              {isAdmin && <span className="block text-[10px] text-emerald-400">Yönetici</span>}
            </div>
            <button 
              onClick={logout}
              className="bg-crimson/20 hover:bg-crimson/40 text-crimson-light text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-crimson/30 transition-all"
            >
              Çıkış
            </button>
          </div>
        ) : (
          <button 
            onClick={login}
            className="bg-gold/10 hover:bg-gold/20 text-gold text-[10px] uppercase tracking-widest px-4 py-2 rounded-full border border-gold/30 transition-all flex items-center gap-2"
          >
            <span>🔑</span> Giriş Yap
          </button>
        )}
      </div>

      <div className="text-center mb-8 animate-[floatSlow_4s_ease-in-out_infinite]">
        <div className="w-[120px] h-[120px] mx-auto mb-4 rounded-full border-3 border-gold-dark flex items-center justify-center text-5xl" style={{ background: 'radial-gradient(circle, rgba(201,168,76,.2) 0%, transparent 70%)' }}>
          🏛️
        </div>
        <div className="title-grand text-3xl md:text-6xl leading-tight mb-2">TARİH365</div>
        <div className="title-divider"></div>
        <div className="font-sans italic text-text-light/80 tracking-wider mt-2 mb-6">Hamza Hoca ile Tarih Keşfi</div>
        
        <a 
          href="https://youtube.com/@365tarih?si=eK3q59KYVEV-BDtP" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30 px-5 py-2.5 rounded-full font-sans text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,0,0,0.3)]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Tarih365 YouTube Kanalına Abone Ol
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[900px] mt-8">
        <Link to="/games/harf" className="group relative overflow-hidden rounded-lg p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-gold/25" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,.04) 0%, rgba(0,0,0,.3) 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)' }}></div>
          <span className="text-4xl mb-3 block">📜</span>
          <div className="font-serif text-lg text-gold mb-1.5">Harf Harf Tarih</div>
          <div className="text-sm text-text-light/65 leading-relaxed">Tarihi kavramları harf harf keşfet. Soru başına 120 saniye, puan kazanmak için az harfle doğru bil!</div>
          <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-serif bg-gold/10 border border-gold/30 text-gold-light">Bireysel · Kelime Oyunu</span>
        </Link>

        <Link to="/games/cark" className="group relative overflow-hidden rounded-lg p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-gold/25" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,.04) 0%, rgba(0,0,0,.3) 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, transparent, var(--color-crimson), transparent)' }}></div>
          <span className="text-4xl mb-3 block">🎡</span>
          <div className="font-serif text-lg text-gold mb-1.5">Zamanın Çarkı</div>
          <div className="text-sm text-text-light/65 leading-relaxed">Çarkı çevir, dilimde ne çıkarsa soruyu cevapla. Pas, İflas, X2 ve Joker sürprize hazır ol!</div>
          <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-serif bg-gold/10 border border-gold/30 text-gold-light">Takım · Şans & Bilgi</span>
        </Link>

        <Link to="/games/kapisma" className="group relative overflow-hidden rounded-lg p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-gold/25" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,.04) 0%, rgba(0,0,0,.3) 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, transparent, var(--color-teal-light), transparent)' }}></div>
          <span className="text-4xl mb-3 block">⚔️</span>
          <div className="font-serif text-lg text-gold mb-1.5">Tarih Kapışması</div>
          <div className="text-sm text-text-light/65 leading-relaxed">İki takım karşı karşıya! Sorulara en hızlı cevap veren takım galip gelir.</div>
          <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-serif bg-gold/10 border border-gold/30 text-gold-light">Takım · Yarışma</span>
        </Link>

        <Link to="/games/konum" className="group relative overflow-hidden rounded-lg p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-gold/25" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,.04) 0%, rgba(0,0,0,.3) 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, transparent, #3498db, transparent)' }}></div>
          <span className="text-4xl mb-3 block">🗺️</span>
          <div className="font-serif text-lg text-gold mb-1.5">Konum At Geleyim!</div>
          <div className="text-sm text-text-light/65 leading-relaxed">Harita üzerinde tarihi olayların gerçekleştiği yerleri işaretle, yaklaştıkça puan kazan.</div>
          <span className="inline-block mt-3 px-2.5 py-1 rounded-full text-[11px] font-serif bg-gold/10 border border-gold/30 text-gold-light">🗺️ Eğlence · Konum</span>
        </Link>
      </div>

      <div className="mt-5 w-full max-w-[540px]">
        <Link to="/leaderboard" className="block rounded-lg p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-gold/35" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,.08), rgba(139,26,26,.06))' }}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <div>
              <div className="font-serif text-lg text-gold mb-1">Puan Tablosu & Rütbeler</div>
              <div className="text-sm text-text-light/65">Tüm sınıflardaki öğrencilerin birikimli puanlarını ve kazandıkları rütbeleri görüntüle.</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-5 w-full max-w-[540px]">
        <Link to="/games/eglence" className="block rounded-lg p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-[#9b59b6]/35" style={{ background: 'linear-gradient(135deg, rgba(155,89,182,.08), rgba(142,68,173,.12))' }}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎮</span>
            <div>
              <div className="font-serif text-lg text-gold mb-1">Eğlence Atölyesi</div>
              <div className="text-sm text-text-light/65">Kelime oyunu ile bilginizi test edin</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-6 text-text-light/40 text-sm italic text-center">
        🏅 Rütbe Sistemi: Her 3000 puan = 1 rütbe yükseliş • Veziriazam: 20.000 • Padişah: 30.000 puan
      </div>
      
      <div className="mt-5 flex gap-3">
        {isAdmin && (
          <Link to="/admin" className="inline-block bg-white/5 border border-white/10 text-text-light/70 text-xs py-2 px-4 rounded font-serif hover:bg-white/10 hover:text-text-light transition-colors">
            ⚙️ Yönetici Paneli
          </Link>
        )}
        <Link to="/soru-kartlari" className="inline-block bg-white/5 border border-white/10 text-text-light/70 text-xs py-2 px-4 rounded font-serif hover:bg-white/10 hover:text-text-light transition-colors">
          🗂️ Soru-Cevap Kartları
        </Link>
      </div>
    </div>
  );
}
