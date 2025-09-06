						function debounce(func, wait = 50) {
						  let timeout;
						  return function (...args) {
						    clearTimeout(timeout);
						    timeout = setTimeout(() => func.apply(this, args), wait);
						  };
						}
						
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
							const img = button.querySelector('img');
							const config = buttonImageMap[buttonId];

							if (img && config) {
								img.src = img.src === config.defaultSrc ? config.alternateSrc : config.defaultSrc;
							}
						}

						// Pievienojam notikumus pogām
						document.getElementById('toggleRotationMode').addEventListener('click', () => {
							toggleButtonImage('toggleRotationMode');
						});

						document.getElementById('lockRotationMode').addEventListener('click', () => {
							toggleButtonImage('lockRotationMode');
						});


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
								setInterval(checkTouchscreenStatus, 1000); // Pārbauda ik pēc 1 sekundes
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

							if (window.matchMedia("(orientation: portrait)").matches) {
								// Ja ierīce ir vertikālā režīmā
								overlay.style.display = 'flex';
							} else {
								// Ja ierīce ir horizontālā režīmā
								overlay.style.display = 'none';
							}
						}


						// Funkcija pārbauda, vai tiek izmantots viedtālrunis ar mazu ekrānu
						function showMobileWarning() {
							const warningElement = document.getElementById('mobile-warning');

							// Viedtālruņa detekcija (User Agent + ekrāna platuma pārbaude)
							const isMobileDevice = /iphone|ipod|android.*mobile|windows phone|iemobile|opera mini/.test(navigator.userAgent.toLowerCase());
							const isSmallScreen = window.innerWidth < 900; // Ekrāna platums < 768px

							if (isMobileDevice && isSmallScreen) {
								warningElement.style.display = 'flex'; // Parāda brīdinājumu
							} else {
								warningElement.style.display = 'none'; // Slēpj brīdinājumu
							}
						}

						// Notikumu klausītāji
						window.addEventListener('load', showMobileWarning);
						window.addEventListener('resize', showMobileWarning);

						// Izsaucam funkciju sākumā un pie orientācijas izmaiņām
						checkOrientation();
						window.addEventListener('resize', checkOrientation);
						window.addEventListener('orientationchange', checkOrientation);

						// Funkcija, kas aizver abas izvēlnes
						function closeBothMenus() {
							const leftPositionSelector = document.querySelector('.position-selector-left');
							const rightPositionSelector = document.querySelector('.position-selector');

							// Pievieno slēpšanas klases abām izvēlnēm
							leftPositionSelector.classList.add('hidden-left');
							rightPositionSelector.classList.add('hidden');
							
							// Atjauno bultiņu simbolus
							const leftToggleButton = document.querySelector('.toggle-selector-left');
							const rightToggleButton = document.querySelector('.toggle-selector');
							leftToggleButton.textContent = '❯';
							rightToggleButton.textContent = '❮';
						}

						// Labās puses pogas klausītājs
						const toggleButton = document.querySelector('.toggle-selector');
						const positionSelector = document.querySelector('.position-selector');
						toggleButton.addEventListener('click', () => {
							if (positionSelector.classList.contains('hidden')) {
								positionSelector.classList.remove('hidden');
								toggleButton.textContent = '❯'; // Bultiņa norāda uz aizvēršanu
							} else {
								closeBothMenus(); // Aizver abas izvēlnes
							}
						});

						// Kreisās puses pogas klausītājs
						const leftToggleButton = document.querySelector('.toggle-selector-left');
						const leftPositionSelector = document.querySelector('.position-selector-left');
						leftToggleButton.addEventListener('click', () => {
							if (leftPositionSelector.classList.contains('hidden-left')) {
								leftPositionSelector.classList.remove('hidden-left');
								leftToggleButton.textContent = '❮'; // Bultiņa norāda uz aizvēršanu
							} else {
								closeBothMenus(); // Aizver abas izvēlnes
							}
						});


						// Funkcija, kas sinhronizē izvēles abās izvēlnēs
						function syncSelectOptions(selectedValue) {
							const leftSelectElement = document.getElementById('positionSelectLeft');
							const rightSelectElement = document.getElementById('positionSelect');
							leftSelectElement.value = selectedValue;
							rightSelectElement.value = selectedValue;
						}

						// Klausītājs kreisās puses izvēlei, kas sinhronizē izvēli un aizver abas izvēlnes
						const leftSelectElement = document.getElementById('positionSelectLeft');
						leftSelectElement.addEventListener('change', () => {
							const selectedValue = leftSelectElement.value;
							syncSelectOptions(selectedValue); // Sinhronizē izvēli abās izvēlnēs
							closeBothMenus(); // Aizver abas izvēlnes
							updateButtonContainerPosition(selectedValue); // Atjaunina pogu novietojumu
						});

						// Klausītājs labās puses izvēlei, kas sinhronizē izvēli un aizver abas izvēlnes
						const rightSelectElement = document.getElementById('positionSelect');
						rightSelectElement.addEventListener('change', () => {
							const selectedValue = rightSelectElement.value;
							syncSelectOptions(selectedValue); // Sinhronizē izvēli abās izvēlnēs
							closeBothMenus(); // Aizver abas izvēlnes
							updateButtonContainerPosition(selectedValue); // Atjaunina pogu novietojumu
						});


						const savedPosition = localStorage.getItem('buttonPosition');
						const valid = ['bottom', 'left', 'right'];
						const initial = valid.includes(savedPosition) ? savedPosition : 'bottom';
						
						syncSelectOptions(initial);
						updateButtonContainerPosition(initial);


						// Funkcija, kas atjaunina pogas konteinera novietojumu atkarībā no izvēlētās vērtības
						function updateButtonContainerPosition(position){
						  const buttonContainer = document.getElementById('buttonContainer');
						  buttonContainer.classList.remove('bottom','right','left');
						  buttonContainer.classList.add(position);
						
						  localStorage.setItem('buttonPosition', position);
						
						  window.__fitDock && window.__fitDock();
						  window.__updateDimmerWidth && window.__updateDimmerWidth(); // ← paliek
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
						};



						document.addEventListener('DOMContentLoaded', () => {
							// Atlasām kreisās puses pogu
							const leftToggleButton = document.querySelector('.toggle-selector-left');
							const leftPositionSelector = document.querySelector('.position-selector-left');

						// Pārbaudām, vai izvēlne ir redzama vai paslēpta, un iestatām bultiņas virzienu
						if (leftPositionSelector.classList.contains('hidden-left')) {
								leftToggleButton.textContent = '❯'; // Izvēlne ir paslēpta, bultiņa uz priekšu
							} else {
								leftToggleButton.textContent = '❮'; // Izvēlne ir redzama, bultiņa uz iekšu
							}
						
						if (!leftPositionSelector.classList.contains('hidden-left')) {
							leftPositionSelector.classList.add('hidden-left'); 
							}
						});

						



						const canvas = document.getElementById('mapCanvas');
						const ctx = canvas.getContext('2d');
						const img = new Image();
						img.src = ''; // Tiks pievienots pēc augšupielādes

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
						



						const resizeHandle = document.getElementById('resizeHandle');
						resizeHandle.style.display = 'block';
						resizeHandle.style.position = 'absolute'; // Nodrošina, ka rokturis tiek pozicionēts attiecībā pret attēlu, nevis fiksēti uz ekrāna.
						resizeHandle.style.zIndex = '10';
						resizeHandle.style.width = Math.max(40, window.innerWidth * 0.05) + 'px';
						resizeHandle.style.height = Math.max(40, window.innerHeight * 0.05) + 'px';
						resizeHandle.style.backgroundImage = 'url("https://site-710050.mozfiles.com/files/710050/resize_map__1_.png")';

						resizeHandle.style.cursor = 'se-resize';
						resizeHandle.style.border = '3px red';







