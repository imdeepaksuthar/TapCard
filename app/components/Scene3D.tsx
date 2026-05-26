'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  Float,
  RoundedBox,
} from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface Scene3DProps {
  scrollProgress: number;
}

function NFCCard({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const progressRef = useRef(0);
  const [screenSize, setScreenSize] = useState({ isMobile: false, isTablet: false, isDesktop: false });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setScreenSize({
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
        isDesktop: w >= 1024,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progressRef.current;

    // Shift to the right (X = 1.3) on desktop when p = 0, and transition to center as scrolled
    const targetPosX = screenSize.isDesktop ? 1.3 - p * 1.3 : 0;
    const targetRotY = p * Math.PI * 2.4 + mouseRef.current.x * 0.35;
    const targetRotX = -p * 0.45 + mouseRef.current.y * 0.22;
    
    // Shift card down on mobile/tablet so it sits perfectly in the spacer below text/buttons
    let targetPosY = -p * 1.8;
    if (!screenSize.isDesktop) {
      targetPosY = -0.5 - p * 1.3;
    }

    let baseScale = 1.0;
    if (screenSize.isMobile) {
      baseScale = 0.46; // Perfectly fits mobile aspect ratios without clipping
    } else if (screenSize.isTablet) {
      baseScale = 0.65; // Tablet fit
    }
    const targetScale = baseScale * (1 - p * 0.18);

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetPosX,
      0.07,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.07,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.07,
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetPosY,
      0.07,
    );
    const s = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      0.07,
    );
    groupRef.current.scale.setScalar(s);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.28}>
      <group ref={groupRef}>
        <RoundedBox args={[3.2, 2.0, 0.08]} radius={0.12} smoothness={8}>
          <meshPhysicalMaterial
            color="#050507"
            metalness={0.95}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.06}
            envMapIntensity={1.3}
          />
        </RoundedBox>

        {/* Front gradient sheen */}
        <mesh position={[0, 0, 0.042]}>
          <planeGeometry args={[3.12, 1.92]} />
          <meshPhysicalMaterial
            color="#1e3a8a"
            metalness={0.6}
            roughness={0.25}
            transparent
            opacity={0.5}
            emissive="#3b82f6"
            emissiveIntensity={0.18}
          />
        </mesh>

        {/* Brand strip */}
        <mesh position={[0, 0.7, 0.043]}>
          <planeGeometry args={[3.12, 0.02]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>

        {/* NFC gold chip */}
        <RoundedBox
          args={[0.45, 0.35, 0.015]}
          radius={0.04}
          smoothness={4}
          position={[-1.15, -0.55, 0.05]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.25} />
        </RoundedBox>

        {/* NFC wave rings */}
        <mesh position={[1.0, -0.4, 0.045]}>
          <ringGeometry args={[0.08, 0.1, 48]} />
          <meshBasicMaterial color="#93c5fd" />
        </mesh>
        <mesh position={[1.0, -0.4, 0.045]}>
          <ringGeometry args={[0.18, 0.2, 48]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.65} />
        </mesh>
        <mesh position={[1.0, -0.4, 0.045]}>
          <ringGeometry args={[0.28, 0.3, 48]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.35} />
        </mesh>

        {/* Back side accent */}
        <mesh position={[0, 0, -0.042]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.12, 1.92]} />
          <meshPhysicalMaterial
            color="#0a0a0f"
            metalness={0.9}
            roughness={0.2}
            emissive="#6366f1"
            emissiveIntensity={0.08}
          />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingParticles() {
  const positions = useMemo(() => {
    const count = 280;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null!);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
      ref.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#818cf8"
        size={0.025}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene3D({ scrollProgress }: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -3, -2]} intensity={0.5} color="#6366f1" />
        <pointLight position={[0, 2, 3]} intensity={0.9} color="#3b82f6" />
        <FloatingParticles />
        <NFCCard scrollProgress={scrollProgress} />
        <Environment preset="city" />
        <ContactShadows
          position={[0, -1.75, 0]}
          opacity={0.35}
          blur={2.5}
          far={4}
        />
      </Suspense>
    </Canvas>
  );
}