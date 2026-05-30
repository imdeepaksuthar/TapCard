'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Text } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Scene3DProps {
  scrollProgress: React.RefObject<{ value: number }>;
}

/* ═══════════════════════════════════════════════════════════
 *  Premium NFC Business Card
 *  - Dark matte body with layered depth
 *  - Golden NFC chip with circuit-line detail
 *  - Animated pulsing NFC wave rings
 *  - Holographic gradient shimmer on front face
 *  - Data placeholder fields (name, title, logo, QR area)
 *  - Glowing accent edges
 *  - Back face with magnetic stripe + branding
 *  All meshStandardMaterial — no clearcoat / Environment for perf
 * ═══════════════════════════════════════════════════════════ */

function PulsingRings({ position }: { position: [number, number, number] }) {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Staggered pulse: scale up + fade out, then reset
    [ring1, ring2, ring3].forEach((ref, i) => {
      if (!ref.current) return;
      const phase = (t * 0.8 + i * 0.7) % 2.5;
      const scale = 1 + phase * 0.5;
      const opacity = Math.max(0, 1 - phase / 2.5);
      ref.current.scale.setScalar(scale);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.6;
    });
  });

  return (
    <group position={position}>
      <mesh ref={ring1}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring3}>
        <ringGeometry args={[0.12, 0.15, 32]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function HolographicShimmer() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const shaderData = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float shimmer = sin(vUv.x * 12.0 + vUv.y * 8.0 + uTime * 1.5) * 0.5 + 0.5;
        shimmer *= sin(vUv.x * 6.0 - uTime * 0.8) * 0.5 + 0.5;
        vec3 color = mix(
          vec3(0.235, 0.392, 0.98),  // blue
          vec3(0.659, 0.549, 0.98),  // purple
          shimmer
        );
        float alpha = shimmer * 0.12;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
  }), []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.044]}>
      <planeGeometry args={[3.08, 1.88]} />
      <shaderMaterial ref={matRef} {...shaderData} />
    </mesh>
  );
}

