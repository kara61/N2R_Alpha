import { WallType, HallDimensions, BuildingElement } from '../../types';

/**
 * Calculate canvas dimensions based on container size and wall orientation
 */
export const calculateCanvasDimensions = (
  container: HTMLDivElement | null,
  activeWall: WallType,
  dimensions: HallDimensions
) => {
  if (!container) return { width: 800, height: 600, scale: 1 };
  
  // Get container dimensions
  const containerWidth = container.clientWidth - 40; // Subtract padding
  const containerHeight = container.clientHeight - 40;
  
  // Get wall dimensions
  let wallWidth, wallHeight;
  if (activeWall === WallType.North || activeWall === WallType.South) {
    wallWidth = dimensions.length;
    wallHeight = dimensions.height;
  } else {
    wallWidth = dimensions.width;
    wallHeight = dimensions.height;
  }
  
  // Calculate scale to fit wall in container
  // We want to maintain aspect ratio
  const widthScale = containerWidth / wallWidth;
  const heightScale = containerHeight / wallHeight;
  const scale = Math.min(widthScale, heightScale);
  
  // Calculate canvas dimensions
  const width = wallWidth * scale;
  const height = wallHeight * scale;
  
  return { width, height, scale };
};

/**
 * Convert canvas coordinates to wall coordinates
 */
export const canvasToWallCoordinates = (
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  wallWidth: number,
  wallHeight: number,
  yOffset: number = 0
) => {
  // Calculate scale factors
  const scaleX = wallWidth / canvasWidth;
  const scaleY = wallHeight / canvasHeight;
  
  // Convert to wall coordinates (centered at origin)
  const x = (canvasX - canvasWidth / 2) * scaleX;
  const y = (canvasHeight - canvasY - canvasHeight / 2) * scaleY + yOffset;
  
  return { x, y };
};

/**
 * Convert wall coordinates to canvas coordinates
 */
export const wallToCanvasCoordinates = (
  wallX: number,
  wallY: number,
  canvasWidth: number,
  canvasHeight: number,
  wallWidth: number,
  wallHeight: number,
  yOffset: number = 0
) => {
  // Calculate scale factors
  const scaleX = canvasWidth / wallWidth;
  const scaleY = canvasHeight / wallHeight;
  
  // Convert to canvas coordinates
  const x = (wallX + wallWidth / 2) * scaleX;
  const y = canvasHeight - ((wallY - yOffset) + wallHeight / 2) * scaleY;
  
  return { x, y };
};

/**
 * Check if a point is inside an element rectangle
 */
export const isPointInElement = (
  pointX: number,
  pointY: number,
  element: BuildingElement,
  scale: number
) => {
  const { x, y } = element.position;
  const { width, height } = element.dimensions;
  
  // Half dimensions
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Check if point is inside rectangle
  return (
    pointX >= x - halfWidth * scale &&
    pointX <= x + halfWidth * scale &&
    pointY >= y - halfHeight * scale &&
    pointY <= y + halfHeight * scale
  );
};

/**
 * Get wall width and height based on active wall and building dimensions
 */
export const getWallDimensions = (
  activeWall: WallType,
  dimensions: HallDimensions
) => {
  let wallWidth, wallHeight;
  
  if (activeWall === WallType.North || activeWall === WallType.South) {
    wallWidth = dimensions.length;
    wallHeight = dimensions.height;
  } else {
    wallWidth = dimensions.width;
    wallHeight = dimensions.height;
  }
  
  return { wallWidth, wallHeight };
};
