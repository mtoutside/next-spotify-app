import React from 'react';
import ThreeScene from '../components/ThreeScene';

export default function ThreePage() {
  return (
    <main style={{ padding: '24px', display: 'grid', gap: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Three.js デモ</h1>
      <p>React Three Fiber で回転するボックスを表示します。</p>
      <ThreeScene />
    </main>
  );
}
