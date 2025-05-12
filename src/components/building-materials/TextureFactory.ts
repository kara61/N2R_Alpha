import * as THREE from 'three';
import { CladdingType } from '../../types';

/**
 * Create a texture for sandwich panels with micro linings
 */
export const createPanelTexture = (color: string, isRoof: boolean = false): THREE.Texture => {
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
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // Ensure correct filtering for better appearance
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  return texture;
};

/**
 * Create a texture for trapezoid sheet metal
 */
export const createTrapezoidTexture = (color: string, isRoof: boolean = false): THREE.Texture => {
  // The isRoof parameter can be used to adjust appearance for roof vs wall textures
  // For now, we're using the same texture pattern for both
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
  
  // Draw trapezoid patterns
  const numRibs = 5; // Number of ribs
  const ribWidth = size / numRibs;
  
  // For roof and walls, the orientation is the same now (vertical ribs)
  // This creates a consistent look across the building
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  
  for (let x = 0; x < size; x += ribWidth) {
    // Draw the rib lines
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
    
    // Add shading to create 3D effect
    const gradient = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, ribWidth, size);
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // Ensure correct filtering for better appearance
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  return texture;
};

/**
 * Create a normal map for panel textures
 */
export const createNormalMap = (isRoof: boolean = false, isTrapezoid: boolean = false): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  
  // Set background to neutral normal (0.5, 0.5, 1.0) which is RGB (128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);
  
  if (isTrapezoid) {
    // Create normal map for trapezoid sheet
    const numRibs = 5;
    const ribWidth = size / numRibs;
    
    for (let x = 0; x < size; x += ribWidth) {
      // Gradient for the left side of the rib (facing right)
      const gradientLeft = ctx.createLinearGradient(x, 0, x + ribWidth * 0.3, 0);
      gradientLeft.addColorStop(0, 'rgb(190, 128, 255)'); // Strong red component for X+ direction
      gradientLeft.addColorStop(1, 'rgb(128, 128, 255)'); // Back to neutral
      
      ctx.fillStyle = gradientLeft;
      ctx.fillRect(x, 0, ribWidth * 0.3, size);
      
      // Gradient for the right side of the rib (facing left)
      const gradientRight = ctx.createLinearGradient(x + ribWidth * 0.7, 0, x + ribWidth, 0);
      gradientRight.addColorStop(0, 'rgb(128, 128, 255)'); // Neutral
      gradientRight.addColorStop(1, 'rgb(66, 128, 255)'); // Strong negative red for X- direction
      
      ctx.fillStyle = gradientRight;
      ctx.fillRect(x + ribWidth * 0.7, 0, ribWidth * 0.3, size);
    }
  } else {
    // Create normal map for panel lines
    const lineSpacing = 16;
    
    if (isRoof) {
      // Horizontal lines for roof
      for (let y = 0; y < size; y += lineSpacing) {
        // Line position
        ctx.fillStyle = 'rgb(128, 100, 255)'; // Slight green adjustment for Y- facing normals
        ctx.fillRect(0, y, size, 1);
        
        // Shadow edge
        ctx.fillStyle = 'rgb(128, 156, 255)'; // Slight negative green for Y+ facing normals
        ctx.fillRect(0, y + 1, size, 1);
      }
    } else {
      // Vertical lines for walls
      for (let x = 0; x < size; x += lineSpacing) {
        // Line position
        ctx.fillStyle = 'rgb(160, 128, 255)'; // Slight red adjustment for X+ facing normals
        ctx.fillRect(x, 0, 1, size);
        
        // Shadow edge
        ctx.fillStyle = 'rgb(96, 128, 255)'; // Slight negative red for X- facing normals
        ctx.fillRect(x + 1, 0, 1, size);
      }
    }
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

/**
 * Create a roughness map for materials
 */
export const createRoughnessMap = (isTrapezoid: boolean): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  
  // Base roughness
  const baseRoughness = isTrapezoid ? 0.6 : 0.4;
  const baseColor = Math.floor(255 * (1 - baseRoughness));
  
  // Fill with base roughness (white = smooth, black = rough)
  ctx.fillStyle = `rgb(${baseColor}, ${baseColor}, ${baseColor})`;
  ctx.fillRect(0, 0, size, size);
  
  if (isTrapezoid) {
    // For trapezoid, add roughness to the ridges
    const numRibs = 5;
    const ribWidth = size / numRibs;
    
    for (let x = 0; x < size; x += ribWidth) {
      // Ridge line is rougher
      ctx.fillStyle = 'rgb(80, 80, 80)'; // More rough
      ctx.fillRect(x, 0, 2, size);
      ctx.fillRect(x + ribWidth - 2, 0, 2, size);
    }
  } else {
    // For panels, add slight roughness to the panel lines
    const lineSpacing = 16;
    ctx.fillStyle = 'rgb(100, 100, 100)'; // More rough
    
    // Draw horizontal or vertical lines
    for (let i = 0; i < size; i += lineSpacing) {
      ctx.fillRect(0, i, size, 1); // Horizontal lines
      ctx.fillRect(i, 0, 1, size); // Vertical lines
    }
  }
  
  // Create random noise for natural feel
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (Math.random() > 0.992) {
        // Add random small scratches and imperfections
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
        ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
      }
    }
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

/**
 * Create an ambient occlusion map
 */
export const createAoMap = (isTrapezoid: boolean): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  
  // Fill with white (no occlusion)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  if (isTrapezoid) {
    // For trapezoid, add occlusion to the ridges
    const numRibs = 5;
    const ribWidth = size / numRibs;
    
    for (let x = 0; x < size; x += ribWidth) {
      // Darker at the base of each ridge
      const gradient = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
      gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, 0, ribWidth, size);
    }
  } else {
    // For panels, add slight occlusion along the panel lines
    const lineSpacing = 16;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    
    // Draw horizontal or vertical lines
    for (let i = 0; i < size; i += lineSpacing) {
      ctx.fillRect(0, i, size, 1); // Horizontal lines
      ctx.fillRect(i, 0, 1, size); // Vertical lines
    }
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

/**
 * Get appropriate texture for a cladding type
 */
interface CladdingTextures {
  diffuseMap: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
  aoMap: THREE.Texture;
}

export const getCladdingTexture = (claddingType: CladdingType, color: string, isRoof: boolean = false): CladdingTextures => {
  // Create the appropriate texture based on cladding type
  let diffuseMap: THREE.Texture;
  
  const isTrapezoid = claddingType === CladdingType.TrapezoidSheet;
  
  if (isTrapezoid) {
    diffuseMap = createTrapezoidTexture(color, isRoof);
  } else {
    // All sandwich panels use the same texture pattern
    diffuseMap = createPanelTexture(color, isRoof);
  }
  
  // Create normal map based on cladding type
  const normalMap = createNormalMap(isRoof, isTrapezoid);
  
  // Create roughness map based on cladding type
  const roughnessMap = createRoughnessMap(isTrapezoid);
  
  // Create ambient occlusion map based on cladding type
  const aoMap = createAoMap(isTrapezoid);
  
  return {
    diffuseMap,
    normalMap,
    roughnessMap,
    aoMap
  };
};
