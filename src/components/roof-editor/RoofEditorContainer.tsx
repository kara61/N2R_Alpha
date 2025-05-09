import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useBuildingStore } from '../../store/buildingStore';
import { RoofElementType, RoofElement } from '../../types';
import RoofEditorCanvas from './RoofEditorCanvas';
import RoofEditorControls from './RoofEditorControls';
import RoofElementProperties from './RoofElementProperties';
import { calculateRoofElementRotation } from './RoofEditorUtils';

const RoofEditorContainer: React.FC = () => {
  const { 
    dimensions, 
    roofElements, 
    selectedRoofElementId, 
    addRoofElement, 
    updateRoofElement,
    selectRoofElement,
    toggleRoofEditor
  } = useBuildingStore();
  
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Add a new element
  const addNewElement = useCallback((type: RoofElementType) => {
    // Default position in the center of the roof
    const defaultPosition = { x: 0, y: dimensions.height, z: 0 };
    
    // Create default dimensions based on element type
    let width = 1.0;
    let length = 1.0;
    let height = 0.2;
    
    switch (type) {
      case RoofElementType.RoofWindow:
        width = 1.2;
        height = 0.2;
        break;
      case RoofElementType.RidgeSkylights:
        width = 1.0;
        length = Math.min(dimensions.length * 0.5, 8.0);
        height = 0.15;
        break;
    }
    
    // Calculate proper y position based on roof type
    const y = dimensions.height + 0.05; // Default for flat roof
    
    // Calculate proper rotation based on roof type and position
    const rotation = calculateRoofElementRotation(
      dimensions.roofType,
      defaultPosition,
      dimensions
    );
    
    // Create new element
    const newElement: RoofElement = {
      id: uuidv4(),
      type,
      position: { ...defaultPosition, y },
      rotation,
      dimensions: { 
        width, 
        height,
        ...(type === RoofElementType.RidgeSkylights ? { length } : {})
      },
      material: {
        id: type === RoofElementType.RoofWindow ? 'glass' : 'polycarbonate',
        name: type === RoofElementType.RoofWindow ? 'Glass' : 'Polycarbonate',
        color: type === RoofElementType.RoofWindow ? '#a3c6e8' : '#d4f1f9',
        roughness: 0.2,
        metalness: 0.1,
      }
    };
    
    // Add element to store
    addRoofElement(newElement);
  }, [addRoofElement, dimensions]);
  
  // Update element position
  const handlePositionChange = useCallback((elementId: string, x: number, z: number) => {
    // Get current element
    const element = roofElements.find(el => el.id === elementId);
    if (!element) return;
    
    // Calculate proper y position based on roof type and position
    let y = dimensions.height;
    
    if (dimensions.roofType === 'flat') {
      y = dimensions.height + 0.05; // Just above roof
    } 
    else if (dimensions.roofType === 'gable') {
      // Calculate based on distance from ridge
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const distanceFromRidge = Math.abs(z);
      const slopeRatio = roofHeight / (dimensions.width / 2);
      const heightAboveWall = dimensions.height + (distanceFromRidge * slopeRatio);
      
      y = heightAboveWall + 0.05; // Slightly above the roof surface
    }
    else if (dimensions.roofType === 'monopitch') {
      // Calculate based on position along roof
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const normalizedZ = (z + dimensions.width / 2) / dimensions.width;
      y = dimensions.height + (roofHeight * normalizedZ) + 0.05;
    }
    
    // Calculate proper rotation based on roof type and position
    const rotation = calculateRoofElementRotation(
      dimensions.roofType,
      { x, y, z },
      dimensions
    );
    
    updateRoofElement(elementId, {
      position: { x, y, z },
      rotation
    });
  }, [updateRoofElement, roofElements, dimensions]);
  
  // Handle element hover
  const handleHoverElement = useCallback((id: string | null) => {
    // We could use this to update UI state if needed
  }, []);
  
  // Close the editor
  const handleClose = useCallback(() => {
    toggleRoofEditor(false);
  }, [toggleRoofEditor]);
  
  // View controls
  const resetView = useCallback(() => {
    setZoomLevel(1);
  }, []);
  
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
  }, []);
  
  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  }, []);
  
  return (
    <div className="absolute inset-0 bg-slate-900 bg-opacity-80 flex">
      {/* Controls */}
      <RoofEditorControls
        addNewElement={addNewElement}
        resetView={resetView}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        onClose={handleClose}
      />
      
      {/* Canvas */}
      <RoofEditorCanvas
        roofElements={roofElements}
        selectedElementId={selectedRoofElementId}
        dimensions={dimensions}
        onSelectElement={selectRoofElement}
        onHoverElement={handleHoverElement}
        onPositionChange={handlePositionChange}
      />
      
      {/* Properties Panel */}
      {selectedRoofElementId && (
        <RoofElementProperties
          elementId={selectedRoofElementId}
          buildingDimensions={dimensions}
          roofType={dimensions.roofType}
          roofPitch={dimensions.roofPitch}
        />
      )}
    </div>
  );
};

export default RoofEditorContainer;
