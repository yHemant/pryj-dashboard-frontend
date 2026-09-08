import React, { useEffect, useRef, useState } from 'react';

export default function RailwaySideLeft() {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(118);
  const [signalState, setSignalState] = useState(0); // 0: green, 1: double yellow, 2: green

  // Cycle signal lights occasionally
  useEffect(() => {
    const signalInterval = setInterval(() => {
      setSignalState((prev) => (prev === 0 ? 1 : 0));
    }, 6000);

    // Subtle realistic locomotive speed oscillation
    const speedInterval = setInterval(() => {
      setSpeed((prev) => {
        const delta = (Math.random() - 0.48) * 3;
        return Math.min(130, Math.max(105, Math.round(prev + delta)));
      });
    }, 1500);

    return () => {
      clearInterval(signalInterval);
      clearInterval(speedInterval);
    };
  }, []);

  // Vertical 3D Railway Track with animated train pulses
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = 70);
    const height = (canvas.height = 320);

    let offset = 0;
    const trackSpeed = 2.2;
    const sleeperSpacing = 16;

    // Moving train light pulses
    const pulses = [
      { y: 0, speed: 3.5, size: 5, color: '#3b82f6' },
      { y: 160, speed: 4.2, size: 6, color: '#06b6d4' }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      offset = (offset + trackSpeed) % sleeperSpacing;

      const railX1 = 20;
      const railX2 = 50;

      // Draw vertical railway sleepers (ties)
      ctx.lineWidth = 2.5;
      for (let y = -sleeperSpacing + offset; y < height + sleeperSpacing; y += sleeperSpacing) {
        // Sleepers extending beyond rails
        const alpha = 0.22 + 0.15 * Math.sin(y * 0.03);
        ctx.strokeStyle = `rgba(100, 116, 139, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(railX1 - 8, y);
        ctx.lineTo(railX2 + 8, y);
        ctx.stroke();

        // 3D sleeper depth shadow
        ctx.strokeStyle = `rgba(51, 65, 85, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(railX1 - 8, y + 1.5);
        ctx.lineTo(railX2 + 8, y + 1.5);
        ctx.stroke();
      }

      // Draw Rails with metallic gradient
      const railGrad = ctx.createLinearGradient(0, 0, 0, height);
      railGrad.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      railGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.8)');
      railGrad.addColorStop(1, 'rgba(30, 64, 175, 0.4)');

      ctx.lineWidth = 3;
      ctx.strokeStyle = railGrad;

      // Left Rail
      ctx.beginPath();
      ctx.moveTo(railX1, 0);
      ctx.lineTo(railX1, height);
      ctx.stroke();

      // Right Rail
      ctx.beginPath();
      ctx.moveTo(railX2, 0);
      ctx.lineTo(railX2, height);
      ctx.stroke();

      // Moving High-Speed Locomotive Electric Pulses
      pulses.forEach((p) => {
        p.y += p.speed;
        if (p.y > height + 20) p.y = -20;

        const pulseGrad = ctx.createRadialGradient(railX1, p.y, 0, railX1, p.y, p.size * 3);
        pulseGrad.addColorStop(0, p.color);
        pulseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = pulseGrad;
        ctx.beginPath();
        ctx.arc(railX1, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Mirrored pulse on other rail with slight stagger
        const rightY = (p.y + 12) % height;
        const rightGrad = ctx.createRadialGradient(railX2, rightY, 0, railX2, rightY, p.size * 3);
        rightGrad.addColorStop(0, '#10b981');
        rightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = rightGrad;
        ctx.beginPath();
        ctx.arc(railX2, rightY, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <aside className="fixed left-3 2xl:left-7 top-24 bottom-6 w-20 2xl:w-28 z-20 pointer-events-none hidden xl:flex flex-col justify-between items-center select-none">
      {/* 1. Indian Railways 3-Aspect Color Light Signal Mast */}
      <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center gap-1.5 shadow-md border border-white/90">
        <span className="text-[9px] font-extrabold text-blue-700 tracking-wider">UP MAIN</span>

        {/* Signal Hood & Lamps */}
        <div className="bg-slate-900/90 rounded-full px-2 py-3 flex flex-col gap-2 items-center shadow-inner border border-slate-700">
          {/* Green Aspect */}
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${signalState === 0
              ? 'bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse'
              : 'bg-emerald-950/60 opacity-40'
              }`}
          />
          {/* Amber Aspect */}
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${signalState === 1
              ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
              : 'bg-amber-950/60 opacity-40'
              }`}
          />
          {/* Caution Aspect */}
          <div
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${signalState === 1
              ? 'bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse'
              : 'bg-amber-950/60 opacity-30'
              }`}
          />
        </div>
        <span className="text-[8px] font-semibold text-slate-500">HOME</span>
      </div>

      {/* 2. Vertical 3D Railway Track with High-Speed Kinetic Pulses */}
      <div className="relative my-auto flex flex-col items-center">
        <div className="absolute -top-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          MAIN LINE
        </div>
        <canvas
          ref={canvasRef}
          className="rounded-xl filter drop-shadow-xs"
        />
        <div className="absolute -bottom-4 flex items-center gap-1 text-[9px] font-bold text-blue-600">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
          <span>1.676m BG</span>
        </div>
      </div>

      {/* 3. WAP-7 Locomotive Tachometer / Speedometer HUD */}
      <div className="glass-card rounded-2xl p-2.5 w-full flex flex-col items-center gap-1 shadow-md border border-white/90">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">LOCO SPEED</span>

        {/* Circular Gauge */}
        <div className="relative w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center border-2 border-blue-500/50 shadow-inner">
          {/* Needle angle based on speed (100 to 140 km/h) */}
          <div
            className="absolute w-0.5 h-6 bg-rose-500 origin-bottom transition-transform duration-500 rounded-full"
            style={{
              transform: `rotate(${((speed - 60) / 100) * 180 - 90}deg)`,
              bottom: '50%'
            }}
          />
          {/* Center Pivot */}
          <div className="w-2 h-2 rounded-full bg-white z-10 shadow-xs" />

          {/* Digital Readout */}
          <div className="absolute bottom-1.5 text-center">
            <span className="text-[10px] font-extrabold text-white font-mono">{speed}</span>
          </div>
        </div>

        <span className="text-[8px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
          km/h • WAP-7
        </span>
      </div>
    </aside>
  );
}
