"use client";
import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";

const Cube = ({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}) => {
  const cubeRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0.005;
      cubeRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={cubeRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const RotatingCubes = () => {
  return (
    <Canvas resize={{ debounce: 0 }} camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={5} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <Cube position={[-1, 0, 0]} scale={[2, 2, 2]} color="#be185d" />
        <Cube position={[1.5, 0, 0]} scale={[1, 1, 1]} color="#6d28d9" />
      </Suspense>
    </Canvas>
  );
};

export default RotatingCubes;
