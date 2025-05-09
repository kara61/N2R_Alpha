import React from 'react';
import { BuildingElement, HallDimensions } from '../../types';
import { BuildingElementsContainer } from '../building-elements';

interface BuildingElementsProps {
  elements: BuildingElement[];
  dimensions: HallDimensions;
}

/**
 * BuildingElements component renders all building elements (doors, windows, etc.)
 * This component is maintained for backward compatibility and delegates all
 * rendering to the refactored BuildingElementsContainer
 */
const BuildingElements: React.FC<BuildingElementsProps> = ({ elements, dimensions }) => {
  return <BuildingElementsContainer elements={elements} dimensions={dimensions} />;
};

export default BuildingElements;
