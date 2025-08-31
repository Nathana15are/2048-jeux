let gridSize = 4;
let grid = [];
let score = 0;

function startGame(size) {
  gridSize = size;
  document.querySelector(".menu").classList.add("hidden");
  document.getElementById("game-container").classList.remove("hidden");
  initGrid();
  drawGrid();
}
// Gestion du swipe tactile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}, false);

document.addEventListener("touchend", function (event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;

    handleSwipe();
}, false);

function handleSwipe() {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Swipe horizontal
        if (dx > 30) {
            move("right");
        } else if (dx < -30) {
            move("left");
        }
    } else {
        // Swipe vertical
        if (dy > 30) {
            move("down");
        } else if (dy < -30) {
            move("up");
        }
    }
}

function initGrid() {
  grid = Array.from({length: gridSize}, () => Array(gridSize).fill(0));
  addTile();
  addTile();
  score = 0;
  updateScore();
}

function addTile() {
  let empty = [];
  for (let i=0; i<gridSize; i++) {
    for (let j=0; j<gridSize; j++) {
      if (grid[i][j] === 0) empty.push({x:i,y:j});
    }
  }
  if (empty.length === 0) return;
  let {x,y} = empty[Math.floor(Math.random()*empty.length)];
  grid[x][y] = Math.random() > 0.1 ? 2 : 4;
}

function drawGrid() {
  const gridContainer = document.getElementById("grid");
  gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
  gridContainer.innerHTML = "";
  for (let i=0; i<gridSize; i++) {
    for (let j=0; j<gridSize; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      if (grid[i][j] !== 0) {
        tile.textContent = grid[i][j];
        tile.style.background = `hsl(${(Math.log2(grid[i][j])*40)%360},70%,50%)`;
      } else {
        tile.style.background = "rgba(255,255,255,0.1)";
      }
      gridContainer.appendChild(tile);
    }
  }
}

function updateScore() {
  document.getElementById("score").textContent = "Score: " + score;
}

function restartGame() {
  initGrid();
  drawGrid();
  document.getElementById("game-over").classList.add("hidden");
}

document.getElementById("shareBtn").addEventListener("click", () => {
  const text = `J’ai fais ${score} sur 2048 viens jouer ici : https://2048-nth.netlify.app/`;
  navigator.clipboard.writeText(text);
  alert("Texte copié pour partager !");
});

// Particules
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

for (let i=0; i<50; i++) {
  particles.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    vx: (Math.random()-0.5)*1,
    vy: (Math.random()-0.5)*1,
    r: Math.random()*3+1
  });
}
// Gestion du swipe tactile
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}, false);

document.addEventListener("touchend", function (event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;

    handleSwipe();
}, false);

function handleSwipe() {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Swipe horizontal
        if (dx > 30) {
            move("right");
        } else if (dx < -30) {
            move("left");
        }
    } else {
        // Swipe vertical
        if (dy > 30) {
            move("down");
        } else if (dy < -30) {
            move("up");
        }
    }
}

function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let p of particles) {
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = "rgba(0,150,255,0.7)";
    ctx.fill();
    p.x += p.vx;
    p.y += p.vy;
    if (p.x<0||p.x>canvas.width) p.vx*=-1;
    if (p.y<0||p.y>canvas.height) p.vy*=-1;
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();
