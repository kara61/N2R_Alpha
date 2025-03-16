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
  // Create reusable materials with better visual properties
  const materials = useMemo(() => {
    return {
      // Semi-transparent polycarbonate material for skylight domes
      skylight: new THREE.MeshPhysicalMaterial({
        color: '#d4f1f9',
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.7,
        transmission: 0.2,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide
      }),
      // Aluminum frame material for skylight edges
      frame: new THREE.MeshStandardMaterial({
        color: '#999999',
        roughness: 0.4,
        metalness: 0.8
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

  // Render a single dome skylight with more of an elliptical shape
  const renderDomeSkylight = (element: RoofElement) => {
    const { id, position, rotation, dimensions } = element;
    const radius = dimensions.width / 2;
    // Make height slightly less than width for a more elliptical dome
    const domeHeight = dimensions.height || 0.3;

    return (
      <group 
        key={id} 
        position={[position.x, position.y, position.z]}
        rotation={[rotation.x, rotation.y, rotation.z]}
        userData={{ isRoofElement: true, id: id }}
      >
        {/* Base frame */}
        <mesh material={materials.frame} receiveShadow castShadow>
          <cylinderGeometry args={[radius + 0.05, radius + 0.05, 0.05, 32]} />
        </mesh>
        
        {/* Create an elliptical dome by scaling a half sphere */}
        <group scale={[1, domeHeight / radius, 1]}>
          <mesh 
            position={[0, radius/2, 0]}
            material={materials.skylight} 
            receiveShadow
          >
            <sphereGeometry 
              args={[radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} 
            />
          </mesh>
        </group>
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
        if (element.type === RoofElementType.DomeSkylights) {
          return renderDomeSkylight(element);
        } else if (element.type === RoofElementType.RidgeSkylights) {
          return renderRidgeSkylight(element);
        }
        return null;
      })}
    </group>
  );
};

export default RoofElements;