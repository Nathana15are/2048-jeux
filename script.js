const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const leaderboardElement = document.getElementById("leaderboard");
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");
const endScreen = document.getElementById("end-screen");
const endMessage = document.getElementById("end-message");

let size = 4;
let hardcore = false;
let grid = [];
let score = 0;
let best = localStorage.getItem("bestScore") || 0;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

bestElement.innerText = best;

function startGame(s, hard = false) {
  size = s === 0 ? 4 : s;
  hardcore = hard;
  menu.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  initGrid();
}

function initGrid() {
  grid = Array.from({ length: size }, () => Array(size).fill(0));
  score = 0;
  scoreElement.innerText = score;
  gridElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gridElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  addTile();
  addTile();
  render();
}

function addTile() {
  let empty = [];
  grid.forEach((row, r) => row.forEach((val, c) => {
    if (!val) empty.push({r, c});
  }));
  if (empty.length) {
    let {r, c} = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function render() {
  gridElement.innerHTML = "";
  grid.forEach(row => row.forEach(val => {
    let tile = document.createElement("div");
    tile.className = "tile";
    tile.innerText = val || "";
    tile.style.background = val ? getColor(val) : "rgba(255,255,255,0.05)";
    gridElement.appendChild(tile);
  }));
  scoreElement.innerText = score;
  bestElement.innerText = best;
  updateLeaderboard();
}

function getColor(val) {
  const colors = {
    2: "#7FFFD4", 4: "#00CED1", 8: "#1E90FF", 16: "#9370DB",
    32: "#FF69B4", 64: "#FF4500", 128: "#FFD700", 256: "#32CD32",
    512: "#8A2BE2", 1024: "#FF1493", 2048: "#00FF7F"
  };
  return colors[val] || "#333";
}

function move(dir) {
  let moved = false;
  let oldGrid = JSON.stringify(grid);

  for (let i = 0; i < size; i++) {
    let row = (dir === "left" || dir === "right") ? grid[i] : grid.map(r => r[i]);
    if (dir === "right" || dir === "down") row = row.reverse();
    let newRow = row.filter(v => v);
    for (let j = 0; j < newRow.length - 1; j++) {
      if (newRow[j] === newRow[j+1]) {
        newRow[j] *= 2;
        score += newRow[j];
        newRow.splice(j+1, 1);
      }
    }
    while (newRow.length < size) newRow.push(0);
    if (dir === "right" || dir === "down") newRow.reverse();
    if (dir === "left" || dir === "right") grid[i] = newRow;
    else newRow.forEach((val, r) => grid[r][i] = val);
  }

  if (JSON.stringify(grid) !== oldGrid) {
    moved = true;
    addTile();
    render();
  }

  if (hardcore && score < 0) gameOver();
  if (isGameOver()) gameOver();
}

function isGameOver() {
  return !grid.flat().includes(0) && !canMerge();
}

function canMerge() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === grid[r][c+1] || (grid[r+1] && grid[r][c] === grid[r+1][c])) return true;
    }
  }
  return false;
}

function gameOver() {
  gameContainer.classList.add("hidden");
  endScreen.classList.remove("hidden");
  endMessage.innerText = `Partie terminée ! Score : ${score}`;
  if (score > best) {
    best = score;
    localStorage.setItem("bestScore", best);
  }
  leaderboard.push(score);
  leaderboard.sort((a, b) => b - a);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  updateLeaderboard();
}

function updateLeaderboard() {
  leaderboardElement.innerHTML = leaderboard.map(s => `<li>${s}</li>`).join("");
}

function restart() {
  startGame(size, hardcore);
}

function backToMenu() {
  gameContainer.classList.add("hidden");
  endScreen.classList.add("hidden");
  menu.classList.remove("hidden");
}

function shareScore() {
  const text = `J'ai fait ${score} points sur 2048 Ultra Deluxe v3 ! 🔥`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    alert(text);
  }
}

// touches
document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
});

// swipe mobile
let startX, startY;
gridElement.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
gridElement.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50) move("right");
    else if (dx < -50) move("left");
  } else {
    if (dy > 50) move("down");
    else if (dy < -50) move("up");
  }
});

// particules
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = Array.from({length: 100}, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  dx: (Math.random() - 0.5) * 1,
  dy: (Math.random() - 0.5) * 1,
  size: Math.random() * 2 + 1
}));
function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
