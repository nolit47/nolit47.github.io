const TRUTH_FONT = "'Mingliu', serif";

const palaceSnd = new Audio('stuff/snd/hoihavushenkoikutsu.wav');
palaceSnd.preload = 'auto';
palaceSnd.loop = true;

function tryPlaySnd() {
  palaceSnd.play().catch(() => {});
  document.removeEventListener('click',     tryPlaySnd);
  document.removeEventListener('keydown',   tryPlaySnd);
  document.removeEventListener('mousemove', tryPlaySnd);
}

palaceSnd.play().catch(() => {
  document.addEventListener('click',     tryPlaySnd);
  document.addEventListener('keydown',   tryPlaySnd);
  document.addEventListener('mousemove', tryPlaySnd);
});

function closePalace() {
  palaceSnd.pause();
  palaceSnd.currentTime = 0;

  document.body.classList.add('closing');

  document.body.addEventListener('animationend', () => {
    window.location.href = 'index.html';
  }, { once: true });
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePalace();
});


/* truth */

const truthSnd = new Audio('stuff/snd/ikindalikeyou.wav');
truthSnd.preload = 'auto';
truthSnd.loop = true;

const flickerSnd = new Audio('stuff/snd/trueisfalse.wav');
flickerSnd.preload = 'auto';

let truthOpen = false;
let flickerSoundPlayed = false;

function initStretchBoxes() {
  const layer = document.getElementById('truth-layer');
  const durs  = [8, 7, 9, 11, 6, 13, 10, 15];

  document.querySelectorAll('.truth-box').forEach((box, i) => {
    const rect  = box.getBoundingClientRect();
    const cx    = rect.left + rect.width / 2;
    const dur   = durs[i % durs.length];
    const drift = rect.width * 0.5;
    const w     = 18;

    ['up', 'down'].forEach(dir => {
      const el = document.createElement('div');
      el.className = `stretch-box ${dir}`;
      el.style.setProperty('--dur', `${dur}s`);
      el.style.setProperty('--w',   `${drift}px`);
      el.style.left  = `${cx - w / 2}px`;
      el.style.width = `${w}px`;

      if (dir === 'up') {
        el.style.top    = '0';
        el.style.height = `${rect.top}px`;
      } else {
        el.style.top    = `${rect.bottom}px`;
        el.style.height = `${window.innerHeight - rect.bottom}px`;
      }

      layer.appendChild(el);
    });
  });
}

function openTruth() {
  if (truthOpen) return;
  truthOpen = true;
  flickerSoundPlayed = false;

  palaceSnd.pause();

  const layer = document.getElementById('truth-layer');
  layer.classList.remove('closing');
  layer.classList.add('open');
  document.body.classList.add('truth-open');

  layer.querySelectorAll('.stretch-box').forEach(el => el.remove());

  requestAnimationFrame(() => initStretchBoxes());

  truthSnd.currentTime = 0;
  truthSnd.play().catch(() => {});
}

function closeTruth() {
  if (!truthOpen) return;

  const layer = document.getElementById('truth-layer');
  layer.classList.add('closing');
  document.body.classList.remove('truth-open');

  truthSnd.pause();
  truthSnd.currentTime = 0;

  palaceSnd.play().catch(() => {});

  layer.addEventListener('animationend', () => {
    layer.classList.remove('open', 'closing');
    layer.querySelectorAll('.stretch-box').forEach(el => el.remove());
    truthOpen = false;
    flickerSoundPlayed = false;
  }, { once: true });
}

function initTruthLetters() {

  document.querySelectorAll('.truth-text').forEach(box => {
    const text = box.textContent;
    box.style.fontFamily = TRUTH_FONT;
    box.innerHTML = text.split('').map((ch, i) => {
      if (ch === ' ') return '<span style="display:inline-block;">&nbsp;</span>';
      const delay = (Math.random() * 2).toFixed(2);
      const dur   = (0.08 + Math.random() * 0.12).toFixed(3);
      return `<span class="shake-letter" style="animation-delay:${delay}s;animation-duration:${dur}s">${ch}</span>`;
    }).join('');
  });
}

initTruthLetters();
function initFlickerSounds() {
  document.querySelectorAll('.truth-box').forEach((box, index) => {
    const childNum = index + 1;
    if (childNum % 3 === 0 || childNum % 5 === 0 || childNum % 7 === 0) {
      const textEl = box.querySelector('.truth-text');
      if (!textEl) return;

      let lastPlayed = -Infinity;

      textEl.addEventListener('animationiteration', (e) => {
        if (e.animationName !== 'fuckingBoxFlicker') return;
        if (!truthOpen) return;


        const style = getComputedStyle(textEl);
        const dur = parseFloat(style.animationDuration) * 1000 || 7000;

        const now = performance.now();
        if (now - lastPlayed < dur * 0.5) return;

        lastPlayed = now;

        setTimeout(() => {
          if (!truthOpen) return;
          flickerSnd.currentTime = 0;
          flickerSnd.play().catch(() => {});
        }, dur * 0.96);
      });
    }
  });
}

initFlickerSounds();

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && truthOpen) closeTruth();
});

function gotoparadise() {
  palaceSnd.pause();
  truthSnd.pause();
  document.body.classList.remove('truth-open');
  document.body.style.transition = 'opacity 1.2s ease';
  document.body.style.opacity = '0';
  setTimeout(() => {
    window.location.href = 'paradise.html';
  }, 1200);
}