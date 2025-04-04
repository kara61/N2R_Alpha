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
  // Update materials to enhance frame appearance
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
      // More metallic frame material for bands
      frame: new THREE.MeshStandardMaterial({
        color: '#aaaaaa', // Silver-gray aluminum color
        roughness: 0.2, // More polish
        metalness: 0.9, // Very metallic
        envMapIntensity: 1.5 // Enhance reflections
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
    
    // Use actual dimensions instead of fixed size
    const width = dimensions.width || 1.3;
    const length = dimensions.length || 1.3; // Use length property if available
    const thickness = 0.08;
    
    // Create a glass material with improved visibility
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#78c8ff',
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
      transmission: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide
    });
    
    // Calculate how many frame segments to add for longer windows
    const segmentLength = 2.0; // Each segment is at most 2m long
    const segmentCount = Math.max(1, Math.floor(length / segmentLength));
    const adjustedSegmentLength = length / segmentCount; // Evenly space dividers
    
    console.log(`Rendering roof window: ${width}m wide, ${length}m long with ${segmentCount} segments`);

    return (
      <group 
        key={id} 
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        userData={{ isRoofElement: true, id: id }}
      >
        {/* Outer frame */}
        <mesh material={materials.frame} receiveShadow castShadow>
          <boxGeometry args={[length, thickness, width]} />
        </mesh>
        
        {/* Glass pane - sits above the frame */}
        <mesh 
          position={[0, thickness * 0.7, 0]} 
          material={glassMaterial}
          receiveShadow
        >
          <boxGeometry args={[length * 0.98, thickness/3, width * 0.98]} />
        </mesh>
        
        {/* Add frame dividers for longer windows */}
        {segmentCount > 1 && Array.from({ length: segmentCount - 1 }).map((_, idx) => {
          // Calculate position for evenly spaced dividers
          const xPos = -length/2 + adjustedSegmentLength * (idx + 1);
          return (
            <mesh 
              key={`divider-${idx}`} 
              position={[xPos, 0, 0]} 
              material={materials.frame}
              receiveShadow 
              castShadow
            >
              <boxGeometry args={[0.05, thickness * 1.2, width]} />
            </mesh>
          );
        })}
      </group>
    );
  };

  // Fixed renderRidgeSkylight function with metal bands
  const renderRidgeSkylight = (element: RoofElement) => {
    const { id, position, rotation, dimensions } = element;
    const width = dimensions.width || 1.0;
    const length = dimensions.length || 3;
    const height = dimensions.height || 0.4;
    
    // Calculate the number of metal bands (one every 2 meters, plus end caps)
    const bandSpacing = 2; // 2 meters between bands
    const numBands = Math.max(3, Math.floor(length / bandSpacing) + 2); // At least 3 bands
    
    // Create an array of band positions (normalized from 0 to 1)
    const bandPositions = [];
    for (let i = 0; i < numBands; i++) {
      if (numBands === 2) {
        // If only 2 bands, place them at the ends
        bandPositions.push(i === 0 ? 0 : 1);
      } else {
        // Otherwise, evenly space them
        bandPositions.push(i / (numBands - 1));
      }
    }
    
    console.log(`Creating ridge skylight with ${numBands} metal bands over ${length}m length`);
    
    // Calculate band thickness as a proportion of the arch height
    const bandWidth = 0.06; // 6cm band width
  
    return (
      <group 
        key={id} 
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        userData={{ isRoofElement: true, id }}
      >
        {/* Main glass arch */}
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
        
        {/* Metal bands */}
        {bandPositions.map((pos, index) => (
          <group 
            key={`band-${index}`} 
            position={[((pos - 0.5) * length), 0, 0]}
            scale={[1, 0.5, 1]}
          >
            {/* Each band is a thin section of the same arch */}
            <mesh
              position={[0, height/2, 0]} 
              rotation={[0, 0, Math.PI/2]} 
              material={materials.frame}
              receiveShadow
              castShadow
            >
              <cylinderGeometry 
                args={[
                  height + 0.01, // Slightly larger radius than the glass
                  height + 0.01, 
                  bandWidth, // Narrow width for the band
                  16, // Fewer segments for better performance
                  1, false, 0, Math.PI
                ]} 
              />
            </mesh>
            
            {/* Add a small cap at the top of each band for better appearance */}
            <mesh
              position={[0, height + 0.02, 0]}
              rotation={[Math.PI/2, 0, 0]}
              material={materials.frame}
              receiveShadow
              castShadow
            >
              <boxGeometry args={[bandWidth, 0.04, 0.05]} />
            </mesh>
          </group>
        ))}
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