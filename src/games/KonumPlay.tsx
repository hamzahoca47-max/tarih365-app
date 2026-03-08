import { useNavigate } from 'react-router-dom';

export default function KonumPlay() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-stretch bg-[#0a0d12] p-0 min-h-screen">
      <div className="flex items-center justify-between py-3.5 px-5 bg-black/50 border-b border-gold/15 shrink-0">
        <div className="font-serif text-lg text-gold">🗺️ Konum At Geleyim!</div>
        <div className="text-xs text-text-light/40 italic hidden md:block">Bu oyundaki puanlar genel tabloya eklenmez · Sadece eğlence</div>
        <button onClick={() => navigate('/')} className="back-nav !mt-0">← Ana Menü</button>
      </div>
      <iframe 
        src="https://www.worldguessr.com/" 
        className="flex-1 w-full border-none min-h-[calc(100vh-60px)]" 
        allowFullScreen
      />
    </div>
  );
}
