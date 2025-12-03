const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Veritabanı dosyası
const DB_FILE = path.join(__dirname, 'survey-db.json');

// Varsayılan veri
const DEFAULT_DATA = {
    totalScores: { "1": 0, "2": 0, "3": 0 },
    currentUsers: 3,
    votes: [], // Kimin ne oy verdiğini kaydet
    usedIPs: [] // IP bazlı kontrol (basit)
};

// Veriyi oku
function readDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Veritabanı okuma hatası:', err);
    }
    // Dosya yoksa varsayılanı yaz
    writeDB(DEFAULT_DATA);
    return DEFAULT_DATA;
}

// Veriyi yaz
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// IP adresini al (basit)
function getClientIP(req) {
    return req.ip || req.connection.remoteAddress;
}

// API: Anket durumunu getir
app.get('/api/survey', (req, res) => {
    const data = readDB();
    res.json({
        totalScores: data.totalScores,
        currentUsers: data.currentUsers,
        remainingUsers: Math.max(0, data.currentUsers - data.votes.length)
    });
});

// API: Oy gönder
app.post('/api/vote', (req, res) => {
    const data = readDB();
    const clientIP = getClientIP(req);
    const { vote3, vote1 } = req.body;
    
    // Kontroller
    if (data.currentUsers <= 0) {
        return res.json({ success: false, message: 'Anket zaten bitti.' });
    }
    
    // Bu IP'den daha önce oy kullanılmış mı? (basit kontrol)
    if (data.usedIPs.includes(clientIP)) {
        return res.json({ success: false, message: 'Bu cihazdan zaten oy kullanıldı.' });
    }
    
    // Aynı görsele iki oy verilmiş mi?
    if (vote3 === vote1) {
        return res.json({ success: false, message: 'Aynı görsele iki oy veremezsiniz.' });
    }
    
    // Puanları güncelle
    data.totalScores[vote3] += 3;
    data.totalScores[vote1] += 1;
    
    // Kullanıcı kaydı
    data.votes.push({
        ip: clientIP,
        vote3: vote3,
        vote1: vote1,
        timestamp: new Date().toISOString()
    });
    
    // IP'yi kaydet
    data.usedIPs.push(clientIP);
    
    // Eğer 3 kişi oy kullandıysa, currentUsers'ı 0 yap
    if (data.votes.length >= 3) {
        data.currentUsers = 0;
    }
    
    writeDB(data);
    
    res.json({
        success: true,
        message: 'Oy kaydedildi!',
        data: {
            totalScores: data.totalScores,
            currentUsers: data.currentUsers,
            remainingUsers: Math.max(0, 3 - data.votes.length),
            yourVotes: { vote3, vote1 }
        }
    });
});

// API: Anketi sıfırla (admin için)
app.post('/api/reset', (req, res) => {
    writeDB(DEFAULT_DATA);
    res.json({ success: true, message: 'Anket sıfırlandı.' });
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/survey`);
    console.log(`🔧 Anket otomatik sıfırlanmaz. 3 kişi oy verince biter.`);
});
