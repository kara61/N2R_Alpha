import React from 'react';
import * as THREE from 'three';
import { RoofType } from '../../types';

interface GuttersProps {
  length: number;
  width: number;
  height: number;
  roofType: RoofType;
  roofHeight?: number;
  gutterMaterial: THREE.Material;
}

const Gutters: React.FC<GuttersProps> = ({ 
  length, 
  width, 
  height, 
  roofType, 
  roofHeight = 0,
  gutterMaterial 
}) => {
  // Common downspouts for all roof types
  const downspouts = [
    // Front-left downspout
    <mesh key="downspout-front-left" position={[-length / 2 + 0.2, height / 2, -width / 2 - 0.1]} material={gutterMaterial}>
      <boxGeometry args={[0.1, height, 0.1]} />
    </mesh>,
    
    // Front-right downspout
    <mesh key="downspout-front-right" position={[length / 2 - 0.2, height / 2, -width / 2 - 0.1]} material={gutterMaterial}>
      <boxGeometry args={[0.1, height, 0.1]} />
    </mesh>
  ];
  
  // Back downspouts vary based on roof type
  if (roofType === RoofType.Monopitch) {
    // For monopitch, back downspouts need to be taller
    downspouts.push(
      <mesh key="downspout-back-left" position={[-length / 2 + 0.2, height / 2 + roofHeight / 2, width / 2 + 0.1]} material={gutterMaterial}>
        <boxGeometry args={[0.1, height + roofHeight, 0.1]} />
      </mesh>,
      <mesh key="downspout-back-right" position={[length / 2 - 0.2, height / 2 + roofHeight / 2, width / 2 + 0.1]} material={gutterMaterial}>
        <boxGeometry args={[0.1, height + roofHeight, 0.1]} />
      </mesh>
    );
  } else {
    // For flat and gable roofs
    downspouts.push(
      <mesh key="downspout-back-left" position={[-length / 2 + 0.2, height / 2, width / 2 + 0.1]} material={gutterMaterial}>
        <boxGeometry args={[0.1, height, 0.1]} />
      </mesh>,
      <mesh key="downspout-back-right" position={[length / 2 - 0.2, height / 2, width / 2 + 0.1]} material={gutterMaterial}>
        <boxGeometry args={[0.1, height, 0.1]} />
      </mesh>
    );
  }
  
  // Gutters vary based on roof type
  let gutters = [];
  
  if (roofType === RoofType.Monopitch) {
    gutters = [
      // Front gutter (lower side)
      <mesh key="gutter-front" position={[0, height, -width / 2 - 0.1]} material={gutterMaterial}>
        <boxGeometry args={[length, 0.15, 0.2]} />
      </mesh>,
      
      // Back gutter (higher side)
      <mesh key="gutter-back" position={[0, height + roofHeight, width / 2 + 0.1]} material={gutterMaterial}>
        <boxGeometry args={[length, 0.15, 0.2]} />
      </mesh>
    ];
  } else {
    // For flat and gable roofs
    gutters = [
      // Front gutter
      <mesh key="gutter-front" position={[0, height, -width / 2 - 0.1]} material={gutterMaterial}>
        <boxGeometry args={[length, 0.15, 0.2]} />
      </mesh>,
      
      // Back gutter
      <mesh key="gutter-back" position={[0, height, width / 2 + 0.1]} material={gutterMaterial}>
        <boxGeometry args={[length, 0.15, 0.2]} />
      </mesh>
    ];
  }
  
  return (
    <group>
      {gutters}
      {downspouts}
    </group>
  );
};

export default Gutters;