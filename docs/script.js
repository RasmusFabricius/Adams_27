const riddles = [
    { title: 'Gåde 1', q: 'Jeg er ikke levende, men jeg vokser; jeg har ikke lunger, men jeg har brug for luft; jeg har ikke en mund, men vand dræber mig. Hvad er jeg?', a: 'ild' },
    { title: 'Gåde 2', q: 'Hvad har taster, men kan ikke skrive?', a: 'klaver' },
    { title: 'Gåde 3', q: 'Hvad går op og ned, men bevæger sig aldrig?', a: 'trappe' },
    { title: 'Gåde 4', q: 'Hvad bliver større jo mere du tager fra det?', a: ['hul', 'et hul'] },
    // Emoji-rebus: gæt hvilken Disney-film
    { title: 'Emoji Rebus: 1', q: '🦁👑', a: ['the lion king', 'lion king', 'løvernes konge', 'løvens konge'] },
    { title: 'Emoji Rebus: 2', q: '🧞‍♂️🕌', a: ['aladdin'] },
    { title: 'Emoji Rebus: 3', q: '👠🎃', a: ['askepot', 'cinderella'] },
    { title: 'Emoji Rebus: 4', q: '❄️👭', a: ['frozen', 'frost', 'frost 1', 'frozen 1'] },
    { title: 'Emoji Rebus: 5', q: '🚣‍♀️🌊', a: ['moana', 'vaiana'] },
    { title: 'Emoji Rebus: 6', q: '🐠🔍', a: ['finding nemo', 'nemo', 'find nemo', 'findingen nemo'] },

    // Location image riddles (place matching images in sv/ folder)
    // New order and titles without place names (title shows only 'Billede')
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/grand_canyon.png', a: ['grand canyon'] },
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/rhodos.png', a: ['rhodos', 'rhodes'] },
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/new_york.png', a: ['new york', 'nyc'] },
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/japan.png', a: ['japan'] },
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/milano.png', a: ['milano', 'milan'] },
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/gdansk.png', a: ['gdansk', 'gdańsk'] },
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/monsted.png', a: ['mønsted kalkgruber', 'mønsted', 'monsted'] },
    { title: 'Billede', q: 'Hvilket sted er dette?', img: 'sv/pando.png', a: ['pando'] }
];

let idx = 0;
const titleEl = document.getElementById('riddle-title');
const textEl = document.getElementById('riddle-text');
const ansEl = document.getElementById('answer');
const submitBtn = document.getElementById('submit');
const skipBtn = document.getElementById('skip');
const feedback = document.getElementById('feedback');
const effects = document.getElementById('effects');

function showRiddle(i) {
    const r = riddles[i];
    titleEl.textContent = r.title;
    textEl.textContent = r.q;
    // show/hide image (try multiple file extensions if path fails)
    const imgEl = document.getElementById('riddle-image');
    if (r.img) {
        // try the given path first, then fallbacks
        const candidates = [r.img];
        // if r.img has no extension, try common ones
        if (!/\.[a-zA-Z]{2,4}$/.test(r.img)) {
            candidates.push(r.img + '.jpg', r.img + '.png', r.img + '.svg');
        } else {
            // also try png/jpg variants
            const base = r.img.replace(/\.[^.]+$/, '');
            candidates.push(base + '.jpg', base + '.png');
        }

        let found = false;
        (function tryNext(i) {
            if (i >= candidates.length) { imgEl.style.display = 'none'; imgEl.src = ''; imgEl.alt = ''; return; }
            const url = candidates[i];
            const test = new Image();
            test.onload = function () { imgEl.src = url; imgEl.style.display = 'block'; imgEl.alt = r.title; found = true; };
            test.onerror = function () { if (!found) tryNext(i + 1); };
            test.src = url;
        })(0);
    } else {
        imgEl.src = '';
        imgEl.style.display = 'none';
        imgEl.alt = '';
    }

    ansEl.value = '';
    feedback.textContent = '';
}

function normalize(s) {
    const str = (s || '').toString().trim().toLowerCase();
    // remove diacritics (å, æ, ø etc.) for more flexible matching
    try {
        return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    } catch (e) {
        // fallback for environments without unicode property support
        return str.replace(/[\u0300-\u036f]/g, '');
    }
}

function spawnDucks(count = 20) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'duck';
        el.textContent = '🦆';
        el.style.left = Math.random() * 100 + '%';
        el.style.top = (Math.random() * 10 - 10) + 'vh';
        el.style.fontSize = (20 + Math.random() * 40) + 'px';
        el.style.opacity = 0.95;
        // slight horizontal drift
        el.style.setProperty('--drift', (Math.random() * 40 - 20) + 'px');
        effects.appendChild(el);
        // remove after animation
        setTimeout(() => el.remove(), 3600 + Math.random() * 800);
    }
}

function spawnCarrots(count = 18) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'carrot';
        el.textContent = '🥕';
        el.style.left = Math.random() * 100 + '%';
        el.style.top = (Math.random() * 10 - 10) + 'vh';
        el.style.fontSize = (18 + Math.random() * 30) + 'px';
        const delay = Math.random() * 400;
        el.style.animationDelay = (delay / 1000) + 's';
        effects.appendChild(el);
        setTimeout(() => el.remove(), 3200 + delay);
    }
}

submitBtn.addEventListener('click', () => {
    const guess = normalize(ansEl.value);
    const target = riddles[idx].a;
    if (!guess) { feedback.textContent = 'Skriv venligst et kodeord først.'; return; }

    // support single string or array of acceptable answers
    let correct = false;
    const candidates = Array.isArray(target) ? target.slice() : [target];
    const normCandidates = candidates.map(c => normalize(c));
    correct = normCandidates.includes(guess);

    console.log('Guess:', guess, 'Targets:', normCandidates, 'Correct:', correct);

    if (correct) {
        feedback.textContent = 'Rigtigt! 🎉 Godt klaret, Adam!';
        // run the birthday effect which now includes the duck effect
        showBirthdayEffect();
        // next riddle after short delay
        setTimeout(() => {
            idx = (idx + 1) % riddles.length;
            showRiddle(idx);
        }, 2200);
    } else {
        feedback.textContent = 'Forkert — her kommer gulerødder!';
        spawnCarrots(20);
    }
});

skipBtn.addEventListener('click', () => {
    idx = (idx + 1) % riddles.length;
    showRiddle(idx);
});

function showBirthdayEffect() {
    // small cake + text popup
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '20%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(255,255,255,0.95)';
    popup.style.padding = '18px 22px';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)';
    popup.style.zIndex = 9999;
    popup.innerHTML = `<div style="font-size:22px">🎂 Tillykke Adam! 🎈</div><div style="margin-top:6px;color:#444">Du løste gåden!</div>`;
    document.body.appendChild(popup);
    // spawn ducks as part of the birthday effect
    spawnDucks(32);
    setTimeout(() => popup.remove(), 2400);
}

// initialise
showRiddle(idx);

// allow Enter key
ansEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitBtn.click(); });
