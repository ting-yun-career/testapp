import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import ConfigPanel from "../ConfigPanel";
import SliderControl from "../SliderControl";
import { mulberry32 } from "../../lib/random";

const NUCLEON_PIXEL_SIZE = 3.34;
const ELECTRON_PIXEL_SIZE = 1.5;
const AXIS_DOT_PIXEL_SIZE = 0.5;
const NUCLEUS_PACKING = 0.85;

const NUCLEON_SPACING = 0.166;
const NUCLEON_JITTER = 0.008;

const ORBIT_MIN_RADIUS = 2;
const ORBIT_MAX_RADIUS = 7.5;
const ORBIT_RADIUS_JITTER = 0.25;
const ORBIT_BASE_SPEED = 3;
const PRECESSION_RATE = 0.25;

const TAIL_SEGMENTS = 40;
const TAIL_ARC = Math.PI * 0.75;
const TAIL_ALPHA = 0.55;

const AXIS_LINE_LENGTH = 1000;
const AXIS_DOT_SPACING = 1;
const AXIS_DOT_EXTENT = 120;
const AXIS_DOT_OPACITY = 0.6;

const PROTON_COLOR = 0x8b1a1a;
const NEUTRON_COLOR = 0x8c8c8c;
const ELECTRON_COLOR = 0x111111;
const HAIRLINE_COLOR = 0x000000;
const HAIRLINE_OPACITY = 0.2;

const CAMERA_DISTANCE = 26;
const CAMERA_FAR = 4000;
const MIN_DISTANCE = 4;
const MAX_DISTANCE = 80;

const AXIS_DIRS: [number, number, number][] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

type AtomConfig = {
  protons: number;
  speed: number;
};

const DEFAULT_CONFIG: AtomConfig = {
  protons: 6,
  speed: 1,
};

type Electron = {
  index: number;
  tail: THREE.Line;
  tailPositions: Float32Array;
  radius: number;
  phase: number;
  quaternion: THREE.Quaternion;
  precessionAxis: THREE.Vector3;
  precessionRate: number;
  direction: number;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createDiscTexture(three: typeof THREE) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
  }
  const texture = new three.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = three.LinearFilter;
  return texture;
}

function createParticleMaterial(
  three: typeof THREE,
  color: number,
  map: THREE.Texture,
  pixelSize: number,
  pixelRatio: number,
) {
  return new three.PointsMaterial({
    color,
    map,
    size: pixelSize * pixelRatio,
    sizeAttenuation: false,
    alphaTest: 0.5,
  });
}

function fccLattice(count: number, spacing: number) {
  const points: { x: number; y: number; z: number; d: number }[] = [];
  const range = Math.ceil(Math.cbrt(count)) + 3;
  for (let i = -range; i <= range; i++) {
    for (let j = -range; j <= range; j++) {
      for (let k = -range; k <= range; k++) {
        if (((i + j + k) & 1) !== 0) continue;
        const x = i * spacing;
        const y = j * spacing;
        const z = k * spacing;
        points.push({ x, y, z, d: x * x + y * y + z * z });
      }
    }
  }
  points.sort((a, b) => a.d - b.d);
  return points.slice(0, count);
}

