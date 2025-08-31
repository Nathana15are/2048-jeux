let board = [];
let size = 4;
let score = 0;

function startGame(n) {
  size = n;
  score = 0;
  document.getElementById("score").innerText = "Score: 0";
  board = Array.from({length: size}, () => Array(size).fill(0));
  addNumber();
  addNumber();
  drawBoard();
}

function addNumber() {
  let empty = [];
  for (let i=0; i<size; i++) {
    for (let j=0; j<size; j++) {
      if (board[i][j] === 0) empty.push([i,j]);
    }
  }
  if (empty.length) {
    let [x,y] = empty[Math.floor(Math.random()*empty.length)];
    board[x][y] = Math.random() > 0.1 ? 2 : 4;
  }
}

function drawBoard() {
  const container = document.getElementById("board");
  container.style.gridTemplateColumns = `repeat(${size}, 80px)`;
  container.style.gridTemplateRows = `repeat(${size}, 80px)`;
  container.innerHTML = "";
  for (let i=0; i<size; i++) {
    for (let j=0; j<size; j++) {
      const val = board[i][j];
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.innerText = val ? val : "";
      tile.style.background = val ? `hsl(${(Math.log2(val)*40)%360},80%,50%)` : "rgba(255,255,255,0.1)";
      container.appendChild(tile);
    }
  }
  document.getElementById("score").innerText = "Score: " + score;
}

function slide(row) {
  row = row.filter(v => v);
  for (let i=0; i<row.length-1; i++) {
    if (row[i] === row[i+1]) {
      row[i] *= 2;
      score += row[i];
      row[i+1] = 0;
    }
  }
  row = row.filter(v => v);
  while (row.length < size) row.push(0);
  return row;
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function move(dir) {
  if (dir === "up") { board = rotate(board); }
  if (dir === "down") { board = rotate(board); board = rotate(board); board = rotate(board); }
  if (dir === "right") { board = board.map(r => r.reverse()); }
  
  board = board.map(r => slide(r));
  
  if (dir === "right") { board = board.map(r => r.reverse()); }
  if (dir === "up") { board = rotate(board); board = rotate(board); board = rotate(board); }
  if (dir === "down") { board = rotate(board); }
  
  addNumber();
  drawBoard();
  checkGameOver();
}

function checkGameOver() {
  for (let i=0; i<size; i++) {
    for (let j=0; j<size; j++) {
      if (board[i][j] === 0) return;
      if (j<size-1 && board[i][j]===board[i][j+1]) return;
      if (i<size-1 && board[i][j]===board[i+1][j]) return;
    }
  }
  document.getElementById("gameover").style.display = "block";
  saveScore();
}

function restart() {
  document.getElementById("gameover").style.display = "none";
  startGame(size);
}

document.addEventListener("keydown", e => {
  if (e.key==="ArrowLeft") move("left");
  if (e.key==="ArrowRight") move("right");
  if (e.key==="ArrowUp") move("up");
  if (e.key==="ArrowDown") move("down");
});

// Swipe mobile
let startX, startY;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, {passive:false});

document.addEventListener("touchend", e => {
  let dx = e.changedTouches[0].clientX - startX;
  let dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50) move("right");
    else if (dx < -50) move("left");
  } else {
    if (dy > 50) move("down");
    else if (dy < -50) move("up");
  }
}, {passive:false});

// Leaderboard
function saveScore() {
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.push(score);
  scores.sort((a,b)=>b-a);
  localStorage.setItem("scores", JSON.stringify(scores.slice(0,10)));
}

function openLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");
  let list = document.getElementById("scoresList");
  list.innerHTML = scores.map(s => `<li>${s}</li>`).join("");
  document.getElementById("leaderboard").style.display = "block";
}

function closeLeaderboard() {
  document.getElementById("leaderboard").style.display = "none";
}

// Partage
function shareScore() {
  const text = `J’ai fais ${score} sur 2048 viens jouer ici : https://2048-nth.netlify.app/`;
  if (navigator.share) {
    navigator.share({ text });
  } else {
    navigator.clipboard.writeText(text);
    alert("Texte copié !");
  }
}

// Particules
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = Array.from({length:100}, ()=> ({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  r: Math.random()*3,
  dx: (Math.random()-0.5)*1,
  dy: (Math.random()-0.5)*1
}));

function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
    p.x+=p.dx; p.y+=p.dy;
    if (p.x<0||p.x>canvas.width) p.dx*=-1;
    if (p.y<0||p.y>canvas.height) p.dy*=-1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();
