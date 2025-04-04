import React from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { Move, Trash2, RotateCcw, Maximize } from 'lucide-react';
import { RoofElementType } from '../types';

const RoofElementControls: React.FC = () => {
  const { roofElements, selectedRoofElementId, updateRoofElement, removeRoofElement, selectRoofElement } = useBuildingStore();
  
  // Find the selected element
  const selectedElement = roofElements.find(el => el.id === selectedRoofElementId);
  
  if (!selectedElement) {
    return null;
  }
  
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    updateRoofElement(selectedRoofElementId, {
      position: {
        ...selectedElement.position,
        [axis]: value
      }
    });
  };
  
  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
    updateRoofElement(selectedRoofElementId, {
      rotation: {
        ...selectedElement.rotation,
        [axis]: value
      }
    });
  };
  
  const handleDimensionChange = (dim: 'width' | 'length', value: number) => {
    // Make sure dimensions object has length property
    const updatedDimensions = { 
      ...selectedElement.dimensions,
      length: selectedElement.dimensions.length || 
              (selectedElement.type === RoofElementType.RoofWindow ? 1.3 : 3),
      [dim]: value 
    };
    
    updateRoofElement(selectedRoofElementId, { dimensions: updatedDimensions });
  };
  
  const handleDelete = () => {
    removeRoofElement(selectedRoofElementId);
  };
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-steel-blue p-4 rounded-lg shadow-lg neumorphic animate-slideIn">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-accent-yellow">
          Edit {selectedElement.type === RoofElementType.RoofWindow ? 'Roof Window' : 'Ridge Skylight'}
        </h3>
        <button 
          onClick={() => selectRoofElement(null)}
          className="text-light-gray hover:text-accent-yellow transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
                max={15}
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
        
        <div className="col-span-2">
          <h4 className="text-sm font-medium flex items-center mb-1 text-light-gray">
            <Maximize className="h-4 w-4 mr-1 text-accent-yellow" /> Dimensions
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <label className="w-16 text-sm text-light-gray">Width (m):</label>
              <input
                type="range"
                min={0.5}
                max={selectedElement.type === RoofElementType.RoofWindow ? 2 : 3}
                step={0.1}
                value={selectedElement.dimensions.width}
                onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                min={0.5}
                max={selectedElement.type === RoofElementType.RoofWindow ? 2 : 3}
                step={0.1}
                value={selectedElement.dimensions.width.toFixed(1)}
                onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
            
            {/* Allow length adjustment for both roof windows and ridge skylights */}
            <div className="flex items-center">
              <label className="w-16 text-sm text-light-gray">Length (m):</label>
              <input
                type="range"
                min={1}
                max={selectedElement.type === RoofElementType.RoofWindow ? 35 : 20}
                step={0.5}
                value={selectedElement.dimensions.length || 1}
                onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
                className="flex-1 mr-2 accent-accent-yellow"
              />
              <input
                type="number"
                min={1}
                max={selectedElement.type === RoofElementType.RoofWindow ? 35 : 20}
                step={0.5}
                value={(selectedElement.dimensions.length || 1).toFixed(1)}
                onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
                className="w-16 text-sm p-1 input-industrial"
              />
            </div>
          </div>
        </div>
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

export default RoofElementControls;