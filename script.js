let grid = [];
let score = 0;
let size = 4; // taille de la grille
let mode = "classique"; 

// --- Likes ---
let likeCount = 1539;
document.getElementById("likeCount").textContent = likeCount;
document.getElementById("likeBtn").addEventListener("click", () => {
  likeCount++;
  document.getElementById("likeCount").textContent = likeCount;
});

// --- Création de la grille ---
function initGame() {
  grid = [];
  score = 0;
  document.getElementById("score").textContent = score;

  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = 0;
    }
  }

  addRandomTile();
  addRandomTile();
  drawGrid();
}

// --- Ajouter une tuile aléatoire ---
function addRandomTile() {
  let emptyTiles = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === 0) emptyTiles.push({x: i, y: j});
    }
  }

  if (emptyTiles.length > 0) {
    let spot = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    grid[spot.x][spot.y] = Math.random() > 0.1 ? 2 : 4;
  }
}

// --- Affichage de la grille ---
function drawGrid() {
  let gridContainer = document.getElementById("grid");
  gridContainer.innerHTML = "";
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let tile = document.createElement("div");
      tile.className = "tile";
      if (grid[i][j] !== 0) tile.textContent = grid[i][j];
      gridContainer.appendChild(tile);
    }
  }
}

// --- Modes de jeu ---
function setMode(newMode) {
  mode = newMode;
  document.getElementById("modeTitle").textContent = "Mode " + newMode.charAt(0).toUpperCase() + newMode.slice(1);

  if (mode === "rapide") {
    size = 3; // grille plus petite
  } else if (mode === "difficile") {
    size = 5; // grille plus grande
  } else {
    size = 4; // classique
  }

  initGame();
}

// --- Reset ---
function resetGame() {
  initGame();
}

// --- Lancement ---
initGame();
