export function getRank(score: number) {
  if (score >= 100000) return 'Padişah';
  if (score >= 50000) return 'Veziriazam';
  if (score >= 40000) return 'Vezir';
  if (score >= 30000) return 'Kazasker';
  if (score >= 20000) return 'Subaşı';
  if (score >= 10000) return 'Tımarlı Sipahi';
  return 'Acemi Oğlanı';
}
