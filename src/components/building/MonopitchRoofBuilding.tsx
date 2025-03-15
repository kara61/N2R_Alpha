import React from 'react';
import * as THREE from 'three';
import { RoofType } from '../../types';
import Foundation from './Foundation';
import Gutters from './Gutters';
import { createMonopitchSideShape, createMonopitchBackWallShape } from './ShapeUtils';

interface MonopitchRoofBuildingProps {
  length: number;
  width: number;
  height: number;
  roofPitch: number;
  claddingMaterial: THREE.Material;
  roofMaterial: THREE.Material;
  concreteMaterial: THREE.Material;
  gutterMaterial: THREE.Material;
}

const MonopitchRoofBuilding: React.FC<MonopitchRoofBuildingProps> = ({
  length,
  width,
  height,
  roofPitch,
  claddingMaterial,
  roofMaterial,
  concreteMaterial,
  gutterMaterial
}) => {
  const wallThickness = 0.15;
  
  // Calculate roof height based on pitch percentage
  const roofHeight = width * (roofPitch / 100);
  
  // Walls
  const walls = [];
  
  // Front wall (lower side)
  walls.push(
    <mesh key="wall-front" position={[0, height / 2, -width / 2]} material={claddingMaterial}>
      <boxGeometry args={[length, height, wallThickness]} />
    </mesh>
  );
  
  // Back wall (higher side) - using a custom shape to cover the entire back including the triangular part
  walls.push(
    <mesh key="wall-back" position={[0, 0, width / 2]} material={claddingMaterial}>
      <extrudeGeometry args={[
        createMonopitchBackWallShape(length, height, roofHeight),
        { depth: wallThickness, bevelEnabled: false }
      ]} />
    </mesh>
  );
  
  // Left wall (trapezoidal)
  walls.push(
    <mesh key="wall-left" position={[-length / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={claddingMaterial}>
      <extrudeGeometry args={[
        createMonopitchSideShape(width, height, roofHeight),
        { depth: wallThickness, bevelEnabled: false }
      ]} />
    </mesh>
  );
  
  // Right wall (trapezoidal)
  walls.push(
    <mesh key="wall-right" position={[length / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={claddingMaterial}>
      <extrudeGeometry args={[
        createMonopitchSideShape(width, height, roofHeight),
        { depth: wallThickness, bevelEnabled: false }
      ]} />
    </mesh>
  );
  
  // Calculate the slope angle for the roof
  const angle = Math.atan(roofHeight / width);
  const roofLength = Math.sqrt(Math.pow(width, 2) + Math.pow(roofHeight, 2));
  
  // Monopitch roof - increased size to eliminate gaps
  const roof = (
    <mesh key="roof-monopitch" position={[0, height + (roofHeight / 2), 0]} rotation={[-angle, 0, 0]} material={roofMaterial}>
      <boxGeometry args={[length, wallThickness, roofLength]} />
    </mesh>
  );
  
  // Add edge caps to cover any remaining gaps
  const edgeCaps = [
    // Front edge cap
    <mesh key="edge-front" position={[0, height, -width / 2]} material={roofMaterial}>
      <boxGeometry args={[length, 0.1, 0.3]} />
    </mesh>,
    
    // Back edge cap
    <mesh key="edge-back" position={[0, height + roofHeight, width / 2]} material={roofMaterial}>
      <boxGeometry args={[length, 0.1, 0.3]} />
    </mesh>,
    
    // Left edge cap
    <mesh key="edge-left" position={[-length / 2, height + roofHeight/2, 0]} rotation={[0, Math.PI/2, angle]} material={roofMaterial}>
      <boxGeometry args={[roofLength, 0.1, 0.3]} />
    </mesh>,
    
    // Right edge cap
    <mesh key="edge-right" position={[length / 2, height + roofHeight/2, 0]} rotation={[0, Math.PI/2, angle]} material={roofMaterial}>
      <boxGeometry args={[roofLength, 0.1, 0.3]} />
    </mesh>
  ];
  
  return (
    <group>
      {walls}
      {roof}
      {edgeCaps}
      <Gutters 
        length={length} 
        width={width} 
        height={height} 
        wallOffset={0} 
        roofType={RoofType.Monopitch}
        roofHeight={roofHeight}
        gutterMaterial={gutterMaterial} 
      />
      <Foundation 
        length={length} 
        width={width} 
        wallOffset={0} 
        concreteMaterial={concreteMaterial} 
      />
    </group>
  );
};

export default MonopitchRoofBuilding;