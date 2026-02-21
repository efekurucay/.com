'use client';

import React, { useRef, useEffect } from 'react';

interface Point {
    x: number;
    y: number;
}

interface NodePoint extends Point {
    width: number;
    height: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

interface NeuralNetworkCanvasProps {
    cardRefs: React.RefObject<HTMLDivElement>[];
    containerRef: React.RefObject<HTMLDivElement>;
}

const NeuralNetworkCanvas: React.FC<NeuralNetworkCanvasProps> = ({ cardRefs, containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let points: NodePoint[] = [];
    let particles: Particle[] = [];

    const initCanvas = () => {
        if (!containerRef.current || !canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const containerRect = containerRef.current!.getBoundingClientRect();
        canvas.width = containerRect.width * dpr;
        canvas.height = containerRect.height * dpr;
        canvas.style.width = `${containerRect.width}px`;
        canvas.style.height = `${containerRect.height}px`;
        ctx.scale(dpr, dpr);

        points = cardRefs
            .map(ref => {
                if (ref.current) {
                    const rect = ref.current.getBoundingClientRect();
                    return {
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top + rect.height / 2,
                        width: rect.width,
                        height: rect.height,
                    };
                }
                return null;
            })
            .filter((p): p is NodePoint => p !== null);
    }
    
    const getEdgePoint = (sourceNode: NodePoint, targetNode: NodePoint) => {
        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
    
        const halfWidth = sourceNode.width / 2;
        const halfHeight = sourceNode.height / 2;
    
        if (dx === 0 && dy === 0) return { x: sourceNode.x, y: sourceNode.y };

        let t = Infinity;
        if (dx !== 0) t = Math.min(t, Math.abs(halfWidth / dx));
        if (dy !== 0) t = Math.min(t, Math.abs(halfHeight / dy));
    
        return {
            x: sourceNode.x + dx * t,
            y: sourceNode.y + dy * t,
        };
    };

    const createParticles = () => {
        if (points.length < 2) return;
        for (let i = 0; i < 5; i++) { 
             const startNode = points[Math.floor(Math.random() * points.length)];
             const endNode = points[Math.floor(Math.random() * points.length)];
             if(startNode === endNode) continue;

             const startPoint = getEdgePoint(startNode, endNode);
             const endPoint = getEdgePoint(endNode, startNode);
             const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
             const speed = Math.random() * 0.5 + 0.2;
             const distance = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);


             particles.push({
                 x: startPoint.x,
                 y: startPoint.y,
                 vx: Math.cos(angle) * speed,
                 vy: Math.sin(angle) * speed,
                 life: distance / speed,
             });
        }
    }

    const animate = () => {
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Draw lines
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.1)';
      ctx.lineWidth = 0.5;
      if (points.length > 1) {
          for (let i = 0; i < points.length; i++) {
              for (let j = i + 1; j < points.length; j++) {
                  const startPoint = getEdgePoint(points[i], points[j]);
                  const endPoint = getEdgePoint(points[j], points[i]);
                  ctx.beginPath();
                  ctx.moveTo(startPoint.x, startPoint.y);
                  ctx.lineTo(endPoint.x, endPoint.y);
                  ctx.stroke();
              }
          }
      }

      // Draw and update particles
      particles.forEach((p, index) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;

          if (p.life <= 0) {
              particles.splice(index, 1);
          } else {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 190, 255, 0.5)`;
              ctx.fill();
          }
      });
      
      if(particles.length < 20) {
          createParticles();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    }

    const init = () => {
        initCanvas();
        animate();
    }

    // Wait a bit for the layout to be stable before initializing
    const timeoutId = setTimeout(init, 300);

    const handleResize = () => {
        initCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
    }
  }, [cardRefs, containerRef]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

export default NeuralNetworkCanvas; 