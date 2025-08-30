let score = 0;
let likeCount = 0;

// Splash screen
window.onload = () => {
  const splash = document.getElementById('splash-screen');
  const menu = document.getElementById('menu');
  const sound = document.getElementById('splash-sound');
  sound.play();
  setTimeout(() => {
    splash.classList.add('hidden');
    menu.classList.remove('hidden');
  }, 2000);
};

// Likes fake global
const likeBtn = document.getElementById('like-btn');
const likeCountEl = document.getElementById('like-count');
likeBtn.addEventListener('click', () => {
  likeCount++;
  likeCountEl.textContent = likeCount;
});
setInterval(() => {
  likeCount += 2;
  likeCountEl.textContent = likeCount;
}, 10000);

// Game basics
function startGame(mode) {
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  score = 0;
  document.getElementById('score').textContent = 'Score : ' + score;
  createGrid(mode === 'hardcore' ? 5 : 4);
}

function createGrid(size) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${size}, 80px)`;
  for (let i = 0; i < size*size; i++) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    grid.appendChild(tile);

  }
}

function backToMenu() {
  document.getElementById('game').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');

  // === Swipe tactile optimisé ===
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
const minSwipeDistance = 30; // distance minimale pour valider un swipe

const gameContainer = document.getElementById("game-container"); // la div principale du jeu

gameContainer.addEventListener("touchstart", function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

gameContainer.addEventListener("touchend", function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, false);

function handleSwipe() {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        // swipe horizontal
        if (dx > 0) moveRight();
        else moveLeft();
    } else {
        // swipe vertical
        if (dy > 0) moveDown();
        else moveUp();
    }
}
