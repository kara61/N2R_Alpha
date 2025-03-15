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
  renderOrder?: number; // Add renderOrder prop with default value
}

const Gutters: React.FC<GuttersProps> = ({ 
  length, 
  width, 
  height, 
  roofType, 
  roofHeight = 0,
  gutterMaterial,
  renderOrder = 3 // Add renderOrder prop with default value
}) => {
  // Common gutter dimensions
  const gutterWidth = 0.2;
  const gutterHeight = 0.15;
  const gutterOffset = 0.15; // Offset from wall surface to prevent z-fighting
  
  // Common downspouts for all roof types
  const downspouts = [
    // Front-left downspout - moved slightly outward
    <mesh key="downspout-front-left" position={[-length / 2 + 0.2, height / 2, -width / 2 - gutterOffset - 0.05]} material={gutterMaterial} renderOrder={renderOrder}>
      <boxGeometry args={[0.1, height, 0.1]} />
    </mesh>,
    
    // Front-right downspout - moved slightly outward
    <mesh key="downspout-front-right" position={[length / 2 - 0.2, height / 2, -width / 2 - gutterOffset - 0.05]} material={gutterMaterial} renderOrder={renderOrder}>
      <boxGeometry args={[0.1, height, 0.1]} />
    </mesh>
  ];
  
  // Back downspouts vary based on roof type
  if (roofType === RoofType.Monopitch) {
    // For monopitch, back downspouts need to be taller and moved slightly outward
    downspouts.push(
      <mesh key="downspout-back-left" position={[-length / 2 + 0.2, height / 2 + roofHeight / 2, width / 2 + gutterOffset + 0.05]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[0.1, height + roofHeight, 0.1]} />
      </mesh>,
      <mesh key="downspout-back-right" position={[length / 2 - 0.2, height / 2 + roofHeight / 2, width / 2 + gutterOffset + 0.05]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[0.1, height + roofHeight, 0.1]} />
      </mesh>
    );
  } else {
    // For flat and gable roofs
    downspouts.push(
      <mesh key="downspout-back-left" position={[-length / 2 + 0.2, height / 2, width / 2 + gutterOffset + 0.05]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[0.1, height, 0.1]} />
      </mesh>,
      <mesh key="downspout-back-right" position={[length / 2 - 0.2, height / 2, width / 2 + gutterOffset + 0.05]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[0.1, height, 0.1]} />
      </mesh>
    );
  }
  
  // Gutters vary based on roof type
  let gutters = [];
  
  if (roofType === RoofType.Monopitch) {
    gutters = [
      // Front gutter (lower side) - moved slightly outward and down by 0.05 units
      <mesh key="gutter-front" position={[0, height - 0.05, -width / 2 - gutterOffset]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[length + 0.1, gutterHeight, gutterWidth]} />
      </mesh>,
      
      // Back gutter (higher side) - moved slightly outward and down by 0.05 units
      <mesh key="gutter-back" position={[0, height + roofHeight - 0.05, width / 2 + gutterOffset]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[length + 0.1, gutterHeight, gutterWidth]} />
      </mesh>
    ];
  } else {
    // For flat and gable roofs - also moved outward slightly
    gutters = [
      // Front gutter - moved slightly outward
      <mesh key="gutter-front" position={[0, height - 0.05, -width / 2 - gutterOffset]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[length + 0.1, gutterHeight, gutterWidth]} />
      </mesh>,
      
      // Back gutter - moved slightly outward
      <mesh key="gutter-back" position={[0, height - 0.05, width / 2 + gutterOffset]} material={gutterMaterial} renderOrder={renderOrder}>
        <boxGeometry args={[length + 0.1, gutterHeight, gutterWidth]} />
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