import React, { useEffect, useRef, useState } from 'react';
import type { CursorStyle } from '../types';

interface CustomCursorProps {
  styleType: CursorStyle;
  trailEnabled: boolean;
}

interface TrailDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ styleType, trailEnabled }) => {
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isHoveringSnake, setIsHoveringSnake] = useState(false);

  // Toggle global cursor: none class when custom cursor is active
  useEffect(() => {
    const root = document.documentElement;
    if (styleType !== 'system') {
      root.classList.add('custom-cursor-active');
    } else {
      root.classList.remove('custom-cursor-active');
    }
    return () => root.classList.remove('custom-cursor-active');
  }, [styleType]);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let lastTrailX = -100;
    let lastTrailY = -100;

    const dots: TrailDot[] = [];
    const palette = ['#FFD43B', '#5AA9E6', '#3776AB', '#FFE873'];

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Instant zero-lag transform for main pointer
      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check hover target
      const target = e.target as HTMLElement | null;
      if (target) {
        const onSnake = Boolean(target.closest('[data-snake-interactive="true"]'));
        setIsHoveringSnake(onSnake);
        const onBtn = Boolean(
          onSnake ||
            target.closest('button, a, input, textarea, select, [role="button"], [role="switch"]')
        );
        setIsHoveringClickable(onBtn);
      }

      // Spawn trail particles
      if (trailEnabled) {
        const dist = Math.hypot(mouseX - lastTrailX, mouseY - lastTrailY);
        if (dist > 10) {
          lastTrailX = mouseX;
          lastTrailY = mouseY;
          dots.push({
            x: mouseX,
            y: mouseY,
            vx: (Math.random() - 0.5) * 1.1,
            vy: (Math.random() - 0.5) * 1.1 - 0.4,
            size: styleType === 'wand' ? 5.5 : 4.2,
            alpha: 0.95,
            color: palette[Math.floor(Math.random() * palette.length)],
          });
          if (dots.length > 36) dots.shift();
        }
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    let rafId = 0;
    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);

      // Smooth follower ring
      ringX += (mouseX - ringX) * 0.24;
      ringY += (mouseY - ringY) * 0.24;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      // Trail Canvas
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = dots.length - 1; i >= 0; i--) {
          const d = dots[i];
          d.x += d.vx;
          d.y += d.vy;
          d.alpha -= 0.035;
          d.size *= 0.96;
          if (d.alpha <= 0.02) {
            dots.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.globalAlpha = d.alpha;
          ctx.fillStyle = d.color;
          ctx.strokeStyle = '#05070c';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [styleType, trailEnabled]);

  return (
    <>
      {/* Particle Trail Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9998]"
      />

      {styleType !== 'system' && (
        <>
          {/* Smooth Follower Ring */}
          <div
            ref={ringRef}
            className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-4 -mt-4 hidden md:block"
          >
            <div
              className={`h-8 w-8 rounded-full border-2 transition-transform duration-150 ${
                isHoveringSnake
                  ? 'scale-150 border-[#FFD43B] bg-[#FFD43B]/15'
                  : isHoveringClickable
                    ? 'scale-125 border-[#5AA9E6] bg-[#3776AB]/15'
                    : 'scale-90 border-[#3776AB]/45'
              } ${isClicking ? 'scale-75 border-[#FFD43B]' : ''}`}
            />
          </div>

          {/* Zero-Lag Main 2D-Outlined Cursor SVG */}
          <div
            ref={pointerRef}
            className="pointer-events-none fixed left-0 top-0 z-[10000] hidden md:block"
          >
            <div className={`transition-transform duration-100 ${isClicking ? 'scale-85' : 'scale-100'}`}>
              {isHoveringSnake ? (
                /* Cute 2D Outlined Petting Hand when hovering the Snake! */
                <svg width="34" height="34" viewBox="0 0 36 36" className="-ml-3 -mt-3 drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)]">
                  <path
                    d="M11 21 V11 a2.2 2.2 0 0 1 4.4 0 v6 M15.4 17 V9.5 a2.2 2.2 0 0 1 4.4 0 v7.5 M19.8 17 V10.5 a2.2 2.2 0 0 1 4.4 0 v7.5 M24.2 18 V13 a2.2 2.2 0 0 1 4.2 0 v8.5 c0 5.5 -4 9 -9.2 9 c-4.5 0 -8.2 -2.8 -9.8 -7.2 l-1.8 -4.5 a2.2 2.2 0 0 1 3.8 -1.8 Z"
                    fill="#FFD43B"
                    stroke="#05070c"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Little pink heart above the petting hand */}
                  <path
                    d="M28 6 C28 4.5 29.8 3.5 31 5 C32.2 3.5 34 4.5 34 6 C34 8 31 10 31 10 C31 10 28 8 28 6 Z"
                    fill="#f43f5e"
                    stroke="#05070c"
                    strokeWidth="1.3"
                  />
                </svg>
              ) : styleType === 'python' ? (
                /* Python Blue & Gold 2D-Toon Arrow Cursor */
                <svg width="28" height="28" viewBox="0 0 32 32" className="-ml-1 -mt-1 drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]">
                  <path
                    d="M4 3 L26 13.5 L16.5 17.2 L12.5 27 Z"
                    fill="#3776AB"
                    stroke="#05070c"
                    strokeWidth="2.6"
                    strokeLinejoin="round"
                  />
                  {/* Gold Tip & Accent */}
                  <path
                    d="M4 3 L16 8.7 L10.5 15.5 Z"
                    fill="#FFD43B"
                  />
                  <path
                    d="M4 3 L26 13.5 L16.5 17.2 L12.5 27 Z"
                    fill="none"
                    stroke="#05070c"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : styleType === 'wand' ? (
                /* Magic Coding Wand / Laser Pointer */
                <svg width="30" height="30" viewBox="0 0 32 32" className="-ml-1.5 -mt-1.5 drop-shadow-[0_0_10px_rgba(255,212,59,0.65)]">
                  <line x1="7" y1="7" x2="25" y2="25" stroke="#05070c" strokeWidth="6" strokeLinecap="round" />
                  <line x1="7" y1="7" x2="25" y2="25" stroke="#3776AB" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="6.5" cy="6.5" r="5" fill="#FFD43B" stroke="#05070c" strokeWidth="2.2" />
                  <circle cx="6.5" cy="6.5" r="2" fill="#ffffff" />
                </svg>
              ) : (
                /* Retro Toon Gold Pointer */
                <svg width="28" height="28" viewBox="0 0 32 32" className="-ml-1 -mt-1 drop-shadow-[0_3px_0px_#05070c]">
                  <path
                    d="M5 4 L25 14 L16 17 L19 25 L14.5 26.8 L11.5 18.8 L5 23 Z"
                    fill="#FFD43B"
                    stroke="#05070c"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
