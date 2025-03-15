import React from 'react';
import * as THREE from 'three';
import { HallDimensions } from '../../types';

interface StructureProps {
  dimensions: HallDimensions;
  structureMaterial: THREE.Material;
}

const Structure: React.FC<StructureProps> = ({ dimensions, structureMaterial }) => {
  const { length, width, height } = dimensions;
  const wallThickness = 0.15;
  
  // Adjust structure dimensions to fit inside walls
  const innerLength = length - (wallThickness * 2);
  const innerWidth = width - (wallThickness * 2);
  
  // Column positions - ensure even spacing regardless of building size
  const maxColumnSpacing = 5; // Maximum 5m between columns
  const columnsLength = Math.max(2, Math.ceil(innerLength / maxColumnSpacing));
  const columnsWidth = Math.max(2, Math.ceil(innerWidth / maxColumnSpacing));
  
  // Calculate actual spacing based on building dimensions
  const actualLengthSpacing = innerLength / (columnsLength - 1);
  const actualWidthSpacing = innerWidth / (columnsWidth - 1);
  
  const columns = [];
  
  // Create columns along length
  const columnScale = 0.85; // 15% reduction
  const columnWidth = 0.3 * columnScale;
  const columnHeight = (height - 0.25) * columnScale;
  
  for (let i = 0; i < columnsLength; i++) {
    const x = (i * actualLengthSpacing) - (innerLength / 2);
    
    // Front wall column
    columns.push(
      <mesh 
        key={`column-front-${i}`} 
        position={[x, (height - 0.25) / 2, -(width / 2 - wallThickness)]} 
        material={structureMaterial}
      >
        <boxGeometry args={[columnWidth, columnHeight, columnWidth]} />
      </mesh>
    );
    
    // Back wall column
    columns.push(
      <mesh 
        key={`column-back-${i}`} 
        position={[x, (height - 0.25) / 2, width / 2 - wallThickness]} 
        material={structureMaterial}
      >
        <boxGeometry args={[columnWidth, columnHeight, columnWidth]} />
      </mesh>
    );
  }
  
  // Create columns along width
  for (let i = 1; i < columnsWidth - 1; i++) {
    const z = (i * actualWidthSpacing) - (innerWidth / 2);
    
    // Left wall column
    columns.push(
      <mesh 
        key={`column-left-${i}`} 
        position={[-(length / 2 - wallThickness), (height - 0.25) / 2, z]} 
        material={structureMaterial}
      >
        <boxGeometry args={[columnWidth, columnHeight, columnWidth]} />
      </mesh>
    );
    
    // Right wall column
    columns.push(
      <mesh 
        key={`column-right-${i}`} 
        position={[length / 2 - wallThickness, (height - 0.25) / 2, z]} 
        material={structureMaterial}
      >
        <boxGeometry args={[columnWidth, columnHeight, columnWidth]} />
      </mesh>
    );
  }
  
  // Create roof beams
  const beams = [];
  
  // Beam dimensions with 15% reduction
  const beamWidth = 0.3 * columnScale;
  const beamHeight = 0.5 * columnScale;
  
  // Main beams along width
  for (let i = 0; i < columnsLength; i++) {
    const x = (i * actualLengthSpacing) - (innerLength / 2);
    
    beams.push(
      <mesh 
        key={`beam-width-${i}`} 
        position={[x, height - 0.25, 0]} 
        material={structureMaterial}
      >
        <boxGeometry args={[beamWidth, beamHeight, innerWidth]} />
      </mesh>
    );
  }
  
  // Secondary beams along length
  for (let i = 0; i < columnsWidth; i++) {
    const z = (i * actualWidthSpacing) - (innerWidth / 2);
    
    beams.push(
      <mesh 
        key={`beam-length-${i}`} 
        position={[0, height - 0.25, z]} 
        material={structureMaterial}
      >
        <boxGeometry args={[innerLength, beamWidth, beamWidth]} />
      </mesh>
    );
  }
  
  return (
    <group>
      {columns}
      {beams}
    </group>
  );
};

export default Structure;