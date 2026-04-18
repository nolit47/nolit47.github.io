// snd main
const enterSound = new Audio('stuff/snd/enter.wav');
enterSound.preload = 'auto';

const escapeSound = new Audio('stuff/snd/escape.wav');
escapeSound.preload = 'auto';

const hoverSound = new Audio('stuff/snd/hover.wav');
hoverSound.preload = 'auto';

const pulseSound = new Audio('stuff/snd/pulse.wav');
pulseSound.preload = 'auto';
pulseSound.loop = true;

const snd_TileSnd        = 'stuff/snd/trans.wav';
const snd_TileSndBackFak = 'stuff/snd/transback.wav';


function snd_playtileFaster() {
  try {
    const snd = new Audio(snd_TileSnd);
    snd.volume = 1.0;
    snd.defaultPlaybackRate = 0.9 + Math.random() * 0.35;
    snd.playbackRate = snd.defaultPlaybackRate;
    snd.play().catch(() => {});
  } catch (e) {}
}

function playTileSoundBack() {
  try {
    const snd = new Audio(snd_TileSndBackFak);
    snd.volume = 1.0;
    snd.defaultPlaybackRate = 0.9 + Math.random() * 0.35;
    snd.playbackRate = snd.defaultPlaybackRate;
    snd.play().catch(() => {});
  } catch (e) {}
}


const overlay    = document.getElementById('tile-overlay');
const eiseEl     = document.getElementById('tile-eise');
const COLS       = 8;
const ROWS       = 6;
const TILE_COUNT = COLS * ROWS;
const STAGGER    = 38;
const HOLD       = 100;

let tiles = [];


// i call these tiles because it splits it to tiles haha fucking lol
function maintrans_buildtileslol() {

  overlay.innerHTML = '';
  overlay.style.gridTemplateColumns = 'repeat(' + COLS + ', 1fr)';
  overlay.style.gridTemplateRows    = 'repeat(' + ROWS + ', 1fr)';

  tiles = [];


  for (let i = 0; i < TILE_COUNT; i++) {

    const t = document.createElement('div');
    t.className = 'tile'; // 
    overlay.appendChild(t);


    tiles.push(t);  // Actually fukcign build pls

  }
}
maintrans_buildtileslol();



function shuffled() {
  const arr = Array.from({ length: TILE_COUNT }, (_, i) => i);  // im killin gmyself

  for (let i = arr.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];

  }
  return arr;
}

let transitioning = false;

function transitionTo(callback) {

  if (transitioning) return;

  transitioning = true;

  overlay.style.pointerEvents = 'all';
  eiseEl.style.opacity = '1';
  const order1 = shuffled();

  snd_playtileFaster();

  order1.forEach((idx, i) => {  // staggered af
    setTimeout(() => {
      tiles[idx].classList.add('on');

      
      if (i === TILE_COUNT - 1) {
        setTimeout(() => {
          callback();
          window.scrollTo({ top: 0 });

          eiseEl.style.opacity = '0';

          playTileSoundBack();

          const order2 = shuffled();
          order2.forEach((idx2, j) => {
            const lifetime = 0.25 + Math.random() * 0.45;
            const tile = tiles[idx2];

            setTimeout(() => {
              tile.style.setProperty('--lifetime',   lifetime + 's');
              tile.style.setProperty('--fade-delay', '0s');
      
              tile.classList.remove('on');
              tile.classList.add('fade');

              setTimeout(() => {
                tile.classList.remove('fade');

                tile.style.removeProperty('--lifetime');
                tile.style.removeProperty('--fade-delay');
              }, lifetime * 1000 + 50);

              if (j === TILE_COUNT - 1) {
                setTimeout(() => {
                  overlay.style.pointerEvents = 'none';

                  transitioning = false;

                }, lifetime * 1000 + 60);
              }
            }, j * STAGGER);
          });
        }, HOLD);
      }
    }, i * STAGGER);
  });
}



// GATE
const gate     = document.getElementById('gate');
const site     = document.getElementById('site');
const enterBtn = document.getElementById('enter-btn');

const INITHASH = window.location.hash.replace('#', '');
const HasDeepLinker = INITHASH && ['home', 'projects', 'contributions', 'music', 'about'].includes(INITHASH);

