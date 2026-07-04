import React, { useEffect, useRef } from "react";

const WeatherEffects = ({ condition }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    const parent = canvas.parentElement;

    // Use ResizeObserver to keep canvas drawing dimensions in sync with parent dimensions
    const resizeObserver = new ResizeObserver(() => {
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    });

    if (parent) {
      resizeObserver.observe(parent);
      // Run once immediately
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }

    // Particle Classes
    class RainDrop {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // Stagger starts
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.length = 10 + Math.random() * 20;
        this.speed = 8 + Math.random() * 8;
        this.opacity = 0.2 + Math.random() * 0.4;
      }

      update() {
        this.y += this.speed;
        this.x += 1.5; // Wind angle
        if (this.y > canvas.height || this.x > canvas.width) {
          this.reset();
        }
      }

      draw() {
        ctx.strokeStyle = `rgba(174, 207, 238, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 3, this.y + this.length);
        ctx.stroke();
      }
    }

    class SnowFlake {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.size = 1.5 + Math.random() * 3.5;
        this.speed = 1 + Math.random() * 2;
        this.opacity = 0.3 + Math.random() * 0.5;
        this.swing = 0;
        this.swingSpeed = 0.01 + Math.random() * 0.02;
        this.swingRadius = 0.5 + Math.random() * 1.5;
      }

      update() {
        this.y += this.speed;
        this.swing += this.swingSpeed;
        this.x += Math.sin(this.swing) * this.swingRadius + 0.5; // fall + wind drift

        if (this.y > canvas.height || this.x > canvas.width || this.x < -10) {
          this.reset();
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class CloudParticle {
      constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
      }

      reset() {
        this.x = -150;
        this.y = Math.random() * (canvas.height * 0.7);
        this.size = 80 + Math.random() * 120;
        this.speed = 0.15 + Math.random() * 0.25;
        this.opacity = 0.05 + Math.random() * 0.08;
      }

      update() {
        this.x += this.speed;
        if (this.x > canvas.width + this.size) {
          this.reset();
        }
      }

      draw() {
        // Draw soft, blurry gradient circles for clouds
        const grad = ctx.createRadialGradient(
          this.x, this.y, this.size * 0.1,
          this.x, this.y, this.size
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class LightWave {
      constructor() {
        this.reset();
        this.radius = Math.random() * (canvas.width * 0.4);
      }

      reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.radius = 10;
        this.maxRadius = Math.max(canvas.width, canvas.height) * 0.6;
        this.speed = 0.5 + Math.random() * 0.5;
        this.opacity = 0.15;
      }

      update() {
        this.radius += this.speed;
        this.opacity = 0.15 * (1 - this.radius / this.maxRadius);
        if (this.radius > this.maxRadius) {
          this.reset();
        }
      }

      draw() {
        ctx.strokeStyle = `rgba(251, 191, 36, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    class WindLine {
      constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
      }

      reset() {
        this.x = -150;
        this.y = Math.random() * canvas.height;
        this.length = 80 + Math.random() * 100;
        this.speed = 3 + Math.random() * 4;
        this.opacity = 0.08 + Math.random() * 0.12;
      }

      update() {
        this.x += this.speed;
        if (this.x > canvas.width) {
          this.reset();
        }
      }

      draw() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length, this.y);
        ctx.stroke();
      }
    }

    // Initialize Particles based on condition
    const particles = [];
    const particleCount = 60;

    const normalizedCond = condition ? condition.toLowerCase() : "";

    if (normalizedCond.includes("rain") || normalizedCond.includes("drizzle") || normalizedCond.includes("thunderstorm")) {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new RainDrop());
      }
    } else if (normalizedCond.includes("snow")) {
      for (let i = 0; i < particleCount * 0.7; i++) {
        particles.push(new SnowFlake());
      }
    } else if (normalizedCond.includes("cloud")) {
      for (let i = 0; i < 5; i++) {
        particles.push(new CloudParticle());
      }
      for (let i = 0; i < 25; i++) {
        particles.push(new RainDrop());
      }
    } else if (normalizedCond.includes("clear")) {
      for (let i = 0; i < 4; i++) {
        particles.push(new LightWave());
      }
    } else {
      // Atmospheric (Mist, Fog, Wind)
      for (let i = 0; i < 15; i++) {
        particles.push(new WindLine());
      }
    }

    let lightningTimer = 0;

    // Loop
    const drawLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render lightning effect in thunderstorms
      if (normalizedCond.includes("thunderstorm")) {
        lightningTimer++;
        if (lightningTimer > 200 && Math.random() > 0.98) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          lightningTimer = 0; // reset
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(drawLoop);
    };
    drawLoop();

    // Clean up
    return () => {
      if (parent) {
        resizeObserver.unobserve(parent);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        borderRadius: "inherit",
      }}
    />
  );
};

export default WeatherEffects;
