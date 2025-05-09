import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ElementType, BuildingElement, HallDimensions } from '../../types';
import { calculateElementTransform } from './ElementHelpers';
import { createElementRenderer } from './ElementRenderers';

interface BuildingElementsContainerProps {
  elements: BuildingElement[];
  dimensions: HallDimensions;
}

const BuildingElementsContainer: React.FC<BuildingElementsContainerProps> = ({ elements, dimensions }) => {
  // Wall thickness and offset
  const wallThickness = 0.15;
  
  // Create reusable materials
  const materials = useMemo(() => {
    // Frame material (aluminum/metal look)
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: '#a8a8a8',
      roughness: 0.2,
      metalness: 0.8,
      side: THREE.DoubleSide
    });
    
    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#d4f1f9',
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    // Standard door material
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: '#505050',
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.DoubleSide
    });
    
    // Sectional door material (slightly different texture)
    const sectionalDoorMaterial = new THREE.MeshStandardMaterial({
      color: '#505050',
      roughness: 0.5,
      metalness: 0.4,
      side: THREE.DoubleSide
    });
    
    return {
      frameMaterial,
      glassMaterial,
      doorMaterial,
      sectionalDoorMaterial
    };
  }, []);
  
  // Generate all building elements
  return (
    <group>
      {elements.map((element, index) => {
        // Calculate world space position and rotation based on the wall
        const { position: worldPosition, rotation: worldRotation } = 
          calculateElementTransform(element, dimensions, wallThickness);
        
        // Get material based on element type
        const { frameMaterial } = materials;
        let elementMaterial;
        let glassRequired = false;
        
        switch (element.type) {
          case ElementType.Door:
            elementMaterial = materials.doorMaterial;
            break;
          case ElementType.SectionalDoor:
          case ElementType.WindowedSectionalDoor:
            elementMaterial = materials.sectionalDoorMaterial;
            glassRequired = element.type === ElementType.WindowedSectionalDoor;
            break;
          case ElementType.Window:
          case ElementType.LightBand:
            glassRequired = true;
            break;
          default:
            elementMaterial = materials.doorMaterial;
        }
        
        // Render the appropriate element
        return (
          <React.Fragment key={`building-element-${index}`}>
            {createElementRenderer(
              element.type,
              element.dimensions,
              worldPosition,
              worldRotation,
              elementMaterial,
              frameMaterial,
              glassRequired ? materials.glassMaterial : undefined
            )}
          </React.Fragment>
        );
      })}
    </group>
  );
};

export default BuildingElementsContainer;
