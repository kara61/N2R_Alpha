import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useBuildingStore } from '../../store/buildingStore';
import { WallType, ElementType, BuildingElement } from '../../types';
import FacadeEditorCanvas from './FacadeEditorCanvas';
import FacadeEditorControls from './FacadeEditorControls';
import FacadeElementProperties from './FacadeElementProperties';

const FacadeEditorContainer: React.FC = () => {
  const { 
    dimensions, 
    elements, 
    selectedElementId, 
    addElement, 
    updateElement,
    selectElement,
    toggleFacadeEditor
  } = useBuildingStore();
  
  const [activeWall, setActiveWall] = useState<WallType>(WallType.North);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  
  // Y-axis offset in meters (to adjust element positions if needed)
  const Y_OFFSET = -1;
  
  // Add a new element to the active wall
  const addNewElement = useCallback((type: ElementType) => {
    // Create default dimensions based on element type
    let width = 1.0;
    let height = 1.0;
    
    switch (type) {
      case ElementType.Window:
        width = 1.2;
        height = 1.2;
        break;
      case ElementType.Door:
        width = 0.9;
        height = 2.1;
        break;
      case ElementType.SectionalDoor:
      case ElementType.WindowedSectionalDoor:
        width = 3.0;
        height = 3.0;
        break;
      case ElementType.LightBand:
        width = Math.min(dimensions.length * 0.8, 8.0);
        height = 0.6;
        break;
    }
    
    // Create new element
    const newElement: BuildingElement = {
      id: uuidv4(),
      type,
      wall: activeWall,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width, height },
      material: {
        id: type === ElementType.Window ? 'glass' : 'metal',
        name: type === ElementType.Window ? 'Glass' : 'Metal',
        color: type === ElementType.Window ? '#a3c6e8' : '#4a4a4a',
        roughness: type === ElementType.Window ? 0.1 : 0.7,
        metalness: type === ElementType.Window ? 0.9 : 0.3,
      }
    };
    
    // Add element to store
    addElement(newElement);
  }, [addElement, activeWall, dimensions]);
  
  // Update element position
  const handlePositionChange = useCallback((elementId: string, x: number, y: number) => {
    updateElement(elementId, {
      position: { x, y, z: 0 }
    });
  }, [updateElement]);
  
  // Handle element hover
  const handleHoverElement = useCallback((id: string | null) => {
    // We could use this to update UI state if needed
  }, []);
  
  // Close the editor
  const handleClose = useCallback(() => {
    toggleFacadeEditor(false);
  }, [toggleFacadeEditor]);
  
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
      <FacadeEditorControls
        activeWall={activeWall}
        setActiveWall={setActiveWall}
        addNewElement={addNewElement}
        resetView={resetView}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        onClose={handleClose}
      />
      
      {/* Canvas */}
      <FacadeEditorCanvas
        activeWall={activeWall}
        elements={elements}
        selectedElementId={selectedElementId}
        dimensions={dimensions}
        yOffset={Y_OFFSET}
        onSelectElement={selectElement}
        onHoverElement={handleHoverElement}
        onPositionChange={handlePositionChange}
      />
      
      {/* Properties Panel */}
      {selectedElementId && (
        <FacadeElementProperties
          elementId={selectedElementId}
          wall={activeWall}
          buildingDimensions={dimensions}
          yOffset={Y_OFFSET}
        />
      )}
    </div>
  );
};

export default FacadeEditorContainer;
