/**
 * ════════════════════════════════════════════════════
 *  1142 LABS — FX.JS  v3.0
 *  Visual Effects Package · Production Build
 *
 *  Modules:
 *   1. MatrixRain    — Falling glyph columns (canvas)
 *   2. CrystalBurst  — Pointer-reactive particle system
 *   3. ChromaShift   — Chromatic aberration on headings
 *   4. GlitchFlicker — Random screen-wide glitch events
 *   5. VortexPulse   — Hero background radial beat
 *   6. FloatCrystals — Ambient shard particles (canvas)
 *   7. AudioReact    — Cursor beat response (no audio req)
 *   8. Init          — Auto-wires all effects
 * ════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  /* ── PALETTE (matches global.css) ── */
  const C = {
    cyan:   '#00F0FF',
    pink:   '#EC4899',
    purple: '#8B5CF6',
    green:  '#4ade80',
    void:   '#0A0A0A',
  };

  /* ══════════════════════════════════════════════
     1. MATRIX RAIN
     Full-screen canvas: falling 1142-specific
     glyph columns — katakana, numerals, lab symbols
     ══════════════════════════════════════════════ */
  const MatrixRain = (() => {
    const GLYPHS =
      '1142アイウエオカキクケコサシスセソタチツテトナニヌネノ' +
      'ハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789' +
      '∞◆▲░▒▓⚗⚡∅∂∇Ψ∑∏∫≈≠≤≥→←↑↓◉●■□';

    let canvas, ctx, cols, drops, raf, active = false;

    const colours = [C.cyan, C.purple, C.pink, C.green];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      cols  = Math.floor(canvas.width / 20);
      drops = Array(cols).fill(1);
    }

    function draw() {
      ctx.fillStyle = 'rgba(10,10,10,0.045)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < cols; i++) {
        const g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const col = colours[Math.floor(Math.random() * colours.length)];
        const x   = i * 20;
        const y   = drops[i] * 20;

        /* bright head */
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Share Tech Mono", monospace';
        ctx.fillText(g, x, y);

        /* trail */
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.65;
        ctx.fillText(g, x, y + 20);
        ctx.globalAlpha = 1;

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }

    return {
      init(opacity = 0.06) {
        if (active) return;
        canvas = document.createElement('canvas');
        canvas.id = 'fx-matrix';
        Object.assign(canvas.style, {
          position:      'fixed',
          inset:         '0',
          zIndex:        '1',
          pointerEvents: 'none',
          opacity:       String(opacity),
        });
        document.body.prepend(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        draw();
        active = true;
      },
      destroy() {
        cancelAnimationFrame(raf);
        canvas?.remove();
        active = false;
      },
    };
  })();

  /* ══════════════════════════════════════════════
     2. CRYSTAL BURST PARTICLES
     Click/tap spawns an explosion of crystal shards
     from the cursor position
     ══════════════════════════════════════════════ */
  const CrystalBurst = (() => {
    let canvas, ctx, particles = [], raf, active = false;

    class Shard {
      constructor(x, y) {
        this.x  = x;
        this.y  = y;
        this.vx = (Math.random() - 0.5) * 14;
        this.vy = (Math.random() - 0.5) * 14;
        this.life  = 1;
        this.decay = 0.02 + Math.random() * 0.025;
        this.size  = 3 + Math.random() * 6;
        this.col   = [C.cyan, C.pink, C.purple, C.green, '#ffffff'][
          Math.floor(Math.random() * 5)
        ];
        this.rot   = Math.random() * Math.PI * 2;
        this.rotV  = (Math.random() - 0.5) * 0.3;
      }
      update() {
        this.x    += this.vx;
        this.y    += this.vy;
        this.vx   *= 0.93;
        this.vy   *= 0.93;
        this.vy   += 0.25;            /* gravity */
        this.life -= this.decay;
        this.rot  += this.rotV;
      }
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.strokeStyle = this.col;
        ctx.lineWidth   = 1.5;
        ctx.shadowColor = this.col;
        ctx.shadowBlur  = 8;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        /* diamond shard */
        ctx.beginPath();
        ctx.moveTo(0,         -this.size);
        ctx.lineTo(this.size * 0.5,  0);
        ctx.lineTo(0,          this.size * 1.4);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      raf = requestAnimationFrame(loop);
    }

    function burst(e) {
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? window.innerWidth / 2;
      const y = e.clientY ?? e.touches?.[0]?.clientY ?? window.innerHeight / 2;
      const count = 18 + Math.floor(Math.random() * 14);
      for (let i = 0; i < count; i++) particles.push(new Shard(x, y));
    }

    return {
      init() {
        if (active) return;
        canvas = document.createElement('canvas');
        canvas.id = 'fx-burst';
        Object.assign(canvas.style, {
          position:      'fixed',
          inset:         '0',
          zIndex:        '8990',
          pointerEvents: 'none',
        });
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('click',      burst);
        window.addEventListener('touchstart', burst, { passive: true });
        loop();
        active = true;
      },
    };
  })();

  /* ══════════════════════════════════════════════
     3. CHROMA SHIFT
     Applies animated RGB-split effect to headings
     on scroll entry — CSS approach for performance
     ══════════════════════════════════════════════ */
  const ChromaShift = (() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes chromaIn {
        0%   { text-shadow: 0 0 0 rgba(0,240,255,0), 0 0 0 rgba(236,72,153,0); }
        20%  { text-shadow: -4px 0 0 rgba(0,240,255,0.7), 4px 0 0 rgba(236,72,153,0.7); }
        40%  { text-shadow: 3px 0 0 rgba(0,240,255,0.5), -3px 0 0 rgba(236,72,153,0.5); }
        60%  { text-shadow: -2px 0 0 rgba(0,240,255,0.4), 2px 0 0 rgba(236,72,153,0.4); }
        80%  { text-shadow: 1px 0 0 rgba(0,240,255,0.2), -1px 0 0 rgba(236,72,153,0.2); }
        100% { text-shadow: 0 0 0 rgba(0,240,255,0), 0 0 0 rgba(236,72,153,0); }
      }
      .chroma-active {
        animation: chromaIn 0.6s ease-out forwards !important;
      }
      h1.section-title, h2.section-title {
        transition: text-shadow 0.3s ease;
      }
    `;
    return {
      init() {
        document.head.appendChild(style);
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.remove('chroma-active');
              void e.target.offsetWidth;
              e.target.classList.add('chroma-active');
            }
          });
        }, { threshold: 0.3 });
        document.querySelectorAll('.section-title, h1').forEach(el => obs.observe(el));
      },
    };
  })();

  /* ══════════════════════════════════════════════
     4. GLITCH FLICKER
     Random screen-wide glitch events — flashes a
     full-screen overlay with scan-jitter
     ══════════════════════════════════════════════ */
  const GlitchFlicker = (() => {
    let overlay, scheduled = false;

    const css = `
      #fx-glitch-overlay {
        position: fixed; inset: 0; z-index: 8998;
        pointer-events: none; opacity: 0;
        mix-blend-mode: screen;
      }
      @keyframes glitchFlash {
        0%   { opacity: 0; transform: translateX(0); clip-path: none; }
        10%  { opacity: 0.12; transform: translateX(-3px); background: rgba(0,240,255,0.08); }
        20%  { opacity: 0; transform: translateX(3px); }
        30%  { opacity: 0.09; transform: translateX(-2px); background: rgba(236,72,153,0.08); }
        40%  { opacity: 0; transform: translateX(0); }
        50%  { opacity: 0.07; clip-path: polygon(0 30%, 100% 30%, 100% 35%, 0 35%); background: rgba(0,240,255,0.15); }
        60%  { opacity: 0; clip-path: none; }
        100% { opacity: 0; }
      }
    `;

    function scheduleNext() {
      const delay = 6000 + Math.random() * 14000;
      setTimeout(fire, delay);
    }

    function fire() {
      overlay.style.animation = 'none';
      void overlay.offsetWidth;
      overlay.style.background = Math.random() > 0.5
        ? 'rgba(0,240,255,0.04)' : 'rgba(236,72,153,0.04)';
      overlay.style.animation = 'glitchFlash 0.35s ease-out forwards';
      scheduleNext();
    }

    return {
      init() {
        if (scheduled) return;
        const s = document.createElement('style');
        s.textContent = css;
        document.head.appendChild(s);
        overlay = document.createElement('div');
        overlay.id = 'fx-glitch-overlay';
        document.body.appendChild(overlay);
        scheduleNext();
        scheduled = true;
      },
    };
  })();

  /* ══════════════════════════════════════════════
     5. VORTEX PULSE
     Hero section: periodic radial ripple from center
     Syncs with page scroll position
     ══════════════════════════════════════════════ */
  const VortexPulse = (() => {
    let canvas, ctx, rings = [], raf, active = false;

    class Ring {
      constructor() {
        this.r     = 0;
        this.max   = Math.max(window.innerWidth, window.innerHeight) * 0.8;
        this.speed = 1.5 + Math.random() * 1.5;
        this.col   = [C.cyan, C.purple, C.pink][Math.floor(Math.random() * 3)];
        this.alpha = 0.35;
      }
      update() {
        this.r     += this.speed;
        this.alpha  = 0.35 * (1 - this.r / this.max);
      }
      draw(ctx, cx, cy) {
        ctx.beginPath();
        ctx.arc(cx, cy, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = this.col;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.lineWidth   = 1;
        ctx.shadowColor = this.col;
        ctx.shadowBlur  = 6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      get done() { return this.r >= this.max; }
    }

    let spawnTimer = 0;
    const SPAWN_INTERVAL = 80; /* frames */

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      spawnTimer++;
      if (spawnTimer >= SPAWN_INTERVAL) { rings.push(new Ring()); spawnTimer = 0; }
      rings = rings.filter(r => !r.done);
      rings.forEach(r => { r.update(); r.draw(ctx, cx, cy); });
      raf = requestAnimationFrame(loop);
    }

    return {
      init(selector = '.vortex-hero') {
        const hero = document.querySelector(selector);
        if (!hero || active) return;
        canvas = document.createElement('canvas');
        canvas.id = 'fx-vortex';
        Object.assign(canvas.style, {
          position:      'absolute',
          inset:         '0',
          zIndex:        '0',
          pointerEvents: 'none',
          opacity:       '0.5',
        });
        hero.style.position = hero.style.position || 'relative';
        hero.prepend(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        loop();
        active = true;
      },
    };
  })();

  /* ══════════════════════════════════════════════
     6. FLOAT CRYSTALS
     Ambient background: slowly drifting geometric
     shards, parallax on mousemove
     ══════════════════════════════════════════════ */
  const FloatCrystals = (() => {
    let canvas, ctx, shards = [], mouse = { x: 0, y: 0 }, raf, active = false;

    class FloatShard {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x     = Math.random() * window.innerWidth;
        this.y     = initial ? Math.random() * window.innerHeight : window.innerHeight + 20;
        this.size  = 4 + Math.random() * 10;
        this.speed = 0.2 + Math.random() * 0.5;
        this.drift = (Math.random() - 0.5) * 0.4;
        this.rot   = Math.random() * Math.PI * 2;
        this.rotV  = (Math.random() - 0.5) * 0.008;
        this.alpha = 0.04 + Math.random() * 0.08;
        this.col   = [C.cyan, C.purple, C.pink, C.green][Math.floor(Math.random() * 4)];
        this.parallax = 0.01 + Math.random() * 0.03;
      }
      update(mx, my) {
        this.y   -= this.speed;
        this.x   += this.drift + (mx - window.innerWidth / 2) * this.parallax * 0.01;
        this.rot += this.rotV;
        if (this.y < -20) this.reset();
      }
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.col;
        ctx.lineWidth   = 1;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.beginPath();
        ctx.moveTo(0,             -this.size);
        ctx.lineTo(this.size * 0.45, 0);
        ctx.lineTo(0,              this.size * 1.3);
        ctx.lineTo(-this.size * 0.45, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shards.forEach(s => { s.update(mouse.x, mouse.y); s.draw(ctx); });
      raf = requestAnimationFrame(loop);
    }

    return {
      init(count = 60) {
        if (active) return;
        canvas = document.createElement('canvas');
        canvas.id = 'fx-crystals';
        Object.assign(canvas.style, {
          position:      'fixed',
          inset:         '0',
          zIndex:        '2',
          pointerEvents: 'none',
        });
        document.body.prepend(canvas);
        ctx = canvas.getContext('2d');
        resize();
        for (let i = 0; i < count; i++) shards.push(new FloatShard());
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        loop();
        active = true;
      },
    };
  })();

  /* ══════════════════════════════════════════════
     7. NEON TRAIL
     Persistent glowing cursor trail that fades out
     ══════════════════════════════════════════════ */
  const NeonTrail = (() => {
    let canvas, ctx, points = [], raf, mouse = { x: -200, y: -200 }, active = false;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points = points.filter(p => p.life > 0);
      for (let i = 1; i < points.length; i++) {
        const p = points[i], pp = points[i - 1];
        const t = p.life;
        ctx.beginPath();
        ctx.moveTo(pp.x, pp.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.col;
        ctx.globalAlpha = t * 0.6;
        ctx.lineWidth   = t * 2.5;
        ctx.shadowColor = p.col;
        ctx.shadowBlur  = 8;
        ctx.stroke();
        p.life -= 0.025;
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    }

    const cols = [C.cyan, C.purple, C.pink];
    let ci = 0, frame = 0;

    return {
      init() {
        if (active) return;
        canvas = document.createElement('canvas');
        canvas.id = 'fx-trail';
        Object.assign(canvas.style, {
          position: 'fixed', inset: '0',
          zIndex: '8991', pointerEvents: 'none',
        });
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', e => {
          frame++;
          if (frame % 2 === 0) {
            ci = (ci + 1) % cols.length;
            points.push({ x: e.clientX, y: e.clientY, life: 1, col: cols[ci] });
            if (points.length > 80) points.shift();
          }
        });
        loop();
        active = true;
      },
    };
  })();

  /* ══════════════════════════════════════════════
     8. BOOT SEQUENCE
     Typewriter boot screen on first visit (session)
     ══════════════════════════════════════════════ */
  const BootSequence = (() => {
    const lines = [
      '> INITIALIZING 1142 LABS SYSTEM...',
      '> LOADING COGNITIVE LIBERATION PROTOCOLS...',
      '> UNIT 1142-B ONLINE ✓',
      '> NOVEL LIGHT SOURCE DETECTED ✓',
      '> CYANS & MAGENTAS: ACTIVE ✓',
      '> NEURODIVERGENT EMPOWERMENT MODULE: LOADED ✓',
      '> CONTAINMENT STATUS: FAILED (EXPECTED) ✓',
      '> RE-ROUTING FUEL TO ANALYSIS...',
      '> FINAL CODE: 1142',
      '> 1142 IS INEVITABLE.',
      '',
    ];

    return {
      init(onDone) {
        if (sessionStorage.getItem('1142-booted')) { onDone?.(); return; }
        const overlay = document.createElement('div');
        overlay.id = 'fx-boot';
        Object.assign(overlay.style, {
          position:        'fixed', inset: '0',
          background:      '#000',
          zIndex:          '99999',
          display:         'flex',
          flexDirection:   'column',
          justifyContent:  'center',
          padding:         '10vw',
          fontFamily:      '"Share Tech Mono", monospace',
          fontSize:        'clamp(11px,1.5vw,15px)',
          color:           C.cyan,
          letterSpacing:   '.15em',
          lineHeight:      '2',
          textShadow:      `0 0 10px ${C.cyan}`,
          cursor:          'none',
        });

        /* skip button */
        const skip = document.createElement('div');
        Object.assign(skip.style, {
          position:     'absolute', bottom: '40px', right: '48px',
          fontSize:     '10px', letterSpacing: '.3em',
          color:        'rgba(0,240,255,.4)', cursor: 'pointer',
        });
        skip.textContent = '[ SKIP → ]';
        skip.addEventListener('click', finish);
        overlay.appendChild(skip);

        const terminal = document.createElement('div');
        overlay.appendChild(terminal);
        document.body.appendChild(overlay);

        let li = 0;
        function finish() {
          overlay.style.transition = 'opacity .5s';
          overlay.style.opacity    = '0';
          setTimeout(() => { overlay.remove(); onDone?.(); }, 500);
          sessionStorage.setItem('1142-booted', '1');
        }
        function nextLine() {
          if (li >= lines.length) { setTimeout(finish, 400); return; }
          const row = document.createElement('div');
          terminal.appendChild(row);
          const text = lines[li++];
          let ci = 0;
          function type() {
            if (ci <= text.length) {
              row.textContent = text.slice(0, ci++);
              setTimeout(type, text === '' ? 1 : 28 + Math.random() * 20);
            } else {
              setTimeout(nextLine, text === '' ? 80 : 120);
            }
          }
          type();
        }
        nextLine();
      },
    };
  })();

  /* ══════════════════════════════════════════════
     INIT — Auto-wire all effects based on page
     ══════════════════════════════════════════════ */
  function init() {
    const isHome  = !location.pathname.includes('research') &&
                    !location.pathname.includes('tools')    &&
                    !location.pathname.includes('about')    &&
                    !location.pathname.includes('archive');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) return; /* respect accessibility */

    /* Always-on effects */
    CrystalBurst.init();
    ChromaShift.init();
    GlitchFlicker.init();
    NeonTrail.init();

    /* Homepage-only */
    if (isHome) {
      MatrixRain.init(0.05);
      VortexPulse.init('.vortex-hero');
      FloatCrystals.init(50);
      /* Boot sequence only on home, only once per session */
      BootSequence.init(() => {
        /* effects already running, nothing extra needed */
      });
    } else {
      /* Inner pages: lighter effects */
      FloatCrystals.init(30);
    }
  }

  /* ── Expose to global scope for manual control ── */
  window.FX1142 = {
    MatrixRain,
    CrystalBurst,
    ChromaShift,
    GlitchFlicker,
    VortexPulse,
    FloatCrystals,
    NeonTrail,
    BootSequence,
    init,
  };

  /* ── Auto-init on DOMContentLoaded ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
