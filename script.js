let gridSize = 4;
let infiniteMode = false;
let grid = [];
let score = 0;

function startGame(size, infinite) {
  gridSize = size;
  infiniteMode = infinite;
  score = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("menu").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.getElementById("game-over").classList.add("hidden");
  initGrid();
}

function initGrid() {
  grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
  addTile();
  addTile();
  renderGrid();
}

function renderGrid() {
  const gridContainer = document.getElementById("grid-container");
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 70px)`;
  gridContainer.innerHTML = "";

  grid.forEach(row => {
    row.forEach(value => {
      const tile = document.createElement("div");
      tile.className = "tile";
      if (value > 0) {
        tile.textContent = value;
        tile.style.background = getTileColor(value);
      } else {
        tile.style.background = "rgba(255,255,255,0.05)";
      }
      gridContainer.appendChild(tile);
    });
  });
}

function getTileColor(value) {
  const colors = {
    2: "#00ffff", 4: "#00ff88", 8: "#aaff00",
    16: "#ffcc00", 32: "#ff8800", 64: "#ff0044",
    128: "#ff00cc", 256: "#aa00ff", 512: "#5500ff",
    1024: "#00aaff", 2048: "#00ffcc"
  };
  return colors[value] || "#ffffff";
}

function addTile() {
  const empty = [];
  grid.forEach((row, r) => row.forEach((v, c) => { if (!v) empty.push([r,c]); }));
  if (empty.length) {
    const [r,c] = empty[Math.floor(Math.random()*empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function move(direction) {
  let moved = false;
  let merged = Array(gridSize).fill().map(()=>Array(gridSize).fill(false));

  function slide(row) {
    let arr = row.filter(v=>v);
    for (let i=0; i<arr.length-1; i++) {
      if (arr[i]===arr[i+1] && !merged[i]) {
        arr[i]*=2;
        score+=arr[i];
        arr.splice(i+1,1);
      }
    }
    while (arr.length<gridSize) arr.push(0);
    return arr;
  }

  for (let r=0; r<gridSize; r++) {
    let row;
    if (direction==="left") {
      row = slide(grid[r]);
      if (row.toString()!==grid[r].toString()) moved=true;
      grid[r]=row;
    }
    if (direction==="right") {
      row = slide([...grid[r]].reverse()).reverse();
      if (row.toString()!==grid[r].toString()) moved=true;
      grid[r]=row;
    }
  }

  for (let c=0; c<gridSize; c++) {
    let col = grid.map(r=>r[c]);
    if (direction==="up") {
      let newCol = slide(col);
      if (newCol.toString()!==col.toString()) moved=true;
      for (let r=0;r<gridSize;r++) grid[r][c]=newCol[r];
    }
    if (direction==="down") {
      let newCol = slide(col.reverse()).reverse();
      if (newCol.toString()!==col.toString()) moved=true;
      for (let r=0;r<gridSize;r++) grid[r][c]=newCol[r];
    }
  }

  if (moved) {
    addTile();
    document.getElementById("score").textContent = score;
    renderGrid();
    if (isGameOver()) showGameOver();
  }
}

function isGameOver() {
  for (let r=0;r<gridSize;r++) {
    for (let c=0;c<gridSize;c++) {
      if (!grid[r][c]) return false;
      if (r<gridSize-1 && grid[r][c]===grid[r+1][c]) return false;
      if (c<gridSize-1 && grid[r][c]===grid[r][c+1]) return false;
    }
  }
  return true;
}

function showGameOver() {
  document.getElementById("final-score").textContent = "Partie terminée ! Score : " + score;
  document.getElementById("game-over").classList.remove("hidden");
}

function restartGame() {
  startGame(gridSize, infiniteMode);
}

function returnToMenu() {
  document.getElementById("menu").style.display = "block";
  document.getElementById("game-container").style.display = "none";
}

function shareScore() {
  const text = `J'ai fait ${score} points sur 2048 Ultra Deluxe ⚡ ! Viens jouer ici 👉 https://2048-nth.netlify.app/`;
  if (navigator.share) {
    navigator.share({title:"2048 Ultra Deluxe", text, url:"https://2048-nth.netlify.app/"});
  } else {
    navigator.clipboard.writeText(text);
    alert("Score copié ! Partage-le à tes amis 😉");
  }
}

document.addEventListener("keydown", e=>{
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
    e.preventDefault();
    move(e.key.replace("Arrow","").toLowerCase());
  }
});

// Mobile swipe
let startX, startY;
document.addEventListener("touchstart", e=>{
  startX=e.touches[0].clientX;
  startY=e.touches[0].clientY;
});
document.addEventListener("touchend", e=>{
  let dx=e.changedTouches[0].clientX-startX;
  let dy=e.changedTouches[0].clientY-startY;
  if (Math.abs(dx)>Math.abs(dy)) move(dx>0?"right":"left");
  else move(dy>0?"down":"up");
});
