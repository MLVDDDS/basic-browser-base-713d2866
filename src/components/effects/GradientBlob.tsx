import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface GradientBlobProps {
  color1?: string;
  color2?: string;
  speed?: number;
  distort?: number;
}

const Blob = ({ color1 = '#00d4ff', speed = 2, distort = 0.5 }: GradientBlobProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
    mesh.current.rotation.y = clock.getElapsedTime() * 0.1;
  });

  return (
    <mesh ref={mesh} scale={2}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={color1}
        distort={distort}
        speed={speed}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// Inner component for use inside a Canvas
export const GradientBlobInner = (props: GradientBlobProps) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color={props.color2 || '#7c3aed'} />
      <Blob {...props} />
    </>
  );
};

// Standalone component with its own Canvas
export const GradientBlob = (props: GradientBlobProps) => {
  return (
    <div className="absolute inset-0 -z-10 flex items-center justify-center">
      <div className="w-[400px] h-[400px]">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <GradientBlobInner {...props} />
        </Canvas>
      </div>
    </div>
  );
};
