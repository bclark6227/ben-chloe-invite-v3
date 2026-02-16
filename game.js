// Game constants (Arcade Physics only - no Matter.js)
if (!window.__BEN_CHLOE_KEYBINDS__) {
  window.__BEN_CHLOE_KEYBINDS__ = true;
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      const s = window.__ACTIVE_SCENE__;
      if (s && typeof s.onSpace === 'function') s.onSpace();
      else if (s && typeof s.tryJump === 'function') s.tryJump();
    }
    if (e.code === 'KeyR') {
      e.preventDefault();
      const s = window.__ACTIVE_SCENE__;
      if (s && typeof s.retryGame === 'function') s.retryGame();
      else if (s && s.scene) s.scene.restart();
    }
    if (e.code === 'BracketLeft') {
      e.preventDefault();
      const s = window.__ACTIVE_SCENE__;
      if (s && typeof s.gotoChapterByDelta === 'function') s.gotoChapterByDelta(-1);
    }
    if (e.code === 'BracketRight') {
      e.preventDefault();
      const s = window.__ACTIVE_SCENE__;
      if (s && typeof s.gotoChapterByDelta === 'function') s.gotoChapterByDelta(1);
    }
    if (e.code === 'Backslash') {
      e.preventDefault();
      const s = window.__ACTIVE_SCENE__;
      if (s && typeof s.devClearObstaclesAndReset === 'function') s.devClearObstaclesAndReset();
    }
  }, { capture: true, passive: false });
}

const DEV_ASSET_V = 1;

const GRAVITY = 1400;
const JUMP_VELOCITY = -760;
const COYOTE_MS = 90;
const JUMP_BUFFER_MS = 110;
const BASE_SPEED = 320;
const OBSTACLE_SCALE = 2.2; // was 1.8–2.0
const OB_W_MULT = 1.25;
const OB_H_MULT = 1.25;
const INVINCIBILITY_MS = 1200;
const PLAYER_X = 140;
const DEBUG_PUDDLE_HITBOX = false;
const DEBUG_LABELS = false;
const DEBUG_RENDER = false;
const DEBUG_LOG_Y_WRITES = true;
const USE_BEN_RUN_SHEET = false;

const FINALE_APPROACH_SPEED = 180;     // Ben run speed toward Chloe
const FINALE_TRIGGER_DISTANCE = 1200;  // when the reveal triggers
const FINALE_SLOWDOWN_MS = 900;        // smooth decel duration
const FINALE_HOLD_MS = 9999999;        // unused; hold waits for SPACE only
const FINALE_ZOOM = 1.08;              // subtle zoom in

const LOW_OBSTACLE_KEYS = ['puddle', 'tickets'];
const scaleByChapter = {
  concert: 1.35,
  patagonia: 1.35,
  airport: 1.35,
  milou: 1.35,
  italy: 1.35,
  paris: 1.35,
  barbados: 1.35
};
const OBSTACLE_SPECS = {
  concert: [
    { key: 'speaker', w: 110, h: 120, hitboxScale: 0.66, yOffset: 0, spriteYOffset: -8 },
    { key: 'tickets', w: 110, h: 70, hitboxScale: 0.85, yOffset: 0 }
  ],
  milou: [
    { key: 'wine_glass',  w: 110, h: 140, hitboxScale: 0.75, yOffset: 0 },
    { key: 'fallen_chair', w: 150, h: 120, hitboxScale: 0.78, yOffset: 0 },
    { key: 'pasta',      w: 140, h: 95,  hitboxScale: 0.80, yOffset: 0 }
  ],
  patagonia: [
    { key: 'boulder', w: 120, h: 78, hitboxScale: 0.85, yOffset: 0 },
    { key: 'fallen_log', w: 160, h: 56, hitboxScale: 0.80, yOffset: 0 }
  ],
  airport: [
    { key: 'suitcase',  w: 90,  h: 70,  hitboxScale: 0.85, yOffset: 0 },
    { key: 'stanchion', w: 120, h: 80,  hitboxScale: 0.80, yOffset: 0 } // pretzel image lives at stanchion.png
  ],
  driving: [
    { key: 'cone', w: 30, h: 44, color: 0xf1c40f, hitboxScale: 0.85 },
    { key: 'cyclist', w: 36, h: 70, color: 0x2c3e50, hitboxScale: 0.85 }
  ],
  italy: [
    { key: 'vespa',  w: 140, h: 90, hitboxScale: 0.70, yOffset: 0 },
    { key: 'grapes', w: 100, h: 70, hitboxScale: 0.80, yOffset: 0 }
  ],
  paris: [
    { key: 'baguette', w: 120, h: 60, hitboxScale: 0.78, yOffset: 0 },
    { key: 'ring',     w: 90,  h: 70, hitboxScale: 0.75, yOffset: 0 }
  ],
  barbados: [
    { key: 'sandcastle', w: 52, h: 44, hitboxScale: 0.9 }
  ]
};

const CHAPTERS = [
  { key: 'concert', label: 'Rufus du Sol Concert', signs: ['Rufus Du Sol'] },
  { key: 'milou', label: 'Milou — First Date', signs: ['Milou — First Date', 'Milou'] },
  { key: 'patagonia', label: 'Patagonia', signs: ['Patagonia Trailhead'] },
  { key: 'airport', label: 'Santa Barbara', signs: ['Grad School'] },
  { key: 'italy', label: 'Italy — Dolomites & Tuscany', signs: ['Dolomiti', 'Tuscany'] },
  { key: 'paris', label: 'Paris — Engagement', signs: ['Paris'] },
  { key: 'barbados', label: 'Wedding in Barbados', signs: ['Barbados'] }
];

const GROUND_HEIGHT_PX = 90; // tweak: 70-120 depending on how thick you want sand
const SCALE_HEIGHT = 400; // from config
const GROUND_Y = SCALE_HEIGHT - GROUND_HEIGHT_PX; // single ground reference
const CHAPTER_DURATION_SECONDS = 6;
const GROUND_COLORS = {
  concert: 0x141414,
  milou: 0x2a2420,
  patagonia: 0x2c3324,
  airport: 0x2b2f38,
  italy: 0x3b2e26,
  paris: 0x2f3136,
  barbados: 0xc7a874
};

