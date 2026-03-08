import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppData, StudentScore } from '../types';
import initialData from '../data/initialData.json';
import { db, auth, doc, onSnapshot, setDoc, getDoc, signInWithPopup, googleProvider, User, onAuthStateChanged } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // throw new Error(JSON.stringify(errInfo)); // Uygulamayı çökertmemek için sadece logluyoruz
};

const defaultData: AppData = {
  siniflar: initialData.siniflar || {},
  sorular: initialData.sorular || {},
  carkSorular: initialData.carkSorular || [],
  carkSinifSorular: initialData.carkSinifSorular || {},
  skorlar: initialData.skorlar || {},
  eglenceSorular: { kelime: [] },
  iyikiVarSorular: {},
  settings: {}
};

interface AppContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  addScore: (sinif: string, ogrenci: string, oyun: keyof StudentScore, puan: number) => void;
  importData: (importedData: Partial<AppData>) => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  activeSchoolPin: string | null;
  setActiveSchoolPin: (pin: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('dta_music_enabled');
    return saved === null ? true : saved === 'true';
  });
  const [activeSchoolPin, setActiveSchoolPin] = useState<string | null>(() => {
    return localStorage.getItem('dta_active_school_pin');
  });

  const [data, setDataState] = useState<AppData>(defaultData);

  // Her giriş yapan kullanıcı kendi verisinin adminidir
  const isAdmin = !!user;
  const isSuperAdmin = user?.email === 'hamzagoktepe@gmail.com';

  // Firestore'a kaydetme fonksiyonu
  const saveToFirestore = async (newData: AppData) => {
    if (!user) return;
    try {
      if (isSuperAdmin) {
        const globalRef = doc(db, 'global', 'questions');
        await setDoc(globalRef, {
          sorular: newData.sorular,
          carkSinifSorular: newData.carkSinifSorular,
          eglenceSorular: newData.eglenceSorular,
          carkSorular: newData.carkSorular
        });
      }
      const teacherRef = doc(db, 'teachers', user.uid, 'data', 'main');
      
      // Firestore does not support undefined values. We need to sanitize the settings object.
      const sanitizedSettings = { ...newData.settings };
      if (sanitizedSettings.logoUrl === undefined) delete sanitizedSettings.logoUrl;
      if (sanitizedSettings.mascotUrl === undefined) delete sanitizedSettings.mascotUrl;
      if (sanitizedSettings.schoolPin === undefined) delete sanitizedSettings.schoolPin;
      
      await setDoc(teacherRef, {
        siniflar: newData.siniflar,
        skorlar: newData.skorlar,
        settings: sanitizedSettings || {}
      });

      // Okul şifresi varsa, sınıfları okullar koleksiyonuna da kaydet
      if (sanitizedSettings.schoolPin) {
        const schoolRef = doc(db, 'schools', sanitizedSettings.schoolPin);
        await setDoc(schoolRef, {
          siniflar: newData.siniflar,
          teacherId: user.uid
        });
      }
    } catch (e) {
      console.error("Failed to save to Firestore", e);
    }
  };

  // Dışarıya açılan setData fonksiyonu (hem state'i günceller hem Firestore'a yazar)
  const setData = (update: AppData | ((prev: AppData) => AppData)) => {
    setDataState(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      saveToFirestore(next);
      return next;
    });
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listener
  useEffect(() => {
    // 1. Global Soru Havuzunu Dinle (Herkes görebilir)
    const globalPath = 'global/questions';
    const globalRef = doc(db, 'global', 'questions');
    const unsubGlobal = onSnapshot(globalRef, (docSnap) => {
      if (docSnap.exists()) {
        const globalData = docSnap.data();
        setDataState(prev => ({
          ...prev,
          sorular: globalData.sorular || prev.sorular,
          carkSinifSorular: globalData.carkSinifSorular || prev.carkSinifSorular,
          eglenceSorular: globalData.eglenceSorular || prev.eglenceSorular,
          carkSorular: globalData.carkSorular || prev.carkSorular
        }));
      } else if (isSuperAdmin) {
        setDoc(globalRef, {
          sorular: defaultData.sorular,
          carkSinifSorular: defaultData.carkSinifSorular,
          eglenceSorular: defaultData.eglenceSorular,
          carkSorular: defaultData.carkSorular
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, globalPath));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, globalPath);
    });

    if (!user) {
      // Giriş yapılmamışsa, okul şifresi varsa onu dinle
      if (activeSchoolPin) {
        const schoolPath = `schools/${activeSchoolPin}`;
        const schoolRef = doc(db, 'schools', activeSchoolPin);
        const unsubSchool = onSnapshot(schoolRef, (docSnap) => {
          if (docSnap.exists()) {
            const schoolData = docSnap.data();
            setDataState(prev => {
              const updatedSiniflar = { ...(schoolData.siniflar || prev.siniflar) };
              updatedSiniflar['MİSAFİR'] = Array.from({ length: 40 }, (_, i) => `${i + 1}`);
              return {
                ...prev,
                siniflar: updatedSiniflar
              };
            });
          } else {
            // Şifre yanlışsa veya silinmişse temizle
            setActiveSchoolPin(null);
            localStorage.removeItem('dta_active_school_pin');
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, schoolPath);
        });
        return () => {
          unsubGlobal();
          unsubSchool();
        };
      }
      
      // Giriş yapılmamış ve şifre yoksa sadece global veriyi ve varsayılanları göster
      return () => unsubGlobal();
    }

    // 2. Öğretmen Özel Verilerini (Sınıf ve Skorlar) Dinle
    const teacherPath = `teachers/${user.uid}/data/main`;
    const teacherRef = doc(db, 'teachers', user.uid, 'data', 'main');
    const unsubTeacher = onSnapshot(teacherRef, (docSnap) => {
      if (docSnap.exists()) {
        const teacherData = docSnap.data();
        
        setDataState(prev => {
          const updatedSiniflar = { ...(teacherData.siniflar || prev.siniflar) };
          // MİSAFİR sınıfını her zaman 1-40 arası numaralarla güncelle
          updatedSiniflar['MİSAFİR'] = Array.from({ length: 40 }, (_, i) => `${i + 1}`);

          return {
            ...prev,
            siniflar: updatedSiniflar,
            skorlar: teacherData.skorlar || prev.skorlar,
            settings: teacherData.settings || prev.settings
          };
        });
      } else {
        const initialSiniflar = { ...defaultData.siniflar, 'MİSAFİR': Array.from({ length: 40 }, (_, i) => `${i + 1}`) };
        setDoc(teacherRef, {
          siniflar: initialSiniflar,
          skorlar: {},
          settings: {}
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, teacherPath));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, teacherPath);
    });

    return () => {
      unsubGlobal();
      unsubTeacher();
    };
  }, [user, isSuperAdmin, activeSchoolPin]);

  useEffect(() => {
    localStorage.setItem('dta_music_enabled', musicEnabled.toString());
  }, [musicEnabled]);

  const addScore = (sinif: string, ogrenci: string, oyun: keyof StudentScore, puan: number) => {
    if (sinif === 'MİSAFİR') return; // Misafir modunda puanları kaydetme
    setData(prev => {
      const newData = { ...prev };
      if (!newData.skorlar[sinif]) newData.skorlar[sinif] = {};
      if (!newData.skorlar[sinif][ogrenci]) newData.skorlar[sinif][ogrenci] = { harf: 0, cark: 0, kap: 0 };
      newData.skorlar[sinif][ogrenci][oyun] += puan;
      return newData;
    });
  };

  const importData = (importedData: Partial<AppData>) => {
    setData(prev => {
      const next = { ...prev };
      if (importedData.siniflar) next.siniflar = importedData.siniflar;
      if (importedData.sorular) next.sorular = importedData.sorular;
      if (importedData.carkSorular) next.carkSorular = importedData.carkSorular;
      if (importedData.carkSinifSorular) next.carkSinifSorular = importedData.carkSinifSorular;
      if (importedData.skorlar) next.skorlar = importedData.skorlar;
      if (importedData.eglenceSorular) next.eglenceSorular = importedData.eglenceSorular;
      if (importedData.iyikiVarSorular) next.iyikiVarSorular = importedData.iyikiVarSorular;
      if (importedData.settings) next.settings = importedData.settings;
      return next;
    });
  };

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <AppContext.Provider value={{ 
      data, setData, addScore, importData, musicEnabled, setMusicEnabled,
      user, isAdmin, isSuperAdmin, login, logout, loading,
      activeSchoolPin, setActiveSchoolPin
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
