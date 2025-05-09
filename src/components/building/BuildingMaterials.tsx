// This file is maintained for backward compatibility
// It re-exports all material functionality from the refactored modules

import { useMemo } from 'react';
import * as THREE from 'three';
import { CladdingType, RalColor } from '../../types';
import { 
  useBuildingMaterials as useRefactoredBuildingMaterials,
  useMonopitchWallMaterials as useRefactoredMonopitchWallMaterials,
  MaterialsResult 
} from '../building-materials';

// Re-export the MaterialsResult interface
export type { MaterialsResult };

// Re-export the custom hooks with the same signatures
export const useBuildingMaterials = (
  claddingType: CladdingType,
  facadeColor: RalColor | undefined,
  roofColor: RalColor | undefined
): MaterialsResult => {
  return useRefactoredBuildingMaterials(claddingType, facadeColor, roofColor);
};

export const useMonopitchWallMaterials = (
  claddingType: CladdingType, 
  facadeColor: RalColor | undefined,
  dimensions: { length: number, width: number, height: number, roofPitch: number }
) => {
  return useRefactoredMonopitchWallMaterials(claddingType, facadeColor, dimensions);
};
