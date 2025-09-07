'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

function SpinningBox() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.6;
      meshRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#ff8c42" />
    </mesh>
  );
}

export default function ThreeScene() {
  return (
    <div
      style={{
        width: '100%',
        height: '60vh',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
      }}
    >
      <Canvas camera={{ position: [3, 3, 5], fov: 60 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <SpinningBox />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>
      </Canvas>
    </div>
  );
}
