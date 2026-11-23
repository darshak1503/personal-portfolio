"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useRef } from "react";
import * as THREE from "three";

function SceneLightRig() {
  const light = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!light.current) return;
    const t = state.clock.elapsedTime;
    light.current.position.x = Math.sin(t * 0.35) * 2.4;
    light.current.position.z = Math.cos(t * 0.28) * 2;
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color="#93c5fd" />
      <pointLight ref={light} position={[0, 0, 3]} intensity={18} color="#a78bfa" />
    </>
  );
}

function HeroOrb() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.12;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    ref.current.rotation.x = state.pointer.y * 0.18;
    ref.current.rotation.z = state.pointer.x * 0.12;
  });

  return (
    <group ref={ref} position={[0.8, 0, 0]}>
      <Sphere args={[1.15, 128, 128]} scale={1.05}>
        <MeshDistortMaterial
          color="#1d4ed8"
          emissive="#1e3a8a"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.85}
          distort={0.28}
          speed={1.4}
        />
      </Sphere>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.75, 0.008, 8, 200]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[1.1, 0.4, 0.2]}>
        <torusGeometry args={[2.15, 0.006, 8, 200]} />
        <meshBasicMaterial color="#c4b5fd" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#02040a"]} />
      <fog attach="fog" args={["#02040a", 6, 14]} />
      <SceneLightRig />
      <Environment preset="night" />
      <HeroOrb />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.45} luminanceThreshold={0.55} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export function HeroScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5.2], fov: 38 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export function HeroFallback() {
  return (
    <div aria-hidden className="hero-scene-fallback">
      <div className="hero-scene-fallback-orb" />
    </div>
  );
}