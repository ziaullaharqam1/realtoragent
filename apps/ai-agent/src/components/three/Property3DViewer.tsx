import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Property, LightingPreset, RoomView, FinishPalette, Hotspot } from '../../types';
import { 
  Maximize2, 
  Sun, 
  Sunset, 
  Moon, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  Layers, 
  Ruler, 
  Compass, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown,
  Share2,
  Download,
  CheckCircle2,
  Sliders,
  Camera
} from 'lucide-react';

interface Property3DViewerProps {
  property: Property;
  clientName?: string;
  vipTier?: string;
  onOpenPitchInput?: () => void;
  onExportPPTX?: () => void;
  onShareLink?: () => void;
}

type SceneProfile = ReturnType<typeof getSceneProfile>;
type ViewCoords = { pos: [number, number, number]; lookAt: [number, number, number] };

/** Distinct procedural layout per listing so portfolio selection visibly updates the viewport. */
function getSceneProfile(property: Property) {
  switch (property.id) {
    case 'prop-downtown-sky':
      return {
        accent: 0xb45309,
        mullion: 0x92400e,
        pillow: 0xd97706,
        sofa: 0xf5f5f4,
        poolBasin: 0x0f766e,
        water: 0x14b8a6,
        hasPool: false,
        featureLabel: 'Sky Garden' as const,
        floorW: 16,
        floorD: 14,
        wallH: 6.2,
        ceilingM: '3.4m per level · Triplex',
        bg: '#fff7ed',
        skylineHue: 0xd6d3d1,
      };
    case 'prop-marina-waterfront':
      return {
        accent: 0x0e7490,
        mullion: 0x155e75,
        pillow: 0x06b6d4,
        sofa: 0xe0f2fe,
        poolBasin: 0x0369a1,
        water: 0x22d3ee,
        hasPool: true,
        featureLabel: 'Pool' as const,
        floorW: 18,
        floorD: 12,
        wallH: 4.2,
        ceilingM: '3.2m Open Plan',
        bg: '#ecfeff',
        skylineHue: 0xcbd5e1,
      };
    case 'prop-emirates-hills':
      return {
        accent: 0x3f6212,
        mullion: 0x365314,
        pillow: 0x65a30d,
        sofa: 0xfef3c7,
        poolBasin: 0x166534,
        water: 0x4ade80,
        hasPool: true,
        featureLabel: 'Pool' as const,
        floorW: 28,
        floorD: 22,
        wallH: 5.2,
        ceilingM: '4.8m Grand Foyer',
        bg: '#f7fee7',
        skylineHue: 0xd6d3d1,
      };
    default:
      return {
        accent: 0x1e3a8a,
        mullion: 0x1e40af,
        pillow: 0x2563eb,
        sofa: 0xe2e8f0,
        poolBasin: 0x0284c7,
        water: 0x06b6d4,
        hasPool: true,
        featureLabel: 'Pool' as const,
        floorW: 22,
        floorD: 18,
        wallH: 5,
        ceilingM: '7.4m Double Volume',
        bg: '#eef2f6',
        skylineHue: 0xcfd8dc,
      };
  }
}

/** Room anchors in world units — used for both mesh placement and camera presets. */
function getLayoutAnchors(profile: SceneProfile) {
  const { floorW, floorD, wallH } = profile;
  // Keep furniture clearly inside the slab with room for a standing camera
  const insetX = floorW * 0.22;
  const insetZ = floorD * 0.22;
  return {
    living: { x: insetX * 0.55, y: 0, z: insetZ },
    kitchen: { x: -insetX, y: 0, z: -insetZ * 0.15 },
    master: { x: -insetX * 0.85, y: 0, z: -insetZ * 1.15 },
    terrace: { x: floorW * 0.5 - 1.8, y: 0, z: insetZ * 0.2 },
    feature: { x: floorW * 0.5 - 3.2, y: 0, z: 0 },
    eye: Math.min(1.85, wallH * 0.38),
    look: Math.min(1.25, wallH * 0.28),
  };
}

function clampInsideFloor(
  x: number,
  z: number,
  profile: SceneProfile,
  margin = 1.6
): [number, number] {
  const maxX = profile.floorW / 2 - margin;
  const maxZ = profile.floorD / 2 - margin;
  return [
    Math.max(-maxX, Math.min(maxX, x)),
    Math.max(-maxZ, Math.min(maxZ, z)),
  ];
}

