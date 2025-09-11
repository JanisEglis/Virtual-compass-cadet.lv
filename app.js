console.info('[modern] app.js start');



// RAF/CAF
window.requestAnimationFrame = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || function(cb){ return setTimeout(cb, 16); };

window.cancelAnimationFrame = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || clearTimeout;

// Idle
window.requestIdleCallback ||= (cb, o={}) => setTimeout(cb, o.timeout || 1);
window.cancelIdleCallback  ||= (id) => clearTimeout(id);














(function(){
  const pre = document.getElementById('app-preloader');
  if(!pre) return;

  document.body.classList.add('preloading');

  const bar = pre.querySelector('.progress > span');
  const msg = pre.querySelector('.msg');
  const skipBtn = pre.querySelector('#preloaderSkip');

  let total = 1; // vismaz loga "load"
  let done  = 0;
  let closed = false;

  const tick = (why) => {
    done = Math.min(done + 1, total);
    const pct = Math.max(0, Math.min(100, Math.round((done/total)*100)));
    if (bar) bar.style.width = pct + '%';
    if (msg) msg.textContent = `Ielādējam… ${pct}%`;
  };

  // === DROŠĀKA bildeņu savākšana (ignorē tukšu src) ===
  const imgSet = new Set();
  [
    '#compassContainer img',
    '#buttonContainer img',
    '#fullscreenMessage img',
    '.warning-content img',
    '#qrCodeImage',
    '#uploadedImg',
    '#newUploadedImg',
    '#resizeHandle img'
  ].forEach(sel => {
    document.querySelectorAll(sel).forEach(img => {
      const raw = img.getAttribute('src');           // ← nevis img.src
      if (raw && raw.trim() !== '') imgSet.add(img); // ignorē tukšos
    });
  });

  const imgPromises = Array.from(imgSet).map(imgEl => new Promise(res=>{
    if (imgEl.complete && imgEl.naturalWidth > 0) { res('cached'); return; }
    imgEl.addEventListener('load',  () => res('load'),  {once:true});
    imgEl.addEventListener('error', () => res('error'), {once:true});
  }).then(tick));
  total += imgPromises.length;

  // (ja izmanto tiešsaistes karti startā – tikai progressam; nekad nebloķē finish)
  (function watchTilesIfNeeded(){
    try{
      if(localStorage.getItem('onlineMapActive') !== '1') return;
      const host = document.getElementById('onlineMap');
      if(!host) return;
      let target = 8, seen = 0;
      total += target;
      const onTile = ()=>{ if(seen < target){ seen++; tick('tile'); } };
      const obs = new MutationObserver(recs=>{
        recs.forEach(r=>{
          r.addedNodes.forEach(n=>{
            if(n && n.tagName === 'IMG' && n.classList.contains('leaflet-tile')){
              n.addEventListener('load', onTile, {once:true});
              n.addEventListener('error', onTile, {once:true});
            }
          });
        });
      });
      obs.observe(host, {subtree:true, childList:true});
      setTimeout(()=>obs.disconnect(), 4000);
    }catch(e){}
  })();

  // “window load” — ķer arī gadījumu, ja tas jau ir noticis
  const pageLoaded = new Promise(res => {
    if (document.readyState === 'complete') { tick('win-complete'); res(); }
    else window.addEventListener('load', () => { tick('win-load'); res(); }, {once:true});
  });

// Poga “Turpināt” un cietais timeouts
const showSkip = setTimeout(() => pre && pre.classList.add('show-skip'), 6000);
const hardCut  = setTimeout(() => finish('hard-timeout'), 8000);
if (skipBtn) skipBtn.addEventListener('click', () => finish('skip'), { once: true });

// drošs "allSettled" arī bez native atbalsta (neliekam polyfillu vēlāk)
var allSettled = Promise.allSettled
  ? function(promises){ return Promise.allSettled(promises); }
  : function(promises){
      return Promise.all(promises.map(function(p){
        return Promise.resolve(p).then(
          function(value){  return { status: 'fulfilled', value:  value }; },
          function(reason){ return { status: 'rejected',  reason: reason }; }
        );
      }));
    };

Promise.all([ pageLoaded, allSettled(imgPromises) ])
  .then(() => new Promise(r => setTimeout(r, 300)))
  .then(() => finish('ready'));




  function finish(reason){
    if (closed) return;
    closed = true;
    clearTimeout(showSkip); clearTimeout(hardCut);
    pre.classList.add('hidden');
    document.body.classList.remove('preloading');
    // debug, ja vajag:
    console.debug('[preloader] finish:', reason, {done, total});
    setTimeout(()=> pre.remove(), 480);
  }
})();







function debounce(func, wait = 50) {
						  let timeout;
						  return function (...args) {
						    clearTimeout(timeout);
						    timeout = setTimeout(() => func.apply(this, args), wait);
						  };
						}


// — Drošie selektori un notikumu piesaiste —
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const byId = (id) => document.getElementById(id);
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);




						// Izmanto vizuālo viewport (adreses joslas “elpošana”)
						function updateViewportHeight() {
						  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
						  document.documentElement.style.setProperty('--vh', (h * 0.01) + 'px');
						}
						
						// Arī loga izmēra pārbaude laiž caur vizuālo viewport
						function checkWindowSize() {
						  const fullscreenMessage = document.getElementById('fullscreenMessage');
						  const w = window.innerWidth;
						  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
						
						  if (w >= 1024 && h >= 700) {
						    fullscreenMessage.classList.add('hidden');
						  } else {
						    fullscreenMessage.classList.remove('hidden');
						  }
						}
						
						function handleResize() {
						  updateViewportHeight();
						  checkWindowSize();
						  // pārrēķini doku uzreiz (lai nepārklājas ar #about)
						  window.__fitDock && window.__fitDock();
						}
						
						// Sākotnējais un klasiskie notikumi
						window.addEventListener('load', handleResize);
						window.addEventListener('resize', debounce(handleResize, 50));
						window.addEventListener('orientationchange', handleResize);
						
						// Papildu notikumi, kas reaģē uz adreses joslas parādīšanos/paslēpšanos
						if (window.visualViewport) {
						  window.visualViewport.addEventListener('resize', debounce(handleResize, 50));
						  window.visualViewport.addEventListener('scroll', debounce(handleResize, 50));
						}


                        // Dinamiskās pogas konfigurācija: katrai pogai sākuma un alternatīvie attēli
						const buttonImageMap = {
							"toggleRotationMode": {
								defaultSrc: "https://site-710050.mozfiles.com/files/710050/ROTATE_COMPASS_BASE__1__Cropped-Photoroom.png",
								alternateSrc: "https://site-710050.mozfiles.com/files/710050/SCALE_ROTATE__1__Cropped-Photoroom.png"
							},
							"lockRotationMode": {
								defaultSrc: "https://site-710050.mozfiles.com/files/710050/COMPASS_ROTATE_LOCK_OPEN__1__Cropped-Photoroom.png",
								alternateSrc: "https://site-710050.mozfiles.com/files/710050/COMPASS_ROTATE_LOCK__1__Cropped-Photoroom.png"
							}
						};



						// Funkcija, kas maina attēlus uz pogām
function toggleButtonImage(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  const img = button.querySelector('img');
  const config = buttonImageMap[buttonId];
  if (!img || !config) return;

  const cur = img.getAttribute('src'); // salīdzinām ar oriģinālo atributu
  img.setAttribute('src', cur === config.defaultSrc ? config.alternateSrc : config.defaultSrc);
}


						// Pievienojam notikumus pogām
var _tgl = document.getElementById('toggleRotationMode');
if (_tgl) _tgl.addEventListener('click', function(){ toggleButtonImage('toggleRotationMode'); });

var _lck = document.getElementById('lockRotationMode');
if (_lck) _lck.addEventListener('click', function(){ toggleButtonImage('lockRotationMode'); });



						(function() {
							let previousTouchPoints = navigator.maxTouchPoints;

							/**
							 * Funkcija, kas pārbauda, vai ir pievienota vai atvienota skārienjūtīgā ierīce.
							 * Parāda ziņojumu un aktivizē pogas ar klasi .touch-only.
							 */
							function checkTouchscreenStatus() {
								const currentTouchPoints = navigator.maxTouchPoints;
								const touchscreenPopup = document.getElementById('touchscreenPopup');
								
								if (currentTouchPoints > previousTouchPoints) {
									console.log('🟢 Pievienota ārējā skārienjūtīgā ierīce. Aktivizētas papildu pogas!');
									showPopupMessage('Pievienota ārējā skārienjūtīgā ierīce. Aktivizētas papildu pogas!', 'popup-success');
									showTouchOnlyButtons();
								} else if (currentTouchPoints < previousTouchPoints) {
									console.log('🔴 Atvienota ārējā skārienjūtīgā ierīce. Papildu pogas paslēptas!');
									showPopupMessage('Atvienota ārējā skārienjūtīgā ierīce. Papildu pogas paslēptas!', 'popup-error');
									hideTouchOnlyButtons();
								}

								previousTouchPoints = currentTouchPoints;
							}

							/**
							 * Funkcija, kas parāda uznirstošo paziņojumu.
							 * @param {string} message - Ziņojuma teksts.
							 * @param {string} popupClass - Papildu klases nosaukums ('popup-success' vai 'popup-error').
							 */
							function showPopupMessage(message, popupClass) {
								const popup = document.getElementById('touchscreenPopup');
								popup.textContent = message;
								popup.classList.remove('popup-success', 'popup-error');
								popup.classList.add(popupClass);
								popup.style.display = 'block';

								setTimeout(() => {
									popup.style.display = 'none';
								}, 5000); // Parāda ziņojumu 5 sekundes
							}

							/** Palīgfunkcijas touch-only pogām */						
							function showTouchOnlyButtons() {
							  const touchOnlyElements = document.querySelectorAll('.touch-only');
							  touchOnlyElements.forEach(el => {
							    el.classList.add('touch-visible');
							    el.style.display = 'inline-block';
							  });
							
							  // pārrēķina slīdņa “span” pēc pogu skaita
							  window.__updateDimmerWidth && window.__updateDimmerWidth();
							  // (neobligāti) pielāgo arī doka mērogu
							  window.__fitDock && window.__fitDock();
							
							  console.log('✅ Skārienjūtīgās pogas ir redzamas.');
							}
							
							function hideTouchOnlyButtons() {
							  const touchOnlyElements = document.querySelectorAll('.touch-only');
							  touchOnlyElements.forEach(el => {
							    el.classList.remove('touch-visible');
							    el.style.display = 'none';
							  });
							
							  // pārrēķina slīdņa “span” pēc pogu skaita
							  window.__updateDimmerWidth && window.__updateDimmerWidth();
							  // (neobligāti) pielāgo arī doka mērogu
							  window.__fitDock && window.__fitDock();
							
							  console.log('❌ Skārienjūtīgās pogas ir paslēptas.');
							}
							

							/**
							 * Funkcija, kas uzsāk pārbaudi ik pēc 1 sekundes, vai ir pievienota skārienjūtīga ierīce.
							 */
							function startContinuousCheck() {
								setInterval(checkTouchscreenStatus, 3000); // Pārbauda ik pēc 1 sekundes
							}

							/**
							 * Funkcija, kas tiek izsaukta, kad pievieno jaunas USB vai citas ārējās ierīces.
							 */
							function listenForDeviceChanges() {
								if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
									navigator.mediaDevices.addEventListener('devicechange', () => {
										console.log('🔄 Konstatētas ierīču izmaiņas.');
										checkTouchscreenStatus();
									});
								}
							}

							/**
							 * Sākotnējais process, kas tiek izsaukts, kad logs ir ielādēts.
							 */
							window.addEventListener('load', () => {
								checkTouchscreenStatus(); // Pārbauda statusu, kad lapa tiek ielādēta
								startContinuousCheck(); // Sāk nepārtrauktu pārbaudi ik pēc 1 sekundes
								listenForDeviceChanges(); // Sāk klausīties, kad pievieno vai atvieno ierīces
							});

							/**
							 * Notikuma klausītājs pointerdown notikumam.
							 * Ja konstatēts pieskāriens, parāda touch-only pogas.
							 */
							window.addEventListener('pointerdown', (event) => {
								if (event.pointerType === 'touch') {
									console.log('🟢 Pieskāriens atklāts.');
									showTouchOnlyButtons();
								}
							});
						})();



						// Funkcija, kas pārbauda ierīces orientāciju
function checkOrientation() {
  const overlay = document.getElementById('orientation-overlay');
  if (!overlay) return;
  overlay.style.display = window.matchMedia("(orientation: portrait)").matches ? 'flex' : 'none';
}



						// Funkcija pārbauda, vai tiek izmantots viedtālrunis ar mazu ekrānu
function showMobileWarning() {
  const warningElement = document.getElementById('mobile-warning');
  if (!warningElement) return;

  const isMobileDevice = /iphone|ipod|android.*mobile|windows phone|iemobile|opera mini/.test(navigator.userAgent.toLowerCase());
  const isSmallScreen = window.innerWidth < 900;

  warningElement.style.display = (isMobileDevice && isSmallScreen) ? 'flex' : 'none';
}


						// Notikumu klausītāji
						window.addEventListener('load', showMobileWarning);
						window.addEventListener('resize', showMobileWarning);

						// Izsaucam funkciju sākumā un pie orientācijas izmaiņām
						checkOrientation();
						window.addEventListener('resize', checkOrientation);
						window.addEventListener('orientationchange', checkOrientation);

						// Funkcija, kas aizver abas izvēlnes
// 1) closeBothMenus – ar null sargiem
function closeBothMenus() {
  const left  = document.querySelector('.position-selector-left');
  const right = document.querySelector('.position-selector');

  left  && left.classList.add('hidden-left');
  right && right.classList.add('hidden');

  const leftBtn  = document.querySelector('.toggle-selector-left');
  const rightBtn = document.querySelector('.toggle-selector');
  if (leftBtn)  leftBtn.textContent  = '❯';
  if (rightBtn) rightBtn.textContent = '❮';

  window.__updateMapSafeAreas && window.__updateMapSafeAreas();
}

