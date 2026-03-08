import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Compass, Hourglass, Target, Trophy, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getRank } from '../utils/rank';

const GAMES = [
  {
    id: 'harf-harf',
    title: 'Harf Harf Tarih',
    description: '10 soru, 120 saniye. Harf almadan bil, daha çok puan kazan!',
    icon: BookOpen,
    color: 'bg-amber-500',
    path: '/games/harf-harf'
  },
  {
    id: 'cark',
    title: 'Çark-ı Tarih',
    description: 'Çarkı çevir, şansına gelen zorluktaki soruyu bil.',
    icon: Target,
    color: 'bg-emerald-500',
    path: '/games/cark'
  },
  {
    id: 'harita',
    title: 'Konum At, Geleyim!',
    description: 'Tarihi olayların yerini haritada işaretle. Tam isabet 1000 puan!',
    icon: Compass,
    color: 'bg-blue-500',
    path: '/games/harita'
  },
  {
    id: 'kronoloji',
    title: 'Kronoloji Tüneli',
    description: '5 tarihi olayı doğru sıraya diz. 30 saniyen var.',
    icon: Hourglass,
    color: 'bg-purple-500',
    path: '/games/kronoloji'
  }
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Eğitim Modülleri</h1>
          <p className="text-stone-600 mt-2">Seviye: {user?.classLevel} | Sana özel içerikler listeleniyor.</p>
        </div>
        <Link to="/admin" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
          <Settings className="w-5 h-5" />
          <span>Yönetici Paneli</span>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              to={game.path}
              className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-stone-200 group h-full"
            >
              <div className={`${game.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <game.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">{game.title}</h3>
              <p className="text-stone-600 text-sm">{game.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-stone-900">Sıralama (Leaderboard)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-sm">
                <th className="pb-3 font-medium">Sıra</th>
                <th className="pb-3 font-medium">Kullanıcı</th>
                <th className="pb-3 font-medium">Rütbe</th>
                <th className="pb-3 font-medium text-right">Puan</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-stone-100 bg-amber-50/50">
                <td className="py-4 font-bold text-amber-600">1</td>
                <td className="py-4 font-medium">{user?.username} (Sen)</td>
                <td className="py-4 text-stone-600">{getRank(user?.score || 0)}</td>
                <td className="py-4 text-right font-mono font-bold">{user?.score}</td>
              </tr>
              <tr className="border-b border-stone-100">
                <td className="py-4 font-bold text-stone-400">2</td>
                <td className="py-4 font-medium">TarihKurdu99</td>
                <td className="py-4 text-stone-600">Acemi Oğlanı</td>
                <td className="py-4 text-right font-mono font-bold">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