/** Camera presets matched to the active listing footprint (camera stays inside rooms). */
function getViewCoordinates(profile: SceneProfile): Record<RoomView, ViewCoords> {
  const a = getLayoutAnchors(profile);
  const orbit = Math.max(profile.floorW, profile.floorD) * 1.25;
  const dollhouseY = profile.wallH * 2.6 + 5;

  const livingCam = clampInsideFloor(a.living.x + 0.4, a.living.z + 3.4, profile);
  const kitchenCam = clampInsideFloor(a.kitchen.x + 3.4, a.kitchen.z + 2.2, profile);
  const masterCam = clampInsideFloor(a.master.x + 2.6, a.master.z + 3.0, profile);
  const terraceCam = clampInsideFloor(a.terrace.x - 0.4, a.terrace.z + 2.8, profile, 1.2);
  // Pool / sky-garden can sit near the glass edge
  const featureCam = clampInsideFloor(a.feature.x - 2.2, a.feature.z + 3.8, profile, 1.1);

  return {
    dollhouse: {
      pos: [orbit * 0.72, dollhouseY, orbit * 0.72],
      lookAt: [0, profile.wallH * 0.22, 0],
    },
    living: {
      pos: [livingCam[0], a.eye, livingCam[1]],
      lookAt: [a.living.x, a.look, a.living.z - 0.4],
    },
    master: {
      pos: [masterCam[0], a.eye, masterCam[1]],
      lookAt: [a.master.x, a.look + 0.15, a.master.z - 1.1],
    },
    terrace: {
      pos: [terraceCam[0], a.eye + 0.15, terraceCam[1]],
      lookAt: [a.feature.x, 0.85, a.feature.z],
    },
    kitchen: {
      pos: [kitchenCam[0], a.eye, kitchenCam[1]],
      lookAt: [a.kitchen.x, a.look, a.kitchen.z - 0.3],
    },
    'penthouse-pool': {
      pos: [featureCam[0], Math.min(a.eye + 1.1, profile.wallH - 1.2), featureCam[1]],
      lookAt: [a.feature.x, 0.7, a.feature.z],
    },
  };
}

function getAvailableViews(profile: SceneProfile): { id: RoomView; label: string }[] {
  const views: { id: RoomView; label: string }[] = [
    { id: 'dollhouse', label: 'Dollhouse' },
    { id: 'living', label: 'Living' },
    { id: 'master', label: 'Master' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'terrace', label: 'Terrace' },
  ];
  views.push({
    id: 'penthouse-pool',
    label: profile.featureLabel,
  });
  return views;
}

