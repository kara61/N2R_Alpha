import React from 'react';
import * as THREE from 'three';
import { ElementType, WallType, BuildingElement, HallDimensions } from '../../types';

interface BuildingElementsProps {
  elements: BuildingElement[];
  dimensions: HallDimensions;
}

const BuildingElements: React.FC<BuildingElementsProps> = ({ elements, dimensions }) => {
  // Wall thickness and offset
  const wallThickness = 0.15;
  
  return (
    <group>
      {elements.map(element => {
        const { id, type, position, rotation, dimensions: elementDim, material, wall } = element;
        
        // Create material for the element
        const elementMaterial = material ? new THREE.MeshStandardMaterial({
          color: material?.color || '#5a5a5a',
          metalness: material?.metalness || 0.5,
          roughness: material?.roughness || 0.5,
          transparent: type === ElementType.Window || type === ElementType.LightBand || type === ElementType.WindowedSectionalDoor,
          opacity: type === ElementType.Window || type === ElementType.LightBand ? 0.7 : 1,
        }) : new THREE.MeshStandardMaterial({
          color: '#5a5a5a',
          metalness: 0.5,
          roughness: 0.5
        });
        
        // Create glass material for windows
        const glassMaterial = new THREE.MeshStandardMaterial({
          color: '#a3c6e8',
          metalness: 0.9,
          roughness: 0.1,
          transparent: true,
          opacity: 0.7,
        });
        
        // Create frame material
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: '#444444',
          metalness: 0.7,
          roughness: 0.3,
        });
        
        // Create light material for light bands
        const lightMaterial = new THREE.MeshStandardMaterial({
          color: '#ffffff',
          metalness: 0.1,
          roughness: 0.2,
          transparent: true,
          opacity: 0.7,
          emissive: '#ffffff',
          emissiveIntensity: 0.5
        });
        
        // Calculate the correct position based on the wall
        let adjustedPosition = { ...position };
        let adjustedRotation = { ...rotation };
        
        // Offset to place elements on the exterior surface of the walls
        const elementOffset = wallThickness + 0.01; // Full wall thickness plus a small offset
        
        // Adjust position and rotation based on wall
        if (wall === WallType.North) {
          adjustedPosition = { 
            ...position,
            z: -dimensions.width / 2 - elementOffset
          };
          adjustedRotation = { x: 0, y: Math.PI, z: 0 }; // Rotate 180 degrees to face outward
        } else if (wall === WallType.South) {
          adjustedPosition = { 
            ...position,
            z: dimensions.width / 2 + elementOffset
          };
          adjustedRotation = { x: 0, y: 0, z: 0 }; // No rotation needed, already facing outward
        } else if (wall === WallType.East) {
          adjustedPosition = { 
            ...position,
            x: dimensions.length / 2 + elementOffset
          };
          adjustedRotation = { x: 0, y: Math.PI / 2, z: 0 }; // Rotate 90 degrees to face outward
        } else if (wall === WallType.West) {
          adjustedPosition = { 
            ...position,
            x: -dimensions.length / 2 - elementOffset
          };
          adjustedRotation = { x: 0, y: -Math.PI / 2, z: 0 }; // Rotate -90 degrees to face outward
        }
        
        switch (type) {
          case ElementType.Window:
            return (
              <group
                key={id}
                position={[adjustedPosition.x, adjustedPosition.y, adjustedPosition.z]}
                rotation={[adjustedRotation.x, adjustedRotation.y, adjustedRotation.z]}
              >
                {/* Window frame */}
                <mesh material={frameMaterial}>
                  <boxGeometry args={[elementDim.width + 0.1, elementDim.height + 0.1, 0.05]} />
                </mesh>
                
                {/* Light panels */}
                {Array.from({ length: 3 }).map((_, idx) => {
                  const xPos = ((idx - 1) * (elementDim.width / 3));
                  return (
                    <mesh 
                      key={`panel-${idx}`} 
                      position={[xPos, 0, 0.02]} 
                      material={lightMaterial}
                    >
                      <boxGeometry args={[(elementDim.width / 3) - 0.05, elementDim.height - 0.05, 0.03]} />
                    </mesh>
                  );
                })}
                
                {/* Vertical dividers */}
                {Array.from({ length: 2 }).map((_, idx) => {
                  const xPos = ((idx - 0.5) * (elementDim.width / 3));
                  return (
                    <mesh 
                      key={`divider-${idx}`} 
                      position={[xPos, 0, 0.01]} 
                      material={frameMaterial}
                    >
                      <boxGeometry args={[0.03, elementDim.height - 0.05, 0.04]} />
                    </mesh>
                  );
                })}
              </group>
            );
            
          case ElementType.Door:
            return (
              <group
                key={id}
                position={[adjustedPosition.x, adjustedPosition.y, adjustedPosition.z]}
                rotation={[adjustedRotation.x, adjustedRotation.y, adjustedRotation.z]}
              >
                {/* Door frame */}
                <mesh material={frameMaterial}>
                  <boxGeometry args={[elementDim.width + 0.1, elementDim.height + 0.05, 0.05]} />
                </mesh>
                
                {/* Door panel */}
                <mesh position={[0, 0, 0.02]} material={elementMaterial}>
                  <boxGeometry args={[elementDim.width - 0.05, elementDim.height - 0.05, 0.04]} />
                </mesh>
                
                {/* Door handle */}
                <mesh position={[elementDim.width / 3, 0, 0.05]} material={new THREE.MeshStandardMaterial({ color: '#aaaaaa', metalness: 0.9 })}>
                  <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} rotation={[Math.PI / 2, 0, 0]} />
                </mesh>
              </group>
            );
            
          case ElementType.SectionalDoor:
          case ElementType.WindowedSectionalDoor:
            return (
              <group
                key={id}
                position={[adjustedPosition.x, adjustedPosition.y, adjustedPosition.z]}
                rotation={[adjustedRotation.x, adjustedRotation.y, adjustedRotation.z]}
              >
                {/* Door frame */}
                <mesh material={frameMaterial}>
                  <boxGeometry args={[elementDim.width + 0.1, elementDim.height + 0.1, 0.05]} />
                </mesh>
                
                {/* Door panel */}
                <mesh position={[0, 0, 0.03]} material={elementMaterial}>
                  <boxGeometry args={[elementDim.width, elementDim.height, 0.05]} />
                </mesh>
                
                {/* Door segments - horizontal lines */}
                {[0.25, 0.5, 0.75].map((pos, idx) => (
                  <mesh 
                    key={`segment-${idx}`} 
                    position={[0, elementDim.height * (pos - 0.5), 0.06]} 
                    material={frameMaterial}
                  >
                    <boxGeometry args={[elementDim.width, 0.05, 0.01]} />
                  </mesh>
                ))}
                
                {/* Windows - only for WindowedSectionalDoor */}
                {type === ElementType.WindowedSectionalDoor && (
                  <group position={[0, elementDim.height * 0.15, 0.06]}>
                    {/* Window row */}
                    {Array.from({ length: 4 }).map((_, idx) => {
                      const windowWidth = elementDim.width * 0.2;
                      const spacing = elementDim.width * 0.05;
                      const totalWidth = (windowWidth * 4) + (spacing * 3);
                      const startX = -totalWidth / 2 + (windowWidth / 2);
                      const xPos = startX + idx * (windowWidth + spacing);
                      
                      return (
                        <group key={`window-${idx}`} position={[xPos, 0, 0]}>
                          {/* Window frame */}
                          <mesh material={frameMaterial}>
                            <boxGeometry args={[windowWidth, elementDim.height * 0.2, 0.02]} />
                          </mesh>
                          {/* Window glass */}
                          <mesh position={[0, 0, 0.01]} material={glassMaterial}>
                            <boxGeometry args={[windowWidth - 0.05, elementDim.height * 0.18, 0.02]} />
                          </mesh>
                        </group>
                      );
                    })}
                  </group>
                )}
                {/* Door handle */}
                <mesh position={[0, -elementDim.height / 3, 0.06]} material={new THREE.MeshStandardMaterial({ color: '#aaaaaa', metalness: 0.9 })}>
                  <boxGeometry args={[elementDim.width / 3, 0.08, 0.02]} />
                </mesh>
              </group>
            );
            
          case ElementType.LightBand:
            // Calculate number of segments based on width
            const numSegments = Math.max(2, Math.floor(elementDim.width));
            const segmentWidth = elementDim.width / numSegments;
            
            return (
              <group
                key={id}
                position={[adjustedPosition.x, adjustedPosition.y, adjustedPosition.z]}
                rotation={[adjustedRotation.x, adjustedRotation.y, adjustedRotation.z]}
              >
                {/* Light band frame */}
                <mesh material={frameMaterial}>
                  <boxGeometry args={[elementDim.width + 0.1, elementDim.height + 0.1, 0.05]} />
                </mesh>
                
                {/* Light panels */}
                {Array.from({ length: numSegments }).map((_, idx) => {
                  const xPos = (idx * segmentWidth) - (elementDim.width / 2) + (segmentWidth / 2);
                  return (
                    <mesh 
                      key={`light-${idx}`} 
                      position={[xPos, 0, 0.02]} 
                      material={lightMaterial}
                    >
                      <boxGeometry args={[segmentWidth - 0.05, elementDim.height - 0.05, 0.03]} />
                    </mesh>
                  );
                })}
                
                {/* Vertical dividers */}
                {Array.from({ length: numSegments - 1 }).map((_, idx) => {
                  const xPos = ((idx + 1) * segmentWidth) - (elementDim.width / 2);
                  return (
                    <mesh 
                      key={`divider-${idx}`} 
                      position={[xPos, 0, 0.01]} 
                      material={frameMaterial}
                    >
                      <boxGeometry args={[0.03, elementDim.height - 0.05, 0.04]} />
                    </mesh>
                  );
                })}
              </group>
            );
            
          default:
            return null;
        }
      })}
    </group>
  );
};

export default BuildingElements;