// --- server.js: NIHAI VE DÜZELTİLMİŞ SUNUCU KODU ---

// Gerekli Modülleri Yükleme (path modülü artık require ile tanımlı)
const express = require('express');
const path = require('path'); // <<< HATA DÜZELTİLDİ: path modülü yüklendi
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const PORT = 3000;

// Varsayılan (Başlangıç) Veri Seti (lowdb hatasını önler)
const DEFAULT_DATA = {
    totalScores: { 1: 0, 2: 0, 3: 0 },
    currentUsers: 3
};

// Veritabanı kurulumu
const dbFilePath = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFilePath);
// Lowdb'ye varsayılan veriyi doğrudan sağlıyoruz
const db = new Low(adapter, DEFAULT_DATA);

// Veritabanını başlatma (okuma ve dosya yoksa varsayılanı yazma)
async function initializeDB() {
    await db.read();
    await db.write(); // İlk çalıştırmada db.json dosyasını oluşturur
}
initializeDB();

// --- Middleware'ler ---
app.use(express.json()); // POST'tan gelen JSON verisini okumak için
// Public klasöründeki HTML, CSS, JS dosyalarını sunmak için
app.use(express.static('public'));

// --- API Uç Noktaları ---

// API 1: Anket durumunu döndürür (herkesin güncel sayacı ve puanları görmesi için)
app.get('/api/status', async (req, res) => {
    await db.read();
    res.json(db.data);
});

// API 2: Oy verme işlemini yönetir
app.post('/api/vote', async (req, res) => {
    await db.read();
    let data = db.data;
    
    if (data.currentUsers > 0) {
        const { vote_3_id, vote_1_id } = req.body;

        // Puanları ekle
        data.totalScores[vote_3_id] += 3;
        data.totalScores[vote_1_id] += 1;

        // Kullanıcı sayacını azalt (ENTEGRE KISIM)
        data.currentUsers -= 1;

        await db.write(); // Veritabanına kaydet

        return res.json({ success: true, message: 'Oy kaydedildi', status: data });
    } else {
        return res.status(400).json({ success: false, message: 'Anket bitti.' });
    }
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`Lütfen tarayıcınızda açın: http://localhost:3000`);
});