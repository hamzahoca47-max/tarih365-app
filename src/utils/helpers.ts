export const RUTBELER = [
  { min: 30000, ad: "Padişah", icon: "👑", renk: "#f0d080" },
  { min: 20000, ad: "Veziriazam", icon: "🌟", renk: "#c9a84c" },
  { min: 15000, ad: "Vezir", icon: "⚜️", renk: "#c9a84c" },
  { min: 12000, ad: "Kazasker", icon: "⚖️", renk: "#d4af37" },
  { min: 9000, ad: "Subaşı", icon: "🛡️", renk: "#a8a8a8" },
  { min: 6000, ad: "Tımarlı Sipahi", icon: "🗡️", renk: "#b0663d" },
  { min: 3000, ad: "Akıncı", icon: "🏹", renk: "#8b7355" },
  { min: 0, ad: "Acemi", icon: "📖", renk: "#666" },
];

export function getRutbe(toplam: number) {
  for (const r of RUTBELER) {
    if (toplam >= r.min) return r;
  }
  return RUTBELER[RUTBELER.length - 1];
}

export function getRank(score: number) {
  const r = getRutbe(score);
  return `${r.icon} ${r.ad}`;
}

export function getSinifGrubu(sinifAdi: string) {
  const lower = sinifAdi.toLowerCase();
  if (lower.includes('çağdaş') || lower.includes('cagdas')) return '12-cagdas';
  if (lower.includes('türk kültür') || lower.includes('tkm')) return '11-tkm';

  const m = sinifAdi.match(/^(\d+)/);
  if (m) return m[1];
  const m2 = sinifAdi.match(/(\d+)/);
  return m2 ? m2[1] : sinifAdi;
}

export function getBaseGrade(courseId: string) {
  const m = courseId.match(/^(\d+)/);
  return m ? m[1] : courseId;
}

export const COURSE_NAMES: Record<string, string> = {
  "9": "9. Sınıf Tarih",
  "10": "10. Sınıf Tarih",
  "11": "11. Sınıf Tarih",
  "11-tkm": "11. Sınıf Türk Kültür ve Medeniyeti",
  "12": "12. Sınıf T.C. İnkılap Tarihi",
  "12-cagdas": "12. Sınıf Çağdaş Türk ve Dünya Tarihi"
};

export function getCourseName(courseId: string) {
  return COURSE_NAMES[courseId] || `${courseId}. Sınıf`;
}
