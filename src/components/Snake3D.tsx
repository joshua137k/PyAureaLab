import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { MascotMood, SnakeHat, SnakeTrick } from '../types';

interface Snake3DProps {
  mood: MascotMood;
  hat?: SnakeHat;
  trick?: SnakeTrick;
  isTyping?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
  onPet?: () => void;
}

// Crisp 3-step Toon gradient texture for authentic 2D Cel-Shading
function createToonGradientMap(): THREE.DataTexture {
  const colors = new Uint8Array([
    105, 105, 105, 255,
    205, 205, 205, 255,
    255, 255, 255, 255,
  ]);
  const texture = new THREE.DataTexture(colors, 3, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

// Inverted Hull ShaderMaterial for uniform 2D Black Ink Outlines
function createOutlineMaterial(thickness = 0.065, colorHex = 0x05070c): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uThickness: { value: thickness },
      uColor: { value: new THREE.Color(colorHex) },
    },
    vertexShader: `
      uniform float uThickness;
      void main() {
        vec3 newPosition = position + normal * uThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
}

function makeCelMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  outlineMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();
  const baseMesh = new THREE.Mesh(geometry, material);
  const outlineMesh = new THREE.Mesh(geometry, outlineMat);
  group.add(baseMesh);
  group.add(outlineMesh);
  return group;
}

export const Snake3D: React.FC<Snake3DProps> = ({
  mood,
  hat = 'auto',
  trick = 'none',
  isTyping = false,
  size = 80,
  className = '',
  onClick,
  onPet,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const moodRef = useRef<MascotMood>(mood);
  const hatRef = useRef<SnakeHat>(hat);
  const trickRef = useRef<{ name: SnakeTrick; startTime: number }>({ name: 'none', startTime: 0 });
  const isTypingRef = useRef<boolean>(isTyping);
  const petUntilRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    hatRef.current = hat;
  }, [hat]);

  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  useEffect(() => {
    if (trick !== 'none') {
      trickRef.current = { name: trick, startTime: clockRef.current.getElapsedTime() };
    }
  }, [trick]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.9, 6.8);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    dirLight.position.set(3.5, 6.0, 5.0);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.65);
    rimLight.position.set(-4.0, 2.0, -3.0);
    scene.add(rimLight);

    // Materials
    const gradientMap = createToonGradientMap();
    const outlineThick = createOutlineMaterial(0.072, 0x05070c);
    const outlineThin = createOutlineMaterial(0.045, 0x05070c);

    const bodyBlueMat = new THREE.MeshToonMaterial({ color: 0x3776ab, gradientMap });
    const bellyGoldMat = new THREE.MeshToonMaterial({ color: 0xffd43b, gradientMap });
    const cheekPinkMat = new THREE.MeshBasicMaterial({ color: 0xff7eb3 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const inkBlackMat = new THREE.MeshBasicMaterial({ color: 0x05070c });
    const tonguePinkMat = new THREE.MeshToonMaterial({ color: 0xf43f5e, gradientMap });
    const glassesGoldMat = new THREE.MeshToonMaterial({ color: 0xffd43b, gradientMap });
    const capNavyMat = new THREE.MeshToonMaterial({ color: 0x1e293b, gradientMap });

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Ground comic shadow disc
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 32),
      new THREE.MeshBasicMaterial({ color: 0x030509, transparent: true, opacity: 0.42 })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = -1.15;
    scene.add(shadowDisc);

    // --- 1. ARTICULATED 3D COIL & NECK BODY ---
    const NUM_SEGMENTS = 26;
    const segmentGroups: THREE.Group[] = [];
    const sphereGeo = new THREE.SphereGeometry(1, 20, 16);

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const t = i / (NUM_SEGMENTS - 1);
      let radius = 0.42;
      if (t < 0.25) radius = 0.12 + (t / 0.25) * 0.3;
      else if (t > 0.75) radius = 0.42 - ((t - 0.75) / 0.25) * 0.08;

      const segWrapper = new THREE.Group();
      const dorsal = makeCelMesh(sphereGeo, bodyBlueMat, outlineThick);
      dorsal.scale.set(radius, radius * 0.88, radius);
      segWrapper.add(dorsal);

      const belly = new THREE.Mesh(sphereGeo, bellyGoldMat);
      belly.scale.set(radius * 0.76, radius * 0.65, radius * 0.76);
      belly.position.set(0, -radius * 0.22, radius * 0.26);
      segWrapper.add(belly);

      rootGroup.add(segWrapper);
      segmentGroups.push(segWrapper);
    }

    // --- 2. 3D SCULPTED HEAD GROUP ---
    const headGroup = new THREE.Group();
    rootGroup.add(headGroup);

    const headGeo = new THREE.SphereGeometry(0.78, 28, 24);
    const cranium = makeCelMesh(headGeo, bodyBlueMat, outlineThick);
    cranium.scale.set(1.22, 0.96, 1.12);
    headGroup.add(cranium);

    const snoutGeo = new THREE.SphereGeometry(0.52, 24, 18);
    const snout = makeCelMesh(snoutGeo, bodyBlueMat, outlineThin);
    snout.scale.set(1.25, 0.68, 0.95);
    snout.position.set(0, -0.14, 0.48);
    headGroup.add(snout);

    const chin = makeCelMesh(snoutGeo, bellyGoldMat, outlineThin);
    chin.scale.set(1.08, 0.48, 0.82);
    chin.position.set(0, -0.34, 0.42);
    headGroup.add(chin);

    const cheekGeo = new THREE.SphereGeometry(0.18, 16, 12);
    const leftCheek = new THREE.Mesh(cheekGeo, cheekPinkMat);
    leftCheek.scale.set(1.2, 0.75, 0.5);
    leftCheek.position.set(-0.62, -0.12, 0.66);
    leftCheek.rotation.y = -0.45;
    const rightCheek = leftCheek.clone();
    rightCheek.position.x = 0.62;
    rightCheek.rotation.y = 0.45;
    headGroup.add(leftCheek, rightCheek);

    // --- 3. EXPRESSIVE 2D/3D EYES & BROWS ---
    const eyesGroup = new THREE.Group();
    headGroup.add(eyesGroup);

    const eyeSocketGeo = new THREE.SphereGeometry(0.26, 20, 16);
    const pupilGeo = new THREE.SphereGeometry(0.15, 16, 14);
    const highlightGeo = new THREE.SphereGeometry(0.055, 12, 10);
    const smallHighlightGeo = new THREE.SphereGeometry(0.028, 10, 8);

    function buildEye(sign: number) {
      const eyeWrap = new THREE.Group();
      eyeWrap.position.set(sign * 0.39, 0.12, 0.74);
      eyeWrap.rotation.y = sign * 0.22;

      const sclera = makeCelMesh(eyeSocketGeo, eyeWhiteMat, outlineThin);
      sclera.scale.set(1, 1.12, 0.55);
      eyeWrap.add(sclera);

      const pupilGroup = new THREE.Group();
      const pupil = new THREE.Mesh(pupilGeo, inkBlackMat);
      pupil.scale.set(1, 1.15, 0.5);
      pupil.position.set(0, 0, 0.11);
      pupilGroup.add(pupil);

      const hl1 = new THREE.Mesh(highlightGeo, eyeWhiteMat);
      hl1.position.set(-0.05, 0.06, 0.18);
      const hl2 = new THREE.Mesh(smallHighlightGeo, eyeWhiteMat);
      hl2.position.set(0.05, -0.05, 0.18);
      pupilGroup.add(hl1, hl2);

      eyeWrap.add(pupilGroup);
      return { eyeWrap, pupilGroup };
    }

    const leftEye = buildEye(-1);
    const rightEye = buildEye(1);
    eyesGroup.add(leftEye.eyeWrap, rightEye.eyeWrap);

    // Happy ^ ^ Eye Arcs
    const happyEyesGroup = new THREE.Group();
    const arcGeo = new THREE.TorusGeometry(0.18, 0.045, 12, 24, Math.PI);
    const leftArc = new THREE.Mesh(arcGeo, inkBlackMat);
    leftArc.position.set(-0.39, 0.08, 0.85);
    leftArc.rotation.y = -0.22;
    const rightArc = new THREE.Mesh(arcGeo, inkBlackMat);
    rightArc.position.set(0.39, 0.08, 0.85);
    rightArc.rotation.y = 0.22;
    happyEyesGroup.add(leftArc, rightArc);
    happyEyesGroup.visible = false;
    headGroup.add(happyEyesGroup);

    // Eyebrows
    const browGeo = new THREE.CapsuleGeometry(0.042, 0.26, 8, 12);
    const leftBrow = new THREE.Mesh(browGeo, inkBlackMat);
    leftBrow.rotation.z = Math.PI / 2;
    leftBrow.position.set(-0.4, 0.46, 0.78);
    const rightBrow = new THREE.Mesh(browGeo, inkBlackMat);
    rightBrow.rotation.z = Math.PI / 2;
    rightBrow.position.set(0.4, 0.46, 0.78);
    headGroup.add(leftBrow, rightBrow);

    // --- 4. MOUTH & FORKED 3D TONGUE ---
    const mouthGeo = new THREE.TorusGeometry(0.14, 0.032, 10, 20, Math.PI);
    const mouthMesh = new THREE.Mesh(mouthGeo, inkBlackMat);
    mouthMesh.position.set(0, -0.14, 0.96);
    mouthMesh.rotation.x = Math.PI;
    headGroup.add(mouthMesh);

    const tongueGroup = new THREE.Group();
    tongueGroup.position.set(0, -0.25, 0.94);
    const tongueStem = makeCelMesh(new THREE.CapsuleGeometry(0.035, 0.24, 8, 10), tonguePinkMat, outlineThin);
    tongueStem.rotation.x = Math.PI / 2;
    tongueStem.position.z = 0.14;
    tongueGroup.add(tongueStem);

    const forkGeo = new THREE.ConeGeometry(0.035, 0.14, 10);
    const forkL = makeCelMesh(forkGeo, tonguePinkMat, outlineThin);
    forkL.rotation.x = Math.PI / 2;
    forkL.rotation.z = 0.38;
    forkL.position.set(-0.045, 0, 0.29);
    const forkR = makeCelMesh(forkGeo, tonguePinkMat, outlineThin);
    forkR.rotation.x = Math.PI / 2;
    forkR.rotation.z = -0.38;
    forkR.position.set(0.045, 0, 0.29);
    tongueGroup.add(forkL, forkR);
    headGroup.add(tongueGroup);

    // --- 5. ACCESSORIES: GLASSES, 3D CROWN, 3D PROFESSOR CAP ---
    // A) 3D Glasses
    const glassesGroup = new THREE.Group();
    const rimGeo = new THREE.TorusGeometry(0.28, 0.038, 12, 28);
    const rimL = makeCelMesh(rimGeo, glassesGoldMat, outlineThin);
    rimL.position.set(-0.39, 0.12, 0.88);
    rimL.rotation.y = -0.18;
    const rimR = makeCelMesh(rimGeo, glassesGoldMat, outlineThin);
    rimR.position.set(0.39, 0.12, 0.88);
    rimR.rotation.y = 0.18;
    const bridge = makeCelMesh(new THREE.CapsuleGeometry(0.03, 0.18, 6, 8), glassesGoldMat, outlineThin);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.14, 0.92);
    glassesGroup.add(rimL, rimR, bridge);
    glassesGroup.visible = false;
    headGroup.add(glassesGroup);

    // B) 3D Royal Gold Crown
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, 0.75, 0.05);
    const crownBase = makeCelMesh(new THREE.CylinderGeometry(0.42, 0.36, 0.22, 16), glassesGoldMat, outlineThin);
    crownGroup.add(crownBase);
    const spikeGeo = new THREE.ConeGeometry(0.11, 0.24, 8);
    for (let s = 0; s < 5; s++) {
      const ang = (s / 5) * Math.PI * 2;
      const spike = makeCelMesh(spikeGeo, glassesGoldMat, outlineThin);
      spike.position.set(Math.cos(ang) * 0.34, 0.2, Math.sin(ang) * 0.34);
      crownGroup.add(spike);
    }
    const ruby = makeCelMesh(new THREE.SphereGeometry(0.08, 12, 10), tonguePinkMat, outlineThin);
    ruby.position.set(0, 0.02, 0.38);
    crownGroup.add(ruby);
    crownGroup.visible = false;
    headGroup.add(crownGroup);

    // C) 3D Professor Graduation Cap
    const gradGroup = new THREE.Group();
    gradGroup.position.set(0, 0.72, 0.02);
    gradGroup.rotation.z = -0.08;
    gradGroup.rotation.x = 0.1;
    const skullCap = makeCelMesh(new THREE.CylinderGeometry(0.46, 0.48, 0.2, 16), capNavyMat, outlineThin);
    const mortarBoard = makeCelMesh(new THREE.BoxGeometry(1.25, 0.07, 1.25), capNavyMat, outlineThin);
    mortarBoard.position.y = 0.12;
    mortarBoard.rotation.y = Math.PI / 4;
    const tassel = makeCelMesh(new THREE.CapsuleGeometry(0.04, 0.35, 6, 8), glassesGoldMat, outlineThin);
    tassel.position.set(0.55, -0.05, 0.25);
    tassel.rotation.z = -0.25;
    gradGroup.add(skullCap, mortarBoard, tassel);
    gradGroup.visible = false;
    headGroup.add(gradGroup);

    // --- 6. FLOATING 3D STARS & PETTING HEARTS ---
    const starsGroup = new THREE.Group();
    const starGeo = new THREE.OctahedronGeometry(0.16, 0);
    const star1 = makeCelMesh(starGeo, bellyGoldMat, outlineThin);
    star1.position.set(-1.35, 1.15, 0.3);
    const star2 = makeCelMesh(starGeo, bellyGoldMat, outlineThin);
    star2.scale.setScalar(0.75);
    star2.position.set(1.35, 1.35, -0.2);
    starsGroup.add(star1, star2);
    scene.add(starsGroup);

    // 3D Floating Hearts when petted!
    const heartsGroup = new THREE.Group();
    const heartSphere = new THREE.SphereGeometry(0.13, 12, 10);
    const heart1 = makeCelMesh(heartSphere, tonguePinkMat, outlineThin);
    const heart2 = makeCelMesh(heartSphere, tonguePinkMat, outlineThin);
    heart1.position.set(-0.9, 1.1, 0.5);
    heart2.position.set(0.95, 1.25, 0.4);
    heartsGroup.add(heart1, heart2);
    heartsGroup.visible = false;
    scene.add(heartsGroup);

    // Mouse tracking target
    const mouseTarget = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseTarget.x = Math.max(-1, Math.min(1, (e.clientX - cx) / 260));
      mouseTarget.y = Math.max(-1, Math.min(1, -(e.clientY - cy) / 260));
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) curvePoints.push(new THREE.Vector3());
    const spineCurve = new THREE.CatmullRomCurve3(curvePoints);

    const targetBlue = new THREE.Color(0x3776ab);
    const targetGold = new THREE.Color(0xffd43b);

    let animFrameId = 0;
    const clock = clockRef.current;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const currentMood = moodRef.current;
      const currentHat = hatRef.current;
      const isBeingPetted = t < petUntilRef.current;
      const typingActive = isTypingRef.current;

      // Active Trick check (duration ~0.95s)
      const activeTrick = trickRef.current;
      const trickElapsed = t - activeTrick.startTime;
      const isDoingTrick = activeTrick.name !== 'none' && trickElapsed >= 0 && trickElapsed < 0.95;
      const trickProgress = isDoingTrick ? trickElapsed / 0.95 : 0;

      // 1. Update Mood Colors
      if (currentMood === 'error') {
        targetBlue.setHex(0xf43f5e);
        targetGold.setHex(0xfda4af);
      } else if (currentMood === 'success') {
        targetBlue.setHex(0x10b981);
        targetGold.setHex(0xffd43b);
      } else if (currentMood === 'warning') {
        targetBlue.setHex(0xf59e0b);
        targetGold.setHex(0x3776ab);
      } else if (currentMood === 'running') {
        targetBlue.setHex(0x2563eb);
        targetGold.setHex(0xffd43b);
      } else {
        targetBlue.setHex(0x3776ab);
        targetGold.setHex(0xffd43b);
      }
      bodyBlueMat.color.lerp(targetBlue, 0.12);
      bellyGoldMat.color.lerp(targetGold, 0.12);

      // Accessories visibility
      glassesGroup.visible = currentHat === 'glasses' || (currentHat === 'auto' && currentMood === 'running');
      crownGroup.visible = currentHat === 'crown';
      gradGroup.visible = currentHat === 'grad';

      starsGroup.visible =
        currentMood === 'success' || currentMood === 'running' || currentMood === 'warning' || isDoingTrick;

      heartsGroup.visible = isBeingPetted;
      if (isBeingPetted) {
        heart1.position.y = 0.9 + ((t * 1.6) % 0.9);
        heart1.position.x = -0.85 + Math.sin(t * 6) * 0.15;
        heart2.position.y = 0.8 + (((t + 0.45) * 1.6) % 0.9);
        heart2.position.x = 0.85 + Math.cos(t * 6) * 0.15;
      }

      // Spin stars
      star1.rotation.y = t * 2.4;
      star1.position.y = 1.15 + Math.sin(t * 3.5) * 0.14;
      star2.rotation.y = -t * 2.8;
      star2.position.y = 1.3 + Math.cos(t * 3.2) * 0.14;

      // 2. Spine & Body Motion
      const wagSpeed =
        isBeingPetted || currentMood === 'success' || isDoingTrick ? 11.0 : currentMood === 'running' ? 5.5 : 3.2;
      const breath = Math.sin(t * 2.6) * 0.06;
      const danceWave = isDoingTrick && activeTrick.name === 'dance' ? Math.sin(t * 18) * 0.35 : 0;

      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const u = i / (NUM_SEGMENTS - 1);
        if (u < 0.68) {
          const coilU = u / 0.68;
          const angle = coilU * Math.PI * 2.35 - Math.PI * 0.85;
          const baseRadius = 0.85 + (1 - coilU) * 0.32;
          const tailWag = u < 0.28 ? Math.sin(t * wagSpeed - u * 12) * (0.28 - u) * 1.45 : 0;

          const x = Math.cos(angle) * baseRadius + tailWag + danceWave * coilU * 0.5;
          const z = Math.sin(angle) * baseRadius * 0.82;
          const y = -0.88 + coilU * 0.52 + (u < 0.2 ? (0.2 - u) * 0.9 : 0);
          curvePoints[i].set(x, y, z);
        } else {
          const neckU = (u - 0.68) / 0.32;
          const sway = Math.sin(t * 2.4 + neckU * 2.0) * 0.11 * neckU + danceWave * neckU;
          const x = sway;
          const y = -0.36 + neckU * 1.12 + breath * neckU;
          const z = -0.15 + Math.sin(neckU * Math.PI) * 0.24;
          curvePoints[i].set(x, y, z);
        }
      }

      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const u = i / (NUM_SEGMENTS - 1);
        segmentGroups[i].position.copy(spineCurve.getPointAt(u));
      }

      const topPt = curvePoints[NUM_SEGMENTS - 1];
      headGroup.position.set(topPt.x, topPt.y + 0.35, topPt.z + 0.12);

      // 3. Trick 3D Root Transforms (Backflip, Spin, Boop, Dance)
      if (isDoingTrick) {
        if (activeTrick.name === 'backflip') {
          rootGroup.position.y = Math.sin(trickProgress * Math.PI) * 1.15;
          rootGroup.rotation.x = -trickProgress * Math.PI * 2;
          rootGroup.rotation.y = 0;
        } else if (activeTrick.name === 'spin') {
          rootGroup.position.y = Math.sin(trickProgress * Math.PI) * 0.55;
          rootGroup.rotation.y = trickProgress * Math.PI * 4;
          rootGroup.rotation.x = 0;
        } else if (activeTrick.name === 'boop') {
          rootGroup.position.y = Math.sin(trickProgress * Math.PI * 2) * 0.32;
          rootGroup.rotation.x = 0;
          rootGroup.rotation.y = 0;
        } else {
          rootGroup.position.y = Math.abs(Math.sin(trickProgress * Math.PI * 4)) * 0.25;
          rootGroup.rotation.x = 0;
          rootGroup.rotation.y = 0;
        }
      } else {
        rootGroup.rotation.x = THREE.MathUtils.lerp(rootGroup.rotation.x, 0, 0.2);
        rootGroup.rotation.y = THREE.MathUtils.lerp(rootGroup.rotation.y, 0, 0.2);
        if (currentMood === 'success') {
          rootGroup.position.y = Math.abs(Math.sin(t * 6.5)) * 0.28;
        } else {
          rootGroup.position.y = THREE.MathUtils.lerp(rootGroup.position.y, 0, 0.15);
        }
      }

      // 4. Head Pose & Expression
      let targetYaw = mouseTarget.x * 0.38;
      let targetPitch = -mouseTarget.y * 0.24;
      let targetRoll = Math.sin(t * 1.8) * 0.06;

      if (isBeingPetted) {
        // Nuzzle into the user's petting hand!
        targetRoll = Math.sin(t * 8) * 0.24;
        targetPitch = -0.14 + Math.cos(t * 6) * 0.08;
      } else if (typingActive) {
        // Look left toward the code editor and nod approvingly!
        targetYaw = -0.45;
        targetPitch = Math.sin(t * 12) * 0.12;
      } else if (currentMood === 'running') {
        targetYaw = Math.sin(t * 4.2) * 0.38;
        targetPitch = 0.08 + Math.sin(t * 8.4) * 0.04;
        targetRoll = Math.cos(t * 4.2) * 0.08;
      } else if (currentMood === 'warning') {
        targetRoll = 0.32;
        targetPitch = -0.08;
      } else if (currentMood === 'error') {
        targetYaw = Math.sin(t * 22) * 0.18;
        targetPitch = 0.14;
      } else if (currentMood === 'success') {
        targetPitch = -0.12 + Math.sin(t * 6.5) * 0.12;
        targetRoll = Math.sin(t * 3.25) * 0.14;
      }

      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetYaw, 0.15);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetPitch, 0.15);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, targetRoll, 0.15);

      // 5. Eyes & Cheeks
      const blinkCycle = t % 3.8;
      const isBlinking = blinkCycle > 3.62;
      const cheekScale = isBeingPetted || currentMood === 'success' ? 1.45 : 1.2;
      leftCheek.scale.x = THREE.MathUtils.lerp(leftCheek.scale.x, cheekScale, 0.2);
      rightCheek.scale.x = THREE.MathUtils.lerp(rightCheek.scale.x, cheekScale, 0.2);

      if (currentMood === 'success' || isBeingPetted) {
        eyesGroup.visible = false;
        happyEyesGroup.visible = true;
      } else {
        eyesGroup.visible = true;
        happyEyesGroup.visible = false;
        const eyeScaleY = isBlinking ? 0.08 : currentMood === 'error' ? 0.65 : 1.0;
        leftEye.eyeWrap.scale.y = THREE.MathUtils.lerp(leftEye.eyeWrap.scale.y, eyeScaleY, 0.35);
        rightEye.eyeWrap.scale.y = THREE.MathUtils.lerp(rightEye.eyeWrap.scale.y, eyeScaleY, 0.35);

        if (isDoingTrick && activeTrick.name === 'boop') {
          // Cross-eyed boop!
          leftEye.pupilGroup.position.set(0.08, -0.04, 0);
          rightEye.pupilGroup.position.set(-0.08, -0.04, 0);
        } else {
          const px = typingActive
            ? -0.07
            : currentMood === 'running'
              ? Math.sin(t * 4.2) * 0.06
              : mouseTarget.x * 0.06;
          const py = mouseTarget.y * 0.05;
          leftEye.pupilGroup.position.set(px, py, 0);
          rightEye.pupilGroup.position.set(px, py, 0);
        }
      }

      // Eyebrow angles
      let browAngleL = Math.PI / 2 - 0.1;
      let browAngleR = Math.PI / 2 + 0.1;
      let browYL = 0.46;
      let browYR = 0.46;

      if (currentMood === 'error') {
        browAngleL = Math.PI / 2 - 0.48;
        browAngleR = Math.PI / 2 + 0.48;
        browYL = 0.4;
        browYR = 0.4;
      } else if (currentMood === 'warning') {
        browAngleL = Math.PI / 2 - 0.25;
        browAngleR = Math.PI / 2 - 0.15;
        browYL = 0.42;
        browYR = 0.54;
      } else if (currentMood === 'running') {
        browAngleL = Math.PI / 2 - 0.22;
        browAngleR = Math.PI / 2 + 0.22;
        browYL = 0.43;
        browYR = 0.43;
      } else if (currentMood === 'success' || isBeingPetted) {
        browYL = 0.52;
        browYR = 0.52;
      }

      leftBrow.rotation.z = THREE.MathUtils.lerp(leftBrow.rotation.z, browAngleL, 0.2);
      rightBrow.rotation.z = THREE.MathUtils.lerp(rightBrow.rotation.z, browAngleR, 0.2);
      leftBrow.position.y = THREE.MathUtils.lerp(leftBrow.position.y, browYL, 0.2);
      rightBrow.position.y = THREE.MathUtils.lerp(rightBrow.position.y, browYR, 0.2);

      // Mouth & Tongue
      if (currentMood === 'error') {
        mouthMesh.rotation.x = 0;
        mouthMesh.position.y = -0.22;
      } else {
        mouthMesh.rotation.x = Math.PI;
        mouthMesh.position.y = -0.14;
      }

      const tongueCycle = t % 3.2;
      const showTongue =
        (currentMood === 'idle' && tongueCycle < 0.75) ||
        currentMood === 'success' ||
        isBeingPetted ||
        isDoingTrick;

      const targetTongueScale = showTongue ? 1.0 : 0.01;
      tongueGroup.scale.z = THREE.MathUtils.lerp(tongueGroup.scale.z, targetTongueScale, 0.25);
      tongueGroup.scale.x = targetTongueScale;
      tongueGroup.scale.y = targetTongueScale;
      tongueGroup.rotation.x = showTongue ? Math.sin(t * 28) * 0.25 : 0;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      gradientMap.dispose();
    };
  }, [size]);

  const handleContainerMouseMove = () => {
    const now = clockRef.current.getElapsedTime();
    if (now > petUntilRef.current - 0.15) {
      onPet?.();
    }
    petUntilRef.current = now + 0.55;
  };

  return (
    <div
      ref={mountRef}
      data-snake-interactive="true"
      onClick={onClick}
      onMouseMove={handleContainerMouseMove}
      style={{ width: size, height: size }}
      className={`relative flex shrink-0 items-center justify-center select-none ${className}`}
    />
  );
};
