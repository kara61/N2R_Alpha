import React from 'react';
import * as THREE from 'three';
import { RoofType } from '../../types';
import Foundation from './Foundation';
import Gutters from './Gutters';
import { createGableShape } from './ShapeUtils';

interface GableRoofBuildingProps {
  length: number;
  width: number;
  height: number;
  roofPitch: number;
  northSouthMaterial: THREE.Material;
  eastWestMaterial: THREE.Material;
  roofMaterial: THREE.Material;
  concreteMaterial: THREE.Material;
  gutterMaterial: THREE.Material;
}

const GableRoofBuilding: React.FC<GableRoofBuildingProps> = ({
  length,
  width,
  height,
  roofPitch,
  northSouthMaterial,
  eastWestMaterial,
  roofMaterial,
  concreteMaterial,
  gutterMaterial
}) => {
  const wallThickness = 0.15;
  
  // Calculate roof height based on pitch percentage
  const roofHeight = width * (roofPitch / 100);
  const gableHeight = height + roofHeight;
  
  // Walls
  const walls = [
    // Front and back walls (rectangular)
    <mesh 
      key="wall-front" 
      position={[0, height / 2, -width / 2]} 
      material={northSouthMaterial}
    >
      <boxGeometry args={[length, height, wallThickness]} />
    </mesh>,
  
    <mesh 
      key="wall-back" 
      position={[0, height / 2, width / 2]} 
      material={northSouthMaterial}
    >
      <boxGeometry args={[length, height, wallThickness]} />
    </mesh>,
  
    // Left gable wall (single piece)
    <mesh 
      key="wall-left-gable" 
      position={[-length / 2, 0, 0]} 
      rotation={[0, Math.PI / 2, 0]} 
      material={eastWestMaterial}
      onBeforeCompile={(shader) => {
        // Calculate number of 1m panels needed for width
        const panelsWide = Math.ceil(width);
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
      <extrudeGeometry args={[
        // Create shape for gable wall
        new THREE.Shape()
          .moveTo(-width / 2, 0)          // Bottom left
          .lineTo(width / 2, 0)           // Bottom right
          .lineTo(width / 2, height)      // Top right
          .lineTo(0, height + roofHeight) // Peak
          .lineTo(-width / 2, height)     // Top left
          .lineTo(-width / 2, 0),         // Back to start
        { 
          depth: wallThickness, 
          bevelEnabled: false
        }
      ]} />
    </mesh>,
  
    // Right gable wall (single piece)
    <mesh 
      key="wall-right-gable" 
      position={[length / 2, 0, 0]} 
      rotation={[0, Math.PI / 2, 0]} 
      material={eastWestMaterial}
      onBeforeCompile={(shader) => {
        // Calculate number of 1m panels needed for width
        const panelsWide = Math.ceil(width);
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
      <extrudeGeometry args={[
        // Create shape for gable wall
        new THREE.Shape()
          .moveTo(-width / 2, 0)          // Bottom left
          .lineTo(width / 2, 0)           // Bottom right
          .lineTo(width / 2, height)      // Top right
          .lineTo(0, height + roofHeight) // Peak
          .lineTo(-width / 2, height)     // Top left
          .lineTo(-width / 2, 0),         // Back to start
        { 
          depth: wallThickness, 
          bevelEnabled: false
        }
      ]} />
    </mesh>
  ];
  
  // Calculate the slope angle for the roof
  const angle = Math.atan(roofHeight / (width / 2));
  const roofLength = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2));
  
  // Gable roof - increased size to eliminate gaps
  const roof = (
    <group>
      {/* Left roof panel (when viewed from outside) */}
      <mesh key="roof-gable-left" position={[0, height + (roofHeight / 2), -width / 4]} rotation={[-angle, 0, 0]} material={roofMaterial}>
        <boxGeometry args={[length, wallThickness, roofLength]} />
      </mesh>
      
      {/* Right roof panel (when viewed from outside) */}
      <mesh key="roof-gable-right" position={[0, height + (roofHeight / 2), width / 4]} rotation={[angle, 0, 0]} material={roofMaterial}>
        <boxGeometry args={[length, wallThickness, roofLength]} />
      </mesh>
      
      {/* Ridge cap to cover the gap at the top */}
      <mesh key="roof-ridge" position={[0, height + roofHeight, 0]} material={roofMaterial}>
        <boxGeometry args={[length, wallThickness, wallThickness * 2]} />
      </mesh>
    </group>
  );
  
  return (
    <group>
      {walls}
      {roof}
      <Gutters 
        length={length} 
        width={width} 
        height={height} 
        wallOffset={0} 
        roofType={RoofType.Gable}
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

export default GableRoofBuilding;