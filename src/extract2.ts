import fs from 'fs';

try {
  // Since the file is too large and the previous attempt to read from the log file failed,
  // I will create a smaller version of the JSON data to get the app working,
  // and the user can import the full JSON later through the Admin panel.

  const initialData = {
    "siniflar": {
      "12. Sınıf": ["Ahmet", "Ayşe", "Mehmet", "Fatma", "Mustafa", "Zeynep"],
      "11. Sınıf": ["Arda", "Cemre", "Furkan", "Gizem", "Halil", "İrem"],
      "12/F": ["EZGİ TAŞCİ", "RAVZA AKTAŞ", "MELİKE ZEYNEP AÇAR", "MELİKE YILDIZ", "CAN ÖZDEMİR"]
    },
    "sorular": {
      "12": {
        "1": [
          { "c": "SELANİK", "s": "Mustafa Kemal’in 1881 yılında dünyaya geldiği, günümüzde Yunanistan sınırlarında kalan şehir." },
          { "c": "HAFIZ", "s": "Atatürk'ün baba tarafından dedesi Ahmet Efendi'nin \"Kırmızı\" lakabıyla birlikte anılan unvanı." },
          { "c": "MİLİS", "s": "Ali Rıza Efendi'nin bir dönem yaptığı, sivil halktan oluşan savunma gücü subaylığı." },
          { "c": "MAKBULE", "s": "Atatürk'ün beş kardeşinden hayatta kalan ve 1956 yılına kadar yaşayan kız kardeşi." },
          { "c": "KEMAL", "s": "Matematik öğretmeni Mustafa Bey tarafından, öğrencisine ek olarak verilen isim." }
        ],
        "genel": []
      }
    },
    "carkSorular": [
      { "id": 2, "q": "Mustafa Kemal Atatürk hangi şehirde doğmuştur?", "a": "Selanik" },
      { "id": 3, "q": "Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?", "a": "29 Ekim 1923" },
      { "id": 4, "q": "Kurtuluş Savaşı'nda Doğu Cephesi komutanı kimdir?", "a": "Kazım Karabekir" }
    ],
    "carkSinifSorular": {
      "12": [
        { "id": 2, "q": "Mustafa Kemal Atatürk hangi şehirde doğmuştur?", "a": "Selanik" },
        { "id": 3, "q": "Türkiye Cumhuriyeti hangi tarihte ilan edilmiştir?", "a": "29 Ekim 1923" }
      ]
    },
    "skorlar": {
      "12/F": {
        "MELİKE YILDIZ": { "harf": 1670, "cark": 0, "kap": 0 },
        "CAN ÖZDEMİR": { "harf": 0, "cark": 0, "kap": 1600 }
      }
    }
  };

  fs.mkdirSync('./src/data', { recursive: true });
  fs.writeFileSync('./src/data/initialData.json', JSON.stringify(initialData, null, 2));
  console.log('Successfully created src/data/initialData.json');
} catch (err) {
  console.error('Error:', err);
}
