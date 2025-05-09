import { RoofType, HallDimensions, RoofElement } from '../../types';

/**
 * Calculate 3D roof position from 2D canvas coordinates
 */
export const calculateRoofPosition = (
  canvasX: number, 
  canvasY: number, 
  canvas: HTMLCanvasElement,
  roofType: RoofType,
  dimensions: HallDimensions
) => {
  // Get roof dimensions
  const roofLength = dimensions.length;
  const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
  
  // Calculate different widths based on roof type
  let roofWidth;
  if (roofType === RoofType.Flat) {
    roofWidth = dimensions.width;
  } else if (roofType === RoofType.Gable) {
    const slopeLength = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2));
    roofWidth = slopeLength * 2;
  } else { // Monopitch
    roofWidth = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
  }
  
  // Scale factors for converting canvas coordinates to 3D positions
  const scaleX = canvas.width / roofLength;
  const scaleY = canvas.height / roofWidth;
  
  // Convert canvas coordinates to 3D positions
  const x = (canvasX / scaleX) - (roofLength / 2);
  
  // Calculate z and y positions based on roof type
  let z = 0, y = 0;
  
  if (roofType === RoofType.Flat) {
    // For flat roof, direct mapping
    z = (canvasY / scaleY) - (roofWidth / 2);
    y = dimensions.height + 0.05; // Slightly above the roof
  } 
  else if (roofType === RoofType.Gable) {
    // For gable roof, need special handling for ridge
    if (canvasY < canvas.height / 2) {
      // Front side of the roof
      const distanceFromRidge = (canvas.height / 2 - canvasY) / scaleY;
      z = -distanceFromRidge;
      
      // Calculate height along the slope
      const slopeRatio = roofHeight / (dimensions.width / 2);
      const heightAboveWall = Math.abs(z) * slopeRatio;
      y = dimensions.height + heightAboveWall;
    } else {
      // Back side of the roof
      const distanceFromRidge = (canvasY - canvas.height / 2) / scaleY;
      z = distanceFromRidge;
      
      // Calculate height along the slope
      const slopeRatio = roofHeight / (dimensions.width / 2);
      const heightAboveWall = Math.abs(z) * slopeRatio;
      y = dimensions.height + heightAboveWall;
    }
  } 
  else { // Monopitch
    // For monopitch roof, height varies linearly from front to back
    const normalizedY = canvasY / canvas.height;
    z = -dimensions.width / 2 + normalizedY * dimensions.width;
    
    // Calculate height based on position along the slope
    const progress = normalizedY; // 0 at front (low point), 1 at back (high point)
    y = dimensions.height + (roofHeight * progress);
  }
  
  return { x, y, z };
};

/**
 * Calculate canvas dimensions based on container size and roof type
 */
export const calculateCanvasDimensions = (
  container: HTMLDivElement | null,
  roofType: RoofType,
  dimensions: HallDimensions
) => {
  if (!container) return { width: 800, height: 600, scale: 1 };
  
  // Get container dimensions
  const containerWidth = container.clientWidth - 40; // Subtract padding
  const containerHeight = container.clientHeight - 40;
  
  // Get roof dimensions
  const roofLength = dimensions.length;
  const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
  
  // Calculate roof width based on type
  let roofWidth;
  if (roofType === RoofType.Flat) {
    roofWidth = dimensions.width;
  } else if (roofType === RoofType.Gable) {
    const slopeLength = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2));
    roofWidth = slopeLength * 2;
  } else { // Monopitch
    roofWidth = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
  }
  
  // Calculate scale to fit roof in container
  // We want to maintain aspect ratio
  const widthScale = containerWidth / roofLength;
  const heightScale = containerHeight / roofWidth;
  const scale = Math.min(widthScale, heightScale);
  
  // Calculate canvas dimensions
  const width = roofLength * scale;
  const height = roofWidth * scale;
  
  return { width, height, scale };
};

/**
 * Check if a point is inside a roof element
 */
export const isPointInRoofElement = (
  pointX: number,
  pointY: number,
  element: RoofElement,
  scale: number
) => {
  const { x, z } = element.position;
  const { width, length = 0 } = element.dimensions;
  
  // For elements like ridge skylights, use length
  const effectiveDepth = length || width;
  
  // Half dimensions
  const halfWidth = width / 2;
  const halfDepth = effectiveDepth / 2;
  
  // Check if point is inside rectangle
  return (
    pointX >= x - halfWidth * scale &&
    pointX <= x + halfWidth * scale &&
    pointY >= z - halfDepth * scale &&
    pointY <= z + halfDepth * scale
  );
};

/**
 * Calculate roof element rotation based on roof type and position
 */
export const calculateRoofElementRotation = (
  roofType: RoofType,
  position: { x: number, y: number, z: number },
  dimensions: HallDimensions
) => {
  const roofPitch = dimensions.roofPitch;
  
  // Calculate rotation (in radians)
  let xRotation = 0; // pitch (up/down)
  let yRotation = 0; // yaw (left/right)
  let zRotation = 0; // roll (spin)
  
  if (roofType === RoofType.Flat) {
    // No rotation for flat roof
    xRotation = 0;
  } 
  else if (roofType === RoofType.Gable) {
    // For gable roof, calculate pitch based on position
    // Convert pitch percentage to angle in radians
    const pitchRadians = Math.atan(roofPitch / 100);
    
    if (position.z < 0) {
      // Front side of roof (negative z)
      xRotation = -pitchRadians;
    } else {
      // Back side of roof (positive z)
      xRotation = pitchRadians;
    }
  } 
  else if (roofType === RoofType.Monopitch) {
    // For monopitch, the whole roof has the same pitch
    const pitchRadians = Math.atan(roofPitch / 100);
    xRotation = pitchRadians;
  }
  
  return { 
    x: xRotation, 
    y: yRotation, 
    z: zRotation 
  };
};
