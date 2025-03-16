import React, { useMemo } from 'react';
import * as THREE from 'three';
import { RoofElement, RoofElementType, RoofType } from '../../types';

interface RoofElementsProps {
  roofElements: RoofElement[];
  buildingLength: number;
  buildingWidth: number;
  buildingHeight: number;
  roofType: RoofType;
  roofPitch: number;
}

const RoofElements: React.FC<RoofElementsProps> = ({ 
  roofElements, 
  buildingLength,
  buildingWidth, 
  buildingHeight,
  roofType,
  roofPitch
}) => {
  // Update materials to make glass more visible
  const materials = useMemo(() => {
    return {
      // Significantly more visible glass material with higher opacity and blue tint
      skylight: new THREE.MeshPhysicalMaterial({
        color: '#78c8ff', // Brighter blue tint for better visibility
        roughness: 0.1, 
        metalness: 0.3,
        transparent: true,
        opacity: 0.9, // Higher opacity
        transmission: 0.6, // Higher transmission
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide
      }),
      // Brighter and more pronounced frame material
      frame: new THREE.MeshStandardMaterial({
        color: '#cccccc', // Lighter aluminum color
        roughness: 0.3,
        metalness: 0.9 // Higher metalness for better contrast
      })
    };
  }, []);

  // Calculate roof parameters (used for positioning elements correctly)
  const roofParams = useMemo(() => {
    const roofHeight = buildingWidth * (roofPitch / 100);
    
    return {
      // Basic parameters
      width: buildingWidth,
      length: buildingLength,
      height: buildingHeight,
      roofHeight: roofHeight,
      
      // For gable roof
      ridgeHeight: buildingHeight + roofHeight,
      slopeAngle: Math.atan(roofHeight / (buildingWidth / 2)),
      
      // For monopitch roof
      monopitchAngle: Math.atan(roofHeight / buildingWidth),
      
      // Derived values for calculations
      halfWidth: buildingWidth / 2,
      halfLength: buildingLength / 2
    };
  }, [buildingWidth, buildingLength, buildingHeight, roofPitch]);

  // Updated renderRoofWindow function to show a single piece of glass without dividers
  const renderRoofWindow = (element: RoofElement) => {
    const { id, position, rotation, dimensions } = element;
    // Fixed dimensions for roof window: 1.3m x 1.3m
    const width = 1.3;
    const length = 1.3;
    const thickness = 0.08; // Thicker for better visibility
    
    // Create a glass material with improved visibility
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#78c8ff', // Brighter blue tint
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
      transmission: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide
    });
    
    console.log(`Rendering roof window: position=${JSON.stringify(position)}, rotation=${JSON.stringify(rotation)}`);

    return (
      <group 
        key={id} 
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        userData={{ isRoofElement: true, id: id }}
      >
        {/* Outer frame only - thicker and more pronounced */}
        <mesh material={materials.frame} receiveShadow castShadow>
          <boxGeometry args={[length, thickness, width]} />
        </mesh>
        
        {/* Single large glass pane - sits above the frame */}
        <mesh 
          position={[0, thickness * 0.7, 0]} 
          material={glassMaterial}
          receiveShadow
        >
          <boxGeometry args={[length * 0.9, thickness/3, width * 0.9]} />
        </mesh>
      </group>
    );
  };

  // Completely simplified renderRidgeSkylight - just a single arch with no base or end caps
  const renderRidgeSkylight = (element: RoofElement) => {
    const { id, position, rotation, dimensions } = element;
    const width = dimensions.width;
    const length = dimensions.length || 3;
    const height = dimensions.height || 0.4;

    return (
      <group 
        key={id} 
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        userData={{ isRoofElement: true, id: id }}
      >
        {/* Only the main arch - no base, no end caps */}
        <group scale={[1, 0.5, 1]}>
          <mesh 
            position={[0, height/2, 0]} 
            rotation={[0, 0, Math.PI/2]} 
            material={materials.skylight}
            receiveShadow
          >
            <cylinderGeometry 
              args={[height, height, length, 32, 1, false, 0, Math.PI]} 
            />
          </mesh>
        </group>
      </group>
    );
  };

  return (
    <group>
      {roofElements.map(element => {
        if (element.type === RoofElementType.RoofWindow) {
          return renderRoofWindow(element);
        } else if (element.type === RoofElementType.RidgeSkylights) {
          return renderRidgeSkylight(element);
        }
        return null;
      })}
    </group>
  );
};

export default RoofElements;