import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  BedDouble, 
  KeyRound, 
  Calendar, 
  Compass, 
  Sliders, 
  ArrowDown, 
  Radio, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Reservation } from '../types';

interface CanvasScrollAnimationProps {
  onOpenBookingModal: () => void;
  onQuickBackendSync: (action: string, endpoint: string) => void;
  onExitToDashboard: () => void;
}

const TOTAL_FRAMES = 90;

export const CanvasScrollAnimation: React.FC<CanvasScrollAnimationProps> = ({
  onOpenBookingModal,
  onQuickBackendSync,
  onExitToDashboard,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingAutoScrub, setIsPlayingAutoScrub] = useState(false);
  const autoPlayRef = useRef<number | null>(null);

  // Smooth lerp state for fluid scrubbing
  const targetFrameRef = useRef(0);
  const displayedFrameRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Render a specific frame on the canvas
  const renderFrame = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
    const t = frame / (TOTAL_FRAMES - 1); // 0.0 to 1.0

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Cinematic Sky Background with day-to-sunset-to-twilight transition
    // Interpolate sky colors based on scroll percentage t
    let skyTop: string;
    let skyBottom: string;
    let sunY = height * (0.35 + t * 0.3); // Sun sinks lower
    let sunOpacity = Math.max(0, 1 - t * 0.85);

    if (t < 0.4) {
      // Golden hour afternoon
      skyTop = '#0f172a';
      skyBottom = '#b45309';
    } else if (t < 0.75) {
      // Vivid sunset
      skyTop = '#1e1b4b';
      skyBottom = '#ea580c';
    } else {
      // Deep twilight with amber glow
      skyTop = '#090d16';
      skyBottom = '#7c2d12';
    }

    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(1, skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.65);

    // Sun / Warm Horizon Glow
    if (sunOpacity > 0.05) {
      const sunGrad = ctx.createRadialGradient(
        width * 0.5, sunY, 5,
        width * 0.5, sunY, width * 0.35
      );
      sunGrad.addColorStop(0, `rgba(254, 240, 138, ${0.9 * sunOpacity})`);
      sunGrad.addColorStop(0.3, `rgba(245, 158, 11, ${0.6 * sunOpacity})`);
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, sunY, width * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars visible at late scrub (t > 0.7)
    if (t > 0.65) {
      const starAlpha = (t - 0.65) / 0.35;
      ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * 0.75})`;
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 99 + 1) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33 + 1) * 0.5 + 0.5) * height * 0.4;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }
    }

    // 2. Ocean Horizon & Calm Water Reflections
    const horizonY = height * 0.52;
    const oceanGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    oceanGrad.addColorStop(0, t < 0.6 ? '#1e3a5f' : '#0f172a');
    oceanGrad.addColorStop(1, '#030712');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Sun reflection streaks on water
    const reflectionAlpha = Math.max(0.1, 0.6 - t * 0.4);
    ctx.fillStyle = `rgba(251, 191, 36, ${reflectionAlpha})`;
    for (let i = 0; i < 7; i++) {
      const rw = width * (0.08 + i * 0.03);
      const ry = horizonY + (i + 1) * (height * 0.03);
      ctx.fillRect(width * 0.5 - rw / 2, ry, rw, 1.5);
    }

    // 3. Perspective 3D Architectural Suite Room Camera Dolly
    // The camera moves smoothly forward through the suite as t increases from 0 to 1
    const zoom = 1 + t * 0.75; // camera dolly in
    const panY = (t - 0.5) * height * 0.08;

    ctx.save();
    ctx.translate(width / 2, height / 2 + panY);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // Floor - Luxury Polished Calacatta Gold Marble with grid perspective
    const floorY = height * 0.58;
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
    floorGrad.addColorStop(0, '#111827');
    floorGrad.addColorStop(0.4, '#1f2937');
    floorGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(-width * 0.5, floorY, width * 2, height);

    // Floor perspective seams
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.15)';
    ctx.lineWidth = 1;
    for (let x = -width * 0.5; x <= width * 1.5; x += width * 0.15) {
      ctx.beginPath();
      ctx.moveTo(width * 0.5, floorY);
      ctx.lineTo(x, height * 1.3);
      ctx.stroke();
    }

    // Floor horizontal tile lines
    for (let r = 0; r < 5; r++) {
      const lineY = floorY + Math.pow(r / 4, 1.8) * (height - floorY);
      ctx.beginPath();
      ctx.moveTo(-width * 0.2, lineY);
      ctx.lineTo(width * 1.2, lineY);
      ctx.stroke();
    }

    // Left Luxury Column & Wall
    const colWidth = width * 0.16;
    const leftColGrad = ctx.createLinearGradient(0, 0, colWidth, 0);
    leftColGrad.addColorStop(0, '#090d16');
    leftColGrad.addColorStop(0.7, '#1e293b');
    leftColGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = leftColGrad;
    ctx.fillRect(0, 0, colWidth, height);

    // Wall Sconce Light Glow (Left)
    const sconceY = height * 0.42;
    const sconceGrad = ctx.createRadialGradient(colWidth * 0.6, sconceY, 4, colWidth * 0.6, sconceY, 65);
    sconceGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    sconceGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.3)');
    sconceGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = sconceGrad;
    ctx.beginPath();
    ctx.arc(colWidth * 0.6, sconceY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Sconce Fixture
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(colWidth * 0.55, sconceY - 12, 6, 24);

    // Right Luxury Wall & Smart Mirror
    const rightWallX = width * (1 - 0.16);
    const rightColGrad = ctx.createLinearGradient(rightWallX, 0, width, 0);
    rightColGrad.addColorStop(0, '#0f172a');
    rightColGrad.addColorStop(0.3, '#1e293b');
    rightColGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = rightColGrad;
    ctx.fillRect(rightWallX, 0, width * 0.16, height);

    // Right Sconce Light Glow
    const rightSconceGrad = ctx.createRadialGradient(rightWallX + colWidth * 0.4, sconceY, 4, rightWallX + colWidth * 0.4, sconceY, 65);
    rightSconceGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    rightSconceGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.3)');
    rightSconceGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
    ctx.fillStyle = rightSconceGrad;
    ctx.beginPath();
    ctx.arc(rightWallX + colWidth * 0.4, sconceY, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(rightWallX + colWidth * 0.35, sconceY - 12, 6, 24);

    // Ceiling & Coffered Architectural Beams
    const ceilHeight = height * 0.22;
    const ceilGrad = ctx.createLinearGradient(0, 0, 0, ceilHeight);
    ceilGrad.addColorStop(0, '#020617');
    ceilGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = ceilGrad;
    ctx.fillRect(-width * 0.2, 0, width * 1.4, ceilHeight);

    // Recessed cove LED lighting line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(colWidth, ceilHeight);
    ctx.lineTo(rightWallX, ceilHeight);
    ctx.stroke();

    // Chandelier Pendant in center
    const chX = width * 0.5;
    const chY = ceilHeight + 35;
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chX, 0);
    ctx.lineTo(chX, chY);
    ctx.stroke();

    // Chandelier crystal rings
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.beginPath();
    ctx.ellipse(chX, chY, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.beginPath();
    ctx.ellipse(chX, chY + 12, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floor-to-Ceiling Panoramic Glass Aperture Framing
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.strokeRect(colWidth, ceilHeight, rightWallX - colWidth, floorY - ceilHeight);

    // Center glass mullion
    ctx.beginPath();
    ctx.moveTo(width * 0.5, ceilHeight);
    ctx.lineTo(width * 0.5, floorY);
    ctx.stroke();

    // Balcony Railing with Glass & Chrome Stanchions
    const railY = floorY - 22;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(colWidth, railY);
    ctx.lineTo(rightWallX, railY);
    ctx.stroke();

    // Stanchions
    for (let st = colWidth + 50; st < rightWallX; st += (rightWallX - colWidth) / 6) {
      ctx.beginPath();
      ctx.moveTo(st, railY);
      ctx.lineTo(st, floorY);
      ctx.stroke();
    }

    // 4. Center Foreground Suite Interior Furniture Elements:
    // King Designer Daybed / Lounge Suite appearing at bottom center
    const bedWidth = width * 0.45;
    const bedHeight = height * 0.24;
    const bedX = width * 0.5 - bedWidth / 2;
    const bedY = height * 0.68 + (1 - t) * (height * 0.08); // Bed moves forward as camera dollys

    // Bed shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, bedY + bedHeight * 0.9, bedWidth * 0.52, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bed base (dark walnut)
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(bedX, bedY, bedWidth, bedHeight * 0.65);

    // Mattress & Italian Crisp White Linen
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(bedX + 8, bedY - 14, bedWidth - 16, bedHeight * 0.55, [12, 12, 4, 4]);
    ctx.fill();

    // Luxury Cashmere Throw (Gold/Amber accent)
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(bedX + bedWidth * 0.25, bedY + 12, bedWidth * 0.5, bedHeight * 0.28, 4);
    ctx.fill();

    // Pillows
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(bedX + 24, bedY - 26, bedWidth * 0.3, 18);
    ctx.fillRect(bedX + bedWidth - bedWidth * 0.3 - 24, bedY - 26, bedWidth * 0.3, 18);

    // Champagne Flute on bedside stand (left side of bed)
    const standX = bedX - 45;
    const standY = bedY + 10;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(standX, standY, 34, 45);
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(standX, standY, 34, 45);

    // Champagne Bottle & Cooler
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(standX + 10, standY - 18, 14, 18);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(standX + 14, standY - 28, 6, 12);

    ctx.restore();

    // 5. Cinematic Vignette on Top of Canvas
    const vigGrad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.3,
      width / 2, height / 2, width * 0.75
    );
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(2, 6, 23, 0.7)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);

    // 6. Subtle Gold Dust Ambient Particles
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    for (let p = 0; p < 25; p++) {
      const px = ((p * 73 + t * 250) % width);
      const py = ((p * 131 + t * 120) % height);
      const pSize = (p % 3) + 1;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // Set up resize observer & high-DPI canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width || window.innerWidth;
      const displayHeight = rect.height || window.innerHeight;

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        renderFrame(ctx, displayWidth, displayHeight, displayedFrameRef.current);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [renderFrame]);

  // Main Animation / Frame interpolation loop for smooth scrubbing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const tick = () => {
      if (!isRunning) return;

      const diff = targetFrameRef.current - displayedFrameRef.current;
      if (Math.abs(diff) > 0.01) {
        // Smooth lerp easing toward target frame
        displayedFrameRef.current += diff * 0.25;
        const currentInt = Math.round(displayedFrameRef.current);
        setCurrentFrameIndex(currentInt);

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
        renderFrame(ctx, rect.width, rect.height, displayedFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderFrame]);

  // Window scroll event listener: maps window scroll percentage directly to image frame index
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const totalScrollable = container.scrollHeight - window.innerHeight;
      
      if (totalScrollable <= 0) return;

      const currentScroll = window.scrollY - container.offsetTop;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      
      setScrollProgress(rawProgress);

      // Map progress directly to frame index
      const mappedFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(rawProgress * TOTAL_FRAMES));
      targetFrameRef.current = mappedFrame;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play scrubber simulation
  useEffect(() => {
    if (isPlayingAutoScrub) {
      autoPlayRef.current = window.setInterval(() => {
        targetFrameRef.current = (targetFrameRef.current + 1) % TOTAL_FRAMES;
        setScrollProgress(targetFrameRef.current / (TOTAL_FRAMES - 1));
      }, 45);
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlayingAutoScrub]);

  // Interactive slider scrub handler
  const handleSliderScrub = (val: number) => {
    setIsPlayingAutoScrub(false);
    const frame = Math.min(TOTAL_FRAMES - 1, Math.floor(val * TOTAL_FRAMES));
    targetFrameRef.current = frame;
    setScrollProgress(val);

    // Scroll window to match
    if (containerRef.current) {
      const container = containerRef.current;
      const totalScrollable = container.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: container.offsetTop + val * totalScrollable,
        behavior: 'instant' as ScrollBehavior,
      });
    }
  };

  // Scene milestones based on current frame
  const getSceneMilestone = (frame: number) => {
    if (frame < 22) {
      return {
        code: 'SCENE 01',
        title: 'Grand Portico & Marble Colonnade',
        subtitle: 'Entry foyer with custom golden crystal pendants & Italian travertine floors',
        suite: 'Presidential Penthouse 401',
        tag: 'Architectural Aperture'
      };
    } else if (frame < 48) {
      return {
        code: 'SCENE 02',
        title: 'Salon Gallery & Sommelier Bar',
        subtitle: 'Bespoke walnut millwork, Tempur-Pedic daybed, and vintage champagne cellar',
        suite: 'Master Living Salon',
        tag: 'Private Butler Service'
      };
    } else if (frame < 72) {
      return {
        code: 'SCENE 03',
        title: 'Floor-To-Ceiling Panoramic Horizon',
        subtitle: 'Soundproof thermal glass framing 180° uninterrupted ocean horizon vistas',
        suite: 'Bay View Terrace',
        tag: 'Smart RFID & IoT Climate'
      };
    } else {
      return {
        code: 'SCENE 04',
        title: 'Sunset Sky Terrace & Plunge Pool',
        subtitle: 'Outdoor cedar daybed with starlight reflections and golden hour ambiance',
        suite: 'Rooftop Sanctuary',
        tag: 'VIP Diplomatic Tier'
      };
    }
  };

  const scene = getSceneMilestone(currentFrameIndex);

  return (
    <div 
      ref={containerRef}
      id="canvas-scroll-container"
      className="relative w-full min-h-[420vh] bg-[#0D231E] select-none"
    >
      {/* Sticky Canvas Stage that locks to the viewport during page scroll */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center pointer-events-none">
        <canvas
          ref={canvasRef}
          id="scroll-animation-canvas"
          className="w-full h-full object-cover block"
        />
      </div>

      {/* Clean UI Layer On Top (Floating and responsive with zero clutter) */}
      <div 
        id="canvas-ui-layer"
        className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-8"
      >
        {/* Top Floating Glass HUD Bar */}
        <div className="pointer-events-auto flex items-center justify-between gap-4">
          {/* Brand & Scene Badge */}
          <div className="flex items-center space-x-3 bg-[#1A3A32]/90 backdrop-blur-xl border border-[#D4AF37]/30 px-4 py-2.5 rounded-2xl shadow-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#0D231E] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-display tracking-wide text-[#F7F4EB]">
                  AURA GRAND 3D VIRTUAL SCRUB
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0D231E] text-[#D4AF37] border border-[#D4AF37]/40">
                  {scene.code}
                </span>
              </div>
              <p className="text-[11px] text-[#F7F4EB]/70">
                {scene.suite} • {scene.tag}
              </p>
            </div>
          </div>

          {/* Top Right: Actions & Return to Desk */}
          <div className="flex items-center space-x-2">
            <button
              id="exit-to-dashboard-btn"
              onClick={onExitToDashboard}
              className="px-3.5 py-2 rounded-xl bg-[#1A3A32]/90 hover:bg-[#224b41] text-[#F7F4EB] hover:text-[#F7F4EB] border border-[#1A3A32] text-xs font-semibold backdrop-blur-md transition-colors shadow-lg cursor-pointer"
            >
              Operations Desk
            </button>

            <button
              id="walkthrough-book-suite-btn"
              onClick={onOpenBookingModal}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6c86e] text-[#0D231E] font-bold text-xs shadow-lg shadow-[#D4AF37]/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Book This Suite</span>
            </button>
          </div>
        </div>

        {/* Center Dynamic Storytelling Cards (Milestone Overlays) */}
        <div className="my-auto pointer-events-auto max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.code}
              initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              transition={{ duration: 0.25 }}
              id={`scene-card-${scene.code.replace(/\s+/g, '-')}`}
              className="bg-[#1A3A32]/95 backdrop-blur-2xl border border-[#D4AF37]/30 p-6 rounded-3xl shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF37] bg-[#0D231E] px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                  {scene.code} • {Math.round(scrollProgress * 100)}% EXPLORED
                </span>
                <span className="text-xs text-[#F7F4EB]/60 flex items-center gap-1 font-mono">
                  FRAME {String(currentFrameIndex + 1).padStart(2, '0')}/{TOTAL_FRAMES}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-[#F7F4EB] tracking-tight">
                  {scene.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#F7F4EB]/80 mt-1.5 leading-relaxed">
                  {scene.subtitle}
                </p>
              </div>

              {/* Quick Specs Pill */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#F7F4EB]/80 border-t border-[#0D231E]">
                <span className="bg-[#0D231E] px-2.5 py-1 rounded-lg border border-[#1A3A32] text-[#F7F4EB]">
                  Floor 4 Penthouse
                </span>
                <span className="bg-[#0D231E] px-2.5 py-1 rounded-lg border border-[#1A3A32] text-[#F7F4EB]">
                  Max 5 Guests
                </span>
                <span className="bg-[#0D231E] text-[#D4AF37] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 font-bold">
                  $1,200 / night
                </span>
                <button
                  onClick={() => onQuickBackendSync(`IoT Smart Climate & Lighting Query for Suite 401`, 'GET /api/v1/iot/rooms/401/telemetry')}
                  className="ml-auto text-[#D4AF37] hover:text-[#e6c86e] text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Radio className="w-3 h-3 text-[#D4AF37]" />
                  <span>Inspect IoT Status</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Floating Scrubber & Controls Panel */}
        <div className="pointer-events-auto bg-[#1A3A32]/95 backdrop-blur-2xl border border-[#D4AF37]/30 p-4 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto space-y-3">
          {/* Scrubber Progress Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#F7F4EB]/70">
              <span className="text-[#F7F4EB] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Scroll or Drag to Scrub Video Walkthrough</span>
              </span>
              <span className="text-[#D4AF37] font-bold">
                FRAME {String(currentFrameIndex + 1).padStart(2, '0')} / {TOTAL_FRAMES} ({Math.round(scrollProgress * 100)}%)
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="canvas-scrubber-slider"
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={scrollProgress}
                onChange={(e) => handleSliderScrub(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#0D231E] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
            </div>
          </div>

          {/* Quick Buttons Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <button
                id="toggle-auto-scrub-btn"
                onClick={() => setIsPlayingAutoScrub(!isPlayingAutoScrub)}
                className="px-3 py-1.5 rounded-lg bg-[#0D231E] hover:bg-[#15342d] text-[#F7F4EB] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#1A3A32]"
              >
                {isPlayingAutoScrub ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Pause Scrub</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>

              <button
                id="reset-scrub-btn"
                onClick={() => handleSliderScrub(0)}
                className="p-1.5 rounded-lg bg-[#0D231E] hover:bg-[#15342d] text-[#F7F4EB]/70 hover:text-[#F7F4EB] transition-colors cursor-pointer border border-[#1A3A32]"
                title="Rewind to frame 0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>

            {/* Scroll Hint */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#F7F4EB]/60 font-medium">
              <ArrowDown className="w-3.5 h-3.5 text-[#D4AF37] animate-bounce" />
              <span>Scroll page down to advance camera</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="walkthrough-reserve-btn"
                onClick={onOpenBookingModal}
                className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#0D231E] font-bold text-xs hover:bg-[#e6c86e] transition-colors shadow-sm cursor-pointer"
              >
                Reserve Penthouse 401
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
