// --- KONFIGURASI AUDIO & KONTROLLER ---
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const musicDisc = document.getElementById('musicDisc');

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.play().then(() => {
      musicBtn.classList.add('playing');
    }).catch(err => console.log("Autoplay ditolak:", err));
  } else {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
  }
}

musicBtn.addEventListener('click', toggleMusic);

// Memulai musik otomatis saat interaksi pertama jika lilin ditiup
function playMusicOnWish() {
  bgMusic.play().then(() => {
    musicBtn.classList.add('playing');
  }).catch(() => {
    // browser memblokir, tunggu interaksi manual di tombol musik
  });
}


// --- INTERAKSI TIUP LILIN (MAKE A WISH) ---
const flame = document.getElementById('flame');
const cakeOverlay = document.getElementById('cakeOverlay');
const mainContainer = document.getElementById('mainContainer');

flame.addEventListener('click', () => {
  // Matikan api lilin
  flame.style.display = 'none';
  
  // Mainkan musik latar
  playMusicOnWish();
  
  // Mulai efek confetti pesta
  startConfetti();
  
  // Lepaskan balon terbang
  spawnBalloonsPeriodically();
  
  // Transisi menutup overlay lilin dan menampilkan surat
  setTimeout(() => {
    cakeOverlay.classList.add('hidden');
    mainContainer.classList.remove('blurred');
  }, 1800);
});


// --- EFEK KANVAS CONFETTI ---
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confettiActive = false;
let confettiPieces = [];
const confettiColors = ['#ff758c', '#ff73b3', '#bd52eb', '#00f0ff', '#ffbe0b', '#3a86c8'];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let spawnMoreConfetti = true;

class ConfettiPiece {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height - 20;
    this.size = Math.random() * 8 + 6;
    this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 5 + 4;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    if (this.y > canvas.height) {
      if (spawnMoreConfetti) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
        return true;
      }
      return false; // Hapus jika sudah di luar layar dan tidak spawn lagi
    }
    return true;
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

function startConfetti() {
  confettiActive = true;
  spawnMoreConfetti = true;
  confettiPieces = [];
  for (let i = 0; i < 150; i++) {
    confettiPieces.push(new ConfettiPiece());
  }
  animateConfetti();
  
  // Hentikan penambahan confetti baru setelah 4 detik (efek mereda alami)
  setTimeout(() => {
    spawnMoreConfetti = false;
  }, 4000);
}

function animateConfetti() {
  if (!confettiActive) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Filter keluar partikel yang sudah keluar dari layar
  confettiPieces = confettiPieces.filter(p => p.update());
  
  confettiPieces.forEach(p => p.draw());
  
  if (confettiPieces.length === 0) {
    confettiActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    requestAnimationFrame(animateConfetti);
  }
}


// --- BALON TERBANG INTERAKTIF (BISA DI-POP) ---
const balloonColors = ['#ff758c', '#ff73b3', '#bd52eb', '#00f0ff', '#ffbe0b', '#ff007f', '#a0c4ff'];

function createOneBalloon() {
  const b = document.createElement('div');
  b.className = 'balloon';
  
  // Custom properties
  const sizeMultiplier = Math.random() * 0.4 + 0.8; // 80% to 120%
  b.style.transform = `scale(${sizeMultiplier})`;
  
  const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
  b.style.backgroundColor = color;
  b.style.color = color; // untuk border segitiga penahan tali
  
  b.style.left = Math.random() * 85 + 5 + 'vw';
  b.style.animationDuration = (Math.random() * 6 + 7) + 's'; // 7 - 13 detik
  
  // Tali Balon
  const string = document.createElement('div');
  string.className = 'balloon-string';
  b.appendChild(string);
  
  // Interaksi klik balon -> Pecah (pop)
  b.addEventListener('click', () => {
    popBalloon(b);
  });
  
  document.body.appendChild(b);
  
  // Hapus balon dari DOM setelah selesai terbang ke atas
  b.addEventListener('animationend', () => {
    b.remove();
  });
}

function popBalloon(balloonEl) {
  // Animasi pecah sederhana dengan scale up cepat lalu hilang
  balloonEl.style.animation = 'none';
  balloonEl.style.transition = 'all 0.15s ease-out';
  balloonEl.style.transform = 'scale(1.6)';
  balloonEl.style.opacity = '0';
  
  // Pemicu confetti kecil di lokasi balon yang pecah
  const rect = balloonEl.getBoundingClientRect();
  burstConfettiAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  
  setTimeout(() => {
    balloonEl.remove();
  }, 150);
}

function burstConfettiAt(x, y) {
  for (let i = 0; i < 15; i++) {
    const p = new ConfettiPiece();
    p.x = x;
    p.y = y;
    p.speedX = Math.random() * 6 - 3;
    p.speedY = Math.random() * 6 - 3;
    confettiPieces.push(p);
  }
}

function spawnBalloonsPeriodically() {
  // Lepas balon bergelombang
  for(let i = 0; i < 8; i++) {
    setTimeout(createOneBalloon, i * 400);
  }
  // Terus rilis balon berkala
  setInterval(createOneBalloon, 1500);
}


// --- LIGHTBOX FOTO KENANGAN POLAROID ---
document.querySelectorAll('.memory-photo img').forEach(function(img) {
  img.addEventListener('click', function() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const bigImg = document.createElement('img');
    bigImg.src = img.src;
    bigImg.alt = img.alt;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Tutup');
    closeBtn.textContent = '×';

    overlay.appendChild(bigImg);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    function closeLightbox() {
      overlay.remove();
    }

    overlay.addEventListener('click', closeLightbox);
    bigImg.addEventListener('click', function(e) { e.stopPropagation(); });
    closeBtn.addEventListener('click', closeLightbox);
  });
});