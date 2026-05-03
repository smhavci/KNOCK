(function () {
  const canvas = document.getElementById('scene-canvas');
  const ctx = canvas.getContext('2d');

  // ── Mountains (normalized x, y in 0..1) ──────────────────────────────────
  const MTNS_FAR = [
    [0,0.82],[0.08,0.60],[0.18,0.70],[0.28,0.50],[0.38,0.64],
    [0.50,0.52],[0.60,0.60],[0.70,0.48],[0.80,0.57],[0.90,0.52],
    [1.00,0.56],[1,1],[0,1]
  ];
  const MTNS_NEAR = [
    [0,0.88],[0.10,0.74],[0.22,0.82],[0.33,0.72],[0.44,0.79],
    [0.55,0.74],[0.60,0.76],[0.70,0.72],[0.82,0.78],[0.92,0.73],
    [1.00,0.76],[1,1],[0,1]
  ];

  // ── Grass blades ──────────────────────────────────────────────────────────
  let bladesBack = [], bladesFront = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function initGrass(W, H) {
    bladesBack  = [];
    bladesFront = [];
    const groundY = H * 0.875;

    // back layer — shorter, lighter
    for (let i = 0; i < 420; i++) {
      bladesBack.push({
        x:     rnd(0, W),
        baseY: groundY + rnd(0, H * 0.04),
        h:     rnd(H * 0.03, H * 0.075),
        phase: rnd(0, Math.PI * 2),
        freq:  rnd(0.55, 1.1),
        lean:  rnd(-0.18, 0.18),
        hue:   rnd(75, 105),
        sat:   rnd(25, 42),
        lit:   rnd(14, 22),
        w:     rnd(0.7, 1.4),
      });
    }

    // front layer — taller, darker
    for (let i = 0; i < 320; i++) {
      bladesFront.push({
        x:     rnd(0, W),
        baseY: groundY + rnd(H * 0.02, H * 0.06),
        h:     rnd(H * 0.055, H * 0.11),
        phase: rnd(0, Math.PI * 2),
        freq:  rnd(0.45, 0.9),
        lean:  rnd(-0.22, 0.22),
        hue:   rnd(72, 98),
        sat:   rnd(28, 45),
        lit:   rnd(10, 18),
        w:     rnd(1.0, 2.0),
      });
    }
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    initGrass(canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // ── Draw helpers ─────────────────────────────────────────────────────────
  function drawPoly(pts, W, H, color) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0] * W, pts[0][1] * H);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * W, pts[i][1] * H);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawGrassLayer(blades, wind, t) {
    for (const b of blades) {
      const sway = Math.sin(t * b.freq * 0.001 + b.phase) * 0.14
                 + wind * 0.10;
      const angle  = sway + b.lean;
      const tipX   = b.x   + Math.sin(angle) * b.h;
      const tipY   = b.baseY - Math.cos(angle) * b.h;
      const cpX    = b.x   + Math.sin(angle * 0.55) * b.h * 0.52;
      const cpY    = b.baseY - Math.cos(angle * 0.55) * b.h * 0.52;

      ctx.beginPath();
      ctx.moveTo(b.x, b.baseY);
      ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
      ctx.strokeStyle = `hsl(${b.hue},${b.sat}%,${b.lit}%)`;
      ctx.lineWidth   = b.w;
      ctx.stroke();
    }
  }

  // ── Silhouette helpers ───────────────────────────────────────────────────
  function girlBase(runPhase) {
    ctx.fillStyle   = '#180d08';
    ctx.strokeStyle = '#180d08';
    ctx.lineWidth   = 2.4;
    ctx.lineCap     = 'round';

    // head
    ctx.beginPath();
    ctx.arc(0, -20, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // hair
    ctx.beginPath();
    ctx.arc(-4, -24, 3.2, Math.PI, Math.PI * 2);
    ctx.fill();

    // dress
    ctx.beginPath();
    ctx.moveTo(-1.5, -14);
    ctx.lineTo(-8, 1);
    ctx.lineTo(8, 1);
    ctx.lineTo(1.5, -14);
    ctx.closePath();
    ctx.fill();

    // running legs
    const sw = Math.sin(runPhase) * 8;
    ctx.beginPath();
    ctx.moveTo(0, 1); ctx.lineTo(sw * 0.6, 10); ctx.lineTo(sw, 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 1); ctx.lineTo(-sw * 0.6, 10); ctx.lineTo(-sw, 18);
    ctx.stroke();
  }

  // Girl 1: arm raised up holding kite string
  function drawGirl1(x, y, sc, runPhase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    girlBase(runPhase);
    ctx.beginPath();
    ctx.moveTo(3, -11); ctx.lineTo(12, -23);
    ctx.stroke();
    ctx.restore();
  }

  // Girl 2: arm reaching forward (chasing)
  function drawGirl2(x, y, sc, runPhase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    girlBase(runPhase);
    // arm reaching forward to the right
    ctx.beginPath();
    ctx.moveTo(2, -11); ctx.lineTo(14, -15);
    ctx.stroke();
    ctx.restore();
  }

  // ── Kite ─────────────────────────────────────────────────────────────────
  function drawKite(kx, ky, t) {
    const rot = Math.sin(t * 0.0007) * 0.12;

    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(rot);

    const kw = 14, kh = 22;

    // body
    ctx.beginPath();
    ctx.moveTo(0, -kh);
    ctx.lineTo(kw, 0);
    ctx.lineTo(0, kh * 0.65);
    ctx.lineTo(-kw, 0);
    ctx.closePath();

    const g = ctx.createLinearGradient(-kw, -kh, kw, kh);
    g.addColorStop(0,   '#7a3a0e');
    g.addColorStop(0.5, '#c47018');
    g.addColorStop(1,   '#5a2a08');
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.82;
    ctx.fill();
    ctx.globalAlpha = 1;

    // cross frame
    ctx.strokeStyle = 'rgba(30,12,4,0.55)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-kw, 0); ctx.lineTo(kw, 0);
    ctx.moveTo(0, -kh); ctx.lineTo(0, kh * 0.65);
    ctx.stroke();

    // tail
    const ts = Math.sin(t * 0.0015) * 7;
    ctx.beginPath();
    ctx.moveTo(0, kh * 0.65);
    ctx.quadraticCurveTo(ts, kh * 0.65 + 14, ts * 0.4, kh * 0.65 + 26);
    ctx.strokeStyle = 'rgba(120,65,18,0.55)';
    ctx.lineWidth   = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // ── Scene state ───────────────────────────────────────────────────────────
  let g1x = null, lastT = null;
  const GAP = 0.13; // girl 2 trails girl 1 by 13% of screen width

  function draw(t) {
    const W = canvas.width;
    const H = canvas.height;

    // init positions on first frame
    if (g1x === null) g1x = W * 0.40;
    if (lastT === null) lastT = t;
    const dt = Math.min(t - lastT, 50);
    lastT = t;

    // move right — full crossing in ~24 seconds
    g1x += (W / 24000) * dt;
    if (g1x > W + 120) g1x = -120;

    const g2x = g1x - W * GAP;

    ctx.clearRect(0, 0, W, H);

    // ── Sky gradient (warm golden hour)
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,    '#1a0f2e');
    sky.addColorStop(0.22, '#3d1a3a');
    sky.addColorStop(0.50, '#8b3a18');
    sky.addColorStop(0.72, '#c85f14');
    sky.addColorStop(0.88, '#e07c1a');
    sky.addColorStop(1,    '#e89030');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // ── Warm haze near horizon
    const haze = ctx.createLinearGradient(0, H * 0.6, 0, H);
    haze.addColorStop(0, 'rgba(220,130,40,0)');
    haze.addColorStop(1, 'rgba(220,130,40,0.18)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, W, H);

    // ── Sun glow
    const sunX = W * 0.60, sunY = H * 0.77;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.42);
    glow.addColorStop(0,   'rgba(255,180,60,0.70)');
    glow.addColorStop(0.3, 'rgba(230,120,20,0.35)');
    glow.addColorStop(0.7, 'rgba(180,70,10,0.12)');
    glow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ── Sun disc
    ctx.beginPath();
    ctx.arc(sunX, sunY, W * 0.048, 0, Math.PI * 2);
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.048);
    sunGrad.addColorStop(0,   '#fff0a0');
    sunGrad.addColorStop(0.4, '#f0b030');
    sunGrad.addColorStop(1,   '#d07010');
    ctx.fillStyle = sunGrad;
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;

    // ── Mountains
    drawPoly(MTNS_FAR,  W, H, '#2a1208');
    drawPoly(MTNS_NEAR, W, H, '#1a0b05');

    // ── Ground
    ctx.fillStyle = '#140e06';
    ctx.fillRect(0, H * 0.875, W, H * 0.125);

    // ── Wind
    const wind = Math.sin(t * 0.00055) * 0.7 + Math.sin(t * 0.00091 + 1.3) * 0.3;

    // ── Back grass
    drawGrassLayer(bladesBack, wind, t);

    // ── Girls & kite
    const groundY = H * 0.875;
    const sc      = H * 0.0036;   // ~120px tall on 900px screen

    const run1 = t * 0.0045;
    const run2 = t * 0.0045 + Math.PI;

    // kite: ahead and above girl 1 (she's running right, kite flies in front)
    const kiteX = g1x + W * 0.08 + Math.sin(t * 0.00065) * W * 0.015;
    const kiteY = groundY - H * 0.38 + Math.sin(t * 0.00090 + 0.5) * H * 0.013;

    // string: from girl 1's raised arm tip to kite bottom
    const armTipX = g1x + sc * 12;
    const armTipY = groundY - sc * 23;
    ctx.beginPath();
    ctx.moveTo(armTipX, armTipY);
    ctx.quadraticCurveTo(
      (armTipX + kiteX) * 0.5,
      (armTipY + kiteY) * 0.5 + H * 0.05,
      kiteX, kiteY + 22
    );
    ctx.strokeStyle = 'rgba(80,48,20,0.55)';
    ctx.lineWidth   = 1.1;
    ctx.stroke();

    drawKite(kiteX, kiteY, t);
    drawGirl1(g1x, groundY, sc, run1);
    drawGirl2(g2x, groundY, sc, run2);

    // ── Front grass (in front of figures)
    drawGrassLayer(bladesFront, wind, t);

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