export const Property3DViewer: React.FC<Property3DViewerProps> = ({
  property,
  clientName = 'Distinguished Client',
  vipTier = 'Platinum UHNW',
  onOpenPitchInput,
  onExportPPTX,
  onShareLink,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [lighting, setLighting] = useState<LightingPreset>('golden-hour');
  const [currentView, setCurrentView] = useState<RoomView>('dollhouse');
  const [finish, setFinish] = useState<FinishPalette>('carrara-brass');
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const sceneProfile = getSceneProfile(property);
  const viewCoordinates = getViewCoordinates(sceneProfile);
  const availableViews = getAvailableViews(sceneProfile);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const targetCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...viewCoordinates.dollhouse.pos));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(...viewCoordinates.dollhouse.lookAt));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(...viewCoordinates.dollhouse.lookAt));
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const poolWaterRef = useRef<THREE.Mesh | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const interiorLampsRef = useRef<THREE.PointLight[]>([]);
  const isAutoRotateRef = useRef(isAutoRotate);
  const currentViewRef = useRef(currentView);
  const viewCoordinatesRef = useRef(viewCoordinates);
  const orbitRadiusRef = useRef(Math.max(sceneProfile.floorW, sceneProfile.floorD) * 1.25);
  const orbitHeightRef = useRef(sceneProfile.wallH * 2.6 + 5);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /** Atomically aim the camera — updates refs first so the animation loop cannot race. */
  const applyCameraView = (view: RoomView, opts?: { snap?: boolean }) => {
    const profile = getSceneProfile(property);
    const coordsMap = getViewCoordinates(profile);
    const coords = coordsMap[view];
    viewCoordinatesRef.current = coordsMap;
    orbitRadiusRef.current = Math.max(profile.floorW, profile.floorD) * 1.25;
    orbitHeightRef.current = profile.wallH * 2.6 + 5;

    // Sync refs BEFORE React state so auto-rotate cannot overwrite the new target
    currentViewRef.current = view;
    isAutoRotateRef.current = view === 'dollhouse';
    targetCameraPosRef.current.set(...coords.pos);
    targetLookAtRef.current.set(...coords.lookAt);

    if (opts?.snap !== false) {
      currentLookAtRef.current.set(...coords.lookAt);
      if (cameraRef.current) {
        // Jump most of the way so the room is readable immediately
        cameraRef.current.position.set(
          THREE.MathUtils.lerp(cameraRef.current.position.x, coords.pos[0], 0.85),
          THREE.MathUtils.lerp(cameraRef.current.position.y, coords.pos[1], 0.85),
          THREE.MathUtils.lerp(cameraRef.current.position.z, coords.pos[2], 0.85)
        );
        cameraRef.current.lookAt(currentLookAtRef.current);
      }
    }

    setCurrentView(view);
    setIsAutoRotate(view === 'dollhouse');
  };

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Reset interactive controls whenever the selected listing changes
  useEffect(() => {
    setLighting('golden-hour');
    setFinish('carrara-brass');
    setActiveHotspot(null);
    applyCameraView('dollhouse', { snap: true });
    showToast(`Loaded 3D model · ${property.title}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.id]);

  // Procedural canvas textures
  const createProceduralTextures = () => {
    // 1. Marble texture
    const marbleCanvas = document.createElement('canvas');
    marbleCanvas.width = 512;
    marbleCanvas.height = 512;
    const ctx = marbleCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);

    // Marble veins
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.filter = 'blur(2px)';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, 0);
      ctx.bezierCurveTo(
        Math.random() * 512, 170,
        Math.random() * 512, 340,
        Math.random() * 512, 512
      );
      ctx.stroke();
    }
    // Subtle veins
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * 512);
    ctx.bezierCurveTo(150, Math.random() * 512, 350, Math.random() * 512, 512, Math.random() * 512);
    ctx.stroke();

    const marbleTex = new THREE.CanvasTexture(marbleCanvas);
    marbleTex.wrapS = THREE.RepeatWrapping;
    marbleTex.wrapT = THREE.RepeatWrapping;
    marbleTex.repeat.set(4, 4);
    marbleTex.colorSpace = THREE.SRGBColorSpace;

    // 2. French Oak Wood texture
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 512;
    woodCanvas.height = 512;
    const wctx = woodCanvas.getContext('2d')!;
    wctx.fillStyle = '#c29b74';
    wctx.fillRect(0, 0, 512, 512);
    wctx.strokeStyle = '#8b5a2b';
    wctx.lineWidth = 2;
    for (let y = 0; y < 512; y += 8) {
      wctx.beginPath();
      wctx.moveTo(0, y);
      wctx.lineTo(512, y + (Math.random() * 4 - 2));
      wctx.stroke();
    }
    const woodTex = new THREE.CanvasTexture(woodCanvas);
    woodTex.wrapS = THREE.RepeatWrapping;
    woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(6, 6);
    woodTex.colorSpace = THREE.SRGBColorSpace;

    // 3. Dark Bluestone texture
    const stoneCanvas = document.createElement('canvas');
    stoneCanvas.width = 512;
    stoneCanvas.height = 512;
    const sctx = stoneCanvas.getContext('2d')!;
    sctx.fillStyle = '#334155';
    sctx.fillRect(0, 0, 512, 512);
    sctx.strokeStyle = '#475569';
    sctx.lineWidth = 1;
    for (let i = 0; i < 200; i++) {
      sctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    const stoneTex = new THREE.CanvasTexture(stoneCanvas);
    stoneTex.wrapS = THREE.RepeatWrapping;
    stoneTex.wrapT = THREE.RepeatWrapping;
    stoneTex.repeat.set(4, 4);
    stoneTex.colorSpace = THREE.SRGBColorSpace;

    return { marbleTex, woodTex, stoneTex };
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const profile = getSceneProfile(property);
    const anchors = getLayoutAnchors(profile);
    const cameraViews = getViewCoordinates(profile);
    viewCoordinatesRef.current = cameraViews;
    orbitRadiusRef.current = Math.max(profile.floorW, profile.floorD) * 1.25;
    orbitHeightRef.current = profile.wallH * 2.6 + 5;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(profile.bg);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    const initialCoords = cameraViews.dollhouse;
    camera.position.set(...initialCoords.pos);
    cameraRef.current = camera;
    targetCameraPosRef.current.set(...initialCoords.pos);
    targetLookAtRef.current.set(...initialCoords.lookAt);
    currentLookAtRef.current.set(...initialCoords.lookAt);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const { marbleTex } = createProceduralTextures();

    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const floorW = profile.floorW;
    const floorD = profile.floorD;
    const wallH = profile.wallH;
    const wallMidY = wallH / 2 - 0.2;

    // Main Floor Slab — sized per listing
    const floorGeo = new THREE.BoxGeometry(floorW, 0.4, floorD);
    const floorMat = new THREE.MeshStandardMaterial({
      map: marbleTex,
      roughness: 0.15,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.2;
    floorMesh.receiveShadow = true;
    buildingGroup.add(floorMesh);
    floorMeshRef.current = floorMesh;

    // Soft Contact Ground Shadow
    const shadowGeo = new THREE.PlaneGeometry(floorW + 14, floorD + 14);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.22;
    buildingGroup.add(shadowMesh);

    // Ceiling / Upper Slab
    const ceilingGeo = new THREE.BoxGeometry(floorW, 0.35, floorD);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.y = wallH - 0.2;
    buildingGroup.add(ceilingMesh);

    // Interior Feature Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.6,
      metalness: 0.1,
    });
    const accentWallMat = new THREE.MeshStandardMaterial({
      color: profile.accent,
      roughness: 0.25,
      metalness: 0.35,
    });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(floorW, wallH, 0.4), wallMat);
    backWall.position.set(0, wallMidY, -floorD / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    buildingGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallH, floorD), wallMat);
    leftWall.position.set(-floorW / 2, wallMidY, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    buildingGroup.add(leftWall);

    const divider = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH - 0.4, floorD * 0.5), accentWallMat);
    divider.position.set(-1.5, wallMidY, -floorD * 0.25);
    divider.castShadow = true;
    buildingGroup.add(divider);

    // Panoramic Acoustic Floor-to-Ceiling Glass Walls
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      transmission: 0.94,
      ior: 1.52,
      reflectivity: 0.9,
      thickness: 0.8,
      depthWrite: false,
    });

    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(floorW, wallH - 0.4, 0.1), glassMat);
    frontGlass.position.set(0, wallMidY, floorD / 2);
    buildingGroup.add(frontGlass);

    const terraceGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, floorD), glassMat);
    terraceGlass.position.set(floorW / 2, 0.7, 0);
    buildingGroup.add(terraceGlass);

    // Anodized Architectural Mullions — color per listing
    const mullionMat = new THREE.MeshStandardMaterial({
      color: profile.mullion,
      metalness: 0.85,
      roughness: 0.25,
    });
    for (let x = -floorW / 2 + 1; x <= floorW / 2 - 1; x += Math.max(2.8, floorW / 6)) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, wallH - 0.2, 0.08), mullionMat);
      mullion.position.set(x, wallMidY, floorD / 2);
      buildingGroup.add(mullion);
    }

    // Pool / terrace water feature — omitted for listings without a pool
    poolWaterRef.current = null;
    if (profile.hasPool) {
      const poolGroup = new THREE.Group();
      poolGroup.position.set(anchors.feature.x, 0, anchors.feature.z);

      const poolBasinGeo = new THREE.BoxGeometry(5.5, 1.2, Math.min(11, floorD * 0.7));
      const poolBasinMat = new THREE.MeshStandardMaterial({
        color: profile.poolBasin,
        roughness: 0.2,
        metalness: 0.1,
      });
      const poolBasin = new THREE.Mesh(poolBasinGeo, poolBasinMat);
      poolBasin.position.y = -0.5;
      poolGroup.add(poolBasin);

      const poolGlassEdge = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, Math.min(11, floorD * 0.7)), glassMat);
      poolGlassEdge.position.set(2.8, 0.4, 0);
      poolGroup.add(poolGlassEdge);

      const waterGeo = new THREE.PlaneGeometry(5.2, Math.min(10.6, floorD * 0.65), 24, 24);
      const waterMat = new THREE.MeshPhysicalMaterial({
        color: profile.water,
        transmission: 0.85,
        opacity: 0.88,
        transparent: true,
        roughness: 0.1,
        metalness: 0.2,
        reflectivity: 0.95,
        depthWrite: false,
      });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.y = 0.12;
      poolGroup.add(waterMesh);
      poolWaterRef.current = waterMesh;
      buildingGroup.add(poolGroup);
    } else {
      // Downtown triplex: sky-garden terrace slab instead of pool
      const terraceSlab = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.55, metalness: 0.15 })
      );
      terraceSlab.position.set(anchors.feature.x, 0.05, anchors.feature.z);
      terraceSlab.castShadow = true;
      buildingGroup.add(terraceSlab);
    }

    // Floor room labels so perspective buttons land on a readable space
    const addRoomLabel = (text: string, x: number, z: number, color = '#1e3a8a') => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 256, 64);
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.fillRect(8, 10, 240, 44);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(8, 10, 240, 44);
      ctx.fillStyle = color;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.toUpperCase(), 128, 32);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 0.7),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      label.rotation.x = -Math.PI / 2;
      label.position.set(x, 0.03, z + 1.6);
      buildingGroup.add(label);
    };
    addRoomLabel('Living', anchors.living.x, anchors.living.z);
    addRoomLabel('Kitchen', anchors.kitchen.x, anchors.kitchen.z);
    addRoomLabel('Master', anchors.master.x, anchors.master.z);
    addRoomLabel(profile.featureLabel, anchors.feature.x, anchors.feature.z, '#0f766e');

    // Designer Modular Furniture — anchored to listing footprint
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(anchors.living.x, 0, anchors.living.z);

    const velvetMat = new THREE.MeshStandardMaterial({
      color: profile.sofa,
      roughness: 0.8,
      metalness: 0.05,
    });
    const pillowMat = new THREE.MeshStandardMaterial({
      color: profile.pillow,
      roughness: 0.7,
      metalness: 0.1,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: profile.pillow,
      metalness: 0.95,
      roughness: 0.15,
    });

    const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.7, 1.4), velvetMat);
    sofaMain.position.set(0, 0.35, 0);
    sofaMain.castShadow = true;
    sofaGroup.add(sofaMain);

    const sofaReturn = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 2.6), velvetMat);
    sofaReturn.position.set(-1.4, 0.35, -1.2);
    sofaReturn.castShadow = true;
    sofaGroup.add(sofaReturn);

    const backrest1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.6, 0.35), velvetMat);
    backrest1.position.set(0, 0.75, 0.55);
    sofaGroup.add(backrest1);

    const backrest2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 2.6), velvetMat);
    backrest2.position.set(-1.95, 0.75, -1.2);
    sofaGroup.add(backrest2);

    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.2), pillowMat);
    pillow1.position.set(1.4, 0.8, 0.35);
    pillow1.rotation.y = 0.2;
    sofaGroup.add(pillow1);

    const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.08, 32), floorMat);
    tableTop.position.set(0.2, 0.45, -1.5);
    tableTop.castShadow = true;
    sofaGroup.add(tableTop);

    const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.4, 32), chromeMat);
    tableBase.position.set(0.2, 0.2, -1.5);
    sofaGroup.add(tableBase);
    buildingGroup.add(sofaGroup);

    // Kitchen Atelier
    const kitchenGroup = new THREE.Group();
    kitchenGroup.position.set(anchors.kitchen.x, 0, anchors.kitchen.z);

    const islandGeo = new THREE.BoxGeometry(5.2, 1.0, 1.8);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.3,
    });
    const kitchenIsland = new THREE.Mesh(islandGeo, islandMat);
    kitchenIsland.position.y = 0.5;
    kitchenIsland.castShadow = true;
    kitchenGroup.add(kitchenIsland);

    const counterTop = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.12, 1.9), floorMat);
    counterTop.position.y = 1.05;
    kitchenGroup.add(counterTop);

    for (let i = -1.8; i <= 1.8; i += 1.2) {
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24), velvetMat);
      stool.position.set(i, 0.8, 1.3);
      kitchenGroup.add(stool);
      const stoolLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 12), chromeMat);
      stoolLeg.position.set(i, 0.4, 1.3);
      kitchenGroup.add(stoolLeg);
    }
    buildingGroup.add(kitchenGroup);

    // Master Suite
    const masterGroup = new THREE.Group();
    masterGroup.position.set(anchors.master.x, 0, anchors.master.z);

    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 3.4), velvetMat);
    bedBase.position.y = 0.2;
    masterGroup.add(bedBase);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 3.0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    mattress.position.y = 0.55;
    masterGroup.add(mattress);

    const headboard = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 0.3), accentWallMat);
    headboard.position.set(0, 0.9, -1.6);
    masterGroup.add(headboard);
    buildingGroup.add(masterGroup);

    // Modern Ring Chandelier
    const chandelierGeo = new THREE.TorusGeometry(1.6, 0.06, 16, 64);
    const chandelierMat = new THREE.MeshStandardMaterial({
      color: profile.pillow,
      emissive: profile.accent,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
    });
    const chandelier = new THREE.Mesh(chandelierGeo, chandelierMat);
    chandelier.rotation.x = Math.PI / 2;
    chandelier.position.set(anchors.living.x, wallH - 0.7, anchors.living.z);
    buildingGroup.add(chandelier);

    // Lighting Rig
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.3);
    sunLight.position.set(20, 25, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -16;
    sunLight.shadow.camera.right = 16;
    sunLight.shadow.camera.top = 16;
    sunLight.shadow.camera.bottom = -16;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const lamp1 = new THREE.PointLight(0xbfdbfe, 1.2, 12, 1.5);
    lamp1.position.set(anchors.living.x, wallH - 1.2, anchors.living.z);
    scene.add(lamp1);

    const lamp2 = new THREE.PointLight(0xbfdbfe, 1.0, 10, 1.5);
    lamp2.position.set(anchors.kitchen.x, wallH - 1.2, anchors.kitchen.z);
    scene.add(lamp2);

    const lamp3 = new THREE.PointLight(0x38bdf8, 1.2, 12, 1.5);
    lamp3.position.set(anchors.feature.x, 1.2, anchors.feature.z);
    scene.add(lamp3);
    interiorLampsRef.current = [lamp1, lamp2, lamp3];

    // Background Skyline — hue shifts with neighborhood
    const skylineGroup = new THREE.Group();
    const seed = property.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    for (let i = -18; i <= 18; i += 2.5) {
      const towerHeight = 12 + Math.abs(Math.sin(i * 1.5 + seed * 0.01)) * 24;
      const towerGeo = new THREE.BoxGeometry(1.8, towerHeight, 1.8);
      const towerMat = new THREE.MeshStandardMaterial({
        color: profile.skylineHue,
        roughness: 0.8,
        metalness: 0.1,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(i * 3, towerHeight / 2 - 5, -28 - ((seed + i * 7) % 8));
      skylineGroup.add(tower);
    }
    scene.add(skylineGroup);

    // Animation Loop
    const clock = new THREE.Clock();
    let angle = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (poolWaterRef.current) {
        poolWaterRef.current.position.y = 0.12 + Math.sin(clock.getElapsedTime() * 2.5) * 0.015;
      }

      if (cameraRef.current) {
        // Only orbit in dollhouse — refs are updated synchronously on button click
        if (isAutoRotateRef.current && currentViewRef.current === 'dollhouse') {
          angle += delta * 0.12;
          const radius = orbitRadiusRef.current;
          targetCameraPosRef.current.x = Math.sin(angle) * radius;
          targetCameraPosRef.current.z = Math.cos(angle) * radius;
          targetCameraPosRef.current.y = orbitHeightRef.current;
          targetLookAtRef.current.set(0, profile.wallH * 0.22, 0);
        }

        const damp = currentViewRef.current === 'dollhouse' ? 3.2 : 9.5;
        cameraRef.current.position.x = THREE.MathUtils.damp(cameraRef.current.position.x, targetCameraPosRef.current.x, damp, delta);
        cameraRef.current.position.y = THREE.MathUtils.damp(cameraRef.current.position.y, targetCameraPosRef.current.y, damp, delta);
        cameraRef.current.position.z = THREE.MathUtils.damp(cameraRef.current.position.z, targetCameraPosRef.current.z, damp, delta);

        currentLookAtRef.current.x = THREE.MathUtils.damp(currentLookAtRef.current.x, targetLookAtRef.current.x, damp, delta);
        currentLookAtRef.current.y = THREE.MathUtils.damp(currentLookAtRef.current.y, targetLookAtRef.current.y, damp, delta);
        currentLookAtRef.current.z = THREE.MathUtils.damp(currentLookAtRef.current.z, targetLookAtRef.current.z, damp, delta);

        cameraRef.current.lookAt(currentLookAtRef.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      scene.clear();
      floorMeshRef.current = null;
      poolWaterRef.current = null;
      sunLightRef.current = null;
      ambientLightRef.current = null;
      interiorLampsRef.current = [];
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
    };
  }, [property.id]);

  useEffect(() => {
    if (!sunLightRef.current || !ambientLightRef.current || !sceneRef.current) return;

    if (lighting === 'golden-hour') {
      sunLightRef.current.color.setHex(0xfde68a);
      sunLightRef.current.intensity = 2.4;
      sunLightRef.current.position.set(24, 12, 14);
      ambientLightRef.current.color.setHex(0xe0f2fe);
      ambientLightRef.current.intensity = 0.7;
      sceneRef.current.background = new THREE.Color('#f0f7ff');
      interiorLampsRef.current.forEach((lamp) => { lamp.intensity = 1.6; });
    } else if (lighting === 'midday') {
      sunLightRef.current.color.setHex(0xffffff);
      sunLightRef.current.intensity = 2.8;
      sunLightRef.current.position.set(12, 35, 12);
      ambientLightRef.current.color.setHex(0xf8fafc);
      ambientLightRef.current.intensity = 0.9;
      sceneRef.current.background = new THREE.Color('#eef2f6');
      interiorLampsRef.current.forEach((lamp) => { lamp.intensity = 0.8; });
    } else if (lighting === 'twilight') {
      sunLightRef.current.color.setHex(0x38bdf8);
      sunLightRef.current.intensity = 0.8;
      sunLightRef.current.position.set(-18, 8, -12);
      ambientLightRef.current.color.setHex(0xdbeafe);
      ambientLightRef.current.intensity = 0.55;
      sceneRef.current.background = new THREE.Color('#cbd5e1');
      interiorLampsRef.current.forEach((lamp) => { lamp.intensity = 2.4; });
    }
  }, [lighting]);

  useEffect(() => {
    if (!floorMeshRef.current) return;
    const { marbleTex, woodTex, stoneTex } = createProceduralTextures();
    const mat = floorMeshRef.current.material as THREE.MeshStandardMaterial;

    if (finish === 'carrara-brass') {
      mat.map = marbleTex;
      mat.color.setHex(0xffffff);
      mat.roughness = 0.15;
    } else if (finish === 'french-oak') {
      mat.map = woodTex;
      mat.color.setHex(0xc29b74);
      mat.roughness = 0.35;
    } else if (finish === 'noir-matte') {
      mat.map = stoneTex;
      mat.color.setHex(0x1e293b);
      mat.roughness = 0.5;
    } else if (finish === 'brutalist-concrete') {
      mat.map = null;
      mat.color.setHex(0x94a3b8);
      mat.roughness = 0.7;
    }
    mat.needsUpdate = true;
  }, [finish]);

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-2xl overflow-hidden border border-slate-300 bg-[#eef2f6] shadow-xl select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating HUD: Property Title & VIP Client Badge */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-blue-200 flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-800">
              {property.status} Showcase
            </span>
          </div>

          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-md">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide font-display">
              {property.title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{property.location}</span>
              <span>•</span>
              <span className="text-blue-700 font-bold">AED {(property.priceAED / 1000000).toFixed(1)}M (${(property.priceUSD / 1000000).toFixed(1)}M)</span>
            </p>
          </div>
        </div>

        {/* Client Persona Pill & Quick Pitch Triggers */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2 shadow-md">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client In Room</p>
              <p className="text-xs font-bold text-emerald-700">{clientName} ({vipTier})</p>
            </div>
          </div>

          <button
            onClick={onOpenPitchInput}
            className="bg-white hover:bg-blue-50 px-3 py-2 rounded-xl border border-blue-300 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Configure Client Pitch & Required Sales Inputs"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Sales Setup</span>
          </button>
        </div>
      </div>

      {/* Active camera perspective chip */}
      <div className="absolute top-20 left-4 z-10 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-blue-200 shadow-md text-xs font-bold text-blue-900 inline-flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-blue-600" />
          Viewing: {availableViews.find((v) => v.id === currentView)?.label ?? currentView}
        </div>
      </div>

      {/* Laser Dimensions Overlay */}
      {showMeasurements && (
        <div className="absolute top-20 right-4 pointer-events-none z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-right shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
            <Ruler className="w-3 h-3 text-blue-600" />
            Laser Telemetry
          </p>
          <p className="text-xs font-bold text-slate-900 mt-0.5">{property.sqft.toLocaleString()} sq.ft / {property.sqm} m²</p>
          <p className="text-[11px] text-slate-600 font-medium">Ceilings: {sceneProfile.ceilingM}</p>
          <p className="text-[11px] text-emerald-700 font-bold">Rental Yield: {property.rentalYield}% net</p>
        </div>
      )}

      {/* Hotspot Floating Markers in Viewport */}
      {showHotspots && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {property.hotspots.map((hs, index) => (
            <button
              key={hs.id}
              onClick={() => setActiveHotspot(hs)}
              className="pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 group transition-transform active:scale-90"
              style={{
                top: `${30 + index * 12}%`,
                left: `${20 + index * 18}%`,
              }}
            >
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-blue-300 shadow-lg group-hover:scale-105 transition-transform">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-[11px] font-bold text-slate-900 whitespace-nowrap">{hs.title}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active Hotspot Modal Detail Card */}
      {activeHotspot && (
        <div className="absolute top-20 left-4 z-20 max-w-sm bg-white/98 backdrop-blur-md p-4 rounded-2xl border border-blue-300 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">{activeHotspot.category}</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 font-display">{activeHotspot.title}</h4>
            </div>
            <button
              onClick={() => setActiveHotspot(null)}
              className="text-slate-400 hover:text-slate-800 text-xs px-1.5 py-0.5 rounded-lg bg-slate-100"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activeHotspot.description}</p>
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Specification</span>
            <span className="font-bold text-emerald-700">{activeHotspot.spec}</span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-blue-50 border border-blue-300 text-blue-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* THREE.JS CONSOLIDATED BOTTOM DOCK */}
      <div
        className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-[94%] max-w-4xl transition-all duration-300 ease-out ${
          isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="bg-white/95 backdrop-blur-md px-4 py-1 rounded-t-xl border-t border-x border-slate-300 text-slate-700 hover:text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{isDockCollapsed ? 'Show 3D Tour Dock' : 'Hide Controls (Zen Mode)'}</span>
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-300 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            
            {/* 1. Cinematic Room View Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Camera className="w-3 h-3 text-blue-600" />
                Camera Perspective
              </label>
              <div className="grid grid-cols-3 gap-1">
                {availableViews.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => applyCameraView(v.id, { snap: true })}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                      currentView === v.id
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Lighting & Time of Day */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sun className="w-3 h-3 text-blue-600" />
                Solar Lighting Rig
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setLighting('golden-hour')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    lighting === 'golden-hour'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sunset className="w-3 h-3 text-blue-600" />
                  Sunset
                </button>
                <button
                  onClick={() => setLighting('midday')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    lighting === 'midday'
                      ? 'bg-sky-100 text-sky-900 border border-sky-300 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sun className="w-3 h-3 text-sky-600" />
                  Noon
                </button>
                <button
                  onClick={() => setLighting('twilight')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                    lighting === 'twilight'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Moon className="w-3 h-3 text-indigo-600" />
                  Night
                </button>
              </div>
            </div>

            {/* 3. Luxury Material Finish Swatches */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" />
                Finish Swatches
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setFinish('carrara-brass')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left truncate transition-all ${
                    finish === 'carrara-brass'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Calacatta Gold
                </button>
                <button
                  onClick={() => setFinish('french-oak')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left truncate transition-all ${
                    finish === 'french-oak'
                      ? 'bg-blue-100 text-blue-950 border border-blue-300 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  French Oak
                </button>
                <button
                  onClick={() => setFinish('noir-matte')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left truncate transition-all ${
                    finish === 'noir-matte'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Nero Marquina
                </button>
                <button
                  onClick={() => setFinish('brutalist-concrete')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left truncate transition-all ${
                    finish === 'brutalist-concrete'
                      ? 'bg-slate-300 text-slate-900 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Honed Travertine
                </button>
              </div>
            </div>

            {/* 4. Sales Actions & Toggles */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Presenter Tools</span>
                <span className="text-blue-700 font-bold">1-Click Actions</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (currentViewRef.current !== 'dollhouse') {
                      applyCameraView('dollhouse', { snap: true });
                      showToast('360° Cinematic Orbit Active');
                      return;
                    }
                    const next = !isAutoRotateRef.current;
                    isAutoRotateRef.current = next;
                    setIsAutoRotate(next);
                    showToast(next ? '360° Cinematic Orbit Active' : 'Auto Orbit Paused');
                  }}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 ${
                    isAutoRotate && currentView === 'dollhouse' ? 'bg-blue-100 text-blue-900 border border-blue-300 font-bold' : 'bg-slate-100 text-slate-700'
                  }`}
                  title="Toggle 360° Slow Orbit"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>360° Orbit</span>
                </button>

                <button
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  className={`p-1.5 rounded-lg text-[11px] ${
                    showMeasurements ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-slate-100 text-slate-700'
                  }`}
                  title="Toggle Room Dimensions"
                >
                  <Ruler className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (onShareLink) {
                      onShareLink();
                    } else {
                      navigator.clipboard.writeText(`https://proppilot.vip/tour/${property.id}?guest=${encodeURIComponent(clientName)}`);
                      showToast('Client VIP 3D Tour Link Copied to Clipboard!');
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all active:scale-95"
                  title="Share VIP 3D Link with Client"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Client Link</span>
                </button>

                <button
                  onClick={onExportPPTX}
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95"
                  title="Export PPTX Pitch Deck"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
