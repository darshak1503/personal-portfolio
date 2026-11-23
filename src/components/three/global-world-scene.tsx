"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerformanceMonitor, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useScrollProgressRef } from "@/components/providers/scroll-progress-provider";

const COLORS = ["#22d3ee", "#60a5fa", "#a78bfa", "#f472b6"] as const;
/** World units the camera travels along -z between the top and bottom of the page. */
const JOURNEY = 36;
const CAMERA_START_Z = 7;

/** Deterministic PRNG so the layout is stable between renders and lint-pure. */
function createRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

function CameraRig({ pointer }: { pointer: RefObject<{ x: number; y: number }> }) {
  const progress = useScrollProgressRef();
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = progress.current;
    const cam = state.camera;
    const sway = Math.sin(p * Math.PI * 3) * 0.9;

    cam.position.z = THREE.MathUtils.damp(cam.position.z, CAMERA_START_Z - p * JOURNEY, 3.2, dt);
    cam.position.x = THREE.MathUtils.damp(cam.position.x, pointer.current.x * 0.55 + sway, 2.4, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, pointer.current.y * 0.35 + 0.15, 2.4, dt);
    lookTarget.set(cam.position.x * 0.25, 0, cam.position.z - 9);
    cam.lookAt(lookTarget);
  });

  return null;
}

class EllipseCurve3 extends THREE.Curve<THREE.Vector3> {
  constructor(
    private rx: number,
    private ry: number,
  ) {
    super();
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2;
    return target.set(Math.cos(a) * this.rx, Math.sin(a) * this.ry, 0);
  }
}

const ORBIT_RX = 1.9;
const ORBIT_RY = 0.7;
const ORBIT_TILTS = [0, Math.PI / 3, -Math.PI / 3];

