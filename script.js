/* 2048 NTH — script.js (modes + partage + mobile + particules)
   - Modes: classic(4x4), infinite(4x4), hardcore(5x5)
   - Partage: "J’ai fais XXXX sur 2048 vien jouer ici : https://2048-nth.netlify.app/"
   - Mobile: swipe + blocage du scroll + vibration
   - Reconstruit le menu (WhatsApp en haut + boutons de modes)
   - Particules de fond (canvas ajouté si absent)
*/

(() => {
  // ---------- DOM helpers ----------
  const $ = (sel, ctx=document) => ctx.querySelector(sel);

  // ---------- Elements attendus (créés si absents) ----------
  function ensureBaseDOM() {
    // Canvas particules
    if (!$("#particles")) {
      const cv = document.createElement("canvas");
      cv.id = "particles";
      document.body.prepend(cv);
    }

    // Menu
    let menu = $("#menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.id = "menu";
      menu.className = "menu";
      document.body.appendChild(menu);
    }

    // Game container
    let game = $("#game-container");
    if (!game) {
      game = document.createElement("div");
      game.id = "game-container";
      game.className = "hidden";
      game.innerHTML = `
        <div class="top-bar">
          <div id="score">Score : 0</div>
          <div id="best-score">Best : 0</div>
        </div>
        <div id="grid" class="board"></div>
        <div class="bottom-bar">
          <button id="btn-restart">🔁 Rejouer</button>
          <button id="btn-share">📤 Partager</button>
          <button id="btn-menu">🏠 Menu</button>
        </div>
        <div id="game-over" class="hidden">
          <h2>💀 Game Over</h2>
          <button id="btn-share-over">📤 Partager</button>
          <button id="btn-retry-over">🔁 Rejouer</button>
        </div>
      `;
      document.body.appendChild(game);
    }

    // Reconstruire le contenu du menu avec WhatsApp AVANT les modes
    $("#menu").innerHTML = `
      <h1 class="title">2048 NTH</h1>
      <button id="btn-whatsapp" class="btn-whatsapp">
        💬 Rejoins notre groupe WhatsApp
      </button>
      <p>Choisis un mode</p>
      <div class="modes">
        <button class="mode" data-mode="classic">🎮 Classique (4×4)</button>
        <button class="mode" data-mode="infinite">♾️ Infini (4×4)</button>
        <button class="mode" data-mode="hardcore">🔥 Hardcore (5×5)</button>
      </div>
    `;
  }

  ensureBaseDOM();

  // ---------- Références ----------
  const particlesCanvas = $("#particles");
  const gridEl = $("#grid");
  const scoreEl = $("#score");
  const bestEl = $("#best-score");
  const gameWrap = $("#game-container");
  const menu = $("#menu");
  const gameOverEl = $("#game-over");
  const btnShare = $("#btn-share");
  const btnRestart = $("#btn-restart");
  const btnMenu = $("#btn-menu");
  const btnShareOver = $("#btn-share-over");
  const btnRetryOver = $("#btn-retry-over");
  const btnWhatsApp = $("#btn-whatsapp");

  // ---------- Etat du jeu ----------
  const STATE = {
    mode: "classic", // "classic" | "infinite" | "hardcore"
    size: 4,
    grid: [],
    score: 0,
    best: +localStorage.getItem("nth_best") || 0,
    playing: false,
  };

  // ---------- Utilitaires ----------
  function vibrate(ms=60){ if (navigator.vibrate) navigator.vibrate(ms); }
  function updateScoreUI(){
    scoreEl.textContent = "Score : " + STATE.score;
    if (STATE.score > STATE.best) {
      STATE.best = STATE.score;
      localStorage.setItem("nth_best", String(STATE.best));
    }
    bestEl.textContent = "Best : " + STATE.best;
  }
  function emptyCells(){
    const res=[];
    for(let r=0;r<STATE.size;r++) for(let c=0;c<STATE.size;c++)
      if (STATE.grid[r][c]===0) res.push({r,c});
    return res;
  }
  function addRandomTile(count=1){
    for(let k=0;k<count;k++){
      const free = emptyCells();
      if (!free.length) return;
      const spot = free[Math.floor(Math.random()*free.length)];
      STATE.grid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  // ---------- Rendu ----------
  function renderGrid(){
    // s'adapte au size (4 ou 5)
    gridEl.style.gridTemplateColumns = `repeat(${STATE.size}, 70px)`;
    gridEl.style.gridTemplateRows = `repeat(${STATE.size}, 70px)`;
    gridEl.innerHTML = "";
    for(let r=0;r<STATE.size;r++){
      for(let c=0;c<STATE.size;c++){
        const v = STATE.grid[r][c];
        const d = document.createElement("div");
        d.className = "tile" + (v ? ` tile-${v}` : "");
        d.textContent = v ? v : "";
        gridEl.appendChild(d);
      }
    }
  }

  // ---------- Déplacements ----------
  function slideRow(row){
    row = row.filter(v=>v);
    for(let i=0;i<row.length-1;i++){
      if (row[i]===row[i+1]){
        row[i] *= 2;
        STATE.score += row[i];
        row[i+1] = 0;
        vibrate(80);
      }
    }
    row = row.filter(v=>v);
    while(row.length<STATE.size) row.push(0);
    return row;
  }

  function move(dir){
    if (!STATE.playing) return;
    let moved = false;

    if (dir==="left"){
      for(let r=0;r<STATE.size;r++){
        const row = STATE.grid[r];
        const sl = slideRow(row);
        if (row.toString()!==sl.toString()) moved = true;
        STATE.grid[r] = sl;
      }
    } else if (dir==="right"){
      for(let r=0;r<STATE.size;r++){
        const row = [...STATE.grid[r]].reverse();
        const sl = slideRow(row).reverse();
        if (STATE.grid[r].toString()!==sl.toString()) moved = true;
        STATE.grid[r] = sl;
      }
    } else if (dir==="up" || dir==="down"){
      for(let c=0;c<STATE.size;c++){
        let col = STATE.grid.map(row=>row[c]);
        if (dir==="down") col.reverse();
        let sl = slideRow(col);
        if (dir==="down") sl.reverse();
        for(let r=0;r<STATE.size;r++){
          if (STATE.grid[r][c]!==sl[r]) moved = true;
          STATE.grid[r][c] = sl[r];
        }
      }
    }

    if (moved){
      // Hardcore = 2 tuiles, sinon 1
      addRandomTile(STATE.mode==="hardcore" ? 2 : 1);
      renderGrid();
      updateScoreUI();
      if (STATE.mode!=="infinite" && isGameOver()) showGameOver();
    }
  }

  function isGameOver(){
    // case vide ?
    for(let r=0;r<STATE.size;r++)
      for(let c=0;c<STATE.size;c++)
        if (STATE.grid[r][c]===0) return false;
    // fusion possible ?
    for(let r=0;r<STATE.size;r++)
      for(let c=0;c<STATE.size;c++){
        const v = STATE.grid[r][c];
        if (r+1<STATE.size && STATE.grid[r+1][c]===v) return false;
        if (c+1<STATE.size && STATE.grid[r][c+1]===v) return false;
      }
    return true;
  }

  // ---------- Lancement / Fin ----------
  function startGame(mode){
    STATE.mode = mode;
    STATE.size = (mode==="hardcore") ? 5 : 4;
    STATE.grid = Array.from({length:STATE.size},()=>Array(STATE.size).fill(0));
    STATE.score = 0;
    updateScoreUI();
    addRandomTile(2);
    renderGrid();
    gameOverEl.classList.add("hidden");
    menu.classList.add("hidden");
    gameWrap.classList.remove("hidden");
    STATE.playing = true;
  }

  function restartGame(){
    startGame(STATE.mode);
  }

  function backToMenu(){
    STATE.playing = false;
    gameWrap.classList.add("hidden");
    menu.classList.remove("hidden");
  }

  function showGameOver(){
    STATE.playing = false;
    gameOverEl.classList.remove("hidden");
  }

  // ---------- Partage ----------
  function shareScore(){
    const text = `J’ai fais ${STATE.score} sur 2048 vien jouer ici : https://2048-nth.netlify.app/`;
    if (navigator.share){
      navigator.share({ text }).catch(()=>{});
    } else {
      navigator.clipboard?.writeText(text).then(()=>{
        alert("📋 Texte copié ! Colle-le pour partager.");
      }).catch(()=>{
        alert(text);
      });
    }
  }

  // ---------- Écouteurs d’UI ----------
  // Modes (reconstruits dans le menu)
  menu.addEventListener("click",(e)=>{
    const btn = e.target.closest(".mode");
    if (!btn) return;
    const mode = btn.dataset.mode;
    startGame(mode);
  });

  // Boutons in-game (si présents)
  btnRestart && (btnRestart.onclick = restartGame);
  btnMenu && (btnMenu.onclick = backToMenu);
  btnShare && (btnShare.onclick = shareScore);
  btnShareOver && (btnShareOver.onclick = shareScore);
  btnRetryOver && (btnRetryOver.onclick = restartGame);

  // WhatsApp
  btnWhatsApp && (btnWhatsApp.onclick = ()=>{
    window.open("https://chat.whatsapp.com/JXDBM1ryE0bCfKq3pB6R4N?mode=ems_copy_c","_blank");
  });

  // ---------- Contrôles clavier ----------
  window.addEventListener("keydown",(e)=>{
    if (!STATE.playing) return;
    if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)){
      e.preventDefault();
      move(
        e.key==="ArrowLeft" ? "left" :
        e.key==="ArrowRight" ? "right" :
        e.key==="ArrowUp" ? "up" : "down"
      );
    }
  });

  // ---------- Swipe mobile (bloque le scroll dans la grille) ----------
  let start = null;
  ["touchstart","touchmove","touchend"].forEach(type=>{
    gridEl.addEventListener(type, (e)=>{
      e.preventDefault(); // bloque le scroll quand on swipe dans la grille
      if (!STATE.playing) return;
      const t = e.touches[0] || e.changedTouches?.[0];
      if (!t) return;
      if (type==="touchstart") {
        start = {x:t.clientX, y:t.clientY};
      } else if (type==="touchend" && start) {
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        const ax = Math.abs(dx), ay = Math.abs(dy);
        if (Math.max(ax,ay) < 14) return; // petit geste ignoré
        if (ax > ay) move(dx>0 ? "right" : "left");
        else move(dy>0 ? "down" : "up");
        start = null;
      }
    }, {passive:false});
  });

  // ---------- Particules de fond ----------
  const ctx = particlesCanvas.getContext("2d");
  function resizeCanvas(){
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const particles = Array.from({length:80}, ()=>({
    x: Math.random()*particlesCanvas.width,
    y: Math.random()*particlesCanvas.height,
    dx: (Math.random()-0.5)*0.5,
    dy: (Math.random()-0.5)*0.5,
    r: Math.random()*2 + 1
  }));

  function drawParticles(){
    ctx.clearRect(0,0,particlesCanvas.width,particlesCanvas.height);
    ctx.fillStyle = "rgba(150,0,255,0.7)";
    for (const p of particles){
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x<0 || p.x>particlesCanvas.width) p.dx *= -1;
      if (p.y<0 || p.y>particlesCanvas.height) p.dy *= -1;
    }
    requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // ---------- Fin : on reste sur le menu par défaut ----------
})();
