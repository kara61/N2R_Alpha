import React from 'react';
import { WallType, ElementType } from '../../types';
import { X, Move, ArrowLeft, Compass, Plus, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface FacadeEditorControlsProps {
  activeWall: WallType;
  setActiveWall: (wall: WallType) => void;
  addNewElement: (type: ElementType) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  onClose: () => void;
}

const FacadeEditorControls: React.FC<FacadeEditorControlsProps> = ({
  activeWall,
  setActiveWall,
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
      
      {/* Wall Selector */}
      <div className="bg-dark-gray border border-steel-blue rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setActiveWall(WallType.North)}
            className={`p-2 rounded ${
              activeWall === WallType.North
                ? 'bg-steel-blue text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="North Wall"
          >
            <Compass size={20} />
            <span className="block text-xs mt-1">N</span>
          </button>
          
          <button
            onClick={() => setActiveWall(WallType.East)}
            className={`p-2 rounded ${
              activeWall === WallType.East
                ? 'bg-steel-blue text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="East Wall"
          >
            <Compass size={20} className="transform rotate-90" />
            <span className="block text-xs mt-1">E</span>
          </button>
          
          <button
            onClick={() => setActiveWall(WallType.South)}
            className={`p-2 rounded ${
              activeWall === WallType.South
                ? 'bg-steel-blue text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="South Wall"
          >
            <Compass size={20} className="transform rotate-180" />
            <span className="block text-xs mt-1">S</span>
          </button>
          
          <button
            onClick={() => setActiveWall(WallType.West)}
            className={`p-2 rounded ${
              activeWall === WallType.West
                ? 'bg-steel-blue text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
            title="West Wall"
          >
            <Compass size={20} className="transform -rotate-90" />
            <span className="block text-xs mt-1">W</span>
          </button>
        </div>
      </div>
      
      {/* Add Element Tools */}
      <div className="bg-dark-gray border border-steel-blue rounded-lg shadow-lg p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => addNewElement(ElementType.Window)}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Add Window"
          >
            <div className="flex flex-col items-center">
              <Plus size={20} className="mb-1" />
              <div className="w-5 h-5 border border-gray-400 rounded-sm"></div>
            </div>
          </button>
          
          <button
            onClick={() => addNewElement(ElementType.Door)}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Add Door"
          >
            <div className="flex flex-col items-center">
              <Plus size={20} className="mb-1" />
              <div className="w-4 h-6 border border-gray-400 rounded-t-sm"></div>
            </div>
          </button>
          
          <button
            onClick={() => addNewElement(ElementType.SectionalDoor)}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Add Sectional Door"
          >
            <div className="flex flex-col items-center">
              <Plus size={20} className="mb-1" />
              <div className="w-6 h-5 border border-gray-400 flex flex-col">
                <div className="border-b border-gray-400 h-1"></div>
                <div className="border-b border-gray-400 h-1"></div>
                <div className="border-b border-gray-400 h-1"></div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => addNewElement(ElementType.LightBand)}
            className="p-2 rounded text-gray-400 hover:bg-gray-700"
            title="Add Light Band"
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

export default FacadeEditorControls;