// === DROŠI sasienam pozīciju paneļu pogas un <select>us ===
(function(){
  const rightToggleBtn  = document.querySelector('.toggle-selector');
  const rightPanel      = document.querySelector('.position-selector');
  const leftToggleBtn   = document.querySelector('.toggle-selector-left');
  const leftPanel       = document.querySelector('.position-selector-left');

  // labā poga
  on(rightToggleBtn, 'click', () => {
    if (!rightPanel) return;
    if (rightPanel.classList.contains('hidden')) {
      rightPanel.classList.remove('hidden');
      rightToggleBtn && (rightToggleBtn.textContent = '❯'); // bultiņa uz aizvēršanu
    } else {
      closeBothMenus();
    }
  });

  // kreisā poga
  on(leftToggleBtn, 'click', () => {
    if (!leftPanel) return;
    if (leftPanel.classList.contains('hidden-left')) {
      leftPanel.classList.remove('hidden-left');
      leftToggleBtn && (leftToggleBtn.textContent = '❮'); // bultiņa uz aizvēršanu
    } else {
      closeBothMenus();
    }
  });


						// Funkcija, kas sinhronizē izvēles abās izvēlnēs
// 2) syncSelectOptions – arī ar null sargiem
function syncSelectOptions(selectedValue) {
  const leftSel  = document.getElementById('positionSelectLeft');
  const rightSel = document.getElementById('positionSelect');
  if (leftSel)  leftSel.value  = selectedValue;
  if (rightSel) rightSel.value = selectedValue;
}

 // <select> klausītāji (sinhronizē abos paneļos)
  const leftSelect  = document.getElementById('positionSelectLeft');
  const rightSelect = document.getElementById('positionSelect');

  on(leftSelect,  'change', () => {
    const v = leftSelect.value;
    syncSelectOptions(v);
    closeBothMenus();
    updateButtonContainerPosition(v);
  });

  on(rightSelect, 'change', () => {
    const v = rightSelect.value;
    syncSelectOptions(v);
    closeBothMenus();
    updateButtonContainerPosition(v);
  });


						const savedPosition = localStorage.getItem('buttonPosition');
						const valid = ['bottom', 'left', 'right'];
						const initial = valid.includes(savedPosition) ? savedPosition : 'bottom';
						
						syncSelectOptions(initial);
						updateButtonContainerPosition(initial);


						// Funkcija, kas atjaunina pogas konteinera novietojumu atkarībā no izvēlētās vērtības
// 3) updateButtonContainerPosition – izsauc arī slīdņa orientāciju
function updateButtonContainerPosition(position){
  const buttonContainer = document.getElementById('buttonContainer');
  if (!buttonContainer) return;

  buttonContainer.classList.remove('bottom','right','left');
  buttonContainer.classList.add(position);

  localStorage.setItem('buttonPosition', position);

  window.__fitDock && window.__fitDock();
  window.__updateDimmerWidth && window.__updateDimmerWidth();

  // ← lai uzreiz pārslēdzas vert./horiz. slīdnis
  syncRangeOrientation();
}



						function syncRangeOrientation(){
						  const bc    = document.getElementById('buttonContainer');
						  const range = document.getElementById('mapDimmerRange');
						  if(!bc || !range) return;
						
						  const side = bc.classList.contains('left') || bc.classList.contains('right');
						
						  if(side){
						    range.classList.add('range-vertical');       // CSS hakiem (Chrome/Edge)
						    range.setAttribute('orient','vertical');     // Firefoxam obligāti
						  }else{
						    range.classList.remove('range-vertical');
						    range.removeAttribute('orient');
						  }
						}
						
						
						// izsauc uzreiz un katru reizi pēc pozīcijas maiņas
						syncRangeOrientation();
						
						

const _oldUpdatePos = updateButtonContainerPosition;
updateButtonContainerPosition = function(position){
  _oldUpdatePos(position);
  syncRangeOrientation();
  window.__updateDimmerWidth && window.__updateDimmerWidth();
  window.__fitDock && window.__fitDock();
  window.__updateMapSafeAreas && window.__updateMapSafeAreas(); //  pievieno šo
};


						document.addEventListener('DOMContentLoaded', () => {
							// Atlasām kreisās puses pogu
							const leftToggleButton = document.querySelector('.toggle-selector-left');
							const leftPositionSelector = document.querySelector('.position-selector-left');
							if (!leftToggleButton || !leftPositionSelector) return; //  pievieno šo

						// Pārbaudām, vai izvēlne ir redzama vai paslēpta, un iestatām bultiņas virzienu
						if (leftPositionSelector.classList.contains('hidden-left')) {
								leftToggleButton.textContent = '❯'; // Izvēlne ir paslēpta, bultiņa uz priekšu
							} else {
								leftToggleButton.textContent = '❮'; // Izvēlne ir redzama, bultiņa uz iekšu
							}
						
	// kreisais panelis			
							if (!leftPositionSelector.classList.contains('hidden-left')) {
							leftPositionSelector.classList.add('hidden-left'); 
							}
						});

})();						



						const canvas = document.getElementById('mapCanvas');
						const ctx = canvas.getContext('2d');
						const img = new Image();
img.src = '';



function hasImage(){
  return !!img.src && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
}

img.addEventListener('load', () => {
  adjustImageSize();
  drawImage();              // drawImage pati parādīs rokturi tikai, ja bilde ir gatava
}, { once: false });

img.addEventListener('error', () => {
  console.warn('Attēlu neizdevās ielādēt');
  drawImage();              // izsauksies ar “tukšu” stāvokli – rokturis paliks paslēpts
});









						let imgX = 0, imgY = 0;
						let imgScale = 1;
						let imgWidth, imgHeight;
						let dragging = false;
						let resizing = false;
						let startX, startY;
						let startWidth, startHeight;
						let lastTouchDistance = 0;
						const initialScale = 0.9;

						// Tumšošanas intensitāte (0..0.8), glabājam % localStorage (0..80)
						let mapDarken = (+(localStorage.getItem('mapDarken') || 0)) / 100;
		// Tumšuma vērtība (%) → saglabā, uzliek canvas un onlineMap
function setDarkness(percent){
  // 0..80 (%), canvas izmantos 0..0.8
  const p = Math.max(0, Math.min(80, +percent || 0));
  localStorage.setItem('mapDarken', String(p));
  mapDarken = p / 100;

  // onlineMap pārklājums
  const dim = document.getElementById('onlineMapDim');
  if (dim) dim.style.background = 'rgba(0,0,0,' + Math.min(0.8, mapDarken) + ')';

  // ja ir slīdnis — atjauno CSS progresu (tavs CSS lieto --p)
  const rng = document.getElementById('mapDimmerRange');
  if (rng) rng.style.setProperty('--p', p);

  // pārzzīmējam kanvu (tumšums uz attēla)
  if (typeof drawImage === 'function') drawImage();
}
				



const resizeHandle = document.getElementById('resizeHandle');


if (resizeHandle && !resizeHandle.dataset.bound) {
  resizeHandle.addEventListener('mousedown', startResize);
  resizeHandle.addEventListener('touchstart', startResize, { passive: false });
  resizeHandle.dataset.bound = '1';
}




  // lai roktura <img> aizņem visu un netraucē klikam
  const icon = resizeHandle.querySelector('img');
  if (icon) {
    Object.assign(icon.style, {
      width: '100%', height: '100%', display: 'block', pointerEvents: 'none'
    });
  }





















(function(){
  const mapDiv   = document.getElementById('onlineMap');
  const mapDim   = document.getElementById('onlineMapDim');
	if (mapDiv && mapDim && mapDim.parentElement !== mapDiv) {
  mapDiv.appendChild(mapDim);
}
  const btn      = document.getElementById('toggleOnlineMap');
  const canvas   = document.getElementById('mapCanvas');
  const resizeH  = document.getElementById('resizeHandle');
  const dimRange = document.getElementById('mapDimmerRange');

  let map, inited = false;



/* === SAFE AREAS kalkulācija kartes kontrolēm (augša/apakša) === */

(function(){
  const topSelectors = [
    '#fullscreenMessage:not(.fs-message-hidden)',
    '.top-bar',
    '.dropdown-menu.visible',
    '#contentFrame.active',
    '#instructionFrame.active'
    // ⬅️ NOŅEMAM .position-selector un .position-selector-left,
    // lai sānu paneļi neietekmētu top drošo zonu
  ];

  const bottomSelectors = [
    '#about',
    '#iframeContainerAbout',
    '#iframeContainerQR'
  ];

  function visibleOverlapTop(el){
    const st = getComputedStyle(el);





	  
    const r = el.getBoundingClientRect();
    // “nederīgs/neredzams” elements
    if (st.display === 'none' || st.visibility === 'hidden' || r.width === 0 || r.height === 0) return 0;

    // Skaitām tikai elementus, kas tiešām ietekmē AUGŠU:
    //  - platus (>= 50% no viewport platuma) UN
    //  - atrodas pašā augšā (r.top tuvu 0) vai ir "fixed" un aizsedz augšējo joslu
    const isWide = r.width >= window.innerWidth * 0.5;
    const nearTop = r.top <= 12; // ~12px no ekrāna augšas
    const pinnedTop = (st.position === 'fixed' && r.top < 40); // fixed pārklājums pie augšas

    if (!isWide || !(nearTop || pinnedTop)) return 0;

    const TOP_BAND = Math.min(180, Math.round(window.innerHeight * 0.22));
    const intersects = r.top < TOP_BAND && r.bottom > 0;
    if (!intersects) return 0;

    return Math.max(0, Math.min(r.bottom, TOP_BAND));
  }

  function visibleOverlapBottom(el){
    const st = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (st.display === 'none' || st.visibility === 'hidden' || r.width === 0 || r.height === 0) return 0;
    const H = window.innerHeight;
    const BOTTOM_BAND = Math.min(220, Math.round(H * 0.28));
    const intersects = r.bottom > (H - BOTTOM_BAND) && r.top < H;
    if (!intersects) return 0;
    return Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, H - BOTTOM_BAND));
  }

  function getTopSafePx(){
    let px = 0;
    topSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => { px = Math.max(px, visibleOverlapTop(el)); });
    });
    return Math.round(px);
  }

  function getBottomSafePx(){
    let px = 0;
    bottomSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => { px = Math.max(px, visibleOverlapBottom(el)); });
    });
    return Math.round(px);
  }

  function updateMapSafeAreas(){
    const topPx    = getTopSafePx();
    const bottomPx = getBottomSafePx();
    document.documentElement.style.setProperty('--map-top-safe',    topPx + 'px');
    document.documentElement.style.setProperty('--map-bottom-safe', bottomPx + 'px');
    document.documentElement.style.setProperty('--map-bottom-gap', '35px');
    try { map && map.invalidateSize(true); } catch(e){}
  }

  window.__updateMapSafeAreas = updateMapSafeAreas;

  const call = () => setTimeout(updateMapSafeAreas, 0);
  window.addEventListener('load', call);
  window.addEventListener('resize', call);
  window.addEventListener('orientationchange', call);
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', call);
    window.visualViewport.addEventListener('scroll', call);
  }
})();




	

  /* ---------- POPUP STILS (pielāgo “dock-shell” vizuālam) ---------- */
  (function injectPopupCSS(){
    const css = `
      .leaflet-container .coord-popup{
        min-width: 320px;
        padding: 10px 12px;
      }
      .leaflet-container .coord-row{
        display:flex; align-items:center; gap:8px;
        margin:6px 0;
        color: #fff;
        font: 14px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      .leaflet-container .coord-row .label{
        color:#cfd6e4; opacity:.9; min-width:72px;
      }
      .leaflet-container .coord-row .value{
        flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        font-weight:600; color:#ffffff;
      }
      .leaflet-container .copy-btn{
        flex:0 0 auto;
        display:inline-grid; place-items:center;
        width:30px; height:30px; border-radius:8px;
        background: linear-gradient(180deg, var(--dock1, #1b1f25), var(--dock2, #490000a8));
        border:1px solid rgba(255,255,255,.06);
        box-shadow: 0 6px 16px rgba(0,0,0,.35);
        color:#eef2f7; cursor:pointer;
        transition: transform .12s ease, background-color .2s ease, border-color .2s ease;
      }
      .leaflet-container .copy-btn:hover{ transform: scale(1.06); }
      .leaflet-container .copy-btn:active{ transform: scale(.95); }
      .leaflet-container .copy-btn svg{ width:18px; height:18px; display:block; }
      .leaflet-container .copy-btn.copied{
        background:#1f7a36; border-color:#2bd169;
      }
      .leaflet-container .copied-msg{
        margin-left:4px; font-size:12px; color:#2bd169; opacity:0; transition:opacity .2s;
      }
      .leaflet-container .copied-msg.show{ opacity:1; }

      /* pārrakstām Leaflet popup “balto” čaulu uz tumšu dock stilā */
      .leaflet-popup-content-wrapper{
        background: linear-gradient(180deg, var(--dock1, #1b1f25), var(--dock2, #2a0f0faa));
        color:#fff; border-radius:16px;
        border:1px solid rgba(255,255,255,.06);
        box-shadow: 0 12px 28px rgba(0,0,0,.45), 0 2px 6px rgba(0,0,0,.35);
      }
      .leaflet-popup-tip{
        background: linear-gradient(180deg, var(--dock1, #1b1f25), var(--dock2, #2a0f0faa));
        border:1px solid rgba(255,255,255,.06);
      }

      /* lai slāņu kontrole noteikti ir redzama virs kartes */
      .leaflet-control{ z-index: 500; }
#onlineMap .leaflet-top    { top:    calc(var(--map-top-safe, 0px) + 10px); }
#onlineMap .leaflet-bottom { bottom: calc(var(--map-bottom-safe, 0px) + 10px); }
#onlineMap .leaflet-control { z-index: 500; }
#onlineMap .leaflet-popup   { z-index: 600; }
    `;
    const el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
  })();

  /* ---------------------- MGRS (8 cipari) ---------------------- */
  // WGS84 konstantes
  const a = 6378137.0, f = 1/298.257223563, k0 = 0.9996;
  const e2 = f*(2-f), ep2 = e2/(1-e2);

  const deg2rad = d => d*Math.PI/180;

  function utmZone(lon){
    let z = Math.floor((lon + 180)/6) + 1;
    return z;
  }
  // Īpašie gadījumi (Norvēģija / Svalbāra)
  function utmZoneSpecial(lat, lon, z){
    if (lat>=56 && lat<64 && lon>=3 && lon<12) return 32;
    if (lat>=72 && lat<84){
      if (lon>=0   && lon<9 ) return 31;
      if (lon>=9   && lon<21) return 33;
      if (lon>=21  && lon<33) return 35;
      if (lon>=33  && lon<42) return 37;
    }
    return z;
  }

  function latBandLetter(lat){
    const bands = "CDEFGHJKLMNPQRSTUVWX"; // 8° joslas, X ir 12°
    const idx = Math.floor((lat + 80) / 8);
    if (idx<0) return 'C';
    if (idx>19) return 'X';
    return bands[idx];
  }

  function llToUTM(lat, lon){
    let zone = utmZone(lon);
    zone = utmZoneSpecial(lat, lon, zone);

    const phi = deg2rad(lat);
    const lam = deg2rad(lon);
    const lam0 = deg2rad((zone-1)*6 - 180 + 3);

    const N = a / Math.sqrt(1 - e2*Math.sin(phi)*Math.sin(phi));
    const T = Math.tan(phi)*Math.tan(phi);
    const C = ep2 * Math.cos(phi)*Math.cos(phi);
    const A = Math.cos(phi) * (lam - lam0);

    const M = a*((1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256)*phi
            - (3*e2/8 + 3*e2*e2/32 + 45*e2*e2*e2/1024)*Math.sin(2*phi)
            + (15*e2*e2/256 + 45*e2*e2*e2/1024)*Math.sin(4*phi)
            - (35*e2*e2*e2/3072)*Math.sin(6*phi));

    let easting  = k0 * N * (A + (1-T+C)*Math.pow(A,3)/6 + (5-18*T+T*T+72*C-58*ep2)*Math.pow(A,5)/120) + 500000.0;
    let northing = k0 * (M + N*Math.tan(phi)*(A*A/2 + (5-T+9*C+4*C*C)*Math.pow(A,4)/24 + (61-58*T+T*T+600*C-330*ep2)*Math.pow(A,6)/720));
    const hemi = (lat >= 0) ? 'N' : 'S';
    if (lat < 0) northing += 10000000.0;

    return {zone, hemi, easting, northing, band: latBandLetter(lat)};
  }




