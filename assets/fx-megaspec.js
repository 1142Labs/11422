/**
 * ════════════════════════════════════════════════════════════════
 *  1142 LABS — FX-MEGASPEC.JS  v1.0
 *  Animated Texture + Text Animation Engine
 *  Cosmic-Lab Identity System · Production Build
 *
 *  SECTION 1 — GLOBAL BACKGROUND TEXTURES (1–3)
 *    1. DeepLabCarbonMesh   — Matte carbon fiber, parallax, micro-oscillation
 *    2. MicroLEDPixelMatrix — Backlit RGB shimmer, random micro-flickers
 *    3. HolographicNoiseField — Scientific monitor static, chromatic shifts
 *
 *  SECTION 2 — MIDGROUND INTERACTIVE LAYERS (4–7)
 *    4. IonizedCircuitTraces   — PCB pathways lighting up, scroll-triggered
 *    5. LabGlassRefraction     — Tempered glass distortion, cursor-reactive
 *    6. DataStreamFilaments    — Fiber-optic neon lines, directional flow
 *    7. CryoFogVapor           — Cold vapor, glowing edges, cinematic
 *
 *  SECTION 3 — FOREGROUND MICRO-TEXTURES (8–11)
 *    8.  DiagnosticScanlines   — CRT-style sweeps, retro-futuristic
 *    9.  ParticleIonDrift      — Charged particles, occasional sparks
 *    10. NanoGridOverlay       — Microscope calibration mesh, shimmer
 *    11. ThermalImagingGradient — Heatmap, slow color shifts
 *
 *  SECTION 4 — SIGNATURE COSMIC-LAB HYBRIDS (12–15)
 *    12. CrystalRefractionBurst — Living light, pulsing shards
 *    13. DarkMatterLabSwirl     — Scientific vortex, slow mass rotation
 *    14. QuantumFieldRipple     — Spacetime radial ripples
 *    15. NeonIonStorm           — Charged particle chaos, fast streaks
 *
 *  SECTION 5 — UTILITY TEXTURES (16–18)
 *    16. ScrollDataSweep        — Horizontal data bars, scroll-reactive
 *    17. PressurePlateGlow      — Keyboard glow, cursor-triggered blooms
 *    18. MagneticAlignmentGrid  — Elements snapping, micro-movements
 *
 *  SECTION 6 — HIGH-IMPACT SET PIECES (19–20)
 *    19. ReactorCorePulse       — Central energy, rhythmic pulses
 *    20. CosmicDebrisConveyor   — Cosmic fragments, horizontal drift
 *
 *  SECTION 7 — TEXT ANIMATION SYSTEM (1–15)
 *    TextFX.cosmicPulseReveal, glyphDecode, verticalWarp, neonTraceOutline,
 *    modularTileFlip, starfallCascade, liquidChromaticSlide, heatwaveDistortion,
 *    quantumFlicker, dustToForm, holographicScanlineReveal, solarFlareSweep,
 *    timeSliceStagger, crystalShatterIntro, magneticPullIn
 *
 *  USAGE:
 *    FX1142.init()                      // auto-attach all global textures
 *    FX1142.texture.DeepLabCarbonMesh.mount(target, options)
 *    FX1142.text.cosmicPulseReveal(element, options)
 *    FX1142.destroy()                   // teardown all active effects
 * ════════════════════════════════════════════════════════════════
 */

