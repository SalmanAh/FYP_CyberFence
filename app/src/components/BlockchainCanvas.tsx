import { useEffect, useRef } from 'react';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

class Node {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  pulsePhase: number;
  isAnomaly: boolean;
  color: string;

  constructor(x: number, y: number, isAnomaly = false) {
    this.x = x;
    this.y = y;
    this.baseRadius = 2;
    this.radius = this.baseRadius;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.isAnomaly = isAnomaly;
    this.color = isAnomaly ? '#b8002b' : '#0090ff';
  }

  update() {
    this.pulsePhase += 0.1;
    this.radius = this.baseRadius + Math.sin(this.pulsePhase) * 1.5;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const rgb = hexToRgb(this.color);

    // Outer glow
    ctx.beginPath();
    const grad = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius * 3
    );
    grad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
    grad.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    ctx.fillStyle = grad;
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

interface Connection {
  from: Node;
  to: Node;
  dist: number;
}

export default function BlockchainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number;
    let height: number;
    const nodes: Node[] = [];
    const connections: Connection[] = [];

    function populateNetwork() {
      nodes.length = 0;
      for (let i = 0; i < 50; i++) {
        nodes.push(new Node(
          Math.random() * width,
          Math.random() * height,
          Math.random() < 0.1
        ));
      }

      connections.length = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            connections.push({ from: nodes[i], to: nodes[j], dist });
          }
        }
      }
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.scale(dpr, dpr);
      width = w;
      height = h;
      populateNetwork();
    }

    function animate(time: number) {
      if (!ctx) return;
      time *= 0.001;
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.lineWidth = 0.8;
      for (const conn of connections) {
        ctx.strokeStyle = 'rgba(0, 144, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        node.update();
        node.draw(ctx);
      }

      requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener('resize', resize);

    const animFrame = requestAnimationFrame(animate);

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      nodes.push(new Node(x, y, true));
    };
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      {/* Background map layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.15,
          backgroundImage: `url('/Map.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Network canvas layer */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />
    </>
  );
}