// --- LL -> UTM piespiedu zonā (globāli pieejama) ---
if (!window.llToUTMInZone) {
  window.llToUTMInZone = function llToUTMInZone(lat, lon, zone) {
    const phi  = deg2rad(lat);
    const lam  = deg2rad(lon);
    const lam0 = deg2rad((zone - 1) * 6 - 180 + 3);

    const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
    const T = Math.tan(phi) * Math.tan(phi);
    const C = ep2 * Math.cos(phi) * Math.cos(phi);
    const A = Math.cos(phi) * (lam - lam0);

    const M = a * ((1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256) * phi
      - (3*e2/8 + 3*e2*e2/32 + 45*e2*e2*e2/1024) * Math.sin(2*phi)
      + (15*e2*e2/256 + 45*e2*e2*e2/1024) * Math.sin(4*phi)
      - (35*e2*e2*e2/3072) * Math.sin(6*phi));

    let easting  = k0 * N * (A + (1 - T + C) * Math.pow(A,3)/6
      + (5 - 18*T + T*T + 72*C - 58*ep2) * Math.pow(A,5)/120) + 500000.0;

    let northing = k0 * (M + N * Math.tan(phi) * (A*A/2
      + (5 - T + 9*C + 4*C*C) * Math.pow(A,4)/24
      + (61 - 58*T + T*T + 600*C - 330*ep2) * Math.pow(A,6)/720));

    const hemi = (lat >= 0) ? 'N' : 'S';
    if (lat < 0) northing += 10000000.0;

    return { zone, hemi, easting, northing, band: latBandLetter(lat) };
  };
}








	
function utmToLL(E, N, zone, hemi){
  // constants
  const e = Math.sqrt(e2);
  const x = E - 500000.0;
  const y = (hemi === 'S') ? (N - 10000000.0) : N;

  const M  = y / k0;
  const mu = M / (a*(1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));

  const e1 = (1 - Math.sqrt(1-e2)) / (1 + Math.sqrt(1-e2));
  const J1 = (3*e1/2 - 27*e1*e1*e1/32);
  const J2 = (21*e1*e1/16 - 55*e1*e1*e1*e1/32);
  const J3 = (151*e1*e1*e1/96);
  const J4 = (1097*e1*e1*e1*e1/512);

  const phi1 = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);

  const C1 = ep2 * Math.cos(phi1)*Math.cos(phi1);
  const T1 = Math.tan(phi1)*Math.tan(phi1);
  const N1 = a / Math.sqrt(1 - e2*Math.sin(phi1)*Math.sin(phi1));
  const R1 = a*(1 - e2) / Math.pow(1 - e2*Math.sin(phi1)*Math.sin(phi1), 1.5);
  const D  = x / (N1*k0);

  let lat = phi1 - (N1*Math.tan(phi1)/R1) * (D*D/2 - (5+3*T1+10*C1-4*C1*C1-9*ep2)*Math.pow(D,4)/24 + (61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*Math.pow(D,6)/720);
  let lon = deg2rad((zone-1)*6 - 180 + 3) + (D - (1+2*T1+C1)*Math.pow(D,3)/6 + (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*ep2 + 24*T1*T1)*Math.pow(D,5)/120) / Math.cos(phi1);

  return { lat: lat*180/Math.PI, lon: lon*180/Math.PI };
}









  // 100k režģa burtu ģenerācija (bez I un O)
  const SET_ORIGIN_COLUMN_LETTERS = ['A','J','S','A','J','S'];
  const SET_ORIGIN_ROW_LETTERS    = ['A','F','A','F','A','F'];

  function get100kSetForZone(zone){ return (zone-1) % 6; }

  function letterAfter(startChar, steps, isRow){
    // rinda: A..V (20 burti), kolonna: A..Z bez I,O
    const skip = ch => (ch==='I' || ch==='O');
    let ch = startChar.charCodeAt(0);
    for(let i=0;i<steps;i++){
      ch++;
      let s = String.fromCharCode(ch);
      if (skip(s)) ch++;
      if (isRow){
        if (ch > 'V'.charCodeAt(0)) ch = 'A'.charCodeAt(0);
      } else {
        if (ch > 'Z'.charCodeAt(0)) ch = 'A'.charCodeAt(0);
      }
    }
    return String.fromCharCode(ch);
  }

  function make100kID(easting, northing, zone){
    const set = get100kSetForZone(zone);
    const eIdx = Math.floor(easting / 100000);            // 1..8
    const nIdx = Math.floor(northing / 100000);           // 0..(∞), mod 20 zemāk

    const colOrigin = SET_ORIGIN_COLUMN_LETTERS[set];     // A / J / S
    const rowOrigin = SET_ORIGIN_ROW_LETTERS[set];        // A / F

    const col = letterAfter(colOrigin, eIdx-1, false);
    const row = letterAfter(rowOrigin, nIdx % 20, true);

    return col + row;
  }

  function pad(n, size){ n = String(n); while(n.length<size) n = '0'+n; return n; }

  // MGRS ar 8 cipariem (10 m)
 function toMGRS8(lat, lon, compact=false){
  const utm  = llToUTM(lat, lon);
  const grid = make100kID(utm.easting, utm.northing, utm.zone);

  const eR = Math.floor(utm.easting  % 100000);     // 0..99999
  const nR = Math.floor(utm.northing % 100000);     // 0..99999

  // 8 cipari = 10 m => 4+4
  const e4 = String(Math.floor(eR/10)).padStart(4,'0');
  const n4 = String(Math.floor(nR/10)).padStart(4,'0');

  const pretty = `${utm.zone}${utm.band} ${grid} ${e4} ${n4}`;
  const tight  = `${utm.zone}${utm.band}${grid}${e4}${n4}`;
  return compact ? tight : pretty;
}

  /* ---------------------- KARTES iestatīšana ---------------------- */
  function initMap(){
    if (inited) return true;
    if (!window.L){ console.warn('Leaflet nav ielādēts'); return false; }

    map = L.map(mapDiv, { zoomControl:true, attributionControl:true });
window.__getMap = () => map;   // 👈 Ieliec tieši šeit
    const osm  = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; OpenStreetMap, SRTM | Style: &copy; OpenTopoMap (CC-BY-SA)'
    });

    const esri = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Tiles &copy; Esri'
    });

    const hot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 20, attribution: '&copy; OSM, HOT'
    });

    const cyclo = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
      maxZoom: 20, attribution: '&copy; OSM, CyclOSM'
    });

    const baseLayers = {
      'OSM': osm,
      'OpenTopoMap': topo,
      'Esri satelīts': esri,
      'OSM HOT': hot,
      'CyclOSM': cyclo
    };










// === Mēroga izvēlne (1:10k..1:100k) ===
const SCALE_OPTIONS = [10000, 25000, 50000, 75000, 100000];

// palīdzfunkcijas: aktuālais mērogs un nepieciešamais zoom izvēlētam mērogam
function getCurrentScale(){
  const c   = map.getCenter(), z = map.getZoom();
  const mpp = 156543.03392 * Math.cos(c.lat*Math.PI/180) / Math.pow(2, z);
  return Math.round(mpp / 0.00028); // “1:xxxx”
}
function zoomForScale(scale){
  const lat = map.getCenter().lat * Math.PI/180;
  const mppTarget = scale * 0.00028; // m/pixel pie 0.28mm pikseļa
  return Math.log2(156543.03392 * Math.cos(lat) / mppTarget);
}

// pašas kontroles UI
const scalePickCtl = L.control({ position: 'bottomleft' }); 

scalePickCtl.onAdd = function(){
  const wrap = L.DomUtil.create('div', 'leaflet-control-attribution');
  Object.assign(wrap.style, {
    background:'rgba(0,0,0,.5)', color:'#fff', padding:'4px 6px',
    borderRadius:'4px', font:'12px/1.2 system-ui, sans-serif', marginTop:'4px'
  });
  wrap.title = 'Izvēlies mērogu';

  const label = document.createElement('span');
  label.textContent = 'Tīkla mērogs: ';
  label.style.marginRight = '6px';

  const select = document.createElement('select');
  select.id = 'scalePicker';
  Object.assign(select.style, {
    background:'rgba(0,0,0,.3)', color:'#fff',
    border:'1px solid rgba(255,255,255,.2)', borderRadius:'4px',
    padding:'2px 4px', font:'12px/1.2 system-ui, sans-serif'
  });

  SCALE_OPTIONS.forEach(s=>{
    const opt = document.createElement('option');
    opt.value = String(s);
    opt.textContent = '1: ' + s.toLocaleString('lv-LV');
    select.appendChild(opt);
  });

  select.addEventListener('change', ()=>{
    const targetScale = +select.value;
    // atļaujam frakcionētu zoom, lai mērogs sanāk precīzāks
    map.options.zoomSnap = 0;
    map.options.zoomDelta = 0.25;
    map.setZoom( zoomForScale(targetScale), {animate:true} );
    updateRatio();     // atjauno “Mērogs: 1:xxxx” rādītāju
    syncScalePicker(); // pielāgo izvēlnes value, ja vajag
  });

  wrap.appendChild(label);
  wrap.appendChild(select);

  // neļaujam šai kontrolei “sastrīdēties” ar kartes drag/zoom
  L.DomEvent.disableClickPropagation(wrap);
  L.DomEvent.disableScrollPropagation(wrap);

  // sākumā iestata izvēlnes vērtību tuvākajam mērogam
  setTimeout(()=> syncScalePicker(), 0);
  return wrap;
};
scalePickCtl.addTo(map);

// sinhronizē izvēlnes value ar pašreizējo mērogu (tuvākais no saraksta)
function syncScalePicker(){
  const el = document.getElementById('scalePicker');
  if(!el) return;
  const cur = getCurrentScale();
  let best = SCALE_OPTIONS[0], diff = Infinity;
  SCALE_OPTIONS.forEach(s=>{
    const d = Math.abs(s - cur);
    if(d < diff){ diff = d; best = s; }
  });
  el.value = String(best);
}

// jau esošo rādītāju atjauno + sinhronizē arī izvēlni
map.on('moveend zoomend', ()=>{ updateRatio(); syncScalePicker(); });










	  

// === MGRS/UTM režģis sadalīts 2 slāņos: LĪNIJAS un ETIĶETES ===
function createUTMGridLayers(){
  const gLines  = L.layerGroup();   // līnijas
  const gLabels = L.layerGroup();   // etiķetes

  // Pane līnijām
  if (!map.getPane('gridPane')){
    map.createPane('gridPane');
    const p = map.getPane('gridPane');
    p.style.zIndex = 490;
    p.style.pointerEvents = 'none';
  }
  // Pane etiķetēm (virs līnijām)
  if (!map.getPane('gridLabelPane')){
    map.createPane('gridLabelPane');
    const p = map.getPane('gridLabelPane');
    p.style.zIndex = 491;
    p.style.pointerEvents = 'none';
  }

  // CSS etiķetēm – kā iepriekš
  if (!document.getElementById('utm-grid-css')){
    const el = document.createElement('style');
    el.id = 'utm-grid-css';
    el.textContent = `
      .utm-label span{
        display:inline-block; background:rgba(0,0,0,.55); color:#fff;
        padding:2px 6px; border-radius:6px; font:12px/1.25 system-ui;
        text-shadow:0 1px 0 #000, 0 0 3px #000; white-space:nowrap; user-select:none;
      }
      .utm-label.major span{ font-weight:700; }
    `;
    document.head.appendChild(el);
  }

  // stili (kā tev bija)
  const GRID_COLOR = '#ff3131';
  const OUTLINE_COLOR = '#ffffff';
  const MINOR     = { pane:'gridPane', color: GRID_COLOR,  opacity: .95, weight: 2.4, lineJoin:'round', lineCap:'round', dashArray:'6,6' };
  const MINOR_OUT = { pane:'gridPane', color: OUTLINE_COLOR, opacity: .95, weight: MINOR.weight + 2.4, lineJoin:'round', lineCap:'round' };
  const MAJOR     = { pane:'gridPane', color: GRID_COLOR,  opacity: 1.0, weight: 3.6, lineJoin:'round', lineCap:'round' };
  const MAJOR_OUT = { pane:'gridPane', color: OUTLINE_COLOR, opacity: .98, weight: MAJOR.weight + 3.0, lineJoin:'round', lineCap:'round' };

  function addLine(points, isMajor, putLabel, labelLatLng, labelText){
    // līnijas → gLines
    L.polyline(points, isMajor ? MAJOR_OUT : MINOR_OUT).addTo(gLines);
    L.polyline(points, isMajor ? MAJOR     : MINOR    ).addTo(gLines);

    // etiķete → gLabels
    if (putLabel && labelLatLng){
      const icon = L.divIcon({
        className: 'utm-label' + (isMajor ? ' major' : ''),
        html: `<span>${labelText}</span>`,
        iconSize:[0,0], iconAnchor:[0,0]
      });
      L.marker(labelLatLng, { icon, pane:'gridLabelPane', interactive:false }).addTo(gLabels);
    }
  }

function redraw(){
  if (!map || !map._loaded) return;

  gLines.clearLayers();
  gLabels.clearLayers();

  const z  = map.getZoom();
  const step = (z>=14)?1000 : (z>=12)?2000 : (z>=10)?5000 : (z>=8)?10000 : 20000;

  const b  = map.getBounds();
  const nw = b.getNorthWest(), se = b.getSouthEast();

  // Vienmēr skaitām vienas (centra) UTM zonas koordinātēs
  const c   = map.getCenter();
  const z0  = utmZoneSpecial(c.lat, c.lng, utmZone(c.lng));
  const hemi = (c.lat >= 0) ? 'N' : 'S';

  // Stūrus pārmetam uz šo pašu zonu
  const nwU = window.llToUTMInZone(nw.lat, nw.lng, z0);
  const seU = window.llToUTMInZone(se.lat, se.lng, z0);

  const minE = Math.floor(Math.min(nwU.easting,  seU.easting)  / step) * step;
  const maxE = Math.ceil (Math.max(nwU.easting,  seU.easting)  / step) * step;
  const minN = Math.floor(Math.min(nwU.northing, seU.northing) / step) * step;
  const maxN = Math.ceil (Math.max(nwU.northing, seU.northing) / step) * step;

  const labelZoom = true; // etiķetes vienmēr redzamas

  const midN = (minN + maxN) / 2;
  const midE = (minE + maxE) / 2;

  // Easting līnijas
  for (let E = minE; E <= maxE; E += step){
    const pts = [];
    for (let N = minN; N <= maxN; N += step/4){
      const ll = utmToLL(E, N, z0, hemi);
      pts.push([ll.lat, ll.lon]);
    }
    const isMajor = (E % 10000) === 0;
    const labLL = utmToLL(E, midN, z0, hemi);
    addLine(pts, isMajor, labelZoom, [labLL.lat, labLL.lon], 'E ' + Math.round(E/1000) + ' km');
  }

  // Northing līnijas
  for (let N = minN; N <= maxN; N += step){
    const pts = [];
    for (let E = minE; E <= maxE; E += step/4){
      const ll = utmToLL(E, N, z0, hemi);
      pts.push([ll.lat, ll.lon]);
    }
    const isMajor = (N % 10000) === 0;
    const labLL = utmToLL(midE, N, z0, hemi);
    addLine(pts, isMajor, labelZoom, [labLL.lat, labLL.lon], 'N ' + Math.round(N/1000) + ' km');
  }
}
  map.on('moveend zoomend', redraw);
  setTimeout(redraw, 0);

  // atgriežam abus atsevišķus slāņus
  return { grid: gLines, labels: gLabels };
}








	  
   // jaunais – pievienojam MGRS/UTM režģi kā pārklājumu
