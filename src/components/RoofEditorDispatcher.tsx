import React from 'react';
import { useBuildingStore } from '../store/buildingStore';
import RoofEditor from './RoofEditor';

/**
 * RoofEditorDispatcher acts as a mediator between the RoofEditor component
 * and the application state. It handles the state management and positioning
 * logic before passing the required props to the RoofEditor.
 */
const RoofEditorDispatcher: React.FC = () => {
  const { 
    showRoofEditor, 
    toggleRoofEditor, 
    dimensions, 
    roofElements,
    selectedRoofElementId,
    selectRoofElement,
    updateRoofElement,
    removeRoofElement,
    addRoofElement
  } = useBuildingStore();
  
  // Skip rendering if the roof editor is not visible
  if (!showRoofEditor) {
    return null;
  }
  
  // Handle closing the roof editor
  const handleClose = () => {
    toggleRoofEditor(false);
    selectRoofElement(null); // Deselect any selected roof element
  };
  
  // Render the RoofEditor directly with all necessary props
  // No need for positioningLogic hook anymore since we don't use drag positioning
  return <RoofEditor onClose={handleClose} />;
};

export default RoofEditorDispatcher;
