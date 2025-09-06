/* ===== Palīgfunkcijas ===== */
function setVHVar(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
function isTouch(){ return window.matchMedia('(pointer:coarse)').matches; }
function show(el){ el?.classList.remove('hidden'); }
function hide(el){ el?.classList.add('hidden'); }

/* ===== Canvas (vizuāls tīklojums) ===== */
function initCanvas(){
  const c = document.getElementById('mapCanvas');
  const ctx = c.getContext('2d');
  function resize(){
    // fiksēts 16:9 buferis skaidram mērogam
    const target = { w:1920, h:1080 };
    c.width = target.w; c.height = target.h;

    // CSS izmērs mērogots līdz logam
    const w = window.innerWidth, h = window.innerHeight;
    const scale = Math.min(w/target.w, h/target.h);
    c.style.width  = Math.round(target.w*scale) + 'px';
    c.style.height = Math.round(target.h*scale) + 'px';

    draw();
  }
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.strokeStyle = 'rgba(255,255,255,.06)';

    for(let x=0;x<c.width;x+=80){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,c.height); ctx.stroke();
    }
    for(let y=0;y<c.height;y+=80){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(c.width,y); ctx.stroke();
    }
  }
  window.addEventListener('resize', resize);
  resize();
}

/* ===== Leaflet online karte ===== */
let map;
function initOnlineMap(){
  const el = document.getElementById('onlineMap');
  if (!el || typeof L === 'undefined') return;
  map = L.map(el, { zoomControl: false }).setView([56.9496, 24.1052], 12); // Rīga
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }).addTo(map);
}
function toggleOnlineMap(show){
  const el = document.getElementById('onlineMap');
  const dim = document.getElementById('onlineMapDim');
  if (!el || !dim) return;
  if (show){
    el.hidden = false;
    dim.style.display = 'block';
    setTimeout(()=> map?.invalidateSize(), 50);
  }else{
    el.hidden = true;
    dim.style.display = 'none';
  }
}
function setOnlineMapDim(opacity01){
  const dim = document.getElementById('onlineMapDim');
  if (dim) dim.style.background = `rgba(0,0,0,${Math.max(0,Math.min(1,opacity01))})`;
}

/* ===== Kompass (SVG ģenerēšana) ===== */
let compassAngle = 0; // grādi
function initCompass(){
  const g = document.getElementById('compassScaleGroup');
  if (!g) return;
  const cx = 150, cy = 150, rOuter = 120, rInnerMajor = 96, rInnerMinor = 108;

  // Ticks ik pa 5°
  for(let deg=0; deg<360; deg+=5){
    const rad = deg * Math.PI/180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const isCardinal = (deg % 90 === 0);
    const isTen = (deg % 10 === 0);

    const r1 = isTen ? rInnerMajor : rInnerMinor;
    const x1 = cx + r1 * cos;
    const y1 = cy + r1 * sin;
    const x2 = cx + rOuter * cos;
    const y2 = cy + rOuter * sin;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('class', isTen ? 'tick-major' : 'tick-minor');
    g.appendChild(line);

    // Kardinālie virzieni ar marķējumu
    if (isCardinal){
      const lblR = 80;
      const lx = cx + lblR * cos;
      const ly = cy + lblR * sin;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lx);
      text.setAttribute('y', ly);
      text.setAttribute('class', 'label');

      const name = (deg===0?'E':deg===90?'S':deg===180?'W':'N'); // SVG 0° ir uz labo pusi
      text.textContent = name;
      g.appendChild(text);
    }
  }
}
function rotateCompassBy(deg){
  compassAngle = (compassAngle + deg) % 360;
  const grp = document.getElementById('compassScaleGroup');
  if (grp){
    grp.setAttribute('transform', `rotate(${compassAngle},150,150)`);
  }
}

/* ===== Pilnekrāns ===== */
function toggleFullscreen(){
  if (!document.fullscreenElement){
    document.documentElement.requestFullscreen?.();
  }else{
    document.exitFullscreen?.();
  }
}

/* ===== Mobilā orientācija ===== */
function setupOrientationOverlay(){
  const over = document.getElementById('orientationOverlay');
  const check = () => {
    if (!isTouch()){ hide(over); return; }
    const landscape = window.innerWidth > window.innerHeight;
    landscape ? hide(over) : show(over);
  };
  check();
  window.addEventListener('resize', check);
  window.addEventListener('orientationchange', check);
}

/* ===== Notikumi un inicializācija ===== */
window.addEventListener('DOMContentLoaded', () => {
  setVHVar();
  window.addEventListener('resize', setVHVar);

  initCanvas();
  initOnlineMap();
  initCompass();
  setupOrientationOverlay();

  // Pogas
  const btnMap = document.getElementById('toggleOnlineMap');
  const btnRot = document.getElementById('rotateCompass90');
  const btnFS  = document.getElementById('toggleFullscreen');
  const range  = document.getElementById('opacityRange');

  let mapOn = false;
  btnMap?.addEventListener('click', () => {
    mapOn = !mapOn;
    toggleOnlineMap(mapOn);
    btnMap.setAttribute('aria-pressed', String(mapOn));
  });

  btnRot?.addEventListener('click', () => rotateCompassBy(90));
  btnFS?.addEventListener('click', toggleFullscreen);

  range?.addEventListener('input', (e) => {
    const v = Number(e.target.value);
    setOnlineMapDim(v/100);
  });

  // Papildus: parādi pilnekrāna ieteikumu 1x (pēc 2s), tikai lieliem ekrāniem
  const hint = document.getElementById('fullscreenHint');
  if (window.innerWidth >= 1024){
    setTimeout(()=> { show(hint); setTimeout(()=> hide(hint), 2500); }, 1200);
  }
});
