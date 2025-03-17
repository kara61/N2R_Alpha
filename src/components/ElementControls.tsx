import React from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { Move, RotateCcw, Trash2, Compass } from 'lucide-react';
import { WallType } from '../types';

const ElementControls: React.FC = () => {
  const { elements, selectedElementId, updateElement, removeElement, selectElement } = useBuildingStore();
  
  // Find the selected element
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  if (!selectedElement) {
    return null;
  }
  
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    updateElement(selectedElementId, {
      position: {
        ...selectedElement.position,
        [axis]: value
      }
    });
  };
  
  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    updateElement(selectedElementId, {
      rotation: {
        ...selectedElement.rotation,
        [axis]: value
      }
    });
  };
  
  const handleWallChange = (wall: WallType) => {
    updateElement(selectedElementId, { wall });
    
    // Adjust position based on wall selection
    const { dimensions } = useBuildingStore.getState();
    const { length, width, height } = dimensions;
    
    let newPosition = { ...selectedElement.position };
    let newRotation = { ...selectedElement.rotation };
    
    switch (wall) {
      case WallType.North:
        newPosition = { 
          x: selectedElement.position.x, 
          y: selectedElement.position.y, 
          z: -width / 2 
        };
        newRotation = { x: 0, y: 0, z: 0 };
        break;
      case WallType.South:
        newPosition = { 
          x: selectedElement.position.x, 
          y: selectedElement.position.y, 
          z: width / 2 
        };
        newRotation = { x: 0, y: Math.PI, z: 0 };
        break;
      case WallType.East:
        newPosition = { 
          x: length / 2, 
          y: selectedElement.position.y, 
          z: selectedElement.position.z 
        };
        newRotation = { x: 0, y: -Math.PI / 2, z: 0 };
        break;
      case WallType.West:
        newPosition = { 
          x: -length / 2, 
          y: selectedElement.position.y, 
          z: selectedElement.position.z 
        };
        newRotation = { x: 0, y: Math.PI / 2, z: 0 };
        break;
    }
    
    updateElement(selectedElementId, { 
      position: newPosition,
      rotation: newRotation
    });
  };
  
  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    updateElement(selectedElementId, {
      dimensions: {
        ...selectedElement.dimensions,
        [dimension]: value
      }
    });
  };
  
  // Update the renderDimensionControls function with fixed 35m max width for light bands
  const renderDimensionControls = () => {
    // Get max width and height based on element type
    const getMaxWidth = () => {
      if (selectedElement.type === 'LightBand') {
        return 35.0; // Fixed 35m max width for light bands
      }
      return 5.0; // Default max width for other elements
    };
    
    const getMaxHeight = () => {
      if (selectedElement.type === 'SectionalDoor' || 
          selectedElement.type === 'WindowedSectionalDoor') {
        return 5.0; // Increased max height for sectional doors
      }
      return 3.0; // Default max height for other elements
    };
    
    return (
      <div>
        <h4 className="text-sm font-medium flex items-center mb-1 text-light-gray">
          Dimensions
        </h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <label className="w-16 text-sm text-light-gray">Width:</label>
            <input
              type="range"
              min={0.5}
              max={getMaxWidth()} // Use dynamic max width
              step={0.1}
              value={selectedElement.dimensions.width}
              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
              className="flex-1 mr-2 accent-accent-yellow"
            />
            <input
              type="number"
              min={0.5}
              max={getMaxWidth()} // Also update the number input max
              step={0.1}
              value={selectedElement.dimensions.width.toFixed(1)}
              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
              className="w-16 text-sm p-1 input-industrial"
            />
          </div>
          <div className="flex items-center">
            <label className="w-16 text-sm text-light-gray">Height:</label>
            <input
              type="range"
              min={0.5}
              max={getMaxHeight()}
              step={0.1}
              value={selectedElement.dimensions.height}
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
              className="flex-1 mr-2 accent-accent-yellow"
            />
            <input
              type="number"
              min={0.5}
              max={getMaxHeight()}
              value={selectedElement.dimensions.height.toFixed(1)}
              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
              className="w-16 text-sm p-1 input-industrial"
            />
          </div>
        </div>
      </div>
    );
  };
  
  const handleDelete = () => {
    removeElement(selectedElementId);
  };
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-steel-blue p-4 rounded-lg shadow-lg neumorphic animate-slideIn">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-accent-yellow">Edit {selectedElement.type}</h3>
        <button 
          onClick={() => selectElement(null)}
          className="text-light-gray hover:text-accent-yellow transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium flex items-center mb-1 text-light-gray">
            <Compass className="h-4 w-4 mr-1 text-accent-yellow" /> Wall
          </h4>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <button
              onClick={() => handleWallChange(WallType.North)}
              className={`text-xs p-1 rounded ${selectedElement.wall === WallType.North ? 'bg-accent-yellow text-dark-gray' : 'bg-dark-gray text-light-gray hover:bg-opacity-80'}`}
            >
              North
            </button>
            <button
              onClick={() => handleWallChange(WallType.South)}
              className={`text-xs p-1 rounded ${selectedElement.wall === WallType.South ? 'bg-accent-yellow text-dark-gray' : 'bg-dark-gray text-light-gray hover:bg-opacity-80'}`}
            >
              South
            </button>
            <button
              onClick={() => handleWallChange(WallType.East)}
              className={`text-xs p-1 rounded ${selectedElement.wall === WallType.East ? 'bg-accent-yellow text-dark-gray' : 'bg-dark-gray text-light-gray hover:bg-opacity-80'}`}
            >
              East
            </button>
            <button
              onClick={() => handleWallChange(WallType.West)}
              className={`text-xs p-1 rounded ${selectedElement.wall === WallType.West ? 'bg-accent-yellow text-dark-gray' : 'bg-dark-gray text-light-gray hover:bg-opacity-80'}`}
            >
              West
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium flex items-center mb-1 text-light-gray">
            <Move className="h-4 w-4 mr-1 text-accent-yellow" /> Position
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-8 text-sm text-light-gray">X:</label>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.1}
                value={selectedElement.position.x}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                value={selectedElement.position.x.toFixed(1)}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
            <div className="flex items-center">
              <label className="w-8 text-sm text-light-gray">Y:</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={selectedElement.position.y}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                value={selectedElement.position.y.toFixed(1)}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
            <div className="flex items-center">
              <label className="w-8 text-sm text-light-gray">Z:</label>
              <input
                type="range"
                min={-10}
                max={10}
                step={0.1}
                value={selectedElement.position.z}
                onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                value={selectedElement.position.z.toFixed(1)}
                onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium flex items-center mb-1 text-light-gray">
            <RotateCcw className="h-4 w-4 mr-1 text-accent-yellow" /> Rotation
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-8 text-sm text-light-gray">X:</label>
              <input
                type="range"
                min={-3.14}
                max={3.14}
                step={0.1}
                value={selectedElement.rotation.x}
                onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                value={selectedElement.rotation.x.toFixed(1)}
                onChange={(e) => handleRotationChange('x', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
            <div className="flex items-center">
              <label className="w-8 text-sm text-light-gray">Y:</label>
              <input
                type="range"
                min={-3.14}
                max={3.14}
                step={0.1}
                value={selectedElement.rotation.y}
                onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                value={selectedElement.rotation.y.toFixed(1)}
                onChange={(e) => handleRotationChange('y', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
            <div className="flex items-center">
              <label className="w-8 text-sm text-light-gray">Z:</label>
              <input
                type="range"
                min={-3.14}
                max={3.14}
                step={0.1}
                value={selectedElement.rotation.z}
                onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                value={selectedElement.rotation.z.toFixed(1)}
                onChange={(e) => handleRotationChange('z', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
          </div>
        </div>
        
        {renderDimensionControls()}
      </div>
      
      <div className="mt-3 flex justify-end">
        <button
          onClick={handleDelete}
          className="btn-danger text-sm flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};

export default ElementControls;