(function (global) {
  'use strict';

  /* ── PALETTE ── */
  const C = {
    void:   '#0A0A0A',
    void2:  '#0D0D18',
    void3:  '#12102A',
    cyan:   '#00F0FF',
    cyan2:  '#00C8D8',
    pink:   '#EC4899',
    pink2:  '#FF007A',
    purple: '#8B5CF6',
    purple2:'#5A1FCC',
    green:  '#4ade80',
    blue:   '#3B82F6',
    white:  '#F0F4FF',
  };

  const cRGB = {
    cyan:   [0,240,255],
    pink:   [236,72,153],
    purple: [139,92,246],
    green:  [74,222,128],
    blue:   [59,130,246],
    white:  [240,244,255],
  };

  /* ── UTILITIES ── */
  function raf(fn) { return requestAnimationFrame(fn); }
  function rng(a,b) { return a + Math.random()*(b-a); }
  function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
  function lerp(a,b,t) { return a+(b-a)*t; }
  function clamp(v,lo,hi) { return Math.max(lo,Math.min(hi,v)); }

  function makeCanvas(id, zIndex, opacity, pos='fixed') {
    const c = document.createElement('canvas');
    c.id = id;
    Object.assign(c.style, {
      position: pos, inset:'0', width:'100%', height:'100%',
      zIndex: String(zIndex), pointerEvents:'none',
      opacity: String(opacity),
    });
    return c;
  }

  function resizeCanvas(canvas) {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* track all active RAF loops for teardown */
  const _rafHandles  = new Map();
  const _listeners   = [];
  const _mountedEls  = new Set();

  function trackRAF(key, handle) { _rafHandles.set(key, handle); }
  function cancelRAF(key) {
    if (_rafHandles.has(key)) { cancelAnimationFrame(_rafHandles.get(key)); _rafHandles.delete(key); }
  }
  function trackListener(el, ev, fn) {
    el.addEventListener(ev, fn);
    _listeners.push({el,ev,fn});
  }

  /* ══════════════════════════════════════════════════════════════
     SECTION 1 — GLOBAL BACKGROUND TEXTURES
     ══════════════════════════════════════════════════════════════ */

  /* ─── 1. DEEP-LAB CARBON MESH ───────────────────────────────── */
  const DeepLabCarbonMesh = (() => {
    const VARIANTS = {
      'Carbon Black':   ['#111','#1a1a1a','#222'],
      'Midnight Graphite':['#0d0d18','#141424','#1c1c30'],
      'Cosmic Charcoal':['#0e0e14','#181820','#202028'],
      'Cryo-Steel':     ['#0d1218','#141c24','#1c242e'],
    };
    const DENSITY = { low: 28, medium: 20, high: 14 };

    return {
      mount(target = document.body, opts = {}) {
        const {
          variant = 'Carbon Black',
          density = 'low',
          opacity = 1,
          parallax = true,
        } = opts;

        const colors = VARIANTS[variant] || VARIANTS['Carbon Black'];
        const cell   = DENSITY[density] || 28;

        const canvas = makeCanvas('fx-carbon-mesh', 0, opacity, 'fixed');
        target.prepend(canvas);
        _mountedEls.add(canvas);

        const ctx = canvas.getContext('2d');

        let W, H, mouseX = 0, mouseY = 0, t = 0;
        let offX = 0, offY = 0, targX = 0, targY = 0;

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window, 'resize', resize);

        if (parallax) {
          trackListener(window, 'mousemove', e => {
            targX = (e.clientX / window.innerWidth  - 0.5) * 18;
            targY = (e.clientY / window.innerHeight - 0.5) * 12;
          });
        }

        function draw() {
          t += 0.003;
          if (parallax) {
            offX = lerp(offX, targX, 0.04);
            offY = lerp(offY, targY, 0.04);
          }

          ctx.clearRect(0,0,W,H);

          /* base gradient */
          const grad = ctx.createLinearGradient(0,0,W,H);
          grad.addColorStop(0, colors[0]);
          grad.addColorStop(0.5, colors[1]);
          grad.addColorStop(1, colors[2]);
          ctx.fillStyle = grad;
          ctx.fillRect(0,0,W,H);

          /* woven fiber lines — horizontal */
          const osc = Math.sin(t) * 2;
          for (let y = offY % cell - cell; y < H + cell; y += cell) {
            ctx.beginPath();
            ctx.moveTo(0, y + osc);
            ctx.lineTo(W, y + osc);
            ctx.strokeStyle = 'rgba(255,255,255,0.028)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
          /* woven fiber lines — diagonal */
          for (let x = offX % cell - cell; x < W + cell*2; x += cell) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - H * 0.35, H);
            ctx.strokeStyle = 'rgba(255,255,255,0.018)';
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }

          /* micro-oscillation vignette */
          const vigRadius = Math.max(W,H) * (0.7 + Math.sin(t*1.3)*0.05);
          const vig = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,vigRadius);
          vig.addColorStop(0, 'rgba(0,0,0,0)');
          vig.addColorStop(1, 'rgba(0,0,0,0.72)');
          ctx.fillStyle = vig;
          ctx.fillRect(0,0,W,H);

          /* ambient lab flicker — subtle random noise */
          if (Math.random() < 0.015) {
            ctx.fillStyle = `rgba(0,240,255,${rng(0.005,0.018)})`;
            ctx.fillRect(0,0,W,H);
          }

          const handle = raf(draw);
          trackRAF('carbon-mesh', handle);
        }
        const handle = raf(draw);
        trackRAF('carbon-mesh', handle);

        return { destroy() { cancelRAF('carbon-mesh'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 2. MICRO-LED PIXEL MATRIX ─────────────────────────────── */
  const MicroLEDPixelMatrix = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.55, cellSize = 4 } = opts;

        const canvas = makeCanvas('fx-microled', 2, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;
        const cols = [], LED_COLORS = [
          [0,240,255],[139,92,246],[236,72,153],[74,222,128],[59,130,246],[240,244,255]
        ];

        function buildGrid() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
          cols.length = 0;
          const cw = Math.ceil(W/cellSize), ch = Math.ceil(H/cellSize);
          for (let y=0;y<ch;y++) for (let x=0;x<cw;x++) {
            cols.push({ x, y, phase: rng(0,Math.PI*2), speed: rng(0.008,0.04), col: pick(LED_COLORS) });
          }
        }
        buildGrid();
        trackListener(window,'resize',buildGrid);

        function draw() {
          t += 0.016;
          ctx.clearRect(0,0,W,H);

          for (const led of cols) {
            const bright = 0.5 + 0.5*Math.sin(t*led.speed*60 + led.phase);
            /* random micro-flicker */
            const flicker = Math.random() < 0.002 ? rng(0.6,1) : bright;
            if (flicker < 0.08) continue;
            const [r,g,b] = led.col;
            ctx.fillStyle = `rgba(${r},${g},${b},${flicker*0.18})`;
            ctx.fillRect(led.x*cellSize, led.y*cellSize, cellSize-1, cellSize-1);
          }

          const h = raf(draw);
          trackRAF('microled', h);
        }
        const h = raf(draw);
        trackRAF('microled',h);

        return { destroy() { cancelRAF('microled'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 3. HOLOGRAPHIC NOISE FIELD ─────────────────────────────── */
  const HolographicNoiseField = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.35 } = opts;

        const canvas = makeCanvas('fx-holofield', 1, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;
        const img = ctx.createImageData(1,1);

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        /* Simple pseudo-Perlin via sin harmonics */
        function noise(x,y,z) {
          return Math.sin(x*0.012+z)*Math.cos(y*0.009+z*1.3)*0.5+0.5;
        }

        function draw() {
          t += 0.003;
          const id = ctx.getImageData(0,0,W,H);
          const d  = id.data;

          for (let y=0;y<H;y+=2) for (let x=0;x<W;x+=2) {
            const n = noise(x,y,t);
            /* chromatic shift: offset RGB channels */
            const nx = noise(x+8, y,   t*1.1);
            const ny = noise(x,   y+8, t*0.9);
            const r  = Math.floor(n*40);
            const g  = Math.floor(nx*60);
            const b  = Math.floor(ny*80);
            const a  = Math.floor(n*55);
            const idx = (y*W+x)*4;
            d[idx]=r; d[idx+1]=g; d[idx+2]=b; d[idx+3]=a;
            /* duplicate pixel 2×2 for perf */
            if (x+1<W && y+1<H) {
              const i2=(y*W+x+1)*4;   d[i2]=r;d[i2+1]=g;d[i2+2]=b;d[i2+3]=a;
              const i3=((y+1)*W+x)*4; d[i3]=r;d[i3+1]=g;d[i3+2]=b;d[i3+3]=a;
            }
          }
          ctx.putImageData(id,0,0);

          /* wave overlay */
          const grad = ctx.createLinearGradient(0,0,W,0);
          grad.addColorStop(0,'rgba(0,240,255,0.04)');
          grad.addColorStop(0.5,'rgba(139,92,246,0.06)');
          grad.addColorStop(1,'rgba(236,72,153,0.04)');
          ctx.fillStyle = grad;
          ctx.fillRect(0,0,W,H);

          const h = raf(draw);
          trackRAF('holofield',h);
        }
        const h = raf(draw);
        trackRAF('holofield',h);

        return { destroy() { cancelRAF('holofield'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ══════════════════════════════════════════════════════════════
     SECTION 2 — MIDGROUND INTERACTIVE LAYERS
     ══════════════════════════════════════════════════════════════ */

  /* ─── 4. IONIZED CIRCUIT TRACES ─────────────────────────────── */
  const IonizedCircuitTraces = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.55, color = C.cyan } = opts;

        const canvas = makeCanvas('fx-circuit', 5, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0, scrollY = 0;
        const traces = [], PULSE_COLORS = [C.cyan, C.purple, C.green, C.pink];

        function buildTraces() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
          traces.length = 0;
          const N = Math.floor(W/80);
          for (let i=0;i<N;i++) {
            const x = rng(0,W);
            const segs = [];
            let cy = rng(-50,H*0.3);
            for (let s=0;s<rng(4,9);s++) {
              const nx = x + rng(-120,120);
              const ny = cy + rng(60,160);
              segs.push({x:clamp(nx,0,W), y:ny});
              cy = ny;
            }
            traces.push({
              segs, col: pick(PULSE_COLORS),
              pulse: 0, speed: rng(0.003,0.012),
              delay: rng(0,2000), active: false,
            });
          }
        }
        buildTraces();
        trackListener(window,'resize',buildTraces);
        trackListener(window,'scroll', () => { scrollY = window.scrollY; });

        function draw() {
          t += 0.016;
          ctx.clearRect(0,0,W,H);

          const scrollFraction = clamp(scrollY / (document.body.scrollHeight - H), 0, 1);

          for (const tr of traces) {
            /* activate on scroll */
            if (!tr.active && Math.random() < 0.002 + scrollFraction*0.008) tr.active = true;
            if (!tr.active) continue;

            tr.pulse = (tr.pulse + tr.speed) % 1;
            const [r,g,b] = hexToRGB(tr.col);

            /* draw path */
            ctx.beginPath();
            ctx.moveTo(tr.segs[0].x, tr.segs[0].y - scrollY*0.15);
            for (let s=1;s<tr.segs.length;s++) {
              ctx.lineTo(tr.segs[s].x, tr.segs[s].y - scrollY*0.15);
            }
            ctx.strokeStyle = `rgba(${r},${g},${b},0.08)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            /* pulse dot */
            const totalLen = tr.segs.length - 1;
            const rawIdx   = tr.pulse * totalLen;
            const segIdx   = Math.floor(rawIdx);
            const frac     = rawIdx - segIdx;
            if (segIdx < totalLen) {
              const a = tr.segs[segIdx], b2 = tr.segs[segIdx+1];
              const px = lerp(a.x, b2.x, frac);
              const py = lerp(a.y, b2.y, frac) - scrollY*0.15;
              ctx.beginPath();
              ctx.arc(px, py, 3, 0, Math.PI*2);
              ctx.fillStyle = tr.col;
              ctx.shadowColor = tr.col;
              ctx.shadowBlur = 12;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }

          const h = raf(draw);
          trackRAF('circuit',h);
        }
        const h = raf(draw);
        trackRAF('circuit',h);

        return { destroy() { cancelRAF('circuit'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 5. LAB-GLASS REFRACTION ─────────────────────────────── */
  const LabGlassRefraction = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.4 } = opts;

        const canvas = makeCanvas('fx-glass', 6, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, mx = 0, my = 0, t = 0;

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);
        trackListener(window,'mousemove', e => { mx = e.clientX; my = e.clientY; });

        function draw() {
          t += 0.008;
          ctx.clearRect(0,0,W,H);

          /* radial glass lens centered on cursor */
          const lensR = 200 + Math.sin(t)*30;
          const grd = ctx.createRadialGradient(mx,my,0,mx,my,lensR);
          grd.addColorStop(0,'rgba(0,240,255,0.07)');
          grd.addColorStop(0.4,'rgba(139,92,246,0.04)');
          grd.addColorStop(0.8,'rgba(255,255,255,0.02)');
          grd.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle = grd;
          ctx.fillRect(0,0,W,H);

          /* concentric refraction rings */
          for (let i=1;i<5;i++) {
            const r = lensR * (i/5);
            ctx.beginPath();
            ctx.arc(mx, my, r, 0, Math.PI*2);
            ctx.strokeStyle = `rgba(0,240,255,${0.04 - i*0.007})`;
            ctx.lineWidth = 0.5 + Math.sin(t+i)*0.3;
            ctx.stroke();
          }

          /* ambient glass imperfections */
          const N = 6;
          for (let i=0;i<N;i++) {
            const angle = t*0.3 + (Math.PI*2*i/N);
            const rx = mx + Math.cos(angle)*lensR*0.6;
            const ry = my + Math.sin(angle)*lensR*0.6;
            const sg = ctx.createRadialGradient(rx,ry,0,rx,ry,40);
            sg.addColorStop(0,'rgba(255,255,255,0.06)');
            sg.addColorStop(1,'rgba(255,255,255,0)');
            ctx.fillStyle = sg;
            ctx.fillRect(rx-40,ry-40,80,80);
          }

          const h = raf(draw);
          trackRAF('glass',h);
        }
        const h = raf(draw);
        trackRAF('glass',h);

        return { destroy() { cancelRAF('glass'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 6. DATA STREAM FILAMENTS ───────────────────────────────── */
  const DataStreamFilaments = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.65, count = 12 } = opts;

        const canvas = makeCanvas('fx-filaments', 4, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H;
        const streams = [];
        const COLS = [C.cyan, C.purple, C.pink, C.green];

        function buildStreams() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
          streams.length = 0;
          for (let i=0;i<count;i++) {
            streams.push({
              y: rng(50, H-50),
              x: -rng(0, W),
              speed: rng(0.8, 3),
              col: pick(COLS),
              length: rng(80, 280),
              width: rng(0.5, 1.8),
              alpha: rng(0.4,1),
              glow: rng(4,16),
            });
          }
        }
        buildStreams();
        trackListener(window,'resize',buildStreams);

        function draw() {
          ctx.clearRect(0,0,W,H);

          for (const s of streams) {
            s.x += s.speed;
            if (s.x - s.length > W) {
              s.x = -s.length;
              s.y = rng(50,H-50);
              s.speed = rng(0.8,3);
            }

            const [r,g,b] = hexToRGB(s.col);
            const grd = ctx.createLinearGradient(s.x-s.length, 0, s.x, 0);
            grd.addColorStop(0,'rgba(0,0,0,0)');
            grd.addColorStop(0.6,`rgba(${r},${g},${b},${s.alpha*0.5})`);
            grd.addColorStop(1,`rgba(${r},${g},${b},${s.alpha})`);

            ctx.beginPath();
            ctx.moveTo(s.x - s.length, s.y);
            ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = grd;
            ctx.lineWidth = s.width;
            ctx.shadowColor = s.col;
            ctx.shadowBlur = s.glow;
            ctx.stroke();
            ctx.shadowBlur = 0;

            /* bright head */
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.width*1.5, 0, Math.PI*2);
            ctx.fillStyle = `rgba(${r},${g},${b},${s.alpha})`;
            ctx.fill();
          }

          const h = raf(draw);
          trackRAF('filaments',h);
        }
        const h = raf(draw);
        trackRAF('filaments',h);

        return { destroy() { cancelRAF('filaments'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 7. CRYO-FOG VAPOR ──────────────────────────────────────── */
  const CryoFogVapor = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.5 } = opts;

        const canvas = makeCanvas('fx-cryofog', 3, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;
        const puffs = [];

        class Puff {
          constructor() { this.reset(true); }
          reset(init=false) {
            this.x = rng(-200, typeof W!=='undefined'?W+200:1600);
            this.y = init ? rng(0,H||800) : rng(H*0.4,H||800);
            this.r = rng(120,340);
            this.vx = rng(-0.15,0.15);
            this.vy = rng(-0.06,0.02);
            this.life = 1;
            this.decay = rng(0.0003,0.001);
            this.col = pick([[0,240,255],[139,92,246],[236,72,153]]);
          }
          update() {
            this.x += this.vx; this.y += this.vy;
            this.life -= this.decay;
            this.r += 0.08;
          }
          draw(ctx) {
            const [r,g,b] = this.col;
            const a = this.life * 0.12;
            const grd = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r);
            grd.addColorStop(0,`rgba(${r},${g},${b},${a})`);
            grd.addColorStop(0.5,`rgba(${r},${g},${b},${a*0.4})`);
            grd.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
            ctx.fill();
          }
        }

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        for (let i=0;i<18;i++) puffs.push(new Puff());

        function draw() {
          t += 0.008;
          ctx.clearRect(0,0,W,H);

          for (const p of puffs) {
            if (p.life <= 0) p.reset();
            p.update();
            p.draw(ctx);
          }

          if (Math.random() < 0.015) puffs.push(new Puff());
          while (puffs.length > 30) puffs.shift();

          const h = raf(draw);
          trackRAF('cryofog',h);
        }
        const h = raf(draw);
        trackRAF('cryofog',h);

        return { destroy() { cancelRAF('cryofog'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ══════════════════════════════════════════════════════════════
     SECTION 3 — FOREGROUND MICRO-TEXTURES
     ══════════════════════════════════════════════════════════════ */

  /* ─── 8. DIAGNOSTIC SCANLINES ───────────────────────────────── */
  const DiagnosticScanlines = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.5, color = C.cyan, gap = 3 } = opts;

        const div = document.createElement('div');
        div.id = 'fx-scanlines';
        Object.assign(div.style, {
          position:'fixed', inset:'0', zIndex:'9000', pointerEvents:'none',
          opacity: String(opacity),
          background:`repeating-linear-gradient(0deg,transparent,transparent ${gap}px,rgba(0,240,255,0.022) ${gap}px,rgba(0,240,255,0.022) ${gap+1}px)`,
        });

        /* sweeping bright line */
        const sweep = document.createElement('div');
        Object.assign(sweep.style, {
          position:'absolute', left:'0', right:'0', height:'2px',
          background:`linear-gradient(90deg,transparent,${color},transparent)`,
          opacity:'0.5',
          animation:'scanSweep 3s linear infinite',
        });

        /* inject keyframe if not present */
        if (!document.getElementById('fx-scan-kf')) {
          const style = document.createElement('style');
          style.id = 'fx-scan-kf';
          style.textContent = `@keyframes scanSweep{from{top:-2px}to{top:100vh}}`;
          document.head.appendChild(style);
        }

        div.appendChild(sweep);
        target.appendChild(div);
        _mountedEls.add(div);

        return { destroy() { div.remove(); _mountedEls.delete(div); } };
      }
    };
  })();

  /* ─── 9. PARTICLE ION DRIFT ─────────────────────────────────── */
  const ParticleIonDrift = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.65, count = 80, heroEl = null } = opts;

        const canvas = makeCanvas('fx-ions', 7, opacity, heroEl ? 'absolute' : 'fixed');
        if (heroEl) { heroEl.style.position='relative'; heroEl.appendChild(canvas); }
        else target.prepend(canvas);
        _mountedEls.add(canvas);

        const ctx = canvas.getContext('2d');
        let W, H, t = 0;

        class Ion {
          constructor() { this.reset(true); }
          reset(init=false) {
            this.x = rng(0, W||window.innerWidth);
            this.y = init ? rng(0, H||window.innerHeight) : rng(0,H||window.innerHeight);
            this.vx = rng(-0.3,0.3);
            this.vy = rng(-0.5,-0.1);
            this.r = rng(1,3);
            this.life = 1;
            this.decay = rng(0.002,0.006);
            this.col = pick([C.cyan,C.purple,C.pink,C.green,C.white]);
            this.spark = Math.random() < 0.04;
          }
          update() {
            this.x += this.vx; this.y += this.vy;
            this.life -= this.decay;
          }
          draw() {
            const [r,g,b] = hexToRGB(this.col);
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
            ctx.fillStyle = `rgba(${r},${g},${b},${this.life*0.85})`;
            if (this.spark) {
              ctx.shadowColor = this.col;
              ctx.shadowBlur = 12;
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            if (this.spark && Math.random()<0.06) {
              /* spark trail */
              ctx.beginPath();
              ctx.moveTo(this.x,this.y);
              ctx.lineTo(this.x+rng(-8,8),this.y+rng(-8,8));
              ctx.strokeStyle = `rgba(${r},${g},${b},${this.life*0.5})`;
              ctx.lineWidth=0.5;
              ctx.stroke();
            }
          }
        }

        function resize() {
          W = canvas.width  = heroEl ? heroEl.offsetWidth  : window.innerWidth;
          H = canvas.height = heroEl ? heroEl.offsetHeight : window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        const ions = Array.from({length:count},()=>new Ion());

        function draw() {
          t+=0.016;
          ctx.clearRect(0,0,W,H);

          for (const ion of ions) {
            if (ion.life<=0 || ion.y < -10) ion.reset();
            ion.update();
            ion.draw();
          }

          const h = raf(draw);
          trackRAF('ions',h);
        }
        const h = raf(draw);
        trackRAF('ions',h);

        return { destroy() { cancelRAF('ions'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 10. NANO-GRID OVERLAY ─────────────────────────────────── */
  const NanoGridOverlay = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.3, color = C.cyan, cell = 30 } = opts;

        const canvas = makeCanvas('fx-nanogrid', 8, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        const [cr,cg,cb] = hexToRGB(color);

        function draw() {
          t += 0.004;
          ctx.clearRect(0,0,W,H);

          const shimmer = 0.5 + 0.5*Math.sin(t);
          const baseA = 0.04 + shimmer*0.02;

          /* major grid */
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${baseA})`;
          ctx.lineWidth = 0.5;
          for (let x=0;x<W;x+=cell) {
            ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
          }
          for (let y=0;y<H;y+=cell) {
            ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
          }

          /* minor grid (every 5px) */
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${baseA*0.3})`;
          ctx.lineWidth = 0.3;
          for (let x=0;x<W;x+=cell/3) {
            ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
          }
          for (let y=0;y<H;y+=cell/3) {
            ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
          }

          /* crosshair markers at intersections */
          if (Math.random()<0.08) {
            const xi = Math.floor(rng(0,W/cell))*cell;
            const yi = Math.floor(rng(0,H/cell))*cell;
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.6)`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(xi-6,yi); ctx.lineTo(xi+6,yi); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(xi,yi-6); ctx.lineTo(xi,yi+6); ctx.stroke();
          }

          const h = raf(draw);
          trackRAF('nanogrid',h);
        }
        const h = raf(draw);
        trackRAF('nanogrid',h);

        return { destroy() { cancelRAF('nanogrid'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 11. THERMAL IMAGING GRADIENT ──────────────────────────── */
  const ThermalImagingGradient = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.35 } = opts;

        const canvas = makeCanvas('fx-thermal', 2, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        /* heatmap color ramp: cold→cool→warm→hot */
        function heatColor(v) {
          const stops = [
            [0,     [0,0,128]],
            [0.25,  [0,128,255]],
            [0.5,   [0,255,128]],
            [0.75,  [255,200,0]],
            [1.0,   [255,50,0]],
          ];
          for (let i=0;i<stops.length-1;i++) {
            const [t0,c0] = stops[i];
            const [t1,c1] = stops[i+1];
            if (v>=t0&&v<=t1) {
              const f = (v-t0)/(t1-t0);
              return c0.map((a,j)=>Math.round(lerp(a,c1[j],f)));
            }
          }
          return [255,50,0];
        }

        function draw() {
          t += 0.004;
          ctx.clearRect(0,0,W,H);

          /* draw heatmap blobs */
          const blobs = [
            {x:W*0.2+Math.sin(t*0.7)*W*0.08, y:H*0.3+Math.cos(t*0.5)*H*0.08, v:0.9, r:220},
            {x:W*0.7+Math.cos(t*0.4)*W*0.1,  y:H*0.6+Math.sin(t*0.6)*H*0.1,  v:0.6, r:300},
            {x:W*0.5+Math.sin(t*1.1)*W*0.12, y:H*0.5+Math.cos(t*0.8)*H*0.12, v:0.75,r:180},
          ];

          for (const blob of blobs) {
            for (let dv=0;dv<=1;dv+=0.15) {
              const v = blob.v * (1-dv);
              const r = blob.r * (dv+0.2);
              const [cr,cg,cb] = heatColor(v);
              const grd = ctx.createRadialGradient(blob.x,blob.y,0,blob.x,blob.y,r);
              grd.addColorStop(0,`rgba(${cr},${cg},${cb},0.18)`);
              grd.addColorStop(1,`rgba(${cr},${cg},${cb},0)`);
              ctx.fillStyle = grd;
              ctx.fillRect(0,0,W,H);
            }
          }

          const h = raf(draw);
          trackRAF('thermal',h);
        }
        const h = raf(draw);
        trackRAF('thermal',h);

        return { destroy() { cancelRAF('thermal'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ══════════════════════════════════════════════════════════════
     SECTION 4 — SIGNATURE COSMIC-LAB HYBRIDS
     ══════════════════════════════════════════════════════════════ */

  /* ─── 12. CRYSTAL REFRACTION BURST ─────────────────────────── */
  const CrystalRefractionBurst = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.7, cx = null, cy = null } = opts;

        const canvas = makeCanvas('fx-crystalburst', 10, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;
        const shards = [];

        class Shard {
          constructor() { this.reset(); }
          reset() {
            this.angle = rng(0,Math.PI*2);
            this.speed = rng(0.3,1.2);
            this.dist  = rng(40,280);
            this.size  = rng(4,18);
            this.col   = pick([C.cyan,C.purple,C.pink,C.green,C.white]);
            this.rot   = rng(0,Math.PI*2);
            this.rotV  = rng(-0.02,0.02);
            this.pulse = rng(0,Math.PI*2);
          }
          draw(cx,cy) {
            const curDist = this.dist + Math.sin(t*this.speed+this.pulse)*20;
            const x = cx + Math.cos(this.angle+t*this.speed*0.2)*curDist;
            const y = cy + Math.sin(this.angle+t*this.speed*0.2)*curDist;
            const alpha = 0.4 + 0.4*Math.sin(t*this.speed*2+this.pulse);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = this.col;
            ctx.shadowColor = this.col;
            ctx.shadowBlur  = 12;
            ctx.lineWidth   = 1.2;
            ctx.translate(x,y);
            ctx.rotate(this.rot + t*this.rotV*60);
            /* diamond */
            ctx.beginPath();
            ctx.moveTo(0,-this.size);
            ctx.lineTo(this.size*0.5,0);
            ctx.lineTo(0,this.size*1.3);
            ctx.lineTo(-this.size*0.5,0);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
        }

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        for (let i=0;i<40;i++) shards.push(new Shard());

        function draw() {
          t += 0.016;
          ctx.clearRect(0,0,W,H);

          const bcx = cx !== null ? cx : W/2;
          const bcy = cy !== null ? cy : H/2;

          /* central light source */
          const core = ctx.createRadialGradient(bcx,bcy,0,bcx,bcy,80+Math.sin(t*2)*20);
          core.addColorStop(0,`rgba(0,240,255,${0.18+0.08*Math.sin(t*3)})`);
          core.addColorStop(0.4,'rgba(139,92,246,0.08)');
          core.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle = core;
          ctx.fillRect(0,0,W,H);

          for (const s of shards) s.draw(bcx,bcy);

          const h = raf(draw);
          trackRAF('crystalburst',h);
        }
        const h = raf(draw);
        trackRAF('crystalburst',h);

        return { destroy() { cancelRAF('crystalburst'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 13. DARK MATTER LAB SWIRL ─────────────────────────────── */
  const DarkMatterLabSwirl = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.55 } = opts;

        const canvas = makeCanvas('fx-darkmatter', 2, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;
        const particles = [];

        class DarkParticle {
          constructor() { this.reset(true); }
          reset(init=false) {
            this.angle = rng(0,Math.PI*2);
            this.radius= rng(60, 350);
            this.speed = rng(0.0004,0.0015) * (Math.random()<0.5?1:-1);
            this.y0    = init ? rng(0,H||800) : H/2;
            this.col   = pick([[139,92,246],[0,240,255],[236,72,153]]);
            this.r     = rng(1.5,4);
            this.life  = 1;
            this.decay = rng(0.0003,0.001);
          }
          update(cx,cy) {
            this.angle += this.speed * 60;
            this.life -= this.decay;
            this.x = cx + Math.cos(this.angle)*this.radius;
            this.y = cy + Math.sin(this.angle)*this.radius*0.35;
          }
          draw() {
            const [r,g,b] = this.col;
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
            ctx.fillStyle=`rgba(${r},${g},${b},${this.life*0.7})`;
            ctx.fill();
          }
        }

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        for (let i=0;i<120;i++) particles.push(new DarkParticle());

        function draw() {
          t += 0.008;
          ctx.clearRect(0,0,W,H);

          const cx = W/2, cy = H/2;

          /* vortex glow */
          const g = ctx.createRadialGradient(cx,cy,0,cx,cy,400);
          g.addColorStop(0,'rgba(139,92,246,0.12)');
          g.addColorStop(0.5,'rgba(0,240,255,0.04)');
          g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

          for (const p of particles) {
            if (p.life<=0) p.reset();
            p.update(cx,cy);
            p.draw();
          }

          const h = raf(draw);
          trackRAF('darkmatter',h);
        }
        const h = raf(draw);
        trackRAF('darkmatter',h);

        return { destroy() { cancelRAF('darkmatter'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 14. QUANTUM FIELD RIPPLE ───────────────────────────────── */
  const QuantumFieldRipple = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.5 } = opts;

        const canvas = makeCanvas('fx-quantum', 6, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;
        const ripples = [];

        class Ripple {
          constructor(x,y) {
            this.x = x||0; this.y = y||0;
            this.r = 0; this.maxR = rng(150,400);
            this.speed = rng(1.5,4);
            this.life = 1;
            this.col = pick([C.cyan,C.purple,C.pink]);
          }
          update() { this.r += this.speed; this.life = 1 - this.r/this.maxR; }
          draw() {
            if (this.life<=0) return;
            const [r,g,b] = hexToRGB(this.col);
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
            ctx.strokeStyle=`rgba(${r},${g},${b},${this.life*0.5})`;
            ctx.lineWidth = 1.5*(1-this.r/this.maxR);
            ctx.stroke();
          }
        }

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        /* spawn on click */
        trackListener(window,'click', e => {
          ripples.push(new Ripple(e.clientX,e.clientY));
        });

        /* auto-spawn */
        function autoRipple() {
          ripples.push(new Ripple(rng(W*0.2,W*0.8), rng(H*0.2,H*0.8)));
          setTimeout(autoRipple, rng(1500,4000));
        }
        autoRipple();

        function draw() {
          t+=0.016;
          ctx.clearRect(0,0,W,H);

          for (let i=ripples.length-1;i>=0;i--) {
            ripples[i].update();
            ripples[i].draw();
            if (ripples[i].life<=0) ripples.splice(i,1);
          }

          const h = raf(draw);
          trackRAF('quantum',h);
        }
        const h = raf(draw);
        trackRAF('quantum',h);

        return { destroy() { cancelRAF('quantum'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 15. NEON ION STORM ─────────────────────────────────────── */
  const NeonIonStorm = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.7, intensity = 60 } = opts;

        const canvas = makeCanvas('fx-ionstorm', 9, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H;
        const streaks = [];

        class Streak {
          constructor() { this.reset(); }
          reset() {
            this.x = rng(-100,window.innerWidth+100);
            this.y = rng(-100,window.innerHeight+100);
            this.len = rng(30,160);
            this.angle = rng(0,Math.PI*2);
            this.speed = rng(4,18);
            this.life = 1;
            this.col = pick([C.cyan,C.pink,C.purple,C.green]);
            this.width = rng(0.5,2);
          }
          update() {
            this.x += Math.cos(this.angle)*this.speed;
            this.y += Math.sin(this.angle)*this.speed;
            this.life -= rng(0.015,0.04);
          }
          draw() {
            const [r,g,b] = hexToRGB(this.col);
            const tail = ctx.createLinearGradient(
              this.x,this.y,
              this.x-Math.cos(this.angle)*this.len,
              this.y-Math.sin(this.angle)*this.len
            );
            tail.addColorStop(0,`rgba(${r},${g},${b},${this.life*0.9})`);
            tail.addColorStop(1,`rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.moveTo(this.x,this.y);
            ctx.lineTo(this.x-Math.cos(this.angle)*this.len, this.y-Math.sin(this.angle)*this.len);
            ctx.strokeStyle = tail;
            ctx.lineWidth = this.width;
            ctx.shadowColor = this.col;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        for (let i=0;i<intensity;i++) streaks.push(new Streak());

        function draw() {
          ctx.clearRect(0,0,W,H);

          for (let i=streaks.length-1;i>=0;i--) {
            streaks[i].update();
            streaks[i].draw();
            if (streaks[i].life<=0) streaks[i].reset();
          }

          const h = raf(draw);
          trackRAF('ionstorm',h);
        }
        const h = raf(draw);
        trackRAF('ionstorm',h);

        return { destroy() { cancelRAF('ionstorm'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ══════════════════════════════════════════════════════════════
     SECTION 5 — UTILITY TEXTURES
     ══════════════════════════════════════════════════════════════ */

  /* ─── 16. SCROLL-ACTIVATED DATA SWEEP ───────────────────────── */
  const ScrollDataSweep = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.5 } = opts;

        const canvas = makeCanvas('fx-datasweep', 11, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, scrollY = 0, t = 0;
        const bars = [];

        function buildBars() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
          bars.length = 0;
          const N = 12;
          for (let i=0;i<N;i++) {
            bars.push({
              y: rng(0,H),
              targetY: rng(0,H),
              width: 0, maxWidth: rng(W*0.15, W*0.5),
              col: pick([C.cyan,C.green,C.purple]),
              speed: rng(0.01,0.04),
            });
          }
        }
        buildBars();
        trackListener(window,'resize',buildBars);
        trackListener(window,'scroll', () => { scrollY = window.scrollY; });

        function draw() {
          t+=0.016;
          ctx.clearRect(0,0,W,H);

          const scrollFrac = clamp(scrollY/(Math.max(document.body.scrollHeight-H,1)),0,1);

          for (const bar of bars) {
            bar.width = lerp(bar.width, bar.maxWidth * scrollFrac, bar.speed);
            const [r,g,b] = hexToRGB(bar.col);
            const grd = ctx.createLinearGradient(0,0,bar.width,0);
            grd.addColorStop(0,'rgba(0,0,0,0)');
            grd.addColorStop(0.5,`rgba(${r},${g},${b},0.25)`);
            grd.addColorStop(0.85,`rgba(${r},${g},${b},0.45)`);
            grd.addColorStop(1,`rgba(${r},${g},${b},0.1)`);
            ctx.fillStyle = grd;
            ctx.fillRect(0, bar.y - 1, bar.width, 2);

            /* data labels */
            if (scrollFrac > 0.15) {
              ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
              ctx.font = '9px "Share Tech Mono",monospace';
              ctx.fillText(Math.floor(bar.width*10/W*100)+'%', bar.width+4, bar.y+3);
            }
          }

          const h = raf(draw);
          trackRAF('datasweep',h);
        }
        const h = raf(draw);
        trackRAF('datasweep',h);

        return { destroy() { cancelRAF('datasweep'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 17. PRESSURE-PLATE GLOW ───────────────────────────────── */
  const PressurePlateGlow = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.6 } = opts;

        const canvas = makeCanvas('fx-pressureplate', 12, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, mx = 0, my = 0;
        const blooms = [];

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);
        trackListener(window,'mousemove', e => {
          mx = e.clientX; my = e.clientY;
          if (Math.random()<0.06) blooms.push({x:mx,y:my,r:0,life:1,col:pick([C.cyan,C.purple,C.pink])});
        });

        function draw() {
          ctx.clearRect(0,0,W,H);

          /* cursor glow */
          const grd = ctx.createRadialGradient(mx,my,0,mx,my,80);
          grd.addColorStop(0,'rgba(0,240,255,0.15)');
          grd.addColorStop(0.5,'rgba(0,240,255,0.05)');
          grd.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);

          /* blooms */
          for (let i=blooms.length-1;i>=0;i--) {
            const b=blooms[i];
            b.r+=3; b.life-=0.025;
            const [r,g,bl] = hexToRGB(b.col);
            const bg = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
            bg.addColorStop(0,`rgba(${r},${g},${bl},${b.life*0.3})`);
            bg.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
            if (b.life<=0) blooms.splice(i,1);
          }

          const h = raf(draw);
          trackRAF('pressure',h);
        }
        const h = raf(draw);
        trackRAF('pressure',h);

        return { destroy() { cancelRAF('pressure'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 18. MAGNETIC ALIGNMENT GRID ───────────────────────────── */
  const MagneticAlignmentGrid = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.35, cell = 40 } = opts;

        const canvas = makeCanvas('fx-maggrid', 8, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0, mx = 0, my = 0;
        const nodes = [];

        function buildNodes() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
          nodes.length = 0;
          for (let y=cell;y<H;y+=cell) for (let x=cell;x<W;x+=cell) {
            nodes.push({bx:x,by:y,x,y,vx:0,vy:0});
          }
        }
        buildNodes();
        trackListener(window,'resize',buildNodes);
        trackListener(window,'mousemove',e=>{mx=e.clientX;my=e.clientY;});

        function draw() {
          t+=0.016;
          ctx.clearRect(0,0,W,H);

          for (const n of nodes) {
            /* magnetic pull toward cursor */
            const dx = mx-n.x, dy = my-n.y;
            const dist = Math.sqrt(dx*dx+dy*dy);
            const force = Math.max(0,1-dist/200);
            n.vx += dx/dist * force * 1.5 - (n.x-n.bx)*0.08;
            n.vy += dy/dist * force * 1.5 - (n.y-n.by)*0.08;
            n.vx *= 0.88; n.vy *= 0.88;
            n.x += n.vx; n.y += n.vy;

            ctx.beginPath();
            ctx.arc(n.x,n.y,1.5,0,Math.PI*2);
            ctx.fillStyle = `rgba(0,240,255,${0.2+force*0.5})`;
            ctx.fill();
          }

          const h = raf(draw);
          trackRAF('maggrid',h);
        }
        const h = raf(draw);
        trackRAF('maggrid',h);

        return { destroy() { cancelRAF('maggrid'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ══════════════════════════════════════════════════════════════
     SECTION 6 — HIGH-IMPACT SET PIECES
     ══════════════════════════════════════════════════════════════ */

  /* ─── 19. REACTOR CORE PULSE ─────────────────────────────────── */
  const ReactorCorePulse = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.75, cx = null, cy = null } = opts;

        const canvas = makeCanvas('fx-reactor', 13, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H, t = 0;

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        function draw() {
          t += 0.02;
          ctx.clearRect(0,0,W,H);

          const rcx = cx!==null ? cx : W/2;
          const rcy = cy!==null ? cy : H/2;

          /* pulse rings */
          for (let i=0;i<5;i++) {
            const phase = (t*0.8 + i*0.4) % (Math.PI*2);
            const r = 60 + i*50 + Math.sin(phase)*20;
            const a = 0.3 * Math.pow(Math.sin(phase*0.5),2);
            const cols = [C.cyan,C.purple,C.pink,C.green,C.cyan];
            const [cr,cg,cb] = hexToRGB(cols[i]);
            ctx.beginPath();
            ctx.arc(rcx,rcy,r,0,Math.PI*2);
            ctx.strokeStyle=`rgba(${cr},${cg},${cb},${a})`;
            ctx.lineWidth = 2-i*0.3;
            ctx.shadowColor = cols[i];
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }

          /* core glow */
          const coreR = 30 + Math.sin(t*3)*8;
          const coreG = ctx.createRadialGradient(rcx,rcy,0,rcx,rcy,coreR*3);
          coreG.addColorStop(0,`rgba(0,240,255,${0.6+0.3*Math.sin(t*4)})`);
          coreG.addColorStop(0.3,'rgba(139,92,246,0.3)');
          coreG.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle = coreG;
          ctx.fillRect(0,0,W,H);

          /* hard core */
          ctx.beginPath();
          ctx.arc(rcx,rcy,coreR,0,Math.PI*2);
          ctx.fillStyle = `rgba(255,255,255,${0.4+0.3*Math.sin(t*5)})`;
          ctx.shadowColor = C.cyan; ctx.shadowBlur = 30;
          ctx.fill(); ctx.shadowBlur = 0;

          const h = raf(draw);
          trackRAF('reactor',h);
        }
        const h = raf(draw);
        trackRAF('reactor',h);

        return { destroy() { cancelRAF('reactor'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ─── 20. COSMIC DEBRIS CONVEYOR ─────────────────────────────── */
  const CosmicDebrisConveyor = (() => {
    return {
      mount(target = document.body, opts = {}) {
        const { opacity = 0.55, count = 25 } = opts;

        const canvas = makeCanvas('fx-debris', 3, opacity);
        target.prepend(canvas);
        _mountedEls.add(canvas);
        const ctx = canvas.getContext('2d');

        let W, H;
        const fragments = [];

        class Fragment {
          constructor() { this.reset(); }
          reset() {
            W = W||window.innerWidth;
            H = H||window.innerHeight;
            this.x = -rng(50,200);
            this.y = rng(0,H);
            this.vx = rng(0.4,1.8);
            this.vy = rng(-0.2,0.2);
            this.size = rng(4,18);
            this.rot = rng(0,Math.PI*2);
            this.rotV = rng(-0.02,0.02);
            this.col = pick([C.cyan,C.purple,C.pink,'#888','#aaa']);
            this.sides = Math.floor(rng(3,7));
            this.trail = [];
          }
          update() {
            this.x += this.vx; this.y += this.vy;
            this.rot += this.rotV;
            this.trail.push({x:this.x,y:this.y});
            if (this.trail.length>8) this.trail.shift();
          }
          draw() {
            const [r,g,b] = hexToRGB(this.col);
            /* trail */
            for (let i=0;i<this.trail.length;i++) {
              const a = (i/this.trail.length)*0.15;
              ctx.beginPath();
              ctx.arc(this.trail[i].x,this.trail[i].y,this.size*(i/this.trail.length)*0.4,0,Math.PI*2);
              ctx.fillStyle=`rgba(${r},${g},${b},${a})`;
              ctx.fill();
            }
            /* fragment shape */
            ctx.save();
            ctx.translate(this.x,this.y);
            ctx.rotate(this.rot);
            ctx.beginPath();
            for (let s=0;s<this.sides;s++) {
              const a = (s/this.sides)*Math.PI*2;
              const rx = Math.cos(a)*this.size*(0.7+Math.random()*0.6);
              const ry = Math.sin(a)*this.size*(0.7+Math.random()*0.6);
              s===0 ? ctx.moveTo(rx,ry) : ctx.lineTo(rx,ry);
            }
            ctx.closePath();
            ctx.strokeStyle=`rgba(${r},${g},${b},0.7)`;
            ctx.lineWidth=1;
            ctx.shadowColor=this.col; ctx.shadowBlur=8;
            ctx.stroke(); ctx.shadowBlur=0;
            ctx.restore();
          }
        }

        function resize() {
          W = canvas.width  = window.innerWidth;
          H = canvas.height = window.innerHeight;
        }
        resize();
        trackListener(window,'resize',resize);

        for (let i=0;i<count;i++) {
          const f = new Fragment();
          f.x = rng(-W,W); /* scatter initial positions */
          fragments.push(f);
        }

        function draw() {
          ctx.clearRect(0,0,W,H);

          for (const f of fragments) {
            if (f.x > W+50) f.reset();
            f.update(); f.draw();
          }

          const h = raf(draw);
          trackRAF('debris',h);
        }
        const h = raf(draw);
        trackRAF('debris',h);

        return { destroy() { cancelRAF('debris'); canvas.remove(); _mountedEls.delete(canvas); } };
      }
    };
  })();

  /* ══════════════════════════════════════════════════════════════
     SECTION 7 — TEXT ANIMATION SYSTEM
     ══════════════════════════════════════════════════════════════ */

  const GLYPHS_SCRAMBLE = '!@#$%^&*<>[]{}|\\∞◆▲░▒∅Ψ∑∏∫≈≠01';

  function splitToSpans(el) {
    const text = el.textContent;
    el.innerHTML = '';
    return [...text].map((ch,i) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.display = 'inline-block';
      el.appendChild(s);
      return s;
    });
  }

  const TextFX = {

    /* 1. Cosmic Pulse Reveal */
    cosmicPulseReveal(el, opts={}) {
      const { color=C.cyan, duration=1200, delay=0 } = opts;
      el.style.opacity = '0';
      el.style.textShadow = `0 0 0px ${color}`;
      setTimeout(() => {
        el.style.transition = `opacity ${duration*0.4}ms, text-shadow ${duration}ms`;
        el.style.opacity = '1';
        el.style.textShadow = `0 0 40px ${color}, 0 0 80px ${color}`;
        setTimeout(() => {
          el.style.textShadow = `0 0 8px ${color}`;
        }, duration*0.8);
      }, delay);
    },

    /* 2. Glyph-by-Glyph Decode */
    glyphDecode(el, opts={}) {
      const { duration=1600, delay=0, color=C.cyan } = opts;
      const original = el.textContent;
      const chars    = [...original];
      const resolved = new Array(chars.length).fill(false);
      let startTime = null;

      setTimeout(() => {
        function frame(ts) {
          if (!startTime) startTime = ts;
          const elapsed = ts - startTime;
          const progress = Math.min(elapsed/duration, 1);

          const idx = Math.floor(progress * chars.length);
          for (let i=0;i<=idx;i++) resolved[i]=true;

          el.innerHTML = chars.map((ch,i) => {
            if (resolved[i]) return `<span style="color:${color}">${ch==' '?'&nbsp;':ch}</span>`;
            const g = GLYPHS_SCRAMBLE[Math.floor(Math.random()*GLYPHS_SCRAMBLE.length)];
            return `<span style="color:${color};opacity:0.4">${g}</span>`;
          }).join('');

          if (progress < 1) raf(frame);
          else el.textContent = original;
        }
        raf(frame);
      }, delay);
    },

    /* 3. Vertical Warp Scroll */
    verticalWarp(el, opts={}) {
      const { duration=900, delay=0 } = opts;
      const spans = splitToSpans(el);
      spans.forEach((s,i) => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(40px) scaleY(1.5)';
        s.style.filter = 'blur(4px)';
        s.style.transition = `opacity ${duration*0.5}ms ${delay+i*40}ms, transform ${duration*0.6}ms ${delay+i*40}ms, filter ${duration*0.4}ms ${delay+i*40}ms`;
      });
      requestAnimationFrame(() => {
        spans.forEach(s => {
          s.style.opacity = '1';
          s.style.transform = 'translateY(0) scaleY(1)';
          s.style.filter = 'blur(0)';
        });
      });
    },

    /* 4. Neon Trace Outline */
    neonTraceOutline(el, opts={}) {
      const { color=C.cyan, duration=1000, delay=0 } = opts;
      Object.assign(el.style, {
        webkitTextStroke: `1px ${color}`,
        color: 'transparent',
        textShadow: 'none',
        transition: `color ${duration*0.5}ms ${delay+duration*0.5}ms, text-shadow ${duration*0.4}ms ${delay+duration*0.6}ms`,
      });
      setTimeout(() => {
        el.style.color = color;
        el.style.textShadow = `0 0 12px ${color}`;
      }, delay + duration * 0.5);
    },

    /* 5. Modular Tile Flip */
    modularTileFlip(el, opts={}) {
      const { duration=600, delay=0, stagger=60 } = opts;
      const spans = splitToSpans(el);
      spans.forEach((s,i) => {
        s.style.display = 'inline-block';
        s.style.transform = 'rotateX(180deg)';
        s.style.opacity = '0';
        s.style.transition = `transform ${duration}ms ${delay+i*stagger}ms cubic-bezier(.2,1.2,.4,1), opacity ${duration*0.4}ms ${delay+i*stagger}ms`;
      });
      requestAnimationFrame(() => {
        spans.forEach(s => { s.style.transform = 'rotateX(0deg)'; s.style.opacity = '1'; });
      });
    },

    /* 6. Starfall Cascade */
    starfallCascade(el, opts={}) {
      const { duration=800, delay=0, stagger=50 } = opts;
      const spans = splitToSpans(el);
      spans.forEach((s,i) => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(-80px)';
        s.style.textShadow = `0 0 20px ${C.cyan}`;
        s.style.transition = `opacity ${duration*0.5}ms ${delay+i*stagger}ms, transform ${duration}ms ${delay+i*stagger}ms cubic-bezier(.1,1.3,.3,1)`;
      });
      requestAnimationFrame(() => {
        spans.forEach(s => { s.style.opacity = '1'; s.style.transform = 'translateY(0)'; });
      });
    },

    /* 7. Liquid Chromatic Slide */
    liquidChromaticSlide(el, opts={}) {
      const { duration=1200, delay=0 } = opts;
      Object.assign(el.style, {
        opacity: '0',
        filter: 'blur(8px) saturate(2)',
        transform: 'skewX(-15deg) translateX(-20px)',
        transition: `opacity ${duration*0.5}ms ${delay}ms, filter ${duration}ms ${delay}ms, transform ${duration}ms ${delay}ms cubic-bezier(.2,1,.3,1)`,
      });
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.filter = 'blur(0) saturate(1)';
        el.style.transform = 'skewX(0deg) translateX(0)';
      }, delay + 20);
    },

    /* 8. Heatwave Distortion */
    heatwaveDistortion(el, opts={}) {
      const { duration=1000, delay=0 } = opts;
      el.style.opacity = '0';
      el.style.filter = 'blur(6px) brightness(2) hue-rotate(40deg)';
      el.style.transition = `opacity ${duration*0.4}ms ${delay}ms, filter ${duration}ms ${delay}ms`;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.filter = 'blur(0) brightness(1) hue-rotate(0deg)';
      }, delay + 20);
    },

    /* 9. Quantum Flicker */
    quantumFlicker(el, opts={}) {
      const { duration=1200, delay=0 } = opts;
      const steps = [0,1,0,1,0.3,1,0,0.7,1];
      const stepDur = (duration*0.6)/steps.length;
      el.style.opacity = '0';

      setTimeout(() => {
        steps.forEach((v,i) => {
          setTimeout(() => { el.style.opacity = String(v); }, i*stepDur);
        });
        setTimeout(() => { el.style.opacity='1'; }, duration*0.7);
      }, delay);
    },

    /* 10. Dust-to-Form Materialization */
    dustToForm(el, opts={}) {
      const { duration=1500, delay=0, color=C.cyan } = opts;
      const original = el.textContent;
      el.textContent = '';

      const canvas = document.createElement('canvas');
      const ctx2 = canvas.getContext('2d');
      el.style.position = 'relative';

      const particles2 = [];
      let startTime2 = null;

      /* measure text */
      const rect = el.getBoundingClientRect();

      class DustP {
        constructor(tx,ty) {
          this.tx = tx; this.ty = ty;
          this.x  = tx + rng(-150,150);
          this.y  = ty + rng(-150,150);
          this.life = 0;
        }
        update(prog) {
          this.x = lerp(this.x, this.tx, prog*0.08);
          this.y = lerp(this.y, this.ty, prog*0.08);
          this.life = prog;
        }
        draw(ctx) {
          const [r,g,b] = hexToRGB(color);
          ctx.beginPath();
          ctx.arc(this.x,this.y,2,0,Math.PI*2);
          ctx.fillStyle=`rgba(${r},${g},${b},${this.life*0.8})`;
          ctx.fill();
        }
      }

      /* spawn particles roughly matching text outline */
      for (let i=0;i<60;i++) {
        particles2.push(new DustP(rng(rect.left,rect.right)-rect.left, rng(rect.top,rect.bottom)-rect.top));
      }

      Object.assign(canvas.style, { position:'absolute',top:'0',left:'0', pointerEvents:'none' });
      canvas.width = rect.width; canvas.height = rect.height;
      el.appendChild(canvas);

      setTimeout(() => {
        function frame(ts) {
          if (!startTime2) startTime2 = ts;
          const prog = Math.min((ts-startTime2)/duration, 1);
          ctx2.clearRect(0,0,rect.width,rect.height);
          particles2.forEach(p => { p.update(prog); p.draw(ctx2); });
          if (prog < 1) raf(frame);
          else {
            canvas.remove();
            el.textContent = original;
            el.style.textShadow = `0 0 8px ${color}`;
          }
        }
        raf(frame);
      }, delay);
    },

    /* 11. Holographic Scanline Reveal */
    holographicScanlineReveal(el, opts={}) {
      const { duration=900, delay=0, color=C.cyan } = opts;
      el.style.clipPath = 'inset(0 0 100% 0)';
      el.style.opacity = '0.5';
      el.style.filter = `blur(2px) drop-shadow(0 0 8px ${color})`;
      el.style.transition = `clip-path ${duration}ms ${delay}ms linear, opacity ${duration*0.5}ms ${delay}ms, filter ${duration*0.5}ms ${delay+duration*0.5}ms`;
      setTimeout(() => {
        el.style.clipPath = 'inset(0 0 0% 0)';
        el.style.opacity = '1';
        el.style.filter = `blur(0) drop-shadow(0 0 4px ${color})`;
      }, delay + 20);
    },

    /* 12. Solar Flare Sweep */
    solarFlareSweep(el, opts={}) {
      const { duration=800, delay=0, color=C.cyan } = opts;
      el.style.opacity = '0';

      const flare = document.createElement('span');
      Object.assign(flare.style, {
        position:'absolute', top:'0', left:'-60px', width:'60px', height:'100%',
        background:`linear-gradient(90deg,transparent,${color},transparent)`,
        pointerEvents:'none',
        transition: `left ${duration}ms ${delay}ms ease-in`,
      });
      const parent = el.parentElement;
      if (parent) parent.style.position='relative';
      el.style.position='relative';
      el.appendChild(flare);

      setTimeout(() => {
        el.style.opacity = '1';
        el.style.textShadow = `0 0 10px ${color}`;
        setTimeout(() => {
          flare.style.left = '120%';
          setTimeout(() => flare.remove(), duration);
        }, delay + 50);
      }, delay);
    },

    /* 13. Time-Slice Stagger */
    timeSliceStagger(el, opts={}) {
      const { duration=700, delay=0, stagger=120 } = opts;
      const words = el.textContent.split(' ');
      el.innerHTML = '';
      words.forEach((w,i) => {
        const sp = document.createElement('span');
        sp.textContent = (i>0?' ':'')+w;
        sp.style.display = 'inline-block';
        sp.style.opacity = '0';
        sp.style.transform = 'translateY(20px)';
        sp.style.transition = `opacity ${duration}ms ${delay+i*stagger}ms, transform ${duration}ms ${delay+i*stagger}ms cubic-bezier(.2,1,.4,1)`;
        el.appendChild(sp);
      });
      requestAnimationFrame(() => {
        el.querySelectorAll('span').forEach(s => { s.style.opacity='1'; s.style.transform='translateY(0)'; });
      });
    },

    /* 14. Crystal Shatter Intro */
    crystalShatterIntro(el, opts={}) {
      const { duration=1100, delay=0, color=C.cyan } = opts;
      const spans = splitToSpans(el);
      spans.forEach((s,i) => {
        const angle = rng(-60,60);
        const dist = rng(20,80);
        s.style.opacity = '0';
        s.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) rotate(${angle*0.5}deg) scale(1.5)`;
        s.style.filter = `blur(3px)`;
        s.style.color = color;
        s.style.transition = `opacity ${duration*0.5}ms ${delay+i*30}ms, transform ${duration}ms ${delay+i*30}ms cubic-bezier(.1,1.4,.3,1), filter ${duration*0.5}ms ${delay+i*30}ms`;
      });
      requestAnimationFrame(() => {
        spans.forEach(s => {
          s.style.opacity='1';
          s.style.transform='translate(0,0) rotate(0deg) scale(1)';
          s.style.filter='blur(0)';
        });
      });
    },

    /* 15. Magnetic Pull-In */
    magneticPullIn(el, opts={}) {
      const { duration=900, delay=0 } = opts;
      const spans = splitToSpans(el);
      spans.forEach((s,i) => {
        const side = i < spans.length/2 ? -1 : 1;
        s.style.opacity = '0';
        s.style.transform = `translateX(${side*rng(40,120)}px)`;
        s.style.transition = `opacity ${duration*0.5}ms ${delay+Math.abs(i-spans.length/2)*25}ms, transform ${duration}ms ${delay+Math.abs(i-spans.length/2)*25}ms cubic-bezier(.1,1.3,.3,1)`;
      });
      requestAnimationFrame(() => {
        spans.forEach(s => { s.style.opacity='1'; s.style.transform='translateX(0)'; });
      });
    },
  };

  /* ── HELPER: hex to RGB ── */
  function hexToRGB(hex) {
    const h = hex.replace('#','');
    if (h.length===3) {
      return [parseInt(h[0]+h[0],16),parseInt(h[1]+h[1],16),parseInt(h[2]+h[2],16)];
    }
    return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
  }

  /* ══════════════════════════════════════════════════════════════
     PUBLIC API
     ══════════════════════════════════════════════════════════════ */
  const FX1142 = {
    texture: {
      DeepLabCarbonMesh,
      MicroLEDPixelMatrix,
      HolographicNoiseField,
      IonizedCircuitTraces,
      LabGlassRefraction,
      DataStreamFilaments,
      CryoFogVapor,
      DiagnosticScanlines,
      ParticleIonDrift,
      NanoGridOverlay,
      ThermalImagingGradient,
      CrystalRefractionBurst,
      DarkMatterLabSwirl,
      QuantumFieldRipple,
      NeonIonStorm,
      ScrollDataSweep,
      PressurePlateGlow,
      MagneticAlignmentGrid,
      ReactorCorePulse,
      CosmicDebrisConveyor,
    },
    text: TextFX,

    /** Auto-init the standard site-wide layer stack */
    init(opts={}) {
      const {
        background  = true,
        midground   = true,
        foreground  = true,
        interactive = true,
      } = opts;

      if (background) {
        DeepLabCarbonMesh.mount(document.body, { variant:'Carbon Black', density:'low' });
      }
      if (midground) {
        DataStreamFilaments.mount(document.body, { opacity:0.5, count:8 });
        CryoFogVapor.mount(document.body, { opacity:0.3 });
      }
      if (foreground) {
        DiagnosticScanlines.mount(document.body, { opacity:0.4 });
        ParticleIonDrift.mount(document.body, { opacity:0.5, count:50 });
      }
      if (interactive) {
        LabGlassRefraction.mount(document.body, { opacity:0.3 });
        PressurePlateGlow.mount(document.body, { opacity:0.5 });
      }
    },

    /** Destroy everything this system attached */
    destroy() {
      _rafHandles.forEach((h,k) => { cancelAnimationFrame(h); });
      _rafHandles.clear();
      _listeners.forEach(({el,ev,fn}) => el.removeEventListener(ev,fn));
      _listeners.length = 0;
      _mountedEls.forEach(el => el.remove());
      _mountedEls.clear();
    },

    /** Convenience: run a text animation by name */
    animate(elOrSelector, effectName, opts={}) {
      const el = typeof elOrSelector==='string' ? document.querySelector(elOrSelector) : elOrSelector;
      if (!el || !TextFX[effectName]) return;
      TextFX[effectName](el, opts);
    },

    /** colors exposed for external use */
    colors: C,
  };

  global.FXMega = FX1142;

})(typeof window !== 'undefined' ? window : this);
