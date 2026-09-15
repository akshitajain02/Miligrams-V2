import React, { useEffect, useRef } from 'react';

export default function InteractiveCanvas3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates in 3D perspective space
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - width / 2) * 0.5;
      mouse.targetY = (e.clientY - height / 2) * 0.5;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Generate 3D Star/Constellation Nodes
    const particleCount = 65;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100, // 3D depth
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: i % 4 === 0 ? '#10b981' : i % 4 === 1 ? '#06b6d4' : i % 4 === 2 ? '#f59e0b' : '#a78bfa',
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    const fov = 400; // Field of view for 3D projection

    const render = () => {
      // Smooth interpolation for mouse movement
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const projected = [];

      // Update & project 3D points to 2D
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around 3D boundaries
        if (p.z <= 50) p.z = 900;
        if (p.z > 900) p.z = 50;
        if (p.x > width) p.x = -width;
        if (p.x < -width) p.x = width;
        if (p.y > height) p.y = -height;
        if (p.y < -height) p.y = height;

        // Apply 3D camera rotation with mouse
        const rotatedX = p.x - mouse.x * 0.4;
        const rotatedY = p.y - mouse.y * 0.4;

        // 3D Perspective Projection
        const scale = fov / (fov + p.z);
        const x2d = rotatedX * scale + width / 2;
        const y2d = rotatedY * scale + height / 2;
        const radius = Math.max(0.5, p.size * scale * 1.5);
        const opacity = Math.min(1, Math.max(0.05, p.alpha * scale * 1.8));

        projected.push({ x: x2d, y: y2d, radius, opacity, color: p.color, scale });

        // Draw node
        ctx.beginPath();
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity;
        ctx.fill();

        // Subtle glowing aura on nearest points
        if (scale > 0.8) {
          ctx.beginPath();
          ctx.arc(x2d, y2d, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = opacity * 0.2;
          ctx.fill();
        }
      }

      // Draw subtle connecting constellation lines between nearby points
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.strokeStyle = '#10b981';
            ctx.globalAlpha = (1 - dist / 110) * 0.15;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="interactive-canvas-background" />;
}
