import React from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { RoofType } from '../types';
import { getColorById } from '../data/ralColors';
import { useBuildingMaterials } from './building/BuildingMaterials';
import Structure from './building/Structure';
import FlatRoofBuilding from './building/FlatRoofBuilding';
import GableRoofBuilding from './building/GableRoofBuilding';
import MonopitchRoofBuilding from './building/MonopitchRoofBuilding';
import BuildingElements from './building/BuildingElements';
import RoofElements from './building/RoofElements';

const Building: React.FC = () => {
  const { 
    dimensions, 
    claddingType, 
    elements, 
    roofElements,
    layers, 
    facadeColorId, 
    roofColorId,
    textureScaling
  } = useBuildingStore();
  
  // Get RAL colors
  const facadeColor = getColorById(facadeColorId);
  const roofColor = getColorById(roofColorId);
  
  // Check which layers are visible
  const isStructureVisible = layers.find(l => l.id === 'structure')?.visible || false;
  const isCladdingVisible = layers.find(l => l.id === 'cladding')?.visible || false;
  const areElementsVisible = layers.find(l => l.id === 'elements')?.visible || false;
  const areRoofElementsVisible = layers.find(l => l.id === 'roofElements')?.visible || false;
  
  // Get materials
  const { 
    structureMaterial, 
    northSouthMaterial,
    eastWestMaterial,
    roofMaterial, 
    concreteMaterial, 
    gutterMaterial 
  } = useBuildingMaterials(claddingType, facadeColor, roofColor);

  // Render the appropriate building based on roof type
  const renderBuilding = () => {
    if (!isCladdingVisible) return null;
    
    switch (dimensions.roofType) {
      case RoofType.Flat:
        return (
          <FlatRoofBuilding 
            length={dimensions.length}
            width={dimensions.width}
            height={dimensions.height}
            claddingType={claddingType}
            northSouthMaterial={northSouthMaterial}
            eastWestMaterial={eastWestMaterial}
            roofMaterial={roofMaterial}
            concreteMaterial={concreteMaterial}
            gutterMaterial={gutterMaterial}
          />
        );
      case RoofType.Gable:
        return (
          <GableRoofBuilding 
            length={dimensions.length}
            width={dimensions.width}
            height={dimensions.height}
            roofPitch={dimensions.roofPitch}
            northSouthMaterial={northSouthMaterial}
            eastWestMaterial={eastWestMaterial}
            roofMaterial={roofMaterial}
            concreteMaterial={concreteMaterial}
            gutterMaterial={gutterMaterial}
          />
        );
      case RoofType.Monopitch:
        return (
          <MonopitchRoofBuilding 
            length={dimensions.length}
            width={dimensions.width}
            height={dimensions.height}
            roofPitch={dimensions.roofPitch}
            claddingMaterial={northSouthMaterial} 
            roofMaterial={roofMaterial}
            concreteMaterial={concreteMaterial}
            gutterMaterial={gutterMaterial}
            // Pass additional props for texture scaling
            facadeColor={facadeColor}
            claddingType={claddingType}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <group>
      {isStructureVisible && (
        <Structure 
          dimensions={dimensions} 
          structureMaterial={structureMaterial} 
        />
      )}
      {renderBuilding()}
      {areElementsVisible && elements.length > 0 && (
        <BuildingElements 
          elements={elements} 
          dimensions={dimensions} 
        />
      )}
      {areRoofElementsVisible && roofElements.length > 0 && (
        <RoofElements
          roofElements={roofElements}
          buildingLength={dimensions.length}
          buildingWidth={dimensions.width}
          buildingHeight={dimensions.height}
          roofType={dimensions.roofType}
          roofPitch={dimensions.roofPitch}
        />
      )}
    </group>
  );
};

export default Building;