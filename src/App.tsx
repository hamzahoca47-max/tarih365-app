/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Home from './pages/Home';
import ClassSelect from './pages/ClassSelect';
import UniteSelect from './pages/UniteSelect';
import SubeSelect from './pages/SubeSelect';
import StudentSelect from './pages/StudentSelect';
import HarfHarfPlay from './games/HarfHarfPlay';
import CarkPlay from './games/CarkPlay';
import KapismaLobby from './games/KapismaLobby';
import KapismaPlay from './games/KapismaPlay';
import KonumPlay from './games/KonumPlay';
import EglenceMenu from './games/EglenceMenu';
import KelimePlay from './games/KelimePlay';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Result from './pages/Result';
import SoruKartlari from './pages/SoruKartlari';
import BackgroundMusic from './components/BackgroundMusic';

function AppContent() {
  const { data } = useApp();
  
  return (
    <BrowserRouter>
      <div className="bg-ornate min-h-screen relative">
        <BackgroundMusic />
        
        {/* Custom Logo */}
        {data.settings?.logoUrl && (
          <img 
            src={data.settings.logoUrl} 
            className="fixed top-4 left-4 z-[9000] w-[80px] md:w-[100px] h-auto pointer-events-none drop-shadow-2xl transition-all duration-300" 
            alt="Logo" 
            referrerPolicy="no-referrer"
          />
        )}

        {/* Custom Mascot */}
        {data.settings?.mascotUrl && (
          <img 
            src={data.settings.mascotUrl} 
            className="fixed bottom-4 right-4 z-[9000] w-[120px] md:w-[150px] h-auto pointer-events-none drop-shadow-2xl transition-all duration-300 animate-bounce-slow" 
            alt="Mascot" 
            referrerPolicy="no-referrer"
          />
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Harf Harf Tarih */}
          <Route path="/games/harf" element={<ClassSelect game="harf" />} />
          <Route path="/games/harf/unite/:grup" element={<UniteSelect game="harf" />} />
          <Route path="/games/harf/sube/:grup/:unite" element={<SubeSelect game="harf" />} />
          <Route path="/games/harf/student/:course/:sube/:unite" element={<StudentSelect />} />
          <Route path="/games/harf/play/:course/:sube/:unite/:student" element={<HarfHarfPlay />} />
          
          {/* Zamanın Çarkı */}
          <Route path="/games/cark" element={<ClassSelect game="cark" />} />
          <Route path="/games/cark/unite/:grup" element={<UniteSelect game="cark" />} />
          <Route path="/games/cark/sube/:grup/:unite" element={<SubeSelect game="cark" />} />
          <Route path="/games/cark/play/:course/:sube/:unite" element={<CarkPlay />} />
          
          {/* Tarih Kapışması */}
          <Route path="/games/kapisma" element={<ClassSelect game="kapisma" />} />
          <Route path="/games/kapisma/unite/:grup" element={<UniteSelect game="kapisma" />} />
          <Route path="/games/kapisma/sube/:grup/:unite" element={<SubeSelect game="kapisma" />} />
          <Route path="/games/kapisma/lobby/:course/:sube/:unite" element={<KapismaLobby />} />
          <Route path="/games/kapisma/play/:course/:sube/:unite" element={<KapismaPlay />} />
          
          {/* Konum At Geleyim */}
          <Route path="/games/konum" element={<KonumPlay />} />
          
          {/* Eğlence Atölyesi */}
          <Route path="/games/eglence" element={<EglenceMenu />} />
          <Route path="/games/eglence/kelime" element={<KelimePlay />} />
          
          {/* Ortak Ekranlar */}
          <Route path="/games/result" element={<Result />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/soru-kartlari" element={<SoruKartlari />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