if (HasDeepLinker) {

  gate.style.display = 'none';
  site.classList.add('visible');

} else {
  enterBtn.addEventListener('click', () => {

    enterBtn.disabled = true;

    enterSound.play().catch(() => {});

    gate.classList.add('fading-out');

    gate.addEventListener('animationend', () => {
      gate.style.display = 'none';
      
      site.classList.add('visible');
    }, { once: true });
  });
}



                                                                                                                                                                                                   

// navigation
const pages = ['home', 'projects', 'contributions', 'music', 'about'];

function showPage(name) {
  pages.forEach(p => {
    document.getElementById('page-' + p).classList.toggle('active', p === name);
  });
}

function navigate(name) {
  transitionTo(() => {
    showPage(name);

    document.body.classList.toggle('inner-page', name !== 'home');

    if (name === 'home') { escapeSound.currentTime = 0; escapeSound.play().catch(() => {}); }
    const hash = name === 'home' ? '' : '#' + name;
    history.pushState({ page: name }, '', hash || window.location.pathname);
  });
}

window.addEventListener('popstate', (e) => {  // handle buttons
  const page = e.state?.page || 'home';

  transitionTo(() => {
    showPage(page);
    document.body.classList.toggle('inner-page', page !== 'home');
  });

});

if (HasDeepLinker) {
  showPage(INITHASH);
  document.body.classList.toggle('inner-page', INITHASH !== 'home');
}

/* unlocker */

let unlocked       = false;
let fx_pulsetimehold = null;
let fx_fadeint   = null;
let snd_ishoverplaying   = false;

async function unlock() {
  if (unlocked) return;
  unlocked = true;

  document.removeEventListener('click',     unlock);
  document.removeEventListener('keydown',   unlock);
  document.removeEventListener('mousemove', unlock);

  await hoverSound.play().catch(() => {});
  hoverSound.pause(); hoverSound.currentTime = 0;

  await pulseSound.play().catch(() => {});
  pulseSound.pause(); pulseSound.currentTime = 0;
}

document.addEventListener('click',     unlock);
document.addEventListener('keydown',   unlock);
document.addEventListener('mousemove', unlock);

let main_shakebtn  = null;
let fx_shakeloop = null;

function scrfx_StartShake(btn) {
  main_shakebtn = btn;
  btn.classList.remove('shaking');

  void btn.offsetWidth;

  btn.classList.add('shaking');

  setTimeout(() => { if (main_shakebtn === btn) btn.classList.remove('shaking'); }, 2000);

  fx_shakeloop = setTimeout(() => {
    if (main_shakebtn === btn) scrfx_StartShake(btn);
  }, 2600);

}

function scrfx_stopShake() {
  clearTimeout(fx_shakeloop);

  fx_shakeloop = null;
  if (main_shakebtn) { main_shakebtn.classList.remove('shaking'); main_shakebtn = null; }
}

function scrfx_startpulse(btn) {
  clearInterval(fx_fadeint);

  pulseSound.volume = 1;
  pulseSound.currentTime = 0;
  pulseSound.play().catch(() => {});

  scrfx_StartShake(btn);
}


function scrfx_stoppulse() {
  clearInterval(fx_fadeint);
  scrfx_stopShake();

  let vol = pulseSound.volume;

  fx_fadeint = setInterval(() => {
    vol -= 0.05;

    if (vol <= 0) {
      pulseSound.volume = 0;
      pulseSound.pause();
      pulseSound.currentTime = 0;

      clearInterval(fx_fadeint);

    } else {
      pulseSound.volume = vol;
    }
  }, 30);
}

hoverSound.addEventListener('ended', () => { snd_ishoverplaying = false; });



document.querySelectorAll('.nav-btn').forEach(btn => {  // nav button fx
  btn.addEventListener('mouseenter', () => {
    if (!unlocked) return;

    if (!snd_ishoverplaying) {
      snd_ishoverplaying = true;

      hoverSound.currentTime = 0;
      hoverSound.play().catch(() => { snd_ishoverplaying = false; });
    }
    clearTimeout(fx_pulsetimehold);

    fx_pulsetimehold = setTimeout(() => scrfx_startpulse(btn), 2000);
  });

  btn.addEventListener('mouseleave', () => {
    clearTimeout(fx_pulsetimehold);
    scrfx_stoppulse();
  });
});



