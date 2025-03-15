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

  // Calculate roof height based on pitch percentage
  const roofHeight = buildingWidth * (roofPitch / 100);
  
  return (
    <group>
      {roofElements.map(element => {
        const { id, type, position, rotation, dimensions } = element;
        
        // Create a half-cylinder skylight
        return (
          <group 
            key={id}
            position={[position.x, position.y, position.z]}
            rotation={[rotation.x, rotation.y, rotation.z]}
          >
            {/* Half-cylinder dome */}
            <mesh material={polycarbonateMaterial}>
              <cylinderGeometry 
                args={[
                  dimensions.width / 2, 
                  dimensions.width / 2, 
                  type === RoofElementType.RidgeSkylights ? dimensions.length || 1 : dimensions.width, 
                  32, 
                  1, 
                  false, 
                  0, 
                  Math.PI
                ]} 
                rotation={[
                  type === RoofElementType.RidgeSkylights ? 0 : Math.PI/2, 
                  type === RoofElementType.RidgeSkylights ? Math.PI/2 : 0, 
                  0
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