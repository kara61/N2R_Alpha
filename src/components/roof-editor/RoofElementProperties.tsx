import React from 'react';
import { RoofType, RoofElementType, HallDimensions, RoofElement } from '../../types';
import { useBuildingStore } from '../../store/buildingStore';

interface RoofElementPropertiesProps {
  elementId: string;
  buildingDimensions: HallDimensions;
  roofType: RoofType;
  roofPitch: number;
}

const RoofElementProperties: React.FC<RoofElementPropertiesProps> = ({ 
  elementId, 
  buildingDimensions, 
  roofType,
  roofPitch
}) => {
  const { roofElements, updateRoofElement, removeRoofElement } = useBuildingStore();
  
  // Find the selected element
  const element = roofElements.find(el => el.id === elementId);
  
  if (!element) {
    return null;
  }
  
  // Get roof dimensions
  const { length, width, height } = buildingDimensions;
  const roofHeight = width * (roofPitch / 100);
  
  // Calculate bounds for inputs based on roof type
  let maxWidth = 3; // Default max width for elements
  let maxLength = 3; // Default max length for elements
  
  if (element.type === RoofElementType.RidgeSkylights) {
    maxLength = length * 0.8; // Ridge skylights can be up to 80% of building length
    maxWidth = 1.5; // But limited in width (perpendicular to ridge)
  } else {
    // Roof windows have standard sizing
    maxWidth = 1.2; 
    maxLength = 1.8;
  }
  
  // Calculate position bounds
  const minX = -(length / 2) + (element.dimensions.width / 2);
  const maxX = (length / 2) - (element.dimensions.width / 2);
  
  // For z bounds, it depends on the roof type
  let minZ, maxZ;
  if (roofType === RoofType.Flat) {
    minZ = -(width / 2) + (element.dimensions.length || element.dimensions.width) / 2;
    maxZ = (width / 2) - (element.dimensions.length || element.dimensions.width) / 2;
  } else if (roofType === RoofType.Gable) {
    // For gable roof, stay away from the ridge and edges
    minZ = -(width / 2) + 1;
    maxZ = (width / 2) - 1;
  } else {
    // Monopitch
    minZ = -(width / 2) + 1;
    maxZ = (width / 2) - 1;
  }
  
  // Handle property changes
  const handleDimensionChange = (dimension: 'width' | 'height' | 'length', value: number) => {
    // Create a copy of current dimensions
    const newDimensions = { ...element.dimensions };
    newDimensions[dimension] = value;
    
    // Update dimensions
    updateRoofElement(elementId, { dimensions: newDimensions });
    
    // Also need to check if position is still valid with new dimensions
    const position = element.position;
    const x = position.x;
    const z = position.z;
    
    // Recalculate bounds
    const newMinX = -(length / 2) + (newDimensions.width / 2);
    const newMaxX = (length / 2) - (newDimensions.width / 2);
    
    const adjustedX = Math.max(newMinX, Math.min(newMaxX, x));
    if (adjustedX !== x) {
      handlePositionChange('x', adjustedX);
    }
  };
  
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    // Create a copy of current position
    const newPosition = { ...element.position };
    newPosition[axis] = value;
    
    // Update position
    updateRoofElement(elementId, { position: newPosition });
  };
  
  const handleTypeChange = (newType: RoofElementType) => {
    // Update element type
    updateRoofElement(elementId, { type: newType });
    
    // Adjust dimensions based on type
    let newWidth = element.dimensions.width;
    let newLength = element.dimensions.length || 0;
    let newHeight = element.dimensions.height;
    
    switch (newType) {
      case RoofElementType.RoofWindow:
        // Default roof window size
        newWidth = Math.min(1.2, maxWidth);
        newLength = Math.min(1.8, maxLength);
        newHeight = 0.2;
        break;
      case RoofElementType.RidgeSkylights:
        // Default ridge skylight size
        newWidth = Math.min(1.0, maxWidth);
        newLength = Math.min(length * 0.5, maxLength);
        newHeight = 0.15;
        break;
    }
    
    const newDimensions = {
      ...element.dimensions,
      width: newWidth,
      length: newLength,
      height: newHeight
    };
    
    updateRoofElement(elementId, { dimensions: newDimensions });
  };
  
  const handleDeleteElement = () => {
    removeRoofElement(elementId);
  };
  
  return (
    <div className="bg-dark-gray border border-steel-blue rounded-lg p-4 shadow-lg absolute right-4 top-4 w-72 z-10">
      <h3 className="text-lg font-semibold text-steel-blue border-b border-slate-700 pb-2 mb-4">
        Roof Element Properties
      </h3>
      
      {/* Element Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
        <select
          className="w-full bg-slate-800 text-white rounded p-2 border border-slate-600"
          value={element.type}
          onChange={(e) => handleTypeChange(e.target.value as RoofElementType)}
        >
          <option value={RoofElementType.RoofWindow}>Roof Window</option>
          <option value={RoofElementType.RidgeSkylights}>Ridge Skylights</option>
        </select>
      </div>
      
      {/* Position Controls */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Position</h4>
        
        {/* X Position (along building length) */}
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
        
        {/* Z Position (along building width) */}
        <div className="flex items-center">
          <label className="text-xs text-gray-400 w-6">Z:</label>
          <input
            type="range"
            min={minZ}
            max={maxZ}
            step={0.1}
            value={element.position.z}
            onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
            className="flex-1 mx-2"
          />
          <span className="text-xs text-gray-400 w-12 text-right">
            {element.position.z.toFixed(1)}m
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
        
        {/* Length (for ridge skylights) */}
        {element.type === RoofElementType.RidgeSkylights && (
          <div className="flex items-center mb-2">
            <label className="text-xs text-gray-400 w-14">Length:</label>
            <input
              type="range"
              min={1.0}
              max={maxLength}
              step={0.1}
              value={element.dimensions.length || 1.0}
              onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
              className="flex-1 mx-2"
            />
            <span className="text-xs text-gray-400 w-12 text-right">
              {(element.dimensions.length || 1.0).toFixed(1)}m
            </span>
          </div>
        )}
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

export default RoofElementProperties;
