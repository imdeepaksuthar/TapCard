'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, Float, TorusKnot } from '@react-three/drei';
import { derivePalette } from '@/lib/colorUtils';
import MeshGradient from './MeshGradient';
import * as THREE from 'three';

interface Hero3DBackgroundProps {
  primaryColor: string;
  secondaryColor: string;
  isDark?: boolean;
}

// Camera rig that gently follows pointer for a parallax tilt feel.
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  useFrame(() => {
    if (!ref.current) return;
    // Smoothly lerp group rotation toward the cursor position.
    const targetX = mouse.y * 0.18;
    const targetY = mouse.x * 0.28;
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.06;
    ref.current.rotation.y += (targetY - ref.current.rotation.y) * 0.06;
  });
  return <group ref={ref}>{children}</group>;
}

export default function Hero3DBackground({ primaryColor, secondaryColor, isDark = true }: Hero3DBackgroundProps) {
  const palette = useMemo(() => derivePalette(primaryColor), [primaryColor]);

  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
      {/* Animated mesh gradient backdrop */}
      <MeshGradient color={primaryColor} isDark={isDark} intensity={0.7} />

      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 2]} className="!absolute inset-0">
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, -5, -2]} intensity={1.4} color={palette.accent} />

        <ParallaxRig>
          {/* Main floating liquid sphere */}
          <Float speed={2} rotationIntensity={1.2} floatIntensity={1.4}>
            <Sphere args={[1.4, 64, 64]} position={[-1.2, 0.2, -0.5]}>
              <MeshDistortMaterial
                color={palette.primary}
                distort={0.42}
                speed={1.6}
                roughness={0.1}
                metalness={0.55}
              />
            </Sphere>
          </Float>

          {/* Secondary distorted sphere */}
          <Float speed={2.5} rotationIntensity={1.8} floatIntensity={2}>
            <Sphere args={[0.9, 64, 64]} position={[1.4, -0.4, -1]}>
              <MeshDistortMaterial
                color={palette.accent}
                distort={0.5}
                speed={2.1}
                roughness={0.18}
                metalness={0.7}
              />
            </Sphere>
          </Float>

          {/* New: subtle torus knot adds geometric depth */}
          <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.2}>
            <TorusKnot args={[0.55, 0.16, 128, 16]} position={[1.0, 0.9, -1.6]}>
              <meshStandardMaterial
                color={palette.complement}
                roughness={0.25}
                metalness={0.85}
                emissive={palette.glow}
                emissiveIntensity={0.18}
              />
            </TorusKnot>
          </Float>

          {/* Tiny floating accent */}
          <Float speed={3} rotationIntensity={2} floatIntensity={3}>
            <Sphere args={[0.4, 32, 32]} position={[0.5, 1.2, -2]}>
              <MeshDistortMaterial
                color="#ffffff"
                distort={0.3}
                speed={2.5}
                roughness={0}
                metalness={0.85}
              />
            </Sphere>
          </Float>
        </ParallaxRig>

        <Environment preset="city" />
      </Canvas>

      {/* Subtle glass overlay for a premium frosted look */}
      <div className="pointer-events-none absolute inset-0 bg-white/5 backdrop-blur-[2px] mix-blend-overlay" />
    </div>
  );
}