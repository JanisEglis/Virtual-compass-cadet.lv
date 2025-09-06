// Virtuālā kompasa galvenais JavaScript fails

// Galvenie mainīgie
let canvas, ctx;
let compassRotation = 0;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Dokumenta ielādes notikums
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Aplikācijas inicializācija
function initializeApp() {
    // Inicializējam kanvu
    setupCanvas();
    
    // Inicializējam kompasu
    setupCompass();
    
    // Pārbaudām ierīci un ekrānu
    checkDevice();
    checkScreenSize();
    
    // Pielāgojam izmērus
    resizeApp();
    
    // Pievienojam event listenerus
    setupEventListeners();
}

// Kanvas iestatīšana
function setupCanvas() {
    canvas = document.getElementById('mapCanvas');
    ctx = canvas.getContext('2d');
    drawBackground();
}

// Kompasa iestatīšana
function setupCompass() {
    const compassNeedle = document.getElementById('compassNeedle');
    updateCompassRotation();
}

// Ierīces pārbaude
function checkDevice() {
    // Pārbaudām vai ir mobilā ierīce
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        checkOrientation();
    }
}

// Ekrāna izmēra pārbaude
function checkScreenSize() {
    const warningElement = document.getElementById('mobile-warning');
    if (window.innerWidth < 768 && isMobileDevice()) {
        warningElement.style.display = 'flex';
    } else {
        warningElement.style.display = 'none';
    }
}

// Orientācijas pārbaude
function checkOrientation() {
    const overlay = document.getElementById('orientation-overlay');
    if (window.matchMedia("(orientation: portrait)").matches) {
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

// Fona zīmēšana
function drawBackground() {
    ctx.fillStyle = '#181818';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Pievienojam ūdens zīmogu
    const watermark = new Image();
    watermark.onload = function() {
        const ratio = watermark.width / watermark.height;
        const width = canvas.width * 0.7;
        const height = width / ratio;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        
        ctx.globalAlpha = 0.3;
        ctx.drawImage(watermark, x, y, width, height);
        ctx.globalAlpha = 1.0;
    };
    watermark.src = 'https://site-710050.mozfiles.com/files/710050/medium/CADET_TRANSP_.png?1542126381';
}

// Kompasa rotācijas atjaunināšana
function updateCompassRotation() {
    const compassNeedle = document.getElementById('compassNeedle');
    compassNeedle.style.transform = `translate(-50%, -50%) rotate(${compassRotation}deg)`;
}

// Pielāgošana izmēram
function resizeApp() {
    resizeCanvas();
    checkScreenSize();
    checkOrientation();
}

// Kanvas izmēra maiņa
function resizeCanvas() {
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawBackground();
}

// Notikumu klausītāju iestatīšana
function setupEventListeners() {
    // Loga izmēra maiņa
    window.addEventListener('resize', resizeApp);
    
    // Orientācijas maiņa
    window.addEventListener('orientationchange', checkOrientation);
    
    // Kompasa vilkšana
    const compassContainer = document.getElementById('compassContainer');
    if (compassContainer) {
        compassContainer.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', dragCompass);
        document.addEventListener('mouseup', stopDragging);
        
        // Pieskārienu atbalsts
        compassContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }
    
    // Kontrolu pogas
    document.getElementById('uploadMap').addEventListener('click', uploadMap);
    document.getElementById('resetMap').addEventListener('click', resetMap);
    document.getElementById('resetCompass').addEventListener('click', resetCompass);
    document.getElementById('toggleFullscreen').addEventListener('click', toggleFullscreen);
}

// Kompasa vilkšanas funkcijas
function startDragging(e) {
    isDragging = true;
    const rect = compassContainer.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    compassContainer.style.cursor = 'grabbing';
}

function dragCompass(e) {
    if (isDragging) {
        compassContainer.style.left = (e.clientX - dragOffset.x) + 'px';
        compassContainer.style.top = (e.clientY - dragOffset.y) + 'px';
        compassContainer.style.right = 'unset';
    }
}

function stopDragging() {
    isDragging = false;
    if (compassContainer) {
        compassContainer.style.cursor = 'grab';
    }
}

// Pieskārienu atbalsts
function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        isDragging = true;
        const touch = e.touches[0];
        const rect = compassContainer.getBoundingClientRect();
        dragOffset.x = touch.clientX - rect.left;
        dragOffset.y = touch.clientY - rect.top;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        compassContainer.style.left = (touch.clientX - dragOffset.x) + 'px';
        compassContainer.style.top = (touch.clientY - dragOffset.y) + 'px';
        compassContainer.style.right = 'unset';
    }
}

function handleTouchEnd() {
    isDragging = false;
}

// Kontrolu funkcijas
function uploadMap() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileUpload;
    input.click();
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function resetMap() {
    drawBackground();
}

function resetCompass() {
    compassRotation = 0;
    updateCompassRotation();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Nevarēja ieslēgt pilnekrāna režīmu:', err);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Palīgfunkcijas
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