class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  preload() {
    this.load.image('ben', 'assets/player/ben.png');
    this.load.image('chloe', 'assets/chloe/chloe_v2.png');
  }

  create() {
    // --- HARD RESET MENU RENDER STATE ---
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setZoom(1);
    this.cameras.main.setRotation(0);
    this.cameras.main.setBackgroundColor(0x000000);

    // remove anything that might be lingering
    this.children.removeAll(true);

    // stop runner if it was left running behind the menu
    if (this.scene.isActive('RunnerScene')) this.scene.stop('RunnerScene');

    const w = this.scale.width;
    const h = this.scale.height;

    const dim = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.55).setScrollFactor(0);

    const title = this.add.text(w/2, h*0.30, 'Chloe & Ben', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    const line1 = this.add.text(w/2, h*0.46, 'Press SPACE to start', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#bfefff'
    }).setOrigin(0.5).setScrollFactor(0);

    const line2 = this.add.text(w/2, h*0.54, 'SPACE / Tap = Jump', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    const line3 = this.add.text(w/2, h*0.62, '(tap/click works on mobile)', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5).setScrollFactor(0);

    // Ben + Chloe sprites (bottom aligned)
    const ben = this.add.image(w*0.30, h*0.80, 'ben').setOrigin(0.5, 1).setScrollFactor(0);
    ben.displayHeight = 120; ben.scaleX = ben.scaleY;

    const chloe = this.add.image(w*0.70, h*0.80, 'chloe').setOrigin(0.5, 1).setScrollFactor(0);
    chloe.displayHeight = 120; chloe.scaleX = chloe.scaleY;

    // bobbing tweens
    this.tweens.add({ targets: ben, y: ben.y - 10, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: chloe, y: chloe.y - 10, duration: 900, yoyo: true, repeat: -1, delay: 200, ease: 'Sine.easeInOut' });

    // simple pulsing heart in the middle (graphics)
    const heart = this.add.graphics().setScrollFactor(0);
    heart.setPosition(w/2, h*0.70);
    heart.fillStyle(0xff4d6d, 1);
    heart.fillCircle(-6, 0, 6);
    heart.fillCircle( 6, 0, 6);
    heart.fillTriangle(-12, 2, 12, 2, 0, 16);

    this.tweens.add({ targets: heart, scale: 1.15, alpha: 0.75, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const menuContainer = this.add.container(0, 0, [dim, title, line1, line2, line3, ben, chloe, heart]).setDepth(1000);

    const startGame = () => {
      if (this._menuStarted) return;
      this._menuStarted = true;
      this.onSpace = () => {};
      this.input.off('pointerdown');
      this.tweens.add({
        targets: menuContainer,
        alpha: 0,
        duration: 250,
        onComplete: () => this.scene.start('RunnerScene')
      });
    };

    window.__ACTIVE_SCENE__ = this;
    this.onSpace = startGame;
    this.input.on('pointerdown', startGame);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  parent: 'game-container',
  render: { pixelArt: true, roundPixels: true, antialias: false },
  scale: { mode: Phaser.Scale.NONE, width: 800, height: 400, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GRAVITY },
      debug: false,
      debugShowBody: false,
      debugShowStaticBody: false,
      debugShowVelocity: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

(function bootBenChloeRunner() {
  const GAME_KEY = '__BEN_CHLOE_RUNNER_GAME__';
  const CONTAINER_ID = 'game-container';

  function destroyExistingGame() {
    // kill known instance
    const existing = window[GAME_KEY];
    if (existing && typeof existing.destroy === 'function') {
      try { existing.destroy(true); } catch (e) {}
      window[GAME_KEY] = null;
    }

    // kill ANY stray Phaser games (Cursor hot reload / multiple script injections)
    if (window.Phaser && Phaser.GAMES && Phaser.GAMES.length) {
      Phaser.GAMES.slice().forEach(g => {
        try { g.destroy(true); } catch (e) {}
      });
      Phaser.GAMES.length = 0;
    }

    // clear container
    const container = document.getElementById(CONTAINER_ID);
    if (container) container.innerHTML = '';
  }

  destroyExistingGame();
  window[GAME_KEY] = new Phaser.Game(config);
})();

let obstaclesGroup;
let lives = 3;
let score = 0;
let scoreText;
let heartsGroup;
let gameOverOverlay;
let retryKey;
let worldSpeed;

const CHAPTER_KEYS = ['concert', 'milou', 'patagonia', 'airport', 'italy', 'paris', 'barbados'];

function preload() {
  this.load.image('ben', 'assets/player/ben.png?v=1');
  // this.load.spritesheet('ben_run', 'assets/player/ben_run.png?v=1', {
  //   frameWidth: 96,
  //   frameHeight: 96
  // });
  this.load.image('chloe', 'assets/chloe/chloe_v2.png?v=3');
  this.load.image('ui_heart', 'assets/ui/heart.png?v=1');
  this.load.image('altar', 'assets/props/barbados/altar.png?v=999');
  this.load.image('sandcastle', 'assets/obstacles/barbados/sandcastle.png?v=1');
  this.load.image('champagne', 'assets/obstacles/barbados/champagne_bottle.png?v=1');

  // concert obstacles + props
  this.load.image('concert_neon_sign', 'assets/props/concert/neon_sign.png?v=3');

  // NEW concert obstacles (simple + readable)
  this.load.image('speaker', 'assets/obstacles/concert/speaker.png?v=1');
  this.load.image('tickets', 'assets/obstacles/concert/tickets.png?v=1');

  // Debug: log file URLs + sizes
  this.load.on('filecomplete-image', (key, type, data) => {
    try {
      const tex = this.textures.get(key);
      const src = tex?.getSourceImage?.();
      const w = src?.width, h = src?.height;
      console.log('[FILECOMPLETE]', key, 'image', w, h, 'url=', data?.src || data?.url || '(no url)');
      if (['wine_glass', 'fallen_chair', 'pasta'].includes(key)) {
        console.log('[MILOU LOADED]', key, w, h);
      }
    } catch (e) {
      console.log('[FILECOMPLETE]', key, 'image', '(error reading texture)', e);
    }
  });
  this.load.on('filecomplete-image', (key) => {
    if (key.includes('barbados')) {
      const tex = this.textures.get(key);
      const img = tex?.getSourceImage?.();
      console.log('[BARBADOS LOADED]', key, img?.width, img?.height);
    }
  });
  this.load.on('filecomplete-image', (key) => {
    if (key.includes('patagonia') || key.includes('paris')) {
      const tex = this.textures.get(key);
      const img = tex?.getSourceImage?.();
      console.log('[GROUND LOADED]', key, img?.width, img?.height);
    }
  });

  CHAPTER_KEYS.forEach(chKey => {
    this.load.image(`bg_${chKey}_sky`,    `assets/backgrounds/${chKey}/sky.png?v=${DEV_ASSET_V}`);
    this.load.image(`bg_${chKey}_ground`, `assets/backgrounds/${chKey}/ground.png?v=${DEV_ASSET_V}`);
  });
  // milou prop
  this.load.image('milou_first_date_sign', 'assets/props/milou/first_date_sign.png?v=3');

  // milou obstacles
  this.load.image('wine_glass', 'assets/obstacles/milou/wine_glass.png?v=1');
  this.load.image('fallen_chair', 'assets/obstacles/milou/fallen_chair.png?v=1');
  this.load.image('pasta', 'assets/obstacles/milou/pasta.png?v=1');

  // airport obstacles + prop
  this.load.image('suitcase',  `assets/obstacles/airport/suitcase.png?v=${DEV_ASSET_V}`);
  this.load.image('stanchion', `assets/obstacles/airport/stanchion.png?v=${DEV_ASSET_V}`);
  this.load.image('airport_grad_school_sign', 'assets/props/airport/grad_school_sign.png?v=1');

  // patagonia obstacles
  this.load.image('boulder', 'assets/obstacles/patagonia/boulder.png?v=2');
  this.load.image('fallen_log', 'assets/obstacles/patagonia/fallen_log.png?v=2');

  // italy obstacles
  this.load.image('vespa', 'assets/obstacles/italy/vespa.png');
  this.load.image('grapes', 'assets/obstacles/italy/grapes.png');

  // paris obstacles + prop
  this.load.image('baguette', 'assets/obstacles/paris/baguette.png?v=1');
  this.load.image('ring', 'assets/obstacles/paris/ring.png?v=2');

  this.load.on('loaderror', (file) => {
  console.log('LOAD ERROR:', file.key, file.src);
  if (file.key === 'altar') {
    alert('ALTAR FAILED TO LOAD: ' + file.src);
  }
});
  this.load.on('filecomplete-image-chloe', () => console.log('Chloe loaded OK'));
  this.load.on('filecomplete-image-ben', () => console.log('Ben loaded OK'));
  // milou prop
  this.load.on('filecomplete-image-milou_first_date_sign', () => console.log('[LOADED] milou_first_date_sign'));
  this.load.on('filecomplete-image-boulder', () => console.log('[LOADED] boulder'));
  this.load.on('filecomplete-image-fallen_log', () => console.log('[LOADED] fallen_log'));
  const g2 = this.make.graphics({ x: 0, y: 0, add: false });
  g2.fillStyle(0xffffff, 1);
  g2.fillRect(0, 0, 1, 1);
  g2.generateTexture('_groundBody', 1, 1);

  this.load.on('filecomplete', (key, type, data) => {
    if (key.includes('chloe') || key.includes('barbados')) {
      console.log('[LOADED]', key, type);
    }
  });
}

function coverImageToRect(img, rectW, rectH) {
  // scale like CSS background-size: cover
  const s = Math.max(rectW / img.width, rectH / img.height);
  img.setScale(s);
}

function setStaticSkyAndGround(container, scene, chKey) {
  // container children: [skyImage, groundFillRect, groundTileSprite]
  const w = scene.scale.width;
  const h = scene.scale.height;
  const groundY = GROUND_Y;
  const skyH = groundY;
  const groundH = h - groundY;

  const skyKey = `bg_${chKey}_sky`;
  const groundKey = `bg_${chKey}_ground`;

  const sky = container.list[0];
  const fill = container.list[1];
  const ground = container.list[2];

  if (sky && scene.textures.exists(skyKey)) {
    sky.setTexture(skyKey);
    const tex = scene.textures.get(skyKey);
    const src = tex?.getSourceImage?.();
    const iw = src?.width || sky.width;
    const ih = src?.height || sky.height;
    const s = Math.max(w / iw, skyH / ih);
    sky.setPosition(w / 2, skyH / 2);
    sky.setOrigin(0.5, 0.5);
    sky.setScale(s);
  }

  if (fill) {
    fill.setPosition(w / 2, groundY + groundH / 2);
    fill.setSize(w + 600, groundH);
  }

  if (ground && scene.textures.exists(groundKey)) {
    ground.setTexture(groundKey);
    ground.setPosition(w / 2, groundY + groundH / 2);
    ground.setSize(w + 600, groundH);
    ground.tileScaleY = groundH / 40;
    ground.setAlpha(1);
    ground.setVisible(true);
  }

  if (ground) {
    ground._isTileSprite = true;
    ground._parallaxFactor = 1;
    scene.groundTile = ground;
  }
}

function createParallaxForChapter(scene, chKey) {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const groundY = GROUND_Y;

  // Special-case: chapters where sky art is a full scene image (not a tiling texture)
  // All chapters with sky+ground: static sky (w × GROUND_Y) + tileSprite ground (fills bottom), removes black gap
  if ((chKey === 'barbados' || chKey === 'concert' || chKey === 'patagonia' || chKey === 'airport' || chKey === 'italy' || chKey === 'paris' || chKey === 'milou') &&
      scene.textures.exists(`bg_${chKey}_sky`)) {
    const layers = [];
    const skyH = groundY;

    // STATIC SKY: cover the full top rect, anchored center
    const bg = scene.add.image(w / 2, skyH / 2, `bg_${chKey}_sky`).setDepth(-20);
    bg.setOrigin(0.5, 0.5);
    const tex = scene.textures.get(`bg_${chKey}_sky`);
    const src = tex?.getSourceImage?.();
    const iw = src?.width || bg.width || 1;
    const ih = src?.height || bg.height || 1;
    const cover = Math.max(w / iw, skyH / ih);
    bg.setScale(cover);
    bg.setPosition(w / 2, skyH / 2);
    layers.push(bg);

    const fillH = h - groundY;
    const fillY = groundY + fillH / 2;
    const fillColor = GROUND_COLORS[chKey] ?? 0x1a1a1a;

    const groundFill = scene.add.rectangle(w / 2, fillY, w + 600, fillH, fillColor, 1).setDepth(9);
    layers.push(groundFill);

    const highlight = scene.add.rectangle(w / 2, GROUND_Y + 1, w + 400, 2, 0xffffff, 0.18).setDepth(11);
    layers.push(highlight);

    const band = scene.add.tileSprite(w / 2, GROUND_Y + 6, w + 400, 12, '_groundBody').setDepth(10);
    band.setAlpha(0.08);
    band._isTileSprite = true;
    band._parallaxFactor = 1;
    scene.groundTile = band;
    layers.push(band);

    return layers;
  }

  const layers = [];

  // Single background (tileSprite so it scrolls)
  const bgKey = `bg_${chKey}_sky`;
  if (scene.textures.exists(bgKey)) {
    const bg = scene.add.tileSprite(w / 2, h / 2, w + 100, h + 20, bgKey).setDepth(-20);
    bg._parallaxFactor = 0.25; // slow scroll
    bg._isTileSprite = true;
    layers.push(bg);
  }

  // Ground strip (fast scroll) - procedural band
  const fillH = h - groundY;
  const fillY = groundY + fillH / 2;
  const fillColor = GROUND_COLORS[chKey] ?? 0x1a1a1a;

  const groundFill = scene.add.rectangle(w / 2, fillY, w + 500, fillH, fillColor, 1).setDepth(9);
  layers.push(groundFill);

  const highlight = scene.add.rectangle(w / 2, GROUND_Y + 1, w + 400, 2, 0xffffff, 0.18).setDepth(11);
  layers.push(highlight);

  const band = scene.add.tileSprite(w / 2, GROUND_Y + 6, w + 400, 12, '_groundBody').setDepth(10);
  band.setAlpha(0.08);
  band._isTileSprite = true;
  band._parallaxFactor = 1;
  scene.groundTile = band;
  layers.push(band);

  return layers;
}

function create() {
  console.log('[MILOU TEXTURES] sky=' + this.textures.exists('bg_milou_sky') + ' ground=' + this.textures.exists('bg_milou_ground') + ' wine_glass=' + this.textures.exists('wine_glass') + ' fallen_chair=' + this.textures.exists('fallen_chair') + ' pasta=' + this.textures.exists('pasta'));

  this.isGameOver = false;
  this.distanceAccum = 0;
  this.invincibleUntil = 0;
  this.lives = 3;
  lives = 3;
  score = 0;
  this.mode = 'story';
  this.storyElapsedSec = 0;
  this.storyPausedForFinale = false;
  this.currentChapterIndex = 0;
  this.chapterStartTime = 0;

  this.chapters = CHAPTERS.map(c => ({ ...c, durationSec: CHAPTER_DURATION_SECONDS }));

  const params = new URLSearchParams(window.location.search);
  const startKey = params.get('chapter');
  this._startChapterIndex = startKey ? this.chapters.findIndex(c => c.key === startKey) : -1;

  window.__ACTIVE_SCENE__ = this;

  // --- START SCREEN (bobbing Ben + Chloe) ---
  this.hasStarted = false;
  worldSpeed = 0;
  this.physics.world.pause();

  if (this.startOverlay) { this.startOverlay.destroy(true); }
  this.startOverlay = this.add.container(0, 0).setDepth(5000);

  const dim = this.add.rectangle(
    this.scale.width / 2, this.scale.height / 2,
    this.scale.width, this.scale.height,
    0x000000, 0.55
  );

  const title = this.add.text(this.scale.width / 2, 120, 'Chloe & Ben', {
    fontSize: 54, color: '#ffffff'
  }).setOrigin(0.5);

  const sub = this.add.text(this.scale.width / 2, 190, 'Press SPACE to start', {
    fontSize: 26, color: '#bfefff'
  }).setOrigin(0.5);

  const hint = this.add.text(this.scale.width / 2, 235, 'SPACE also jumps\n(tap/click works on mobile)', {
    fontSize: 18, color: '#ffffff', align: 'center'
  }).setOrigin(0.5);

  // sprites
  const benStart = this.add.image(this.scale.width * 0.35, 330, 'ben').setOrigin(0.5, 1);
  benStart.displayHeight = 95;
  benStart.scaleX = benStart.scaleY;

  const chloeStart = this.add.image(this.scale.width * 0.65, 330, 'chloe').setOrigin(0.5, 1);
  chloeStart.displayHeight = 105;
  chloeStart.scaleX = chloeStart.scaleY;

  // bobbing tween
  this.tweens.add({
    targets: [benStart, chloeStart],
    y: '+=8',
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  this.startOverlay.add([dim, title, sub, hint, benStart, chloeStart]);

  this.startGame = () => {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.startOverlay.setVisible(false);
    this.physics.world.resume();
    worldSpeed = BASE_SPEED;
    ensureSpawnerRunning(this);
  };
  this.input.keyboard?.off('keydown-SPACE');
  this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
  this.input.off('pointerdown');
  this.input.on('pointerdown', () => this.startGame());

  this.onSpace = () => {
    this.startMusic();
    if (!this.hasStarted) {
      this.startGame();
      return;
    }
    if (this.atInviteEnd) {
      this.scene.restart();
      return;
    }
    this.tryJump();
  };

  this.bgm = document.getElementById('bgm');
  this.bgmStarted = false;

  // HARD: make sure it does NOT loop
  if (this.bgm) {
    this.bgm.loop = false;   // important
    this.bgm.volume = 0.6;
  }
  this.startMusic = () => {
    if (this.bgmStarted) return;
    this.bgmStarted = true;
    if (this.bgm) {
      this.bgm.volume = 0.6;
      const p = this.bgm.play();
      if (p && p.catch) p.catch(() => {});
    }
  };

  this.fadeOutBgm = (durationMs = 4500) => {
    if (!this.bgm) return;
    if (this._bgmFading) return;
    this._bgmFading = true;

    const startVol = this.bgm.volume;

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: durationMs,
      ease: 'Linear',
      onUpdate: (tw) => {
        const t = tw.getValue();
        this.bgm.volume = startVol * (1 - t);
      },
      onComplete: () => {
        this.bgm.pause();
        this.bgm.currentTime = 0;
        this.bgm.volume = 0.6;     // reset for next run
        this._bgmFading = false;
      }
    });
  };

  this.atInviteEnd = false;

  // ---- FORCE DISABLE ARCADE DEBUG (bulletproof) ----
  try {
    if (this.physics?.world) {
      // Phaser 3 toggles
      this.physics.world.drawDebug = false;

      // If a debug graphic was created, destroy it
      if (this.physics.world.debugGraphic) {
        this.physics.world.debugGraphic.clear();
        this.physics.world.debugGraphic.destroy();
        this.physics.world.debugGraphic = null;
      }

      // Also nuke any Graphics objects that look like the debug graphic
      this.children.list
        .filter(o => o && o.type === 'Graphics' && o.depth >= 9990)
        .forEach(g => { try { g.clear(); g.destroy(); } catch (e) {} });
    }
  } catch (e) {
    console.warn('debug disable failed', e);
  }
  // -----------------------------------------------

  // if (!this.anims.exists('ben_run')) {
  //   this.anims.create({
  //     key: 'ben_run',
  //     frames: this.anims.generateFrameNumbers('ben_run', { start: 0, end: 7 }),
  //     frameRate: 12,
  //     repeat: -1
  //   });
  // }

  // Debug: dump any texture keys containing "chloe" or "barbados"
  const keys = this.textures.getTextureKeys();
  keys
    .filter(k => k.toLowerCase().includes('chloe') || k.toLowerCase().includes('barbados'))
    .forEach(k => {
      const t = this.textures.get(k);
      const img = t?.getSourceImage?.();
      console.log('[TEX]', k, img?.width, img?.height);
    });

  // DEBUG OVERLAY (temporary - remove this block to delete)
  const prev = document.getElementById('ben-chloe-debug-overlay');
  if (prev) prev.remove();
  if (this._debugOverlayInterval) clearInterval(this._debugOverlayInterval);
  const debugEl = document.createElement('div');
  debugEl.id = 'ben-chloe-debug-overlay';
  debugEl.style.cssText = 'position:fixed;top:8px;left:8px;font:11px monospace;color:#0f0;background:rgba(0,0,0,0.8);padding:6px 10px;z-index:9999;pointer-events:none;';
  document.body.appendChild(debugEl);
  this._debugOverlayInterval = setInterval(() => {
    const sceneKey = (this.scene && this.scene.key) || 'default';
    const container = document.getElementById('game-container');
    const canvasCount = container ? container.querySelectorAll('canvas').length : 0;
    const countBen = (obj) => {
      let n = 0;
      if (obj.texture && obj.texture.key === 'ben') n++;
      if (obj.getAll) obj.getAll().forEach(c => { n += countBen(c); });
      return n;
    };
    const benCount = (this.children.getChildren?.() || []).reduce((s, c) => s + countBen(c), 0);
    debugEl.textContent = `scene: ${sceneKey} | canvases: ${canvasCount} | ben objs: ${benCount}`;
  }, 500);
  // END DEBUG OVERLAY

  this.cameras.main.setRoundPixels(true);
  this.game.canvas.style.width = '800px';
  this.game.canvas.style.height = '400px';
  this.game.canvas.setAttribute('tabindex', '0');
  this.game.canvas.focus();
  this.input.on('pointerdown', () => {
    if (this.onSpace) this.onSpace();
  });

  this.signsGroup = this.add.group();
  this.sceneDecor = this.add.container(0, 0).setDepth(-5);

  this.cameras.main.setBackgroundColor(0x0);
  this.cameras.main.setScroll(0, 0);

  this.bgA = this.add.container(0, 0).setDepth(-20);
  this.parallaxScrollX = 0;
  const initialChKey = (this._startChapterIndex >= 0 && this.chapters[this._startChapterIndex]) ? this.chapters[this._startChapterIndex].key : 'concert';
  this.bgA.removeAll(true);
  createParallaxForChapter(this, initialChKey).forEach(obj => this.bgA.add(obj));

  this.chapterOverlay = this.add.container(0, 0).setDepth(55);
  const chBg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, 80, 0x000000, 0.85);
  chBg.setScrollFactor(0);
  this.chapterOverlayText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', { fontSize: 20, color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0);
  this.chapterOverlay.add([chBg, this.chapterOverlayText]);
  this.chapterOverlay.setVisible(false);

  if (!this.chapterProps) this.chapterProps = {};
  // Concert sign (top-right)
  this.chapterProps.concertSign = this.add.image(this.scale.width - 22, 22, 'concert_neon_sign')
    .setDepth(2001).setScrollFactor(0).setOrigin(1, 0);
  this.chapterProps.concertSign.displayWidth = 240;
  this.chapterProps.concertSign.scaleY = this.chapterProps.concertSign.scaleX;
  this.chapterProps.concertSign.setVisible(false);
  // Milou sign (top-right)
  this.chapterProps.milouSign = this.add.image(this.scale.width - 22, 22, 'milou_first_date_sign')
    .setDepth(2001).setScrollFactor(0).setOrigin(1, 0);
  this.chapterProps.milouSign.displayWidth = 240;
  this.chapterProps.milouSign.scaleY = this.chapterProps.milouSign.scaleX;
  this.chapterProps.milouSign.setVisible(false);

  const gx = this.scale.width / 2;
  const gy = GROUND_Y + GROUND_HEIGHT_PX / 2;
  this.groundBody = this.physics.add.staticImage(gx, gy, '_groundBody');
  this.groundBody.setDisplaySize(this.scale.width, GROUND_HEIGHT_PX);
  this.groundBody.refreshBody();
  this.groundBody.setVisible(false);

  this.player = this.physics.add.sprite(PLAYER_X, GROUND_Y, 'ben');
  this.player.setOrigin(0.5, 1);

  this.player.displayHeight = 106; // ~15% bigger than 92
  this.player.scaleX = this.player.scaleY;

  const dw = this.player.displayWidth;
  const dh = this.player.displayHeight;
  const sx = this.player.scaleX;
  const sy = this.player.scaleY;
  const bodyW = dw * 0.38;
  const bodyH = dh * 0.82;
  const offX = (dw - bodyW) / 2;
  const offY = dh - bodyH;
  this.player.body.setSize(bodyW / sx, bodyH / sy);
  this.player.body.setOffset(offX / sx, offY / sy);

  this.player.setDepth(1000);
  this.player.setCollideWorldBounds(true);
  this.player.body.allowGravity = true;
  this.player.body.moves = true;
  this.physics.add.collider(this.player, this.groundBody);

  this.player.setPosition(PLAYER_X, GROUND_Y);
  this.player.setVelocity(0, 0);

  this.jumpKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  this.player.setBounce(0);
  this.player.setDragX(2000);
  this.player.setMaxVelocity(0, 1200);

  this.finish = {
    active: false,
    reached: false,
    phase: 'off',          // 'off' | 'approach' | 'reveal' | 'hold'
    triggerDistance: FINALE_TRIGGER_DISTANCE,
    startDistance: 0,
    altar: null,
    banner: null,
    chloe: null,
    inviteText: null,
    holdUntil: 0,
    slowdownStart: 0,
    slowdownFromSpeed: BASE_SPEED,
    targetX: this.scale.width - 240
  };

  if (DEBUG_RENDER || DEBUG_LABELS) {
    this.debugBenLabel = this.add.text(0, 0, 'BEN', { fontSize: 12, color: '#ffff00' }).setOrigin(0.5, 1).setDepth(1001);
  }
  if (DEBUG_RENDER || DEBUG_LABELS) {
    this.debugJumpText = this.add.text(10, 60, '', { fontSize: 11, color: '#00ff00' }).setOrigin(0, 0).setScrollFactor(0).setDepth(1003);
    this.debugChapterText = this.add.text(10, 78, '', { fontSize: 11, color: '#00aaff' }).setOrigin(0, 0).setScrollFactor(0).setDepth(1003);
  }
  if (DEBUG_RENDER) {
    this.debugRenderGraphics = this.add.graphics().setDepth(1002);
  }

  this.obstaclesGroup = this.physics.add.group({ allowGravity: false, immovable: true });
  obstaclesGroup = this.obstaclesGroup;

  this.handleObstacleHit = function (player, obstacle) {
    if (this.isGameOver) return;
    if (this.finish?.active && (this.finish.reached || this.finish.phase === 'reveal' || this.finish.phase === 'hold')) return;
    if (this.time.now < this.invincibleUntil) return;
    this.lives = Math.max(0, this.lives - 1);
    lives = this.lives;
    this.invincibleUntil = this.time.now + 1200;
    this.updateLivesUI?.();
    this.cameras.main.flash(80);
    this.player.setX(Math.max(60, this.player.x - 25));
    this.player.setVelocityX(0);
    this.player.body.setVelocityY(-200);
    this.cameras.main.shake(150, 0.006);
    if (this.lives <= 0) this.gameOver();
  };

  this.updateLivesUI = () => {
    heartsGroup.getChildren().forEach((heart, i) => heart.setVisible(i < this.lives));
  };

  this.gameOver = () => {
    this.isGameOver = true;
    gameOverOverlay.setVisible(true);
    const children = gameOverOverlay.getAll();
    const finalEl = children[2];
    if (finalEl && finalEl.setText) finalEl.setText('Score: ' + score);
  };

  this.physics.add.overlap(
    this.player,
    this.obstaclesGroup,
    this.handleObstacleHit,
    null,
    this
  );

  this.spawnCount = 0;
  this.nextSpawnTimer = null;
  // do not spawn until the game starts (SPACE)

  this.retryGame = () => { if (this.isGameOver) this.scene.restart(); };

  this.lockPlayerX = () => {
    this.player.setVelocityX(0);
    this.player.setX(PLAYER_X);
  };

  this.isGrounded = () => {
    const b = this.player?.body;
    return b && (b.blocked.down || b.touching.down);
  };

  this.tryJump = () => {
    if (this.isGameOver) return;
    this.lastJumpPressedTime = this.time.now;
  };

  heartsGroup = this.add.group();
  for (let i = 0; i < 3; i++) {
    const heart = this.add.image(24 + i * 30, 24, 'ui_heart');
    heart.setOrigin(0, 0.5);
    heart.setScrollFactor(0);
    heart.setDepth(40);
    heart.setScale(2); // tweak if you want bigger/smaller
    heartsGroup.add(heart);
  }

  scoreText = this.add.text(this.scale.width - 20, 20, '0', {
    fontSize: 24,
    color: '#ffffff'
  });
  scoreText.setOrigin(1, 0);
  scoreText.setScrollFactor(0);
  scoreText.setDepth(40);

  gameOverOverlay = this.add.container(0, 0);
  const overlayBg = this.add.rectangle(
    this.scale.width / 2,
    this.scale.height / 2,
    this.scale.width,
    this.scale.height,
    0x000000,
    0.7
  );
  overlayBg.setScrollFactor(0);
  const gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40, 'GAME OVER', {
    fontSize: 48,
    color: '#e74c3c'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setScrollFactor(0);
  const finalScoreText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 10, 'Score: 0', {
    fontSize: 24,
    color: '#ffffff'
  });
  finalScoreText.setOrigin(0.5);
  finalScoreText.setScrollFactor(0);
  const retryText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 60, 'Press R to Retry', {
    fontSize: 28,
    color: '#2ecc71'
  });
  retryText.setOrigin(0.5);
  retryText.setScrollFactor(0);
  gameOverOverlay.add([overlayBg, gameOverText, finalScoreText, retryText]);
  gameOverOverlay.setVisible(false);
  gameOverOverlay.setDepth(50);

  retryKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  this.lastGroundedTime = this.time.now;
  this.lastJumpPressedTime = 0;

  this.gotoChapterByDelta = (delta) => {
    const newIndex = (this.currentChapterIndex + delta + CHAPTERS.length) % CHAPTERS.length;
    this.setChapter(newIndex);
    this.obstaclesGroup.clear(true);
    this.parallaxScrollX = 0;
  };

  this.devClearObstaclesAndReset = () => {
    this.obstaclesGroup.clear(true);
    this.distanceAccum = 0;
    this.parallaxScrollX = 0;
    score = 0;
    if (scoreText) scoreText.setText('0');
  };

  this.setChapter = (index) => {
    this.currentChapterIndex = index;
    this.chapterStartTime = this.time.now;
    const ch = this.chapters[index];

    if (this.chapterProps?.concertSign) this.chapterProps.concertSign.setVisible(false);
    if (this.chapterProps?.milouSign) this.chapterProps.milouSign.setVisible(false);
    if (ch.key === 'concert' && this.chapterProps?.concertSign) this.chapterProps.concertSign.setVisible(true);
    if (ch.key === 'milou' && this.chapterProps?.milouSign) this.chapterProps.milouSign.setVisible(true);

    if (!ch) return;
    if (this.debugChapterText) this.debugChapterText.setText(`${ch.key} | ${ch.label}`);

    rebuildChapterDecor(this, ch.key);

    if (this.chapterProps.airportSign) this.chapterProps.airportSign.setVisible(false);

    // Airport sign
    if (ch.key === 'airport') {
      console.log('[AIRPORT]', {
        sky: this.textures.exists('bg_airport_sky'),
        ground: this.textures.exists('bg_airport_ground')
      });

      if (this.textures.exists('airport_grad_school_sign')) {
        if (!this.chapterProps.airportSign) {
          const sign = this.add.image(
            this.scale.width - 170,
            55,
            'airport_grad_school_sign'
          )
            .setDepth(6)
            .setScrollFactor(0)
            .setOrigin(0.5);

          sign.displayWidth = 340;
          sign.scaleY = sign.scaleX;

          this.chapterProps.airportSign = sign;
        }
        this.chapterProps.airportSign.setVisible(true);
      }
    }

    if (ch.key === 'patagonia') {
      console.log('[PATAGONIA EXISTS]', {
        sky: this.textures.exists('bg_patagonia_sky'),
        ground: this.textures.exists('bg_patagonia_ground'),
        boulder: this.textures.exists('boulder'),
        fallen_log: this.textures.exists('fallen_log')
      });
    }

    // seamless chapter swap: no fade, just swap the art instantly
    this.bgA.removeAll(true);
    createParallaxForChapter(this, ch.key).forEach(o => this.bgA.add(o));

    const isFinal = ch.key === 'barbados';
    if (isFinal) {
      this.finish.active = true;
      this.finish.startDistance = this.distanceAccum || 0;
      this.finish.phase = 'approach';
      this.finish.reached = false;
      this.finish.slowdownStart = 0;

      // reset camera in case we're coming from a previous run
      this.cameras.main.setZoom(1);
      this.cameras.main.setScroll(0, 0);

      const w = this.scale.width;
      this.groundBody.setDisplaySize(this.scale.width, GROUND_HEIGHT_PX);
      this.groundBody.setPosition(w / 2, GROUND_Y + GROUND_HEIGHT_PX / 2);
      this.groundBody.refreshBody();

      if (!this.finish.altar) {
        this.finish.altar = this.add.image(this.scale.width - 140, GROUND_Y, 'altar')
          .setOrigin(0.5, 1).setDepth(1000);
        this.finish.altar.displayHeight = 180; // 120 * 1.5
        this.finish.altar.scaleX = this.finish.altar.scaleY;
      }
      if (!this.finish.chloe) {
        this.finish.chloe = this.add.image(this.scale.width - 140, GROUND_Y, 'chloe')
          .setOrigin(0.5, 1).setDepth(1001);
        this.finish.chloe.displayHeight = 120; // 80 * 1.5
        this.finish.chloe.scaleX = this.finish.chloe.scaleY;
      }
      this.finish.altar.setVisible(true);
      this.finish.chloe.setVisible(true);
    } else {
      this.finish.active = false;
      this.groundBody.setDisplaySize(this.scale.width, GROUND_HEIGHT_PX);
      this.groundBody.setPosition(this.scale.width / 2, GROUND_Y + GROUND_HEIGHT_PX / 2);
      this.groundBody.refreshBody();
      if (this.finish.altar) this.finish.altar.setVisible(false);
      if (this.finish.chloe) this.finish.chloe.setVisible(false);
      if (this.finish.inviteText) this.finish.inviteText.setVisible(false);
    }
    ensureSpawnerRunning(this);
  };
  const startIdx = (this._startChapterIndex >= 0) ? this._startChapterIndex : 0;
  if (this._startChapterIndex >= 0) {
    this.currentChapterIndex = startIdx;
    this.storyElapsedSec = this.chapters.slice(0, startIdx).reduce((s, c) => s + c.durationSec, 0);
    if (this.obstaclesGroup) this.obstaclesGroup.clear(true, true);
    if (this.signsGroup) this.signsGroup.clear(true, true);
  }
  this.setChapter(startIdx);
}

function rebuildChapterDecor(scene, chKey) {
  if (!scene.sceneDecor) return;
  scene.sceneDecor.removeAll(true);

}

function drawObstacle(g, key, w, h, color) {
  const L = -w / 2, R = w / 2, T = -h / 2, B = h / 2;
  const dark = 0x2c2c2c, mid = color, light = (color & 0xfefefe) | 0x111111;
  g.clear();
  g.fillStyle(mid, 0.95);

  switch (key) {
    case 'speaker':
      g.fillRect(L + 4, B - 8, w - 8, 6);
      g.fillRect(L + 8, T + 4, w - 16, h - 20);
      g.fillRect((L + R) / 2 - 6, T + 8, 12, 8);
      break;
    case 'tickets':
      g.fillRect(L, B - 6, w, 6);
      g.fillRect(L + 4, B - 16, w - 8, 8);
      g.fillRect(L + 8, B - 28, w - 16, 8);
      break;
    case 'patio_chair':
      g.fillRect(L + 4, B - 8, w - 8, 6);
      g.fillRect(L + 6, T + 4, 4, h - 16);
      g.fillRect(R - 10, T + 4, 4, h - 16);
      g.fillRect(L + 8, T + 2, w - 16, 6);
      g.fillRect((L + R) / 2 - 2, T + 2, 4, 14);
      break;
    case 'puddle':
      g.fillRoundedRect(L + 2, (T + B) / 2 - 4, w - 4, 8, 4);
      g.fillStyle(mid, 0.4);
      g.fillRoundedRect(L + 6, (T + B) / 2 - 2, w - 12, 4, 2);
      break;
    case 'rock':
      g.beginPath();
      g.moveTo(L + 4, B - 2); g.lineTo(L + 12, B - 8); g.lineTo(R - 8, B - 4); g.lineTo(R - 2, (T + B) / 2 + 2);
      g.lineTo(R - 12, T + 4); g.lineTo((L + R) / 2, T + 2); g.lineTo(L + 6, T + 8);
      g.closePath();
      g.fillPath();
      break;
    case 'wind':
      g.lineStyle(3, mid, 0.9);
      for (let i = 0; i < 4; i++) {
        const y = T + 6 + i * 5;
        g.beginPath(); g.moveTo(L, y); g.lineTo(L + 15, y - 4); g.lineTo(L + 30, y + 2); g.lineTo(R, y - 2); g.strokePath();
      }
      g.fillStyle(mid, 0.8);
      g.fillCircle(R - 8, (T + B) / 2, 3); g.fillCircle(R - 18, T + 4, 2);
      break;
    case 'suitcase':
      g.fillRect(L + 4, T + 6, w - 8, h - 10);
      g.fillRect((L + R) / 2 - 6, T, 12, 6);
      g.fillStyle(dark, 0.6);
      g.fillCircle(L + 12, B - 6, 3); g.fillCircle(R - 12, B - 6, 3);
      break;
    case 'stanchion':
      g.fillRect((L + R) / 2 - 2, T, 4, h - 4);
      g.fillRect(L, T + 8, w, 3);
      g.fillCircle((L + R) / 2, T + 2, 4);
      break;
    case 'cone':
      g.fillTriangle(R - 4, B, L + 4, B, (L + R) / 2, T + 4);
      g.fillStyle(0xe74c3c, 0.9);
      g.fillRect(L + 6, (T + B) / 2 - 2, w - 12, 4);
      break;
    case 'cyclist':
      g.fillCircle(L + 8, B - 10, 8); g.fillCircle(R - 8, B - 10, 8);
      g.fillRect((L + R) / 2 - 2, T + 8, 4, 20);
      g.fillRect(L + 8, B - 12, 20, 3);
      g.fillCircle((L + R) / 2, T + 18, 5);
      g.fillRect((L + R) / 2 - 4, T + 4, 8, 6);
      break;
    case 'boxes':
      g.fillRect(L + 4, B - 14, 24, 12);
      g.fillRect(L + 8, B - 28, 28, 14);
      g.fillRect(L + 12, B - 42, 24, 14);
      g.fillStyle(0xbcaaa4, 0.8);
      g.fillRect(L + 18, B - 24, 12, 2); g.fillRect(L + 22, B - 38, 10, 2);
      break;
    case 'laundry':
      g.fillRect(L + 4, T + 4, w - 8, h - 12);
      g.fillRect(L + 6, B - 6, w - 12, 4);
      g.fillStyle(0x1a1a2a, 0.9);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.fillCircle(L + 14 + i * 12, T + 10 + j * 10, 3);
      break;
    case 'trail_rock':
      g.fillEllipse((L + R) / 2, (T + B) / 2 + 2, 18, 14);
      g.fillRect(L + 6, T + 4, 12, 8); g.fillRect(R - 14, B - 10, 10, 6);
      break;
    case 'vespa':
      g.fillCircle(L + 14, B - 8, 10); g.fillCircle(R - 14, B - 8, 10);
      g.fillRect(L + 4, (T + B) / 2 - 4, w - 8, 12);
      g.fillRect(L + 6, T + 8, 16, 6);
      g.fillRect((L + R) / 2 - 2, T + 4, 4, 12);
      g.fillCircle(R - 8, T + 10, 4);
      break;
    case 'selfie':
      g.fillRect((L + R) / 2 - 3, T, 6, 50);
      g.fillCircle((L + R) / 2, T + 8, 6);
      g.fillRect((L + R) / 2 - 6, T + 14, 12, 20);
      g.fillRect(R - 2, T + 20, 20, 3);
      g.fillCircle(R + 16, T + 18, 4);
      break;
    case 'baguette':
      g.fillEllipse((L + R) / 2, (T + B) / 2, w * 0.9, h * 0.4);
      g.fillRect(L + 4, (T + B) / 2 - 2, w - 8, 4);
      break;
    case 'ring':
      g.fillCircle((L + R) / 2, (T + B) / 2, Math.min(w, h) * 0.35);
      g.fillStyle(dark, 0.95);
      g.fillCircle((L + R) / 2, (T + B) / 2, Math.min(w, h) * 0.2);
      g.fillStyle(mid, 0.95);
      break;
    case 'cafe_chair':
      g.fillRect(L + 6, B - 6, w - 12, 5);
      g.fillRect(L + 8, T + 4, 4, h - 14);
      g.fillRect(R - 12, T + 4, 4, h - 14);
      g.fillRect(L + 8, T + 2, w - 16, 5);
      g.fillRect((L + R) / 2 - 3, T + 2, 6, 12);
      g.fillCircle((L + R) / 2 + 4, T + 8, 3);
      break;
    case 'cap':
      g.fillRect(L + 2, T + 4, w - 4, 6);
      g.fillRect(L + 4, T + 10, w - 8, 4);
      g.fillCircle((L + R) / 2, T + 12, 6);
      g.fillStyle(0x1a237e, 0.9);
      g.fillRect((L + R) / 2 - 6, T + 2, 12, 2);
      break;
    case 'diploma':
      g.fillRect(L + 4, T + 4, w - 8, h - 8);
      g.fillRect(R - 6, T + 6, 4, h - 12);
      g.fillStyle(0xc62828, 0.9);
      g.fillRect(R - 4, (T + B) / 2 - 6, 3, 12);
      break;
    case 'cork':
      g.fillEllipse((L + R) / 2, (T + B) / 2, 8, 8);
      g.fillRect(L - 2, T + 2, 4, 6); g.fillRect(R - 2, T + 4, 4, 4);
      g.fillCircle(L + 2, T + 4, 2); g.fillCircle(R - 2, B - 4, 2);
      break;
    default:
      g.fillRect(L, T, w, h);
  }
}

function scheduleNextSpawn(scene) {
  if (scene.isGameOver) return;
  const ch = scene.chapters[scene.currentChapterIndex];
  const chKey = ch?.key || 'barbados';
  // Only block spawns during the actual finale phases
  if (chKey === 'barbados' && scene.finish?.active && (scene.finish.phase === 'approach' || scene.finish.phase === 'reveal' || scene.finish.phase === 'hold')) {
    return;
  }
  const ranges = {
    concert: [600, 1100], milou: [600, 1100],
    patagonia: [650, 1200], airport: [650, 1200],
    italy: [650, 1200], paris: [650, 1200],
    barbados: [1200, 1800]
  };
  const [baseMin, baseMax] = ranges[chKey] || [650, 1200];
  let delayMs = baseMin + Math.random() * (baseMax - baseMin);
  if (scene.spawnCount > 0 && scene.spawnCount % 8 === 0) delayMs += 600;
  const speedFactor = Phaser.Math.Clamp(worldSpeed / BASE_SPEED, 1, 1.6);
  delayMs /= Math.pow(speedFactor, 0.8);
  scene.nextSpawnTimer = scene.time.delayedCall(delayMs, () => {
    if (scene.isGameOver) return;
    const minGapPx = worldSpeed * 2.4;
    const children = scene.obstaclesGroup.getChildren();
    let rightmostX = -9999;
    for (const o of children) {
      if (o.x > rightmostX) rightmostX = o.x;
    }
    if (rightmostX > scene.scale.width - minGapPx) {
      scene.time.delayedCall(150, () => scheduleNextSpawn(scene));
      return;
    }
    // ✅ never allow more than 2 obstacles on screen at once
    if (scene.obstaclesGroup.countActive(true) >= 2) {
      scheduleNextSpawn(scene);
      return;
    }
    if (spawnObstacle(scene)) scene.spawnCount++;
    scheduleNextSpawn(scene);
  });
}

function ensureSpawnerRunning(scene) {
  const ch = scene.chapters[scene.currentChapterIndex];
  if (ch?.key === 'barbados') return;
  if (scene.isGameOver) return;
  if (!scene.nextSpawnTimer || scene.nextSpawnTimer.getProgress?.() === 1 || scene.nextSpawnTimer.hasDispatched) {
    scheduleNextSpawn(scene);
  }
}

function spawnObstacle(scene) {
  const ch = scene.chapters[scene.currentChapterIndex];
  if (ch?.key === 'barbados' && scene.finish?.active) return false;
  if (scene.finish?.active && scene.finish?.reached) return false;

  const specs = OBSTACLE_SPECS[ch?.key] || OBSTACLE_SPECS.barbados;
  const spec = specs[Math.floor(Math.random() * specs.length)];

  if (ch?.key === 'airport') {
    console.log('[AIRPORT SPAWN] textures:', {
      suitcase: scene.textures.exists('suitcase'),
      stanchion: scene.textures.exists('stanchion'),
    }, 'specs=', OBSTACLE_SPECS.airport);
  }

  const spawnX = scene.scale.width + 80;
  const obstacleBaselineY = GROUND_Y;

  // ✅ apply per-chapter scaling directly into dimensions (NOT container scale)
  const chapterScale = scaleByChapter[ch?.key] ?? 1.35;

  const drawW = Math.round(spec.w * chapterScale);
  const drawH = Math.round(spec.h * chapterScale);

  const s0 = spec.hitboxScale ?? 0.85;
  const s = Math.min(s0, 0.78);
  let bodyW = Math.floor(drawW * s);
  let bodyH = Math.floor(drawH * s);

  const y = obstacleBaselineY + (spec.yOffset ?? 0);

  const c = scene.add.container(spawnX, y).setDepth(50);

  if (DEBUG_LABELS) {
    const base = scene.add.graphics();
    base.lineStyle(2, 0x00ff00, 0.6);
    base.strokeLineShape(new Phaser.Geom.Line(-60, 0, 60, 0));
    c.add(base);
  }

  const phys = scene.add.rectangle(0, 0, drawW, drawH, 0x000000, 0).setVisible(false);
  c.add(phys);

  if (scene.textures.exists(spec.key)) {
    const img = scene.add.image(0, 0, spec.key);
    img.setOrigin(0.5, 1);
    // scale by width only so aspect ratio stays correct
    img.displayWidth = drawW;
    img.scaleY = img.scaleX;

    // visual-only nudge for assets with transparent padding at bottom (like speaker)
    img.y += (spec.spriteYOffset || 0);

    c.add(img);
  } else {
    const g = scene.add.graphics();
    g.y = -drawH / 2;                // bottom at 0
    c.add(g);
    drawObstacle(g, spec.key, drawW, drawH, spec.color || 0xffffff);
  }

  scene.physics.add.existing(c);
  c.body.setAllowGravity(false);
  c.body.setImmovable(true);
  c.body.moves = true;

  // ✅ body bottom sits on baseline (container origin at feet)
  c.body.setSize(bodyW, bodyH, true);
  c.body.setOffset(-bodyW / 2, -bodyH);
  c.body.updateFromGameObject();

  if (DEBUG_RENDER || DEBUG_LABELS) {
    const lbl = scene.add.text(0, -bodyH - 8, `${spec.key} ${drawW}x${drawH}`, { fontSize: 10, color: '#00ff00' })
      .setOrigin(0.5, 1);
    c.add(lbl);
  }

  scene.obstaclesGroup.add(c);
  return true;
}

function update(time, delta) {
  if (!this.hasStarted) return;
  if (this.isGameOver) {
    if (retryKey?.isDown) this.scene.restart();
    return;
  }

  if (!(this.finish?.active && this.finish.phase === 'hold')) this.atInviteEnd = false;

  // HARD KILL DEBUG RENDER (runs every frame)
  if (this.physics?.world) {
    this.physics.world.drawDebug = false;
    if (this.physics.world.debugGraphic) {
      this.physics.world.debugGraphic.clear();
      this.physics.world.debugGraphic.setVisible(false);
    }
  }

  if (this.physics.world.isPaused && !this.isGameOver) {
    this.physics.world.resume();
  }

  const b = this.player?.body;

  if (b) {
    if (b.velocity.y > 0) {
      this.player.body.setGravityY(GRAVITY * 1.25);
    } else {
      this.player.body.setGravityY(0);
    }
  }

  if (!this.finish?.active) {
    if (this.time.now >= this.invincibleUntil) {
      this.lockPlayerX();
    } else {
      this.player.setX(Math.min(PLAYER_X, this.player.x));
      this.player.setVelocityX(0);
    }
  }

  if (this.time.now < this.invincibleUntil) {
    // if invincible due to chapter transition, don't blink (keeps run continuous)
    if (this._transitionInvincibleUntil && this.time.now <= this._transitionInvincibleUntil) {
      this.player.setAlpha(1);
    } else {
      this.player.setAlpha((Math.floor(this.time.now / 80) % 2 === 0) ? 0.35 : 1);
    }
  } else {
    this._transitionInvincibleUntil = 0;
    this.player.setAlpha(1);
  }

  if (DEBUG_RENDER && this.debugRenderGraphics) {
    this.debugRenderGraphics.clear();
    const db = this.player.getBounds();
    this.debugRenderGraphics.lineStyle(2, 0x00ffff, 1);
    this.debugRenderGraphics.strokeRect(db.x, db.y, db.width, db.height);
    const bd = this.player.body;
    this.debugRenderGraphics.lineStyle(2, 0xff00ff, 1);
    this.debugRenderGraphics.strokeRect(bd.left, bd.top, bd.width, bd.height);
  }
  if ((DEBUG_RENDER || DEBUG_LABELS) && this.debugBenLabel) {
    this.debugBenLabel.setPosition(this.player.x, this.player.y - 55);
  }

  const dtSec = delta / 1000;
  this.distanceAccum = (this.distanceAccum || 0) + dtSec * worldSpeed;
  score = Math.floor(this.distanceAccum);
  scoreText.setText(score);

  this.parallaxScrollX = (this.parallaxScrollX || 0) + worldSpeed * dtSec;

  [this.bgA].forEach(container => {
    if (!container?.getAll) return;
    container.getAll().forEach(layer => {
      if (layer._isTileSprite && layer.tilePositionX !== undefined) {
        const v = -this.parallaxScrollX * (layer._parallaxFactor || 1);
        layer.tilePositionX = layer._noFloor ? v : Math.floor(v);
      }
    });
  });

  if (this.jumpKey && Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
    this.lastJumpPressedTime = this.time.now;
  }
  const now = this.time.now;
  if (this.isGrounded()) this.lastGroundedTime = now;
  const coyoteOk = (now - (this.lastGroundedTime || 0)) < COYOTE_MS;
  const bufferOk = (now - (this.lastJumpPressedTime || 0)) < JUMP_BUFFER_MS;
  if ((this.isGrounded() || coyoteOk) && bufferOk) {
    this.player.body.setVelocityY(JUMP_VELOCITY);
    this.lastJumpPressedTime = now - JUMP_BUFFER_MS - 1;
  }

  if (this.debugJumpText) this.debugJumpText.setText(`grounded: ${this.isGrounded()} vy: ${b ? Math.round(b.velocity.y) : '?'} y: ${Math.round(this.player.y)}`);

  // Ensure obstacle spawner stays running (restart if timer finished or lost)
  const inFinaleHold = this.finish?.active && (this.finish?.reached || this.finish?.phase === 'hold');
  if (!inFinaleHold) ensureSpawnerRunning(this);

  // --- BARBADOS FINALE (polished) ---
  if (this.finish?.active) {
    const dt = dtSec;
    const ran = (this.distanceAccum || 0) - (this.finish.startDistance || 0);

    // Ensure this only affects Barbados
    const cur = this.chapters[this.currentChapterIndex];
    const inBarbados = cur?.key === 'barbados';

    if (inBarbados) {
      // Only allow Ben to drift/run forward in the finale
      if (this.finish.phase === 'approach') {
        // move Ben toward Chloe while world scrolls normally
        const targetX = this.finish.targetX;
        this.player.x = Math.min(targetX, this.player.x + FINALE_APPROACH_SPEED * dt);
        this.player.setVelocityX(0);

        if (ran >= this.finish.triggerDistance) {
          this.finish.phase = 'reveal';
          this.finish.reached = true;
          this.storyPausedForFinale = true;

          // start smooth slowdown
          this.finish.slowdownStart = this.time.now;
          this.finish.slowdownFromSpeed = worldSpeed;

          // stop spawning + clear obstacles
          if (this.nextSpawnTimer) this.nextSpawnTimer.remove(false);
          this.nextSpawnTimer = null;
          this.obstaclesGroup.clear(true, true);

          // create invite (fade in) — wait for Space to continue (no auto-resume)
          if (!this.finish.inviteText) {
            this.finish.inviteText = this.add.text(
              this.scale.width / 2,
              this.scale.height / 2,
              'Join us February 14, 2027\nBarbados 🇧🇧',
              { fontSize: 28, color: '#ffffff', align: 'center', backgroundColor: '#000000' }
            ).setOrigin(0.5).setPadding(18, 12).setDepth(2000);
          }
          this.finish.inviteText.setAlpha(0).setVisible(true);

          this.tweens.add({
            targets: this.finish.inviteText,
            alpha: 1,
            duration: 450,
            ease: 'Sine.easeOut',
            onComplete: () => {
              // wait a beat after invite appears, then fade out smoothly
              if (!this._fadeScheduled) {
                this._fadeScheduled = true;
                this.time.delayedCall(1200, () => this.fadeOutBgm(4500));
              }
            }
          });
        }
      }

      if (this.finish.phase === 'reveal') {
        // Smoothly decelerate worldSpeed to 0 (no harsh stop)
        const t = (this.time.now - this.finish.slowdownStart) / FINALE_SLOWDOWN_MS;
        if (t >= 1) {
          worldSpeed = 0;
          this.finish.phase = 'hold';
        } else {
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          worldSpeed = this.finish.slowdownFromSpeed * (1 - eased);
        }

        // freeze Ben where he is (don't snap back)
        this.player.setVelocityX(0);
      }

      if (this.finish.phase === 'hold') {
        this.atInviteEnd = true;
        worldSpeed = 0;
        this.player.setVelocity(0, 0);

        // fade music after invite appears
        if (this.bgm && !this._bgmFading) {
          this._bgmFading = true;

          this.tweens.add({
            targets: this.bgm,
            volume: 0,
            duration: 4500,   // perfect for a 48s clip
            ease: 'Linear',
            onComplete: () => {
              this.bgm.pause();
              this.bgm.currentTime = 0;
              this.bgm.volume = 0.6;
              this._bgmFading = false;
            }
          });
        }

        if (!this.finish.continuePrompt) {
          this.finish.continuePrompt = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 90,
            'Press SPACE to restart',
            { fontSize: 22, color: '#ffffff', align: 'center', backgroundColor: '#000000' }
          ).setOrigin(0.5).setPadding(14, 10).setDepth(2001);
        }

        const spacePressed = this.jumpKey && Phaser.Input.Keyboard.JustDown(this.jumpKey);
        if (spacePressed) {
          this.scene.restart();
          return;
        }
      }
    }
  }
  // --- END BARBADOS FINALE ---

  if (this.mode === 'story') {
    const cur = this.chapters[this.currentChapterIndex];
    const inFinale = cur?.key === 'barbados' && (this.finish?.active || this.finish?.reached);

    if (inFinale) {
      // Don't let story-mode auto-end interrupt the finale; stays in Barbados until SPACE restart
    } else {
      if (!this.storyPausedForFinale) {
        this.storyElapsedSec += dtSec;
      }
      // Chapter auto-advance every CHAPTER_DURATION_SECONDS
      let elapsed = 0;
      for (let i = 0; i < this.chapters.length; i++) {
        elapsed += this.chapters[i].durationSec;
        if (this.storyElapsedSec < elapsed) {
          if (this.currentChapterIndex !== i) this.setChapter(i);
          break;
        }
      }
    }
  }

  this.signsGroup.getChildren().forEach(s => {
    s.x -= worldSpeed * 0.6 * dtSec;
    if (s.x < -150) s.destroy();
  });
  obstaclesGroup.getChildren().forEach(o => {
    if (!o.body) return;
    o.x -= worldSpeed * dtSec;
    if (o.body) o.body.updateFromGameObject();
    if (o.x < -100) o.destroy();
  });
}
