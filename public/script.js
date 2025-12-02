// Genel anket durumu
const MAX_USERS = 3;
let currentUsers = MAX_USERS;
let totalScores = { 1: 0, 2: 0, 3: 0 }; // Görsel ID'lerine göre puanlar

// Mevcut kullanıcının oy durumu
let currentUserVotes = {
    '3_point_image_id': null, // 3 puan verdiği görselin ID'si
    '1_point_image_id': null, // 1 puan verdiği görselin ID'si
    'votes_left': 2
};

// HTML element referansları
const votesLeftSpan = document.getElementById('votes-left');
const submitButton = document.getElementById('submit-btn');
const resultsMessageDiv = document.getElementById('results-message');
const userCountDiv = document.getElementById('user-count');
const totalResultsDiv = document.getElementById('total-results');

/**
 * Kullanıcının bir görsele puan vermesini sağlar.
 * @param {number} imageId - Oy verilen görselin ID'si (1, 2 veya 3)
 * @param {number} points - Verilen puan (3 veya 1)
 */
function addVote(imageId, points) {
    // Aynı görsele birden fazla oy verilemez
    if (currentUserVotes['3_point_image_id'] === imageId || currentUserVotes['1_point_image_id'] === imageId) {
        alert("Aynı görsele birden fazla oy veremezsiniz.");
        return;
    }
    
    // Zaten o puan türü kullanılmışsa (örn. 3 puanlık hakkını kullanmışsa)
    if (points === 3 && currentUserVotes['3_point_image_id'] !== null) {
        alert("3 Puanlık hakkınızı zaten kullandınız.");
        return;
    }
    if (points === 1 && currentUserVotes['1_point_image_id'] !== null) {
        alert("1 Puanlık hakkınızı zaten kullandınız.");
        return;
    }

    // Puanı kaydet
    if (points === 3) {
        currentUserVotes['3_point_image_id'] = imageId;
    } else if (points === 1) {
        currentUserVotes['1_point_image_id'] = imageId;
    }
    
    // Görseli görsel olarak işaretle
    updateImageSelection(imageId, points);

    // Kalan oy hakkını güncelle
    currentUserVotes.votes_left--;
    votesLeftSpan.textContent = currentUserVotes.votes_left;

    // Eğer iki oy da verilmişse, gönder butonunu aktif et
    if (currentUserVotes['3_point_image_id'] !== null && currentUserVotes['1_point_image_id'] !== null) {
        submitButton.disabled = false;
    }
}

/**
 * Görselin etrafındaki çerçeveyi oy türüne göre günceller.
 */
function updateImageSelection(imageId, points) {
    const item = document.querySelector(`.image-item[data-image-id="${imageId}"]`);
    
    // Önceki seçimi kaldır (aynı görsele 1 ve 3 puan verilmeyeceği için bu mantık işler)
    item.classList.remove('selected-1', 'selected-2');

    if (points === 3) {
        item.classList.add('selected-1'); // 3 puan için altın (gold)
    } else if (points === 1) {
        item.classList.add('selected-2'); // 1 puan için gümüş (silver)
    }
}

/**
 * Seçim yapıldıktan sonra oyları toplam skora ekler ve kullanıcıyı sıfırlar.
 */
function submitVote() {
    if (currentUserVotes['3_point_image_id'] === null || currentUserVotes['1_point_image_id'] === null) {
        alert("Lütfen hem 3 Puanlık hem de 1 Puanlık tercihinizi yapın.");
        return;
    }

    // Puanları genel toplama ekle
    totalScores[currentUserVotes['3_point_image_id']] += 3;
    totalScores[currentUserVotes['1_point_image_id']] += 1;

    // Kullanıcı sayısını azalt
    currentUsers--;
    userCountDiv.textContent = `Kalan Kullanıcı: ${currentUsers}`;
    resultsMessageDiv.textContent = `Oy Gönderildi! Kalan Kullanıcı: ${currentUsers}`;

    // Seçim durumlarını sıfırla
    resetUserSelection();

    if (currentUsers === 0) {
        // Tüm kullanıcılar oy kullandı
        endSurvey();
    } else {
        // Yeni bir kullanıcı için hazırla
        alert(`Teşekkürler! Yeni Kullanıcı (${MAX_USERS - currentUsers}. kişi) oy kullanabilir.`);
    }
}

/**
 * Mevcut kullanıcının seçimlerini ve görsel işaretlerini sıfırlar.
 */
function resetUserSelection() {
    currentUserVotes = {
        '3_point_image_id': null,
        '1_point_image_id': null,
        'votes_left': 2
    };

    votesLeftSpan.textContent = 2;
    submitButton.disabled = true;

    // Tüm görsel çerçevelerini sıfırla
    document.querySelectorAll('.image-item').forEach(item => {
        item.classList.remove('selected-1', 'selected-2');
    });
}

/**
 * Anket bittiğinde sonuçları gösterir.
 */
function endSurvey() {
    resultsMessageDiv.textContent = "Anket Tamamlandı! Toplam Sonuçlar:";
    
    // Sonuçları HTML'de güncelle
    document.getElementById('score-1').textContent = totalScores[1];
    document.getElementById('score-2').textContent = totalScores[2];
    document.getElementById('score-3').textContent = totalScores[3];

    // Sonuçlar kutusunu görünür yap
    totalResultsDiv.style.display = 'block';

    // Oy verme butonlarını devre dışı bırak
    document.querySelectorAll('button').forEach(btn => btn.disabled = true);

    // Kazananı belirle
    const winner = Object.keys(totalScores).reduce((a, b) => totalScores[a] > totalScores[b] ? a : b);
    const winnerScore = totalScores[winner];

    // Eşitlik kontrolü
    const winners = Object.keys(totalScores).filter(key => totalScores[key] === winnerScore);
    if (winners.length > 1) {
         resultsMessageDiv.textContent += ` (Eşitlik: Görsel ${winners.join(' ve Görsel ')} ${winnerScore} puanla birinciliği paylaşıyorlar.)`;
    } else {
        resultsMessageDiv.textContent += ` (Kazanan: Görsel ${winner}, ${winnerScore} puanla!)`;
    }
}