function buildStructure(
  three: typeof THREE,
  protons: number,
  pixelRatio: number,
) {
  const group = new three.Group();
  const random = mulberry32(1);
  const neutrons = protons;
  const total = protons + neutrons;

  const lattice = fccLattice(total, NUCLEON_SPACING / Math.SQRT2);

  const order = lattice.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const isProton = new Array<boolean>(total).fill(false);
  for (let i = 0; i < protons; i++) isProton[order[i]] = true;

  const protonPositions = new Float32Array(protons * 3);
  const neutronPositions = new Float32Array(neutrons * 3);
  let protonIndex = 0;
  let neutronIndex = 0;

  for (let i = 0; i < total; i++) {
    const point = lattice[i];
    const x = point.x + (random() * 2 - 1) * NUCLEON_JITTER;
    const y = point.y + (random() * 2 - 1) * NUCLEON_JITTER;
    const z = point.z + (random() * 2 - 1) * NUCLEON_JITTER;

    if (isProton[i]) {
      protonPositions[protonIndex * 3] = x;
      protonPositions[protonIndex * 3 + 1] = y;
      protonPositions[protonIndex * 3 + 2] = z;
      protonIndex++;
    } else {
      neutronPositions[neutronIndex * 3] = x;
      neutronPositions[neutronIndex * 3 + 1] = y;
      neutronPositions[neutronIndex * 3 + 2] = z;
      neutronIndex++;
    }
  }

  const disc = createDiscTexture(three);
  const protonMaterial = createParticleMaterial(
    three,
    PROTON_COLOR,
    disc,
    NUCLEON_PIXEL_SIZE,
    pixelRatio,
  );
  const neutronMaterial = createParticleMaterial(
    three,
    NEUTRON_COLOR,
    disc,
    NUCLEON_PIXEL_SIZE,
    pixelRatio,
  );
  const electronMaterial = createParticleMaterial(
    three,
    ELECTRON_COLOR,
    disc,
    ELECTRON_PIXEL_SIZE,
    pixelRatio,
  );

  const nucleus = new three.Group();

  const protonGeometry = new three.BufferGeometry();
  protonGeometry.setAttribute(
    "position",
    new three.BufferAttribute(protonPositions, 3),
  );
  nucleus.add(new three.Points(protonGeometry, protonMaterial));

  const neutronGeometry = new three.BufferGeometry();
  neutronGeometry.setAttribute(
    "position",
    new three.BufferAttribute(neutronPositions, 3),
  );
  nucleus.add(new three.Points(neutronGeometry, neutronMaterial));
  group.add(nucleus);

  const tailMaterial = new three.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });

  const electrons: Electron[] = [];
  const electronPositions = new Float32Array(protons * 3);

  for (let i = 0; i < protons; i++) {
    const t = protons > 1 ? i / (protons - 1) : 0.5;
    const radius =
      ORBIT_MIN_RADIUS +
      (ORBIT_MAX_RADIUS - ORBIT_MIN_RADIUS) * t +
      (random() * 2 - 1) * ORBIT_RADIUS_JITTER;

    const quaternion = new three.Quaternion().setFromEuler(
      new three.Euler(
        random() * Math.PI * 2,
        random() * Math.PI * 2,
        random() * Math.PI * 2,
      ),
    );

    const u = random() * 2 - 1;
    const theta = random() * Math.PI * 2;
    const planar = Math.sqrt(1 - u * u);
    const precessionAxis = new three.Vector3(
      planar * Math.cos(theta),
      planar * Math.sin(theta),
      u,
    );

    const tailPositions = new Float32Array((TAIL_SEGMENTS + 1) * 3);
    const tailColors = new Float32Array((TAIL_SEGMENTS + 1) * 4);
    for (let s = 0; s <= TAIL_SEGMENTS; s++) {
      tailColors[s * 4 + 3] = (1 - s / TAIL_SEGMENTS) * TAIL_ALPHA;
    }
    const tailGeometry = new three.BufferGeometry();
    tailGeometry.setAttribute(
      "position",
      new three.BufferAttribute(tailPositions, 3),
    );
    tailGeometry.setAttribute("color", new three.BufferAttribute(tailColors, 4));
    const tail = new three.Line(tailGeometry, tailMaterial);
    tail.frustumCulled = false;
    group.add(tail);

    electrons.push({
      index: i,
      tail,
      tailPositions,
      radius,
      phase: random() * Math.PI * 2,
      quaternion,
      precessionAxis,
      precessionRate: (random() * 2 - 1) * PRECESSION_RATE,
      direction: random() < 0.5 ? -1 : 1,
    });
  }

  const electronGeometry = new three.BufferGeometry();
  const electronAttribute = new three.BufferAttribute(electronPositions, 3);
  electronGeometry.setAttribute("position", electronAttribute);
  const electronPoints = new three.Points(electronGeometry, electronMaterial);
  electronPoints.frustumCulled = false;
  group.add(electronPoints);

  const axisLinePoints: number[] = [];
  const axisDotPoints: number[] = [];
  const dotCount = Math.floor(AXIS_DOT_EXTENT / AXIS_DOT_SPACING);
  for (const dir of AXIS_DIRS) {
    axisLinePoints.push(
      0,
      0,
      0,
      dir[0] * AXIS_LINE_LENGTH,
      dir[1] * AXIS_LINE_LENGTH,
      dir[2] * AXIS_LINE_LENGTH,
    );
    for (let t = 1; t <= dotCount; t++) {
      const d = t * AXIS_DOT_SPACING;
      axisDotPoints.push(dir[0] * d, dir[1] * d, dir[2] * d);
    }
  }

  const axisGeometry = new three.BufferGeometry();
  axisGeometry.setAttribute(
    "position",
    new three.Float32BufferAttribute(axisLinePoints, 3),
  );
  const axisMaterial = new three.LineBasicMaterial({
    color: HAIRLINE_COLOR,
    transparent: true,
    opacity: HAIRLINE_OPACITY,
  });
  const axisLines = new three.LineSegments(axisGeometry, axisMaterial);
  axisLines.frustumCulled = false;
  group.add(axisLines);

  const axisDotGeometry = new three.BufferGeometry();
  axisDotGeometry.setAttribute(
    "position",
    new three.Float32BufferAttribute(axisDotPoints, 3),
  );
  const axisDotMaterial = new three.PointsMaterial({
    color: HAIRLINE_COLOR,
    size: AXIS_DOT_PIXEL_SIZE * pixelRatio,
    sizeAttenuation: false,
    transparent: true,
    opacity: AXIS_DOT_OPACITY,
    depthWrite: false,
  });
  const axisDots = new three.Points(axisDotGeometry, axisDotMaterial);
  axisDots.frustumCulled = false;
  group.add(axisDots);

  const dispose = () => {
    disc.dispose();
    protonGeometry.dispose();
    neutronGeometry.dispose();
    electronGeometry.dispose();
    axisGeometry.dispose();
    axisDotGeometry.dispose();
    protonMaterial.dispose();
    neutronMaterial.dispose();
    electronMaterial.dispose();
    tailMaterial.dispose();
    axisMaterial.dispose();
    axisDotMaterial.dispose();
    for (const electron of electrons) electron.tail.geometry.dispose();
  };

  return {
    group,
    nucleus,
    electrons,
    electronPositions,
    electronAttribute,
    dispose,
  };
}

