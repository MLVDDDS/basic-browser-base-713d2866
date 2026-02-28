import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
}

// Inner component for use inside a Canvas
export const ParticleFieldInner = ({ count = 1000, color = '#00d4ff', speed = 0.2, size = 0.02 }: ParticleFieldProps) => {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      velocities[i * 3] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
    }
    
    return { positions, velocities };
  }, [count, speed]);

  useFrame(() => {
    if (!mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] += particles.velocities[i * 3] * 0.01;
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * 0.01;
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2] * 0.01;
      
      // Wrap around
      if (Math.abs(positions[i * 3]) > 5) positions[i * 3] *= -0.9;
      if (Math.abs(positions[i * 3 + 1]) > 5) positions[i * 3 + 1] *= -0.9;
      if (Math.abs(positions[i * 3 + 2]) > 5) positions[i * 3 + 2] *= -0.9;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y += 0.0005;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Standalone component with its own Canvas
export const ParticleField = (props: ParticleFieldProps) => {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <ParticleFieldInner {...props} />
      </Canvas>
    </div>
  );
};
