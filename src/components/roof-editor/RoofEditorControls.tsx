import React from 'react';
import { RoofElementType } from '../../types';
import { X, Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface RoofEditorControlsProps {
  addNewElement: (type: RoofElementType) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  onClose: () => void;
}

const RoofEditorControls: React.FC<RoofEditorControlsProps> = ({
  addNewElement,
  resetView,
  zoomIn,
  zoomOut,
  onClose
}) => {
  return (
    <div className="absolute left-4 top-4 flex flex-col space-y-4 z-10">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="bg-red-600 hover:bg-red-700 transition-colors p-2 rounded-lg shadow-lg"
        title="Close Editor"
      >
        <X size={20} />
      </button>
      
      {/* Add Element Tools */}
      <div className="bg-dark-gray border border-steel-blue rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => addNewElement(RoofElementType.RoofWindow)}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Add Roof Window"
          >
            <div className="flex flex-col items-center">
              <Plus size={20} className="mb-1" />
              <div className="w-5 h-5 border border-gray-400 rounded-sm"></div>
            </div>
          </button>
          
          <button
            onClick={() => addNewElement(RoofElementType.RidgeSkylights)}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Add Ridge Skylight"
          >
            <div className="flex flex-col items-center">
              <Plus size={20} className="mb-1" />
              <div className="w-8 h-3 border border-gray-400 bg-gray-700 opacity-50"></div>
            </div>
          </button>
        </div>
      </div>
      
      {/* View Controls */}
      <div className="bg-dark-gray border border-steel-blue rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={zoomIn}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
          
          <button
            onClick={zoomOut}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          
          <button
            onClick={resetView}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Reset View"
          >
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoofEditorControls;