function ReactAtom(props: { position: [number, number, number]; scale?: number }) {
  const group = useRef<THREE.Group>(null);
  const electrons = useRef<(THREE.Mesh | null)[]>([]);
  const orbit = useMemo(
    () => new THREE.TubeGeometry(new EllipseCurve3(ORBIT_RX, ORBIT_RY), 160, 0.022, 8, true),
    [],
  );
  useEffect(() => () => orbit.dispose(), [orbit]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y += Math.min(delta, 0.05) * 0.22;
    group.current.rotation.x = Math.sin(t * 0.35) * 0.25;
    electrons.current.forEach((mesh, i) => {
      if (!mesh) return;
      const a = t * (1.3 + i * 0.25) + i * 2.1;
      mesh.position.set(Math.cos(a) * ORBIT_RX, Math.sin(a) * ORBIT_RY, 0);
    });
  });

  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={group} {...props}>
        <mesh>
          <icosahedronGeometry args={[0.36, 2]} />
          <meshStandardMaterial
            color="#a5f3fc"
            emissive="#22d3ee"
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={1.7}>
          <icosahedronGeometry args={[0.36, 1]} />
          <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.22} />
        </mesh>
        {ORBIT_TILTS.map((tilt, i) => (
          <group key={tilt} rotation={[0, 0, tilt]}>
            <mesh geometry={orbit}>
              <meshBasicMaterial color={i === 1 ? "#a78bfa" : "#60a5fa"} toneMapped={false} />
            </mesh>
            <mesh
              ref={(el) => {
                electrons.current[i] = el;
              }}
            >
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshBasicMaterial color="#f0f9ff" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
}

type GlyphKind = "tag" | "braces";

function useGlyphGeometries() {
  const geometries = useMemo(() => {
    const extrude: THREE.ExtrudeGeometryOptions = {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.022,
      bevelSegments: 2,
      curveSegments: 4,
    };
    const fromPoints = (points: [number, number][]) => {
      const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
      return new THREE.ExtrudeGeometry(shape, extrude).center();
    };
    const chevron: [number, number][] = [
      [-0.5, 0],
      [0.32, 0.62],
      [0.48, 0.44],
      [-0.16, 0],
      [0.48, -0.44],
      [0.32, -0.62],
    ];
    const brace = new THREE.CatmullRomCurve3(
      [
        [0.22, 0.72],
        [0.02, 0.62],
        [0.0, 0.18],
        [-0.2, 0.0],
        [0.0, -0.18],
        [0.02, -0.62],
        [0.22, -0.72],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
    );

    return {
      chevronLeft: fromPoints(chevron),
      chevronRight: fromPoints(chevron.map(([x, y]) => [-x, y])),
      slash: fromPoints([
        [0.12, 0.72],
        [0.32, 0.72],
        [-0.12, -0.72],
        [-0.32, -0.72],
      ]),
      braceLeft: new THREE.TubeGeometry(brace, 48, 0.065, 8, false),
    };
  }, []);

  useEffect(
    () => () => Object.values(geometries).forEach((geometry) => geometry.dispose()),
    [geometries],
  );
  return geometries;
}

function CodeGlyph({
  kind,
  color,
  geometries,
  ...props
}: {
  kind: GlyphKind;
  color: string;
  geometries: ReturnType<typeof useGlyphGeometries>;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  const material = (
    <meshStandardMaterial
      color="#0b1324"
      emissive={color}
      emissiveIntensity={1.15}
      metalness={0.55}
      roughness={0.28}
      toneMapped={false}
    />
  );

  return (
    <Float speed={1.4} rotationIntensity={0.9} floatIntensity={1.1}>
      <group {...props}>
        {kind === "tag" ? (
          <>
            <mesh geometry={geometries.chevronLeft} position={[-0.95, 0, 0]}>
              {material}
            </mesh>
            <mesh geometry={geometries.slash}>{material}</mesh>
            <mesh geometry={geometries.chevronRight} position={[0.95, 0, 0]}>
              {material}
            </mesh>
          </>
        ) : (
          <>
            <mesh geometry={geometries.braceLeft} position={[-0.55, 0, 0]}>
              {material}
            </mesh>
            <mesh geometry={geometries.braceLeft} position={[0.55, 0, 0]} rotation={[0, Math.PI, 0]}>
              {material}
            </mesh>
          </>
        )}
      </group>
    </Float>
  );
}

const SKELETON_LINES = [
  { w: 0.95, y: -0.12 },
  { w: 1.2, y: -0.26 },
  { w: 0.7, y: -0.4 },
];

function UIWindow({
  accent,
  ...props
}: {
  accent: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) {
  return (
    <Float speed={1} rotationIntensity={0.35} floatIntensity={0.8}>
      <group {...props}>
        <mesh position={[0, 0, -0.04]} scale={[2.3, 1.5, 1]}>
          <planeGeometry />
          <meshBasicMaterial color={accent} transparent opacity={0.16} toneMapped={false} />
        </mesh>
        <RoundedBox args={[2.2, 1.4, 0.05]} radius={0.05} smoothness={2}>
          <meshStandardMaterial color="#0a1222" metalness={0.35} roughness={0.4} />
        </RoundedBox>
        <mesh position={[0, 0.6, 0.03]}>
          <planeGeometry args={[2.12, 0.14]} />
          <meshBasicMaterial color="#132036" />
        </mesh>
        {["#f87171", "#fbbf24", "#34d399"].map((dot, i) => (
          <mesh key={dot} position={[-0.98 + i * 0.09, 0.6, 0.035]}>
            <circleGeometry args={[0.026, 12]} />
            <meshBasicMaterial color={dot} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[-0.78, -0.08, 0.03]}>
          <planeGeometry args={[0.46, 1.08]} />
          <meshBasicMaterial color="#0f1a30" />
        </mesh>
        <mesh position={[0.26, 0.26, 0.035]}>
          <planeGeometry args={[1.36, 0.36]} />
          <meshBasicMaterial color={accent} transparent opacity={0.55} toneMapped={false} />
        </mesh>
        {SKELETON_LINES.map((line) => (
          <mesh key={line.y} position={[-0.42 + line.w / 2, line.y, 0.035]}>
            <planeGeometry args={[line.w, 0.05]} />
            <meshBasicMaterial color="#334155" />
          </mesh>
        ))}
        <mesh position={[0.66, -0.5, 0.035]}>
          <planeGeometry args={[0.42, 0.13]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function ParticleField({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const random = createRandom(7);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = COLORS.map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() - 0.5) * 34;
      positions[i * 3 + 1] = (random() - 0.5) * 20;
      positions[i * 3 + 2] = CAMERA_START_Z + 4 - random() * (JOURNEY + 30);
      const color = palette[i % palette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.z += Math.min(delta, 0.05) * 0.012;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GridFloor() {
  const grid = useRef<THREE.GridHelper>(null);

  useEffect(() => {
    const material = grid.current?.material;
    if (material && !Array.isArray(material)) {
      material.transparent = true;
      material.opacity = 0.45;
      material.depthWrite = false;
    }
  }, []);

  useFrame((state) => {
    if (grid.current) grid.current.position.z = -JOURNEY / 2 + ((state.clock.elapsedTime * 0.8) % 1.5);
  });

  return (
    <gridHelper
      ref={grid}
      args={[90, 60, "#2563eb", "#1e3a8a"]}
      position={[0, -3.4, -JOURNEY / 2]}
    />
  );
}

function World({ compact }: { compact: boolean }) {
  const pointer = usePointer();
  const geometries = useGlyphGeometries();

  const layout = useMemo(() => {
    const random = createRandom(42);
    const glyphCount = compact ? 8 : 16;
    const windowCount = compact ? 3 : 7;
    const spread = compact ? 2.2 : 3.2;

    const glyphs = Array.from({ length: glyphCount }, (_, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const heroClearance = i < 2 ? 4 : 0;
      return {
        kind: (i % 3 === 1 ? "braces" : "tag") as GlyphKind,
        color: COLORS[i % COLORS.length],
        position: [
          side * (spread + heroClearance + random() * 3),
          (random() - 0.5) * 4.5,
          -4 - i * (JOURNEY / glyphCount) - random() * 1.5,
        ] as [number, number, number],
        rotation: [random() * 0.6 - 0.3, -side * (0.4 + random() * 0.4), random() * 0.5 - 0.25] as [
          number,
          number,
          number,
        ],
        scale: 0.45 + random() * 0.35,
      };
    });

    const windows = Array.from({ length: windowCount }, (_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      return {
        accent: COLORS[(i + 1) % COLORS.length],
        position: [
          side * (spread + 1.2 + random() * 2),
          (random() - 0.4) * 3.5,
          -9 - i * (JOURNEY / windowCount),
        ] as [number, number, number],
        rotation: [random() * 0.2 - 0.1, -side * (0.45 + random() * 0.3), random() * 0.12 - 0.06] as [
          number,
          number,
          number,
        ],
        scale: 0.7 + random() * 0.35,
      };
    });

    return { glyphs, windows };
  }, [compact]);

  return (
    <>
      <color attach="background" args={["#02040a"]} />
      <fog attach="fog" args={["#02040a", 5, 22]} />
      <hemisphereLight args={["#93c5fd", "#0b1020", 0.55]} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} color="#bfdbfe" />
      <directionalLight position={[-5, -2, 3]} intensity={0.8} color="#c4b5fd" />

      <CameraRig pointer={pointer} />
      <ReactAtom position={compact ? [1.8, 3.2, -7] : [3, 0.4, 0]} scale={compact ? 0.8 : 1} />
      {layout.glyphs.map((glyph, i) => (
        <CodeGlyph key={`glyph-${i}`} geometries={geometries} {...glyph} />
      ))}
      {layout.windows.map((win, i) => (
        <UIWindow key={`window-${i}`} {...win} />
      ))}
      <ParticleField count={compact ? 700 : 1600} />
      <GridFloor />
    </>
  );
}

export function GlobalWorldScene() {
  const [compact] = useState(() => window.matchMedia("(max-width: 768px)").matches);
  const [highQuality, setHighQuality] = useState(!compact);
  const [dpr, setDpr] = useState(compact ? 1 : 1.5);
  const [ready, setReady] = useState(false);

  return (
    <div className={`world-canvas${ready ? " world-canvas-ready" : ""}`} aria-hidden>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0.15, CAMERA_START_Z], fov: 55, near: 0.1, far: 60 }}
        gl={{ antialias: !highQuality, alpha: false, stencil: false, powerPreference: "high-performance" }}
        onCreated={() => setReady(true)}
      >
        <PerformanceMonitor
          onDecline={() => {
            setHighQuality(false);
            setDpr(1);
          }}
          flipflops={2}
          onFallback={() => {
            setHighQuality(false);
            setDpr(1);
          }}
        >
          <World compact={compact} />
          {highQuality ? (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.75} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur />
            </EffectComposer>
          ) : null}
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
