import React, { useMemo } from 'react';
import * as THREE from 'three';

interface TrapezoidSheetProps {
  width: number;
  height: number;
  depth: number;
  position: [number, number, number];
  rotation: [number, number, number];
  material: THREE.Material;
  horizontal: boolean;
}

const TrapezoidSheet: React.FC<TrapezoidSheetProps> = ({ 
  width, 
  height, 
  depth, 
  position, 
  rotation, 
  material,
  horizontal
}) => {
  // Create trapezoid sheet geometry
  const sheetGeometry = useMemo(() => {
    // Parameters for trapezoid profile
    const ridgeWidth = 0.05; // Width of the top ridge
    const valleyWidth = 0.15; // Width of the valley
    const ridgeHeight = 0.03; // Height of the ridge
    
    // Calculate number of ridges based on width or height
    const dimension = horizontal ? width : height;
    const ridgeSpacing = 0.2; // Distance between ridges
    const numRidges = Math.floor(dimension / ridgeSpacing);
    
    // Create shape for extrusion
    const shape = new THREE.Shape();
    
    // Start at bottom left
    shape.moveTo(0, 0);
    
    // Create trapezoid profile
    let currentX = 0;
    for (let i = 0; i < numRidges; i++) {
      // Valley
      shape.lineTo(currentX + valleyWidth, 0);
      
      // Up to ridge
      shape.lineTo(currentX + valleyWidth + ridgeWidth/2, ridgeHeight);
      
      // Ridge top
      shape.lineTo(currentX + valleyWidth + ridgeWidth + ridgeWidth/2, ridgeHeight);
      
      // Down from ridge
      shape.lineTo(currentX + valleyWidth * 2 + ridgeWidth, 0);
      
      currentX += ridgeSpacing;
    }
    
    // Complete the shape if needed
    if (currentX < dimension) {
      shape.lineTo(dimension, 0);
    }
    
    // Close the shape
    shape.lineTo(dimension, depth);
    shape.lineTo(0, depth);
    shape.lineTo(0, 0);
    
    // Create extrusion settings
    const extrudeSettings = {
      steps: 1,
      depth: horizontal ? height : width,
      bevelEnabled: false
    };
    
    // Create geometry
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Rotate geometry if needed
    if (horizontal) {
      geometry.rotateX(-Math.PI / 2);
    } else {
      geometry.rotateY(Math.PI / 2);
    }
    
    return geometry;
  }, [width, height, depth, horizontal]);
  
  return (
    <mesh
      position={position}
      rotation={rotation}
      material={material}
      geometry={sheetGeometry}
      castShadow
      receiveShadow
    />
  );
};

export default TrapezoidSheet;