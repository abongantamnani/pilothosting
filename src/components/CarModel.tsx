"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export interface CarModelProps {
  motion: { x: number[]; y: number[]; z: number[] };
  gpsSpeed: number;
}

const CarModel: React.FC<CarModelProps> = ({ motion, gpsSpeed }) => {
  const ref = useRef<any>();

  // Load your 3D model
  const { scene } = useGLTF("/models/car.glb");

  useFrame(() => {
    if (ref.current && gpsSpeed > 0) {
      const lastIndex = motion.x.length - 1;
      ref.current.rotation.x = motion.x[lastIndex] * 2;
      ref.current.rotation.y = motion.y[lastIndex] * 2;
      ref.current.rotation.z = motion.z[lastIndex] * 2;
    }
  });

  return <primitive ref={ref} object={scene} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />;
};

export default CarModel;
