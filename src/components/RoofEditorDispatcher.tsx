import React from 'react';
import { useBuildingStore } from '../store/buildingStore';
import RoofEditor from './RoofEditor';
import useRoofPositioning from '../hooks/useRoofPositioning';

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
    selectRoofElement
  } = useBuildingStore();
  
  // Skip rendering if the roof editor is not visible
  if (!showRoofEditor) {
    return null;
  }
  
  // Get the roof positioning logic using the custom hook
  const positioningLogic = useRoofPositioning(dimensions);
  
  // Handle closing the roof editor
  const handleClose = () => {
    toggleRoofEditor(false);
    selectRoofElement(null); // Deselect any selected roof element
  };
  
  // Render the RoofEditor with the necessary props
  return (
    <RoofEditor 
      positioningLogic={positioningLogic}
      onClose={handleClose}
    />
  );
};

export default RoofEditorDispatcher;
