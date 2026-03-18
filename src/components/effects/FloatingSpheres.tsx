import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingSpheresProps {
  color?: string;
  count?: number;
  distort?: number;
}

const Sphere = ({ 
  position, 
  color, 
  size, 
  distort 
}: { 
  position: [number, number, number]; 
  color: string; 
  size: number;
  distort: number;
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={mesh} position={position}>
        <sphereGeometry args={[size, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
};

// Inner component for use inside a Canvas
export const FloatingSpheresInner = ({ 
  color = '#00d4ff', 
  count = 5, 
  distort = 0.4 
}: FloatingSpheresProps) => {
  const spheres = useMemo(() => Array.from({ length: count }, () => ({
    position: [
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 4 - 2,
    ] as [number, number, number],
    size: Math.random() * 0.5 + 0.3,
  })), [count]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {spheres.map((sphere, i) => (
        <Sphere
          key={i}
          position={sphere.position}
          color={color}
          size={sphere.size}
          distort={distort}
        />
      ))}
    </>
  );
};

// Standalone component with its own Canvas
export const FloatingSpheres = (props: FloatingSpheresProps) => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <FloatingSpheresInner {...props} />
      </Canvas>
    </div>
  );
};
