'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Text, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

/* Product logo as a texture on the card face */
function CardLogo({ position }: { position: [number, number, number] }) {
  const texture = useTexture('/logo-dark.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  const img = texture.image as HTMLImageElement | undefined;
  const aspect = img ? img.width / img.height : 3;
  const h = 0.2;
  return (
    <mesh position={position}>
      <planeGeometry args={[h * aspect, h]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

/* Holographic shimmer overlay */
function HoloShimmer() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const shader = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main(){
          float s = sin(vUv.x*10.0 + vUv.y*6.0 + uTime*1.2)*0.5+0.5;
          s *= sin(vUv.x*5.0 - uTime*0.6)*0.5+0.5;
          vec3 c = mix(vec3(0.22,0.38,0.95), vec3(0.55,0.45,0.95), s);
          gl_FragColor = vec4(c, s*0.09);
        }`,
      transparent: true,
      side: THREE.FrontSide,
    }),
    []
  );
  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime(); });
  return (
    <mesh position={[0, 0, 0.043]}>
      <planeGeometry args={[2.92, 1.78]} />
      <shaderMaterial ref={matRef} {...shader} />
    </mesh>
  );
}

/* Subtle NFC pulse rings */
function NfcPulse({ position }: { position: [number, number, number] }) {
  const refs = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)];
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const phase = (t * 0.7 + i * 0.6) % 2.2;
      ref.current.scale.setScalar(1 + phase * 0.4);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - phase * 0.23);
    });
  });
  return (
    <group position={position}>
      {refs.map((ref, i) => (
        <mesh key={i} ref={ref}>
          <ringGeometry args={[0.06, 0.075, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* The centered, gently-rotating card (mouse parallax, no scroll coupling) */
function Card() {
  const groupRef = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const glowRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    const l = THREE.MathUtils.lerp;
    // Centered: gentle sway + mouse parallax, never scrolls away.
    const targetRotY = Math.sin(t * 0.3) * 0.32 + mouse.current.x * 0.28;
    const targetRotX = -0.06 + mouse.current.y * 0.14;
    g.rotation.y = l(g.rotation.y, targetRotY, 0.05);
    g.rotation.x = l(g.rotation.x, targetRotX, 0.05);
    if (glowRef.current) {
      const pulse = Math.sin(t * 1.8) * 0.02 + 0.07;
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  const W = 3.0, H = 1.89, D = 0.06, R = 0.12;
  const Z = D / 2 + 0.002;

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35}>
      <group ref={groupRef}>
        {/* Card body */}
        <RoundedBox args={[W, H, D]} radius={R} smoothness={4}>
          <meshStandardMaterial color="#0a0a14" metalness={0.9} roughness={0.18} />
        </RoundedBox>

        {/* Edge glow */}
        <mesh ref={glowRef}>
          <RoundedBox args={[W + 0.05, H + 0.05, 0.015]} radius={R + 0.02} smoothness={4}>
            <meshStandardMaterial color="#12122a" metalness={0.6} roughness={0.3} emissive="#6366f1" emissiveIntensity={0.07} transparent opacity={0.5} />
          </RoundedBox>
        </mesh>

        {/* Front face */}
        <mesh position={[0, 0, Z]}>
          <planeGeometry args={[W - 0.08, H - 0.08]} />
          <meshStandardMaterial color="#0b0b1c" metalness={0.55} roughness={0.35} emissive="#1a1a3a" emissiveIntensity={0.04} />
        </mesh>

        <HoloShimmer />

        {/* Top accent line */}
        <mesh position={[0, H / 2 - 0.06, Z + 0.001]}>
          <planeGeometry args={[W - 0.08, 0.012]} />
          <meshBasicMaterial color="#6366f1" />
        </mesh>

        <CardLogo position={[-W / 2 + 0.55, H / 2 - 0.25, Z + 0.003]} />

        <Text position={[-W / 2 + 0.22, H / 2 - 0.4, Z + 0.002]} fontSize={0.055} color="#64748b" anchorX="left" anchorY="middle" letterSpacing={0.05}>
          Digital Business Card
        </Text>

        <mesh position={[0, 0.12, Z + 0.001]}>
          <planeGeometry args={[W - 0.5, 0.002]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.3} />
        </mesh>

        {/* Contact rows */}
        {[
          { y: 0, color: '#3b82f6', label: '+91 99838 78055' },
          { y: -0.17, color: '#8b5cf6', label: 'hello@cardsetu.com' },
          { y: -0.34, color: '#06b6d4', label: 'www.cardsetu.com' },
        ].map((row, i) => (
          <group key={i} position={[-W / 2 + 0.28, row.y, Z + 0.001]}>
            <mesh>
              <circleGeometry args={[0.035, 12]} />
              <meshBasicMaterial color={row.color} transparent opacity={0.6} />
            </mesh>
            <Text position={[0.12, 0, 0.001]} fontSize={0.058} color="#94a3b8" anchorX="left" anchorY="middle">
              {row.label}
            </Text>
          </group>
        ))}

        {/* QR block */}
        <group position={[W / 2 - 0.38, -H / 2 + 0.35, Z + 0.001]}>
          <mesh>
            <planeGeometry args={[0.38, 0.38]} />
            <meshStandardMaterial color="#0c1022" metalness={0.2} roughness={0.5} />
          </mesh>
          {[[-0.1, 0.1], [0.1, 0.1], [-0.1, -0.1], [0.1, -0.1], [0, 0], [-0.05, 0.05], [0.05, -0.05], [0, 0.08], [0, -0.08]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.001]}>
              <planeGeometry args={[0.025, 0.025]} />
              <meshBasicMaterial color="#475569" transparent opacity={0.7} />
            </mesh>
          ))}
          {[[-0.12, 0.12], [0.12, 0.12], [-0.12, -0.12]].map(([x, y], i) => (
            <mesh key={`c${i}`} position={[x, y, 0.001]}>
              <planeGeometry args={[0.05, 0.05]} />
              <meshBasicMaterial color="#64748b" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>

        {/* NFC chip */}
        <group position={[-W / 2 + 0.35, -H / 2 + 0.28, Z + 0.005]}>
          <RoundedBox args={[0.36, 0.26, 0.012]} radius={0.03} smoothness={2}>
            <meshStandardMaterial color="#c9960c" metalness={0.95} roughness={0.2} emissive="#a07008" emissiveIntensity={0.04} />
          </RoundedBox>
          {[-0.07, -0.035, 0, 0.035, 0.07].map((y, i) => (
            <mesh key={i} position={[0, y, 0.008]}>
              <planeGeometry args={[0.24 - Math.abs(y) * 1.2, 0.0015]} />
              <meshBasicMaterial color="#b8860b" transparent opacity={0.6} />
            </mesh>
          ))}
          <mesh position={[0, 0, 0.008]}>
            <planeGeometry args={[0.07, 0.07]} />
            <meshStandardMaterial color="#daa520" metalness={1} roughness={0.15} />
          </mesh>
        </group>

        {/* NFC pulse */}
        <NfcPulse position={[W / 2 - 0.3, H / 2 - 0.28, Z + 0.002]} />
        <mesh position={[W / 2 - 0.3, H / 2 - 0.28, Z + 0.001]}>
          <circleGeometry args={[0.03, 12]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeroCard3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 3, 5]} intensity={1.2} />
        <directionalLight position={[-3, -2, -2]} intensity={0.3} color="#6366f1" />
        <pointLight position={[0, 1.5, 3]} intensity={0.55} color="#3b82f6" distance={8} />
        <Card />
      </Suspense>
    </Canvas>
  );
}