// vispirms iedod centru/zoom:
map.setView([56.9496, 24.1052], 13);

// režģi un slāņu kontroli veido tikai tad, kad karte tiešām “gatava”
map.whenReady(() => {


// LL → UTM piespiedu zonā (izmantojam centra zonu, lai režģis nepazūd)
function llToUTMInZone(lat, lon, zone){
  const phi  = deg2rad(lat);
  const lam  = deg2rad(lon);
  const lam0 = deg2rad((zone - 1)*6 - 180 + 3);

  const N = a / Math.sqrt(1 - e2*Math.sin(phi)*Math.sin(phi));
  const T = Math.tan(phi)*Math.tan(phi);
  const C = ep2 * Math.cos(phi)*Math.cos(phi);
  const A = Math.cos(phi) * (lam - lam0);

  const M = a*((1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256)*phi
         - (3*e2/8 + 3*e2*e2/32 + 45*e2*e2*e2/1024)*Math.sin(2*phi)
         + (15*e2*e2/256 + 45*e2*e2*e2/1024)*Math.sin(4*phi)
         - (35*e2*e2*e2/3072)*Math.sin(6*phi));

  let easting  = k0 * N * (A + (1-T+C)*Math.pow(A,3)/6 + (5-18*T+T*T+72*C-58*ep2)*Math.pow(A,5)/120) + 500000.0;
  let northing = k0 * (M + N*Math.tan(phi)*(A*A/2 + (5-T+9*C+4*C*C)*Math.pow(A,4)/24 + (61-58*T+T*T+600*C-330*ep2)*Math.pow(A,6)/720));

  const hemi = (lat >= 0) ? 'N' : 'S';
  if (lat < 0) northing += 10000000.0;

  return { zone, hemi, easting, northing, band: latBandLetter(lat) };
}





	
  // saņemam ABUS slāņus no funkcijas
  const { grid, labels } = createUTMGridLayers();

  // ieliekam katru atsevišķi kā pārklājumu
  const overlays = {
    'MGRS režģa līnijas (1–20 km)': grid,
    'MGRS etiķetes': labels,
  };

  const layersCtl = L.control.layers(baseLayers, overlays, {
    collapsed: true,
    position: 'topright'
  }).addTo(map);

  // abi defaultā ieslēgti
  grid.addTo(map);
  labels.addTo(map);

  // ▶ Slāņu panelis: atveras ar klikšķi, aizveras pēc izvēles
  makeLayersClickOnly(layersCtl);
});





    // klasiskā skala + 1:xxxx
    L.control.scale({imperial:false, metric:true, maxWidth:200}).addTo(map);
    const ratioCtl = L.control({position:'bottomleft'});
    ratioCtl.onAdd = function(){
      const div = L.DomUtil.create('div', 'leaflet-control-attribution');
      Object.assign(div.style, {
        background:'rgba(0,0,0,.5)', color:'#fff', padding:'2px 6px',
        borderRadius:'4px', font:'12px/1.2 system-ui, sans-serif', marginTop:'4px'
      });
      div.id = 'scaleRatioCtl';
      div.textContent = 'Mērogs: —';
      return div;
    };
    ratioCtl.addTo(map);

    function updateRatio(){
      const c = map.getCenter(), z = map.getZoom();
      const mpp = 156543.03392 * Math.cos(c.lat*Math.PI/180) / Math.pow(2,z);
      const scale = Math.round(mpp / 0.00028);
      const el = document.getElementById('scaleRatioCtl');
      if (el) el.textContent = 'Tīkla mērogs: 1:' + scale.toLocaleString('lv-LV');
    }
    map.on('moveend zoomend', updateRatio); updateRatio();

    // apakšējais kreisais info (Lat/Lng + MGRS) + klikšķis — kopēt
    const posCtl = L.control({position:'bottomleft'});
    posCtl.onAdd = function(){
      const div = L.DomUtil.create('div', 'leaflet-control-attribution');
      Object.assign(div.style, {
        background:'rgba(0,0,0,.5)', color:'#fff', padding:'2px 6px',
        borderRadius:'4px', font:'12px/1.2 system-ui, sans-serif', marginTop:'4px', cursor:'pointer'
      });
      div.id = 'mousePosCtl';
      div.title = 'Noklikšķini, lai kopētu MGRS';
      div.textContent = 'Lat,Lng: —';
      div.addEventListener('click', async () => {
  const v = div.dataset.mgrs || '';
  if (!v) return;

  let ok = false;
  try {
    // primārā metode – darbojas drošā (https) kontekstā
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(v);
      ok = true;
    } else {
      // rezerves variants – textarea + execCommand
      const ta = document.createElement('textarea');
      ta.value = v;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch(e){ ok = false; }

  if (ok) {
    // īss vizuāls “flash”, netraucē tekstam, ko mousemove pārtaisa
    const oldBG = div.style.background;
    div.style.background = 'rgba(31,122,54,.65)'; // zaļš
    setTimeout(() => { div.style.background = oldBG || 'rgba(0,0,0,.5)'; }, 1200);
  } else {
    alert('Neizdevās nokopēt. Lūdzu, mēģini vēlreiz.');
  }
});
      return div;
    };
    posCtl.addTo(map);

    map.on('mousemove', e=>{
      const lat = e.latlng.lat, lon = e.latlng.lng;
      const mgrs = toMGRS8(lat, lon);
      const s = `${lat.toFixed(6)}, ${lon.toFixed(6)}  |  ${mgrs}`;
      const el = document.getElementById('mousePosCtl');
      if (el){ el.textContent = s; el.dataset.mgrs = mgrs; }
    });









function makeLayersClickOnly(layersCtl){
  if (!layersCtl) return;

  // mēģinām paņemt konteineru; ja vēl nav – pārliekam uz nākamo kadru
  const c = layersCtl._container;
  if (!c) { requestAnimationFrame(() => makeLayersClickOnly(layersCtl)); return; }

  // mēģinām paņemt “toggle” linku no API vai pēc klases
  const link = layersCtl._layersLink || c.querySelector('.leaflet-control-layers-toggle');

  // — droši noņemam hover/focus uzvedību —
  try { L.DomEvent.off(c,    'mouseover', layersCtl._expand,   layersCtl); } catch(e){}
  try { L.DomEvent.off(c,    'mouseout',  layersCtl._collapse, layersCtl); } catch(e){}
  if (link) {
    try { L.DomEvent.off(link, 'focus',   layersCtl._expand,   layersCtl); } catch(e){}
    try { L.DomEvent.off(link, 'blur',    layersCtl._collapse, layersCtl); } catch(e){}
  }

  // — pārslēgšana tikai ar klikšķi / Enter / Space —
  function toggle(e){
    L.DomEvent.stop(e);
    const open = L.DomUtil.hasClass(c, 'leaflet-control-layers-expanded');
    open ? layersCtl._collapse() : layersCtl._expand();
  }

  if (link) {
    L.DomEvent.on(link, 'click',     toggle);
    L.DomEvent.on(link, 'pointerup', toggle);
    L.DomEvent.on(link, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });
  }

  // Aizver TIKAI pēc izvēles (radio/checkbox). Turi SHIFT, lai neaizvērtu.
  const form = c.querySelector('.leaflet-control-layers-list') || c;
  form.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(inp => {
    inp.addEventListener('click', (ev) => {
      if (ev.shiftKey) return;
      setTimeout(() => layersCtl._collapse(), 80);
    });
  });

  // Nenopludina klikšķus uz karti
  L.DomEvent.on(c, 'click mousedown dblclick', L.DomEvent.stopPropagation);
}











