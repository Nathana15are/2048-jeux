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
}