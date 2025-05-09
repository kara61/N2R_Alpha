import React from 'react';
import * as THREE from 'three';
import { ElementType } from '../../types';

/**
 * Renders a standard door element
 */
export const renderDoor = (
  dimensions: { width: number; height: number; depth?: number },
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  material: THREE.Material,
  frameMaterial: THREE.Material
) => {
  // Ensure door is positioned correctly from ground level
  const centerY = dimensions.height / 2;
  
  // Adjusted position with correct Y coordinate
  const doorPosition = {
    x: position.x,
    y: centerY, // Use calculated centerY instead of position.y
    z: position.z
  };
  
  return (
    <group position={[doorPosition.x, doorPosition.y, doorPosition.z]} rotation={[rotation.x, rotation.y, rotation.z]}>
      {/* Door frame */}
      <mesh material={frameMaterial}>
        <boxGeometry args={[dimensions.width + 0.1, dimensions.height + 0.05, 0.05]} />
      </mesh>
      
      {/* Door panel */}
      <mesh position={[0, 0, 0.02]} material={material}>
        <boxGeometry args={[dimensions.width - 0.05, dimensions.height - 0.05, 0.04]} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[dimensions.width / 3, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]} 
            material={new THREE.MeshStandardMaterial({ color: '#aaaaaa', metalness: 0.9 })}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
      </mesh>
    </group>
  );
};

/**
 * Renders a sectional door (garage door style)
 */
export const renderSectionalDoor = (
  dimensions: { width: number; height: number; depth?: number },
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  material: THREE.Material,
  frameMaterial: THREE.Material,
  hasWindows: boolean = false,
  glassMaterial?: THREE.Material
) => {
  // Ensure door is positioned correctly from ground level
  const centerY = dimensions.height / 2;
  
  // Adjusted position with correct Y coordinate
  const doorPosition = {
    x: position.x,
    y: centerY,
    z: position.z
  };
  
  const panels = 5; // Number of horizontal panels
  const panelHeight = dimensions.height / panels;
  
  return (
    <group position={[doorPosition.x, doorPosition.y, doorPosition.z]} rotation={[rotation.x, rotation.y, rotation.z]}>
      {/* Door frame */}
      <mesh material={frameMaterial}>
        <boxGeometry args={[dimensions.width + 0.1, dimensions.height + 0.05, 0.05]} />
      </mesh>
      
      {/* Door panels */}
      {Array.from({ length: panels }).map((_, index) => {
        const panelY = dimensions.height / 2 - panelHeight / 2 - index * panelHeight;
        
        return (
          <group key={`panel-${index}`}>
            <mesh position={[0, panelY, 0.02]} material={material}>
              <boxGeometry args={[dimensions.width - 0.05, panelHeight - 0.02, 0.04]} />
            </mesh>
            
            {/* Add windows to the second panel from the top if specified */}
            {hasWindows && index === 1 && glassMaterial && (
              <>
                {/* Add small windows across the panel */}
                {Array.from({ length: 4 }).map((_, windowIndex) => {
                  const windowWidth = (dimensions.width - 0.3) / 4;
                  const windowX = -dimensions.width / 2 + 0.15 + windowWidth / 2 + windowIndex * windowWidth;
                  
                  return (
                    <mesh key={`window-${windowIndex}`} position={[windowX, panelY, 0.04]} material={glassMaterial}>
                      <boxGeometry args={[windowWidth - 0.05, panelHeight - 0.15, 0.01]} />
                    </mesh>
                  );
                })}
              </>
            )}
          </group>
        );
      })}
      
      {/* Door handle */}
      <mesh position={[0, -dimensions.height / 2 + 0.3, 0.05]} 
            material={new THREE.MeshStandardMaterial({ color: '#aaaaaa', metalness: 0.9 })}>
        <boxGeometry args={[dimensions.width / 2, 0.05, 0.02]} />
      </mesh>
    </group>
  );
};

