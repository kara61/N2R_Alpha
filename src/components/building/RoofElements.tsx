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
  buildingWidth, 
  roofPitch
  // Other props are intentionally removed as they're unused
}) => {
  // Create materials
  const polycarbonateMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#d4f1f9',
      roughness: 0.5,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8, // Increased opacity to make it more solid
      transmission: 0.1, // Decreased transmission to make it more solid
      clearcoat: 0.3,
      clearcoatRoughness: 0.4
    });
  }, []);

  // This value isn't used in the component but kept for potential future use
  // const roofHeight = buildingWidth * (roofPitch / 100);
  
  return (
    <group>
      {roofElements.map(element => {
        const { id, type, position, rotation, dimensions } = element;
        
        // For determining cylinder orientation
        const isRidgeSkylight = type === RoofElementType.RidgeSkylights;
        const cylinderLength = isRidgeSkylight ? dimensions.length || 1 : dimensions.width;
        
        // Create a half-cylinder skylight
        return (
          <group 
            key={id}
            position={[position.x, position.y, position.z]}
            rotation={[rotation.x, rotation.y, rotation.z]}
          >
            {/* Half-cylinder dome - fix rotation by applying it to the group instead */}
            <mesh 
              material={polycarbonateMaterial}
              rotation={[
                isRidgeSkylight ? 0 : Math.PI/2, 
                isRidgeSkylight ? Math.PI/2 : 0, 
                0
              ]}
            >
              <cylinderGeometry 
                args={[
                  dimensions.width / 2, 
                  dimensions.width / 2, 
                  cylinderLength, 
                  32, 
                  1, 
                  false, 
                  0, 
                  Math.PI
                ]} 
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default RoofElements;