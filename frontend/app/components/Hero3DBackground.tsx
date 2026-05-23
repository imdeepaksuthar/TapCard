'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, Float } from '@react-three/drei';

interface Hero3DBackgroundProps {
  primaryColor: string;
  secondaryColor: string;
}

export default function Hero3DBackground({ primaryColor, secondaryColor }: Hero3DBackgroundProps) {
  return (
    <div 
      className="absolute inset-0 z-0 h-[280px] w-full overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
    >
      <Canvas camera={{ position: [0, 0, 4] }} dpr={[1, 2]}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-5, -5, -2]} intensity={1.5} color={secondaryColor} />
        
        {/* Main Floating Liquid Sphere */}
        <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
          <Sphere args={[1.4, 64, 64]} position={[-1.2, 0.2, -0.5]}>
            <MeshDistortMaterial
              color={primaryColor}
              distort={0.4}
              speed={1.5}
              roughness={0.1}
              metalness={0.4}
            />
          </Sphere>
        </Float>

        {/* Secondary Floating Liquid Sphere */}
        <Float speed={2.5} rotationIntensity={2} floatIntensity={2}>
          <Sphere args={[0.9, 64, 64]} position={[1.4, -0.4, -1]}>
            <MeshDistortMaterial
              color={secondaryColor}
              distort={0.5}
              speed={2}
              roughness={0.2}
              metalness={0.6}
            />
          </Sphere>
        </Float>

        {/* Tiny Floating Accent */}
        <Float speed={3} rotationIntensity={2} floatIntensity={3}>
          <Sphere args={[0.4, 32, 32]} position={[0.5, 1.2, -2]}>
            <MeshDistortMaterial
              color="#ffffff"
              distort={0.3}
              speed={2.5}
              roughness={0}
              metalness={0.8}
            />
          </Sphere>
        </Float>

        {/* Realistic Reflections */}
        <Environment preset="city" />
      </Canvas>
      {/* Subtle glass overlay for a premium frosted look over the 3D scene */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] mix-blend-overlay" />
    </div>
  );
}
