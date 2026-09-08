import React, { useEffect, useRef } from 'react';

export default function RailwayBackground3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Floating chromatic light orbs positioned strategically on flanks & perimeter
    const orbs = [
      { x: width * 0.08, y: height * 0.25, r: 260, color: 'rgba(59, 130, 246, 0.12)', vx: 0.2, vy: 0.15 },
      { x: width * 0.92, y: height * 0.35, r: 280, color: 'rgba(6, 182, 212, 0.11)', vx: -0.18, vy: 0.25 },
      { x: width * 0.12, y: height * 0.75, r: 290, color: 'rgba(245, 158, 11, 0.08)', vx: 0.15, vy: -0.18 },
      { x: width * 0.88, y: height * 0.80, r: 270, color: 'rgba(99, 102, 241, 0.10)', vx: -0.2, vy: -0.15 },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting ambient light orbs for Glassmorphism refraction
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -150 || orb.x > width + 150) orb.vx *= -1;
        if (orb.y < -150 || orb.y > height + 150) orb.vy *= -1;

        const radial = ctx.createRadialGradient(orb.x, orb.y, 20, orb.x, orb.y, orb.r);
        radial.addColorStop(0, orb.color);
        radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
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