function Atom() {
  const [config, setConfig] = useState<AtomConfig>(DEFAULT_CONFIG);
  const [ready, setReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<typeof THREE | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const pixelRatioRef = useRef(1);

  const nucleusRef = useRef<THREE.Group | null>(null);
  const electronsRef = useRef<Electron[]>([]);
  const electronPositionsRef = useRef<Float32Array | null>(null);
  const electronAttributeRef = useRef<THREE.BufferAttribute | null>(null);

  const configRef = useRef(config);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    reducedMotionRef.current = prefersReducedMotion();

    Promise.all([
      import("three"),
      import("three/examples/jsm/controls/OrbitControls.js"),
    ]).then(([three, controlsModule]) => {
      if (cancelled) return;

      const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearAlpha(0);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      container.appendChild(renderer.domElement);

      const scene = new three.Scene();
      const camera = new three.PerspectiveCamera(45, 1, 0.1, CAMERA_FAR);
      camera.position.set(
        CAMERA_DISTANCE * 0.55,
        CAMERA_DISTANCE * 0.4,
        CAMERA_DISTANCE * 0.73,
      );

      const controls = new controlsModule.OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = MIN_DISTANCE;
      controls.maxDistance = MAX_DISTANCE;

      const resize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      threeRef.current = three;
      sceneRef.current = scene;
      pixelRatioRef.current = renderer.getPixelRatio();

      const scratch = new three.Vector3();
      const precession = new three.Quaternion();
      const orientation = new three.Quaternion();
      let frameId = 0;
      let last = performance.now();
      let elapsed = 0;

      const loop = (now: number) => {
        const delta = (now - last) / 1000;
        last = now;
        if (!reducedMotionRef.current) {
          elapsed += delta * configRef.current.speed;
        }

        const electrons = electronsRef.current;
        const electronPositions = electronPositionsRef.current;

        for (const electron of electrons) {
          precession.setFromAxisAngle(
            electron.precessionAxis,
            elapsed * electron.precessionRate,
          );
          orientation.copy(precession).multiply(electron.quaternion);

          const angle =
            electron.phase +
            (elapsed * ORBIT_BASE_SPEED * electron.direction) / electron.radius;

          scratch
            .set(
              Math.cos(angle) * electron.radius,
              0,
              Math.sin(angle) * electron.radius,
            )
            .applyQuaternion(orientation);
          if (electronPositions) {
            electronPositions[electron.index * 3] = scratch.x;
            electronPositions[electron.index * 3 + 1] = scratch.y;
            electronPositions[electron.index * 3 + 2] = scratch.z;
          }

          for (let t = 0; t <= TAIL_SEGMENTS; t++) {
            const tailAngle =
              angle - electron.direction * (t / TAIL_SEGMENTS) * TAIL_ARC;
            scratch
              .set(
                Math.cos(tailAngle) * electron.radius,
                0,
                Math.sin(tailAngle) * electron.radius,
              )
              .applyQuaternion(orientation);
            electron.tailPositions[t * 3] = scratch.x;
            electron.tailPositions[t * 3 + 1] = scratch.y;
            electron.tailPositions[t * 3 + 2] = scratch.z;
          }
          electron.tail.geometry.attributes.position.needsUpdate = true;
        }

        if (electronAttributeRef.current) {
          electronAttributeRef.current.needsUpdate = true;
        }

        const nucleus = nucleusRef.current;
        if (nucleus) {
          const viewportHeight = renderer.domElement.clientHeight;
          if (viewportHeight > 0) {
            const distance = camera.position.distanceTo(controls.target);
            const worldPerPixel =
              (2 * distance * Math.tan(((camera.fov * Math.PI) / 180) / 2)) /
              viewportHeight;
            nucleus.scale.setScalar(
              (NUCLEON_PIXEL_SIZE * NUCLEUS_PACKING * worldPerPixel) /
                NUCLEON_SPACING,
            );
          }
        }

        controls.update();
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(loop);
      };
      frameId = requestAnimationFrame(loop);

      setReady(true);

      teardown = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", resize);
        controls.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
        threeRef.current = null;
        sceneRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      if (teardown) teardown();
    };
  }, []);

  useEffect(() => {
    const three = threeRef.current;
    const scene = sceneRef.current;
    if (!ready || !three || !scene) return;

    const built = buildStructure(three, config.protons, pixelRatioRef.current);
    scene.add(built.group);
    nucleusRef.current = built.nucleus;
    electronsRef.current = built.electrons;
    electronPositionsRef.current = built.electronPositions;
    electronAttributeRef.current = built.electronAttribute;

    return () => {
      scene.remove(built.group);
      nucleusRef.current = null;
      electronsRef.current = [];
      electronPositionsRef.current = null;
      electronAttributeRef.current = null;
      built.dispose();
    };
  }, [ready, config.protons]);

  return (
    <>
      <div ref={containerRef} aria-hidden="true" className="fixed inset-0" />

      <ConfigPanel>
        <SliderControl
          label="Protons"
          value={config.protons}
          min={1}
          max={30}
          step={1}
          onChange={(v) => setConfig((c) => ({ ...c, protons: v }))}
        />
        <SliderControl
          label="Speed"
          value={config.speed}
          min={1}
          max={20}
          step={1}
          onChange={(v) => setConfig((c) => ({ ...c, speed: v }))}
        />
      </ConfigPanel>
    </>
  );
}

export default Atom;
