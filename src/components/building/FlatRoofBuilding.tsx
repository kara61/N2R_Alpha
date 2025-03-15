import React from 'react';
import * as THREE from 'three';
import { CladdingType, RoofType } from '../../types';
import Foundation from './Foundation';
import Gutters from './Gutters';
import TrapezoidSheet from './TrapezoidSheet';

interface FlatRoofBuildingProps {
  length: number;
  width: number;
  height: number;
  claddingType: CladdingType;
  claddingMaterial: THREE.Material;
  roofMaterial: THREE.Material;
  concreteMaterial: THREE.Material;
  gutterMaterial: THREE.Material;
}

const FlatRoofBuilding: React.FC<FlatRoofBuildingProps> = ({
  length,
  width,
  height,
  claddingType,
  claddingMaterial,
  roofMaterial,
  concreteMaterial,
  gutterMaterial
}) => {
  const wallThickness = 0.15;
  
  // Standard rectangular walls
  const walls = [];
  
  // Determine if using trapezoid sheet
  const isTrapezoidSheet = claddingType === CladdingType.TrapezoidSheet;
  
  // Create walls based on cladding type
  if (isTrapezoidSheet) {
    // Use TrapezoidSheet component for trapezoid cladding
    walls.push(
      <TrapezoidSheet
        key="wall-front"
        width={length}
        height={height}
        depth={wallThickness}
        position={[-length / 2, 0, -width / 2]}
        rotation={[0, 0, 0]}
        material={claddingMaterial}
        horizontal={false}
      />
    );
    
    walls.push(
      <TrapezoidSheet
        key="wall-back"
        width={length}
        height={height}
        depth={wallThickness}
        position={[-length / 2, 0, width / 2]}
        rotation={[0, Math.PI, 0]}
        material={claddingMaterial}
        horizontal={false}
      />
    );
    
    walls.push(
      <TrapezoidSheet
        key="wall-left"
        width={width}
        height={height}
        depth={wallThickness}
        position={[-length / 2, 0, -width / 2]}
        rotation={[0, Math.PI / 2, 0]}
        material={claddingMaterial}
        horizontal={false}
      />
    );
    
    walls.push(
      <TrapezoidSheet
        key="wall-right"
        width={width}
        height={height}
        depth={wallThickness}
        position={[length / 2, 0, -width / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        material={claddingMaterial}
        horizontal={false}
      />
    );
    
    // Trapezoid sheet roof
    const roof = (
      <TrapezoidSheet
        key="roof-flat"
        width={length}
        height={width}
        depth={wallThickness}
        position={[-length / 2, height, -width / 2]}
        rotation={[0, 0, 0]}
        material={roofMaterial}
        horizontal={true}
      />
    );
    
    return (
      <group>
        {walls}
        {roof}
        <Gutters 
          length={length} 
          width={width} 
          height={height} 
          roofType={RoofType.Flat}
          gutterMaterial={gutterMaterial} 
        />
        <Foundation 
          length={length} 
          width={width} 
          concreteMaterial={concreteMaterial} 
        />
      </group>
    );
  } else {
    // Standard rectangular walls for sandwich panels
    walls.push(
      <mesh key="wall-front" position={[0, height / 2, -width / 2]} material={claddingMaterial}>
        <boxGeometry args={[length, height, wallThickness]} />
      </mesh>
    );
    
    walls.push(
      <mesh key="wall-back" position={[0, height / 2, width / 2]} material={claddingMaterial}>
        <boxGeometry args={[length, height, wallThickness]} />
      </mesh>
    );
    
    walls.push(
      <mesh key="wall-left" position={[-length / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={claddingMaterial}>
        <boxGeometry args={[width, height, wallThickness]} />
      </mesh>
    );
    
    walls.push(
      <mesh key="wall-right" position={[length / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={claddingMaterial}>
        <boxGeometry args={[width, height, wallThickness]} />
      </mesh>
    );
    
    // Flat roof
    const roof = (
      <mesh key="roof-flat" position={[0, height, 0]} material={roofMaterial}>
        <boxGeometry args={[length, wallThickness, width]} />
      </mesh>
    );
    
    return (
      <group>
        {walls}
        {roof}
        <Gutters 
          length={length} 
          width={width} 
          height={height} 
          roofType={RoofType.Flat}
          gutterMaterial={gutterMaterial} 
        />
        <Foundation 
          length={length} 
          width={width} 
          concreteMaterial={concreteMaterial} 
        />
      </group>
    );
  }
};

export default FlatRoofBuilding;