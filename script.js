let gridSize = 4;
let grid = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

function startGame(mode) {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");

  gridSize = (mode === "hardcore") ? 5 : 4;
  resetGame();
}

function resetGame() {
  score = 0;
  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  addTile();
  addTile();
  updateGrid();
  document.getElementById("score").innerText = "Score : " + score;
  document.getElementById("best-score").innerText = "Best : " + bestScore;
  document.getElementById("game-over").classList.add("hidden");
}

function addTile() {
  let emptyCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 0) emptyCells.push({r, c});
    }
  }
  if (emptyCells.length > 0) {
    let {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function updateGrid() {
  const gridElement = document.getElementById("grid");
  gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 70px)`;
  gridElement.innerHTML = "";

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const value = grid[r][c];
      const cell = document.createElement("div");
      cell.className = "tile" + (value ? " tile-" + value : "");
      cell.innerText = value || "";
      gridElement.appendChild(cell);
    }
  }
}

function move(direction) {
  let moved = false;

  function slide(row) {
    row = row.filter(v => v);
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        row[i] *= 2;
        score += row[i];
        row.splice(i + 1, 1);
      }
    }
    while (row.length < gridSize) row.push(0);
    return row;
  }

  if (direction === "left") {
    for (let r = 0; r < gridSize; r++) {
      let newRow = slide(grid[r]);
      if (grid[r].toString() !== newRow.toString()) moved = true;
      grid[r] = newRow;
    }
  } else if (direction === "right") {
    for (let r = 0; r < gridSize; r++) {
      let row = grid[r].slice().reverse();
      row = slide(row).reverse();
      if (grid[r].toString() !== row.toString()) moved = true;
      grid[r] = row;
    }
  } else if (direction === "up") {
    for (let c = 0; c < gridSize; c++) {
      let col = grid.map(row => row[c]);
      let newCol = slide(col);
      for (let r = 0; r < gridSize; r++) {
        if (grid[r][c] !== newCol[r]) moved = true;
        grid[r][c] = newCol[r];
      }
    }
  } else if (direction === "down") {
    for (let c = 0; c < gridSize; c++) {
      let col = grid.map(row => row[c]).reverse();
      col = slide(col).reverse();
      for (let r = 0; r < gridSize; r++) {
        if (grid[r][c] !== col[r]) moved = true;
        grid[r][c] = col[r];
      }
    }
  }

  if (moved) {
    addTile();
    updateGrid();
    updateScore();
    if (isGameOver()) showGameOver();
  }
}

function updateScore() {
  document.getElementById("score").innerText = "Score : " + score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }
  document.getElementById("best-score").innerText = "Best : " + bestScore;
}

function isGameOver() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 0) return false;
      if (c < gridSize-1 && grid[r][c] === grid[r][c+1]) return false;
      if (r < gridSize-1 && grid[r][c] === grid[r+1][c]) return false;
    }
  }
  return true;
}

function showGameOver() {
  document.getElementById("game-over").classList.remove("hidden");
}

function restartGame() {
  resetGame();
}

function backToMenu() {
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("game-container").classList.add("hidden");
}

function shareScore() {
  const url = "https://2048-nth.netlify.app/";
  navigator.clipboard.writeText(`J'ai fait ${score} points sur 2048 Ultra Deluxe ! 🏆 Viens jouer ici : ${url}`);
  alert("📋 Score copié ! Colle-le pour le partager.");
}

// 🔹 Contrôles clavier
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

// 🔹 Swipe mobile
let startX, startY;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: false });

document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

document.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move("right");
    else if (dx < -30) move("left");
  } else {
    if (dy > 30) move("down");
    else if (dy < -30) move("up");
  }
});