document.querySelectorAll('.prj-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    if (!unlocked) return;

    const projectHoverSound = new Audio('stuff/snd/photo.wav');
    projectHoverSound.play().catch(() => {});
  });



  btn.addEventListener('click', (e) => {  // prj click anim
    e.preventDefault();
    if (btn.dataset.animating) return;

    btn.dataset.animating = 'true';

    const snd = new Audio('stuff/snd/11.wav');
    snd.play().catch(() => {});

    const label = btn.closest('.prj-item')?.querySelector('.prj-label')?.textContent || 'PROJECT';

    const rect  = btn.getBoundingClientRect();
    const centerX = window.innerWidth  / 2;
    const centerY = window.innerHeight / 2;
    const dx = centerX - (rect.left + rect.width  / 2);
    const dy = centerY - (rect.top  + rect.height / 2);

    const backdrop = document.createElement('div');

    backdrop.id = 'prj-backdrop';

    document.body.appendChild(backdrop);

    requestAnimationFrame(() => backdrop.classList.add('visible'));

    const clone = btn.cloneNode(true);
    clone.id = 'prj-flying';
    clone.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top:  ${rect.top}px;
      width: ${rect.width}px;
      margin: 0;
      z-index: 1100;
      pointer-events: none;
      transition: transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease;
      transform: rotate(${Shit_getRotation(btn)}deg);
    `;
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg) scale(1.15)`;
      });
    });

    setTimeout(() => {
      backdrop.classList.add('black');
      clone.style.opacity = '0';

      setTimeout(() => {
        clone.remove();
        backdrop.remove();
        delete btn.dataset.animating;
        Shit_prj_openpage(label);
      }, 500);
    }, 900);
  });
});

function Shit_getRotation(el) {
  const st = window.getComputedStyle(el);
  const mx = st.transform;
  if (!mx || mx === 'none') return 0;
  const vals = mx.match(/matrix\(([^)]+)\)/);
  if (!vals) return 0;
  const [a, b] = vals[1].split(',').map(Number);
  return Math.round(Math.atan2(b, a) * (180 / Math.PI));
}



