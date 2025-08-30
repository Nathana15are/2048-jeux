let score = 0;
let likeCount = 0;
let board = [];
let size = 4;
let infinite = false;

// --- Fake Like ---
const likeBtn = document.getElementById("likeBtn");
const likeCounter = document.getElementById("likeCount");

likeBtn.addEventListener("click", () => {
  likeCount++;
  likeCounter.textContent = likeCount;
});

// fake global : ajoute 2 toutes les 10 sec
setInterval(() => {
  likeCount += 2;
  likeCounter.textContent = likeCount;
}, 10000);

// --- GAME ---
function startGame(n, inf) {
  size = n;
  infinite = inf;
  score = 0;
  board = Array(size).fill().map(() => Array(size).fill(0));
  document.querySelector(".container").classList.add("hidden");
  document.getElementById("leaderboard").classList.add("hidden");
  document.getElementById("gameContainer").classList.remove("hidden");
  document.getElementById("grid").style.gridTemplateColumns = `repeat(${size}, 60px)`;
  document.getElementById("modeTitle").textContent = inf ? "Mode Infini" : (n === 5 ? "Mode Hardcore" : "Mode Classique");
  updateGrid();
  addTile(); addTile();
}

function addTile() {
  let empty = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (board[i][j] === 0) empty.push([i, j]);
    }
  }
  if (empty.length > 0) {
    let [x, y] = empty[Math.floor(Math.random() * empty.length)];
    board[x][y] = Math.random() < 0.9 ? 2 : 4;
  }
}

function updateGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  document.getElementById("score").textContent = "Score : " + score;
  board.forEach(row => {
    row.forEach(cell => {
      let div = document.createElement("div");
      div.classList.add("tile");
      if (cell > 0) div.textContent = cell;
      grid.appendChild(div);
    });
  });
}

// --- Déplacement (PC) ---
document.addEventListener("keydown", e => {
  let moved = false;
  if (e.key === "ArrowUp") moved = move(-1, 0);
  if (e.key === "ArrowDown") moved = move(1, 0);
  if (e.key === "ArrowLeft") moved = move(0, -1);
  if (e.key === "ArrowRight") moved = move(0, 1);
  if (moved) {
    addTile();
    updateGrid();
  }
});

// --- Déplacement (SWIPE MOBILE corrigé) ---
let startX, startY;
const gridEl = document.getElementById("grid");

gridEl.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: true });

gridEl.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50) move(0, 1); // droite
    if (dx < -50) move(0, -1); // gauche
  } else {
    if (dy > 50) move(1, 0); // bas
    if (dy < -50) move(-1, 0); // haut
  }
  updateGrid();
}, { passive: true });

function move(xDir, yDir) {
  let moved = false;
  for (let i = 0; i < size; i++) {
    let line = [];
    for (let j = 0; j < size; j++) {
      let val = xDir !== 0 ? board[j][i] : board[i][j];
      if (val !== 0) line.push(val);
    }
    if (xDir > 0 || yDir > 0) line.reverse();

    for (let k = 0; k < line.length - 1; k++) {
      if (line[k] === line[k + 1]) {
        line[k] *= 2;
        score += line[k];
        line.splice(k + 1, 1);
      }
    }

    while (line.length < size) line.push(0);
    if (xDir > 0 || yDir > 0) line.reverse();

    for (let j = 0; j < size; j++) {
      let val = xDir !== 0 ? board[j][i] : board[i][j];
      if ((xDir !== 0 && board[j][i] !== line[j]) || (xDir === 0 && board[i][j] !== line[j])) {
        moved = true;
      }
      if (xDir !== 0) board[j][i] = line[j];
      else board[i][j] = line[j];
    }
  }
  return moved;
}

// --- Leaderboard local ---
function showLeaderboard() {
  document.querySelector(".container").classList.add("hidden");
  document.getElementById("gameContainer").classList.add("hidden");
  document.getElementById("leaderboard").classList.remove("hidden");

  let scores = JSON.parse(localStorage.getItem("scores") || "[]");
  let list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  scores.sort((a, b) => b - a).slice(0, 10).forEach(s => {
    let li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });
}

function backToMenu() {
  if (score > 0) {
    let scores = JSON.parse(localStorage.getItem("scores") || "[]");
    scores.push(score);
    localStorage.setItem("scores", JSON.stringify(scores));
  }
  document.querySelector(".container").classList.remove("hidden");
  document.getElementById("gameContainer").classList.add("hidden");
  document.getElementById("leaderboard").classList.add("hidden");
}
