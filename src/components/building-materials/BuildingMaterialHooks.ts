import { useMemo } from 'react';
import * as THREE from 'three';
import { CladdingType, RalColor } from '../../types';
import { getCladdingTexture } from './TextureFactory';

export interface MaterialsResult {
  structureMaterial: THREE.MeshStandardMaterial;
  northSouthMaterial: THREE.MeshStandardMaterial;
  eastWestMaterial: THREE.MeshStandardMaterial;
  roofMaterial: THREE.MeshStandardMaterial;
  concreteMaterial: THREE.MeshStandardMaterial;
  gutterMaterial: THREE.MeshStandardMaterial;
}

/**
 * Hook to provide all materials for the building
 */
export const useBuildingMaterials = (
  claddingType: CladdingType,
  facadeColor: RalColor | undefined,
  roofColor: RalColor | undefined
): MaterialsResult => {
  return useMemo(() => {
    // Default colors if not defined
    const facadeHex = facadeColor?.hex || '#B0B0B0';
    const roofHex = roofColor?.hex || '#4A4A4A';
    
    // STRUCTURE MATERIAL (steel beams)
    const structureMaterial = new THREE.MeshStandardMaterial({
      color: '#737373',
      roughness: 0.4,
      metalness: 0.8,
      side: THREE.DoubleSide
    });
    
    // Get facade textures (north-south walls)
    const nsTextures = getCladdingTexture(claddingType, facadeHex, false);
    
    // NORTH-SOUTH WALLS MATERIAL
    const northSouthMaterial = new THREE.MeshStandardMaterial({
      map: nsTextures.diffuseMap,
      normalMap: nsTextures.normalMap,
      roughnessMap: nsTextures.roughnessMap,
      aoMap: nsTextures.aoMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.6,
      metalness: 0.2,
      side: THREE.DoubleSide,
      // Set appropriate texture scaling
      ...(claddingType === CladdingType.TrapezoidSheet
        ? { envMapIntensity: 0.8 }
        : { envMapIntensity: 0.5 })
    });
    
    // Set texture mapping to ensure proper repeating
    // Note: This scaling factor is applied within the getCladdingTexture function
    // const textureScalingFactor = claddingType === CladdingType.TrapezoidSheet ? 0.5 : 0.25;
    
    // EAST-WEST WALLS MATERIAL (same as north-south but different orientation)
    const eastWestTextures = getCladdingTexture(claddingType, facadeHex, false);
    const eastWestMaterial = new THREE.MeshStandardMaterial({
      map: eastWestTextures.diffuseMap,
      normalMap: eastWestTextures.normalMap,
      roughnessMap: eastWestTextures.roughnessMap,
      aoMap: eastWestTextures.aoMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.6,
      metalness: 0.2,
      side: THREE.DoubleSide,
      // Set appropriate texture scaling
      ...(claddingType === CladdingType.TrapezoidSheet
        ? { envMapIntensity: 0.8 }
        : { envMapIntensity: 0.5 })
    });
    
    // For east-west walls, we need to rotate textures 90 degrees for some cladding types
    if (claddingType !== CladdingType.TrapezoidSheet) {
      eastWestTextures.diffuseMap.rotation = Math.PI / 2;
      eastWestTextures.normalMap.rotation = Math.PI / 2;
      eastWestTextures.roughnessMap.rotation = Math.PI / 2;
      eastWestTextures.aoMap.rotation = Math.PI / 2;
    }
    
    // ROOF MATERIAL
    const roofTextures = getCladdingTexture(
      claddingType === CladdingType.TrapezoidSheet 
        ? CladdingType.TrapezoidSheet 
        : CladdingType.SandwichPanel60,
      roofHex,
      true
    );
    
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofTextures.diffuseMap,
      normalMap: roofTextures.normalMap,
      roughnessMap: roofTextures.roughnessMap,
      aoMap: roofTextures.aoMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.5,
      metalness: 0.3,
      side: THREE.DoubleSide,
      // Set appropriate texture scaling
      ...(claddingType === CladdingType.TrapezoidSheet
        ? { envMapIntensity: 0.8 }
        : { envMapIntensity: 0.5 })
    });
    
    // CONCRETE MATERIAL
    const concreteMaterial = new THREE.MeshStandardMaterial({
      color: '#B9B9B9',
      roughness: 0.85,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    
    // GUTTER MATERIAL
    const gutterMaterial = new THREE.MeshStandardMaterial({
      color: '#505050',
      roughness: 0.5,
      metalness: 0.7,
      side: THREE.DoubleSide
    });
    
    return {
      structureMaterial,
      northSouthMaterial,
      eastWestMaterial,
      roofMaterial,
      concreteMaterial,
      gutterMaterial
    };
  }, [claddingType, facadeColor, roofColor]);
};

/**
 * Hook specifically for monopitch wall materials
 */
export const useMonopitchWallMaterials = (
  claddingType: CladdingType, 
  facadeColor: RalColor | undefined,
  dimensions: { length: number, width: number, height: number, roofPitch: number }
) => {
  return useMemo(() => {
    // Default color if not defined
    const facadeHex = facadeColor?.hex || '#B0B0B0';
    
    // Get facade textures for monopitch
    const claddingTextures = getCladdingTexture(claddingType, facadeHex, false);
    
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: claddingTextures.diffuseMap,
      normalMap: claddingTextures.normalMap,
      roughnessMap: claddingTextures.roughnessMap,
      aoMap: claddingTextures.aoMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.6,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    
    // Calculate adjustment for texture scale based on panel size
    let wallTextureScaleX, wallTextureScaleY;
    
    // Panel scaled for standard size
    if (claddingType === CladdingType.TrapezoidSheet) {
      // For trapezoid, use more repeats for smaller ridges
      wallTextureScaleX = Math.ceil(dimensions.length / 2);
      wallTextureScaleY = Math.ceil(dimensions.height + (dimensions.width * dimensions.roofPitch / 100) / 1.5);
    } else {
      // For sandwich panels, scale based on standard 1m panel size
      wallTextureScaleX = Math.ceil(dimensions.length);
      wallTextureScaleY = Math.ceil(dimensions.height + (dimensions.width * dimensions.roofPitch / 100));
    }
    
    // Set texture repeats
    wallMaterial.map!.repeat.set(wallTextureScaleX, wallTextureScaleY);
    wallMaterial.normalMap!.repeat.set(wallTextureScaleX, wallTextureScaleY);
    wallMaterial.roughnessMap!.repeat.set(wallTextureScaleX, wallTextureScaleY);
    wallMaterial.aoMap!.repeat.set(wallTextureScaleX, wallTextureScaleY);
    
    return wallMaterial;
  }, [claddingType, facadeColor, dimensions]);
};
