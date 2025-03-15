import { useMemo } from 'react';
import * as THREE from 'three';
import { CladdingType } from '../../types';
import { RalColor } from '../../types';

export interface MaterialsResult {
  structureMaterial: THREE.MeshStandardMaterial;
  northSouthMaterial: THREE.MeshStandardMaterial;
  eastWestMaterial: THREE.MeshStandardMaterial;
  roofMaterial: THREE.MeshStandardMaterial;
  concreteMaterial: THREE.MeshStandardMaterial;
  gutterMaterial: THREE.MeshStandardMaterial;
}

// Create a texture for sandwich panels with micro linings
const createPanelTexture = (color: string, isRoof: boolean = false): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  
  // Fill background with base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Add subtle gradient for depth
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw micro linings
  ctx.strokeStyle = isRoof ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1;
  
  // Horizontal or vertical lines based on panel type
  const lineSpacing = 16; // Use the same smaller spacing for both roof and walls
  
  // For roof, draw vertical lines (rotated 90 degrees from original)
  // For walls, draw horizontal lines (changed from vertical to match roof scale)
  // Swap the orientation to rotate by 90 degrees
  const direction = isRoof ? 'horizontal' : 'vertical';
  
  if (direction === 'horizontal') {
    for (let y = 0; y < size; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  } else {
    for (let x = 0; x < size; x += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  }
  
  // Add subtle panel joint lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  
  if (isRoof) {
    // Roof panels now have vertical seams (rotated 90 degrees)
    for (let x = 0; x < size; x += size / 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  } else {
    // Wall panels now have horizontal seams (changed from vertical)
    for (let y = 0; y < size; y += size / 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }
  
  // Add subtle noise for texture
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(x, y, 1, 1);
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // Default to 1,1 scaling - will be adjusted in the material
  
  return texture;
};

// Create a texture for trapezoid sheet metal
const createTrapezoidTexture = (color: string, isRoof: boolean = false): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  
  // Fill background with base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Add subtle gradient for depth
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw trapezoid ridges
  const ridgeSpacing = 32;
  const ridgeWidth = 16;
  
  // Direction based on roof or wall - rotated 90 degrees for roof
  // Swap the orientation to rotate by 90 degrees
  const direction = isRoof ? 'horizontal' : 'vertical';
  
  if (direction === 'horizontal') {
    for (let y = 0; y < size; y += ridgeSpacing) {
      // Draw ridge highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, y, size, ridgeWidth / 2);
      
      // Draw ridge shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, y + ridgeWidth / 2, size, ridgeWidth / 2);
    }
  } else {
    for (let x = 0; x < size; x += ridgeSpacing) {
      // Draw ridge highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x, 0, ridgeWidth / 2, size);
      
      // Draw ridge shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x + ridgeWidth / 2, 0, ridgeWidth / 2, size);
    }
  }
  
  // Add subtle noise for texture
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(x, y, 1, 1);
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // Default to 1,1 scaling - will be adjusted in the material
  
  return texture;
};

// Create a normal map for panel textures
const createNormalMap = (isRoof: boolean = false, isTrapezoid: boolean = false): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  
  // Fill with neutral normal (128, 128, 255)
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, size, size);
  
  // Direction based on roof or wall - rotated 90 degrees for roof
  const direction = isRoof ? 'vertical' : 'horizontal';
  
  if (isTrapezoid) {
    // Trapezoid ridges
    const ridgeSpacing = 32;
    const ridgeWidth = 16;
    
    if (direction === 'horizontal') {
      for (let y = 0; y < size; y += ridgeSpacing) {
        // Ridge normal (pointing up)
        ctx.fillStyle = '#8060ff'; // More blue, less green
        ctx.fillRect(0, y, size, ridgeWidth);
      }
    } else {
      for (let x = 0; x < size; x += ridgeSpacing) {
        // Ridge normal (pointing right)
        ctx.fillStyle = '#a080ff'; // More red, normal blue
        ctx.fillRect(x, 0, ridgeWidth, size);
      }
    }
  } else {
    // Sandwich panel seams
    const lineSpacing = 16; // Use the same spacing for both
    const majorSeamSpacing = size / 2;
    
    if (direction === 'horizontal') {
      // Minor seams
      for (let y = 0; y < size; y += lineSpacing) {
        ctx.fillStyle = '#8078ff'; // Slight normal variation
        ctx.fillRect(0, y, size, 1);
      }
      
      // Major seams
      for (let y = 0; y < size; y += majorSeamSpacing) {
        ctx.fillStyle = '#8070ff'; // More pronounced normal variation
        ctx.fillRect(0, y, size, 2);
      }
    } else {
      // Minor seams
      for (let x = 0; x < size; x += lineSpacing) {
        ctx.fillStyle = '#8878ff'; // Slight normal variation
        ctx.fillRect(x, 0, 1, size);
      }
      
      // Major seams
      for (let x = 0; x < size; x += majorSeamSpacing) {
        ctx.fillStyle = '#9080ff'; // More pronounced normal variation
        ctx.fillRect(x, 0, 2, size);
      }
    }
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Default to 1,1 scaling - will be adjusted in the material
  
  return texture;
};

export const useBuildingMaterials = (
  claddingType: CladdingType,
  facadeColor: RalColor | undefined,
  roofColor: RalColor | undefined
): MaterialsResult => {
  // Structure material
  const structureMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({ 
      color: '#555555', 
      metalness: 0.8, 
      roughness: 0.2 
    });
  }, [claddingType]);
  
  // North-South walls material
  const northSouthMaterial = useMemo(() => {
    // Different materials based on cladding type and facade color
    const facadeHex = facadeColor?.hex || '#E7EBDA'; // Default to RAL 9002 if not found
    
    const roughnessValues = {
      'trapezoid': 0.6,
      'sandwich60': 0.5,
      'sandwich80': 0.5,
      'sandwich100': 0.5,
    };
    
    const metalnessValues = {
      'trapezoid': 0.4,
      'sandwich60': 0.2,
      'sandwich80': 0.2,
      'sandwich100': 0.2,
    };
    
    const isTrapezoid = claddingType === CladdingType.TrapezoidSheet;
    
    // Create texture for north-south walls - horizontal panels
    const diffuseTexture = isTrapezoid 
      ? createTrapezoidTexture(facadeHex, true)  // Use true for vertical orientation
      : createPanelTexture(facadeHex, true);     // Use true for vertical orientation
    
    // Create normal map
    const normalTexture = createNormalMap(true, isTrapezoid);
    
    // Set texture repeat for north-south walls - scale vertically by 2
    diffuseTexture.repeat.set(10, 0);
    normalTexture.repeat.set(1, 1);
    
    return new THREE.MeshStandardMaterial({ 
      color: facadeHex, 
      metalness: metalnessValues[claddingType], 
      roughness: roughnessValues[claddingType],
      map: diffuseTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.1, 0.1)
    });
  }, [claddingType, facadeColor]);
  
  // East-West walls material
  const eastWestMaterial = useMemo(() => {
    // Different materials based on cladding type and facade color
    const facadeHex = facadeColor?.hex || '#E7EBDA'; // Default to RAL 9002 if not found
    
    const roughnessValues = {
      'trapezoid': 0.6,
      'sandwich60': 0.5,
      'sandwich80': 0.5,
      'sandwich100': 0.5,
    };
    
    const metalnessValues = {
      'trapezoid': 0.4,
      'sandwich60': 0.2,
      'sandwich80': 0.2,
      'sandwich100': 0.2,
    };
    
    const isTrapezoid = claddingType === CladdingType.TrapezoidSheet;
    
    // Create texture for east-west walls - vertical panels
    const diffuseTexture = isTrapezoid 
      ? createTrapezoidTexture(facadeHex, true)  // Use true for vertical orientation
      : createPanelTexture(facadeHex, true);     // Use true for vertical orientation
    
    // Create normal map with vertical orientation
    const normalTexture = createNormalMap(true, isTrapezoid);
    
    // Set texture repeat for 1m wide panels
    diffuseTexture.repeat.set(1, 0);
    normalTexture.repeat.set(1, 1);
    
    return new THREE.MeshStandardMaterial({ 
      color: facadeHex, 
      metalness: metalnessValues[claddingType], 
      roughness: roughnessValues[claddingType],
      map: diffuseTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.1, 0.1)
    });
  }, [claddingType, facadeColor]);
  
  // Roof material
  const roofMaterial = useMemo(() => {
    // Use roof color for the roof material
    const roofHex = roofColor?.hex || '#293133'; // Default to RAL 7016 if not found
    
    const isTrapezoid = claddingType === CladdingType.TrapezoidSheet;
    
    // Create appropriate texture based on cladding type
    const diffuseTexture = isTrapezoid 
      ? createTrapezoidTexture(roofHex, true)
      : createPanelTexture(roofHex, true);
    
    // Create normal map
    const normalTexture = createNormalMap(true, isTrapezoid);
    
    // Set texture repeat for roof - match wall scaling
    diffuseTexture.repeat.set(10, 0);
    normalTexture.repeat.set(1, 1);
    
    return new THREE.MeshStandardMaterial({ 
      color: roofHex, 
      metalness: 0.4, 
      roughness: 0.6,
      map: diffuseTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.1, 0.1)
    });
  }, [claddingType, roofColor]);

  // Concrete material
  const concreteMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base color
      ctx.fillStyle = '#d2d2d2';
      ctx.fillRect(0, 0, size, size);
      
      // Add noise for concrete texture
      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const gray = 160 + Math.random() * 60;
        ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.8)`;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Add some cracks
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        const startX = Math.random() * size;
        const startY = Math.random() * size;
        ctx.moveTo(startX, startY);
        
        // Create jagged line for crack
        let x = startX;
        let y = startY;
        for (let j = 0; j < 8; j++) {
          x += (Math.random() - 0.5) * 40;
          y += (Math.random() - 0.5) * 40;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    
    return new THREE.MeshStandardMaterial({
      color: '#d2d2d2',
      roughness: 0.7,
      metalness: 0.1,
      envMapIntensity: 0.8,
      normalScale: new THREE.Vector2(0.1, 0.1),
      aoMapIntensity: 0.5,
      map: texture
    });
  }, []);

  // Gutter material
  const gutterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#777777',
      roughness: 0.3,
      metalness: 0.7,
    });
  }, []);

  return {
    structureMaterial,
    northSouthMaterial,
    eastWestMaterial,
    roofMaterial,
    concreteMaterial,
    gutterMaterial
  };
};

// Add this function to create and return textures for different cladding types
const getCladdingTexture = (claddingType: CladdingType) => {
  const facadeHex = '#E7EBDA'; // Default color - will be overridden in the material
  
  const isTrapezoid = claddingType === CladdingType.TrapezoidSheet;
  
  // Create diffuse texture based on cladding type
  const map = isTrapezoid
    ? createTrapezoidTexture(facadeHex)
    : createPanelTexture(facadeHex);
  
  // Create normal map
  const normalMap = createNormalMap(false, isTrapezoid);
  
  // Create roughness map
  const roughnessMap = new THREE.CanvasTexture(createRoughnessMap(isTrapezoid));
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  
  // Create AO map
  const aoMap = new THREE.CanvasTexture(createAoMap(isTrapezoid));
  aoMap.wrapS = aoMap.wrapT = THREE.RepeatWrapping;
  
  return {
    map,
    normalMap,
    roughnessMap,
    aoMap
  };
};

// Function to create roughness map
function createRoughnessMap(isTrapezoid: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  // Fill with base roughness value
  ctx.fillStyle = '#808080'; // 50% roughness
  ctx.fillRect(0, 0, size, size);
  
  if (isTrapezoid) {
    // Add roughness variation for trapezoid ridges
    const ridgeSpacing = 32;
    
    for (let y = 0; y < size; y += ridgeSpacing) {
      // Ridge tops are smoother
      ctx.fillStyle = '#606060'; // 38% roughness
      ctx.fillRect(0, y, size, 8);
      
      // Ridge valleys are rougher
      ctx.fillStyle = '#a0a0a0'; // 63% roughness
      ctx.fillRect(0, y + 16, size, 8);
    }
  } else {
    // Add roughness variation for panel seams
    const seams = size / 2;
    
    for (let y = 0; y < size; y += seams) {
      // Seams are rougher
      ctx.fillStyle = '#909090'; // 56% roughness
      ctx.fillRect(0, y, size, 4);
    }
    
    // Add some random roughness variation
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const gray = 120 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  
  return canvas;
}

// Function to create ambient occlusion map
function createAoMap(isTrapezoid: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  // Fill with base white (no occlusion)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  if (isTrapezoid) {
    // Add occlusion for trapezoid valleys
    const ridgeSpacing = 32;
    
    for (let y = 0; y < size; y += ridgeSpacing) {
      // Valleys have more occlusion
      ctx.fillStyle = '#e0e0e0'; // 88% white
      ctx.fillRect(0, y + 20, size, 12);
    }
  } else {
    // Add occlusion for panel seams
    const seams = size / 2;
    
    for (let y = 0; y < size; y += seams) {
      // Seams have more occlusion
      ctx.fillStyle = '#e8e8e8'; // 91% white
      ctx.fillRect(0, y, 3, size);
    }
  }
  
  return canvas;
}

export const useMonopitchWallMaterials = (
  claddingType: CladdingType, 
  facadeColor: RalColor | undefined,
  dimensions: { length: number, width: number, height: number, roofPitch: number }
) => {
  return useMemo(() => {
    if (!facadeColor) {
      throw new Error("Facade color is required for monopitch materials");
    }
    
    const { length, width, height, roofPitch } = dimensions;
    const roofHeight = width * (roofPitch / 100);
    const colorHex = facadeColor.hex;
    
    // Material properties - EXACTLY match standard materials
    const roughnessValues = {
      'trapezoid': 0.6,
      'sandwich60': 0.5,
      'sandwich80': 0.5,
      'sandwich100': 0.5,
    };
    
    const metalnessValues = {
      'trapezoid': 0.4,
      'sandwich60': 0.2,
      'sandwich80': 0.2,
      'sandwich100': 0.2,
    };
    
    const isTrapezoid = claddingType === CladdingType.TrapezoidSheet;
    
    // NORTH/SOUTH WALLS - Use the same scaling as standard materials
    const northSouthTexture = isTrapezoid 
      ? createTrapezoidTexture(colorHex, true)
      : createPanelTexture(colorHex, true);
    
    // Create normal map
    const northSouthNormalMap = createNormalMap(true, isTrapezoid);
    
    // EXACT SAME settings as standard northSouthMaterial
    northSouthTexture.wrapS = northSouthTexture.wrapT = THREE.RepeatWrapping;
    northSouthTexture.repeat.set(10, 0);  // MATCH the standard north/south walls
    northSouthNormalMap.repeat.set(1, 1);
    
    // EAST/WEST WALLS - Create a different texture instance with different scaling
    const eastWestTexture = isTrapezoid 
      ? createTrapezoidTexture(colorHex, true)
      : createPanelTexture(colorHex, true);
    
    // Create another normal map for east/west
    const eastWestNormalMap = createNormalMap(true, isTrapezoid);
    
    // EXACT SAME settings as standard eastWestMaterial
    eastWestTexture.wrapS = eastWestTexture.wrapT = THREE.RepeatWrapping;
    eastWestTexture.repeat.set(1, 0);  // MATCH the standard east/west walls
    eastWestNormalMap.repeat.set(1, 1);
    
    // Create materials
    const northMaterial = new THREE.MeshStandardMaterial({ 
      color: colorHex, 
      metalness: metalnessValues[claddingType], 
      roughness: roughnessValues[claddingType],
      map: northSouthTexture,
      normalMap: northSouthNormalMap,
      normalScale: new THREE.Vector2(0.1, 0.1),
      side: THREE.DoubleSide
    });
    
    const southMaterial = northMaterial.clone();
    
    const eastWestMaterial = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: metalnessValues[claddingType],
      roughness: roughnessValues[claddingType],
      map: eastWestTexture,
      normalMap: eastWestNormalMap,
      normalScale: new THREE.Vector2(0.1, 0.1),
      side: THREE.DoubleSide
    });

    return {
      northMaterial,
      southMaterial,
      eastWestMaterial
    };
  }, [claddingType, facadeColor, dimensions]);
};