import React, { useState } from 'react';
import { WallType, ElementType, HallDimensions, BuildingElement } from '../../types';
import { useBuildingStore } from '../../store/buildingStore';

interface FacadeElementPropertiesProps {
  elementId: string;
  wall: WallType;
  buildingDimensions: HallDimensions;
  yOffset: number;
}

const FacadeElementProperties: React.FC<FacadeElementPropertiesProps> = ({
  elementId,
  wall,
  buildingDimensions,
  yOffset
}) => {
  const { elements, updateElement, removeElement } = useBuildingStore();
  
  // Find the selected element
  const element = elements.find(el => el.id === elementId);
  
  if (!element) {
    return null;
  }
  
  // Get wall dimensions
  const { length, width, height } = buildingDimensions;
  let wallWidth, wallHeight;
  
  if (wall === WallType.North || wall === WallType.South) {
    wallWidth = length;
    wallHeight = height;
  } else {
    wallWidth = width;
    wallHeight = height;
  }
  
  // Calculate bounds for inputs
  const maxWidth = Math.min(3, wallWidth / 2);  // Maximum 3m or half wall width
  const maxHeight = Math.min(3, wallHeight / 2); // Maximum 3m or half wall height
  
  // Calculate position bounds
  const minX = -(wallWidth / 2) + (element.dimensions.width / 2);
  const maxX = (wallWidth / 2) - (element.dimensions.width / 2);
  const minY = -(wallHeight / 2) + (element.dimensions.height / 2) + yOffset;
  const maxY = (wallHeight / 2) - (element.dimensions.height / 2) + yOffset;
  
  // Handle property changes
  const handlePropertyChange = (property: keyof BuildingElement, value: any) => {
    updateElement(elementId, { [property]: value });
  };
  
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    // Create a copy of current position
    const newPosition = { ...element.position };
    newPosition[axis] = value;
    
    // Update position
    updateElement(elementId, { position: newPosition });
  };
  
  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    // Create a copy of current dimensions
    const newDimensions = { ...element.dimensions };
    newDimensions[dimension] = value;
    
    // Update dimensions
    updateElement(elementId, { dimensions: newDimensions });
    
    // Also need to check if position is still valid with new dimensions
    const position = element.position;
    const x = position.x;
    const y = position.y;
    
    // Recalculate bounds
    const newMinX = -(wallWidth / 2) + (newDimensions.width / 2);
    const newMaxX = (wallWidth / 2) - (newDimensions.width / 2);
    const newMinY = -(wallHeight / 2) + (newDimensions.height / 2) + yOffset;
    const newMaxY = (wallHeight / 2) - (newDimensions.height / 2) + yOffset;
    
    // Adjust position if necessary
    const adjustedX = Math.max(newMinX, Math.min(newMaxX, x));
    const adjustedY = Math.max(newMinY, Math.min(newMaxY, y));
    
    if (adjustedX !== x || adjustedY !== y) {
      handlePositionChange('x', adjustedX);
      handlePositionChange('y', adjustedY);
    }
  };
  
  const handleTypeChange = (newType: ElementType) => {
    // Update element type
    updateElement(elementId, { type: newType });
    
    // Adjust dimensions based on type
    let newWidth = element.dimensions.width;
    let newHeight = element.dimensions.height;
    
    switch (newType) {
      case ElementType.Window:
        // Default window size
        newWidth = Math.min(1.2, maxWidth);
        newHeight = Math.min(1.2, maxHeight);
        break;
      case ElementType.Door:
        // Default door size
        newWidth = Math.min(0.9, maxWidth);
        newHeight = Math.min(2.1, maxHeight);
        break;
      case ElementType.SectionalDoor:
      case ElementType.WindowedSectionalDoor:
        // Default sectional door size
        newWidth = Math.min(3.0, maxWidth);
        newHeight = Math.min(3.0, maxHeight);
        break;
      case ElementType.LightBand:
        // Default light band size
        newWidth = Math.min(wallWidth * 0.8, maxWidth * 2);
        newHeight = Math.min(0.6, maxHeight);
        break;
    }
    
    // Update dimensions
    handleDimensionChange('width', newWidth);
    handleDimensionChange('height', newHeight);
  };
  
  const handleDeleteElement = () => {
    removeElement(elementId);
  };
  
  return (
    <div className="bg-dark-gray border border-steel-blue rounded-lg p-4 shadow-lg absolute right-4 top-4 w-72 z-10">
      <h3 className="text-lg font-semibold text-steel-blue border-b border-slate-700 pb-2 mb-4">
        Element Properties
      </h3>
      
      {/* Element Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
        <select
          className="w-full bg-slate-800 text-white rounded p-2 border border-slate-600"
          value={element.type}
          onChange={(e) => handleTypeChange(e.target.value as ElementType)}
        >
          <option value={ElementType.Window}>Window</option>
          <option value={ElementType.Door}>Door</option>
          <option value={ElementType.SectionalDoor}>Sectional Door</option>
          <option value={ElementType.WindowedSectionalDoor}>Windowed Sectional Door</option>
          <option value={ElementType.LightBand}>Light Band</option>
        </select>
      </div>
      
      {/* Position Controls */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Position</h4>
        
        {/* X Position */}
        <div className="flex items-center mb-2">
          <label className="text-xs text-gray-400 w-6">X:</label>
          <input
            type="range"
            min={minX}
            max={maxX}
            step={0.1}
            value={element.position.x}
            onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
            className="flex-1 mx-2"
          />
          <span className="text-xs text-gray-400 w-12 text-right">
            {element.position.x.toFixed(1)}m
          </span>
        </div>
        
        {/* Y Position */}
        <div className="flex items-center">
          <label className="text-xs text-gray-400 w-6">Y:</label>
          <input
            type="range"
            min={minY}
            max={maxY}
            step={0.1}
            value={element.position.y}
            onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
            className="flex-1 mx-2"
          />
          <span className="text-xs text-gray-400 w-12 text-right">
            {element.position.y.toFixed(1)}m
          </span>
        </div>
      </div>
      
      {/* Size Controls */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Size</h4>
        
        {/* Width */}
        <div className="flex items-center mb-2">
          <label className="text-xs text-gray-400 w-14">Width:</label>
          <input
            type="range"
            min={0.3}
            max={maxWidth}
            step={0.1}
            value={element.dimensions.width}
            onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
            className="flex-1 mx-2"
          />
          <span className="text-xs text-gray-400 w-12 text-right">
            {element.dimensions.width.toFixed(1)}m
          </span>
        </div>
        
        {/* Height */}
        <div className="flex items-center">
          <label className="text-xs text-gray-400 w-14">Height:</label>
          <input
            type="range"
            min={0.3}
            max={maxHeight}
            step={0.1}
            value={element.dimensions.height}
            onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
            className="flex-1 mx-2"
          />
          <span className="text-xs text-gray-400 w-12 text-right">
            {element.dimensions.height.toFixed(1)}m
          </span>
        </div>
      </div>
      
      {/* Delete Button */}
      <button
        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
        onClick={handleDeleteElement}
      >
        <span>Delete Element</span>
      </button>
    </div>
  );
};

export default FacadeElementProperties;
