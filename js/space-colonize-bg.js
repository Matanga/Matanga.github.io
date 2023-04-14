// Dual Living Branches — one on each side of the content
// Each branch stays in its lane (left/right margins) so content remains visible

const SpaceColonize = (() => {
  let canvas = null;
  let ctx = null;
  let animationId = null;
  let isRunning = false;

  // =====================
  // 🔧 USER TUNING
  // =====================
  const SETTINGS = {
    // Content area (center exclusion zone)
    contentWidth: 720,        // Matches your max-width + some padding

    // Attractor density (per side)
    attractorBudget: 600,     // per side
    spawnRate: 130,           // attractors/sec per side

    // Steering / motion
    stepSize: 4.8,
    speed: 0.85,
    steerStrength: 0.22,

    // When a target is considered eaten
    killDistance: 10,

    // Wander behavior
    wanderStrength: 0.9,
    wanderJitter: 0.9,

    // Mouse interactivity
    mouseAttractionRadius: 250,   // Distance within which mouse attracts
    mouseAttractionStrength: 0.35, // 0..1 - how strongly it steers toward mouse

    // Segment lifetime (seconds)
    segmentLifetime: 7.0,

    // Visuals
    lineWidth: 1.1,
    lineAlpha: 0.95,
    glow: 10,
    lineColor: null,

    // Safety
    maxSegments: 4500,        // per side
    padding: 10
  };

  // =====================
  // 🧠 STATE
  // =====================
  let w = 0, h = 0, dpr = 1;
  let lastMs = performance.now();
  let t = 0;

  // Mouse tracking for interactivity
  const mouse = {
    x: -1000,
    y: -1000,
    active: false
  };

  // Two sides: left and right
  const sides = {
    left: {
      attractors: [],
      segments: [],
      spawnCarry: 0,
      head: { x: 0, y: 0, dx: 1, dy: 0 },
      bounds: { minX: 0, maxX: 0 }
    },
    right: {
      attractors: [],
      segments: [],
      spawnCarry: 0,
      head: { x: 0, y: 0, dx: -1, dy: 0 },
      bounds: { minX: 0, maxX: 0 }
    }
  };

  // =====================
  // 🧩 HELPERS
  // =====================
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

  function normalize(x, y) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }

  function getAccentColor() {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--accent-structure').trim() || '#4CC9F0';
  }

  function resize() {
    if (!canvas) return;
    
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Calculate bounds for each side
    const contentHalf = SETTINGS.contentWidth / 2;
    const centerX = w / 2;

    sides.left.bounds = {
      minX: SETTINGS.padding,
      maxX: Math.max(SETTINGS.padding + 50, centerX - contentHalf - 10)
    };

    sides.right.bounds = {
      minX: Math.min(w - SETTINGS.padding - 50, centerX + contentHalf + 10),
      maxX: w - SETTINGS.padding
    };
  }

  function spawnAttractor(side) {
    const bounds = side.bounds;
    // Only spawn if there's actually space on this side
    if (bounds.maxX - bounds.minX < 30) return;
    
    side.attractors.push({
      x: rand(bounds.minX, bounds.maxX),
      y: rand(SETTINGS.padding, h - SETTINGS.padding)
    });
  }

  function resetSide(side, now) {
    side.attractors.length = 0;
    side.segments.length = 0;
    side.spawnCarry = 0;

    const bounds = side.bounds;
    const midX = (bounds.minX + bounds.maxX) / 2;
    
    // Only initialize if there's space
    if (bounds.maxX - bounds.minX < 30) return;

    side.head.x = rand(bounds.minX + 20, bounds.maxX - 20);
    side.head.y = rand(h * 0.3, h * 0.7);
    const d = normalize(rand(-1, 1), rand(-1, 1));
    side.head.dx = d.x;
    side.head.dy = d.y;

    // Prefill some nutrients
    const prefill = Math.min(SETTINGS.attractorBudget, 200);
    for (let i = 0; i < prefill; i++) spawnAttractor(side);

    // Initial segment
    side.segments.push({
      ax: side.head.x,
      ay: side.head.y,
      bx: side.head.x + side.head.dx * 0.001,
      by: side.head.y + side.head.dy * 0.001,
      born: now,
      ttl: SETTINGS.segmentLifetime
    });
  }

  function resetSim(now) {
    resize();
    SETTINGS.lineColor = getAccentColor();
    resetSide(sides.left, now);
    resetSide(sides.right, now);
    t = 0;
  }

  function pruneExpired(side, now) {
    let write = 0;
    for (let i = 0; i < side.segments.length; i++) {
      const s = side.segments[i];
      if (now - s.born < s.ttl) side.segments[write++] = s;
    }
    side.segments.length = write;

    if (side.segments.length > SETTINGS.maxSegments) {
      side.segments.splice(0, Math.floor(side.segments.length * 0.2));
    }
  }

  function render(now) {
    ctx.clearRect(0, 0, w, h);

    // Always read fresh accent color so it updates when user changes it
    const currentColor = getAccentColor();
    
    ctx.lineWidth = SETTINGS.lineWidth;
    ctx.strokeStyle = currentColor;
    ctx.shadowBlur = SETTINGS.glow;
    ctx.shadowColor = currentColor + "4D";

    // Render both sides
    for (const key of ['left', 'right']) {
      const side = sides[key];
      for (let i = 0; i < side.segments.length; i++) {
        const s = side.segments[i];
        const life = 1 - (now - s.born) / s.ttl;
        const a = SETTINGS.lineAlpha * clamp01(life);
        if (a <= 0) continue;

        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.moveTo(s.ax, s.ay);
        ctx.lineTo(s.bx, s.by);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  function consumeAttractorsNearHead(side) {
    const k2 = SETTINGS.killDistance * SETTINGS.killDistance;
    const head = side.head;
    let write = 0;
    for (let i = 0; i < side.attractors.length; i++) {
      const a = side.attractors[i];
      const dx = a.x - head.x;
      const dy = a.y - head.y;
      if (dx * dx + dy * dy >= k2) {
        side.attractors[write++] = a;
      }
    }
    side.attractors.length = write;
  }

  function findNearestAttractor(side) {
    if (side.attractors.length === 0) return null;
    const head = side.head;
    let best = null;
    let bestD2 = Infinity;
    for (let i = 0; i < side.attractors.length; i++) {
      const a = side.attractors[i];
      const dx = a.x - head.x;
      const dy = a.y - head.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = a;
      }
    }
    return best;
  }

  function bounceOffWalls(side) {
    const p = SETTINGS.padding;
    const head = side.head;
    const bounds = side.bounds;

    // Horizontal bounds (constrained to side)
    if (head.x < bounds.minX) { head.x = bounds.minX; head.dx = Math.abs(head.dx); }
    if (head.x > bounds.maxX) { head.x = bounds.maxX; head.dx = -Math.abs(head.dx); }
    
    // Vertical bounds (full height)
    if (head.y < p) { head.y = p; head.dy = Math.abs(head.dy); }
    if (head.y > h - p) { head.y = h - p; head.dy = -Math.abs(head.dy); }
  }

  function updateSide(side, now, dt, tOffset) {
    const bounds = side.bounds;
    // Skip if no space on this side
    if (bounds.maxX - bounds.minX < 30) return;

    // Spawn attractors
    if (side.attractors.length < SETTINGS.attractorBudget) {
      side.spawnCarry += SETTINGS.spawnRate * dt;
      const toSpawn = Math.min(SETTINGS.attractorBudget - side.attractors.length, Math.floor(side.spawnCarry));
      if (toSpawn > 0) {
        for (let i = 0; i < toSpawn; i++) spawnAttractor(side);
        side.spawnCarry -= toSpawn;
      }
    }

    pruneExpired(side, now);

    const head = side.head;
    const target = findNearestAttractor(side);

    // Wander with offset so the two sides don't move in sync
    const wx = Math.sin(((t + tOffset) * 0.013) + Math.sin((t + tOffset) * 0.007) * 2.0) * SETTINGS.wanderStrength;
    const wy = Math.cos(((t + tOffset) * 0.011) + Math.cos((t + tOffset) * 0.009) * 2.0) * SETTINGS.wanderStrength;

    let desiredX = head.dx + wx * 0.08 * SETTINGS.wanderJitter;
    let desiredY = head.dy + wy * 0.08 * SETTINGS.wanderJitter;

    // Attractor influence
    if (target) {
      const to = normalize(target.x - head.x, target.y - head.y);
      desiredX = (1 - SETTINGS.steerStrength) * desiredX + SETTINGS.steerStrength * to.x;
      desiredY = (1 - SETTINGS.steerStrength) * desiredY + SETTINGS.steerStrength * to.y;
    }

    // Mouse attraction - gentle pull when cursor is nearby
    if (mouse.active) {
      const mdx = mouse.x - head.x;
      const mdy = mouse.y - head.y;
      const mouseDist = Math.hypot(mdx, mdy);
      
      if (mouseDist < SETTINGS.mouseAttractionRadius && mouseDist > 1) {
        // Strength falls off with distance (closer = stronger)
        const falloff = 1 - (mouseDist / SETTINGS.mouseAttractionRadius);
        const strength = SETTINGS.mouseAttractionStrength * falloff * falloff; // Quadratic falloff
        
        const toMouse = normalize(mdx, mdy);
        desiredX = (1 - strength) * desiredX + strength * toMouse.x;
        desiredY = (1 - strength) * desiredY + strength * toMouse.y;
      }
    }

    const nd = normalize(desiredX, desiredY);
    head.dx = nd.x;
    head.dy = nd.y;

    const step = SETTINGS.stepSize * SETTINGS.speed * (dt * 60);
    const ax = head.x;
    const ay = head.y;
    head.x += head.dx * step;
    head.y += head.dy * step;

    bounceOffWalls(side);

    side.segments.push({ ax, ay, bx: head.x, by: head.y, born: now, ttl: SETTINGS.segmentLifetime });
    consumeAttractorsNearHead(side);
  }

  function update(now, dt) {
    updateSide(sides.left, now, dt, 0);
    updateSide(sides.right, now, dt, 500); // Offset so they don't move identically
    t++;
  }

  function animate(ms) {
    if (!isRunning) return;
    
    const now = ms * 0.001;
    const dt = Math.min(0.05, (ms - lastMs) * 0.001);
    lastMs = ms;

    update(now, dt);
    render(now);
    animationId = requestAnimationFrame(animate);
  }

  function handleResize() {
    if (isRunning) {
      resetSim(performance.now() * 0.001);
    }
  }

  function handleMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function handleMouseLeave() {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  }

  // =====================
  // 🎮 PUBLIC API
  // =====================
  
  function init() {
    canvas = document.getElementById("bg-colonize");
    if (!canvas) {
      console.warn("SpaceColonize: Canvas #bg-colonize not found");
      return false;
    }
    ctx = canvas.getContext("2d", { alpha: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return true;
  }

  function start() {
    if (!canvas && !init()) return;
    if (isRunning) return;
    
    isRunning = true;
    canvas.style.display = "block";
    lastMs = performance.now();
    resetSim(performance.now() * 0.001);
    animationId = requestAnimationFrame(animate);
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (canvas) {
      canvas.style.display = "none";
    }
  }

  function toggle() {
    if (isRunning) {
      stop();
    } else {
      start();
    }
    return isRunning;
  }

  function reset() {
    if (isRunning) {
      resetSim(performance.now() * 0.001);
    }
  }

  function isActive() {
    return isRunning;
  }

  return {
    init,
    start,
    stop,
    toggle,
    reset,
    isActive
  };
})();

// Auto-init when DOM is ready (but don't start automatically)
document.addEventListener("DOMContentLoaded", () => {
  SpaceColonize.init();
});