/**
 * Renders a standard window element
 */
export const renderWindow = (
  dimensions: { width: number; height: number; depth?: number },
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  frameMaterial: THREE.Material,
  glassMaterial: THREE.Material
) => {
  return (
    <group position={[position.x, position.y, position.z]} rotation={[rotation.x, rotation.y, rotation.z]}>
      {/* Window frame */}
      <mesh material={frameMaterial}>
        <boxGeometry args={[dimensions.width + 0.1, dimensions.height + 0.1, 0.05]} />
      </mesh>
      
      {/* Window glass */}
      <mesh position={[0, 0, 0.01]} material={glassMaterial}>
        <boxGeometry args={[dimensions.width - 0.1, dimensions.height - 0.1, 0.02]} />
      </mesh>
      
      {/* Window dividers (horizontal and vertical) */}
      <mesh position={[0, 0, 0.02]} material={frameMaterial}>
        <boxGeometry args={[dimensions.width - 0.1, 0.05, 0.03]} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={frameMaterial}>
        <boxGeometry args={[0.05, dimensions.height - 0.1, 0.03]} />
      </mesh>
    </group>
  );
};

/**
 * Renders a light band (continuous window strip)
 */
export const renderLightBand = (
  dimensions: { width: number; height: number; depth?: number },
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number },
  frameMaterial: THREE.Material,
  glassMaterial: THREE.Material
) => {
  // Calculate how many segments to create based on width
  const segmentWidth = 1.0; // 1 meter segments
  const numSegments = Math.ceil(dimensions.width / segmentWidth);
  const actualSegmentWidth = dimensions.width / numSegments;
  
  return (
    <group position={[position.x, position.y, position.z]} rotation={[rotation.x, rotation.y, rotation.z]}>
      {/* Main frame */}
      <mesh material={frameMaterial}>
        <boxGeometry args={[dimensions.width + 0.05, dimensions.height + 0.05, 0.05]} />
      </mesh>
      
      {/* Glass panels */}
      {Array.from({ length: numSegments }).map((_, index) => {
        const segmentX = -dimensions.width / 2 + actualSegmentWidth / 2 + index * actualSegmentWidth;
        
        return (
          <mesh 
            key={`segment-${index}`} 
            position={[segmentX, 0, 0.01]} 
            material={glassMaterial}
          >
            <boxGeometry args={[actualSegmentWidth - 0.05, dimensions.height - 0.08, 0.02]} />
          </mesh>
        );
      })}
      
      {/* Vertical dividers between panels */}
      {Array.from({ length: numSegments - 1 }).map((_, index) => {
        const dividerX = -dimensions.width / 2 + (index + 1) * actualSegmentWidth;
        
        return (
          <mesh 
            key={`divider-${index}`} 
            position={[dividerX, 0, 0.02]} 
            material={frameMaterial}
          >
            <boxGeometry args={[0.03, dimensions.height - 0.06, 0.03]} />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Create appropriate element renderer based on element type
 */
export const createElementRenderer = (
  type: ElementType, 
  dimensions: any, 
  position: any, 
  rotation: any, 
  material: any, 
  frameMaterial: any, 
  glassMaterial?: any
) => {
  // Ensure vertical positioning is correct
  switch (type) {
    case ElementType.Door:
      return renderDoor(dimensions, position, rotation, material, frameMaterial);
      
    case ElementType.SectionalDoor:
      return renderSectionalDoor(dimensions, position, rotation, material, frameMaterial, false);
      
    case ElementType.WindowedSectionalDoor:
      return renderSectionalDoor(dimensions, position, rotation, material, frameMaterial, true, glassMaterial);
      
    case ElementType.Window:
      return renderWindow(dimensions, position, rotation, frameMaterial, glassMaterial!);
      
    case ElementType.LightBand:
      return renderLightBand(dimensions, position, rotation, frameMaterial, glassMaterial!);
      
    default:
      return null;
  }
};
