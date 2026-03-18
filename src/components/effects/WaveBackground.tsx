import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaveBackgroundProps {
  color1?: string;
  color2?: string;
  speed?: number;
  amplitude?: number;
}

// Inner component for use inside a Canvas
export const WaveBackgroundInner = ({ color1 = '#00d4ff', speed = 1, amplitude = 0.3 }: WaveBackgroundProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);
  
  useFrame(({ clock }) => {
    if (!geometryRef.current) return;
    
    const positions = geometryRef.current.attributes.position;
    const time = clock.getElapsedTime() * speed;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 2 + time) * Math.cos(y * 2 + time) * amplitude;
      positions.setZ(i, z);
    }
    
    positions.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <mesh ref={mesh} rotation={[-Math.PI / 3, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry ref={geometryRef} args={[15, 15, 64, 64]} />
        <meshBasicMaterial
          color={color1}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
};

// Standalone component with its own Canvas
export const WaveBackground = (props: WaveBackgroundProps) => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 3, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <WaveBackgroundInner {...props} />
      </Canvas>
    </div>
  );
};
