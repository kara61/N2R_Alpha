import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoofType } from '../../types';
import Foundation from './Foundation';
import Gutters from './Gutters';
import { useMonopitchWallMaterials } from './BuildingMaterials';

interface MonopitchRoofBuildingProps {
  length: number;
  width: number;
  height: number;
  roofPitch: number;
  claddingMaterial: THREE.Material;  // Keep for compatibility
  roofMaterial: THREE.Material;
  concreteMaterial: THREE.Material;
  gutterMaterial: THREE.Material;
  facadeColor?: any;  // Make optional
  claddingType?: any;  // Make optional
}

const MonopitchRoofBuilding: React.FC<MonopitchRoofBuildingProps> = ({
  length,
  width,
  height,
  roofPitch,
  claddingMaterial, // Used as fallback
  roofMaterial,
  concreteMaterial,
  gutterMaterial,
  facadeColor, // Can be undefined
  claddingType // Can be undefined
}) => {
  const wallThickness = 0.15;
  
  // Calculate roof height based on pitch percentage
  const roofHeight = width * (roofPitch / 100);
  const angle = Math.atan(roofHeight / width);
  const roofLength = Math.sqrt(Math.pow(width, 2) + Math.pow(roofHeight, 2));
  
  // Use hook to get materials, but don't modify them afterward
  let northMaterial = claddingMaterial;
  let southMaterial = claddingMaterial;
  let sideMaterial = claddingMaterial;
  
  if (facadeColor && claddingType) {
    try {
      const materials = useMonopitchWallMaterials(
        claddingType,
        facadeColor,
        { length, width, height, roofPitch }
      );
      
      northMaterial = materials.northMaterial;
      southMaterial = materials.southMaterial;
      sideMaterial = materials.eastWestMaterial;
    } catch (error) {
      console.error("Error creating monopitch materials:", error);
    }
  }
  
  // Create walls with standard approach - EXACTLY like GableRoofBuilding
  const walls = useMemo(() => {
    // FRONT WALL (NORTH) - EXACT copy from GableRoofBuilding
    const frontWall = (
      <mesh 
        key="wall-front"
        position={[0, height / 2, -width / 2]} // EXACT position from GableRoofBuilding
        material={northMaterial}
      >
        <boxGeometry args={[length, height, wallThickness]} />
      </mesh>
    );
    
    // BACK WALL (SOUTH) - Fix position to eliminate gap
    const backWall = (
      <mesh 
        key="wall-back" 
        position={[0, (height + roofHeight) / 2, width / 2]} // Adjusted Y position to center the wall correctly
        material={southMaterial}
      >
        <boxGeometry args={[length, height + roofHeight, wallThickness]} />
      </mesh>
    );
    
    // Create shape for the trapezoid walls
    // Create points for left/right trapezoid walls
    const points = [
      new THREE.Vector3(-width/2, 0, 0),           // Bottom front
      new THREE.Vector3(width/2, 0, 0),            // Bottom back
      new THREE.Vector3(width/2, height, 0),       // Top back
      new THREE.Vector3(-width/2, height + roofHeight, 0) // Top front with roof slope
    ];
    
    // Create shape for the trapezoid
    const sideShape = new THREE.Shape();
    sideShape.moveTo(points[0].x, points[0].y);
    sideShape.lineTo(points[1].x, points[1].y);
    sideShape.lineTo(points[2].x, points[2].y);
    sideShape.lineTo(points[3].x, points[3].y);
    sideShape.lineTo(points[0].x, points[0].y);
    
    // Create shape for the right wall (needs to be defined before use)
    const rightShape = new THREE.Shape();
    rightShape.moveTo(-width/2, 0);           // Bottom front
    rightShape.lineTo(width/2, 0);            // Bottom back
    rightShape.lineTo(width/2, height + roofHeight); // Top back with roof slope
    rightShape.lineTo(-width/2, height);      // Top front 
    rightShape.lineTo(-width/2, 0);           // Close path
    
    // Extrusion settings
    const extrudeSettings = {
      steps: 1,
      depth: wallThickness,
      bevelEnabled: false
    };
    
    // Side walls still need shader compilation for texture mapping on the trapezoid shapes
    const leftWall = (
      <mesh 
        key="wall-left-gable" 
        position={[-length / 2, 0, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        material={sideMaterial}
        onBeforeCompile={(shader) => {
          // Calculate number of 1m panels needed for width - EXACT copy from GableRoofBuilding
          const panelsWide = Math.ceil(width);
          const gableHeight = height + roofHeight;
          
          shader.uniforms.repeat = { value: new THREE.Vector2(Math.ceil(gableHeight), panelsWide) };
          shader.vertexShader = `
            varying vec2 vUv;
            ${shader.vertexShader}
          `;
          shader.fragmentShader = `
            varying vec2 vUv;
            uniform vec2 repeat;
            ${shader.fragmentShader.replace(
              '#include <map_fragment>',
              `
              #ifdef USE_MAP
                vec2 adjustedUV = vec2(vUv.y * repeat.x, vUv.x * repeat.y);
                vec4 sampledDiffuseColor = texture2D(map, adjustedUV);
                diffuseColor *= sampledDiffuseColor;
              #endif
              `
            )}
          `;
        }}
      >
        <extrudeGeometry args={[sideShape, extrudeSettings]} />
      </mesh>
    );
    
    // RIGHT WALL (WEST) - EXACT COPY from GableRoofBuilding
    const rightWall = (
      <mesh 
        key="wall-right-gable" 
        position={[length/2 + wallThickness/2, 0, 0]} 
        rotation={[0, -Math.PI/2, 0]} 
        material={sideMaterial}
        onBeforeCompile={(shader) => {
          // Calculate number of 1m panels needed for width
          const panelsWide = Math.ceil(width);
          const gableHeight = height + roofHeight;
          
          shader.uniforms.repeat = { value: new THREE.Vector2(Math.ceil(gableHeight), panelsWide) };
          shader.vertexShader = `
            varying vec2 vUv;
            ${shader.vertexShader}
          `;
          shader.fragmentShader = `
            varying vec2 vUv;
            uniform vec2 repeat;
            ${shader.fragmentShader.replace(
              '#include <map_fragment>',
              `
              #ifdef USE_MAP
                vec2 adjustedUV = vec2(vUv.y * repeat.x, vUv.x * repeat.y);
                vec4 sampledDiffuseColor = texture2D(map, adjustedUV);
                diffuseColor *= sampledDiffuseColor;
              #endif
              `
            )}
          `;
        }}
      >
        <extrudeGeometry args={[rightShape, extrudeSettings]} />
      </mesh>
    );
    
    // Add visual debugging helpers - a box at each corner to ensure correct sizing
    const leftBackTop = (
      <mesh key="left-back-top" position={[-length/2, height + roofHeight, width/2]} renderOrder={5}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    );
    
    const rightBackTop = (
      <mesh key="right-back-top" position={[length/2, height + roofHeight, width/2]} renderOrder={5}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="green" />
      </mesh>
    );
    
    const leftFrontTop = (
      <mesh key="left-front-top" position={[-length/2, height, -width/2]} renderOrder={5}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="blue" />
      </mesh>
    );
    
    const rightFrontTop = (
      <mesh key="right-front-top" position={[length/2, height, -width/2]} renderOrder={5}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
    );
    
    return [
      frontWall, 
      backWall, 
      leftWall, 
      rightWall, 
      leftBackTop, 
      rightBackTop, 
      leftFrontTop, 
      rightFrontTop
    ];
  // Use a stable dependency array for useMemo
  }, [length, width, height, roofHeight, northMaterial, southMaterial, sideMaterial, wallThickness]);
  
  // Create roof with adjusted renderOrder
  const roof = useMemo(() => {
    return (
      <mesh 
        key="roof"
        position={[0, height + (roofHeight / 2), 0]} 
        rotation={[-angle, 0, 0]} 
        material={roofMaterial}
        renderOrder={2} // Render after walls to prevent Z-fighting
      >
        <boxGeometry args={[length + 0.1, 0.1, roofLength + 0.1]} />
      </mesh>
    );
  // Use a stable dependency array
  }, [length, height, roofHeight, roofLength, angle, roofMaterial]);
  
  return (
    <group>
      {walls}
      {roof}
      <Gutters 
        length={length} 
        width={width} 
        height={height} 
        roofType={RoofType.Monopitch}
        roofHeight={roofHeight}
        gutterMaterial={gutterMaterial} 
        renderOrder={3} // Render gutters last
      />
      <Foundation 
        length={length} 
        width={width} 
        concreteMaterial={concreteMaterial} 
      />
    </group>
  );
};

export default MonopitchRoofBuilding;