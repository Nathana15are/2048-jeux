const board = document.getElementById("game-board");
const scoreEl = document.getElementById("score");
const gameOverEl = document.getElementById("game-over");
const retryBtn = document.getElementById("retry");
const newGameBtn = document.getElementById("newGame");
const shareBtn = document.getElementById("share");
const whatsappBtn = document.getElementById("whatsapp");

let size = 4;
let grid = [];
let score = 0;

// --- Initialisation
function initGame() {
  grid = Array(size).fill().map(()=>Array(size).fill(0));
  score = 0;
  updateScore();
  addTile();
  addTile();
  renderBoard();
  gameOverEl.classList.add("hidden");
}

function addTile() {
  let empty = [];
  for (let r=0;r<size;r++) {
    for (let c=0;c<size;c++) {
      if (grid[r][c] === 0) empty.push({r,c});
    }
  }
  if (empty.length > 0) {
    let {r,c} = empty[Math.floor(Math.random()*empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function renderBoard() {
  board.innerHTML = "";
  grid.forEach((row,r) => {
    row.forEach((val,c) => {
      let cell = document.createElement("div");
      cell.classList.add("tile");
      if (val !== 0) cell.textContent = val;
      board.appendChild(cell);
    });
  });
}

function updateScore() {
  scoreEl.textContent = "Score : " + score;
}

function vibrate(ms=50) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

// --- Déplacement
function move(direction) {
  let moved = false;

  function slide(row) {
    row = row.filter(val => val);
    for (let i=0;i<row.length-1;i++) {
      if (row[i] === row[i+1]) {
        row[i] *= 2;
        score += row[i];
        row[i+1] = 0;
        vibrate(80);
        moved = true;
      }
    }
    row = row.filter(val => val);
    while (row.length < size) row.push(0);
    return row;
  }

  for (let r=0;r<size;r++) {
    let row;
    if (direction === "left") {
      row = slide(grid[r]);
      if (grid[r].toString() !== row.toString()) moved = true;
      grid[r] = row;
    } else if (direction === "right") {
      row = slide(grid[r].slice().reverse()).reverse();
      if (grid[r].toString() !== row.toString()) moved = true;
      grid[r] = row;
    }
  }

  if (direction === "up" || direction === "down") {
    for (let c=0;c<size;c++) {
      let col = grid.map(row=>row[c]);
      if (direction === "down") col.reverse();
      let newCol = slide(col);
      if (direction === "down") newCol.reverse();
      for (let r=0;r<size;r++) {
        if (grid[r][c] !== newCol[r]) moved = true;
        grid[r][c] = newCol[r];
      }
    }
  }

  if (moved) {
    addTile();
    renderBoard();
    updateScore();
    if (isGameOver()) showGameOver();
  }
}

function isGameOver() {
  for (let r=0;r<size;r++) {
    for (let c=0;c<size;c++) {
      if (grid[r][c] === 0) return false;
      if (c < size-1 && grid[r][c] === grid[r][c+1]) return false;
      if (r < size-1 && grid[r][c] === grid[r+1][c]) return false;
    }
  }
  return true;
}

function showGameOver() {
  gameOverEl.classList.remove("hidden");
}

// --- Touch mobile
let startX, startY;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, {passive:true});

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
}, {passive:true});

// --- Events
retryBtn.onclick = initGame;
newGameBtn.onclick = initGame;
shareBtn.onclick = () => {
  navigator.share
    ? navigator.share({title:"2048 NTH", url:"https://2048-nth.netlify.app/"})
    : alert("Partage ce lien : https://2048-nth.netlify.app/");
};
whatsappBtn.onclick = () => {
  window.open("https://chat.whatsapp.com/JXDBM1ryE0bCfKq3pB6R4N?mode=ems_copy_c", "_blank");
};

// --- Particules
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
for (let i=0;i<80;i++) {
  particles.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    dx: (Math.random()-0.5)*0.5,
    dy: (Math.random()-0.5)*0.5,
    r: Math.random()*2+1
  });
}

function drawParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "rgba(150,0,255,0.7)";
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x<0||p.x>canvas.width) p.dx*=-1;
    if (p.y<0||p.y>canvas.height) p.dy*=-1;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

window.addEventListener("resize",()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

initGame();
