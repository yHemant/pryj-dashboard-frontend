import React, { useEffect, useRef, useState } from 'react';

export default function RailwaySideRight() {
  const catenaryCanvasRef = useRef(null);
  const [wheelAngle, setWheelAngle] = useState(0);

  // Wheel rotation continuous loop
  useEffect(() => {
    let animId;
    let angle = 0;
    const rotate = () => {
      angle = (angle + 3.5) % 360;
      setWheelAngle(angle);
      animId = requestAnimationFrame(rotate);
    };
    animId = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 25kV AC Overhead Catenary Transmission Line
  useEffect(() => {
    const canvas = catenaryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = (canvas.width = 70);
    const height = (canvas.height = 300);

    let sparkY = 0;
    let sparkTimer = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;

      // Catenary Messenger Cable (curved catenary line)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 10, 0);
      ctx.quadraticCurveTo(centerX + 15, height / 2, centerX - 10, height);
      ctx.stroke();

      // Vertical Contact Wire (Direct pantograph wire)
      const wireGrad = ctx.createLinearGradient(0, 0, 0, height);
      wireGrad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      wireGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.8)');
      wireGrad.addColorStop(1, 'rgba(99, 102, 241, 0.5)');

      ctx.strokeStyle = wireGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + 8, 0);
      ctx.lineTo(centerX + 8, height);
      ctx.stroke();

      // Dropper wires connecting messenger and contact wire
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
      ctx.lineWidth = 1;
      for (let y = 20; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(centerX, y);
        ctx.lineTo(centerX + 8, y);
        ctx.stroke();
      }

      // 25kV Electric Current Surge / Spark traveling along wire
      sparkTimer += 0.035;
      sparkY = ((sparkTimer * 60) % (height + 30)) - 15;

      const sparkGrad = ctx.createRadialGradient(centerX + 8, sparkY, 0, centerX + 8, sparkY, 14);
      sparkGrad.addColorStop(0, '#67e8f9');
      sparkGrad.addColorStop(0.4, '#38bdf8');
      sparkGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = sparkGrad;
      ctx.beginPath();
      ctx.arc(centerX + 8, sparkY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Spark flecks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX + 8 + Math.sin(sparkTimer * 10) * 4, sparkY + Math.cos(sparkTimer * 8) * 3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Compute crank pin coordinates for wheel rod animation
  const rad = (wheelAngle * Math.PI) / 180;
  const crankRadius = 16;
  const crankX = 35 + crankRadius * Math.cos(rad);
  const crankY = 35 + crankRadius * Math.sin(rad);

  return (
    <aside className="fixed right-3 2xl:right-7 top-24 bottom-6 w-20 2xl:w-28 z-20 pointer-events-none hidden xl:flex flex-col justify-between items-center select-none">
      {/* 1. KAVACH Automated Train Protection Radar HUD */}
      <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center gap-1.5 shadow-md border border-white/90">
        <span className="text-[9px] font-extrabold text-emerald-700 tracking-wider">KAVACH ATP</span>
        
        {/* Radar Scanner Screen */}
        <div className="relative w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-emerald-500/40 shadow-inner">
          {/* Radar grid rings */}
          <div className="absolute inset-1 rounded-full border border-emerald-500/25" />
          <div className="absolute inset-3 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/20" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/20" />

          {/* Rotating Radar Sweep Cone */}
          <div 
            className="absolute inset-0 origin-center rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.45) 0deg, transparent 65deg)',
              transform: `rotate(${wheelAngle * 1.5}deg)`
            }}
          />

          {/* Target Track Blip */}
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-300" />
        </div>
        <span className="text-[8px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
          ALL CLEAR
        </span>
      </div>

      {/* 2. 25kV AC Traction Catenary Column */}
      <div className="relative my-auto flex flex-col items-center">
        <div className="absolute -top-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          25kV AC
        </div>
        <canvas 
          ref={catenaryCanvasRef} 
          className="rounded-xl filter drop-shadow-xs"
        />
        <div className="absolute -bottom-4 flex items-center gap-1 text-[9px] font-bold text-cyan-700">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
          <span>TRACTION</span>
        </div>
      </div>

      {/* 3. Kinetic 3D Locomotive Driving Wheel Mechanism */}
      <div className="glass-card rounded-2xl p-2.5 w-full flex flex-col items-center gap-1 shadow-md border border-white/90">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">DRIVE WHEEL</span>
        
        {/* Animated SVG Locomotive Wheel & Rod */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg width="70" height="70" viewBox="0 0 70 70">
            {/* Outer Wheel Rim */}
            <circle cx="35" cy="35" r="26" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
            <circle cx="35" cy="35" r="23" fill="#0f172a" stroke="#475569" strokeWidth="1" />

            {/* Rotating Wheel Spokes & Counterweight */}
            <g transform={`rotate(${wheelAngle} 35 35)`}>
              {/* Counterweight segment */}
              <path 
                d="M 35 35 L 53 23 A 22 22 0 0 1 53 47 Z" 
                fill="#475569" 
                opacity="0.8" 
              />
              {/* Spokes */}
              <line x1="35" y1="12" x2="35" y2="58" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="12" y1="35" x2="58" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="19" y1="19" x2="51" y2="51" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="19" y1="51" x2="51" y2="19" stroke="#94a3b8" strokeWidth="1.5" />
            </g>

            {/* Axle Center Hub */}
            <circle cx="35" cy="35" r="5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />

            {/* Driving Connecting Rod */}
            <line 
              x1={crankX} 
              y1={crankY} 
              x2="4" 
              y2="35" 
              stroke="#3b82f6" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            {/* Crank Pin */}
            <circle cx={crankX} cy={crankY} r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          </svg>
        </div>

        <span className="text-[8px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
          WAG-12 DFC
        </span>
      </div>
    </aside>
  );
}
