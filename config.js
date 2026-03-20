import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

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

// Mapping form inputs
const fields = {
    title: document.getElementById('cfg-title'),
    greeting: document.getElementById('cfg-greeting'),
    body: document.getElementById('cfg-body'),
    signature: document.getElementById('cfg-signature'),
    footerMsg: document.getElementById('cfg-footer-msg'),
    gifHero: document.getElementById('cfg-gif-hero'),
    gifSide: document.getElementById('cfg-gif-side'),
    gifIcon: document.getElementById('cfg-gif-icon'),
    gifFooter: document.getElementById('cfg-gif-footer'),
    spot1: document.getElementById('cfg-spot-1'),
    spot2: document.getElementById('cfg-spot-2'),
    spot3: document.getElementById('cfg-spot-3'),
    allowComments: document.getElementById('cfg-allow-comments')
};

// Load existing config from Firebase into the form
onValue(ref(db, 'config'), (snapshot) => {
    let saved = snapshot.val() || {};
    
    fields.title.value = saved.title || "";
    fields.greeting.value = saved.greeting || "";
    fields.body.value = saved.body || "";
    fields.signature.value = saved.signature || "";
    fields.footerMsg.value = saved.footerMsg || "";
    
    fields.gifHero.value = saved.gifHero || "";
    fields.gifSide.value = saved.gifSide || "";
    fields.gifIcon.value = saved.gifIcon || "";
    fields.gifFooter.value = saved.gifFooter || "";
    
    fields.spot1.value = saved.spot1 || "";
    fields.spot2.value = saved.spot2 || "";
    fields.spot3.value = saved.spot3 || "";

    fields.allowComments.checked = saved.hasOwnProperty('allowComments') ? saved.allowComments : true;

    updatePreviews();
}, { onlyOnce: true }); // Only fetch once for the form inputs

// Save new config to Firebase
document.getElementById('config-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentConfig = {
        title: fields.title.value,
        greeting: fields.greeting.value,
        body: fields.body.value,
        signature: fields.signature.value,
        footerMsg: fields.footerMsg.value,
        gifHero: fields.gifHero.value,
        gifSide: fields.gifSide.value,
        gifIcon: fields.gifIcon.value,
        gifFooter: fields.gifFooter.value,
        spot1: fields.spot1.value,
        spot2: fields.spot2.value,
        spot3: fields.spot3.value,
        allowComments: fields.allowComments.checked
    };

    set(ref(db, 'config'), currentConfig)
        .then(() => {
            alert("¡Configuración guardada en la Nube con éxito!");
        })
        .catch((error) => {
            alert("Hubo un error al guardar: " + error);
        });
});

// Update image previews live
function updatePreviews() {
    setupPreview(fields.gifHero, 'preview-hero');
    setupPreview(fields.gifSide, 'preview-side');
    setupPreview(fields.gifIcon, 'preview-icon');
    setupPreview(fields.gifFooter, 'preview-footer');
}

function setupPreview(inputEl, previewId) {
    const previewEl = document.getElementById(previewId);
    const update = () => {
        if(inputEl.value) {
            previewEl.innerHTML = `<img src="${inputEl.value}" alt="Preview" style="max-height:80px; mix-blend-mode:multiply;">`;
        } else {
            previewEl.innerHTML = `<span style="color:#aaa;">Preview</span>`;
        }
    };
    inputEl.addEventListener('input', update);
    update();
}

// ===================================
// ADMIN CLOUD MANAGER (Real-time Firebase)
// ===================================
onValue(ref(db, 'comments'), (snapshot) => {
    const list = document.getElementById('admin-comments-list');
    if(!list) return;
    
    if(!snapshot.exists()) {
        list.innerHTML = '<p style="text-align:center; color:#888;">No hay mensajes todavía.</p>';
        return;
    }
    
    list.innerHTML = '';
    snapshot.forEach((child) => {
        const key = child.key;
        const c = child.val();
        
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.background = '#fff';
        div.style.padding = '8px 12px';
        div.style.borderRadius = '5px';
        div.style.border = '1px solid #e1f5fe';
        
        div.innerHTML = `
            <div style="flex:1;">
                <strong style="color:#0277bd; font-family:'VT323', monospace; font-size:1.2rem;">@${c.name}</strong> 
                <span style="color:#555; font-size:0.9rem;"> - ${c.msg}</span>
            </div>
            <button onclick="window.deleteComment('${key}')" style="background:#ff5252; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:bold; margin-left:10px;">Borrar</button>
        `;
        list.appendChild(div);
    });
});

window.deleteComment = function(key) {
    if(confirm("¿Seguro que quieres borrar esta nubecita de la nube?")) {
        remove(ref(db, `comments/${key}`))
            .catch(err => alert("Error al borrar: " + err));
    }
}
