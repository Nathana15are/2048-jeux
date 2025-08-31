const gridSize = 4;
let grid = [];
let score = 0;

const gridContainer = document.getElementById("grid-container");
const scoreDisplay = document.getElementById("score");

// Création du fond (cases vides)
function initGrid() {
  gridContainer.innerHTML = "";
  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

  for (let i = 0; i < gridSize * gridSize; i++) {
    let cell = document.createElement("div");
    cell.classList.add("grid-cell");
    gridContainer.appendChild(cell);
  }

  addRandomTile();
  addRandomTile();
  updateGrid();
}

function addRandomTile() {
  let emptyCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }

  if (emptyCells.length > 0) {
    let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function updateGrid() {
  document.querySelectorAll(".tile").forEach(t => t.remove());

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] !== 0) {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        tile.textContent = grid[r][c];
        tile.style.background = getTileColor(grid[r][c]);
        setTilePosition(tile, r, c);
        gridContainer.appendChild(tile);
      }
    }
  }
  scoreDisplay.textContent = score;
}

function setTilePosition(tile, r, c) {
  const size = 100; // largeur case (85px + marge)
  tile.style.transform = `translate(${c * size}px, ${r * size}px)`;
}

function getTileColor(value) {
  switch (value) {
    case 2: return "#eee4da";
    case 4: return "#ede0c8";
    case 8: return "#f2b179";
    case 16: return "#f59563";
    case 32: return "#f67c5f";
    case 64: return "#f65e3b";
    case 128: return "#edcf72";
    case 256: return "#edcc61";
    case 512: return "#edc850";
    case 1024: return "#edc53f";
    case 2048: return "#edc22e";
    default: return "#3c3a32";
  }
}

function move(direction) {
  let moved = false;

  function slide(row) {
    row = row.filter(val => val);
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        row[i] *= 2;
        score += row[i];
        row[i + 1] = 0;
        moved = true;
      }
    }
    row = row.filter(val => val);
    while (row.length < gridSize) row.push(0);
    return row;
  }

  for (let r = 0; r < gridSize; r++) {
    let row = grid[r];
    if (direction === "left") {
      let newRow = slide(row);
      if (newRow.toString() !== row.toString()) moved = true;
      grid[r] = newRow;
    }
    if (direction === "right") {
      let newRow = slide(row.reverse()).reverse();
      if (newRow.toString() !== row.toString()) moved = true;
      grid[r] = newRow;
    }
  }

  if (direction === "up" || direction === "down") {
    for (let c = 0; c < gridSize; c++) {
      let col = grid.map(row => row[c]);
      if (direction === "up") {
        let newCol = slide(col);
        for (let r = 0; r < gridSize; r++) {
          if (grid[r][c] !== newCol[r]) moved = true;
          grid[r][c] = newCol[r];
        }
      }
      if (direction === "down") {
        let newCol = slide(col.reverse()).reverse();
        for (let r = 0; r < gridSize; r++) {
          if (grid[r][c] !== newCol[r]) moved = true;
          grid[r][c] = newCol[r];
        }
      }
    }
  }

  if (moved) {
    addRandomTile();
    updateGrid();
  }
}

function resetGame() {
  score = 0;
  initGrid();
}

// Contrôles clavier
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") move("left");
  if (e.key === "ArrowRight") move("right");
  if (e.key === "ArrowUp") move("up");
  if (e.key === "ArrowDown") move("down");
});

// Contrôles tactiles
let startX, startY;
gridContainer.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

gridContainer.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) move("right");
    else move("left");
  } else {
    if (dy > 0) move("down");
    else move("up");
  }
});

initGrid();
