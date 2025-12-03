// script.js - GOOGLE APPS SCRIPT VERSİYONU
// Eski verileri temizle (debug için)
if (window.location.search.includes('reset')) {
    localStorage.removeItem('anket2024');
    localStorage.removeItem('my_user_id');
    window.location.search = ''; // reset parametresini kaldır
}

// Veya her seferinde sıfırdan başlatmak için:
const FORCE_RESET = true; // test için true yap
if (FORCE_RESET) {
    localStorage.removeItem('anket2024');
    localStorage.removeItem('my_user_id');
}
const BIN_ID="692f521cd0ea881f400e97b8"
const API_URL = "$2a$10$1VdSVKW/tBjyEzBu9H0hieADWqxM.NbcAuP0UXLPEQJIhyxW37ZbC";


let currentUserVotes = {
    '3_point_image_id': null,
    '1_point_image_id': null,
    'votes_left': 2
};

// Her kullanıcıya benzersiz ID (localStorage ile)
let userId = localStorage.getItem('anket_user_id');
if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('anket_user_id', userId);
}

window.onload = async () => {
    await loadSurveyStatus();
    // Her 3 saniyede bir güncelle
    setInterval(loadSurveyStatus, 3000);
};

async function loadSurveyStatus() {
    try {
        const response = await fetch(`${API_URL}?action=getStatus`);
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            
            // Puanları göster
            document.getElementById('score-1').textContent = data.totalScores[1];
            document.getElementById('score-2').textContent = data.totalScores[2];
            document.getElementById('score-3').textContent = data.totalScores[3];
            
            // Kalan kullanıcı
            document.getElementById('user-count').textContent = `Kalan Kullanıcı: ${data.currentUsers}`;
            
            // Anket bittiyse
            if (data.currentUsers <= 0) {
                endSurvey(data.totalScores);
                document.getElementById('submit-btn').disabled = true;
            }
        }
    } catch (error) {
        console.error('Hata:', error);
    }
}

// addVote fonksiyonu AYNI KALACAK (önceki gibi)

async function submitVote() {
    if (currentUserVotes['3_point_image_id'] === null || 
        currentUserVotes['1_point_image_id'] === null) {
        alert("Lütfen her iki seçimi de yapın");
        return;
    }

    try {
        const response = await fetch(`${API_URL}?action=vote&vote_3_id=${currentUserVotes['3_point_image_id']}&vote_1_id=${currentUserVotes['1_point_image_id']}&user_id=${userId}`);
        const result = await response.json();
        
        if (result.success) {
            alert("✓ Oyunuz kaydedildi!");
            
            // Durumu yenile
            await loadSurveyStatus();
            
            // Seçimleri sıfırla
            resetUserSelection();
            
            // Eğer anket bittiyse
            if (result.data.remainingUsers <= 0) {
                setTimeout(() => {
                    endSurvey(result.data.scores);
                }, 1000);
            }
        } else {
            alert("Hata: " + result.data);
        }
    } catch (error) {
        alert("Bağlantı hatası! Lütfen tekrar deneyin.");
    }
}

// Diğer fonksiyonlar AYNI KALACAK (updateImageSelection, resetUserSelection, endSurvey)