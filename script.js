import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMi1AFBDgK0hbd8rJNNgLCuvOfXPW4Bl8",
  authDomain: "carta-cumple123.firebaseapp.com",
  databaseURL: "https://carta-cumple123-default-rtdb.firebaseio.com",
  projectId: "carta-cumple123",
  storageBucket: "carta-cumple123.firebasestorage.app",
  messagingSenderId: "451234721647",
  appId: "1:451234721647:web:4368eeddfc21a2a939829a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Extract Spotify Track ID robustly
function getSpotifyEmbed(url) {
    if(!url || !url.trim()) return "";
    
    // Match standard URLs (including language prefixes like intl-es/)
    let match = url.match(/spotify\.com\/.*(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if(match) {
        return `<iframe src="https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0" width="300" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    }
    
    // Match URIs like spotify:track:ID
    let uriMatch = url.match(/spotify:(track|album|playlist|episode):([a-zA-Z0-9]+)/);
    if(uriMatch) {
         return `<iframe src="https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}?utm_source=generator&theme=0" width="300" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    }

    return `<div style="color:red; font-size:0.8rem; padding: 20px;">Enlace de Spotify Inválido.<br>Usa 'Copiar enlace de canción'.</div>`;
}

// Default values
const defaultCfg = {
    title: "¡Feliz Cumpleaños!",
    greeting: "Hola corazón,",
    body: "Quería entregarte esta pequeña carta virtual (ya que Snoopy me ayudó a diseñarla) porque hoy es un día increíble. Quería que todo fuera perfecto para ti.\n\nAgradezco todos los momentos que me has brindado. Siempre, siempre podré contar contigo en todo momento, ¿ok? Siempre sabré que mi mejor amig@ y una de las personas que más adoro está ahí.\n\nPasa un hermoso cumpleaños. Nunca dejes de sonreír.",
    signature: "Con amor, tu amig@",
    footerMsg: "Gracias por existir. ¡Te quiero muchísimo!",
    gifHero: "https://media.giphy.com/media/8HqjtoyKrnfJC/giphy.gif",
    gifSide: "https://media.giphy.com/media/l41Ys1fQky5raqvMQ/giphy.gif",
    gifIcon: "https://media.giphy.com/media/3o7WTq4w8w1hC3c97q/giphy.gif",
    gifFooter: "https://media.giphy.com/media/xUPGcE5E6BteVlGz3a/giphy.gif",
    spot1: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    spot2: "https://open.spotify.com/track/3B54sVLJ402z01ZVsWEAPP",
    spot3: "https://open.spotify.com/track/1yTTMcUhL7rtz08Dsgb7Qb"
};

// Apply CMS Data from Firebase
onValue(ref(db, 'config'), (snapshot) => {
    let saved = snapshot.val();
    if(!saved) saved = defaultCfg;

    // Apply Texts
    document.getElementById('dyn-title').textContent = saved.title || defaultCfg.title;
    document.getElementById('dyn-greeting').textContent = saved.greeting || defaultCfg.greeting;
    document.getElementById('dyn-body').textContent = saved.body || defaultCfg.body;
    document.getElementById('dyn-signature').textContent = saved.signature || defaultCfg.signature;
    document.getElementById('dyn-footer-msg').textContent = saved.footerMsg || defaultCfg.footerMsg;

    // Apply Images/GIFs
    document.getElementById('dyn-gif-hero').src = saved.gifHero || defaultCfg.gifHero;
    document.getElementById('dyn-gif-side').src = saved.gifSide || defaultCfg.gifSide;
    const iconEl = document.getElementById('dyn-gif-icon');
    if(iconEl) iconEl.src = saved.gifIcon || defaultCfg.gifIcon;
    document.getElementById('dyn-gif-footer').src = saved.gifFooter || defaultCfg.gifFooter;

    // Apply Spotify Embeds
    document.getElementById('dyn-spot-1').innerHTML = getSpotifyEmbed(saved.spot1 || defaultCfg.spot1);
    document.getElementById('dyn-spot-2').innerHTML = getSpotifyEmbed(saved.spot2 || defaultCfg.spot2);
    document.getElementById('dyn-spot-3').innerHTML = getSpotifyEmbed(saved.spot3 || defaultCfg.spot3);

    // Toggle comments retro window entirely
    const allowComments = saved.hasOwnProperty('allowComments') ? saved.allowComments : true;
    const retroWindow = document.querySelector('.retro-window');
    
    if(retroWindow) {
        if(!allowComments) {
            retroWindow.style.display = 'none';
        } else {
            // Restore block
            retroWindow.style.display = 'block';
        }
    }
});

// Scroll Reveal Animation (Intersection Observer)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(element);
});

// ==================================
// GUESTBOOK CLOUDS LOGIC
// ==================================
const cloudContainer = document.getElementById('clouds-container');
const btnSend = document.getElementById('btn-send-comment');
const inputName = document.getElementById('guest-name');
const inputMsg = document.getElementById('guest-msg');

function renderCloud(name, msg) {
    const cloud = document.createElement('div');
    cloud.className = 'comment-cloud';
    
    // Random position left or right
    const isLeft = Math.random() > 0.5;
    // Random Vertical Position from 5% to 85% of viewport/document
    const verticalPos = Math.random() * 85 + 5; 
    const horizontalPos = Math.random() * 10 + 2; // 2% to 12% 
    
    cloud.style.top = verticalPos + '%';
    if(isLeft) cloud.style.left = horizontalPos + '%';
    else cloud.style.right = horizontalPos + '%';
    
    // Random animation delay
    cloud.style.animationDelay = (Math.random() * 5) + 's';
    
    cloud.innerHTML = `<div class="cloud-name">@${name}</div><div class="cloud-msg">${msg}</div>`;
    cloudContainer.appendChild(cloud);
}

if(cloudContainer) {
    onValue(ref(db, 'comments'), (snapshot) => {
        cloudContainer.innerHTML = '';
        if(snapshot.exists()) {
            snapshot.forEach((child) => {
                const c = child.val();
                renderCloud(c.name, c.msg);
            });
        } else {
            // Default clouds if none exist
            push(ref(db, 'comments'), {name: "Snoopy", msg: "¡Feliz Cumple! Te traje corazones 💕"});
            push(ref(db, 'comments'), {name: "Woodstock", msg: "Pio pio pio 🐥 Que la pases genial."});
        }
    });

    if(btnSend) {
        btnSend.addEventListener('click', () => {
            const name = inputName.value.trim();
            const msg = inputMsg.value.trim();
            if(!name || !msg) {
                alert("¡Por favor llena tu nombre y tu mensajito!");
                return;
            }
            
            // Push to Firebase Realtime DB
            push(ref(db, 'comments'), {name, msg});
            
            inputName.value = '';
            inputMsg.value = '';

            alert("¡Tu nubecita ha sido enviada con éxito! Búscala flotando en la página ☁️");
        });
    }
}
