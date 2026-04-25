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

  order1.forEach((idx, i) => {
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

window.addEventListener('popstate', (e) => {
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

let unlocked         = false;
let fx_pulsetimehold = null;
let fx_fadeint       = null;
let snd_ishoverplaying = false;

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

let main_shakebtn = null;
let fx_shakeloop  = null;

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



document.querySelectorAll('.nav-btn').forEach(btn => {
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

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (btn.dataset.animating) return;

    btn.dataset.animating = 'true';

    const snd = new Audio('stuff/snd/11.wav');
    snd.play().catch(() => {});

    const label = btn.closest('.prj-item')?.querySelector('.prj-label')?.textContent || 'PROJECT';

    const rect    = btn.getBoundingClientRect();
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
    meta: {
      status:    'In Development',
      duration:  'July 2024 - Present',
      type:      'GMOD Addon',
      programs:  'Hammer++, VTFEdit, Notepad++, Visual Studio Code, FL Studio 21, PaintDOTNet, Audacity, Ocenaudio, Crowbar, Blender',
      languages: 'GLua',
    },
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
    <br>
    <p>I constantly post devlogs about Nycto on my Twitter and Youtube, so be sure to check them out.</p>
    `
  },

  'Afraid of Monsters: Source': {
    folder: 'aomdc',
    screenshots: 6,
    meta: {
      status:    'Complete',
      duration:  '3 months',
      type:      'GMOD Addon / Port',
      programs:  'Hammer++, Hammer World Editor 4.0, J.A.C.K, VTFEdit, Notepad++, WadMaker, VMT Editor, xwad, Half-life Unified SDK Map Decompiler, GLD2SOURCE Map Fixer, Visual Studio Code, FL Studio 21, PaintDOTNet, Audacity, Crowbar, Blender',
      languages: 'GLua',
    },
    links: [
      { icon: 'stuff/icons/steam.png',   url: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3692187352' },
      { icon: 'stuff/icons/yt.png',      url: 'https://www.youtube.com/@nolit47' },
      { icon: 'stuff/icons/twitter.png', url: 'https://x.com/nolit47' },
    ],
    description: `
    <p>A collaboration between me and vityhysa.</p>
    <br>
    <p>Afraid of Monsters: Source is a full port / remaster of the classic 2007 Half-Life mod Afraid of Monsters: Director's Cut, created by Team Psykskallar, now brought into Garry's Mod.</p>
    <p>This remaster introduces improvements to existing mechanics and adds a small amount of new content.</p>
    <br>
    <p>This project was a struggle to develop as we had to come across SO MUCH issues that I genuinely wanted to give up and kill myself.</p>
    <p>But after almost 3 months of development, we finally managed to release it... Was it worth it? Probably...</p>
    <p>The mod received over 50k visits in 2 weeks, which makes it my most popular on my workshop page.</p>
    <br>
    <p>I can go over every single issue i've encountered during development, but it would take way too long and it would be painful to read about.</p>
    <p>But remember... Porting Goldsrc mods to Gmod is not worth it. At all.</p>
    `
  },

  'TRAUMATIC DESCENT': {
    folder: 'td',
    screenshots: 6,
    meta: {
      status:    'Released in Early Access, Discontinued until further notice',
      duration:  '1 Year',
      type:      'Roblox Game',
      programs:  'Blender, FL Studio 21, Audacity, Roblox Studio, PaintDOTNet',
      languages: 'None',
    },
    links: [
      { icon: 'stuff/icons/roblox.png',   url: 'https://www.roblox.com/games/77632962923565/TRAUMATIC-DESCENT' },
      { icon: 'stuff/icons/bandcamp_small.png',   url: 'https://nolit47.bandcamp.com/album/traumatic-descent-ost' },
      { icon: 'stuff/icons/yt.png',      url: 'https://www.youtube.com/@nolit47' },
      { icon: 'stuff/icons/twitter.png', url: 'https://x.com/nolit47' },
    ],
    description: 
    `
    <p>TRAUMATIC DESCENT is a Roblox game made by me and vityhysa, inspired by Cruelty Squad and Psycho Patrol R made by Ville Kallio.</p>
    <p>It's been in development since October 2024 and eventually released into EARLY ACCESS in October 2025. </p>
    <br>
    <p>Overtime it got some notorious reputation, over being a Cruelty Squad "ripoff" even if it isn't.</p>
    <p>The game received over 100K+ visits within 4 months, however got age restricted for Violent Content & Gore, resulting into the game getting reuploaded with some tweaks in design. And we've decided to discontinue working on this game. Fuck you roblox.</p>
    <br>
    <p>I've worked on Models, Story, Level Design, Sound Design, and music for this game.</p>
    <p>However the story didn't make it fully into the final product, so i'd love to write it down here.</p>
    <br>
    <p>The main character is already dead, but he was kicked out of heaven because God is an egoist sociopath (this is a constant cycle) in short, and the main character is angry at the whole world where no one is unique and everyone behaves the same. He takes revenge on everyone the same way, slowly making his way to the angelic dimension to stop this cycle and destroy the world, but he failed and ended up being the same jailer who was originally in heaven. By completing his missions, he slowly collects his memory.</p>
    <br>
    <p>The whole campaign is a path to the TDGH² LABS to get into the angelic world and destroy the whole world. The whole point of the game is that the player is no different from the other NPCs in the game, and after completing the game, another angel is going to take his place.</p>
    <br>
    <p>The government has built TDGH² LABS to develop & test various biochemical weaponry. Their most powerful biochemical weapon was the Red Gas. They would spread the gas across cities that were nearby the labs to lower the country's population to stabilize the state economy. By inhaling this gas, all vital organs will slowly begin to burn and the skin of the body will melt. Once enough people were killed, soldiers with gas masks would go out and collect what was left of the civilians. Human flesh was required in order to create experimental creatures like the Suicide Bombers and other stuff.</p>
    <br>
    <p>Before becoming an angel Gameslop HQ was the place where the protagonist was working at before being fired, he decided to take revenge and kill everyone including his boss. He wasn't able to kill everyone in the HQ, so he decides to track down every employee that has ever worked there, and kill them later. The last remaining employees were killed in a Café nearby the HQ.</p>
    <br>
    <p>The protagonist's family members were slaughtered by the cultists and their body parts were placed in coffins that are scattered around the house.</p>
    `
  },

  'Forgotten': {
    folder: 'forgotten',
    screenshots: 6,
    meta: {
      status:    'Cancelled',
      duration:  '4 Years',
      type:      'Roblox Game',
      programs:  'Blender, FL Studio 20, Audacity, Roblox Studio, PaintDOTNet',
      languages: 'LUAu',
    },
    links: [],
    description: `<p>A psychological single-player horror game heavily inspired by Silent Hill and Cry of Fear developed on the Roblox engine, revolving around a protagonist who has forgotten everything and tries to regain their memories throughout the game.</p>
<br>
<p>Developed between 2021 and 2024, the story is unfinished, and only one chapter was fully completed.</p>
<br>
<p>Gameplay revolves around solving puzzles, and uncovering fragments of Henry's past while avoiding drug-addicted monsters.</p>
<p>As the game progresses, pieces of his memories begin to surface, slowly revealing the truth behind Henry's past and Kate's disappearance.</p>
<p>The story takes place in the fictional town of Newray, an abandoned town where Henry lived during his childhood.</p>
<p>Much of the town's atmosphere and structure is inspired by my own city. Many of the environment's textures were photographed by me.</p>
<p>The unique feature of this game is the constant switching between camera modes during gameplay.</p>
<p>For example, the player may be in firstperson, but in another room, the view shifts to a fixed camera angle, similar to Silent Hill or Resident Evil.</p>
<p>There was a lot of debate about the project's direction, as each team member had their own vision. As a result, only one chapter was successfully brought to production.</p>
<p>The project was eventually scrapped due to a lack of developers and slow progress.</p>
<br>
<p>It genuinely makes me sad to realize that this project got cancelled, as it was very personal and I've spent a lot of time and effort on it.</p>
<br>
<p><strong>FORGOTTEN: DEV STORY (11.06.2024)</strong></p>

<p>You play as Henry Metwenston.</p>

<p>The game begins with a tram moving down a road, with Henry sitting inside. The camera focuses on him staring blankly out of the window being emotionless. He slowly looks away in disappointment, and the screen fades to black.</p>

<p>Tape noise begins playing in the background. Text appears on a black screen:</p>
<p>''I am alone''<br>
''I am scared''<br>
''I need to wake up''<br>
''Oh.....?''<br>
''Kate?...''</p>

<p>The camera suddenly shifts to a POV of a character chained inside an asylum. The person is panicking, struggling to escape. The player is prompted to rapidly spam LMB. Eventually, he breaks free, but remains trapped in a white padded room. Suddenly, a door opens, revealing a dark void with a single light in the center. As the player reaches it, another light appears farther away.</p>

<p><strong>CHAPTER 1</strong></p>

<p>Henry wakes up from a nightmare, shocked and confused. Strange noises are coming from the bathroom, and he decides to investigate.</p>

<p>Upon opening the door, no one is there - only a key. Henry realizes that Kate, his girlfriend, is missing. It is 5 AM, but he decides to begin searching for her.</p>

<p>Leaving his apartment, Henry hears noises coming from his neighbor's apartment. Inside, everything is covered in rust, and the furniture is overturned. In the living room, there is a VHS player. A tape lies on a chair nearby. Henry inserts it.</p>

<p>Text appears on the screen while something unsettling moves in the background:</p>
<p>''Delicious''<br>
''Bodies''<br>
''You are next''</p>

<p>After the message, a basement door slowly creaks open. The staircase is unusually long. The basement is filled with bloodstains, and a body bag hangs on the wall.</p>

<p>The smell is unbearable. Henry coughs and notices a key inside the body bag. Disgusted but desperate, he pulls it out. The bag suddenly begins to move violently, startling him and causing him to fall back. After a few seconds, it goes still again. The key is covered in a foul substance.</p>

<p>This key unlocks the apartment exit.</p>

<p>Outside, a note flies from a window. It reads: ''Meet me at the hospital. I can help you.'' Confused but desperate, Henry decides to trust it.</p>

<p>The direct road to the hospital is blocked. The only way around is through a set of abandoned apartments. Inside, everything feels long forgotten. A locked door blocks the path forward.</p>

<p>Searching for a key, Henry enters a room and finds one labeled ''Emergency Exit'' on a couch. Suddenly, someone begins violently breaking down a bedroom door. It bursts open, and a deranged man lunges at Henry.</p>

<p>Henry defends himself with a switchblade and manages to survive the encounter.</p>

<p>Afterward, the apartment environment shifts the lights go out. Henry must escape as quickly as possible before something worse happens.</p>`
  },

  'ESCAPE FROM LORA': {
    folder: 'efl',
    screenshots: 6,
    meta: {
      status:    'Complete',
      duration:  '6 months',
      type:      'GMOD Addon',
      programs:  'Hammer++, VTFEdit, Notepad++, VMT Editor, xwad, Visual Studio Code, FL Studio 21, PaintDOTNet, Audacity, Crowbar, Blender',
      languages: 'GLua',
    },
    links: [],
    description: `
    <p>A joke horror mod for Garry's Mod made by me and vityhysa out of boredom. What started as a small joke project later turned into a more serious mod during development.</p>
    <br>
    <p>"A sequel to Paranaphobia, you play as Jason Worthweller, waking up from the nightmare, you realize that your dog is missing. You have decided to ignore this fact, and go to your office. The office is empty, nobody is in the office, however there is something in the basement, waiting for you."</p>
    <br>
    <p>It was originally made as a short joke mod for my friends, which is reflected in its name Lora is vityhysa's dog.</p>
    <br>
    <p>I eventually got bored of making short maps in GMod, so I decided to turn it into a full bait-and-switch horror mod that was both fun and somewhat scary.</p>
    <p>Later in development, after the unfinished version got uploaded to the Workshop, I decided to take the mod in a new direction. The next levels of the mod became much more serious and had an actual plot.</p>
    <p>However, this didn't work out well. The mix of unfunny jokes and serious horror tones didn't really work out. Would you play a horror mod that randomly throws in unfunny genz shit alongside serious themes? I don't think so.</p>
    <p>Still, I don't regret developing this mod at all. It was really fun to make, and it motivated me to start working on my next horror mod for GMod - Nycto.</p>
    `
  },

  'The Rushing Evil': {
    folder: 'therushingevil',
    screenshots: 9,
    meta: {
      status:    'Cancelled',
      duration:  '3 months',
      type:      'Roblox Game',
      programs:  'Blender, FL Studio 20, Audacity, Roblox Studio, PaintDOTNet',
      languages: 'LUAu',
    },
    links: [],
    description: `<p>A 4-player co-op zombie survival horror game, being developed in 2022 for atleast 3 months before getting cancelled, heavily inspired by Left 4 Dead and Resident Evil. Players can complete the campaign together, working as a team to survive against overwhelming odds.</p>

  <p>The game features a weapon modification system that allows players to customize their arsenal with various attachments. Throughout the experience, survivors must travel from point A to point B while fighting off occasional zombie attacks.</p>

  <p>A huge variety of mutated zombies, each with unique abilities and behavior that will try to exterminate the survivors.</p>
  <br>
  <p>The game takes place in a cinematic, apocalyptic setting in the city of Queensland, Canada. During a harsh winter, a nearby nuclear power plant explodes, releasing an unknown red fog that begins to spread throughout the city.</p>
  <p>This so-called ''red fog'' infects humans with a mysterious parasite called Horpon-7 capable of taking control of its host. The infection spreads rapidly, overtaking nearly the entire population. The city is left almost empty, now overrun by infected zombies.</p>
  <br>
  <p>However, a small number of people manage to survive and you play as them. They are not trained soldiers, but just ordinary civilians trying to stay alive. Their goal is to escape the city and reach the nearest uninfected area.</p>
  <p>The survivors must navigate through multiple locations, facing obstacles along the way, and reach safe rooms scattered throughout the city.</p>
  <br>
  <p>Overtime, the infection mutates, making the infected far more dangerous. Survivors must adapt and overcome a variety of powerful enemies.</p> `
  
  },

  'Bloodleak': {
    folder: 'bloodleak',
    screenshots: 9,
    meta: {
      status:    'Complete',
      duration:  '2 months',
      type:      'Roblox Game',
      programs:  'Blender, FL Studio 20, Audacity, Roblox Studio, PaintDOTNet',
      languages: 'LUAu',
    },
    links: [],
    description: `<p>Developed in 2021-2022, BLOODLEAK was intended to be a Quake-like FPS with a variety of unique weapons.</p>
    <br>
    <p>The game didn't aim to stand out like other games, instead focusing on extreme gore and combat finishers inspired by DOOM.</p>
    <br>
    <p>In the end, only a few weapons and several maps were ever completed. Too bad.</p>`
  },

  'Killer7 Russian Localization': {
    folder: 'k7rus',
    screenshots: 7,
    meta: {
      status:    'Complete',
      duration:  '3 months',
      type:      'Localization',
      programs:  'jmbtool, PaintDOTNet',
      languages: 'Python, Java',
    },
    links: [],
    description: `<p>For nearly 20 years, there was no unofficial Russian localization for killer7.</p>
  <br>
  <p>Me and my friend FrostyDias decided to create one, since none of our Russian-speaking friends wanted to play the game due to the lack of a Russian translation for the game.</p>
  <br>
  <p>It was a headache to make due to a shit ton of hardcoded code from the GameCube era.</p>
  <p>At one point, we almost gave up because we didn't have much knowledge of how subtitles work.</p>
  <br>
  <p>But THANKFULLY, we found a guy named ringtone (aka. Fuann Kinoko) on GitHub who was developing a tool named jmbtool that allowed subtitles to be translated into Chinese, which helped us make a russian localization.</p>
  <br>
  <p>Sadly, this program didn't support Cyrillic, so we had to implement our own methods to add Cyrillic text. It wasn't an easy task, since the subtitles are split into separate atlases containing only the letters used in a specific cutscene. We had to reimplement how the atlas-splitting logic works to support Cyrillic characters.</p>
  <p>Eventually, we created a Google Doc containing all the cutscenes translated into Russian. We also documented each cutscene along with its .RSL package name (RSL is a package format used in GHM games that in our case, contains .JMB data).
  <br>
  <p>By pure luck, we came across someone in The Smith Modding Community who was also working on a localization for Killer7. We reached out to him, and he helped us translate the textures and correct the script.</p>
  <p>After several months, multiple builds, and a lot of problem-solving, we finally managed to release the mod. It gained quite a bit of attention, and some people even thanked us for making a localization.</p>
  <p>Honestly, I'm still surprised that no one had managed to create a localization for this game before. What made us different?</p>
  <br>
  <p>With that said, the source code is available on GitHub: https://github.com/nolit47/k7rus-localization</p>`
  },

  'PARANAPHOBIA': {
    folder: 'phobia',
    screenshots: 0,
    meta: {
      status: 'Unknown',
    },
    links: [],
    description: `<p>Coming soon.</p>`
  },

  '???': {
    folder: '',
    screenshots: 0,
    meta: null,
    links: [],
    description: `<p>Coming soon.</p>`
  },

};



function Shit_prj_openpage(name) {
  const existing = document.getElementById('page-project-detail');
  if (existing) existing.remove();

  const data            = PROJECT_DATA[name] || null;
  const folder          = data ? data.folder : name.toLowerCase().replace(/\s+/g, '');
  const screenshotCount = data ? data.screenshots : 0;
  const description     = data ? data.description : `<p>Coming soon.</p>`;
  const links           = data ? (data.links || []) : [];
  const meta            = data ? (data.meta  || null) : null;

  const linksHTML = links.length > 0 ? `
    <div style="display:flex; gap:14px; justify-content:center; margin-top:12px; margin-bottom:8px;">
      ${links.map(l => `
        <a href="${l.url}" target="_blank">
          <img src="${l.icon}" style="width:28px;height:28px;object-fit:contain;opacity:0.75;transition:opacity 0.15s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.75">
        </a>
      `).join('')}
    </div>
  ` : '';

  const metaHTML = meta ? `
    <div class="prj-meta">
      ${meta.status    ? `<div class="prj-meta-row"><span class="prj-meta-key">Project Status</span><span class="prj-meta-val">${meta.status}</span></div>`    : ''}
      ${meta.duration  ? `<div class="prj-meta-row"><span class="prj-meta-key">Duration</span><span class="prj-meta-val">${meta.duration}</span></div>`         : ''}
      ${meta.type      ? `<div class="prj-meta-row"><span class="prj-meta-key">Project Type</span><span class="prj-meta-val">${meta.type}</span></div>`          : ''}
      ${meta.programs  ? `<div class="prj-meta-row"><span class="prj-meta-key">Programs Used</span><span class="prj-meta-val">${meta.programs}</span></div>`     : ''}
      ${meta.languages ? `<div class="prj-meta-row"><span class="prj-meta-key">Languages Used</span><span class="prj-meta-val">${meta.languages}</span></div>`   : ''}
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
        <img class="prj-detail-icon" src="stuff/prj_${folder}.webp" alt="${name}">
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
      <img class="bleed-img" src="stuff/bleed.webp" alt="">
      <div class="page-content prj-detail-content">
        ${carouselHTML}
        ${metaHTML}
        <div class="prj-detail-desc">${description}</div>
      </div>
      <div class="footer"><img src="stuff/logo.webp" alt="nolit47"></div>
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
let carouselIndex  = 1;
let carouselTotal  = 0;
let carouselFolder = '';
let carouselAutoTimer = null;
const CAROUSEL_AUTO_DELAY = 5000;

function carouselResetAutoTimer() {
  clearTimeout(carouselAutoTimer);
  if (carouselTotal > 1) {
    carouselAutoTimer = setTimeout(() => {
      fuckyfuckyCarouselSteppySteppyStep(1, true);
    }, CAROUSEL_AUTO_DELAY);
  }
}

function carouselStopAutoTimer() {
  clearTimeout(carouselAutoTimer);
  carouselAutoTimer = null;
}

function carouselSetImage(idx, skipTimerReset) {
  const img    = document.getElementById('carousel-img');
  const cur    = document.getElementById('carousel-cur');
  const thumbs = document.querySelectorAll('.prj-thumb');
  if (!img) return;

  img.style.transition = 'none';
  img.style.opacity    = '0';
  img.style.transform  = 'scale(0.88)';

  void img.offsetWidth;

  img.src = `stuff/screenshots/${carouselFolder}/${idx}.png`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.style.transition = 'opacity 0.25s ease, transform 0.4s cubic-bezier(0.22,1,0.36,1)';
      img.style.opacity    = '1';
      img.style.transform  = 'scale(1)';
    });
  });

  if (cur) cur.textContent = idx;
  thumbs.forEach(t => t.classList.toggle('active', +t.dataset.idx === idx));

  if (!skipTimerReset) carouselResetAutoTimer();
}

function fuckyfuckyCarouselSteppySteppyStep(dir, isAuto) {
  if (carouselTotal === 0) return;

  carouselIndex = ((carouselIndex - 1 + dir + carouselTotal) % carouselTotal) + 1;
  carouselSetImage(carouselIndex, !!isAuto);

  if (isAuto) {

    carouselAutoTimer = setTimeout(() => {
      fuckyfuckyCarouselSteppySteppyStep(1, true);
    }, CAROUSEL_AUTO_DELAY);
  }
}

function initCarousel(folder, total) {
  carouselIndex  = 1;
  carouselTotal  = total;
  carouselFolder = folder;

  const img = document.getElementById('carousel-img');
  if (img) { img.style.transition = ''; img.style.transform = ''; img.style.opacity = '1'; }

  document.querySelectorAll('.prj-thumb').forEach(t => {
    t.addEventListener('click', () => {
      carouselIndex = +t.dataset.idx;
      carouselSetImage(carouselIndex);
    });
  });

  carouselResetAutoTimer();

  document.querySelectorAll('.carousel-arrow').forEach(btn => {
    btn.addEventListener('click', () => carouselResetAutoTimer());
  });
}

function prj_closeprjpage() {
  const detailPage = document.getElementById('page-project-detail');
  if (!detailPage) return;

  transitionTo(() => {
    detailPage.remove();
    showPage('projects');
    document.body.classList.add('inner-page');
    history.pushState({ page: 'projects' }, '', '#projects');
  });
}