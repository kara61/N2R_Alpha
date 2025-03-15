import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoofType } from '../../types';
import Foundation from './Foundation';
import Gutters from './Gutters';

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
  
  // Calculate the slope angle for the roof
  const angle = Math.atan(roofHeight / width);
  const roofLength = Math.sqrt(Math.pow(width, 2) + Math.pow(roofHeight, 2));
  
  // Create walls with proper geometry for a monopitch roof
  const walls = useMemo(() => {
    // Create wall geometries directly with BufferGeometry for better performance
    
    // Front Wall - Standard rectangular wall
    const frontWall = (
      <mesh 
        key="front-wall" 
        position={[0, height/2, -width/2]} 
        material={claddingMaterial}
      >
        <boxGeometry args={[length, height, wallThickness]} />
      </mesh>
    );
    
    // Back Wall - Taller to accommodate the roof pitch
    // Create vertices for back wall (pentagon shape)
    const backWallShape = new THREE.Shape();
    backWallShape.moveTo(-length/2, 0);          // Bottom left
    backWallShape.lineTo(length/2, 0);           // Bottom right
    backWallShape.lineTo(length/2, height + roofHeight); // Top right
    backWallShape.lineTo(-length/2, height + roofHeight); // Top left
    backWallShape.lineTo(-length/2, 0);          // Back to start
    
    const backWall = (
      <mesh 
        key="back-wall" 
        position={[0, 0, width/2]} 
        material={claddingMaterial}
      >
        <shapeGeometry args={[backWallShape]} />
        <meshStandardMaterial side={THREE.DoubleSide} {...claddingMaterial} />
      </mesh>
    );
    
    // Side Walls - Create trapezoid shapes that follow the roof slope
    // Left side wall - create vertices for trapezoid
    const leftPoints = [
      new THREE.Vector3(-length/2, 0, -width/2),         // Bottom front
      new THREE.Vector3(-length/2, 0, width/2),          // Bottom back
      new THREE.Vector3(-length/2, height + roofHeight, width/2), // Top back
      new THREE.Vector3(-length/2, height, -width/2)     // Top front
    ];
    
    // Build geometry from vertices
    const leftWallGeometry = new THREE.BufferGeometry();
    
    // Create triangulated faces from the vertices
    const leftVertices = new Float32Array([
      // First triangle
      leftPoints[0].x, leftPoints[0].y, leftPoints[0].z,
      leftPoints[1].x, leftPoints[1].y, leftPoints[1].z,
      leftPoints[2].x, leftPoints[2].y, leftPoints[2].z,
      // Second triangle
      leftPoints[0].x, leftPoints[0].y, leftPoints[0].z,
      leftPoints[2].x, leftPoints[2].y, leftPoints[2].z,
      leftPoints[3].x, leftPoints[3].y, leftPoints[3].z
    ]);
    
    leftWallGeometry.setAttribute('position', new THREE.BufferAttribute(leftVertices, 3));
    leftWallGeometry.computeVertexNormals();
    
    const leftWall = (
      <mesh key="left-wall" geometry={leftWallGeometry} material={claddingMaterial} />
    );
    
    // Right side wall - mirror of left wall
    const rightPoints = [
      new THREE.Vector3(length/2, 0, -width/2),         // Bottom front
      new THREE.Vector3(length/2, 0, width/2),          // Bottom back
      new THREE.Vector3(length/2, height + roofHeight, width/2), // Top back
      new THREE.Vector3(length/2, height, -width/2)     // Top front
    ];
    
    // Build geometry from vertices
    const rightWallGeometry = new THREE.BufferGeometry();
    
    // Create triangulated faces from the vertices
    const rightVertices = new Float32Array([
      // First triangle
      rightPoints[0].x, rightPoints[0].y, rightPoints[0].z,
      rightPoints[2].x, rightPoints[2].y, rightPoints[2].z,
      rightPoints[1].x, rightPoints[1].y, rightPoints[1].z,
      // Second triangle
      rightPoints[0].x, rightPoints[0].y, rightPoints[0].z,
      rightPoints[3].x, rightPoints[3].y, rightPoints[3].z,
      rightPoints[2].x, rightPoints[2].y, rightPoints[2].z
    ]);
    
    rightWallGeometry.setAttribute('position', new THREE.BufferAttribute(rightVertices, 3));
    rightWallGeometry.computeVertexNormals();
    
    const rightWall = (
      <mesh key="right-wall" geometry={rightWallGeometry} material={claddingMaterial} />
    );
    
    return [frontWall, backWall, leftWall, rightWall];
  }, [length, width, height, roofHeight, claddingMaterial, wallThickness]);
  
  // Create a simple, clean roof with no flashing
  const roof = useMemo(() => {
    return (
      <mesh 
        key="roof"
        position={[0, height + (roofHeight / 2), 0]} 
        rotation={[-angle, 0, 0]} 
        material={roofMaterial}
      >
        <boxGeometry args={[length + 0.1, 0.1, roofLength + 0.1]} />
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