
"use client"

import React, { useEffect, useRef } from 'react';

const Confetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let confetti: { x: number; y: number; size: number; speed: number; angle: number; color: string; }[] = [];
    const confettiCount = 200;
    const colors = [
      '#ff577f',
      '#ff884b',
      '#ffd384',
      '#fff9b0',
      '#3498db',
      '#2ecc71'
    ];

    const initConfetti = () => {
      for (let i = 0; i < confettiCount; i++) {
        confetti.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          size: Math.random() * 5 + 2,
          speed: Math.random() * 5 + 2,
          angle: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const drawConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confetti.forEach((piece, index) => {
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.arc(piece.x, piece.y, piece.size, 0, 2 * Math.PI);
        ctx.fill();

        piece.y += piece.speed;
        piece.x += Math.sin(piece.angle);

        if (piece.y > canvas.height) {
          confetti.splice(index, 1);
        }
      });
      if (confetti.length > 0) {
        requestAnimationFrame(drawConfetti);
      }
    };

    initConfetti();
    drawConfetti();

    const handleResize = () => {
        if(canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

export default Confetti;