(function(){
  const mapDiv   = document.getElementById('onlineMap');
  const mapDim   = document.getElementById('onlineMapDim');
  const btn      = document.getElementById('toggleOnlineMap');
  const canvas   = document.getElementById('mapCanvas');
  const resizeH  = document.getElementById('resizeHandle');
  const dimRange = document.getElementById('mapDimmerRange'); // slīdnis (var būt vēl nav)

  let map, osm, topo, inited = false;

function initMap(){
  if (inited) return true;
  if (!window.L) {                   // Leaflet vēl nav?
    console.warn('Leaflet vēl nav ielādējies');
    return false;
  }

  map = L.map(mapDiv, { zoomControl:true, attributionControl:true });

  osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  });

  topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
  });

  osm.addTo(map);
  L.control.layers({ 'OSM': osm, 'OpenTopoMap': topo }, {}).addTo(map);
  map.setView([56.9496, 24.1052], 13);

  inited = true;
  return true;
}


  function syncDimOverlay(){
    if (!dimRange) return;
    const v = +dimRange.value || 0;            // 0..80
    const a = Math.min(0.8, Math.max(0, v/100));
    mapDim.style.background = 'rgba(0,0,0,' + a + ')';
  }

 function showOnlineMap(){
  // parādi konteineru, paslēp kanvu
  mapDiv.style.display = 'block';

// ja kaut kas ar CSS nošauj garām, piešķir izmēru ar roku
if (!mapDiv.offsetWidth || !mapDiv.offsetHeight){
  const p = mapDiv.parentElement;
  mapDiv.style.width  = (p?.clientWidth  || window.innerWidth)  + 'px';
  mapDiv.style.height = (p?.clientHeight || window.innerHeight) + 'px';
}

  
  mapDim.style.display = 'block';
  canvas.style.display = 'none';
  if (resizeH) resizeH.style.display = 'none';

  // inicializē; ja Leaflet nav ielādējies, atkāpjamies
  if (!initMap()){
    mapDiv.style.display = 'none';
    mapDim.style.display = 'none';
    canvas.style.display = 'block';
    if (resizeH && (typeof img !== 'undefined') && img && img.src) resizeH.style.display = 'block';
    localStorage.setItem('onlineMapActive','0');
    alert('Leaflet nav ielādējies — tiešsaistes karte izslēgta.');
    return;
  }

  // invalide size pēc ielikšanas DOM
  requestAnimationFrame(() => map && map.invalidateSize(true));
  setTimeout(() => map && map.invalidateSize(true), 100);

  btn.classList.add('active');
  localStorage.setItem('onlineMapActive','1');

  syncDimOverlay();
  window.__updateDimmerWidth && window.__updateDimmerWidth();
  window.__fitDock && window.__fitDock();
}


  function hideOnlineMap(){
    mapDiv.style.display = 'none';
    mapDim.style.display = 'none';
    canvas.style.display = 'block';
    if (resizeH && (typeof img !== 'undefined') && img && img.src) resizeH.style.display = 'block';

    btn.classList.remove('active');
    localStorage.setItem('onlineMapActive','0');

    window.__updateDimmerWidth && window.__updateDimmerWidth();
    window.__fitDock && window.__fitDock();
  }

  btn && btn.addEventListener('click', () => {
    const isOn = mapDiv.style.display === 'block';
    if (isOn) hideOnlineMap();
    else showOnlineMap();
  });

  // Atjauno stāvokli no localStorage
  if (localStorage.getItem('onlineMapActive') === '1'){
    showOnlineMap();
  }

  // Pārizmērs
  window.addEventListener('resize', ()=> map && map.invalidateSize());

  // Tumšošanas slīdnis var parādīties vēlāk — ja eksistē, savieno
  if (dimRange){
    dimRange.addEventListener('input', syncDimOverlay);
    syncDimOverlay();
  }
})();














								

						img.onload = function () {
							adjustImageSize();
							drawImage();
							positionResizeHandle();
							resizeHandle.style.display = 'block';
						};

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
	

						function drawImage() {
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							ctx.drawImage(img, imgX, imgY, imgWidth * imgScale, imgHeight * imgScale);
							positionResizeHandle();
						}

						// Reset Map Button Functionality
						document.getElementById('resetMap').addEventListener('click', () => {
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
								lastTouchDistance = getDistance(e.touches[0], e.touches[1]);
							}
						});



						canvas.addEventListener('touchstart', (e) => {
							e.preventDefault();
							if (e.touches.length === 1) { // Pārvietošana
								startX = e.touches[0].clientX;
								startY = e.touches[0].clientY;
								dragging = true;
							} else if (e.touches.length === 2) { // Tālummaiņa
								lastTouchDistance = getDistance(e.touches[0], e.touches[1]);
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
								const newDistance = getDistance(touch1, touch2);
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

						function getDistance(touch1, touch2) {
							const dx = touch1.clientX - touch2.clientX;
							const dy = touch1.clientY - touch2.clientY;
							return Math.sqrt(dx * dx + dy * dy);
						}



						canvas.addEventListener('touchend', () => {
							dragging = false;
						});

						function getDistance(touch1, touch2) {
							const dx = touch1.clientX - touch2.clientX;
							const dy = touch1.clientY - touch2.clientY;
							return Math.sqrt(dx * dx + dy * dy);
						}

						// Izmēra maiņa ar rokturi un skārienjūtību
						resizeHandle.addEventListener('mousedown', startResize);
						resizeHandle.addEventListener('touchstart', startResize);

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
						function positionResizeHandle() {
							if (window.innerWidth <= 768) { // Mobile adjustments
								resizeHandle.style.left = (imgX + (imgWidth * imgScale) - resizeHandle.clientWidth - 5) + 'px';
							} else { // Desktop adjustments
								resizeHandle.style.left = (imgX + (imgWidth * imgScale) - resizeHandle.clientWidth) + 'px';
							}
							if (window.innerWidth <= 768) { // Mobile adjustments
								resizeHandle.style.top = (imgY + (imgHeight * imgScale) - resizeHandle.clientHeight - 5) + 'px';
							} else { // Desktop adjustments
								resizeHandle.style.top = (imgY + (imgHeight * imgScale) - resizeHandle.clientHeight) + 'px';
							}
							resizeHandle.style.display = 'flex';
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




						// Kad attēls ir ielādēts, pievieno apmali, bet saglabā funkcionalitāti
						img.onload = function () {
							adjustImageSize(); // Nodrošina sākotnējo attēla novietojumu
							drawImage(); // Uzzīmē attēlu
							

						// PIEVIENO APMALI UZ CANVAS
						ctx.lineWidth = 2; // Apmales biezums
						ctx.strokeStyle = "red"; // Apmales krāsa
						ctx.strokeRect(imgX, imgY, imgWidth * imgScale, imgHeight * imgScale); // Apvelk attēlu

						positionResizeHandle(); // Nodrošina, ka izmēru maiņas punkts ir pareizā vietā
						resizeHandle.style.display = 'block';
						};




						function drawImage() {
						  ctx.clearRect(0, 0, canvas.width, canvas.height);
						
						  // 1) Karte
						  ctx.drawImage(img, imgX, imgY, imgWidth * imgScale, imgHeight * imgScale);
						
						  // 2) Tumšošanas pārklājums tikai kartes laukumam
						  if (mapDarken > 0) {
						    ctx.save();
						    ctx.fillStyle = 'rgba(0,0,0,' + mapDarken + ')'; // 0..0.8
						    ctx.fillRect(imgX, imgY, imgWidth * imgScale, imgHeight * imgScale);
						    ctx.restore();
						  }
						
						  // 3) Sarkanais rāmis virs pārklājuma
						  ctx.lineWidth = 2;
						  ctx.strokeStyle = "red";
						  ctx.strokeRect(imgX, imgY, imgWidth * imgScale, imgHeight * imgScale);
						
						  // 4) Roktura pozīcija
						  positionResizeHandle();
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
							// Sākotnējās vērtības, lai atjaunotu kompasu
							const initialCompassLeft = 550; // Sākotnējā X pozīcija
							const initialCompassTop = 60; // Sākotnējā Y pozīcija
							const initialGlobalScale = 1; // Sākotnējais mērogs
							const initialBaseRotation = 0; // Sākotnējā bāzes rotācija
							const initialScaleRotation = 70; // Sākotnējā skalas rotācija


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



						toggleRotationModeButton.addEventListener('click', () => {
							activeRotationTarget = activeRotationTarget === 'compassInner' ? 'compassScaleInner' : 'compassInner';
							
							// Mainām pogas fona krāsu, lai parādītu, kas pašlaik tiek rotēts
							toggleRotationModeButton.style.backgroundColor = activeRotationTarget === 'compassInner' ? 'rgba(91, 16, 16, 0.8)' : 'rgb(187, 1, 1)';
						});



						// Notikumu klausītājs pogai, kas bloķē rotāciju
						if (lockRotationModeButton) {
							lockRotationModeButton.addEventListener('click', () => {
								isRotationLocked = !isRotationLocked; // Mainām bloķēšanas statusu
								lockRotationModeButton.classList.toggle('active', isRotationLocked); // Pievienojam vai noņemam aktīvo klasi
							});
						}

						// Pārbaudām, vai poga eksistē
						if (resetCompassButton) {
							// Pievienojam klikšķa notikumu
							resetCompassButton.addEventListener('click', () => {
								
								// Pievienojam CSS klasi, kas aktivizē pāreju
								
								compassContainer.classList.add('with-transition');
								compassInner.classList.add('with-transition');
								compassScaleInner.classList.add('with-transition');
								compassScaleContainer.classList.add('with-transition'); // Jaunā daļa
								
								// Atjaunojam sākotnējos mainīgos
								compassStartLeft = 550; // sākotnējā pozīcija pa kreisi
								compassStartTop = 60;   // sākotnējā pozīcija pa augšu
								globalScale = 1;        // sākotnējais mērogs
								baseRotation = 0;       // sākotnējā rotācija
								scaleRotation = 70;      // sākotnējā skalas rotācija

								// Atjaunojam kompasu (tiek pārvietots atpakaļ sākuma stāvoklī)
								updateCompassTransform();

								// Noņemam klasi pēc 0.5 sekundēm (pēc pārejas beigām)
								setTimeout(() => {
								 
									compassContainer.classList.remove('with-transition');
									compassInner.classList.remove('with-transition');
									compassScaleInner.classList.remove('with-transition');
									compassScaleContainer.classList.remove('with-transition');
								}, 500); // Pārejas ilgums (0.5s)
							});
						}


						// Atjauno transformācijas
						function updateCompassTransform() {
							compassContainer.style.left = compassStartLeft + 'px';
							compassContainer.style.top = compassStartTop + 'px';

							// Mērogošana visam kompasam
							compassScaleContainer.style.transform = 'scale(' + globalScale + ')';

							// Bāzes rotācija
							compassInner.style.transform = 'rotate(' + baseRotation + 'deg)';

							// Skalās rotācija
							compassScaleInner.style.transform = 'rotate(' + scaleRotation + 'deg)';
						}


						// Nodrošinām, lai stili tiek piemēroti
							updateCompassTransform();



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
								window.addEventListener('load', () => {
								  const windowWidth = window.innerWidth;
								  const windowHeight = window.innerHeight;
								  const compassWidth = compassContainer.offsetWidth;
								  const compassHeight = compassContainer.offsetHeight;

								  // Varat pielāgot sākuma pozīciju pēc vajadzības
								  compassStartLeft = 550;
								  compassStartTop = 60;
								  updateCompassTransform();
								});
							

	
								(function() {
								const toggleFullscreenButton = document.getElementById('toggleFullscreen');
								const fullscreenIcon = document.getElementById('fullscreenIcon');
								const fullscreenPopup = document.getElementById('fullscreenPopup');

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




							document.getElementById("toggleMaterials").addEventListener("click", function() {
								let menu = document.getElementById("dropdownMaterials");
								let toggleButton = document.getElementById("toggleMaterials");
								menu.classList.toggle("visible");
								toggleButton.classList.toggle("active");
							});

							document.getElementById("toggleInstruction").addEventListener("click", function() {
								let menu = document.getElementById("dropdownInstruction");
								let toggleButton = document.getElementById("toggleInstruction");
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
							document.getElementById("toggleMaterials").addEventListener("click", function () {
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
							document.getElementById("toggleInstruction").addEventListener("click", function () {
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
								  var dimValue = dimWrap.querySelector('#mapDimmerValue');
								
								  var stored = +(localStorage.getItem('mapDarken') || 0);
								  mapDarken = stored / 100;        // izmanto globālo mainīgo no 2. soļa
								  dimRange.value = stored;
								  dimValue.textContent = stored + '%';
								
								  dimRange.addEventListener('input', function(e){
								    var v = +e.target.value;       // 0..80
								    mapDarken = v / 100;           // 0..0.8
								    localStorage.setItem('mapDarken', v);
								    dimValue.textContent = v + '%';
								    drawImage();                   // pārzīmē kanvu ar jaunu tumšumu
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
							  // 1) Tavs esošais – notīra inline stilus,
							  //    lai .bottom/.left/.right CSS var stāties spēkā
							  function updateDimmerPlacement(){
							    const bc   = document.getElementById('buttonContainer');
							    const dim  = bc?.querySelector('.dock-dimmer');
							    if(!bc || !dim) return;
							
							    dim.style.gridRow = '';
							    dim.style.gridColumn = '';
							    dim.style.width = '';
							    dim.style.maxWidth = '';
							    dim.style.height = '';                 // ⇦ notīrām
							    dim.style.removeProperty('--colH');    // ⇦ notīrām
							  }
							
							  // 2) Jauns – uzliek precīzu rindu “span” sānā
							  function updateDimmerSpan(){
							    const bc    = document.getElementById('buttonContainer');
							    const shell = bc?.querySelector('.dock-shell');
							    const dim   = shell?.querySelector('.dock-dimmer');
							    if(!bc || !shell || !dim) return;
							
							    // Apakšā span nav vajadzīgs
							    const side = bc.classList.contains('left') || bc.classList.contains('right');
							    if (!side) { dim.style.gridRow = ''; return; }
							
							    // Saskaitām redzamās pogas (ignorējam paslēptās)
							    const rows = Math.max(
							      1,
							      [...shell.children].filter(el => el.tagName === 'BUTTON' && el.offsetParent !== null).length
							    );
							
							    // Uzliekam precīzu span
							    dim.style.gridRow = '1 / span ' + rows;
							  }
							
							  // 3) Wrapperis – vispirms notīra, tad uzstāda span
							  function updateDimmerAll(){
							    updateDimmerPlacement();
							    updateDimmerSpan();
							  }
							
							  // Publiski un klausītāji
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
							  function dockButtons() { bc.classList.add('docked'); }
							  function showButtons() { bc.classList.remove('docked'); window.__fitDock && window.__fitDock(); }
							
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
