const boardSize = 4;
let board = [];
let score = 0;
const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");

document.getElementById("new-game").addEventListener("click", startGame);
document.getElementById("show-leaderboard").addEventListener("click", showLeaderboard);
document.getElementById("close-leaderboard").addEventListener("click", () => {
  document.getElementById("leaderboard").classList.add("hidden");
});
document.getElementById("share-score").addEventListener("click", shareScore);

function startGame() {
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  score = 0;
  scoreElement.textContent = score;
  addRandomTile();
  addRandomTile();
  renderBoard();
}

function addRandomTile() {
  let empty = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === 0) empty.push({ x: i, y: j });
    }
  }
  if (empty.length > 0) {
    let spot = empty[Math.floor(Math.random() * empty.length)];
    board[spot.x][spot.y] = Math.random() < 0.9 ? 2 : 4;
  }
}

function renderBoard() {
  boardElement.innerHTML = "";
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] !== 0) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.style.transform = `translate(${j * 90}px, ${i * 90}px)`;
        tile.textContent = board[i][j];
        tile.style.background = getTileColor(board[i][j]);
        boardElement.appendChild(tile);
      }
    }
  }
}

function getTileColor(value) {
  const colors = {
    2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
    16: "#f59563", 32: "#f67c5f", 64: "#f65e3b",
    128: "#edcf72", 256: "#edcc61", 512: "#edc850",
    1024: "#edc53f", 2048: "#edc22e"
  };
  return colors[value] || "#3c3a32";
}

function slide(row) {
  let arr = row.filter(val => val);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(val => val);
  while (arr.length < boardSize) arr.push(0);
  return arr;
}

function rotateLeft(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function move(direction) {
  let moved = false;
  for (let i = 0; i < direction; i++) board = rotateLeft(board);
  for (let i = 0; i < boardSize; i++) {
    let newRow = slide(board[i]);
    if (board[i].toString() !== newRow.toString()) moved = true;
    board[i] = newRow;
  }
  for (let i = direction; i < 4; i++) board = rotateLeft(board);
  if (moved) {
    addRandomTile();
    renderBoard();
    scoreElement.textContent = score;
    saveScore();
  }
}

// 🎮 Contrôles clavier
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move(0);
  if (e.key === "ArrowUp") move(1);
  if (e.key === "ArrowRight") move(2);
  if (e.key === "ArrowDown") move(3);
});

// 📱 Swipe mobile
let startX, startY;
boardElement.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
boardElement.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50) move(2);
    else if (dx < -50) move(0);
  } else {
    if (dy > 50) move(3);
    else if (dy < -50) move(1);
  }
});

// 🏆 Classement local
function saveScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push(score);
  scores = scores.sort((a, b) => b - a).slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

function showLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  let list = document.getElementById("leaderboard-list");
  list.innerHTML = "";
  scores.forEach(s => {
    let li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });
  document.getElementById("leaderboard").classList.remove("hidden");
}

// 📤 Partage du score
function shareScore() {
  const text = `J’ai fait ${score} sur 2048 Deluxe ! Viens jouer 👉 https://2048-nth.netlify.app/`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    alert(text);
  }
}

// ✨ Fond particules
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = Array.from({ length: 50 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 3 + 1,
  dx: (Math.random() - 0.5) * 2,
  dy: (Math.random() - 0.5) * 2
}));

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

startGame();