function NFCCard({ scrollProgress }: { scrollProgress: React.RefObject<{ value: number }> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef<'mobile' | 'tablet' | 'desktop'>('desktop');
  const edgeGlowRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      sizeRef.current = w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
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

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const p = scrollProgress.current?.value ?? 0;
    const size = sizeRef.current;

    const targetPosX = size === 'desktop' ? 1.3 - p * 1.3 : 0;
    const targetRotY = p * Math.PI * 2.4 + mouseRef.current.x * 0.3;
    const targetRotX = -p * 0.4 + mouseRef.current.y * 0.18;

    let targetPosY = -p * 1.8;
    if (size !== 'desktop') targetPosY = -0.5 - p * 1.3;

    const baseScale = size === 'mobile' ? 0.46 : size === 'tablet' ? 0.65 : 1.0;
    const targetScale = baseScale * (1 - p * 0.18);

    const g = groupRef.current;
    const l = THREE.MathUtils.lerp;
    g.position.x = l(g.position.x, targetPosX, 0.07);
    g.position.y = l(g.position.y, targetPosY, 0.07);
    g.rotation.x = l(g.rotation.x, targetRotX, 0.07);
    g.rotation.y = l(g.rotation.y, targetRotY, 0.07);
    g.scale.setScalar(l(g.scale.x, targetScale, 0.07));

    // Subtle edge glow pulse
    if (edgeGlowRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.03 + 0.08;
      (edgeGlowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.25}>
      <group ref={groupRef}>

        {/* ─── Card Body ─── */}
        <RoundedBox args={[3.3, 2.05, 0.07]} radius={0.14} smoothness={4}>
          <meshStandardMaterial color="#060609" metalness={0.9} roughness={0.15} />
        </RoundedBox>

        {/* Edge glow ring — sits just outside the body */}
        <mesh ref={edgeGlowRef} position={[0, 0, 0]}>
          <RoundedBox args={[3.36, 2.11, 0.02]} radius={0.16} smoothness={4}>
            <meshStandardMaterial
              color="#1e1b4b"
              metalness={0.7}
              roughness={0.3}
              emissive="#6366f1"
              emissiveIntensity={0.08}
              transparent
              opacity={0.5}
            />
          </RoundedBox>
        </mesh>

        {/* ─── Front Face ─── */}
        {/* Base dark gradient layer */}
        <mesh position={[0, 0, 0.037]}>
          <planeGeometry args={[3.2, 1.95]} />
          <meshStandardMaterial
            color="#0c0c18"
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>

        {/* Diagonal gradient overlay */}
        <mesh position={[0, 0, 0.039]}>
          <planeGeometry args={[3.2, 1.95]} />
          <meshStandardMaterial
            color="#1a1a40"
            metalness={0.4}
            roughness={0.4}
            transparent
            opacity={0.3}
            emissive="#3b4aad"
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Holographic shimmer effect */}
        <HolographicShimmer />

        {/* ─── Top Accent Stripe (gradient bar) ─── */}
        <mesh position={[0, 0.82, 0.041]}>
          <planeGeometry args={[3.2, 0.035]} />
          <meshBasicMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[-0.5, 0.82, 0.0415]}>
          <planeGeometry args={[1.1, 0.035]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0.8, 0.82, 0.0415]}>
          <planeGeometry args={[0.8, 0.035]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>

        {/* ─── Logo Area (top-left circle) ─── */}
        <mesh position={[-1.2, 0.55, 0.042]}>
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial
            color="#1e1e3a"
            metalness={0.5}
            roughness={0.3}
            emissive="#6366f1"
            emissiveIntensity={0.15}
          />
        </mesh>
        <mesh position={[-1.2, 0.55, 0.044]}>
          <ringGeometry args={[0.15, 0.18, 24]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
        </mesh>

        {/* ─── Name Placeholder ─── */}
        <Text
          position={[-0.58, 0.52, 0.044]}
          fontSize={0.16}
          fontWeight="bold"
          color="#e2e8f0"
          anchorX="left"
          anchorY="middle"
        >
          Card Setu
        </Text>

        {/* Title / Designation placeholder */}
        <Text
          position={[-0.58, 0.32, 0.044]}
          fontSize={0.085}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          Digital Business Card
        </Text>

        {/* ─── Decorative line separator ─── */}
        <mesh position={[0, 0.15, 0.042]}>
          <planeGeometry args={[2.6, 0.005]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.5} />
        </mesh>

        {/* ─── Contact placeholder rows ─── */}
        {/* Row 1: Phone icon + line */}
        <mesh position={[-1.0, -0.05, 0.042]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.45, -0.05, 0.042]}>
          <planeGeometry args={[0.9, 0.04]} />
          <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Row 2: Email icon + line */}
        <mesh position={[-1.0, -0.25, 0.042]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.45, -0.25, 0.042]}>
          <planeGeometry args={[1.1, 0.04]} />
          <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Row 3: Website icon + line */}
        <mesh position={[-1.0, -0.45, 0.042]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
        </mesh>
        <mesh position={[-0.45, -0.45, 0.042]}>
          <planeGeometry args={[0.8, 0.04]} />
          <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* ─── QR Code Area (bottom-right) ─── */}
        <mesh position={[1.1, -0.35, 0.041]}>
          <planeGeometry args={[0.55, 0.55]} />
          <meshStandardMaterial color="#0f172a" metalness={0.3} roughness={0.5} />
        </mesh>
        {/* QR pattern dots */}
        {[
          [-0.15, 0.15], [-0.15, -0.15], [0.15, 0.15], [0.15, -0.15],
          [0, 0], [-0.08, 0.08], [0.08, -0.08], [-0.08, -0.08], [0.08, 0.08],
          [0, 0.12], [0, -0.12], [0.12, 0], [-0.12, 0],
        ].map(([x, y], i) => (
          <mesh key={i} position={[1.1 + x, -0.35 + y, 0.043]}>
            <planeGeometry args={[0.04, 0.04]} />
            <meshBasicMaterial color="#475569" />
          </mesh>
        ))}
        {/* QR corner squares */}
        {[[-0.18, 0.18], [0.18, 0.18], [-0.18, -0.18]].map(([x, y], i) => (
          <mesh key={`qr-corner-${i}`} position={[1.1 + x, -0.35 + y, 0.043]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshBasicMaterial color="#64748b" />
          </mesh>
        ))}

        {/* ─── NFC Gold Chip ─── */}
        <group position={[-1.15, -0.65, 0.05]}>
          {/* Chip base */}
          <RoundedBox args={[0.5, 0.38, 0.018]} radius={0.04} smoothness={2}>
            <meshStandardMaterial
              color="#d4a017"
              metalness={0.95}
              roughness={0.2}
              emissive="#b8860b"
              emissiveIntensity={0.05}
            />
          </RoundedBox>
          {/* Chip circuit lines */}
          {[
            { pos: [0, 0, 0.01] as [number, number, number], size: [0.35, 0.003] as [number, number] },
            { pos: [0, 0.06, 0.01] as [number, number, number], size: [0.3, 0.002] as [number, number] },
            { pos: [0, -0.06, 0.01] as [number, number, number], size: [0.3, 0.002] as [number, number] },
            { pos: [0, 0.12, 0.01] as [number, number, number], size: [0.25, 0.002] as [number, number] },
            { pos: [0, -0.12, 0.01] as [number, number, number], size: [0.25, 0.002] as [number, number] },
          ].map((line, i) => (
            <mesh key={i} position={line.pos}>
              <planeGeometry args={line.size} />
              <meshBasicMaterial color="#c9960c" transparent opacity={0.7} />
            </mesh>
          ))}
          {/* Chip center pad */}
          <mesh position={[0, 0, 0.011]}>
            <planeGeometry args={[0.12, 0.12]} />
            <meshStandardMaterial color="#e8c84a" metalness={1} roughness={0.15} />
          </mesh>
        </group>

        {/* ─── NFC Animated Pulse Rings ─── */}
        <PulsingRings position={[1.1, 0.35, 0.046]} />

        {/* Static NFC icon indicator */}
        <mesh position={[1.1, 0.35, 0.045]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
        </mesh>

        {/* ─── Social icons row (bottom) ─── */}
        {[-0.15, 0, 0.15, 0.3].map((x, i) => (
          <mesh key={`social-${i}`} position={[0.3 + x * 1.5, -0.75, 0.042]}>
            <circleGeometry args={[0.055, 16]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.4}
              roughness={0.4}
              emissive={['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][i]}
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}

        {/* ─── Back Face ─── */}
        <mesh position={[0, 0, -0.037]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 1.95]} />
          <meshStandardMaterial
            color="#080810"
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>

        {/* Back: Magnetic stripe */}
        <mesh position={[0, 0.45, -0.039]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3.2, 0.3]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Back: Signature strip */}
        <mesh position={[0.3, -0.1, -0.039]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.8, 0.25]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.8} />
        </mesh>

        {/* Back: Brand accent line */}
        <mesh position={[0, -0.6, -0.039]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.5, 0.015]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.5} />
        </mesh>

        {/* Back: URL text placeholder */}
        <Text
          position={[0, -0.72, -0.04]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.07}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          cardsetu.com
        </Text>
      </group>
    </Float>
  );
}

// ── Particles ──
function FloatingParticles() {
  const positions = useMemo(() => {
    const count = 100;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null!);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#818cf8"
        size={0.02}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── Adaptive DPR ──
function AdaptiveDpr() {
  const { gl } = useThree();
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    gl.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
  }, [gl]);
  return null;
}

export default function Scene3D({ scrollProgress }: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <AdaptiveDpr />

        {/* Lighting rig — balanced for metallic card look */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[4, 4, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.35} color="#6366f1" />
        <pointLight position={[0, 2, 3]} intensity={0.6} color="#3b82f6" distance={10} />
        <pointLight position={[2, -1, 2]} intensity={0.3} color="#a855f7" distance={8} />

        <FloatingParticles />
        <NFCCard scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
