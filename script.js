let gridSize = 4;
let grid = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");

bestElement.textContent = bestScore;

function startGame(size) {
  gridSize = size;
  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  score = 0;
  scoreElement.textContent = score;

  createGrid();
  addRandomTile();
  addRandomTile();
}

function createGrid() {
  gridElement.innerHTML = "";
  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      updateTile(tile, grid[row][col]);
      gridElement.appendChild(tile);
    }
  }
}

function updateGrid() {
  const tiles = gridElement.querySelectorAll(".tile");
  let i = 0;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      updateTile(tiles[i], grid[row][col]);
      i++;
    }
  }
}

function updateTile(tile, value) {
  tile.textContent = value > 0 ? value : "";
  tile.className = "tile";
  if (value > 0) {
    tile.classList.add(`tile-${value}`);
  }
}

function addRandomTile() {
  let empty = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === 0) empty.push({ row, col });
    }
  }

  if (empty.length > 0) {
    const { row, col } = empty[Math.floor(Math.random() * empty.length)];
    grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    updateGrid();
  }
}

function slide(row) {
  row = row.filter(val => val);
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
    }
  }
  row = row.filter(val => val);
  while (row.length < gridSize) row.push(0);
  return row;
}

function moveLeft() {
  for (let r = 0; r < gridSize; r++) {
    grid[r] = slide(grid[r]);
  }
  addRandomTile();
  updateGrid();
  updateScore();
}

function moveRight() {
  for (let r = 0; r < gridSize; r++) {
    grid[r] = slide(grid[r].reverse()).reverse();
  }
  addRandomTile();
  updateGrid();
  updateScore();
}

function moveUp() {
  for (let c = 0; c < gridSize; c++) {
    let col = [];
    for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
    col = slide(col);
    for (let r = 0; r < gridSize; r++) grid[r][c] = col[r];
  }
  addRandomTile();
  updateGrid();
  updateScore();
}

function moveDown() {
  for (let c = 0; c < gridSize; c++) {
    let col = [];
    for (let r = 0; r < gridSize; r++) col.push(grid[r][c]);
    col = slide(col.reverse()).reverse();
    for (let r = 0; r < gridSize; r++) grid[r][c] = col[r];
  }
  addRandomTile();
  updateGrid();
  updateScore();
}

function updateScore() {
  scoreElement.textContent = score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    bestElement.textContent = bestScore;
  }
}

// Touch & Keyboard controls
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") moveLeft();
  if (e.key === "ArrowRight") moveRight();
  if (e.key === "ArrowUp") moveUp();
  if (e.key === "ArrowDown") moveDown();
});
document.addEventListener("touchmove", function(e) {
  e.preventDefault(); // bloque le scroll natif
}, { passive: false });

let startX, startY;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});
document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  let endY = e.changedTouches[0].clientY;
  let dx = endX - startX;
  let dy = endY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) moveRight();
    else moveLeft();
  } else {
    if (dy > 0) moveDown();
    else moveUp();
  }
});

// Share button
function shareScore() {
  let text = `J’ai fait ${score} sur 2048 NTH ! Viens jouer ici 👉 https://2048-nth.netlify.app/`;
  if (navigator.share) {
    navigator.share({
      title: "2048 NTH",
      text: text,
      url: "https://2048-nth.netlify.app/"
    });
  } else {
    alert(text);
  }
}

// Leaderboard (fake pour l’instant)
function showLeaderboard() {
  alert("🚀 Leaderboard bientôt disponible !");
}

// Start default
startGame(4);

// 🎇 Particules de fond
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "-1";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
for (let i = 0; i < 50; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    d: Math.random() * 1
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.beginPath();
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
  }
  ctx.fill();
  updateParticles();
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.y += p.d;
    if (p.y > canvas.height) {
      particles[i] = {
        x: Math.random() * canvas.width,
        y: 0,
        r: p.r,
        d: p.d
      };
    }
  }
}

setInterval(drawParticles, 30);
