import { WallType, BuildingElement, HallDimensions } from '../../types';

/**
 * Calculate world position and rotation for a wall element
 */
export const calculateElementTransform = (
  element: BuildingElement,
  dimensions: HallDimensions,
  wallThickness: number = 0.15
) => {
  const buildingLength = dimensions.length;
  const buildingWidth = dimensions.width;
  const { position, rotation, wall } = element;
  
  // Default position and rotation
  const worldPosition = { ...position };
  const worldRotation = { ...rotation };
  
  // Calculate offset from wall
  let offset = wallThickness / 2;
  
  // Adjust position and rotation based on which wall the element is on
  if (wall === WallType.North) {
    // North wall (negative Z)
    worldPosition.z = -buildingWidth / 2 - offset;
    worldRotation.y = 0; // Face outward
  } 
  else if (wall === WallType.South) {
    // South wall (positive Z)
    worldPosition.z = buildingWidth / 2 + offset;
    worldRotation.y = Math.PI; // Face outward
  } 
  else if (wall === WallType.East) {
    // East wall (positive X)
    worldPosition.x = buildingLength / 2 + offset;
    worldPosition.z = position.x; // Use X position as Z in world space
    worldPosition.x = buildingLength / 2 + offset; // Place on east wall
    worldRotation.y = -Math.PI / 2; // Face outward
  } 
  else if (wall === WallType.West) {
    // West wall (negative X)
    worldPosition.z = position.x; // Use X position as Z in world space
    worldPosition.x = -buildingLength / 2 - offset; // Place on west wall
    worldRotation.y = Math.PI / 2; // Face outward
  }
  
  return {
    position: worldPosition,
    rotation: worldRotation
  };
};

/**
 * Generate frame and other materials for elements
 */
export const getElementMaterials = () => {
  // These materials will be created in the parent component
  // and passed down to avoid recreation
  return {
    frameMaterial: 'frameMaterial',
    glassMaterial: 'glassMaterial',
    doorMaterial: 'doorMaterial',
    sectionalDoorMaterial: 'sectionalDoorMaterial'
  };
};

/**
 * Determine material needs based on elements list
 */
export const getRequiredMaterials = (elements: BuildingElement[]) => {
  // Analyze elements to determine what materials are needed
  const needsGlass = elements.some(el => 
    el.type === 'window' || 
    el.type === 'lightBand' || 
    el.type === 'windowedSectionalDoor'
  );
  
  const needsDoors = elements.some(el => 
    el.type === 'door' || 
    el.type === 'sectionalDoor' || 
    el.type === 'windowedSectionalDoor'
  );
  
  return {
    needsGlass,
    needsDoors
  };
};
