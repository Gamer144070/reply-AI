import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Package,
  ShieldAlert,
  Zap,
  Globe2,
  Award,
} from 'lucide-react';

interface GameProps {
  onExit?: () => void;
}

export const LogisticsFlightGameView: React.FC<GameProps> = ({ onExit }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-level game states: 'title' | 'playing' | 'paused' | 'gameover' | 'victory'
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover' | 'victory'>('title');
  const [score, setScore] = useState(0);
  const [parcelsDelivered, setParcelsDelivered] = useState(0);
  const [cargoHealth, setCargoHealth] = useState(100);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // References for WebGL & audio engine loop to avoid React re-render lag
  const gameEngineRef = useRef<{
    audioCtx: AudioContext | null;
    isMuted: boolean;
    playSynthSound: (type: 'pickup' | 'hit' | 'boost' | 'checkpoint' | 'gameover' | 'win') => void;
    start: () => void;
    pause: () => void;
    resume: () => void;
    restart: () => void;
  } | null>(null);

  const CITIES = [
    { name: 'Tokyo Haneda Hub', country: 'Japan 🇯🇵', targetParcels: 3, themeColor: 0x38bdf8 },
    { name: 'Frankfurt Air Cargo', country: 'Germany 🇩🇪', targetParcels: 6, themeColor: 0xf59e0b },
    { name: 'London Heathrow Gateway', country: 'UK 🇬🇧', targetParcels: 9, themeColor: 0xa855f7 },
    { name: 'Sydney Pacific Terminal', country: 'Australia 🇦🇺', targetParcels: 12, themeColor: 0x10b981 },
  ];

  // Procedural Web Audio Synthesizer
  const initAudio = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      return ctx;
    } catch {
      return null;
    }
  };

  const playSynth = (
    ctx: AudioContext | null,
    muted: boolean,
    type: 'pickup' | 'hit' | 'boost' | 'checkpoint' | 'gameover' | 'win'
  ) => {
    if (!ctx || muted) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'pickup') {
      // Arpeggio chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'hit') {
      // Low noise hit thud
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'boost') {
      // Whoosh sweep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'checkpoint') {
      // Chime chord
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;
    const canvas = canvasRef.current;
    const container = mountRef.current;

    // Audio context
    const audioCtx = initAudio();

    // Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.012);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Lighting
    const ambientLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(15, 30, 20);
    scene.add(dirLight);

    // Procedural Grid Floor Runway
    const gridHelper = new THREE.GridHelper(300, 60, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // ==========================================
    // PROCEDURAL 3D HERO CRAFT (Composite 3-12 parts)
    // ==========================================
    const planeGroup = new THREE.Group();

    // 1. Fuselage
    const fuselageGeo = new THREE.CylinderGeometry(0.5, 0.65, 3.2, 12);
    fuselageGeo.rotateX(Math.PI / 2);
    const fuselageMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.8,
    });
    const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
    planeGroup.add(fuselage);

    // 2. Cockpit Canopy Glass
    const canopyGeo = new THREE.SphereGeometry(0.45, 12, 10);
    canopyGeo.scale(1, 0.6, 1.4);
    canopyGeo.translate(0, 0.35, 0.5);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    planeGroup.add(canopy);

    // 3. Main Wings
    const wingGeo = new THREE.BoxGeometry(5.2, 0.08, 1.1);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.3,
      metalness: 0.6,
    });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0.05, 0.1);
    planeGroup.add(wings);

    // 4. Tail Fin & Stabilizers
    const tailFinGeo = new THREE.BoxGeometry(0.08, 0.85, 0.7);
    tailFinGeo.translate(0, 0.45, -1.2);
    const tailFin = new THREE.Mesh(tailFinGeo, wingMat);
    planeGroup.add(tailFin);

    const tailHGeo = new THREE.BoxGeometry(1.6, 0.06, 0.5);
    tailHGeo.translate(0, 0.1, -1.3);
    const tailH = new THREE.Mesh(tailHGeo, fuselageMat);
    planeGroup.add(tailH);

    // 5. Twin Engine Pods
    const engineGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.8, 8);
    engineGeo.rotateX(Math.PI / 2);
    const engineMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.7,
    });
    const engineLeft = new THREE.Mesh(engineGeo, engineMat);
    engineLeft.position.set(-1.4, -0.1, 0.2);
    const engineRight = new THREE.Mesh(engineGeo, engineMat);
    engineRight.position.set(1.4, -0.1, 0.2);
    planeGroup.add(engineLeft);
    planeGroup.add(engineRight);

    // 6. Spinning Propeller Blades
    const propGeo = new THREE.BoxGeometry(0.9, 0.05, 0.02);
    const propMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const propLeft = new THREE.Mesh(propGeo, propMat);
    propLeft.position.set(-1.4, -0.1, 0.65);
    const propRight = new THREE.Mesh(propGeo, propMat);
    propRight.position.set(1.4, -0.1, 0.65);
    planeGroup.add(propLeft);
    planeGroup.add(propRight);

    // 7. Glowing Parcel Cargo Bay Underbelly
    const cargoBoxGeo = new THREE.BoxGeometry(0.7, 0.4, 0.9);
    const cargoBoxMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.5,
    });
    const cargoBay = new THREE.Mesh(cargoBoxGeo, cargoBoxMat);
    cargoBay.position.set(0, -0.35, -0.2);
    planeGroup.add(cargoBay);

    // 8. Soft Radial Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(0,0,0,0.45)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -0.95;
    scene.add(shadowMesh);

    scene.add(planeGroup);

    // ==========================================
    // PROCEDURAL COLLECTIBLES (PARCELS & CUSTOMS HOOPS)
    // ==========================================
    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    const obstacleGroup = new THREE.Group();
    scene.add(obstacleGroup);

    const parcelItems: THREE.Mesh[] = [];
    const obstacleItems: THREE.Group[] = [];

    const createParcelMesh = (z: number) => {
      const pGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.5,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.position.set((Math.random() - 0.5) * 12, 1 + Math.random() * 3, z);
      mesh.rotation.y = Math.random() * Math.PI;
      parcelGroup.add(mesh);
      parcelItems.push(mesh);
    };

    const createObstacleMesh = (z: number) => {
      const group = new THREE.Group();
      // Stormcloud / customs inspection obstacle
      const cloudGeo = new THREE.DodecahedronGeometry(1.2, 1);
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xb91c1c,
        emissiveIntensity: 0.4,
        wireframe: true,
      });
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      group.add(cloud);

      // Warning ring
      const ringGeo = new THREE.TorusGeometry(1.6, 0.08, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      group.position.set((Math.random() - 0.5) * 14, 1.2 + Math.random() * 3, z);
      obstacleGroup.add(group);
      obstacleItems.push(group);
    };

    // Populate initial path
    for (let i = 1; i <= 25; i++) {
      createParcelMesh(-i * 14);
      if (i % 2 === 0) {
        createObstacleMesh(-i * 14 - 7);
      }
    }

    // Input state
    const keys = {
      ArrowLeft: false,
      ArrowRight: false,
      ArrowUp: false,
      ArrowDown: false,
      KeyA: false,
      KeyD: false,
      KeyW: false,
      KeyS: false,
      Space: false,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code in keys) {
        keys[e.code as keyof typeof keys] = true;
      }
      if (e.code === 'Space') {
        playSynth(audioCtx, isMuted, 'boost');
      }
      if (e.code === 'Escape') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        setGameState((prev) => (prev === 'title' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code in keys) {
        keys[e.code as keyof typeof keys] = false;
      }
    };

    const handleBlur = () => {
      for (const k in keys) {
        keys[k as keyof typeof keys] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // Game loop simulation variables
    let planeX = 0;
    let planeY = 2;
    let planeSpeed = 16;
    let lastTime = performance.now();
    let hitstopTimer = 0;
    let cameraShake = 0;
    let localScore = 0;
    let localDelivered = 0;
    let localHealth = 100;
    let currentCity = 0;
    let animId: number;

    const gameLoop = (currentTime: number) => {
      animId = requestAnimationFrame(gameLoop);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05);

      // Hitstop delay for heavy impacts
      if (hitstopTimer > 0) {
        hitstopTimer -= dt;
        return;
      }

      // Propeller spin
      propLeft.rotation.z += 25 * dt;
      propRight.rotation.z -= 25 * dt;

      // Handle input in playing state
      const isLeft = keys.ArrowLeft || keys.KeyA;
      const isRight = keys.ArrowRight || keys.KeyD;
      const isUp = keys.ArrowUp || keys.KeyW;
      const isDown = keys.ArrowDown || keys.KeyS;
      const isBoost = keys.Space;

      const currentSpeed = isBoost ? planeSpeed * 1.55 : planeSpeed;

      if (isLeft) planeX -= 12 * dt;
      if (isRight) planeX += 12 * dt;
      if (isUp) planeY += 8 * dt;
      if (isDown) planeY -= 8 * dt;

      // Clamp bounds
      planeX = Math.max(-7, Math.min(7, planeX));
      planeY = Math.max(0.6, Math.min(5.5, planeY));

      // Apply bank tilt and pitch
      const targetRoll = (isLeft ? 0.35 : isRight ? -0.35 : 0);
      const targetPitch = (isUp ? 0.18 : isDown ? -0.18 : 0);
      planeGroup.rotation.z += (targetRoll - planeGroup.rotation.z) * 10 * dt;
      planeGroup.rotation.x += (targetPitch - planeGroup.rotation.x) * 10 * dt;

      // Smooth position interpolation
      planeGroup.position.x += (planeX - planeGroup.position.x) * 12 * dt;
      planeGroup.position.y += (planeY - planeGroup.position.y) * 12 * dt;
      shadowMesh.position.x = planeGroup.position.x;

      // Camera trailing & shake
      cameraShake *= 0.9;
      const shakeX = (Math.random() - 0.5) * cameraShake;
      const shakeY = (Math.random() - 0.5) * cameraShake;
      camera.position.x = planeGroup.position.x * 0.4 + shakeX;
      camera.position.y = 4.8 + (planeGroup.position.y - 2) * 0.3 + shakeY;
      camera.lookAt(planeGroup.position.x * 0.2, 2.2, -6);

      // Scroll world runway and objects towards player
      gridHelper.position.z = (gridHelper.position.z + currentSpeed * dt) % 10;

      // Check parcel collisions
      for (let i = parcelItems.length - 1; i >= 0; i--) {
        const p = parcelItems[i];
        p.position.z += currentSpeed * dt;
        p.rotation.y += 2 * dt;
        p.rotation.x += 1 * dt;

        // Collision check
        const dist = planeGroup.position.distanceTo(p.position);
        if (dist < 1.4) {
          // Collected!
          playSynth(audioCtx, isMuted, 'pickup');
          localScore += 100;
          localDelivered += 1;
          setScore(localScore);
          setParcelsDelivered(localDelivered);

          // City milestone check
          if (localDelivered >= CITIES[currentCity].targetParcels && currentCity < CITIES.length - 1) {
            currentCity++;
            setCurrentCityIndex(currentCity);
            playSynth(audioCtx, isMuted, 'checkpoint');
            scene.fog = new THREE.FogExp2(CITIES[currentCity].themeColor, 0.015);
          } else if (localDelivered >= 12) {
            playSynth(audioCtx, isMuted, 'win');
            setGameState('victory');
          }

          // Recycle parcel ahead
          p.position.z = -350 - Math.random() * 50;
          p.position.x = (Math.random() - 0.5) * 12;
          p.position.y = 1 + Math.random() * 3.5;
        } else if (p.position.z > 15) {
          // Missed, wrap around
          p.position.z = -350 - Math.random() * 50;
          p.position.x = (Math.random() - 0.5) * 12;
          p.position.y = 1 + Math.random() * 3.5;
        }
      }

      // Check obstacle collisions
      for (let i = obstacleItems.length - 1; i >= 0; i--) {
        const obs = obstacleItems[i];
        obs.position.z += currentSpeed * dt;
        obs.rotation.z += 1.5 * dt;

        const dist = planeGroup.position.distanceTo(obs.position);
        if (dist < 1.6) {
          // Hit hazard!
          playSynth(audioCtx, isMuted, 'hit');
          hitstopTimer = 0.05; // 50ms hitstop
          cameraShake = 0.6;
          localHealth = Math.max(0, localHealth - 25);
          setCargoHealth(localHealth);

          // Knockback
          obs.position.z = -350 - Math.random() * 50;
          obs.position.x = (Math.random() - 0.5) * 12;

          if (localHealth <= 0) {
            playSynth(audioCtx, isMuted, 'gameover');
            setGameState('gameover');
          }
        } else if (obs.position.z > 15) {
          obs.position.z = -350 - Math.random() * 50;
          obs.position.x = (Math.random() - 0.5) * 12;
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(gameLoop);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Store engine ref
    gameEngineRef.current = {
      audioCtx,
      isMuted,
      playSynthSound: (t) => playSynth(audioCtx, isMuted, t),
      start: () => {
        localScore = 0;
        localDelivered = 0;
        localHealth = 100;
        currentCity = 0;
        setScore(0);
        setParcelsDelivered(0);
        setCargoHealth(100);
        setCurrentCityIndex(0);
        setGameState('playing');
      },
      pause: () => setGameState('paused'),
      resume: () => setGameState('playing'),
      restart: () => {
        localScore = 0;
        localDelivered = 0;
        localHealth = 100;
        currentCity = 0;
        planeX = 0;
        planeY = 2;
        setScore(0);
        setParcelsDelivered(0);
        setCargoHealth(100);
        setCurrentCityIndex(0);
        setGameState('playing');
      },
    };

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      audioCtx?.close();
    };
  }, []);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (gameEngineRef.current) {
      gameEngineRef.current.isMuted = !isMuted;
    }
  };

  const handleToggleFullscreen = () => {
    if (!mountRef.current) return;
    if (!document.fullscreenElement) {
      mountRef.current.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[620px] rounded-2xl overflow-hidden bg-slate-950 select-none shadow-2xl border border-slate-800 ${
        isFullScreen ? 'h-screen rounded-none' : ''
      }`}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Low-Occlusion HUD Overlay (pointer-events: none on wrapper) */}
      <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Perimeter Status Cluster */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cargo Health */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-white flex items-center gap-2 shadow-lg backdrop-blur-xs">
              <ShieldAlert className={`w-4 h-4 ${cargoHealth > 40 ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`} />
              <div className="text-xs font-semibold">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block leading-none">
                  Cargo Integrity
                </span>
                <span className="font-mono tabular-nums text-sm font-bold">
                  {cargoHealth}%
                </span>
              </div>
            </div>

            {/* Current International Hub */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-white flex items-center gap-2 shadow-lg backdrop-blur-xs">
              <Globe2 className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block leading-none">
                  Next Destination
                </span>
                <span className="text-xs font-bold text-sky-300">
                  {CITIES[currentCityIndex]?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Cluster: Score & Delivered */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-white flex items-center gap-2 shadow-lg backdrop-blur-xs">
              <Package className="w-4 h-4 text-amber-400" />
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block leading-none">
                  Parcels
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-amber-300">
                  {parcelsDelivered} / 12
                </span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-white flex items-center gap-2 shadow-lg backdrop-blur-xs">
              <Award className="w-4 h-4 text-purple-400" />
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block leading-none">
                  Score
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-purple-300">
                  {score.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Controls: Audio mute & Fullscreen */}
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Control Hint Strip */}
        <div className="flex items-center justify-between text-[11px] text-slate-400/80 font-mono">
          <div className="flex items-center gap-4 bg-slate-900/70 px-3 py-1 rounded-lg border border-slate-800/60">
            <span>WASD / Arrows: Maneuver Cargo Plane</span>
            <span>·</span>
            <span>Space: Turbo Boost Jet</span>
            <span>·</span>
            <span>Esc: Pause</span>
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Collect green ceramic packages · Avoid red customs clouds</span>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          TITLE SCREEN OVERLAY (30-40% Negative Space)
         ========================================== */}
      {gameState === 'title' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="max-w-md w-full space-y-6">
            {/* Bespoke inline SVG title lockup */}
            <div className="flex justify-center">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <rect width="72" height="72" rx="20" fill="#2563eb" />
                <path d="M16 36 L56 22 L40 54 L34 38 Z" fill="#ffffff" />
                <circle cx="48" cy="48" r="6" fill="#f59e0b" />
              </svg>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Parcel Express 3D
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Pilot the international artisan cargo runner. Navigate customs air routes to Tokyo, Frankfurt, London, and Sydney while safeguarding fragile handcrafted wares!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => gameEngineRef.current?.start()}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Launch Flight (Press Enter / Space)</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              WASD Move · Space Boost · 60fps Three.js WebGL Simulation
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          PAUSE MODAL
         ========================================== */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
          <div className="max-w-xs w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Pause className="w-5 h-5 text-amber-400" />
              <span>Flight Paused</span>
            </h2>
            <p className="text-xs text-slate-400">
              Score: <span className="font-mono text-white">{score}</span> · Parcels:{' '}
              <span className="font-mono text-white">{parcelsDelivered} / 12</span>
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Resume Flight</span>
              </button>
              <button
                onClick={() => gameEngineRef.current?.restart()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Flight</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          GAME OVER MODAL
         ========================================== */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
          <div className="max-w-sm w-full bg-slate-900 border border-rose-900/50 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Cargo Damaged!</h2>
            <p className="text-xs text-slate-400">
              Fragile ceramics broke in the customs turbulence. You safely delivered{' '}
              <span className="font-bold text-amber-400">{parcelsDelivered}</span> parcels with a final score of{' '}
              <span className="font-bold text-purple-400">{score.toLocaleString()}</span>.
            </p>

            <button
              onClick={() => gameEngineRef.current?.restart()}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Mission</span>
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          VICTORY MODAL
         ========================================== */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
          <div className="max-w-sm w-full bg-slate-900 border border-emerald-900/50 p-6 rounded-2xl text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">Global Express Champion!</h2>
            <p className="text-xs text-slate-400">
              Incredible piloting! All 12 international ceramic consignments reached Tokyo, Frankfurt, London, and Sydney in flawless condition!
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl text-xs font-mono text-emerald-300">
              Final Score: {score.toLocaleString()} Points · 100% On-Time Delivery
            </div>

            <button
              onClick={() => gameEngineRef.current?.restart()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Fly Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
