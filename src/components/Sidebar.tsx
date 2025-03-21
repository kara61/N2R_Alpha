import React from 'react';
import { 
  Building2, 
  Layers, 
  Ruler, 
  PanelTop, 
  Square, 
  LayoutGrid, 
  Snowflake, 
  Info,
  Compass,
  ArrowUp,
  Edit,
  Palette,
  Sun
} from 'lucide-react';
import { useBuildingStore } from '../store/buildingStore';
import { RoofType, CladdingType, ElementType, WallType } from '../types';
import StructuralAnalysis from './StructuralAnalysis';
import ColorSelector from './ColorSelector';
import { getFacadeColors, getRoofColors } from '../data/ralColors';
import RoofElementsPanel from './RoofElementsPanel';

const Sidebar: React.FC = () => {
  const { 
    dimensions, 
    setDimensions, 
    claddingType, 
    setCladdingType,
    layers,
    toggleLayer,
    snowLoad,
    setSnowLoad,
    stats,
    calculateStats,
    toggleFacadeEditor,
    toggleRoofEditor,
    facadeColorId,
    roofColorId,
    setFacadeColor,
    setRoofColor
  } = useBuildingStore();

  // Get color options
  const facadeColors = getFacadeColors();
  const roofColors = getRoofColors();
  
  // Show roof pitch control only for non-flat roofs
  const showRoofPitch = dimensions.roofType !== RoofType.Flat;

  return (
    <div className="w-80 bg-steel-blue shadow-lg h-screen overflow-y-auto p-4 neumorphic">
      <h1 className="text-2xl font-bold mb-6 flex items-center text-white">
        <Building2 className="mr-2 text-accent-yellow" /> Industrial Hall Generator
      </h1>

      {/* Dimensions Section */}
      <div className="mb-6 card-industrial animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-accent-yellow">
          <Ruler className="mr-2 h-5 w-5" /> Dimensions
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-light-gray">Length (m)</label>
            <input
              type="number"
              min="5"
              max="100"
              value={dimensions.length}
              onChange={(e) => setDimensions({ length: Number(e.target.value) })}
              className="mt-1 block w-full input-industrial"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-gray">Width (m)</label>
            <input
              type="number"
              min="5"
              max="50"
              value={dimensions.width}
              onChange={(e) => setDimensions({ width: Number(e.target.value) })}
              className="mt-1 block w-full input-industrial"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-gray">Height (m)</label>
            <input
              type="number"
              min="3"
              max="15"
              value={dimensions.height}
              onChange={(e) => setDimensions({ height: Number(e.target.value) })}
              className="mt-1 block w-full input-industrial"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-gray">Roof Type</label>
            <select
              value={dimensions.roofType}
              onChange={(e) => setDimensions({ roofType: e.target.value as RoofType })}
              className="mt-1 block w-full input-industrial"
            >
              <option value={RoofType.Flat}>Flat</option>
              <option value={RoofType.Gable}>Gable</option>
              <option value={RoofType.Monopitch}>Monopitch</option>
            </select>
          </div>
          
          {/* Roof Pitch Control - only shown for non-flat roofs */}
          {showRoofPitch && (
            <div>
              <label className="block text-sm font-medium text-light-gray flex items-center">
                <ArrowUp className="mr-1 h-4 w-4 text-accent-yellow" /> Roof Pitch (%)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min={dimensions.roofType === RoofType.Monopitch ? 0 : 5} // Changed from 5 to 0 for monopitch
                  max={dimensions.roofType === RoofType.Monopitch ? 30 : 45}
                  step="1"
                  value={dimensions.roofPitch}
                  onChange={(e) => setDimensions({ roofPitch: Number(e.target.value) })}
                  className="flex-1 mr-2 accent-accent-yellow"
                />
                <input
                  type="number"
                  min={dimensions.roofType === RoofType.Monopitch ? 0 : 5} // Changed from 5 to 0 for monopitch
                  max={dimensions.roofType === RoofType.Monopitch ? 30 : 45}
                  value={dimensions.roofPitch}
                  onChange={(e) => setDimensions({ roofPitch: Number(e.target.value) })}
                  className="w-16 text-sm p-1 input-industrial"
                />
              </div>
              <p className="text-xs text-light-gray mt-1">
                {dimensions.roofType === RoofType.Gable ? 'Gable' : 'Monopitch'} roof with {dimensions.roofPitch}% pitch
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cladding Section */}
      <div className="mb-6 card-industrial animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-accent-yellow">
          <PanelTop className="mr-2 h-5 w-5" /> Cladding
        </h2>
        <div className="mb-3">
          <label className="block text-sm font-medium text-light-gray">Type</label>
          <select
            value={claddingType}
            onChange={(e) => setCladdingType(e.target.value as CladdingType)}
            className="mt-1 block w-full input-industrial"
          >
            <option value={CladdingType.TrapezoidSheet}>Trapezoid Sheet</option>
            <option value={CladdingType.SandwichPanel60}>Sandwich Panel 60mm</option>
            <option value={CladdingType.SandwichPanel80}>Sandwich Panel 80mm</option>
            <option value={CladdingType.SandwichPanel100}>Sandwich Panel 100mm</option>
          </select>
        </div>
        
        {/* Facade Color Selector */}
        <ColorSelector 
          colors={facadeColors}
          selectedColorId={facadeColorId}
          onColorSelect={setFacadeColor}
          title="Facade Color (RAL)"
        />
        
        {/* Roof Color Selector */}
        <ColorSelector 
          colors={roofColors}
          selectedColorId={roofColorId}
          onColorSelect={setRoofColor}
          title="Roof Color (RAL)"
        />
      </div>

      {/* Elements Section */}
      <div className="mb-6 card-industrial animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-accent-yellow">
          <Square className="mr-2 h-5 w-5" /> Elements
        </h2>
        
        <button
          onClick={() => toggleFacadeEditor(true)}
          className="w-full btn-accent flex items-center justify-center mb-2"
        >
          <Edit className="h-5 w-5 mr-2" /> Open Facade Editor
        </button>
        
        <button
          onClick={() => toggleRoofEditor(true)}
          className="w-full btn-accent flex items-center justify-center"
        >
          <Sun className="h-5 w-5 mr-2" /> Open Roof Editor
        </button>
        
        <p className="text-sm text-light-gray mt-2">
          Use the editors to add and position elements on your building's facades and roof.
        </p>
      </div>

      {/* Roof Elements Section */}
      <RoofElementsPanel />

      {/* Layers Section */}
      <div className="mb-6 card-industrial animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-accent-yellow">
          <Layers className="mr-2 h-5 w-5" /> Layers
        </h2>
        <div className="space-y-2">
          {layers.map(layer => (
            <div key={layer.id} className="flex items-center">
              <input
                type="checkbox"
                id={`layer-${layer.id}`}
                checked={layer.visible}
                onChange={() => toggleLayer(layer.id)}
                className="h-4 w-4 accent-accent-yellow rounded"
              />
              <label htmlFor={`layer-${layer.id}`} className="ml-2 block text-sm text-light-gray">
                {layer.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Structural Analysis */}
      <div className="mb-6 card-industrial animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-accent-yellow">
          <LayoutGrid className="mr-2 h-5 w-5" /> Structural Analysis
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-light-gray flex items-center">
              <Snowflake className="mr-1 h-4 w-4 text-accent-yellow" /> Snow Load (kN/m²)
            </label>
            <input
              type="number"
              min="0.5"
              max="5"
              step="0.1"
              value={snowLoad}
              onChange={(e) => setSnowLoad(Number(e.target.value))}
              className="mt-1 block w-full input-industrial"
            />
          </div>
          <StructuralAnalysis />
        </div>
      </div>

      {/* Building Stats */}
      <div className="mb-6 card-industrial animate-fadeIn">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-accent-yellow">
          <Info className="mr-2 h-5 w-5" /> Building Stats
        </h2>
        <button 
          onClick={calculateStats}
          className="mb-2 btn-secondary text-sm"
        >
          Calculate
        </button>
        <div className="bg-dark-gray p-3 rounded neumorphic-inset">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-light-gray">Roof Area:</div>
            <div className="font-mono font-medium text-white">{stats.roofArea} m²</div>
            
            <div className="text-light-gray">Wall Area:</div>
            <div className="font-mono font-medium text-white">{stats.wallArea} m²</div>
            
            <div className="text-light-gray">Total Area:</div>
            <div className="font-mono font-medium text-white">{stats.totalArea} m²</div>
            
            <div className="text-light-gray">Windows:</div>
            <div className="font-mono font-medium text-white">{stats.elements.windows}</div>
            
            <div className="text-light-gray">Doors:</div>
            <div className="font-mono font-medium text-white">{stats.elements.doors}</div>
            
            <div className="text-light-gray">Sectional Doors:</div>
            <div className="font-mono font-medium text-white">{stats.elements.sectionalDoors}</div>
            
            <div className="text-light-gray">Light Bands:</div>
            <div className="font-mono font-medium text-white">{stats.elements.lightBands}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;