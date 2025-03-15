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
    
    // COMPLETELY SEPARATE CONFIGURATIONS FOR SIDE WALLS
    
    // EAST WALL (LEFT) SHAPE - REVERSED slope direction
    const eastWallShape = new THREE.Shape();
    
    // Define points explicitly in counter-clockwise order with REVERSED slope
    eastWallShape.moveTo(-width/2, 0);                  // Bottom North
    eastWallShape.lineTo(width/2, 0);                   // Bottom South
    eastWallShape.lineTo(width/2, height);              // Top South (normal height) - CHANGED
    eastWallShape.lineTo(-width/2, height + roofHeight); // Top North (higher due to roof) - CHANGED
    eastWallShape.lineTo(-width/2, 0);                  // Back to start
    
    // WEST WALL (RIGHT) SHAPE - REVERSED slope direction
    const westWallShape = new THREE.Shape();
    
    // Define points explicitly in counter-clockwise order with REVERSED slope
    westWallShape.moveTo(-width/2, 0);                  // Bottom South (when rotated)
    westWallShape.lineTo(width/2, 0);                   // Bottom North (when rotated)
    westWallShape.lineTo(width/2, height + roofHeight); // Top North with slope (when rotated) - CHANGED
    westWallShape.lineTo(-width/2, height);             // Top South (normal height) - CHANGED
    westWallShape.lineTo(-width/2, 0);                  // Back to start
    
    const extrudeSettings = { depth: wallThickness, bevelEnabled: false };
    
    // EAST WALL (LEFT) - Completely custom configuration
    const eastWall = (
      <mesh 
        key="wall-east" 
        position={[-length/2, 0, 0]} 
        rotation={[0, Math.PI/2, 0]} 
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
        <extrudeGeometry args={[eastWallShape, extrudeSettings]} />
      </mesh>
    );
    
    // WEST WALL (RIGHT) - Completely custom configuration
    const westWall = (
      <mesh 
        key="wall-west" 
        position={[length/2, 0, 0]} 
        rotation={[0, -Math.PI/2, 0]} 
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
        <extrudeGeometry args={[westWallShape, extrudeSettings]} />
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
      eastWall,  // Note: renamed from leftWall
      westWall,  // Note: renamed from rightWall
      leftBackTop, 
      rightBackTop, 
      leftFrontTop, 
      rightFrontTop
    ];
  // Use a stable dependency array for useMemo
  }, [length, width, height, roofHeight, northMaterial, southMaterial, sideMaterial, wallThickness]);
  
  // Create roof with adjusted renderOrder and slightly wider to avoid gaps
  const roof = useMemo(() => {
    return (
      <mesh 
        key="roof"
        position={[0, height + (roofHeight / 2), 0]} 
        rotation={[-angle, 0, 0]} 
        material={roofMaterial}
        renderOrder={2} // Render after walls to prevent Z-fighting
      >
        <boxGeometry args={[length + 0.2, 0.1, roofLength + 0.2]} /> // Slightly wider to avoid edge gaps
      </mesh>
    );
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
        renderOrder={4} // Increased renderOrder to ensure it renders after everything else
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