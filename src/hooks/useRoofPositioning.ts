import { useMemo } from 'react';
import { HallDimensions, RoofElement, RoofElementType, RoofType } from '../types';
import { useBuildingStore } from '../store/buildingStore';

export interface RoofPositioningLogic {
  calculatePosition: (
    canvasX: number, 
    canvasY: number, 
    canvas: HTMLCanvasElement
  ) => { 
    position: { x: number, y: number, z: number }, 
    rotation: { x: number, y: number, z: number } 
  };
  addRoofWindow: () => RoofElement;
  addRidgeSkylight: () => RoofElement;
  shouldShowRidgeSkylights: boolean;
}

/**
 * Custom hook that provides roof positioning logic based on building dimensions
 */
const useRoofPositioning = (dimensions: HallDimensions): RoofPositioningLogic => {
  const { addRoofElement } = useBuildingStore();
  
  // Memoize the logic to prevent unnecessary recalculations
  return useMemo(() => {
    // Calculate roof parameters
    const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
    const ridgeHeight = dimensions.height + roofHeight;
    
    // Determine if ridge skylights should be shown (only for gable roofs)
    const shouldShowRidgeSkylights = dimensions.roofType === RoofType.Gable;
    
    // Calculate position for a given point on the canvas
    const calculatePosition = (
      canvasX: number, 
      canvasY: number, 
      canvas: HTMLCanvasElement
    ) => {
      // Scale factors for canvas to 3D space
      const scaleX = dimensions.length / canvas.width;
      const scaleY = dimensions.width / canvas.height;
      
      // Calculate 3D position based on canvas coordinates
      const x = (canvasX - canvas.width / 2) * scaleX;
      const z = (canvasY - canvas.height / 2) * scaleY;
      
      // Calculate y position and rotation based on roof type
      let y = 0;
      let rotationX = 0;
      
      if (dimensions.roofType === RoofType.Flat) {
        // Flat roof position is simple
        y = dimensions.height + 0.05; // Slightly above roof
        rotationX = 0;
      } 
      else if (dimensions.roofType === RoofType.Gable) {
        // For gable roof, calculate position along the slope
        const halfWidth = dimensions.width / 2;
        const absZ = Math.abs(z);
        
        // Calculate distance from ridge as a ratio (0 at ridge, 1 at eave)
        const ratio = Math.min(absZ / halfWidth, 1);
        
        // Calculate y position
        y = ridgeHeight - (ratio * roofHeight) + 0.05;
        
        // Calculate rotation to match roof slope
        const angle = Math.atan(roofHeight / halfWidth);
        rotationX = z < 0 ? -angle : angle;
      } 
      else if (dimensions.roofType === RoofType.Monopitch) {
        // For monopitch, calculate position along the slope
        const ratio = Math.min((z + dimensions.width / 2) / dimensions.width, 1);
        
        // Calculate y position
        y = dimensions.height + roofHeight - (ratio * roofHeight) + 0.05;
        
        // Calculate rotation to match roof slope
        const angle = Math.atan(roofHeight / dimensions.width);
        rotationX = -angle;
      }
      
      return {
        position: { x, y, z },
        rotation: { x: rotationX, y: 0, z: 0 }
      };
    };
    
    // Function to create a new roof window
    const addRoofWindow = (): RoofElement => {
      // Default position at center of roof
      const position = { x: 0, y: 0, z: 0 };
      const rotation = { x: 0, y: 0, z: 0 };
      
      // Calculate position based on roof type
      if (dimensions.roofType === RoofType.Flat) {
        position.y = dimensions.height + 0.05;
      } 
      else if (dimensions.roofType === RoofType.Gable) {
        position.y = dimensions.height + roofHeight + 0.05;
      } 
      else if (dimensions.roofType === RoofType.Monopitch) {
        position.y = dimensions.height + (roofHeight / 2) + 0.05;
        rotation.x = -Math.atan(roofHeight / dimensions.width);
      }
      
      // Create the new roof window element
      return {
        id: `roof-window-${Date.now()}`,
        type: RoofElementType.RoofWindow,
        position,
        rotation,
        dimensions: { width: 1.3, height: 0.08, length: 1.3 },
        material: {
          id: 'glass',
          name: 'Glass',
          color: '#78c8ff',
          roughness: 0.1,
          metalness: 0.3
        }
      };
    };
    
    // Function to create a new ridge skylight
    const addRidgeSkylight = (): RoofElement => {
      // Ridge skylights are only for gable roofs and positioned along the ridge
      return {
        id: `ridge-skylight-${Date.now()}`,
        type: RoofElementType.RidgeSkylights,
        position: { x: 0, y: dimensions.height + roofHeight + 0.05, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        dimensions: { width: 1.0, height: 0.4, length: 3 },
        material: {
          id: 'polycarbonate',
          name: 'Polycarbonate',
          color: '#d4f1f9',
          roughness: 0.2,
          metalness: 0.1
        }
      };
    };
    
    return {
      calculatePosition,
      addRoofWindow,
      addRidgeSkylight,
      shouldShowRidgeSkylights
    };
  }, [dimensions, addRoofElement]);
};

export default useRoofPositioning;
