import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRank } from '../utils/rank';
import { BookOpen, LogOut, Shield, Trophy } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-stone-900 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-serif text-xl font-bold text-amber-500">
          <BookOpen className="w-6 h-6" />
          Dijital Tarih Atölyesi
        </Link>
        
        {user && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-full text-sm">
              <Shield className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{getRank(user.score)}</span>
            </div>
            <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-full text-sm">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-mono font-bold">{user.score} Puan</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">{user.username} ({user.classLevel})</span>
              <button onClick={logout} className="p-2 hover:bg-stone-800 rounded-full transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
