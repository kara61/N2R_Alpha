import React from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { Plus, Sun } from 'lucide-react';
import { RoofElementType, RoofType } from '../types';

const RoofElementsPanel: React.FC = () => {
  const { 
    dimensions, 
    roofElements, 
    addRoofElement, 
    selectRoofElement
  } = useBuildingStore();
  
  // Add a dome skylight
  const addDomeSkylight = () => {
    // Default position based on roof type
    let position = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    
    // Calculate Y position based on roof type
    if (dimensions.roofType === RoofType.Flat) {
      position.y = dimensions.height + 0.01;
    } else if (dimensions.roofType === RoofType.Gable) {
      // For gable roof, place it on one side of the roof
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const angle = Math.atan(roofHeight / (dimensions.width / 2));
      const yOffset = Math.sin(angle) * (dimensions.width / 4);
      
      position = {
        x: 0,
        y: dimensions.height + yOffset,
        z: -dimensions.width / 4
      };
      
      // Set rotation to match roof pitch
      rotation = { 
        x: angle, 
        y: 0, 
        z: 0 
      };
    } else if (dimensions.roofType === RoofType.Monopitch) {
      // For monopitch roof, place it in the middle
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const angle = Math.atan(roofHeight / dimensions.width);
      const yOffset = Math.sin(angle) * (dimensions.width / 2);
      
      position = {
        x: 0,
        y: dimensions.height + yOffset / 2,
        z: 0
      };
      
      // Set rotation to match roof pitch
      rotation = { 
        x: angle, 
        y: 0, 
        z: 0 
      };
    }
    
    const newElement = {
      id: `dome-skylight-${Date.now()}`,
      type: RoofElementType.DomeSkylights,
      position,
      rotation,
      dimensions: { width: 1.2, height: 0.5, depth: 1.2 }, // Decreased size
      material: {
        id: 'polycarbonate',
        name: 'Polycarbonate',
        color: '#d4f1f9',
        roughness: 0.2,
        metalness: 0.1,
      }
    };
    
    addRoofElement(newElement);
    selectRoofElement(newElement.id);
  };
  
  // Add a ridge skylight
  const addRidgeSkylight = () => {
    // Default position based on roof type
    let position = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    
    // Calculate Y position based on roof type
    if (dimensions.roofType === RoofType.Flat) {
      position.y = dimensions.height + 0.01;
    } else if (dimensions.roofType === RoofType.Gable) {
      // For gable roof, place it at the ridge
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      position = {
        x: 0,
        y: dimensions.height + roofHeight,
        z: 0
      };
      // Align with building length
      rotation = { x: 0, y: 0, z: 0 };
    } else if (dimensions.roofType === RoofType.Monopitch) {
      // For monopitch roof, place it at the higher edge
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      position = {
        x: 0,
        y: dimensions.height + roofHeight,
        z: dimensions.width / 2
      };
      // Align with building length
      rotation = { x: 0, y: 0, z: 0 };
    }
    
    const newElement = {
      id: `ridge-skylight-${Date.now()}`,
      type: RoofElementType.RidgeSkylights,
      position,
      rotation,
      dimensions: { width: 1.5, height: 0.5, depth: 1.5, length: 5 },
      material: {
        id: 'polycarbonate',
        name: 'Polycarbonate',
        color: '#d4f1f9',
        roughness: 0.2,
        metalness: 0.1,
      }
    };
    
    addRoofElement(newElement);
    selectRoofElement(newElement.id);
  };
  
  return (
    <div className="mb-6 card-industrial animate-fadeIn">
      <h2 className="text-lg font-semibold mb-2 flex items-center text-accent-yellow">
        <Sun className="mr-2 h-5 w-5" /> Roof Elements
      </h2>
      
      <div className="space-y-2">
        <button
          onClick={addDomeSkylight}
          className="w-full btn-secondary flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Domed Skylight
        </button>
        
        <button
          onClick={addRidgeSkylight}
          className="w-full btn-secondary flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Ridge Skylight
        </button>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-light-gray">
          <strong>Domed Skylights:</strong> Polycarbonate domes that can be positioned anywhere on the roof.
        </p>
        <p className="text-sm text-light-gray mt-1">
          <strong>Ridge Skylights:</strong> Elongated polycarbonate skylights typically placed along the roof ridge.
        </p>
      </div>
    </div>
  );
};

export default RoofElementsPanel;