// project data main
const PROJECT_DATA = {

  'NYCTO': {
    folder: 'nycto',
    screenshots: 6,
    links: [
      { icon: 'stuff/icons/steam.png',   url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3301968802' },
      { icon: 'stuff/icons/yt.png',      url: 'https://www.youtube.com/@nolit47' },
      { icon: 'stuff/icons/twitter.png', url: 'https://x.com/nolit47' },
    ],
    description: `
    <p>Nycto is my biggest project to date.</p>
    <br>
    <p>Nycto is a semi-survival psychological horror adventure that explores the slow downfall of an alcohol-addicted man living in the depths of post-Soviet Russia. Once the protagonist began drinking heavily, his life spiraled into chaos. Now he must confront his addiction before it completely consumes him.</p>
    <p>Every choice that the player makes matters story-wise and gameplay-wise. Whether the protagonist overcomes his nightmares or succumbs to them is entirely up to the player. Bad decisions deepen his addiction and lead to nightmarish consequences.</p>
    <br>
    <p>The project has been in development since summer 2024. I'm developing it solo by myself, and I have no planned release date yet. I want to make sure the final mod FULLY matches my vision.</p>
    <br>
    <p>This is a deeply personal project for me. Having struggled with addiction myself, I wanted to create something that reflects those experiences i've had.</p>
    <br>
    <p>Key Features:</p>
    <ul>
      <li>Extended Close Combat action</li>
      <li>Immersive Post-Soviet atmosphere</li>
      <li>Interesting Soundtrack that reflects the state of the protagonist</li>
      <li>Unique artstyle that constantly changes throughout the entire adventure</li>
    </ul>

    `
  },
  // more to come
};

function Shit_prj_openpage(name) {
  const existing = document.getElementById('page-project-detail');
  if (existing) existing.remove();

  const data = PROJECT_DATA[name] || null;
  const folder = data ? data.folder : name.toLowerCase().replace(/\s+/g, '');
  const screenshotCount = data ? data.screenshots : 0;
  const description = data ? data.description : `<p>Coming soon.</p>`;
  const links = data ? (data.links || []) : [];

  const linksHTML = links.length > 0 ? `
    <div style="display:flex; gap:14px; justify-content:center; margin-top:12px; margin-bottom:8px;">
      ${links.map(l => `
        <a href="${l.url}" target="_blank">
          <img src="${l.icon}" style="width:28px;height:28px;object-fit:contain;opacity:0.75;transition:opacity 0.15s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.75">
        </a>
      `).join('')}
    </div>
  ` : '';

  let carouselHTML = '';

  if (screenshotCount > 0) {
    let thumbs = '';
    for (let i = 1; i <= screenshotCount; i++) {
      thumbs += `<div class="prj-thumb${i === 1 ? ' active' : ''}" data-idx="${i}"
        style="background-image:url('stuff/screenshots/${folder}/${i}.png')"></div>`;
    }
    
    carouselHTML = `
      <div class="prj-carousel-row">
        <img class="prj-detail-icon" src="stuff/prj_${folder}.png" alt="${name}">
        <div style="flex:1;min-width:0;">
          <div class="prj-carousel">
            <button class="carousel-arrow carousel-prev" onclick="fuckyfuckyCarouselSteppySteppyStep(-1)">&#9664;</button>
            <div class="carousel-main">
              <img id="carousel-img" src="stuff/screenshots/${folder}/1.png" alt="screenshot 1" onclick="Shit_openlightbox(this.src)">
              <span class="carousel-counter"><span id="carousel-cur">1</span> / ${screenshotCount}</span>
            </div>
            <button class="carousel-arrow carousel-next" onclick="fuckyfuckyCarouselSteppySteppyStep(1)">&#9654;</button>
          </div>
          <div class="prj-thumbs">${thumbs}</div>
        </div>
      </div>
      ${linksHTML}
    `;
  }

  const page = document.createElement('div');

  page.id = 'page-project-detail';
  page.innerHTML = `
    <div class="back-wrap prj-detail-header" style="display:flex; align-items:center; justify-content:center; position:relative; line-height:normal; padding: 16px 24px 0;">
      <button class="back-btn" onclick="prj_closeprjpage()">&#9664; Back</button>
      <h1 class="prj-detail-name">${name}</h1>
    </div>
    <div class="bleed-wrap">
      <img class="bleed-img" src="stuff/bleed.png" alt="">
      <div class="page-content prj-detail-content">
        ${carouselHTML}
        <div class="prj-detail-desc">${description}</div>
      </div>
      <div class="footer"><img src="stuff/logo.png" alt="nolit47"></div>
    </div>
  `;
  document.getElementById('site').appendChild(page);

  pages.forEach(p => document.getElementById('page-' + p).classList.remove('active'));

  const blackScreen = document.createElement('div');
  blackScreen.id = 'prj-blackscreen';
  document.body.appendChild(blackScreen);

  requestAnimationFrame(() => {
    page.classList.add('active');
    document.body.classList.add('inner-page');
    if (data && data.screenshots > 0) initCarousel(folder, data.screenshots);
    requestAnimationFrame(() => {
      blackScreen.classList.add('fadeout');
      setTimeout(() => blackScreen.remove(), 700);
    });
  });
}

// lightbox

function Shit_openlightbox(src) {

  const lb = document.createElement('div');

  lb.id = 'lightbox';
  lb.innerHTML = `<img src="${src}">`;
  lb.addEventListener('click', () => lb.remove());

  document.body.appendChild(lb);
}

// Karusel
let carouselIndex = 1;
let carouselTotal = 0;
let carouselFolder = '';

function fuckyfuckyCarouselSteppySteppyStep(dir) {
  const img = document.getElementById('carousel-img');
  const cur = document.getElementById('carousel-cur');
  const thumbs = document.querySelectorAll('.prj-thumb');
  if (!img || carouselTotal === 0) return;

  carouselIndex = ((carouselIndex - 1 + dir + carouselTotal) % carouselTotal) + 1;
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = `stuff/screenshots/${carouselFolder}/${carouselIndex}.png`;
    img.style.opacity = '1';
  }, 150);
  if (cur) cur.textContent = carouselIndex;
  thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx === carouselIndex));
}

function initCarousel(folder, total) {
  carouselIndex = 1;
  carouselTotal = total;
  carouselFolder = folder;

  document.querySelectorAll('.prj-thumb').forEach(t => {
    t.addEventListener('click', () => {
      carouselIndex = +t.dataset.idx;
      const img = document.getElementById('carousel-img');
      const cur = document.getElementById('carousel-cur');
      img.style.opacity = '0';
      setTimeout(() => {
        img.src = `stuff/screenshots/${folder}/${carouselIndex}.png`;
        img.style.opacity = '1';
      }, 150);
      if (cur) cur.textContent = carouselIndex;
      document.querySelectorAll('.prj-thumb').forEach(x => x.classList.toggle('active', x === t));
    });
  });
}

function prj_closeprjpage() {
  const detail = document.getElementById('page-project-detail');
  if (detail) detail.remove();
  navigate('projects');
}