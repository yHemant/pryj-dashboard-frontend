import React, { useEffect, useRef } from 'react';

// Curated pastel palette - soft, modern, harmonious tones
const PASTEL_PALETTE = [
  { name: 'Sky Blue', rgb: '147, 197, 253', hex: '#93c5fd' },
  { name: 'Lavender', rgb: '196, 181, 253', hex: '#c4b5fd' },
  { name: 'Mint Green', rgb: '110, 231, 183', hex: '#6ee7b7' },
  { name: 'Warm Peach', rgb: '253, 186, 116', hex: '#fdba74' },
  { name: 'Baby Pink', rgb: '249, 168, 212', hex: '#f9a8d4' },
  { name: 'Sun Lemon', rgb: '253, 224, 71', hex: '#fde047' },
  { name: 'Aqua Cyan', rgb: '103, 232, 249', hex: '#67e8f9' },
  { name: 'Coral Blossom', rgb: '252, 165, 165', hex: '#fca5a5' },
  { name: 'Soft Lilac', rgb: '233, 213, 255', hex: '#e9d5ff' },
  { name: 'Sage Ice', rgb: '167, 243, 208', hex: '#a7f3d0' },
];

export default function RailwayBackground3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvas = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    };

    setupCanvas();

    // Mouse tracking for full-screen hover interactions
    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
      lastSpawnX: -1000,
      lastSpawnY: -1000,
    };

    // Ambient floating pastel dots distributed across the whole background
    const initDots = () => {
      const count = Math.min(140, Math.max(70, Math.floor((width * height) / 13000)));
      const items = [];
      for (let i = 0; i < count; i++) {
        const color = PASTEL_PALETTE[i % PASTEL_PALETTE.length];
        const x = Math.random() * width;
        const y = Math.random() * height;
        const baseRadius = 3 + Math.random() * 3.2; // 3px to 6.2px
        items.push({
          x,
          y,
          originX: x,
          originY: y,
          baseRadius,
          currentRadius: baseRadius,
          color,
          phase: Math.random() * Math.PI * 2,
          speed: 0.012 + Math.random() * 0.018,
          baseAlpha: 0.4 + Math.random() * 0.25,
          currentAlpha: 0.45,
          driftRadius: 12 + Math.random() * 18,
        });
      }
      return items;
    };

    let dots = initDots();

    // Stardust trail particles spawned on mouse movement
    const trailParticles = [];
    const MAX_TRAIL = 55;

    const spawnTrailParticle = (x, y) => {
      if (trailParticles.length >= MAX_TRAIL) {
        trailParticles.shift();
      }
      const color = PASTEL_PALETTE[Math.floor(Math.random() * PASTEL_PALETTE.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.4;
      trailParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.25, // gentle float
        radius: 2.8 + Math.random() * 3.5,
        color,
        alpha: 0.88,
        decay: 0.016 + Math.random() * 0.016,
      });
    };

    // Drifting chromatic ambient glow orbs for Glassmorphism depth
    const ambientOrbs = [
      { x: width * 0.08, y: height * 0.25, r: 280, color: 'rgba(147, 197, 253, 0.12)', vx: 0.15, vy: 0.12 },
      { x: width * 0.92, y: height * 0.35, r: 300, color: 'rgba(110, 231, 183, 0.10)', vx: -0.14, vy: 0.18 },
      { x: width * 0.15, y: height * 0.78, r: 290, color: 'rgba(253, 186, 116, 0.09)', vx: 0.12, vy: -0.14 },
      { x: width * 0.85, y: height * 0.82, r: 310, color: 'rgba(196, 181, 253, 0.11)', vx: -0.16, vy: -0.12 },
    ];

    const handlePointerMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Spawn pastel dots on hover displacement
      const dist = Math.hypot(mouse.x - mouse.lastSpawnX, mouse.y - mouse.lastSpawnY);
      if (dist > 14) {
        spawnTrailParticle(mouse.x, mouse.y);
        mouse.lastSpawnX = mouse.x;
        mouse.lastSpawnY = mouse.y;
      }
    };

    const handlePointerLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      setupCanvas();
      dots = initDots();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render soft drifting Glassmorphism ambient glow orbs
      ambientOrbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -150 || orb.x > width + 150) orb.vx *= -1;
        if (orb.y < -150 || orb.y > height + 150) orb.vy *= -1;

        const radial = ctx.createRadialGradient(orb.x, orb.y, 10, orb.x, orb.y, orb.r);
        radial.addColorStop(0, orb.color);
        radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Mouse Hover Spotlight Aura (subtle pastel illumination around pointer)
      if (mouse.active) {
        const aura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 190);
        aura.addColorStop(0, 'rgba(238, 242, 255, 0.45)');
        aura.addColorStop(0.4, 'rgba(254, 240, 230, 0.22)');
        aura.addColorStop(0.7, 'rgba(224, 242, 254, 0.12)');
        aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 190, 0, Math.PI * 2);
        ctx.fill();

        // Occasional idle stardust bubble when hovering
        if (Math.random() < 0.15) {
          spawnTrailParticle(
            mouse.x + (Math.random() - 0.5) * 24,
            mouse.y + (Math.random() - 0.5) * 24
          );
        }
      }

      // 3. Delicate Constellation Connection Lines near cursor
      if (mouse.active) {
        const maxLineDist = 95;
        for (let i = 0; i < dots.length; i++) {
          const d1 = dots[i];
          const dist1 = Math.hypot(d1.x - mouse.x, d1.y - mouse.y);
          if (dist1 > 190) continue;

          for (let j = i + 1; j < dots.length; j++) {
            const d2 = dots[j];
            const dist2 = Math.hypot(d2.x - mouse.x, d2.y - mouse.y);
            if (dist2 > 190) continue;

            const d = Math.hypot(d1.x - d2.x, d1.y - d2.y);
            if (d < maxLineDist) {
              const lineAlpha = (1 - d / maxLineDist) * 0.25;
              ctx.strokeStyle = `rgba(180, 195, 240, ${lineAlpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(d1.x, d1.y);
              ctx.lineTo(d2.x, d2.y);
              ctx.stroke();
            }
          }
        }
      }

      // 4. Update & Render Ambient Pastel Multicolor Dots
      dots.forEach((dot) => {
        dot.phase += dot.speed;

        // Base harmonic floating trajectory
        const floatX = dot.originX + Math.sin(dot.phase) * dot.driftRadius;
        const floatY = dot.originY + Math.cos(dot.phase * 0.85) * dot.driftRadius;

        let targetX = floatX;
        let targetY = floatY;
        let targetRadius = dot.baseRadius;
        let targetAlpha = dot.baseAlpha;

        // Hover repulsion & magnification physics
        if (mouse.active) {
          const dx = dot.x - mouse.x;
          const dy = dot.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const hoverZone = 160;

          if (dist < hoverZone && dist > 0.1) {
            const force = (hoverZone - dist) / hoverZone; // 0 to 1
            const angle = Math.atan2(dy, dx);
            const pushDist = force * 42;

            targetX = floatX + Math.cos(angle) * pushDist;
            targetY = floatY + Math.sin(angle) * pushDist;

            // Enlarge and illuminate
            targetRadius = dot.baseRadius * (1 + force * 1.4);
            targetAlpha = Math.min(0.95, dot.baseAlpha + force * 0.45);
          }
        }

        // Smooth spring easing
        dot.x += (targetX - dot.x) * 0.09;
        dot.y += (targetY - dot.y) * 0.09;
        dot.currentRadius += (targetRadius - dot.currentRadius) * 0.14;
        dot.currentAlpha += (targetAlpha - dot.currentAlpha) * 0.14;

        // Soft pastel glow halo
        if (dot.currentRadius > dot.baseRadius * 1.08) {
          const glowRadius = dot.currentRadius * 2.8;
          const halo = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, glowRadius);
          halo.addColorStop(0, `rgba(${dot.color.rgb}, ${dot.currentAlpha * 0.55})`);
          halo.addColorStop(1, `rgba(${dot.color.rgb}, 0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Core pastel dot
        ctx.fillStyle = `rgba(${dot.color.rgb}, ${dot.currentAlpha})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 5. Update & Render Stardust Trail Particles (spawning from cursor)
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.radius *= 0.985;

        if (p.alpha <= 0 || p.radius <= 0.6) {
          trailParticles.splice(i, 1);
          continue;
        }

        // Particle soft aura
        const pGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.2);
        pGlow.addColorStop(0, `rgba(${p.color.rgb}, ${p.alpha * 0.5})`);
        pGlow.addColorStop(1, `rgba(${p.color.rgb}, 0)`);
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Particle core
        ctx.fillStyle = `rgba(${p.color.rgb}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #eff6ff 100%)',
      }}
    />
  );
}
