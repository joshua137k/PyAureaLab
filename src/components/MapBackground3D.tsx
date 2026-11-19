import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MapBackground3DProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

function createToonGradientMap(): THREE.DataTexture {
  const colors = new Uint8Array([
    100, 100, 100, 255,
    195, 195, 195, 255,
    255, 255, 255, 255,
  ]);
  const texture = new THREE.DataTexture(colors, 3, 1, THREE.RGBAFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

function createOutlineMaterial(thickness = 0.08, colorHex = 0x05070c): THREE.ShaderMaterial {
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
  group.add(new THREE.Mesh(geometry, material));
  group.add(new THREE.Mesh(geometry, outlineMeshMat(outlineMat)));
  return group;
}

function outlineMeshMat(m: THREE.Material) {
  return m;
}

export const MapBackground3D: React.FC<MapBackground3DProps> = ({ scrollContainerRef }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      120
    );
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const sun = new THREE.DirectionalLight(0xfffbeb, 1.75);
    sun.position.set(8, 14, 10);
    scene.add(sun);

    const gradientMap = createToonGradientMap();
    const outlineMat = createOutlineMaterial(0.085, 0x05070c);
    const outlineThin = createOutlineMaterial(0.048, 0x05070c);

    // Toon Palette
    const grassMat = new THREE.MeshToonMaterial({ color: 0x10b981, gradientMap });
    const rockMat = new THREE.MeshToonMaterial({ color: 0x1e293b, gradientMap });
    const pyBlueMat = new THREE.MeshToonMaterial({ color: 0x3776ab, gradientMap });
    const pyGoldMat = new THREE.MeshToonMaterial({ color: 0xffd43b, gradientMap });
    const redBugMat = new THREE.MeshToonMaterial({ color: 0xf43f5e, gradientMap });
    const purpleMat = new THREE.MeshToonMaterial({ color: 0x8b5cf6, gradientMap });
    const cloudMat = new THREE.MeshToonMaterial({ color: 0x1e2c45, gradientMap });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x05070c });
    const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Helper: Build a floating 3D Toon Island on the Left or Right side of the path
    function buildFloatingIsland(x: number, y: number, z: number, scale = 1.0) {
      const island = new THREE.Group();
      island.position.set(x, y, z);
      island.scale.setScalar(scale);

      // Rocky bottom cone
      const rockGeo = new THREE.CylinderGeometry(1.75, 0.45, 1.35, 7);
      const rock = makeCelMesh(rockGeo, rockMat, outlineMat);
      rock.position.y = -0.65;
      island.add(rock);

      // Grassy top cap
      const grassGeo = new THREE.CylinderGeometry(1.9, 1.75, 0.42, 7);
      const grass = makeCelMesh(grassGeo, grassMat, outlineMat);
      island.add(grass);

      worldGroup.add(island);
      return island;
    }

    // Helper: Cute Googly Eyes for props!
    function addCuteEyes(parent: THREE.Object3D, x: number, y: number, z: number, sep = 0.22) {
      const eyeG = new THREE.SphereGeometry(0.11, 12, 10);
      const pupG = new THREE.SphereGeometry(0.06, 10, 8);
      for (const s of [-1, 1]) {
        const ew = makeCelMesh(eyeG, whiteMat, outlineThin);
        ew.position.set(x + s * sep, y, z);
        const p = new THREE.Mesh(pupG, blackMat);
        p.position.set(x + s * sep, y, z + 0.08);
        parent.add(ew, p);
      }
    }

    // ========================================================================
    // DIORAMA 1 (Left Top): GIANT PYTHON COFFEE MUG + RETRO LAPTOP
    // ========================================================================
    const island1 = buildFloatingIsland(-5.2, 1.4, -1.5, 1.05);

    // Coffee Mug
    const mugGroup = new THREE.Group();
    mugGroup.position.set(-0.45, 0.65, 0.1);
    mugGroup.rotation.y = 0.4;
    const mugBody = makeCelMesh(new THREE.CylinderGeometry(0.52, 0.46, 0.9, 16), pyBlueMat, outlineMat);
    const mugHandle = makeCelMesh(new THREE.TorusGeometry(0.26, 0.08, 10, 18, Math.PI), pyGoldMat, outlineThin);
    mugHandle.position.set(0.5, 0, 0);
    mugHandle.rotation.z = -Math.PI / 2;
    mugGroup.add(mugBody, mugHandle);
    addCuteEyes(mugGroup, 0, 0.08, 0.48, 0.17);
    island1.add(mugGroup);

    // Steam bubbles rising from mug
    const steamBubbles: THREE.Group[] = [];
    const steamGeo = new THREE.SphereGeometry(0.14, 12, 10);
    for (let i = 0; i < 3; i++) {
      const b = makeCelMesh(steamGeo, whiteMat, outlineThin);
      mugGroup.add(b);
      steamBubbles.push(b);
    }

    // Retro Laptop next to mug
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.65, 0.25, 0.25);
    laptopGroup.rotation.y = -0.45;
    const baseBox = makeCelMesh(new THREE.BoxGeometry(0.95, 0.12, 0.7), rockMat, outlineThin);
    const screenBox = makeCelMesh(new THREE.BoxGeometry(0.95, 0.68, 0.1), rockMat, outlineThin);
    screenBox.position.set(0, 0.36, -0.32);
    screenBox.rotation.x = -0.2;
    const glowPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.5), screenGlowMat);
    glowPanel.position.set(0, 0.36, -0.26);
    glowPanel.rotation.x = -0.2;
    laptopGroup.add(baseBox, screenBox, glowPanel);
    island1.add(laptopGroup);

    // ========================================================================
    // DIORAMA 2 (Right Top): FUNNY CUTE BUG CHASING A GOLDEN APPLE + MUSHROOMS
    // ========================================================================
    const island2 = buildFloatingIsland(5.2, -2.2, -1.2, 1.08);

    // Bouncing Toon Mushroom
    const mushGroup = new THREE.Group();
    mushGroup.position.set(0.55, 0.2, -0.35);
    const stem = makeCelMesh(new THREE.CylinderGeometry(0.22, 0.28, 0.65, 12), pyGoldMat, outlineThin);
    stem.position.y = 0.32;
    const cap = makeCelMesh(
      new THREE.SphereGeometry(0.62, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
      redBugMat,
      outlineMat
    );
    cap.position.y = 0.6;
    mushGroup.add(stem, cap);
    addCuteEyes(mushGroup, 0, 0.35, 0.24, 0.11);
    island2.add(mushGroup);

    // Scurrying Googly-Eyed Bug ("The Code Bug!")
    const bugPivot = new THREE.Group();
    bugPivot.position.set(-0.25, 0.22, 0.15);
    const bugWalker = new THREE.Group();
    bugWalker.position.set(0.7, 0, 0);
    const bugShell = makeCelMesh(new THREE.SphereGeometry(0.38, 16, 12), redBugMat, outlineThin);
    bugShell.scale.set(1.1, 0.8, 1.3);
    bugWalker.add(bugShell);
    addCuteEyes(bugWalker, 0, 0.12, 0.42, 0.14);
    bugPivot.add(bugWalker);
    island2.add(bugPivot);

    // ========================================================================
    // DIORAMA 3 (Left Mid): WALKING 2D/3D MINI-ROBOT + ARCADE [?] BLOCK
    // ========================================================================
    const island3 = buildFloatingIsland(-5.3, -7.2, -1.4, 1.05);

    const robotGroup = new THREE.Group();
    robotGroup.position.set(0, 0.55, 0.15);
    const roboHead = makeCelMesh(new THREE.BoxGeometry(0.78, 0.65, 0.68), pyBlueMat, outlineMat);
    roboHead.position.y = 0.55;
    const roboBody = makeCelMesh(new THREE.BoxGeometry(0.62, 0.55, 0.52), pyGoldMat, outlineMat);
    const roboAntenna = makeCelMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), rockMat, outlineThin);
    roboAntenna.position.y = 1.02;
    const roboBulb = makeCelMesh(new THREE.SphereGeometry(0.12, 10, 10), redBugMat, outlineThin);
    roboBulb.position.y = 1.2;
    robotGroup.add(roboHead, roboBody, roboAntenna, roboBulb);
    addCuteEyes(robotGroup, 0, 0.58, 0.35, 0.18);
    island3.add(robotGroup);

    // Floating Mystery Block above island 3
    const mysteryBlock = makeCelMesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), pyGoldMat, outlineMat);
    mysteryBlock.position.set(-0.85, 2.2, 0);
    island3.add(mysteryBlock);

    // ========================================================================
    // DIORAMA 4 (Right Mid): BABY SNAKE PEEKING FROM PIPE + LEVITATING CRYSTALS
    // ========================================================================
    const island4 = buildFloatingIsland(5.3, -12.0, -1.5, 1.05);

    // Arcade Green Pipe
    const pipeGroup = new THREE.Group();
    pipeGroup.position.set(-0.2, 0.55, 0.1);
    const pipeTube = makeCelMesh(new THREE.CylinderGeometry(0.52, 0.52, 0.9, 16), grassMat, outlineMat);
    const pipeRim = makeCelMesh(new THREE.CylinderGeometry(0.6, 0.6, 0.26, 16), grassMat, outlineMat);
    pipeRim.position.y = 0.42;
    pipeGroup.add(pipeTube, pipeRim);
    island4.add(pipeGroup);

    // Baby Snake Peeking out of the Pipe!
    const babySnake = new THREE.Group();
    babySnake.position.set(-0.2, 1.0, 0.1);
    const babyHead = makeCelMesh(new THREE.SphereGeometry(0.42, 18, 14), pyBlueMat, outlineThin);
    babyHead.scale.set(1.15, 0.92, 1.05);
    babySnake.add(babyHead);
    addCuteEyes(babySnake, 0, 0.08, 0.38, 0.16);
    island4.add(babySnake);

    // Levitating Magic Crystals
    const crystalGeo = new THREE.OctahedronGeometry(0.42, 0);
    const crystal1 = makeCelMesh(crystalGeo, purpleMat, outlineThin);
    crystal1.position.set(0.85, 1.5, -0.2);
    island4.add(crystal1);

    // ========================================================================
    // DIORAMA 5 (Left Bottom): LEETCODE GOLDEN TROPHY TEMPLE
    // ========================================================================
    const island5 = buildFloatingIsland(-5.1, -17.0, -1.4, 1.08);
    const bigTrophy = new THREE.Group();
    bigTrophy.position.set(0, 0.65, 0);
    const cupPedestal = makeCelMesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), rockMat, outlineThin);
    const cupBowl = makeCelMesh(new THREE.CylinderGeometry(0.55, 0.25, 0.85, 14), pyGoldMat, outlineMat);
    cupBowl.position.y = 0.55;
    bigTrophy.add(cupPedestal, cupBowl);
    addCuteEyes(bigTrophy, 0, 0.62, 0.42, 0.16);
    island5.add(bigTrophy);

    // ========================================================================
    // FLOATING TOON CLOUDS WITH EYES & SPINNING PYTHON COINS
    // ========================================================================
    const clouds: { mesh: THREE.Group; baseX: number; speed: number }[] = [];
    const cloudCoords = [
      { x: -6.5, y: 4.2, z: -4.5, s: 0.9 },
      { x: 6.2, y: 2.5, z: -4.0, s: 1.0 },
      { x: -6.0, y: -4.5, z: -4.2, s: 0.85 },
      { x: 6.5, y: -9.0, z: -4.2, s: 0.95 },
      { x: -6.2, y: -14.5, z: -4.0, s: 0.9 },
      { x: 6.0, y: -19.0, z: -4.2, s: 1.0 },
    ];

    const puffGeo = new THREE.SphereGeometry(0.65, 14, 12);
    cloudCoords.forEach((cc, idx) => {
      const cg = new THREE.Group();
      cg.position.set(cc.x, cc.y, cc.z);
      cg.scale.setScalar(cc.s);
      const p1 = makeCelMesh(puffGeo, cloudMat, outlineThin);
      const p2 = makeCelMesh(puffGeo, cloudMat, outlineThin);
      p2.position.set(0.55, -0.1, 0);
      p2.scale.setScalar(0.8);
      const p3 = makeCelMesh(puffGeo, cloudMat, outlineThin);
      p3.position.set(-0.55, -0.12, 0);
      p3.scale.setScalar(0.78);
      cg.add(p1, p2, p3);
      addCuteEyes(cg, 0, 0.05, 0.58, 0.18);
      worldGroup.add(cg);
      clouds.push({ mesh: cg, baseX: cc.x, speed: 0.4 + (idx % 3) * 0.18 });
    });

    // Spinning Python Coins along the sides
    const coins: THREE.Group[] = [];
    const coinGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.12, 16);
    const coinCoords = [
      [-4.2, -0.8, -0.5],
      [4.3, 0.5, -0.5],
      [-4.4, -4.8, -0.5],
      [4.4, -6.2, -0.5],
      [-4.3, -10.2, -0.5],
      [4.2, -15.2, -0.5],
    ];
    coinCoords.forEach(([cx, cy, cz]) => {
      const coin = makeCelMesh(coinGeo, pyGoldMat, outlineThin);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(cx, cy, cz);
      worldGroup.add(coin);
      coins.push(coin);
    });

    // Mouse & Scroll state
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      mouse.y = -(e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let rafId = 0;
    let targetWorldY = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Sync vertical camera travel with either window scroll or main container scroll
      const scroller = scrollContainerRef.current;
      const scrollTop = Math.max(window.scrollY || 0, scroller ? scroller.scrollTop : 0);
      targetWorldY = Math.min(22, scrollTop * 0.0085);
      worldGroup.position.y = THREE.MathUtils.lerp(worldGroup.position.y, targetWorldY, 0.1);

      // Gentle 3D mouse parallax
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.65, 0.08);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.35, 0.08);
      camera.lookAt(0, 0, 0);

      // Bobbing islands
      island1.position.y = 1.4 + Math.sin(t * 1.6) * 0.16;
      island2.position.y = -2.2 + Math.cos(t * 1.5) * 0.16;
      island3.position.y = -7.2 + Math.sin(t * 1.7 + 1) * 0.16;
      island4.position.y = -12.0 + Math.cos(t * 1.6 + 2) * 0.16;
      island5.position.y = -17.0 + Math.sin(t * 1.5 + 3) * 0.16;

      // Steam bubbles rising from the Python Coffee Mug
      steamBubbles.forEach((b, idx) => {
        const progress = ((t * 0.75 + idx * 0.33) % 1);
        b.position.y = 0.55 + progress * 1.15;
        b.position.x = Math.sin(t * 3 + idx) * 0.12;
        const s = Math.sin(progress * Math.PI) * 1.1;
        b.scale.setScalar(Math.max(0.01, s));
      });

      // Scurrying Bug running in circles + Bouncing Mushroom
      bugPivot.rotation.y = t * 2.2;
      bugWalker.position.y = Math.abs(Math.sin(t * 12)) * 0.12;
      mushGroup.scale.y = 1 + Math.sin(t * 5) * 0.12;
      mushGroup.scale.x = 1 - Math.sin(t * 5) * 0.06;

      // Walking Mini-Robot & Spinning Mystery Block
      robotGroup.position.x = Math.sin(t * 1.8) * 0.55;
      robotGroup.rotation.y = Math.cos(t * 1.8) * 0.45;
      robotGroup.position.y = 0.55 + Math.abs(Math.sin(t * 7.2)) * 0.1;
      mysteryBlock.rotation.y = t * 1.5;
      mysteryBlock.position.y = 2.1 + Math.sin(t * 3.2) * 0.15;

      // Baby Snake peeking up and down from the green pipe!
      const peek = Math.max(-0.35, Math.sin(t * 2.0) * 0.42);
      babySnake.position.y = 0.95 + peek;
      babySnake.rotation.y = Math.sin(t * 3.5) * 0.35;
      crystal1.rotation.y = t * 2.0;
      crystal1.position.y = 1.5 + Math.sin(t * 2.8) * 0.18;

      // LeetCode Trophy spin
      bigTrophy.rotation.y = t * 1.4;
      bigTrophy.position.y = 0.65 + Math.sin(t * 2.5) * 0.12;

      // Drifting Clouds
      clouds.forEach((c, idx) => {
        c.mesh.position.x = c.baseX + Math.sin(t * c.speed + idx) * 0.45;
      });

      // Spinning Gold Coins
      coins.forEach((coin, idx) => {
        coin.rotation.z = t * 2.6 + idx;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      gradientMap.dispose();
    };
  }, [scrollContainerRef]);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    />
  );
};