map.whenReady(() => {
  (function addInfoHandle() {
    const stack = document.querySelector('#onlineMap .leaflet-control-container .leaflet-bottom.leaflet-left');
    if (!stack) return;

    let btn = stack.querySelector('.info-handle');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'info-handle';
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('title', 'Parādīt/slēpt info paneli');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      stack.appendChild(btn);
    }

    // neļaujam kartes pannam “apēst” notikumus
    if (window.L && L.DomEvent) {
      L.DomEvent.disableClickPropagation(btn);
      L.DomEvent.disableScrollPropagation(btn);
      L.DomEvent.on(btn, 'mousedown dblclick pointerdown touchstart', L.DomEvent.stop);
      L.DomEvent.on(btn, 'contextmenu', L.DomEvent.stop);
    }

    const toggle = (ev) => {
      if (ev) { ev.preventDefault(); ev.stopPropagation(); }
      stack.classList.toggle('info-collapsed');
      const expanded = !stack.classList.contains('info-collapsed');
      btn.setAttribute('aria-expanded', String(expanded));
      btn.classList.toggle('collapsed', !expanded);
    };

    // ── PIESAISTE AR PAREIZU FILTRU ─────────────────────────────
    const supportsPointer = 'onpointerup' in window;

    if (supportsPointer) {
      btn.addEventListener('pointerup', (e) => {
        // tikai primārā (kreisā) poga ar peli; uz touch/pen – vienmēr OK
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        toggle(e);
      }, { passive: false });

      // NEPIESIENAM 'click', lai nebūtu dubult-toggles uz kreisās peles
    } else {
      // vecākiem iOS/UC u.c. – touch + click kā rezerve
      btn.addEventListener('touchend', toggle, { passive: false });
      btn.addEventListener('click', toggle, { passive: false });
    }

    // Tastatūras piekļūstamība
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); }
    });


  })();
});










	  
    // labais klikšķis — popup ar 2 rindām + kopēšanas pogām
  map.on('contextmenu', e=>{
  const lat = e.latlng.lat, lon = e.latlng.lng;
  const ll  = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  const mgrs = toMGRS8(lat, lon);                          // 8 ciparu MGRS (4+4)

  const copySVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="10" height="12" rx="2"></rect>
      <rect x="5" y="3" width="10" height="12" rx="2"></rect>
    </svg>`;

  const html = `
    <div class="coord-popup">
      <div class="coord-row">
        <span class="label">Lat,Lng</span>
        <span class="value" id="llVal">${ll}</span>
        <button class="copy-btn" id="copyLL" title="Kopēt Lat,Lng" aria-label="Kopēt Lat,Lng">${copySVG}</button>
        <span class="copied-msg" id="copiedLL">Nokopēts!</span>
      </div>
      <div class="coord-row">
        <span class="label">MGRS</span>
        <span class="value" id="mgrsVal">${mgrs}</span>
        <button class="copy-btn" id="copyMGRS" title="Kopēt MGRS" aria-label="Kopēt MGRS">${copySVG}</button>
        <span class="copied-msg" id="copiedMGRS">Nokopēts!</span>
      </div>
    </div>`;

  L.popup({maxWidth: 480}).setLatLng(e.latlng).setContent(html).openOn(map);
});

// piesienam kopēšanas loģiku drošā brīdī – kad popup ir atvērts
map.on('popupopen', ev=>{
  const root = ev.popup.getElement();
  if (!root) return;

  const doCopy = async (btnSel, valSel, msgSel) => {
    const btn = root.querySelector(btnSel);
    const val = root.querySelector(valSel)?.textContent || '';
    const msg = root.querySelector(msgSel);
    if (!btn || !val) return;

    btn.addEventListener('click', async () => {
      let ok = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(val);
          ok = true;
        } else {
          // rezerves variants
          const ta = document.createElement('textarea');
          ta.value = val;
          ta.style.position = 'fixed';
          ta.style.opacity  = '0';
          document.body.appendChild(ta);
          ta.focus(); ta.select();
          ok = document.execCommand('copy');
          document.body.removeChild(ta);
        }
      } catch(e){ ok = false; }

      if (ok) {
        btn.classList.add('copied');
        msg && msg.classList.add('show');
        setTimeout(()=>{ btn.classList.remove('copied'); msg && msg.classList.remove('show'); }, 5000);
      } else {
        btn.classList.remove('copied');
        msg && msg.classList.remove('show');
        alert('Neizdevās nokopēt. Lūdzu, izmēģini vēlreiz.');
      }
    });
  };

  doCopy('#copyLL',   '#llVal',   '#copiedLL');
  doCopy('#copyMGRS', '#mgrsVal', '#copiedMGRS');
});
// kad sāk kustēties – aizver popup un iedokē pogas
map.on('movestart zoomstart dragstart', () => {
  map.closePopup();
  const bc = document.getElementById('buttonContainer');
  bc && bc.classList.add('docked');
});

// ja gribi arī uz jebkura pieskāriena uz kartes
map.getContainer().addEventListener('pointerdown', () => {
  const bc = document.getElementById('buttonContainer');
  bc && bc.classList.add('docked');
}, {passive:true});
    inited = true;
    return true;
  }

  /* ---------------------- Tumšošanas sinhronizācija ---------------------- */
  function syncDimOverlay(){
    if (!dimRange) return;
    const v = +dimRange.value || 0;            // 0..80
    const a = Math.min(0.8, Math.max(0, v/100));
    mapDim.style.background = 'rgba(0,0,0,' + a + ')';
  }
// padarām pieejamu “binderi”, ja slīdnis parādās vēlāk
// Sasien slīdni ar vienoto iestatītāju
window.__bindDimmer = function(inputEl){
  if(!inputEl) return;
  const saved = +(localStorage.getItem('mapDarken') || 0);
  inputEl.value = saved;
  inputEl.addEventListener('input', () => setDarkness(inputEl.value));
  setDarkness(saved); // piemēro uzreiz
};
  /* ---------------------- Rādīt / slēpt tiešsaistes karti ---------------------- */
function showOnlineMap(){
  // PARĀDĀM karti, paslēpjam kanvu + rokturi
  mapDiv.style.display = 'block';
  mapDim.style.display = 'block';
  canvas.style.display = 'none';
  if (resizeH) resizeH.style.display = 'none';

  // nodrošinam izmēru pirms init/invalidate
  if (!mapDiv.offsetWidth || !mapDiv.offsetHeight){
    const p = mapDiv.parentElement;
    mapDiv.style.width  = (p && p.clientWidth  ? p.clientWidth  : window.innerWidth)  + 'px';
    mapDiv.style.height = (p && p.clientHeight ? p.clientHeight : window.innerHeight) + 'px';
  }

  const v = +(localStorage.getItem('mapDarken') || 0);
  setDarkness(v);

  if (!initMap()){
    // Atpakaļ uz kanvu, ja Leaflet nav
    mapDiv.style.display = 'none';
    mapDim.style.display = 'none';
    canvas.style.display = 'block';
    if (resizeH && hasImage()) positionResizeHandle(true);
    localStorage.setItem('onlineMapActive','0');
    alert('Leaflet nav ielādējies — tiešsaistes karte izslēgta.');
    return;
  }

  requestAnimationFrame(()=> map && map.invalidateSize(true));
  setTimeout(()=> map && map.invalidateSize(true), 100);

  if (btn) btn.classList.add('active');
  localStorage.setItem('onlineMapActive','1');

  syncDimOverlay();
  window.__updateDimmerWidth && window.__updateDimmerWidth();
  window.__fitDock && window.__fitDock();
}

function hideOnlineMap(){
  mapDiv.style.display = 'none';
  mapDim.style.display = 'none';
  canvas.style.display = 'block';

  // rokturi rādām tikai tad, ja tiešām ir bilde
  if (resizeH && hasImage()) {
    positionResizeHandle(true);
  } else if (resizeH) {
    resizeH.style.display = 'none';
  }

  if (btn) btn.classList.remove('active');
  localStorage.setItem('onlineMapActive','0');
  window.__updateDimmerWidth && window.__updateDimmerWidth();
  window.__fitDock && window.__fitDock();
}




  btn && btn.addEventListener('click', () => {
    const isOn = mapDiv.style.display === 'block';
    isOn ? hideOnlineMap() : showOnlineMap();
  });

  if (localStorage.getItem('onlineMapActive') === '1'){ showOnlineMap(); }

  window.addEventListener('resize', ()=> map && map.invalidateSize());
if (dimRange){ window.__bindDimmer(dimRange); }

})();











//						img.onload = function () {
//							adjustImageSize();
//							drawImage();
//							positionResizeHandle();
//							resizeHandle.style.display = 'block';
//						};
//
				function adjustImageSize() {
					const aspectRatio = img.naturalWidth / img.naturalHeight;
					const scaleFactor = 0.85; // 📌 Pielāgojam attēlu uz 90% no sākotnējā izmēra

					if (canvas.width / canvas.height > aspectRatio) {
						imgWidth = canvas.height * aspectRatio * scaleFactor;
						imgHeight = canvas.height * scaleFactor;
				} else {
					imgWidth = canvas.width * scaleFactor;
					imgHeight = (canvas.width / aspectRatio) * scaleFactor;
					}
					
						// ✅ Centrējam attēlu kanvā
						imgX = (canvas.width - imgWidth) / 2;
						imgY = (canvas.height - imgHeight) / 2;

						imgScale = 1; // 📌 Nodrošina sākotnējo mērogu (bez tālummaiņas)
						}






								


						

						// Reset Map Button Functionality
	on(byId('resetMap'), 'click', () => {
  adjustImageSize();
  drawImage();
});

						// Attēla pārvietošana
						canvas.addEventListener('mousedown', (e) => {
							if (e.target === resizeHandle) return;
							startX = e.offsetX;
							startY = e.offsetY;
							dragging = true;
						});

						canvas.addEventListener('mousemove', (e) => {
							if (dragging) {
								let dx = e.offsetX - startX;
								let dy = e.offsetY - startY;
								imgX += dx;
								imgY += dy;
								startX = e.offsetX;
								startY = e.offsetY;
								drawImage();
							}
						});

						canvas.addEventListener('mouseup', () => {
							dragging = false;
						});

						// Precīzāka tālummaiņa ar peles riteni
						canvas.addEventListener('wheel', (e) => {
							e.preventDefault();
							const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
							const mouseX = e.offsetX;
							const mouseY = e.offsetY;

							// Aprēķina attālumu no kursora līdz attēla pozīcijai
							const offsetX = mouseX - imgX;
							const offsetY = mouseY - imgY;

							// Aprēķina jauno attēla pozīciju pēc tālummaiņas
							imgX = mouseX - offsetX * zoomFactor;
							imgY = mouseY - offsetY * zoomFactor;

							imgScale *= zoomFactor;
							drawImage();
						});


						// Skārienjūtības atbalsts (pārvietošana, tālummaiņa un izmēru maiņa)
						canvas.addEventListener('touchstart', (e) => {
							e.preventDefault();
							if (e.touches.length === 1) { // Pārvietošana
								startX = e.touches[0].clientX;
								startY = e.touches[0].clientY;
								dragging = true;
							} else if (e.touches.length === 2) { // Tālummaiņa
  lastTouchDistance = canvasTouchDistance(e.touches[0], e.touches[1]);
}

						});





						canvas.addEventListener('touchmove', (e) => {
							e.preventDefault();
							if (e.touches.length === 1 && dragging) { // Pārvietošana
								let dx = e.touches[0].clientX - startX;
								let dy = e.touches[0].clientY - startY;
								imgX += dx;
								imgY += dy;
								startX = e.touches[0].clientX;
								startY = e.touches[0].clientY;
								drawImage();
							} else if (e.touches.length === 2) { // Tālummaiņa
  const touch1 = e.touches[0];
  const touch2 = e.touches[1];
  const newDistance = canvasTouchDistance(touch1, touch2);
  let zoomFactor = newDistance / lastTouchDistance;
  lastTouchDistance = newDistance;
								
								// Aprēķina pieskārienu centru
								const centerX = (touch1.clientX + touch2.clientX) / 2;
								const centerY = (touch1.clientY + touch2.clientY) / 2;
								
								// Pielāgo attēla pozīciju, lai tālummaiņa notiktu vietā, kur lietotājs pietuvina
								imgX = centerX - (centerX - imgX) * zoomFactor;
								imgY = centerY - (centerY - imgY) * zoomFactor;
								
								imgScale *= zoomFactor;
								drawImage();
							}
						});



						canvas.addEventListener('touchend', () => {
							dragging = false;
						});

function canvasTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}




						function startResize(e) {
							e.preventDefault();
							resizing = true;
							startX = e.clientX || e.touches[0].clientX;
							startY = e.clientY || e.touches[0].clientY;
							startWidth = imgWidth;
							startHeight = imgHeight;
							document.addEventListener('mousemove', resizeImage);
							document.addEventListener('mouseup', stopResize);
							document.addEventListener('touchmove', resizeImage);
							document.addEventListener('touchend', stopResize);
						}

						function resizeImage(e) {
							if (resizing) {
								let dx = (e.clientX || e.touches[0].clientX) - startX;
								let dy = (e.clientY || e.touches[0].clientY) - startY;
								imgWidth = Math.max(50, startWidth + dx);
								imgHeight = Math.max(50, startHeight + dy);
								drawImage();
							}
						}

						function stopResize() {
							resizing = false;
							document.removeEventListener('mousemove', resizeImage);
							document.removeEventListener('mouseup', stopResize);
							document.removeEventListener('touchmove', resizeImage);
							document.removeEventListener('touchend', stopResize);
						}

						// Piesaiste rokturim pie attēla
function positionResizeHandle(show) {
  if (!resizeHandle) return;

  const canvasHidden = getComputedStyle(canvas).display === 'none';
  if (!show || !hasImage() || canvasHidden) {
    resizeHandle.style.display = 'none';
    return;
  }


  // Padarām mērāmu, bet neredzamu, lai iegūtu pareizos offsetWidth/Height
  const prevVis  = resizeHandle.style.visibility;
  const prevDisp = resizeHandle.style.display;
  resizeHandle.style.visibility = 'hidden';
  resizeHandle.style.display    = 'block';

  const rect   = canvas.getBoundingClientRect();
  const pageX  = rect.left + window.scrollX;
  const pageY  = rect.top  + window.scrollY;
  const scaleX = rect.width  / canvas.width;
  const scaleY = rect.height / canvas.height;

const cs = getComputedStyle(resizeHandle);
const w = resizeHandle.offsetWidth  || parseInt(cs.width)  || 12;
const h = resizeHandle.offsetHeight || parseInt(cs.height) || 12;


  const imgCssW = imgWidth  * imgScale * scaleX;
  const imgCssH = imgHeight * imgScale * scaleY;
  const imgCssX = pageX + (imgX * scaleX);
  const imgCssY = pageY + (imgY * scaleY);

  let left = imgCssX + imgCssW - w;
  let top  = imgCssY + imgCssH - h;

  // Stingri iekš attēla robežām
  left = Math.max(imgCssX, Math.min(imgCssX + imgCssW - w, left));
  top  = Math.max(imgCssY, Math.min(imgCssY + imgCssH - h, top));

  resizeHandle.style.left       = left + 'px';
  resizeHandle.style.top        = top  + 'px';
  resizeHandle.style.visibility = prevVis || 'visible';
  resizeHandle.style.display    = 'block';
}






						// Attēla augšupielāde
						const uploadBtn = document.getElementById('uploadMap');
						if (uploadBtn) {
							uploadBtn.addEventListener('click', () => {
								const fileInput = document.createElement('input');
								fileInput.type = 'file';
								fileInput.accept = 'image/*';
								fileInput.addEventListener('change', (event) => {
									const file = event.target.files[0];
									if (file) {
										const reader = new FileReader();
										reader.onload = (e) => {
											img.src = e.target.result; // Ielādē attēlu
										};
										reader.readAsDataURL(file);
									}
								});
								fileInput.click();
							});
						}

							

						




function drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!hasImage()) {
    // nav vēl bilde – NEzīmējam neko un slēpjam rokturi
    positionResizeHandle(false);
    return;
  }

  // 1) Karte
  ctx.drawImage(img, imgX, imgY, imgWidth * imgScale, imgHeight * imgScale);

  // 2) Tumšošana tikai virs kartes
  if (mapDarken > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,' + mapDarken + ')';
    ctx.fillRect(imgX, imgY, imgWidth * imgScale, imgHeight * imgScale);
    ctx.restore();
  }

  // 3) Sarkanais rāmis
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'red';
  ctx.strokeRect(imgX, imgY, imgWidth * imgScale, imgHeight * imgScale);

  // 4) Roktura pozīcija + parādīšana
// Vecais
//	positionResizeHandle(true);
// jaunais
positionResizeHandle(getComputedStyle(canvas).display !== 'none');
}

						



						function isMobileDevice() {
							const userAgent = navigator.userAgent.toLowerCase();
							const isMobileUserAgent = /iphone|ipad|ipod|android|blackberry|bb10|opera mini|iemobile|windows phone|mobile|tablet/.test(userAgent);
							const isSmallScreen = window.innerWidth < 1024; 
							const isHighDPR = window.devicePixelRatio > 1.5;

							return isMobileUserAgent || (isSmallScreen && isHighDPR);
						}

						function showMessageForDesktopOnly() {
							const fullscreenMessage = document.getElementById('fullscreenMessage');

							if (!isMobileDevice()) {
								fullscreenMessage.classList.remove('fs-message-hidden');
							} else {
								fullscreenMessage.classList.add('fs-message-hidden');
							}
						}

						window.addEventListener('load', showMessageForDesktopOnly);
						window.addEventListener('resize', showMessageForDesktopOnly);


						// Sākotnējais izsaukums
						handleResize();


						checkWindowSize();
						window.addEventListener('resize', checkWindowSize);
						
		
						// Pievienojam compassContainer funkcijas pēc tam, kad ir definēts canvas, mapImage utt.

						// Atlasām compassContainer elementu
							const compassContainer = document.getElementById('compassContainer');
							const compassInner = document.getElementById('compassInner');
							const compassScaleContainer = document.getElementById('compassScaleContainer');
							const compassScaleInner = document.getElementById('compassScaleInner');
							const compassNeedle = document.getElementById('compassNeedle');
							const toggleRotationModeButton = document.getElementById('toggleRotationMode');
							const lockRotationModeButton = document.getElementById('lockRotationMode');
							const resetCompassButton = document.getElementById('resetCompass');
//							// Sākotnējās vērtības, lai atjaunotu kompasu
//							const initialCompassLeft = 550; // Sākotnējā X pozīcija
//							const initialCompassTop = 60; // Sākotnējā Y pozīcija
//							const initialGlobalScale = 1; // Sākotnējais mērogs
//							const initialBaseRotation = 0; // Sākotnējā bāzes rotācija
//							const initialScaleRotation = 70; // Sākotnējā skalas rotācija


						// Sākotnējie mainīgie priekš pārvietošanas, rotācijas, mēroga
							let compassIsDragging = false;
							let compassDragStartX = 0;
							let compassDragStartY = 0;
							let compassStartLeft = 0;   // Sākotnējās pozīcijas - var mainīt pēc vajadzības
							let compassStartTop = 0;    // Sākotnējās pozīcijas
							let activeRotationTarget = 'compassInner'; //  Kontrolējam, vai rotējam bāzi vai skalu
							let isTouchingCompass = false; // Lai sekotu līdzi, vai skar kompasu
							let touchStartX = 0; // Pirmais pieskāriena punkts X koordinā
							let touchStartY = 0; // Pirmais pieskāriena punkts Y koordinā
							let isRotationLocked = false; // Vai rotācija ir bloķēta

						// Jaunie mainīgie atsevišķām transformācijām
							let globalScale = 1;      // mērogs visam kompasam (compassScaleContainer)
							let baseRotation = 0;     // rotācija bāzei (compassInner)
							let scaleRotation = 70;    // rotācija skalai (compassScaleInner)
let lastRotation = 0;     // pinch/rotate aprēķinam




// Sākumstāvoklis vienuviet
const COMPASS_INIT = { left: 550, top: 60, scale: 1, base: 0, scaleRot: 70 };

function resetCompassToInitial(){
  compassStartLeft = COMPASS_INIT.left;
  compassStartTop  = COMPASS_INIT.top;
  globalScale      = COMPASS_INIT.scale;
  baseRotation     = COMPASS_INIT.base;
  scaleRotation    = COMPASS_INIT.scaleRot;
  updateCompassTransform();
}







						// Helper funkcijas
						function getDistance(touch1, touch2) {
						  const dx = touch2.clientX - touch1.clientX;
						  const dy = touch2.clientY - touch1.clientY;
						  return Math.sqrt(dx * dx + dy * dy);
						}

						function getAngle(touch1, touch2) {
						  const dx = touch2.clientX - touch1.clientX;
						  const dy = touch2.clientY - touch1.clientY;
						  return Math.atan2(dy, dx) * (180 / Math.PI);
						}


						// === FUNKCIJA POGAS NŪKOŠANAI (tikai skārienierīcēs) ===



if (toggleRotationModeButton) {
  toggleRotationModeButton.addEventListener('click', () => {
    activeRotationTarget = (activeRotationTarget === 'compassInner')
      ? 'compassScaleInner'
      : 'compassInner';

    toggleRotationModeButton.style.backgroundColor =
      (activeRotationTarget === 'compassInner') ? 'rgba(91, 16, 16, 0.8)' : 'rgb(187, 1, 1)';
  });
}




						// Notikumu klausītājs pogai, kas bloķē rotāciju
						if (lockRotationModeButton) {
							lockRotationModeButton.addEventListener('click', () => {
								isRotationLocked = !isRotationLocked; // Mainām bloķēšanas statusu
								lockRotationModeButton.classList.toggle('active', isRotationLocked); // Pievienojam vai noņemam aktīvo klasi
							});
						}

						// Pārbaudām, vai poga eksistē
if (resetCompassButton) {
  resetCompassButton.addEventListener('click', () => {
    // gludai animācijai
    compassContainer.classList.add('with-transition');
    compassInner.classList.add('with-transition');
    compassScaleInner.classList.add('with-transition');
    compassScaleContainer.classList.add('with-transition');

    // reāli atjauno sākumstāvokli
    resetCompassToInitial();

    // pēc pārejas noņem klases
    setTimeout(() => {
      compassContainer.classList.remove('with-transition');
      compassInner.classList.remove('with-transition');
      compassScaleInner.classList.remove('with-transition');
      compassScaleContainer.classList.remove('with-transition');
    }, 500);
  });
}



						// Atjauno transformācijas
// DROŠA versija: vienmēr pārvaicā DOM un iziet, ja kas nav gatavs
function updateCompassTransform() {
  const container   = document.getElementById('compassContainer');
  const inner       = document.getElementById('compassInner');
  const scaleWrap   = document.getElementById('compassScaleContainer');
  const scaleInner  = document.getElementById('compassScaleInner');
  if (!container || !inner || !scaleWrap || !scaleInner) return;

  // 1) FORCĒTA pozicionēšana (der arī vecajiem dzinējiem)
  container.style.setProperty('position','absolute','important');
  container.style.setProperty('left', compassStartLeft + 'px', 'important');
  container.style.setProperty('top',  compassStartTop  + 'px', 'important');

  // 2) NEITRALIZĒ jebkuru CSS translate uz konteinera
  var t0 = 'translate(0,0)';
  container.style.transform       = t0;
  container.style.webkitTransform = t0;  // vecs WebKit
  container.style.msTransform     = t0;  // IE9–11

  // 3) Mērogs visam kompasam
  var s = 'scale(' + globalScale + ')';
  scaleWrap.style.transform       = s;
  scaleWrap.style.webkitTransform = s;
  scaleWrap.style.msTransform     = s;

  // 4) Rotācija bāzei
  var r1 = 'rotate(' + baseRotation + 'deg)';
  inner.style.transform       = r1;
  inner.style.webkitTransform = r1;
  inner.style.msTransform     = r1;

  // 5) Rotācija skalai
  var r2 = 'rotate(' + scaleRotation + 'deg)';
  scaleInner.style.transform       = r2;
  scaleInner.style.webkitTransform = r2;
  scaleInner.style.msTransform     = r2;
}





// Nodrošinām, lai stili tiek piemēroti
// Inicializē kompasu tikai tad, kad elementi tiešām ir DOM
(function initCompassSafe(){
  const start = () => {
    const ok =
      document.getElementById('compassContainer') &&
      document.getElementById('compassInner') &&
      document.getElementById('compassScaleContainer') &&
      document.getElementById('compassScaleInner');

    if (!ok) { requestAnimationFrame(start); return; }

    // 1) iestati sākuma stāvokli
    resetCompassToInitial();

    // 2) pārvelc vēlreiz nākamajā kadrā — vecie pārlūki ķeras tieši šeit
    requestAnimationFrame(updateCompassTransform);

    // 3) drošības pēc arī pēc pilnas ielādes
    window.addEventListener('load', updateCompassTransform, { once:true });

    // uzturi saskaņotu uz izmēru maiņām
    window.addEventListener('resize',            updateCompassTransform);
    window.addEventListener('orientationchange', updateCompassTransform);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else {
    start();
  }
})();

setTimeout(updateCompassTransform, 0);



// LongTask → pārkrāso kompasu nākamajā kadra brīdī
(function longTaskHeal(){
  if (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
    const po = new PerformanceObserver(() => {
      requestAnimationFrame(() => {
        try { updateCompassTransform(); } catch(e){}
      });
    });
    po.observe({ entryTypes: ['longtask'] });
  }
})();

// “Watchdog” – līdz kompasa inline stāvoklis tiešām ir uzlikts
(function compassWatchdog(){
  const MAX_MS = 2000, STEP = 80;
  let t = 0, id = null;

  function tick(){
    try { resetCompassToInitial(); updateCompassTransform(); } catch(e){}
    const c = document.getElementById('compassContainer');
    if (!c) { id = setTimeout(tick, STEP); t+=STEP; return; }

    const cs   = getComputedStyle(c);
    const left = parseFloat(cs.left)  || 0;
    const top  = parseFloat(cs.top)   || 0;
    const ok   = Math.abs(left - (COMPASS_INIT.left || 0)) < 1 &&
                 Math.abs(top  - (COMPASS_INIT.top  || 0)) < 1;

    if (!ok && t < MAX_MS) { id = setTimeout(tick, STEP); t+=STEP; }
  }

  // startē drīz, bet ne uzreiz (dod vietu citiem starta darbiem)
  setTimeout(tick, 0);
  window.addEventListener('load', tick, {once:true});
})();
















						const rotateCompass90Button = document.getElementById('rotateCompass90');
						let isCompassLocked = false; // Lai sekotu, vai kompass ir bloķēts

						if (rotateCompass90Button) {
							rotateCompass90Button.addEventListener('click', function () {
								if (!isCompassLocked) {
									// Izveido popup izvēlni
									const popupMenu = document.createElement('div');
									popupMenu.id = 'popupMenu';

									// Izveido popup saturu
									const menuTitle = document.createElement('p');
									menuTitle.textContent = 'Izvēlieties noteikšanas metodi:';
									popupMenu.appendChild(menuTitle);

									// Izveido pogu rindu
									const buttonRow = document.createElement('div');
									buttonRow.className = 'button-row';

									// 1. poga ar jauno attēlu
									const rotate90Button = document.createElement('button');
									rotate90Button.id = 'rotateTo90';
									rotate90Button.className = 'popup-button';
									const rotate90Image = document.createElement('img');
									rotate90Image.src = 'https://site-710050.mozfiles.com/files/710050/GRID_VIEW_1_1.png';
									rotate90Image.alt = 'Rotēt 90°';
									rotate90Button.appendChild(rotate90Image);
									buttonRow.appendChild(rotate90Button);

									// 2. poga ar jauno attēlu
									const rotateNegative90Button = document.createElement('button');
									rotateNegative90Button.id = 'rotateToNegative90';
									rotateNegative90Button.className = 'popup-button';
									const rotateNegative90Image = document.createElement('img');
									rotateNegative90Image.src = 'https://site-710050.mozfiles.com/files/710050/GRID_VIEW_2.png';
									rotateNegative90Image.alt = 'Rotēt -90°';
									rotateNegative90Button.appendChild(rotateNegative90Image);
									buttonRow.appendChild(rotateNegative90Button);

									popupMenu.appendChild(buttonRow);
									document.body.appendChild(popupMenu);

									rotate90Button.addEventListener('click', () => {
										compassInner.classList.add('with-transition'); 
										compassScaleInner.classList.add('with-transition');

										baseRotation = 90; 
										updateCompassTransform(); 

										isRotationLocked = true; 
										lockRotationModeButton.classList.add('active'); 
										rotateCompass90Button.classList.add('active'); 
										isCompassLocked = true;

										setTimeout(() => {
											compassInner.classList.remove('with-transition');
											compassScaleInner.classList.remove('with-transition');
										}, 500);

										document.body.removeChild(popupMenu); 
									});

									rotateNegative90Button.addEventListener('click', () => {
										compassInner.classList.add('with-transition'); 
										compassScaleInner.classList.add('with-transition'); 

										baseRotation = -90; 
										updateCompassTransform(); 

										isRotationLocked = true; 
										lockRotationModeButton.classList.add('active'); 
										rotateCompass90Button.classList.add('active'); 
										isCompassLocked = true;

										setTimeout(() => {
											compassInner.classList.remove('with-transition');
											compassScaleInner.classList.remove('with-transition');
										}, 500);

										document.body.removeChild(popupMenu); 
									});
								} else {
									isRotationLocked = false; 
									lockRotationModeButton.classList.remove('active'); 
									rotateCompass90Button.classList.remove('active'); 
									isCompassLocked = false;
								}
							});
						}

						// Event listeneri pārvietošanai
							compassContainer.addEventListener('mousedown', (e) => {
							  e.preventDefault(); // Neļauj pārlūkam mēģināt vilkt attēlu
							  compassIsDragging = true;
							  const rect = compassContainer.getBoundingClientRect();
							  compassDragStartX = e.clientX - rect.left;
							  compassDragStartY = e.clientY - rect.top;
							  e.stopPropagation();
							});


							// Skārienu apstrāde (drag, pinch zoom, rotate)
							compassContainer.addEventListener('touchstart', (e) => {
								e.preventDefault();
								if (e.touches.length === 1) { 
									isTouchingCompass = true;
									touchStartX = e.touches[0].clientX;
									touchStartY = e.touches[0].clientY;

									// Aktivizējam velkšanas funkcionalitāti
									compassDragStartX = e.touches[0].clientX - compassStartLeft;
									compassDragStartY = e.touches[0].clientY - compassStartTop;
								} else if (e.touches.length === 2) { 
									lastTouchDistance = getDistance(e.touches[0], e.touches[1]);
									lastRotation = getAngle(e.touches[0], e.touches[1]);
								}
							});

							document.addEventListener('mousemove', (e) => {
							  if (compassIsDragging) {
								compassStartLeft = e.clientX - compassDragStartX;
								compassStartTop = e.clientY - compassDragStartY;
								updateCompassTransform();
							  }
							});

							document.addEventListener('mouseup', () => {
							  compassIsDragging = false;
							});


							// Skārienkustību apstrāde (drag, pinch zoom, rotate)
							compassContainer.addEventListener('touchmove', (e) => {
								e.preventDefault();
								if (e.touches.length === 1 && isTouchingCompass) { // Dragging
									const dx = e.touches[0].clientX - touchStartX;
									const dy = e.touches[0].clientY - touchStartY;

									compassStartLeft = e.touches[0].clientX - compassDragStartX;
									compassStartTop = e.touches[0].clientY - compassDragStartY;
									
									updateCompassTransform();
								} 
								else if (e.touches.length === 2) { // Pinch zoom and rotate
								const newDistance = getDistance(e.touches[0], e.touches[1]);
								globalScale *= newDistance / lastTouchDistance;
								lastTouchDistance = newDistance;

								if (!isRotationLocked) { // Pārbaudām, vai rotācija ir bloķēta
									const newRotation = getAngle(e.touches[0], e.touches[1]);
									if (activeRotationTarget === 'compassInner') {
										baseRotation += newRotation - lastRotation;
									} else if (activeRotationTarget === 'compassScaleInner') {
										scaleRotation += newRotation - lastRotation;
									}
									lastRotation = newRotation;
								}

								updateCompassTransform();
							}

							});


							compassContainer.addEventListener('touchend', () => {
								isTouchingCompass = false;
							});


							// Mērogšana un rotācija - izmanto peles ritenīti virs compassContainer
								compassContainer.addEventListener('wheel', (e) => {
								  e.preventDefault();
								  // SHIFT + wheel -> bāzes rotācija
								  // ALT + wheel -> mērogs
								  // CTRL + wheel -> skalas rotācija (piemēram, ja vajag atsevišķi kontrolēt skalu)
								  if (e.shiftKey) {
									// Rotējam bāzi
									baseRotation += e.deltaY * 0.005;
								  } else if (e.altKey) {
									// Mainam mērogu visam kompasam
									globalScale += e.deltaY * -0.0005;
									globalScale = Math.min(Math.max(0.5, globalScale), 5); // Ierobežojam mērogu
								  } else if (e.ctrlKey) {
									// Rotējam skalu
									scaleRotation += e.deltaY * 0.005;
								  }
								  updateCompassTransform();
								}, { passive: false });

							// Tastatūras bultiņas - piemērs: pa kreisi/pa labi bāzes rotācija, uz augšu/uz leju skalas rotācija
								document.addEventListener('keydown', (e) => {
								  if (e.key === 'ArrowLeft') {
									baseRotation -= 5; // pa kreisi rotācija bāzei
								  } else if (e.key === 'ArrowRight') {
									baseRotation += 5; // pa labi rotācija bāzei
								  } else if (e.key === 'ArrowUp') {
									scaleRotation += 5; // skalas rotācija
								  } else if (e.key === 'ArrowDown') {
									scaleRotation -= 5; // pretējā virziena skalas rotācija
								  }
								  updateCompassTransform();
								});

							// Kad logs ielādējas, novietojam kompasu sākuma pozīcijā
window.addEventListener('load', resetCompassToInitial);

							

	
								(function() {
								const toggleFullscreenButton = document.getElementById('toggleFullscreen');
								const fullscreenIcon = document.getElementById('fullscreenIcon');
								const fullscreenPopup = document.getElementById('fullscreenPopup');
  if (!toggleFullscreenButton || !fullscreenIcon || !fullscreenPopup) return;
								const enterFullscreenIcon = 'https://site-710050.mozfiles.com/files/710050/icon_fullscreen_enter.png';
								const exitFullscreenIcon = 'https://site-710050.mozfiles.com/files/710050/icon_fullscreen_exit.png';

								// Iestatām sākotnējo ikonu
								fullscreenIcon.src = enterFullscreenIcon;

								toggleFullscreenButton.addEventListener('click', () => {
									const elem = document.documentElement;
									if (!isFullscreenActive()) {
										enterFullscreen(elem);
									} else {
										exitFullscreen();
									}
								});

								function enterFullscreen(elem) {
									if (elem.requestFullscreen) {
										elem.requestFullscreen().catch(err => console.warn('Pilnekrāna kļūda:', err));
									} else if (elem.webkitRequestFullscreen) {
										elem.webkitRequestFullscreen();
									} else if (elem.msRequestFullscreen) {
										elem.msRequestFullscreen();
									} else if (elem.mozRequestFullScreen) {
										elem.mozRequestFullScreen();
									}
								}

								function exitFullscreen() {
									if (document.exitFullscreen) {
										document.exitFullscreen().catch(err => console.warn('Iziešanas kļūda:', err));
									} else if (document.webkitExitFullscreen) {
										document.webkitExitFullscreen();
									} else if (document.msExitFullscreen) {
										document.msExitFullscreen();
									} else if (document.mozCancelFullScreen) {
										document.mozCancelFullScreen();
									}
								}

								function updateButtonState() {
									if (isFullscreenActive()) {
										fullscreenIcon.src = exitFullscreenIcon;
										toggleFullscreenButton.classList.add('active');
										showPopupMessage('Pilnekrāna režīms ieslēgts', 'popup-success');
									} else {
										fullscreenIcon.src = enterFullscreenIcon;
										toggleFullscreenButton.classList.remove('active');
										showPopupMessage('Pilnekrāna režīms izslēgts', 'popup-error');
									}
								}

								function isFullscreenActive() {
									return document.fullscreenElement || 
										   document.webkitFullscreenElement || 
										   document.mozFullScreenElement || 
										   document.msFullscreenElement;
								}

								function showPopupMessage(message, popupClass) {
									fullscreenPopup.textContent = message;
									fullscreenPopup.className = ''; 
									fullscreenPopup.classList.add(popupClass);
									fullscreenPopup.style.display = 'block';

									setTimeout(() => {
										fullscreenPopup.style.display = 'none';
									}, 4000);
								}

								// Klausītāji
								document.addEventListener('fullscreenchange', updateButtonState);
								document.addEventListener('webkitfullscreenchange', updateButtonState);
								document.addEventListener('mozfullscreenchange', updateButtonState);
								document.addEventListener('MSFullscreenChange', updateButtonState);

								window.addEventListener('keydown', (e) => {
									if (e.key === 'Escape') {
										exitFullscreen();
									}
								});

								window.addEventListener('visibilitychange', function () {
									if (!document.hidden) {
										updateButtonState();
									}
								});
							})();




on(byId("toggleMaterials"), "click", function() {
  let menu = byId("dropdownMaterials");
  let toggleButton = byId("toggleMaterials");
  if (!menu || !toggleButton) return;
  menu.classList.toggle("visible");
  toggleButton.classList.toggle("active");
});

on(byId("toggleInstruction"), "click", function() {
  let menu = byId("dropdownInstruction");
  let toggleButton = byId("toggleInstruction");
  if (!menu || !toggleButton) return;
  menu.classList.toggle("visible");
  toggleButton.classList.toggle("active");
});


							document.addEventListener("click", function(event) {
								let instructionMenu = document.getElementById("dropdownInstruction");
								let materialsMenu = document.getElementById("dropdownMaterials");
								let instructionButton = document.getElementById("toggleInstruction");
								let materialsButton = document.getElementById("toggleMaterials");

								if (!instructionMenu.contains(event.target) && !instructionButton.contains(event.target)) {
									instructionMenu.classList.remove("visible");
									instructionButton.classList.remove("active");
								}

								if (!materialsMenu.contains(event.target) && !materialsButton.contains(event.target)) {
									materialsMenu.classList.remove("visible");
									materialsButton.classList.remove("active");
								}
							});


							//ATVER IFRAME MACIBU MATERIALI
							document.querySelectorAll('.dropdown-menu a').forEach(link => {
								link.addEventListener('click', function(event) {
									event.preventDefault();

									let iframe = document.getElementById('contentFrame');
									let dropdownMenus = document.querySelectorAll('.dropdown-menu');

									// Parāda iframe un palielina tā augstumu līdz 85vh
									iframe.style.display = 'block';
									iframe.classList.add('active');
									iframe.src = this.getAttribute('href');

									// Paceļ dropdown pogas uz augšu
									dropdownMenus.forEach(menu => menu.classList.add('shrink'));
								});
							});



							// Aizver iframe un atgriež sākotnējo pogu un iframe pozīciju MACIBU MATERIALI
							on(byId("toggleMaterials"),  "click", function() {
								let iframe = document.getElementById('contentFrame');
								let dropdownMenus = document.querySelectorAll('.dropdown-menu');

								// Paslēpj iframe un atjauno sākotnējo augstumu
								iframe.classList.remove('active');
								setTimeout(() => {
									iframe.style.display = 'none';
									iframe.src = ""; // Noņem saturu
								}, 300); // Aizkave, lai CSS animācija pabeigtos pirms iframe slēpšanas

								// Atjauno dropdown pogu pozīciju
								dropdownMenus.forEach(menu => menu.classList.remove('shrink'));
							});



							// Atver iframe priekš "Lietotāja ceļveža"
							document.querySelectorAll('#dropdownInstruction a').forEach(link => {
								link.addEventListener('click', function(event) {
									event.preventDefault();

									let iframe = document.getElementById('instructionFrame'); // Lietotāja ceļveža iframe
									let dropdownMenus = document.getElementById('dropdownInstruction');

									// Parāda iframe un ielādē saiti
									iframe.style.display = 'block';
									iframe.classList.add('active');
									iframe.src = this.getAttribute('href');

									// Paslēpj izvēlni
									dropdownMenus.classList.add('shrink');
								});
							});

							// Aizver iframe un atjauno sākotnējo pogu un iframe pozīciju priekš "Lietotāja ceļveža"
							on(byId("toggleInstruction"),"click", function() {
								let iframe = document.getElementById('instructionFrame'); // Lietotāja ceļveža iframe
								let dropdownMenus = document.getElementById('dropdownInstruction');

								iframe.classList.remove('active');
								setTimeout(() => {
									iframe.style.display = 'none';
									iframe.src = ""; // Notīra saturu
								}, 300);

								dropdownMenus.classList.remove('shrink');
							});




							document.querySelectorAll('.dropdown-menu a').forEach(link => {
								link.addEventListener('click', function(event) {
									event.preventDefault();
									let iframe = document.getElementById('contentFrame');
									let dropdownMenus = document.querySelectorAll('.dropdown-menu');

									// Ielādē saiti iframe un parāda to
									iframe.style.display = 'block';
									iframe.classList.add('active');
									iframe.src = this.getAttribute('href');

									// Paceļ dropdown pogas uz augšu
									dropdownMenus.forEach(menu => menu.classList.add('shrink'));
								});
							});




							// Atver atsauksmes un ziņojumi
							function toggleIframeAbout(event) {
								if (event) event.preventDefault(); // Novērš noklusēto darbību

								let iframeContainer = document.getElementById("iframeContainerAbout");
								let computedStyle = window.getComputedStyle(iframeContainer);

								console.log("Poga nospiesta!");
								console.log("iframeContainer sākuma statuss:", {
									display: computedStyle.display,
									bottom: computedStyle.bottom
								});

								if (computedStyle.display === "none" || computedStyle.bottom === "-620px") {
									console.log("Atveram iframe...");
									iframeContainer.style.display = "block";
									setTimeout(() => {
										iframeContainer.style.bottom = "35px"; // Slīd uz augšu no apakšas
										console.log("iframeContainer pēc atvēršanas:", {
											display: iframeContainer.style.display,
											bottom: iframeContainer.style.bottom
										});
									}, 10);
								} else {
									console.log("Aizveram iframe...");
									iframeContainer.style.bottom = "-620px"; // Slīd atpakaļ uz leju
									setTimeout(() => {
										iframeContainer.style.display = "none";
										console.log("iframeContainer pēc aizvēršanas:", {
											display: iframeContainer.style.display,
											bottom: iframeContainer.style.bottom
										});
									}, 500);
								}
							}





							document.addEventListener("DOMContentLoaded", function () {
								let iframeContainer = document.getElementById("iframeContainerAbout");

								// Pārliecinās, ka iframe sākumā ir paslēpts
								iframeContainer.style.display = "none";
								iframeContainer.style.bottom = "-220px";
								console.log("iframeContainer iestatīts uz slēgtu stāvokli lapas ielādē!");
							});





							// QR koda atvēršana/aizvēršana
							function toggleIframeQR(event) {
								if (event) event.preventDefault();

								let iframeContainer = document.getElementById("iframeContainerQR");
								let computedStyle = window.getComputedStyle(iframeContainer);

								if (computedStyle.display === "none" || computedStyle.bottom === "-370px") {
									iframeContainer.style.display = "block";
									setTimeout(() => {
										iframeContainer.style.bottom = "35px";
									}, 10);
								} else {
									iframeContainer.style.bottom = "-370px";
									setTimeout(() => {
										iframeContainer.style.display = "none";
									}, 500);
								}
							}

							// Paslēpj QR kodu sākumā
							document.addEventListener("DOMContentLoaded", function () {
								let iframeContainer = document.getElementById("iframeContainerQR");
								iframeContainer.style.display = "none";
								iframeContainer.style.bottom = "-370px";
							});




							(function(){
							  var bc = document.getElementById('buttonContainer');
							  if(!bc) return;
							
							  /* 1) Izveido “čaulu” un ieliek visas esošās pogas iekšā,
							        + pievieno etiķeti un kupola SVG */
							  var shell = document.createElement('div');
							  shell.className = 'dock-shell';

shell.setAttribute('data-no-gap-fix', '1');
if (bc) bc.setAttribute('data-no-gap-fix', '1'); // izmanto jau esošo 'var bc'

							
							  // savācam tikai tiešos bērnus, kas ir pogas:
							  var btns = [];
							  for (var i = bc.children.length - 1; i >= 0; i--) {
							    var el = bc.children[i];
							    if (el.tagName === 'BUTTON') btns.push(el);
							  }
							  btns.reverse().forEach(function(b){ shell.appendChild(b); });
							
							  // izveido label + cap
							  var dockLabel = document.createElement('div');
							  dockLabel.className = 'dock-label';
							  var dockCap = document.createElement('svg');
							  dockCap.className = 'dock-cap'; dockCap.setAttribute('aria-hidden','true');
							
							  // ieliekam shell un pēc tam label+cap (būt bērni “shell”, lai ģeometrija būtu relatīva)
							  bc.appendChild(shell);
							  shell.appendChild(dockCap);
							  shell.appendChild(dockLabel);

							
							  /* — DIMMERA UI — */
							  var dimWrap = document.createElement('div');
							  dimWrap.className = 'dock-dimmer';
							  dimWrap.innerHTML =
							    '<input id="mapDimmerRange" type="range" min="0" max="80" step="1">' +
							    '<span class="value" id="mapDimmerValue"></span>';
							  shell.insertBefore(dimWrap, shell.firstChild);

								// Uzreiz pēc slīdņa ielikšanas DOM
								setTimeout(function () {
								  const bc = document.getElementById('buttonContainer');
								  const range = document.getElementById('mapDimmerRange');
								  if (!bc || !range) return;
								
								  const apply = () => {
								    const side = bc.classList.contains('left') || bc.classList.contains('right');
								    if (side) {
								      range.setAttribute('orient','vertical');
								      range.classList.add('range-vertical');
								    } else {
								      range.removeAttribute('orient');
								      range.classList.remove('range-vertical');
								    }
								  };
								
								  // sākumā + turpmāk, kad mainās #buttonContainer klases
								  apply();
								  new MutationObserver(apply).observe(bc, { attributes:true, attributeFilter:['class'] });
								}, 0);


   
								// Tooltipam un fokusam (tāpat kā pogām)
								dimWrap.setAttribute('data-title', 'Tumšināt karti');
								dimWrap.setAttribute('aria-label', 'Tumšināt karti');
								dimWrap.setAttribute('tabindex', '0');
								dimWrap.id = 'mapDimmer'; // ne obligāti, bet noderīgi
								
								  // sasaistām ar mainīgo + localStorage
								  var dimRange = dimWrap.querySelector('#mapDimmerRange');
								window.__bindDimmer && window.__bindDimmer(dimRange);

								  var dimValue = dimWrap.querySelector('#mapDimmerValue');
								
								  var stored = +(localStorage.getItem('mapDarken') || 0);
								  mapDarken = stored / 100;        // izmanto globālo mainīgo no 2. soļa
								  dimRange.value = stored;
								  dimValue.textContent = stored + '%';
								
								  dimRange.addEventListener('input', function(e){
  const v = +e.target.value;
  setDarkness(v);            // sinhronizē canvas + onlineMap un saglabā localStorage
  dimValue.textContent = v + '%';
  setRangeFill(dimRange);    // atjauno CSS progresu
});

							
								function setRangeFill(el){
								  const min = +el.min || 0, max = +el.max || 100, val = +el.value || 0;
								  const p = (val - min) * 100 / (max - min); // 0..100
								  el.style.setProperty('--p', p);
								}
								setRangeFill(dimRange);
								dimRange.addEventListener('input', e => setRangeFill(e.target));
								
								
								
								// ⬇️ Pievieno šo — sākotnēji iestata pareizu pārklājumu (span)
								window.__updateDimmerWidth && window.__updateDimmerWidth();


 
							  /* 2) Pievieno etiķešu tekstus (ja nav), saglabājot Tavu ID loģiku */
							  var titlesById = {
							    resetMap:        'Restartēt karti',
							    uploadMap:       'Augšupielādēt karti',
							    resetCompass:    'Restartēt kompasu',
							    toggleRotationMode: 'Griezt bāzi / skalu',
							    lockRotationMode:   'Bloķēt rotāciju',
							    rotateCompass90: 'Tīklveida režīms',
							    toggleFullscreen:'Pilnekrāna režīms'
							  };
							 var allTriggers = shell.querySelectorAll('button, .dock-dimmer');
							 allTriggers.forEach ? allTriggers.forEach(setTitle) : [].slice.call(allTriggers).forEach(setTitle);

							  function setTitle(b){
							    var id=b.id||'';
							    if(!b.getAttribute('data-title') && titlesById[id]) b.setAttribute('data-title', titlesById[id]);
							    if(!b.getAttribute('aria-label') && titlesById[id]) b.setAttribute('aria-label', titlesById[id]);
							  }
							
							  /* 3) Kupola ģeometrija (horizontālam izvietojumam) */
							  function updateCapGeometry(){
							    var cs = getComputedStyle(shell);
							    var labelW = parseFloat(cs.getPropertyValue('--labelW')) || 0;
							    var extra  = parseFloat(cs.getPropertyValue('--capExtraW')) || 0;
							    var w = labelW + 22 + extra;
							    var h = parseFloat(cs.getPropertyValue('--capH')) || 0;
							    var inset = parseFloat(cs.getPropertyValue('--capSkew')) || 0;
							    var r = parseFloat(cs.getPropertyValue('--capR')) || 0;
							    if(!w || !h) return;
							
							    var TLx = inset + r, TRx = w - inset - r;
							    var LEx = inset, LEy = r;
							    var REx = w - inset, REy = r;
							
							    var sideMidY = r + (h - r) * 0.45;
							    var rightCP1x = REx + (w - REx) * 0.18, rightCP1y = sideMidY;
							    var rightCP2x = w, rightCP2y = r + (h - r) * 0.82;
							    var leftCP2x  = 0,  leftCP2y  = r + (h - r) * 0.82;
							    var leftCP1x  = LEx - (LEx - 0) * 0.18, leftCP1y  = sideMidY;
							
							    dockCap.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
							    dockCap.setAttribute('width', w);
							    dockCap.setAttribute('height', h);
							    dockCap.innerHTML =
							      '<defs>' +
							        '<linearGradient id="capFill" x1="0" y1="0" x2="0" y2="1">' +
							          '<stop offset="0%"  stop-color="rgba(40,44,52,.96)"/>' +
							          '<stop offset="100%" stop-color="rgba(30,33,40,.96)"/>' +
							        '</linearGradient>' +
							        '<radialGradient id="capShine" cx="50%" cy="-30%" r="120%">' +
							          '<stop offset="0%" stop-color="rgba(255,255,255,.18)"/>' +
							          '<stop offset="60%" stop-color="rgba(255,255,255,0)"/>' +
							        '</radialGradient>' +
							      '</defs>' +
							      '<path d="' +
							        'M ' + TLx + ',0 H ' + TRx + ' A ' + r + ',' + r + ' 0 0 1 ' + REx + ',' + REy + ' ' +
							        'C ' + rightCP1x + ',' + rightCP1y + ' ' + rightCP2x + ',' + rightCP2y + ' ' + w + ',' + h + ' ' +
							        'L 0,' + h + ' C ' + leftCP2x + ',' + leftCP2y + ' ' + leftCP1x + ',' + leftCP1y + ' ' + LEx + ',' + LEy + ' ' +
							        'A ' + r + ',' + r + ' 0 0 1 ' + TLx + ',0 Z" fill="url(#capFill)" stroke="rgba(210,34,34,.38)" stroke-width="1" />' +
							      '<path d="' +
							        'M ' + TLx + ',0 H ' + TRx + ' A ' + r + ',' + r + ' 0 0 1 ' + REx + ',' + REy + ' ' +
							        'C ' + rightCP1x + ',' + rightCP1y + ' ' + rightCP2x + ',' + rightCP2y + ' ' + w + ',' + h + ' ' +
							        'L 0,' + h + ' C ' + leftCP2x + ',' + leftCP2y + ' ' + leftCP1x + ',' + leftCP1y + ' ' + LEx + ',' + LEy + ' ' +
							        'A ' + r + ',' + r + ' 0 0 1 ' + TLx + ',0 Z" fill="url(#capShine)" />';
							  }
							
							  /* 4) Kustība — gluds X horizontāli; Y vertikāli */
							  var raf=null, targetX=null, currentX=null;
							  function setTipX(px){
							    targetX = px;
							    if(currentX == null) currentX = px;
							    if(raf) return;
							    function step(){
							      currentX += (targetX - currentX) * 0.25;
							      shell.style.setProperty('--tipX', currentX + 'px');
							      if(Math.abs(targetX - currentX) > 0.5){ raf = requestAnimationFrame(step); }
							      else { shell.style.setProperty('--tipX', targetX + 'px'); raf=null; }
							    }
							    raf = requestAnimationFrame(step);
							  }
							  function setTipY(py){ shell.style.setProperty('--tipY', py + 'px'); }
							
							  function isVertical(){
							    return bc.classList.contains('left') || bc.classList.contains('right');
							  }
							
							  function showFor(btn){
							    var rShell = shell.getBoundingClientRect();
							    var rBtn   = btn.getBoundingClientRect();
							    var title  = btn.getAttribute('data-title') || btn.getAttribute('aria-label') || '';
							
							    dockLabel.textContent = title || '';
							    // lai izmērītu īsto platumu/augstumu pirms ģeometrijas:
							    dockLabel.style.opacity = '0.001'; // gandrīz neredzams uz mirkli
							    dockLabel.style.pointerEvents = 'none';
							
							    // pieslēdzam klasei animācijas stāvokli
							    shell.classList.add('show-label');
							
							    // pēc nākamā frame izmēram platumu/augstumu un atjauninām kupolu (horizontāliem)
							    requestAnimationFrame(function(){
							      var lw = Math.min(dockLabel.scrollWidth + 2, rShell.width - 40);
							      shell.style.setProperty('--labelW', lw + 'px');
							      shell.style.setProperty('--capH', (dockLabel.offsetHeight + 2) + 'px');
							
							      if(!isVertical()){
							        // horizontāli: kupols redzams
							        shell.classList.add('show-cap');
							        // centrs X:
							        var cx = rBtn.left + rBtn.width/2 - rShell.left;
							        setTipX(cx);
							        updateCapGeometry();
							      }else{
							        // vertikāli: slēpjam kupolu, slīdam pa Y
							        shell.classList.remove('show-cap');
							        var cy = rBtn.top + rBtn.height/2 - rShell.top;
							        setTipY(cy);
							      }
							      dockLabel.style.opacity = '1';
							    });
							  }
							  function hideTip(){ shell.classList.remove('show-label','show-cap'); }
							
							  /* 5) Notikumi – tikai uz īstajām pogām, lai neskartu Tavu esošo loģiku */
							  var hideT=null;
							  function arm(btn){
							    btn.addEventListener('mouseenter', function(){
							      if(hideT) clearTimeout(hideT);
							      showFor(btn);
							    });
							    btn.addEventListener('focus', function(){
							      showFor(btn);
							    });
							    btn.addEventListener('mouseleave', function(){
							      if(hideT) clearTimeout(hideT);
							      hideT = setTimeout(hideTip, 180);
							    });
							    // touch — ātri parādam un pēc 1.6s paslēpjam
							    btn.addEventListener('touchstart', function(){
							      if(hideT) clearTimeout(hideT);
							      showFor(btn);
							      hideT = setTimeout(hideTip, 1600);
							    }, {passive:true});
							  }
							  [].slice.call(allTriggers).forEach(arm);

							
							  // Uz loga izmēru maiņas – paslēpjam
							  window.addEventListener('resize', hideTip);
							
							  // Sākotnējais stāvoklis: ja vertical, kupolu neredzam
							  if(isVertical()) shell.classList.remove('show-cap');
							  window.__fitDock && window.__fitDock();
							})();



(function keepDockMarginsFromCSS(){
  const shell = document.querySelector('#buttonContainer .dock-shell');
  if (!shell) return;
  const strip = () => shell.querySelectorAll('button').forEach(b=>{
    b.style.removeProperty('margin');
    b.style.removeProperty('margin-left');
    b.style.removeProperty('margin-right');
    b.style.removeProperty('margin-top');
    b.style.removeProperty('margin-bottom');
  });
  strip();
  new MutationObserver(strip).observe(shell, {subtree:true, attributes:true, attributeFilter:['style']});
})();









							
							// === Auto-fit dokam (#buttonContainer .dock-shell) — ar apakšējās joslas korekciju ===
							(function(){
							 function fitDock(){
							    const bc = document.getElementById('buttonContainer');
							    if(!bc) return;
							    const shell = bc.querySelector('.dock-shell');
							    if(!shell) return;
							
							    const about = document.getElementById('about');
							    const ah = about ? (about.getBoundingClientRect().height || 0) : 0;
							
							    const isBottom   = bc.classList.contains('bottom');
							    const isVertical = bc.classList.contains('left') || bc.classList.contains('right');
							
							    /* ❗ NEKĀDUS inline bottom */
							    bc.style.removeProperty('bottom');
							
							    /* Apakšā – tikai tik, lai nepārklātos ar #about (vai 8px) */
							    if (isBottom) {
							      const gap = Math.max(8, ah + 8);
							      document.documentElement.style.setProperty('--dock-bottom', gap + 'px');
							    }
							
							    /* Mērogs – tikai samazinām, nestiepjam malas */
							    const prev = shell.style.transform;
							    shell.style.transform = 'none';
							    const natural = shell.getBoundingClientRect();
							    shell.style.transform = prev;
							
							    let maxW = window.innerWidth * 0.98;
							    let maxH = window.innerHeight * 0.94;
							    if (isVertical) maxH = Math.max(120, maxH - ah);
							
							    let scale = isVertical
							      ? Math.min(1, maxH / natural.height)
							      : Math.min(1, maxW / natural.width);
							
							    scale = Math.max(0.35, Math.min(1, scale));
							    shell.style.transform = 'scale(' + scale + ')';
							  }
							
							  window.__fitDock = fitDock;
							  const queue = () => setTimeout(fitDock, 50);
							  window.addEventListener('load', fitDock);
							  window.addEventListener('resize', queue);
							  window.addEventListener('orientationchange', queue);
							})();

							
							// 🔹 Tagad __fitDock noteikti ir definēts — pielāgo mērlogu uzreiz
							window.__fitDock && window.__fitDock();




(function(){
  function updateDimmerPlacement(){
    var bc  = document.getElementById('buttonContainer');
    if(!bc) return;
    var dim = bc.querySelector('.dock-dimmer');
    if(!dim) return;

    dim.style.gridRow    = '';
    dim.style.gridColumn = '';
    dim.style.width      = '';
    dim.style.maxWidth   = '';
    dim.style.height     = '';
    dim.style.removeProperty('--colH');
  }

  function updateDimmerSpan(){
    var bc    = document.getElementById('buttonContainer');
    if(!bc) return;
    var shell = bc.querySelector('.dock-shell');
    if(!shell) return;
    var dim   = shell.querySelector('.dock-dimmer');
    if(!dim) return;

    var side = bc.classList.contains('left') || bc.classList.contains('right');
    if (!side) { dim.style.gridRow = ''; return; }

    var children = [].slice.call(shell.children);
    var rows = Math.max(
      1,
      children.filter(function(el){ return el.tagName === 'BUTTON' && el.offsetParent !== null; }).length
    );

    dim.style.gridRow = '1 / span ' + rows;
  }

  function updateDimmerAll(){
    updateDimmerPlacement();
    updateDimmerSpan();
  }

  window.__updateDimmerWidth = updateDimmerAll;
  window.addEventListener('load',  updateDimmerAll);
  window.addEventListener('resize',updateDimmerAll);
})();

							
							(function(){
							  const prevUpdate = window.__updateDimmerWidth || function(){};
							
							  function measureBottomRowWidth(){
							    const bc = document.getElementById('buttonContainer');
							    if(!bc || !bc.classList.contains('bottom')) return;
							    const shell = bc.querySelector('.dock-shell');
							    if(!shell) return;
							
							    const btns = [...shell.children].filter(el => el.tagName === 'BUTTON' && el.offsetParent !== null);
							    if(!btns.length) return;
							
							    const top0 = Math.min(...btns.map(b => b.offsetTop));
							    const firstLine = btns.filter(b => Math.abs(b.offsetTop - top0) < 2);
							    const rects = firstLine.map(b => b.getBoundingClientRect());
							    const minL = Math.min(...rects.map(r => r.left));
							    const maxR = Math.max(...rects.map(r => r.right));
							    const w = Math.round(maxR - minL);
							
							    const shellEl = bc.querySelector('.dock-shell');
							    shellEl && shellEl.style.setProperty('--rowW', w + 'px');
							  }
							
							  /* NEW: izmēri pogu kolonnas kopējo augstumu sānos (left/right) */
							  function measureSideColHeight(){
							    const bc = document.getElementById('buttonContainer');
							    if(!bc || !(bc.classList.contains('left') || bc.classList.contains('right'))) return;
							
							    const shell = bc.querySelector('.dock-shell');
							    const dim   = shell && shell.querySelector('.dock-dimmer');
							    if(!shell || !dim) return;
							
							    const btns = [...shell.children].filter(el => el.tagName === 'BUTTON' && el.offsetParent !== null);
							    if(!btns.length) return;
							
							    const rects = btns.map(b => b.getBoundingClientRect());
							    const top   = Math.min(...rects.map(r => r.top));
							    const bottom= Math.max(...rects.map(r => r.bottom));
							    const h     = Math.max(0, Math.round(bottom - top));   // pogu kolonnas “garums”, iesk. rindstarpas
							
							    // iedodam .dock-dimmer CSS mainīgo + drošības pēc arī height
							    dim.style.setProperty('--colH', h + 'px');
							    dim.style.height = h + 'px';
							  }
							
							  window.__updateDimmerWidth = function(){
							    prevUpdate();
							    measureBottomRowWidth();
							    measureSideColHeight();
							  };
							
							  const run = () => window.__updateDimmerWidth && window.__updateDimmerWidth();
							  window.addEventListener('load', run);
							  window.addEventListener('resize', run);
							  window.addEventListener('orientationchange', run);
							  run();
							})();

				
							(function () {
							  // ── nodrošinām, ka ir konteiners ─────────────────────────────────────────────
							  const bc = document.getElementById('buttonContainer');
							  if (!bc) return;
							
							  // ── SVG ikona (backticki aizsargāti ar \`) ───────────────────────────────────
							  const GRID_ICON = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="7" height="7"></rect>
  <rect x="14" y="3" width="7" height="7"></rect>
  <rect x="3" y="14" width="7" height="7"></rect>
  <rect x="14" y="14" width="7" height="7"></rect>
</svg>
`;
							
							  /* — ROKTURIS — */
							  const handle = document.createElement('div');
							  handle.className = 'dock-handle';
							  handle.setAttribute('title', 'Parādīt pogas');
							  handle.setAttribute('aria-label', 'Parādīt pogas');
							  handle.innerHTML = GRID_ICON; // uzreiz ieliekam SVG
							  bc.appendChild(handle);
							
							  /* — PUBLISKĀS FUNKCIJAS — */
							  function dockButtons() { bc.classList.add('docked'); window.__updateMapSafeAreas && window.__updateMapSafeAreas(); }
							  function showButtons() { bc.classList.remove('docked'); window.__fitDock && window.__fitDock(); window.__updateMapSafeAreas && window.__updateMapSafeAreas(); }
							
							  // Piesienam rokturim
							  handle.addEventListener('click', showButtons);
							
							  // Ja maina novietojumu ar selectiem — atjaunojam un pārrēķinām izkārtojumu
							  const leftSel  = document.getElementById('positionSelectLeft');
							  const rightSel = document.getElementById('positionSelect');
							  function refreshBySelect() { handle.innerHTML = GRID_ICON; window.__fitDock && window.__fitDock(); }
							  leftSel  && leftSel.addEventListener('change', refreshBySelect);
							  rightSel && rightSel.addEventListener('change', refreshBySelect);
							
							  // Ielāpam updateButtonContainerPosition, lai rokturis sekotu
							  if (window.updateButtonContainerPosition) {
							    const _old = window.updateButtonContainerPosition;
							    window.updateButtonContainerPosition = function (pos) {
							      _old(pos);
							      refreshBySelect();
							      // ja bija dokēts, saglabājas; rokturis vienmēr pareizā vietā
							    };
							  }
							
							  /* — AUTOMĀTISKĀ DOKĒŠANA, kad sāc “darbu ar saturu” — */
							  const map     = document.getElementById('mapCanvas');
							  const compass = document.getElementById('compassContainer');
							
							  ['pointerdown', 'mousedown', 'touchstart'].forEach(ev => {
							    map     && map.addEventListener(ev, dockButtons,    { passive: true });
							    compass && compass.addEventListener(ev, dockButtons, { passive: true });
							  });
							
							  // Pēc loga/virtuālā viewport izmaiņām pielāgo mērogu
							  function onViewportChange() { window.__fitDock && window.__fitDock(); }
							  window.addEventListener('resize', onViewportChange);
							  if (window.visualViewport) {
							    window.visualViewport.addEventListener('resize', onViewportChange);
							    window.visualViewport.addEventListener('scroll', onViewportChange);
							  }
							})();
